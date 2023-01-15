const { INTEGER, STRING } = require("sequelize");
const sequelize = require("./connectDB");

module.exports = sequelize.define(
  "BlackListToken",
  {
    id: {
      type: INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token: {
      type: STRING,
      allowNull: false,
    },
    userId: {
      type: INTEGER,
      field: "user_id",
      allowNull: false,
    },
  },
  {
    tableName: "black_list_tokens",
  }
);
