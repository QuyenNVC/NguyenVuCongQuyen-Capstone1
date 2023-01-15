const { compareSync } = require("bcrypt");
const { verify, sign, JsonWebTokenError, decode } = require("jsonwebtoken");
const { TOKEN_CFG, BASE_URL, LIMIT_IMAGES_QUERY } = require("../../../config");
const { AppError } = require("../helpers/error");
const { generateToken, checkToken } = require("../helpers/jwt");
const mailer = require("../helpers/mailer");
const socialProvider = require("../helpers/socialProvider");
const { isEmail, isPassword } = require("../helpers/validator");
const BlackListToken = require("../models/BlackListToken");
const User = require("../models/User");
const { google } = require("googleapis");
const response = require("../helpers/response");
const Image = require("../models/Image");
const { Op } = require("sequelize");
const SavedImage = require("../models/SavedImage");
const { redisGet, redisSet } = require("../helpers/redis");
// const refreshTokens = {};

module.exports = {
  register: async (data) => {
    try {
      const { email, password, firstName, age } = data;
      if (!email || !password || !firstName || !age) {
        throw new AppError(400, "Bad request!");
      }
      if (!isEmail(email)) {
        throw new AppError(400, "Invalid email!");
      }

      if (!isPassword(password)) {
        throw new AppError(400, "Invalid password!");
      }

      const user = await User.findOne({
        where: {
          email,
        },
      });
      if (user) {
        throw new AppError(400, "Email exists!");
      }
      data.username = email;
      const createdUser = await User.create(data);
      const code = sign(
        {
          userId: createdUser.userId,
          email,
        },
        TOKEN_CFG.verify.key,
        {
          expiresIn: TOKEN_CFG.verify.expiresIn,
        }
      );
      url = BASE_URL + "api/v1/verify?code=" + code;
      const isSendEmail = await mailer({
        to: email,
        subject: "Welcome to Capston!",
        html:
          `<div style="padding: 10px; background-color: #003375">
            <div style="padding: 10px; background-color: white;">
              <p style="color: black">
                Please click this <a href="` +
          url +
          `">link</a> to verify your account!
              </p>
              <p style="color: black">This email is only valid for 2 hours</p>
            </div>
          </div>`,
      });
      if (isSendEmail) {
        return createdUser;
      } else {
        await User.destroy({
          where: {
            userId: createdUser.userId,
          },
        });
        throw new AppError(400, "Register failed!");
      }
    } catch (error) {
      throw error;
    }
  },
  login: async (credential) => {
    try {
      const { email, password } = credential;
      if (!email || !password) {
        throw new AppError(400, "Require email and password!");
      }
      const user = await User.findOne({
        where: {
          email,
        },
        attributes: {
          include: ["password"],
        },
      });

      if (!user) {
        throw new AppError(400, "Invalid email or password!");
      }

      if (!compareSync(password, user.password ? user.password : "")) {
        throw new AppError(404, "Invalid email or password");
      }

      if (!user.verifiedAt) {
        throw new AppError(401, "Account is not verified!");
      }

      const accessToken = generateToken(user, "access");
      const refreshToken = generateToken(user, "refresh");

      let refreshTokens = await redisGet("refreshTokens");
      refreshTokens = refreshTokens ?? {};

      refreshTokens[refreshToken.token] = accessToken.token;

      await redisSet("refreshTokens", refreshTokens);

      return {
        accessToken,
        refreshToken,
      };
    } catch (error) {
      throw error;
    }
  },
  getAccessToken: async (refreshToken) => {
    let refreshTokens = await redisGet("refreshTokens");
    refreshTokens = refreshTokens ?? {};
    if (refreshToken && refreshToken in refreshTokens) {
      const payload = await checkToken(refreshToken, TOKEN_CFG.refresh.key);
      const user = await User.findByPk(payload.userId);
      if (!user) {
        throw new AppError(401, "Invalid Token");
      }

      const oldAccessToken = refreshTokens[refreshToken];
      const { exp } = decode(oldAccessToken);

      const accessToken = generateToken(user, "access");

      if (Date.now() < exp * 1000) {
        const tokens = [refreshToken, accessToken.token, oldAccessToken];
        const code = sign({ tokens }, TOKEN_CFG.verify.key);
        const url = BASE_URL + "api/v1/disable?code=" + code;
        mailer({
          to: user.email,
          subject: "Alert security!",
          html:
            `<div style="padding: 10px; background-color: #003375">
              <div style="padding: 10px; background-color: white;">
              <p style="color: black">Someone try to access your account!</p>
                <p style="color: black">
                  If not you, please click this <a href="` +
            url +
            `">link</a> to disable all access!
                </p>
                
              </div>
            </div>`,
        });
      }

      refreshTokens[refreshToken] = accessToken.token;
      await redisSet("refreshTokens", refreshTokens);

      return accessToken;
    } else {
      throw new AppError(401, "Invalid Token");
    }
  },
  verifyAccount: async (code) => {
    try {
      if (!code) {
        throw new AppError(400, "Invalid code!");
      }

      const payload = verify(code, TOKEN_CFG.verify.key);
      const user = await User.findByPk(payload.userId);

      if (!user) {
        throw new AppError(400, "User not found!");
      }

      if (user.verifiedAt) {
        throw new AppError(400, "User already verified!");
      }

      await user.update({ verifiedAt: new Date() });

      return user;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        error = new AppError(400, "Invalid code!");
      }
      throw error;
    }
  },
  disableTokens: async (code) => {
    try {
      if (!code) {
        throw new AppError(400, "Invalid code!");
      }

      const payload = verify(code, TOKEN_CFG.verify.key);

      for (const token of payload.tokens) {
        const payloadDecode = decode(token);
        if (
          payloadDecode &&
          !(await BlackListToken.findOne({
            where: {
              token,
            },
          }))
        ) {
          await BlackListToken.create({ token, userId: payloadDecode.userId });
          let refreshTokens = await redisGet("refreshTokens");
          refreshTokens = refreshTokens ?? {};
          delete refreshTokens[token];
          await redisSet("refreshTokens", refreshTokens);
        }
      }

      return true;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        error = new AppError(400, "Invalid code!");
      }
      throw error;
    }
  },
  editProfile: async (user, data) => {
    try {
      const { firstName, lastName, username } = data;
      if (!firstName || !lastName || !username) {
        throw new AppError(400, "Require first name, last name and username");
      }

      await user.update(data);

      return user;
    } catch (error) {
      throw error;
    }
  },
  socialLogin: async (provider, code, resp) => {
    try {
      const authProvider = socialProvider[provider];
      if (provider == "google") {
        // Trên thực tế thì FE sẽ trả về token để xác thực luôn chứ không phải là code cho server lấy thông tin tới token
        const r = await authProvider.getToken(code);
        var OAuth2 = google.auth.OAuth2;
        var oauth2Client = new OAuth2();
        oauth2Client.setCredentials({ access_token: r.tokens.access_token });
        var oauth2 = google.oauth2({
          auth: oauth2Client,
          version: "v2",
        });
        return oauth2.userinfo.get(async function (err, res) {
          if (err) {
            throw err;
          } else {
            const { email, family_name, given_name } = res.data;
            let user = await User.findOne({
              where: {
                email,
              },
            });
            if (!user) {
              user = await User.create({
                email,
                firstName: family_name,
                lastName: given_name,
                username: email,
                verifiedAt: new Date(),
                socialProvider: provider,
              });
            }

            const accessToken = generateToken(user, "access");
            const refreshToken = generateToken(user, "refresh");

            let refreshTokens = await redisGet("refreshTokens");
            refreshTokens = refreshTokens ?? {};
            refreshTokens[refreshToken.token] = accessToken.token;
            await redisSet("refreshTokens", refreshTokens);

            resp.status(200).json(
              response({
                accessToken,
                refreshToken,
              })
            );
          }
        });
        // return authProvider;
      }
    } catch (error) {
      throw error;
    }
  },
  getCreatedImages: async (userId, lastImageId) => {
    try {
      if (!lastImageId) {
        const lastImage = await Image.findOne({
          where: {
            userId,
          },
          order: [["imageId", "DESC"]],
        });
        lastImageId = lastImage ? lastImage.imageId + 1 : 0;
      }

      let images = [];

      images = await Image.findAll({
        where: {
          imageId: {
            [Op.lt]: lastImageId,
          },
          userId,
        },
        order: [["imageId", "DESC"]],
        limit: LIMIT_IMAGES_QUERY,
      });
      return images;
    } catch (error) {
      throw error;
    }
  },
  getSavedImages: async (userId, lastImageId) => {
    try {
      const savedImageIds = await SavedImage.findAll({
        where: {
          userId,
        },
        attributes: ["imageId"],
        raw: true,
      }).then(function (savedImages) {
        return savedImages.map((savedImage) => savedImage.imageId);
      });
      if (!lastImageId) {
        const lastImage = await Image.findOne({
          order: [["imageId", "DESC"]],
        });
        lastImageId = lastImage ? lastImage.imageId + 1 : 0;
      }

      let images = [];

      images = await Image.findAll({
        where: {
          imageId: {
            [Op.in]: savedImageIds,
            [Op.lt]: lastImageId,
          },
        },
        order: [["imageId", "DESC"]],
        limit: LIMIT_IMAGES_QUERY,
        include: ["owner"],
      });
      return images;
    } catch (error) {
      throw error;
    }
  },
};
