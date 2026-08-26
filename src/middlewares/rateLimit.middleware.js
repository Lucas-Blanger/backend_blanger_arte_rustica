const rateLimit = require("express-rate-limit");

// Rate Limiter Global para toda a API (100 requisições a cada 15 min por IP)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message:
      "Muitas requisições originadas deste IP, por favor tente novamente mais tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});

// Rate Limiter para Auth/Login/Register (10 requisições a cada 15 min por IP)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message:
      "Muitas tentativas de autenticação a partir deste IP. Tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
});

module.exports = { globalLimiter, authLimiter };
