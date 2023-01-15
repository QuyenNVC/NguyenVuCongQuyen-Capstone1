const { default: PQueue } = require("p-queue");
const { Op } = require("sequelize");
const Feed = require("../models/Feed");
const Share = require("../models/Share");
const { logger } = require("./logger");

const queue = new PQueue({ timeout: 10000, autostart: true });

module.exports = {
  createFeeds: async (user, postId, type) => {
    const followerIds = await user
      .getFollowers({ raw: true })
      .then((followers) => followers.map((follower) => follower.userId));

    followerIds.map((followerId) => {
      queue.add(async () => {
        await Feed.create({
          userId: followerId,
          postId,
          type,
        });
        logger.info(
          `Done task: create feed for userId: ${followerId}, postId: ${postId}, type: ${type}`
        );
      });
    });
  },
  deleteRecordSocialDependsImage: (imageId) => {
    queue.add(async () => {
      const shareIds = Share.findAll({
        where: {
          imageId,
        },
        raw: true,
      }).then((shares) => shares.map((share) => share.shareId));
      await Share.destroy({
        where: {
          shareId: {
            [Op.in]: shareIds,
          },
        },
      });
      await Feed.destroy({
        where: {
          [Op.or]: [
            {
              [Op.and]: [
                {
                  postId: {
                    [Op.in]: shareIds,
                  },
                },
                {
                  type: "share",
                },
              ],
            },
            {
              [Op.and]: [
                { postId: imageId },
                {
                  type: "image",
                },
              ],
            },
          ],
        },
      });
    });
  },
};
