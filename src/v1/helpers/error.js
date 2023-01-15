const { MulterError } = require("multer");
const { logger } = require("./logger");

class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const handleError = (err, req, res, next) => {
  if (err instanceof MulterError) {
    err = new AppError(400, "File too large!");
  }
  if (!(err instanceof AppError)) {
    logger.error(err.stack);
    err = new AppError(500, "Something went wrong!");
  }

  res.status(err.status).json({
    status: "error",
    message: err.message,
  });

  next();
};

module.exports = {
  AppError,
  handleError,
};
