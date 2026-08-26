const { validationResult } = require("express-validator");
const ApiError = require("../utils/apiError");

// Deve ser usado depois de um array de validações do express-validator
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors
      .array()
      .map((e) => ({ field: e.path, message: e.msg }));
    throw ApiError.badRequest("Dados inválidos", details);
  }
  next();
};

module.exports = validate;
