module.exports = {
  BASE_URL: process.env.BASE_URL,
  STORAGE_DIR: "./uploads/",
  PORT: process.env.PORT,
  DATABASE: {
    mysql: {
      dialect: "mysql",
      database: process.env.MYSQLDATABASE,
      host: process.env.MYSQLHOST,
      port: process.env.MYSQLPORT,
      username: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
    },
    redis: {
      url: encodeURI(process.env.REDIS_URL),
    },
  },
  TOKEN_CFG: {
    access: {
      key: process.env.ACCESS_KEY,
      expiresIn: parseInt(process.env.ACCESS_TIME),
    },
    refresh: {
      key: process.env.REFRESH_KEY,
      expiresIn: parseInt(process.env.REFRESH_TIME),
    },
    verify: {
      key: process.env.VERIFY_KEY,
      expiresIn: parseInt(process.env.VERIFY_TIME),
    },
  },
  EMAIL: {
    host: process.env.MAILERHOST,
    port: process.env.MAILERPORT,
    secure: true,
    user: process.env.MAILERUSER,
    password: process.env.MAILERPASSWORD,
  },
  SOCIAL: {
    google: {
      clientID: process.env.CLIENTID,
      clientSecret: process.env.CLIENTSECRET,
      redirectUrl: process.env.REDIRECTURL,
    },
  },
  LIMIT_IMAGES_QUERY: 12,
  LIMIT_COMMENT_QUERY: 50,
  LIMIT_FEED_QUERY: 10,
};
