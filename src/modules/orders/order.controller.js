const orderService = require('./order.service');
const asyncHandler = require('../../utils/asyncHandler');

// --- Cliente ---
const createOrder = asyncHandler(async (req, res) => {
  const order = await orderService.createOrder(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Pedido criado com sucesso', data: order });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await orderService.listOrdersByUser(req.user.id, { page, limit });
  res.status(200).json({ success: true, data: result.orders, pagination: result.pagination });
});

const getMyOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: order });
});

const cancelMyOrder = asyncHandler(async (req, res) => {
  const order = await orderService.cancelOwnOrder(req.params.id, req.user.id);
  res.status(200).json({ success: true, message: 'Pedido cancelado', data: order });
});

// --- Admin ---
const listAllOrders = asyncHandler(async (req, res) => {
  const { page, limit, status } = req.query;
  const result = await orderService.listAllOrders({ page, limit, status });
  res.status(200).json({ success: true, data: result.orders, pagination: result.pagination });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id);
  res.status(200).json({ success: true, data: order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
  res.status(200).json({ success: true, message: 'Status do pedido atualizado', data: order });
});

module.exports = {
  createOrder,
  listMyOrders,
  getMyOrderById,
  cancelMyOrder,
  listAllOrders,
  getOrderById,
  updateOrderStatus,
};
