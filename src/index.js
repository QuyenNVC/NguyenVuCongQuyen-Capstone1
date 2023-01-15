require("dotenv").config();
const compression = require("compression");
const express = require("express");

const { default: helmet } = require("helmet");
const morgan = require("morgan");
const { PORT } = require("../config");
const { cronDeleteUnverifyAccounts } = require("./v1/helpers/cron");
const { handleError, AppError } = require("./v1/helpers/error");
const { logger, accessLogStream } = require("./v1/helpers/logger");
const rateLimiter = require("./v1/middlewares/rateLimiter");
const requestTrimmer = require("./v1/middlewares/requestTrimmer");
const v1 = require("./v1/routes/index.router");

// Kết nối database
require("./v1/models/init.mysql");
require("./v1/models/init.redis");

// Tạo router
const app = express();
app.use(rateLimiter);
app.use(helmet());
app.use(morgan("combined", { stream: accessLogStream }));
app.use(compression());
app.use(express.json());
app.use(requestTrimmer);

app.use("/api/v1", v1);

app.use(express.static("uploads"));
app.use("/avatar", express.static("avatar"));
app.use("/images", express.static("images"));
app.use(handleError);

const server = app.listen(PORT, () =>
  logger.info(`Server start with port ${PORT}!`)
);

cronDeleteUnverifyAccounts.start();

process.on("SIGINT", () => {
  server.close(() => logger.info("Server shutted down!"));
});
