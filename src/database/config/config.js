require("dotenv").config({
  path: require("path").resolve(__dirname, "../../../.env"),
});

const sslConfig = {
  ssl: {
    require: true,
    rejectUnauthorized: false,
  },
};

module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: sslConfig,
    logging: false,
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: sslConfig,
    logging: false,
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres",
    dialectOptions: sslConfig,
    logging: false,
  },
};
