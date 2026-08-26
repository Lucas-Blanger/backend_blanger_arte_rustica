const { Sequelize } = require("sequelize");
const env = require("./env");

const sequelize = new Sequelize(env.databaseUrl, {
  dialect: "postgres",
  logging: env.nodeEnv === "development" ? console.log : false,
  dialectOptions:
    env.nodeEnv === "test"
      ? {}
      : {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("[DB] Conexão com o Neon estabelecida com sucesso.");
  } catch (error) {
    console.error("[DB] Não foi possível conectar ao banco:", error.message);
    process.exit(1);
  }
}

module.exports = { sequelize, testConnection };
