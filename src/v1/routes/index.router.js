const express = require("express");
const authRouter = require("./auth.router");
const imageRouter = require("./image.router");
const socialRouter = require("./social.router");

const v1 = express.Router();

v1.use("/images", imageRouter);
v1.use("/social", socialRouter);
v1.use("/", authRouter);

module.exports = v1;
