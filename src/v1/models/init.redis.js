const { createClient } = require("redis");
const { DATABASE } = require("../../../config");
const { logger } = require("../helpers/logger");

const client = createClient(DATABASE.redis);

(async () => {
  await client.connect();
})();

client.on("connect", () => {
  logger.info("Redis client connected!");
  console.log("Redis client connected!");
});

client.on("error", (error) => {
  logger.error(error.stack);
  console.error(error);
});

module.exports = client;
