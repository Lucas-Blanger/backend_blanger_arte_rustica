class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static unauthorized(message = "Não autorizado") {
    return new ApiError(401, message);
  }

  static forbidden(message = "Acesso negado") {
    return new ApiError(403, message);
  }

  static notFound(message = "Recurso não encontrado") {
    return new ApiError(404, message);
  }

  static conflict(message = "Conflito de dados") {
    return new ApiError(409, message);
  }

  static internal(message = "Erro interno do servidor") {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
