const Comment = require("./Comment");
const sequelize = require("./connectDB");
const Image = require("./Image");
const SavedImage = require("./SavedImage");
const User = require("./User");
const BlackListToken = require("./BlackListToken");
const Follower = require("./Follower");
const Feed = require("./Feed");
const Share = require("./Share");

User.hasMany(Image, {
  foreignKey: "userId",
  as: "images",
});
Image.belongsTo(User, {
  foreignKey: "userId",
  as: "owner",
});

User.belongsToMany(Image, {
  through: SavedImage,
  foreignKey: "userId",
  as: "savedImages",
});
Image.belongsToMany(User, {
  through: SavedImage,
  foreignKey: "imageId",
  as: "savers",
});

// User.belongsToMany(Image, {
//   through: Comment,
//   foreignKey: "userId",
//   as: "commentedImages",
// });
// Image.belongsToMany(User, {
//   through: Comment,
//   foreignKey: "imageId",
//   as: "commentors",
// });
Comment.belongsTo(User, {
  foreignKey: "userId",
  as: "commentor",
});
Image.hasMany(Comment, {
  foreignKey: "imageId",
  as: "comments",
});

User.hasMany(BlackListToken, {
  foreignKey: "userId",
  as: "blackTokens",
});

BlackListToken.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

// TABLE CHO CHỨC NĂNG SHARE, NEW FEEDS
// Bảng cho chức năng follow and new feeds
// key followings chủ thể là người đi follow
// key follower chủ thể là người được follow
User.belongsToMany(User, {
  as: "followings",
  foreignKey: "userId",
  through: Follower,
});
User.belongsToMany(User, {
  as: "followers",
  foreignKey: "followedId",
  through: Follower,
});

User.hasMany(Feed, {
  as: "feeds",
  foreignKey: "userId",
});

Image.hasMany(Feed, {
  foreignKey: "postId",
  sourceKey: "imageId",
  constraints: false,
  scope: {
    type: "image",
  },
});
Feed.belongsTo(Image, {
  as: "image",
  foreignKey: "postId",
  targetKey: "imageId",
  constraints: false,
});

Share.hasMany(Feed, {
  foreignKey: "postId",
  sourceKey: "shareId",
  constraints: false,
  scope: {
    type: "share",
  },
});
Feed.belongsTo(Share, {
  as: "share",
  foreignKey: "postId",
  targetKey: "shareId",
  constraints: false,
});

Feed.addHook("afterFind", (findResult) => {
  if (!findResult) return findResult;
  if (!Array.isArray(findResult)) findResult = [findResult];
  for (const instance of findResult) {
    if (instance.type === "image" && instance.image !== undefined) {
      // instance.type = instance.image;
      delete instance.share;
      delete instance.dataValues.share;
    } else if (instance.type === "share" && instance.share !== undefined) {
      // instance.type = instance.share;
      delete instance.image;
      delete instance.dataValues.image;
    }
  }
});

Image.hasMany(Share, {
  as: "share",
  foreignKey: "imageId",
});
Share.belongsTo(Image, {
  as: "imagePost",
  foreignKey: "imageId",
});

sequelize.sync({
  alter: true,
});

module.exports = sequelize;
