const userService = require('./user.service');
const asyncHandler = require('../../utils/asyncHandler');

// --- Admin ---
const listUsers = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await userService.listUsers({ page, limit });
  res.status(200).json({ success: true, data: result.users, pagination: result.pagination });
});

const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);
  res.status(200).json({ success: true, data: user });
});

const setUserRole = asyncHandler(async (req, res) => {
  const user = await userService.setUserRole(req.params.id, req.body.role);
  res.status(200).json({ success: true, message: 'Papel atualizado', data: user });
});

const deactivateUser = asyncHandler(async (req, res) => {
  await userService.deactivateUser(req.params.id);
  res.status(200).json({ success: true, message: 'Usuário desativado' });
});

// --- Usuário autenticado (self-service) ---
const getProfile = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

const updateProfile = asyncHandler(async (req, res) => {
  const updated = await userService.updateUser(req.user.id, req.body);
  res.status(200).json({ success: true, message: 'Perfil atualizado', data: updated });
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user.id, currentPassword, newPassword);
  res.status(200).json({ success: true, message: 'Senha alterada com sucesso' });
});

module.exports = {
  listUsers,
  getUserById,
  setUserRole,
  deactivateUser,
  getProfile,
  updateProfile,
  changePassword,
};
