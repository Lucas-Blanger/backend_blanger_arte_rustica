const bcrypt = require("bcryptjs");
const { User } = require("../../database/associations");
const ApiError = require("../../utils/apiError");

async function listUsers({ page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  const { rows, count } = await User.findAndCountAll({
    attributes: { exclude: ["passwordHash"] },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    users: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(count / limit),
    },
  };
}

async function getUserById(id) {
  const user = await User.findByPk(id, {
    attributes: { exclude: ["passwordHash"] },
  });
  if (!user) throw ApiError.notFound("Usuário não encontrado");
  return user;
}

async function updateUser(id, data) {
  const user = await User.findByPk(id);
  if (!user) throw ApiError.notFound("Usuário não encontrado");

  const { name, phone, email } = data;
  if (email && email !== user.email) {
    const existing = await User.findOne({ where: { email } });
    if (existing) throw ApiError.conflict("Este e-mail já está em uso");
  }

  await user.update({
    ...(name !== undefined && { name }),
    ...(phone !== undefined && { phone }),
    ...(email !== undefined && { email }),
  });

  return user.toSafeJSON();
}

async function changePassword(id, currentPassword, newPassword) {
  const user = await User.findByPk(id);
  if (!user) throw ApiError.notFound("Usuário não encontrado");

  const matches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!matches) throw ApiError.badRequest("Senha atual incorreta");

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await user.update({ passwordHash });
}

async function deactivateUser(id) {
  const user = await User.findByPk(id);
  if (!user) throw ApiError.notFound("Usuário não encontrado");
  await user.update({ isActive: false });
}

async function setUserRole(id, role) {
  const user = await User.findByPk(id);
  if (!user) throw ApiError.notFound("Usuário não encontrado");
  await user.update({ role });
  return user.toSafeJSON();
}

module.exports = {
  listUsers,
  getUserById,
  updateUser,
  changePassword,
  deactivateUser,
  setUserRole,
};
