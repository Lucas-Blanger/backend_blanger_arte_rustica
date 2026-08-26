const { Address } = require('../../database/associations');
const ApiError = require('../../utils/apiError');

async function listByUser(userId) {
  return Address.findAll({ where: { userId }, order: [['isDefault', 'DESC'], ['createdAt', 'DESC']] });
}

async function getOwned(addressId, userId) {
  const address = await Address.findOne({ where: { id: addressId, userId } });
  if (!address) throw ApiError.notFound('Endereço não encontrado');
  return address;
}

async function create(userId, data) {
  // Se for o primeiro endereço do usuário, marca como padrão automaticamente
  const count = await Address.count({ where: { userId } });
  const isDefault = count === 0 ? true : !!data.isDefault;

  if (isDefault) {
    await Address.update({ isDefault: false }, { where: { userId } });
  }

  return Address.create({ ...data, userId, isDefault });
}

async function update(addressId, userId, data) {
  const address = await getOwned(addressId, userId);

  if (data.isDefault === true) {
    await Address.update({ isDefault: false }, { where: { userId } });
  }

  await address.update(data);
  return address;
}

async function remove(addressId, userId) {
  const address = await getOwned(addressId, userId);
  await address.destroy();
}

module.exports = { listByUser, getOwned, create, update, remove };
