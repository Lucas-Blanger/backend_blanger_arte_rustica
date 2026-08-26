const bcrypt = require('bcryptjs');
const { User } = require('../../database/associations');
const { generateToken } = require('../../utils/jwt.util');
const ApiError = require('../../utils/apiError');
const emailService = require('../../services/email.service');

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

async function forgotPassword({ email }) {
  const user = await User.findOne({ where: { email } });

  if (user) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const resetCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.resetCode = code;
    user.resetCodeExpiresAt = resetCodeExpiresAt;
    await user.save();

    await emailService.sendPasswordResetCode(user.email, code, user.name);
  }

  return { message: 'Se o e-mail estiver cadastrado, um código de recuperação foi enviado.' };
}

async function resetPassword({ email, code, newPassword }) {
  const user = await User.findOne({ where: { email } });

  if (
    !user ||
    !user.resetCode ||
    user.resetCode !== String(code).trim() ||
    !user.resetCodeExpiresAt ||
    new Date() > new Date(user.resetCodeExpiresAt)
  ) {
    throw ApiError.badRequest('Código de recuperação inválido ou expirado');
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordHash = passwordHash;
  user.resetCode = null;
  user.resetCodeExpiresAt = null;
  await user.save();

  return { message: 'Senha redefinida com sucesso' };
}

module.exports = { register, login, forgotPassword, resetPassword };

