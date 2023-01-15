const rateLimit = require("express-rate-limit");
module.exports = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  handler: function (req, res, next) {
    next(new AppError(429, "Too many request!"));
  },
  skip: (req, res) => {
    if (req.ip === "::ffff:127.0.0.1") return true;
    return false;
  },
});
