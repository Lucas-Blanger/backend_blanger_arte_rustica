const { Review, Product, User } = require("../../database/associations");
const aiService = require("../../services/ai.service");
const logger = require("../../utils/logger");

class ReviewService {
  /**
   * Cria uma nova avaliação para um produto (não chama IA em tempo real para performance/custo)
   */
  async createReview({ userId, productId, rating, comment }) {
    const product = await Product.findByPk(productId);
    if (!product) {
      const error = new Error("Produto não encontrado");
      error.statusCode = 404;
      throw error;
    }

    const review = await Review.create({
      userId,
      productId,
      rating,
      comment,
    });

    return review;
  }

  /**
   * Busca todas as avaliações de um produto e o resumo da IA atual salvo no produto
   */
  async getProductReviews(productId) {
    const product = await Product.findByPk(productId, {
      attributes: ["id", "name", "reviewSummary", "reviewSummaryUpdatedAt"],
    });

    if (!product) {
      const error = new Error("Produto não encontrado");
      error.statusCode = 404;
      throw error;
    }

    const reviews = await Review.findAll({
      where: { productId },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const averageRating =
      reviews.length > 0
        ? Number(
            (
              reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
            ).toFixed(1),
          )
        : 0;

    return {
      productId: product.id,
      productName: product.name,
      reviewSummary: product.reviewSummary,
      reviewSummaryUpdatedAt: product.reviewSummaryUpdatedAt,
      totalReviews: reviews.length,
      averageRating,
      reviews,
    };
  }

  /**
   * Força / Executa a geração de resumo por IA para um produto específico
   */
  async generateProductSummary(productId) {
    const product = await Product.findByPk(productId);
    if (!product) {
      const error = new Error("Produto não encontrado");
      error.statusCode = 404;
      throw error;
    }

    const reviews = await Review.findAll({
      where: { productId },
      attributes: ["rating", "comment", "createdAt"],
      order: [["createdAt", "DESC"]],
      limit: 20, // considera as últimas 20 avaliações
    });

    if (reviews.length === 0) {
      await product.update({
        reviewSummary: null,
        reviewSummaryUpdatedAt: new Date(),
      });
      return { summary: null, updated: true };
    }

    const summaryText = await aiService.generateReviewSummary(
      product.name,
      reviews,
    );

    await product.update({
      reviewSummary: summaryText,
      reviewSummaryUpdatedAt: new Date(),
    });

    logger.info(
      `[ReviewService] Resumo de IA atualizado para produto ${productId}`,
    );

    return {
      productId: product.id,
      summary: summaryText,
      updatedAt: product.reviewSummaryUpdatedAt,
    };
  }

  /**
   * Job em lote (Batch) executado pelo agendador em segundo plano
   * Busca todos os produtos que possuem avaliações e gera/atualiza seus resumos
   */
  async batchGenerateAllSummaries() {
    logger.info(
      "[ReviewService BatchJob] Iniciando processamento em lote dos resumos de IA...",
    );
    try {
      const products = await Product.findAll({
        include: [
          {
            model: Review,
            as: "reviews",
            attributes: ["id"],
          },
        ],
      });

      let updatedCount = 0;
      for (const product of products) {
        if (product.reviews && product.reviews.length > 0) {
          await this.generateProductSummary(product.id);
          updatedCount++;
        }
      }

      logger.info(
        `[ReviewService BatchJob] Processamento em lote concluído. ${updatedCount} produto(s) atualizados.`,
      );
      return { success: true, updatedCount };
    } catch (err) {
      logger.error(
        `[ReviewService BatchJob] Erro durante o processamento em lote: ${err.message}`,
      );
      return { success: false, error: err.message };
    }
  }
}

module.exports = new ReviewService();
