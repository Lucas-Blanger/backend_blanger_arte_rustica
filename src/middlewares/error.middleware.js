const ApiError = require('../utils/apiError');
const logger = require('../utils/logger');

// 404 para rotas não mapeadas
function notFoundHandler(req, res, next) {
  next(ApiError.notFound(`Rota não encontrada: ${req.method} ${req.originalUrl}`));
}

// Handler de erros centralizado - deve ser o último middleware do app.js
function errorHandler(err, req, res, next) {
  let { statusCode, message, details } = err;

  // Erros de validação/unicidade do Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 400;
    message = 'Erro de validação';
    details = err.errors.map((e) => ({ field: e.path, message: e.message }));
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    message = 'Registro já existe';
    details = err.errors.map((e) => ({ field: e.path, message: e.message }));
  }

  if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 400;
    message = 'Referência inválida a outro recurso';
  }

  if (!statusCode) {
    statusCode = 500;
    message = 'Erro interno do servidor';
  }

  if (statusCode === 500) {
    logger.error(`[500 Internal Server Error] ${req.method} ${req.originalUrl}`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: details || undefined,
  });
}

module.exports = { notFoundHandler, errorHandler };
