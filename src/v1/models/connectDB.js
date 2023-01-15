const { Sequelize } = require("sequelize");
const { DATABASE } = require("../../../config");

const sequelize = new Sequelize(DATABASE.mysql);

sequelize
  .authenticate()
  .then(() => {
    console.log("Connect with Mysql!");
  })
  .catch((err) => {
    console.log("Connect failed!", err);
    throw err;
  });

module.exports = sequelize;
