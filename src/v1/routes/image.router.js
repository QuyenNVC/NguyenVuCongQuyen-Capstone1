const express = require("express");
const { STORAGE_DIR } = require("../../../config");
const {
  createImage,
  showImage,
  toggleSave,
  comment,
  getImages,
  getComments,
  deleteImage,
} = require("../controllers/image.controller");
const uploadImage = require("../middlewares/uploadImage");
const { authenticated } = require("../middlewares/authenticated");
const imageRouter = express.Router();

imageRouter.get("", getImages());
imageRouter.get("/:imageId", showImage());
imageRouter.get("/:imageId/comments", getComments());
imageRouter.use(authenticated);
imageRouter.post(
  "",
  uploadImage({
    fieldName: "images",
    dest: STORAGE_DIR + "images/",
  }),
  createImage()
);
imageRouter.delete("/:imageId", deleteImage());
imageRouter.put("/:imageId/save", toggleSave());
imageRouter.post("/:imageId/comments", comment());

module.exports = imageRouter;
