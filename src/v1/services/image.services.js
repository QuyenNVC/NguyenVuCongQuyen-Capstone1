const { decode } = require("jsonwebtoken");
const { Op, Sequelize, fn, col } = require("sequelize");
const { unlinkSync } = require("fs");
const {
  TOKEN_CFG,
  LIMIT_IMAGES_QUERY,
  LIMIT_COMMENT_QUERY,
  STORAGE_DIR,
} = require("../../../config");
const { AppError } = require("../helpers/error");
const {
  createFeeds,
  deleteRecordSocialDependsImage,
} = require("../helpers/queue");
const Comment = require("../models/Comment");
const Image = require("../models/Image");
const User = require("../models/User");

module.exports = {
  getImages: async (params) => {
    try {
      const { search } = params;
      let { lastImageId } = params;
      // Tìm ra id của ảnh cuối cùng nếu không được truyền vào
      if (!lastImageId) {
        const lastImage = await Image.findOne({
          order: [["imageId", "DESC"]],
        });
        lastImageId = lastImage ? lastImage.imageId + 1 : 0;
      }

      let images = [];
      if (search) {
        images = await Image.findAll({
          where: {
            imageId: {
              [Op.lt]: lastImageId,
            },
            name: {
              [Op.like]: `%${search}%`,
            },
          },
          order: [["imageId", "DESC"]],
          limit: LIMIT_IMAGES_QUERY,
          include: "owner",
        });
      } else {
        images = await Image.findAll({
          where: {
            imageId: {
              [Op.lt]: lastImageId,
            },
          },
          order: [["imageId", "DESC"]],
          limit: LIMIT_IMAGES_QUERY,
          include: "owner",
        });
      }
      return images;
    } catch (error) {
      throw error;
    }
  },
  showImage: async (imageId, bearerToken) => {
    try {
      const image = await Image.findByPk(imageId, {
        include: ["owner"],
      });
      if (!image) {
        throw new AppError(404, "Image not found!");
      }

      let userId = null;
      if (bearerToken) {
        const parts = bearerToken.trim().split(" ");
        if (parts.length == 2 && parts[0] == "Bearer") {
          const payload = decode(parts[1], TOKEN_CFG.access.key);
          const user = await User.findByPk(payload.userId);
          if (user) {
            userId = user.userId;
          }
        }
      }

      image.setDataValue("isSaved", await image.hasSaver(userId));
      return image;
    } catch (error) {
      throw error;
    }
  },
  createImage: async (data, file, user) => {
    try {
      if (!data.name || !file) {
        throw new AppError("Require title and image!");
      }
      data = { ...data, fileName: file.filename, userId: user.userId };
      const image = await Image.create(data);
      await createFeeds(user, image.imageId, "image");
      return image;
    } catch (error) {
      throw error;
    }
  },
  deleteImage: async (imageId, userId) => {
    try {
      const image = await Image.findByPk(imageId);
      if (!image) {
        throw new AppError(400, "Image not found!");
      }

      if (image.userId != userId) {
        throw new AppError(403, "Unauthorized!");
      }

      const linkImage = STORAGE_DIR + "images/" + image.fileName;

      await Image.destroy({
        where: {
          imageId,
        },
      });

      unlinkSync(linkImage);

      deleteRecordSocialDependsImage(imageId);

      return true;
    } catch (error) {
      throw error;
    }
  },
  toggleSave: async (imageId, userId) => {
    try {
      const image = await Image.findByPk(imageId);
      if (!image) {
        throw new AppError(404, "Image not found!");
      }

      if (await image.hasSaver(userId)) {
        await image.removeSaver(userId);
      } else {
        await image.addSaver(userId);
      }
      return true;
    } catch (error) {
      throw error;
    }
  },
  getComments: async (imageId, lastCommentId) => {
    try {
      let comments = [];

      comments = await Comment.findAll({
        where: {
          imageId,
          commentId: {
            [Op.gt]: lastCommentId ? lastCommentId : 0,
          },
        },
        include: {
          association: "commentor",
          attributes: ["userId", "username", "avatar"],
        },
        limit: LIMIT_COMMENT_QUERY,
      });
      return comments;
    } catch (error) {
      throw error;
    }
  },
  comment: async (imageId, content, user) => {
    try {
      const image = await Image.findByPk(imageId);
      if (!image) {
        throw new AppError(404, "Image not found!");
      }

      if (!content) {
        throw new AppError(400, "Invalid comment!");
      }

      const comment = await image.createComment({
        userId: user.userId,
        imageId,
        content,
      });
      return comment;
    } catch (error) {
      throw error;
    }
  },
};
