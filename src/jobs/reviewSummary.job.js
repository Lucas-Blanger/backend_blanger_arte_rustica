const reviewService = require("../modules/reviews/review.service");
const logger = require("../utils/logger");

class ReviewSummaryJob {
  constructor() {
    this.timer = null;
    // Intervalo padrão de 24 horas (em ms) ou configurável via ENV (SUMMARY_JOB_INTERVAL_MS)
    this.intervalMs =
      Number(process.env.SUMMARY_JOB_INTERVAL_MS) || 24 * 60 * 60 * 1000;
  }

  start() {
    if (process.env.NODE_ENV === "test") {
      return; // Desativa o loop automático durante os testes automatizados
    }

    logger.info(
      `[ReviewSummaryJob] Agendador de resumos por IA inicializado. Intervalo: ${this.intervalMs / 1000}s`,
    );

    // Executa uma verificação inicial leve após 30 segundos de subir o servidor
    setTimeout(() => {
      this.run();
    }, 30000);

    // Agenda execuções periódicas
    this.timer = setInterval(() => {
      this.run();
    }, this.intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
      logger.info("[ReviewSummaryJob] Agendador de resumos finalizado.");
    }
  }

  async run() {
    logger.info(
      "[ReviewSummaryJob] Disparando atualização assíncrona de resumos de avaliações...",
    );
    try {
      const result = await reviewService.batchGenerateAllSummaries();
      logger.info(
        `[ReviewSummaryJob] Concluído com sucesso. Produtos atualizados: ${result.updatedCount || 0}`,
      );
    } catch (err) {
      logger.error(
        `[ReviewSummaryJob] Erro na execução do job: ${err.message}`,
      );
    }
  }
}

module.exports = new ReviewSummaryJob();
