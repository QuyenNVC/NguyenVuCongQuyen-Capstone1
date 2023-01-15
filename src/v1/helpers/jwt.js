const jwt = require("jsonwebtoken");
const { AppError } = require("./error");
const { TOKEN_CFG } = require("../../../config");
const BlacklistToken = require("../models/BlackListToken");

const generateToken = (payload, type) => {
  if (!(type == "access" || type == "refresh")) {
    throw new AppError(500, "Something went wrong!");
  }

  const token = jwt.sign(
    {
      userId: payload.userId,
      email: payload.email,
    },
    TOKEN_CFG[type].key,
    {
      expiresIn: TOKEN_CFG[type].expiresIn,
    }
  );

  return {
    token,
    expiresIn: TOKEN_CFG[type].expiresIn,
  };
};

checkToken = async (token, secretKey) => {
  try {
    const payload = jwt.verify(token, secretKey);
    if (
      await BlacklistToken.findOne({
        where: {
          token,
        },
      })
    ) {
      throw new AppError(401, "Invalid token!");
    }
    return payload;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateToken,
  checkToken,
};
