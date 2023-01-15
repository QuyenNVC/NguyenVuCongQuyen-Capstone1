const express = require("express");
const multer = require("multer");
const path = require("path");
const { STORAGE_DIR } = require("../../../config");
const {
  login,
  register,
  getToken,
  getProfile,
  editProfile,
  getOwnImages,
  getSavedImage,
  disableTokens,
  verifyAccount,
  socialLogin,
  generateGoogleUrl,
} = require("../controllers/auth.controller");
const { authenticated } = require("../middlewares/authenticated");
const uploadImage = require("../middlewares/uploadImage");

const authRouter = express.Router();

authRouter.post("/register", register());
authRouter.post("/login", login());
authRouter.post("/token", getToken());
authRouter.get("/verify", verifyAccount());
authRouter.get("/disable", disableTokens());
authRouter.get("/generate-google-link", generateGoogleUrl());
authRouter.post("/social-login", socialLogin());
// Phần này url thực hiện để lấy code gửi về cho server, để url ở đây để lấy code
authRouter.get("/google-redirect", (req, res, next) => {
  const { code } = req.query;
  res.status(200).json(code);
});

authRouter.use(authenticated);
authRouter.get("/profile", getProfile());
authRouter.post(
  "/profile",
  uploadImage({
    fieldName: "avatar",
    dest: STORAGE_DIR + "avatar/",
  }),
  editProfile()
);
authRouter.get("/my-images", getOwnImages());
authRouter.get("/saved-images", getSavedImage());

module.exports = authRouter;
