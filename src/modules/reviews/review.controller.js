const reviewService = require("./review.service");
const asyncHandler = require("../../utils/asyncHandler");

const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  const userId = req.user.id;

  const review = await reviewService.createReview({
    userId,
    productId,
    rating,
    comment,
  });

  res.status(201).json({
    success: true,
    message: "Avaliação enviada com sucesso!",
    data: review,
  });
});

const getProductReviews = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const data = await reviewService.getProductReviews(productId);

  res.status(200).json({
    success: true,
    data,
  });
});

const triggerProductSummary = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const result = await reviewService.generateProductSummary(productId);

  res.status(200).json({
    success: true,
    message: "Resumo por IA processado com sucesso.",
    data: result,
  });
});

const triggerBatchSummary = asyncHandler(async (req, res) => {
  const result = await reviewService.batchGenerateAllSummaries();

  res.status(200).json({
    success: true,
    message: "Processamento de resumo em lote iniciado.",
    data: result,
  });
});

module.exports = {
  createReview,
  getProductReviews,
  triggerProductSummary,
  triggerBatchSummary,
};
