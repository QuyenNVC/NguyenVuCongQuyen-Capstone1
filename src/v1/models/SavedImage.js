const { INTEGER } = require("sequelize");
const sequelize = require("./connectDB");

module.exports = sequelize.define(
  "SavedImage",
  {
    userId: {
      type: INTEGER,
      field: "nguoi_dung_id",
      allowNull: false,
    },
    imageId: {
      type: INTEGER,
      field: "hinh_id",
      allowNull: false,
    },
  },
  {
    tableName: "luu_anh",
    timestamps: true,
    createdAt: "ngay_luu",
    updatedAt: false,
  }
);
