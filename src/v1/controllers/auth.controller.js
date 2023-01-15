const response = require("../helpers/response");
const socialProvider = require("../helpers/socialProvider");
const {
  login,
  register,
  getAccessToken,
  editProfile,
  verifyAccount,
  disableTokens,
  socialLogin,
  getCreatedImages,
  getSavedImages,
} = require("../services/auth.services");

module.exports = {
  register: () => {
    return async (req, res, next) => {
      try {
        const data = await register(req.body);
        res
          .status(200)
          .json(
            response(
              data
                ? "We have sent an email for you. Please verify account in your email!"
                : false
            )
          );
      } catch (error) {
        next(error);
      }
    };
  },
  login: () => {
    return async (req, res, next) => {
      try {
        const tokens = await login(req.body);
        res.status(200).json(response(tokens));
      } catch (error) {
        next(error);
      }
    };
  },
  getToken: () => {
    return async (req, res, next) => {
      try {
        const { refreshToken } = req.body;
        const tokens = await getAccessToken(refreshToken);
        res.status(200).json(response(tokens));
      } catch (error) {
        next(error);
      }
    };
  },
  verifyAccount: () => {
    return async (req, res, next) => {
      try {
        const { code } = req.query;
        await verifyAccount(code);
        res.status(200).json(response("Verify Success!"));
      } catch (error) {
        next(error);
      }
    };
  },
  disableTokens: () => {
    return async (req, res, next) => {
      try {
        const { code } = req.query;
        await disableTokens(code);
        res.status(200).json(response("Disable Success!"));
      } catch (error) {
        next(error);
      }
    };
  },
  generateGoogleUrl: () => {
    return (req, res, next) => {
      const authorizeUrl = socialProvider.google.generateAuthUrl({
        access_type: "offline",
        scope: [
          "https://www.googleapis.com/auth/userinfo.profile",
          "https://www.googleapis.com/auth/userinfo.email",
        ],
      });
      res.status(200).json(authorizeUrl);
    };
  },
  socialLogin: () => {
    return async (req, res, next) => {
      try {
        const { provider, code } = req.body;
        await socialLogin(provider, code, res);
      } catch (error) {
        next(error);
      }
    };
  },
  getProfile: () => {
    return (req, res, next) => {
      try {
        res.status(200).json(response(res.locals.user));
      } catch (error) {
        next(error);
      }
    };
  },

  editProfile: () => {
    return async (req, res, next) => {
      try {
        const user = await editProfile(res.locals.user, {
          ...req.body,
          avatar: req.file ? req.file.filename : null,
        });
        res.status(200).json(response(user));
      } catch (error) {
        next(error);
      }
    };
  },
  getOwnImages: () => {
    return async (req, res, next) => {
      try {
        const { lastImageId } = req.query;
        const images = await getCreatedImages(
          res.locals.user.userId,
          lastImageId
        );
        res.status(200).json(response(images));
      } catch (error) {
        next(error);
      }
    };
  },
  getSavedImage: () => {
    return async (req, res, next) => {
      try {
        const { lastImageId } = req.query;
        const images = await getSavedImages(
          res.locals.user.userId,
          lastImageId
        );
        res.status(200).json(response(images));
      } catch (error) {
        next(error);
      }
    };
  },
};
