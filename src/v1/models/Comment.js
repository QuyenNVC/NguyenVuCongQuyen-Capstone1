const { INTEGER, STRING } = require("sequelize");
const sequelize = require("./connectDB");

module.exports = sequelize.define(
  "Comment",
  {
    commentId: {
      primaryKey: true,
      autoIncrement: true,
      field: "binh_luan_id",
      type: INTEGER,
    },
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
    content: {
      type: STRING,
      field: "noi_dung",
      allowNull: false,
    },
  },
  {
    tableName: "binh_luan",
    timestamps: true,
    createdAt: "ngay_binh_luan",
    updatedAt: false,
  }
);
