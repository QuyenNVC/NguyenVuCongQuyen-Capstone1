const multer = require("multer");
const path = require("path");
const { isImage } = require("../helpers/validator");

const storage = (dest) => {
  return multer.diskStorage({
    destination: dest,
    filename: function (req, file, cb) {
      // cb(null, Date.now() + "-" + file.originalname);
      const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniquePrefix + "-" + file.originalname);
    },
  });
};

module.exports = (config) => {
  const { fieldName, dest } = config;
  return multer({
    limits: {
      fileSize: 5 * 1024 * 1024,
    },
    storage: storage(dest),
    fileFilter: function (_req, file, cb) {
      isImage(file, cb);
    },
  }).single(fieldName);
};
