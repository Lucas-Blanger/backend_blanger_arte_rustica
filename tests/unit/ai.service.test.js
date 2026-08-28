const aiService = require("../../src/services/ai.service");

describe("AIService Unit Tests", () => {
  it("deve retornar null se a lista de avaliações estiver vazia", async () => {
    const summary = await aiService.generateReviewSummary(
      "Mesa Rústica",
      [],
    );
    expect(summary).toBeNull();
  });

  it("deve gerar resumo fallback adequadamente em ambiente de testes", async () => {
    const reviews = [
      { rating: 5, comment: "Excelente qualidade da madeira, entrega rápida!" },
      { rating: 4, comment: "Muito bonita, um pouco pesada mas vale a pena." },
    ];

    const summary = await aiService.generateReviewSummary(
      "Mesa Rústica",
      reviews,
    );

    expect(summary).toBeDefined();
    expect(typeof summary).toBe("string");
    expect(summary).toContain("Mesa Rústica");
  });
});
