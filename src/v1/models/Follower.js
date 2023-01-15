const { INTEGER } = require("sequelize");
const sequelize = require("./connectDB");

module.exports = sequelize.define(
  "Follower",
  {
    userId: {
      type: INTEGER,
      field: "user_id",
      allowNull: false,
    },
    followedId: {
      type: INTEGER,
      field: "followed_id",
      allowNull: false,
    },
  },
  {
    tableName: "followers",
    timestamps: false,
  }
);
