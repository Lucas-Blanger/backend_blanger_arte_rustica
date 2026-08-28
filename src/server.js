const app = require("./app");
const env = require("./config/env");
const { testConnection } = require("./config/database");
require("./database/associations");
const reviewSummaryJob = require("./jobs/reviewSummary.job");

async function start() {
  await testConnection();

  // Inicia agendador de tarefas em segundo plano para o resumo de avaliações
  reviewSummaryJob.start();

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
