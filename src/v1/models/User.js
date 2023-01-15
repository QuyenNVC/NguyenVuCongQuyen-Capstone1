const { genSaltSync, hashSync } = require("bcrypt");
const { DataTypes, ENUM, DATE, literal } = require("sequelize");
const { BASE_URL } = require("../../../config");
const sequelize = require("./connectDB");

module.exports = sequelize.define(
  "User",
  {
    userId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "nguoi_dung_id",
    },
    email: {
      type: DataTypes.STRING,
      unique: "email",
      allowNull: false,
      validate: {
        isEmail: {
          msg: "Invalid Email!",
        },
      },
    },
    password: {
      type: DataTypes.STRING,
      field: "mat_khau",
      set(value) {
        const salt = genSaltSync();
        const hashedPassword = hashSync(value, salt);
        this.setDataValue("password", hashedPassword);
      },
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "ho",
    },
    lastName: {
      type: DataTypes.STRING,
      field: "ten",
    },
    age: {
      type: DataTypes.INTEGER,
      field: "tuoi",
    },
    avatar: {
      type: DataTypes.STRING,
      field: "anh_dai_dien",
      get() {
        const rawValue = this.getDataValue("avatar");
        return rawValue ? BASE_URL + "avatar/" + rawValue : null;
      },
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "ten_nguoi_dung",
    },
    desc: {
      type: DataTypes.STRING,
      field: "gioi_thieu",
    },
    personalUrl: {
      type: DataTypes.STRING,
      field: "trang_web_ca_nhan",
    },
    socialProvider: {
      type: ENUM(["google", "facebook"]),
      field: "social_provider",
    },
    verifiedAt: {
      type: DATE,
      field: "verified_at",
    },
    createdAt: {
      type: DATE,
      field: "created_at",
      defaultValue: literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "nguoi_dung",
    timestamps: false,
    defaultScope: {
      attributes: {
        exclude: ["password"],
      },
    },
    hooks: {
      afterSave: (record) => {
        delete record.dataValues.password;
      },
    },
  }
);
