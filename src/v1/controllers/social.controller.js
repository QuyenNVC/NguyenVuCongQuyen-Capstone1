const response = require("../helpers/response");
const {
  toggleFollow,
  share,
  getFeeds,
  getProfile,
} = require("../services/social.service");

module.exports = {
  getProfile: () => {
    return async (req, res, next) => {
      try {
        const { userId } = req.params;
        const profile = await getProfile(userId);
        res.status(200).json(response(profile));
      } catch (error) {
        next(error);
      }
    };
  },
  toggleFollow: () => {
    return async (req, res, next) => {
      try {
        const { followedId } = req.body;
        const result = await toggleFollow(res.locals.user, followedId);
        res.status(200).json(response(result));
      } catch (error) {
        next(error);
      }
    };
  },
  share: () => {
    return async (req, res, next) => {
      try {
        const { imageId } = req.params;
        const result = await share(imageId, res.locals.user);
        res.status(200).json(result);
      } catch (error) {
        next(error);
      }
    };
  },
  getFeeds: () => {
    return async (req, res, next) => {
      try {
        const { lastFeedId } = req.query;
        const { userId } = res.locals.user;
        const data = await getFeeds(userId, lastFeedId);
        res.status(200).json(data);
      } catch (error) {
        next(error);
      }
    };
  },
};
