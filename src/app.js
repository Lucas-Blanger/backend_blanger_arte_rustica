const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const env = require("./config/env");
const logger = require("./utils/logger");
const {
  globalLimiter,
  authLimiter,
} = require("./middlewares/rateLimit.middleware");
const {
  notFoundHandler,
  errorHandler,
} = require("./middlewares/error.middleware");

const authRoutes = require("./modules/auth/auth.routes");
const userRoutes = require("./modules/users/user.routes");
const addressRoutes = require("./modules/addresses/address.routes");
const productRoutes = require("./modules/products/product.routes");
const orderRoutes = require("./modules/orders/order.routes");
const reviewRoutes = require("./modules/reviews/review.routes");
const setupSwagger = require("./config/swagger");

const app = express();
setupSwagger(app);

// --- Middlewares globais ---
app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin === "*" ? "*" : env.corsOrigin.split(","),
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Aplica Rate Limit Global
app.use(globalLimiter);

// Log de requisições HTTP em arquivo
if (env.nodeEnv !== "test") {
  app.use(
    morgan(env.nodeEnv === "production" ? "combined" : "dev", {
      stream: logger.stream,
    }),
  );
}

// --- Health check ---
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Blanger Arte Rústica API está no ar",
    env: env.nodeEnv,
  });
});

// --- Rotas da API ---
const API_PREFIX = "/api/v1";
app.use(`${API_PREFIX}/auth`, authLimiter, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/addresses`, addressRoutes);
app.use(`${API_PREFIX}/products`, productRoutes);
app.use(`${API_PREFIX}/products/:productId/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/reviews`, reviewRoutes);
app.use(`${API_PREFIX}/orders`, orderRoutes);

// --- 404 e erros ---
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
