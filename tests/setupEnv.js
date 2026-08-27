process.env.NODE_ENV = "test";
process.env.PORT = process.env.PORT || "3000";
process.env.DATABASE_URL =
  process.env.DATABASE_URL || "postgres://test:test@localhost:5432/test_db";
process.env.JWT_SECRET = process.env.JWT_SECRET || "segredo-jwt-para-testes";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
