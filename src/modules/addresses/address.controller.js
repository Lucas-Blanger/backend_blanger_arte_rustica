const addressService = require('./address.service');
const asyncHandler = require('../../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const addresses = await addressService.listByUser(req.user.id);
  res.status(200).json({ success: true, data: addresses });
});

const getOne = asyncHandler(async (req, res) => {
  const address = await addressService.getOwned(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: address });
});

const create = asyncHandler(async (req, res) => {
  const address = await addressService.create(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Endereço cadastrado', data: address });
});

const update = asyncHandler(async (req, res) => {
  const address = await addressService.update(req.params.id, req.user.id, req.body);
  res.status(200).json({ success: true, message: 'Endereço atualizado', data: address });
});

const remove = asyncHandler(async (req, res) => {
  await addressService.remove(req.params.id, req.user.id);
  res.status(200).json({ success: true, message: 'Endereço removido' });
});

module.exports = { list, getOne, create, update, remove };
