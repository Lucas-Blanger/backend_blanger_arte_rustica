const app = require("./app");
const env = require("./config/env");
const { testConnection, sequelize } = require("./config/database");
require("./database/associations");

async function start() {
  await testConnection();

  // Em desenvolvimento, mantém as tabelas sincronizadas automaticamente.
  // Em produção, prefira usar migrations.
  if (env.nodeEnv === "development") {
    await sequelize.sync({ alter: true });
    console.log("[DB] Models sincronizados (modo desenvolvimento).");
  }

  app.listen(env.port, () => {
    console.log(
      `[SERVER] Blanger Arte Rústica API rodando na porta ${env.port} (${env.nodeEnv})`,
    );
  });
}

start().catch((err) => {
  console.error("[SERVER] Falha ao iniciar a aplicação:", err);
  process.exit(1);
});
