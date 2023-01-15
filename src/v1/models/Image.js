const { DataTypes, literal, DATE, NOW, VIRTUAL } = require("sequelize");
const { BASE_URL } = require("../../../config");
const sequelize = require("./connectDB");

module.exports = sequelize.define(
  "Image",
  {
    imageId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "hinh_id",
    },
    name: {
      field: "ten_hinh",
      type: DataTypes.STRING,
      allowNull: false,
    },
    fileName: {
      field: "duong_dan",
      type: DataTypes.STRING,
      allowNull: false,
      unique: "duong_dan",
      // get() {
      //   const rawValue = this.getDataValue("url");
      //   return rawValue ? BASE_URL + "images/" + rawValue : null;
      // },
    },
    url: {
      type: VIRTUAL,
      get() {
        const rawValue = this.getDataValue("fileName");
        return rawValue ? BASE_URL + "images/" + rawValue : null;
      },
      set(value) {
        throw new Error("Do not try to set the `url` value!");
      },
    },
    desc: {
      field: "mo_ta",
      type: DataTypes.STRING,
    },
    linkAttach: {
      field: "link_attach",
      type: DataTypes.STRING,
    },
    userId: {
      field: "nguoi_dung_id",
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    createdAt: {
      field: "created_at",
      type: DATE,
      defaultValue: literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "hinh_anh",
    // timestamps: false,
    updatedAt: false,
    paranoid: true,
    deletedAt: "deleted_at",
  }
);
