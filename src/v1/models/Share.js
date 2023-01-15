const { INTEGER } = require("sequelize");
const sequelize = require("./connectDB");

module.exports = sequelize.define(
  "Share",
  {
    shareId: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "share_id",
    },
    userId: {
      type: INTEGER,
      allowNull: false,
      field: "user_id",
    },
    imageId: {
      type: INTEGER,
      allowNull: false,
      field: "image_id",
    },
  },
  {
    tableName: "shares",
    updatedAt: false,
  }
);
