const express = require("express");
const {
  toggleFollow,
  share,
  getFeeds,
  getProfile,
} = require("../controllers/social.controller");
const { authenticated } = require("../middlewares/authenticated");
const socialRouter = express.Router();

socialRouter.get("/profile/:userId", getProfile());
socialRouter.use(authenticated);
socialRouter.put("/follow", toggleFollow());
socialRouter.post("/share/:imageId", share());
socialRouter.get("/feeds", getFeeds());

module.exports = socialRouter;
