const response = require("../helpers/response");
const {
  createImage,
  showImage,
  toggleSave,
  comment,
  getImages,
  getComments,
  deleteImage,
} = require("../services/image.services");

module.exports = {
  getImages: () => {
    return async (req, res, next) => {
      try {
        const images = await getImages(req.query);
        res.status(200).json(response(images));
      } catch (error) {
        next(error);
      }
    };
  },
  showImage: () => {
    return async (req, res, next) => {
      try {
        const { imageId } = req.params;
        const bearerToken = req.headers.authorization;
        res.status(200).json(response(await showImage(imageId, bearerToken)));
      } catch (error) {
        next(error);
      }
    };
  },
  createImage: () => {
    return async (req, res, next) => {
      try {
        const image = await createImage(req.body, req.file, res.locals.user);
        res.status(200).json(response(image));
      } catch (error) {
        next(error);
      }
    };
  },
  deleteImage: () => {
    return async (req, res, next) => {
      try {
        const { imageId } = req.params;
        const { userId } = res.locals.user;
        const result = await deleteImage(imageId, userId);
        res.status(200).json(response(result));
      } catch (error) {
        next(error);
      }
    };
  },
  toggleSave: () => {
    return async (req, res, next) => {
      try {
        const { imageId } = req.params;
        const result = await toggleSave(imageId, res.locals.user.userId);
        res.status(200).json(response(result));
      } catch (error) {
        next(error);
      }
    };
  },
  getComments: () => {
    return async (req, res, next) => {
      try {
        const { imageId } = req.params;
        const { lastCommentId } = req.query;
        const comments = await getComments(imageId, lastCommentId);
        res.status(200).json(response(comments));
      } catch (error) {
        next(error);
      }
    };
  },
  comment: () => {
    return async (req, res, next) => {
      try {
        const { imageId } = req.params;
        const { content } = req.body;
        const createdComment = await comment(imageId, content, res.locals.user);
        res.status(200).json(response(createdComment));
      } catch (error) {
        next(error);
      }
    };
  },
};
