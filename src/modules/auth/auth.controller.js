const authService = require("./auth.service");
const asyncHandler = require("../../utils/asyncHandler");

const register = asyncHandler(async (req, res) => {
  const { name, email, password, phone } = req.body;
  const result = await authService.register({ name, email, password, phone });
  res
    .status(201)
    .json({
      success: true,
      message: "Usuário registrado com sucesso",
      data: result,
    });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });
  res
    .status(200)
    .json({
      success: true,
      message: "Login realizado com sucesso",
      data: result,
    });
});

// Retorna os dados do usuário autenticado
const me = asyncHandler(async (req, res) => {
  res.status(200).json({ success: true, data: req.user });
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const result = await authService.forgotPassword({ email });
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;
  const result = await authService.resetPassword({ email, code, newPassword });
  res.status(200).json({
    success: true,
    message: result.message,
  });
});

module.exports = { register, login, me, forgotPassword, resetPassword };

