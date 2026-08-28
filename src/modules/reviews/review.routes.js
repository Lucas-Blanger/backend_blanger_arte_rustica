const { Router } = require("express");
const { body } = require("express-validator");
const reviewController = require("./review.controller");
const validate = require("../../middlewares/validate.middleware");
const {
  authenticate,
  authorize,
} = require("../../middlewares/auth.middleware");

const router = Router({ mergeParams: true });

const reviewValidation = [
  body("rating")
    .isInt({ min: 1, max: 5 })
    .withMessage("A nota (rating) deve ser um número inteiro de 1 a 5"),
  body("comment")
    .trim()
    .notEmpty()
    .withMessage("O comentário é obrigatório")
    .isLength({ min: 5 })
    .withMessage("O comentário deve ter no mínimo 5 caracteres"),
];

/**
 * GET /api/v1/products/:productId/reviews
 * Lista todas as avaliações e o resumo gerado por IA para o produto.
 */
router.get("/", reviewController.getProductReviews);

/**
 * POST /api/v1/products/:productId/reviews
 * Envia uma nova avaliação (salva no BD; não aciona a IA em tempo real).
 */
router.post(
  "/",
  authenticate,
  reviewValidation,
  validate,
  reviewController.createReview,
);

/**
 * POST /api/v1/products/:productId/summarize
 * Disparo manual do processamento de IA para o produto (Admin).
 */
router.post(
  "/summarize",
  authenticate,
  authorize("admin"),
  reviewController.triggerProductSummary,
);

/**
 * POST /api/v1/reviews/batch-summarize
 * Disparo manual do processamento em lote para todos os produtos com avaliações (Admin).
 */
router.post(
  "/batch-summarize",
  authenticate,
  authorize("admin"),
  reviewController.triggerBatchSummary,
);

module.exports = router;
