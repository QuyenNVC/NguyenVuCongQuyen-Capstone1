const {
  JsonWebTokenError,
  verify,
  TokenExpiredError,
} = require("jsonwebtoken");
const { TOKEN_CFG } = require("../../../config");
const { AppError } = require("../helpers/error");
const { checkToken } = require("../helpers/jwt");
const BlackListToken = require("../models/BlackListToken");
const User = require("../models/User");

const extractTokenFromHeader = (headers) => {
  const bearerToken = headers.authorization;
  if (!bearerToken) {
    throw new AppError(401, "Invalid Token");
  }
  const parts = bearerToken.trim().split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new AppError(401, "Invalid Token");
  }

  return parts[1];
};

const authenticated = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers);
    const payload = await checkToken(token, TOKEN_CFG.access.key);
    const user = await User.findByPk(payload.userId);
    if (!user) {
      throw new AppError(401, "Invalid Token");
    }

    if (!user.verifiedAt) {
      throw new AppError(401, "Account is not verified!");
    }

    res.locals.user = user;

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      next(new AppError(401, "Expired token"));
    }
    if (error instanceof JsonWebTokenError) {
      error = new AppError(401, "Invalid token");
    }
    next(error);
  }
};

module.exports = {
  extractTokenFromHeader,
  authenticated,
};
