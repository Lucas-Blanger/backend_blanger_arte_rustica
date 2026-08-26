const bcrypt = require('bcryptjs');
const { User } = require('../../database/associations');
const { generateToken } = require('../../utils/jwt.util');
const ApiError = require('../../utils/apiError');

const SALT_ROUNDS = 10;

async function register({ name, email, password, phone }) {
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    throw ApiError.conflict('Já existe um usuário cadastrado com este e-mail');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    passwordHash,
    phone,
  });

  const token = generateToken({ id: user.id, role: user.role });

  return { user: user.toSafeJSON(), token };
}

async function login({ email, password }) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw ApiError.unauthorized('E-mail ou senha inválidos');
  }

  if (!user.isActive) {
    throw ApiError.forbidden('Esta conta está desativada');
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatches) {
    throw ApiError.unauthorized('E-mail ou senha inválidos');
  }

  const token = generateToken({ id: user.id, role: user.role });

  return { user: user.toSafeJSON(), token };
}

module.exports = { register, login };
