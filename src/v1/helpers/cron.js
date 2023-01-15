const { CronJob } = require("cron");
const { Op } = require("sequelize");
const User = require("../models/User");

module.exports = {
  cronDeleteUnverifyAccounts: new CronJob("0 * * * * *", function () {
    const time = new Date(new Date().getTime() - 2 * 60 * 60000);
    User.destroy({
      where: {
        [Op.and]: [
          { verifiedAt: { [Op.is]: null } },
          { createdAt: { [Op.lt]: time } },
        ],
      },
    });
  }),
};
