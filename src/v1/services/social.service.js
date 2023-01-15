const { Op } = require("sequelize");
const { LIMIT_FEED_QUERY } = require("../../../config");
const { AppError } = require("../helpers/error");
const { createFeeds } = require("../helpers/queue");
const Feed = require("../models/Feed");
const Image = require("../models/Image");
const Share = require("../models/Share");
const User = require("../models/User");

module.exports = {
  getProfile: async (userId) => {
    try {
      const user = await User.findByPk(userId, {
        attributes: {
          exclude: ["createdAt", "updatedAt", "socialProvider"],
        },
      });
      return user;
    } catch (error) {
      throw error;
    }
  },
  toggleFollow: async (user, followedId) => {
    try {
      if (user.userId == followedId) {
        throw new AppError(400, "Bad Request!");
      }
      const followedUser = await User.findByPk(followedId);
      if (!followedUser) {
        throw new AppError(400, "User not found!");
      }
      if (await user.hasFollowing(followedId)) {
        await user.removeFollowing(followedId);
      } else {
        await user.addFollowing(followedId);
      }
      return true;
    } catch (error) {
      throw error;
    }
  },
  share: async (imageId, user) => {
    try {
      const image = await Image.findByPk(imageId);
      if (!image) {
        throw new AppError(400, "Image not found!");
      }

      if (
        await Share.findOne({
          where: {
            imageId,
            userId: user.userId,
          },
        })
      ) {
        throw new AppError(400, "You already shared this image!");
      }

      const share = await Share.create({
        userId: user.userId,
        imageId,
      });
      await createFeeds(user, share.shareId, "share");

      return share;
    } catch (error) {
      throw error;
    }
  },
  getFeeds: async (userId, lastFeedId) => {
    try {
      if (!lastFeedId) {
        const lastFeed = await Feed.findOne({
          order: [["feedId", "DESC"]],
        });
        console.log(lastFeed);
        lastFeedId = lastFeed ? lastFeed.feedId + 1 : 0;
      }

      const countNewFeeds = await Feed.count({
        where: {
          userId,
          isSeen: false,
        },
      });

      const feeds = await Feed.findAll({
        where: {
          userId,
          feedId: {
            [Op.lt]: lastFeedId,
          },
        },
        order: [
          ["isSeen", "ASC"],
          ["feedId", "DESC"],
        ],
        limit: LIMIT_FEED_QUERY,
        include: [
          "image",
          {
            association: "share",
            include: "imagePost",
          },
        ],
      });

      const feedUnSeenIds = [];
      feeds.forEach((feed) => {
        if (!feed.isSeen) {
          feedUnSeenIds.push(feed.feedId);
        }
      });

      await Feed.update(
        {
          isSeen: true,
        },
        {
          where: {
            feedId: {
              [Op.in]: feedUnSeenIds,
            },
          },
        }
      );

      return {
        countNewFeeds,
        feeds,
      };
    } catch (error) {
      throw error;
    }
  },
};
