jest.mock("../../src/database/associations", () => ({
  Product: {
    findByPk: jest.fn(),
    findAll: jest.fn(),
  },
  Review: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
  User: {},
}));

jest.mock("../../src/services/ai.service", () => ({
  generateReviewSummary: jest
    .fn()
    .mockResolvedValue("Resumo gerado mock para testes."),
}));

const reviewService = require("../../src/modules/reviews/review.service");
const { Product, Review } = require("../../src/database/associations");
const aiService = require("../../src/services/ai.service");

describe("ReviewService Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve criar uma avaliação com sucesso sem chamar a IA de forma síncrona", async () => {
    Product.findByPk.mockResolvedValue({ id: "prod-1", name: "Mesa Rústica" });
    Review.create.mockResolvedValue({
      id: "rev-1",
      rating: 5,
      comment: "Ótimo produto!",
    });

    const result = await reviewService.createReview({
      userId: "user-1",
      productId: "prod-1",
      rating: 5,
      comment: "Ótimo produto!",
    });

    expect(Product.findByPk).toHaveBeenCalledWith("prod-1");
    expect(Review.create).toHaveBeenCalledWith({
      userId: "user-1",
      productId: "prod-1",
      rating: 5,
      comment: "Ótimo produto!",
    });
    expect(aiService.generateReviewSummary).not.toHaveBeenCalled();
    expect(result.id).toBe("rev-1");
  });

  it("deve lançar erro 404 ao tentar avaliar produto inexistente", async () => {
    Product.findByPk.mockResolvedValue(null);

    await expect(
      reviewService.createReview({
        userId: "user-1",
        productId: "invalid-id",
        rating: 4,
        comment: "Comentário",
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
      message: "Produto não encontrado",
    });
  });

  it("deve gerar e salvar o resumo por IA ao chamar generateProductSummary", async () => {
    const updateMock = jest.fn();
    Product.findByPk.mockResolvedValue({
      id: "prod-1",
      name: "Mesa Rústica",
      update: updateMock,
    });
    Review.findAll.mockResolvedValue([
      { rating: 5, comment: "Excelente" },
      { rating: 4, comment: "Muito bom" },
    ]);

    const result = await reviewService.generateProductSummary("prod-1");

    expect(aiService.generateReviewSummary).toHaveBeenCalledWith(
      "Mesa Rústica",
      expect.any(Array),
    );
    expect(updateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        reviewSummary: "Resumo gerado mock para testes.",
      }),
    );
    expect(result.summary).toBe("Resumo gerado mock para testes.");
  });

  it("deve processar o lote de produtos com avaliações no batchGenerateAllSummaries", async () => {
    const updateMock = jest.fn();
    Product.findAll.mockResolvedValue([
      {
        id: "prod-1",
        name: "Mesa 1",
        reviews: [{ id: "rev-1" }],
        update: updateMock,
      },
      { id: "prod-2", name: "Mesa 2", reviews: [], update: updateMock },
    ]);
    Product.findByPk.mockResolvedValue({
      id: "prod-1",
      name: "Mesa 1",
      update: updateMock,
    });
    Review.findAll.mockResolvedValue([{ rating: 5, comment: "Perfeito" }]);

    const result = await reviewService.batchGenerateAllSummaries();

    expect(result.success).toBe(true);
    expect(result.updatedCount).toBe(1);
  });
});
