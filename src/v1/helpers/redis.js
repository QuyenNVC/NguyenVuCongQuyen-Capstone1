const client = require("../models/init.redis");

function isJsonString(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

module.exports = {
  redisGet: async (key) => {
    const result = await client.get(key);
    return isJsonString(result) ? JSON.parse(result) : result;
  },
  redisSet: async (key, value) => {
    await client.set(key, JSON.stringify(value));
  },
};
