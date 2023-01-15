const path = require("path");
const { createStream } = require("rotating-file-stream");
const { createLogger, format, transports } = require("winston");

module.exports = {
  logger: createLogger({
    format: format.combine(
      format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      format.align(),
      format.printf((i) => `${i.level}: ${[i.timestamp]}: ${i.message}`)
    ),
    transports: [
      new transports.File({
        filename: "logs/debug.log",
        level: "info",
        format: format.combine(
          format.printf((i) =>
            i.level === "info" ? `${i.level}: ${i.timestamp}: ${i.message}` : ""
          )
        ),
      }),
      new transports.File({
        filename: "logs/error.log",
        level: "error",
      }),
    ],
  }),
  accessLogStream: createStream("access.log", {
    interval: "1d", // rotate daily
    path: "logs",
  }),
};
