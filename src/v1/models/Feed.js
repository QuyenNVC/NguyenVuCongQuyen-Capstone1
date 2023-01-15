const { INTEGER, ENUM, BOOLEAN } = require("sequelize");
const sequelize = require("./connectDB");

module.exports = sequelize.define(
  "Feed",
  {
    feedId: {
      field: "id",
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      field: "user_id",
      type: INTEGER,
      allowNull: false,
    },
    postId: {
      type: INTEGER,
      field: "post_id",
      allowNull: false,
    },
    type: {
      type: ENUM(["image", "share"]),
      allowNull: false,
    },
    isSeen: {
      field: "is_seen",
      type: BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "feeds",
    timestamps: false,
  }
);
