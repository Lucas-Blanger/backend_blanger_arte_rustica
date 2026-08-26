const { verifyToken } = require("../utils/jwt.util");
const ApiError = require("../utils/apiError");
const asyncHandler = require("../utils/asyncHandler");
const { User } = require("../database/associations");

// Garante que existe um usuário autenticado válido (via Bearer token)
const authenticate = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw ApiError.unauthorized("Token de autenticação não fornecido");
  }

  const token = authHeader.split(" ")[1];

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    throw ApiError.unauthorized("Token inválido ou expirado");
  }

  const user = await User.findByPk(payload.id, {
    attributes: { exclude: ["passwordHash"] },
  });

  if (!user) {
    throw ApiError.unauthorized("Usuário do token não existe mais");
  }

  req.user = user;
  next();
});

// Restringe o acesso a determinados papéis (ex: admin)
const authorize =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      throw ApiError.unauthorized();
    }
    if (!roles.includes(req.user.role)) {
      throw ApiError.forbidden(
        "Você não tem permissão para acessar este recurso",
      );
    }
    next();
  };

module.exports = { authenticate, authorize };
