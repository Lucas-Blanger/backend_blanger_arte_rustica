const bcrypt = require('bcryptjs');
const { sequelize } = require('../../src/config/database');
const { User, Address, Category, Product } = require('../../src/database/associations');
const { generateToken } = require('../../src/utils/jwt.util');

async function resetDatabase() {
  await sequelize.sync({ force: true });
}

async function closeDatabase() {
  await sequelize.close();
}

async function createUser(overrides = {}) {
  const password = overrides.password || 'senha123';
  const user = await User.create({
    name: overrides.name || 'Cliente Teste',
    email: overrides.email || `cliente-${Date.now()}-${Math.random()}@email.com`,
    passwordHash: await bcrypt.hash(password, 1),
    phone: overrides.phone || '11999999999',
    role: overrides.role || 'customer',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
  });

  return { user, password, token: generateToken({ id: user.id, role: user.role }) };
}

async function createAddress(userId, overrides = {}) {
  return Address.create({
    userId,
    label: overrides.label || 'Casa',
    recipientName: overrides.recipientName || 'Cliente Teste',
    street: overrides.street || 'Rua das Flores',
    number: overrides.number || '123',
    neighborhood: overrides.neighborhood || 'Centro',
    city: overrides.city || 'Sao Paulo',
    state: overrides.state || 'SP',
    zipCode: overrides.zipCode || '01001-000',
    isDefault: overrides.isDefault !== undefined ? overrides.isDefault : true,
  });
}

async function createCategory(overrides = {}) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return Category.create({
    name: overrides.name || `Categoria ${suffix}`,
    slug: overrides.slug || `categoria-${suffix}`,
    description: overrides.description || 'Categoria para testes',
  });
}

async function createProduct(overrides = {}) {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  return Product.create({
    categoryId: overrides.categoryId || null,
    name: overrides.name || `Produto ${suffix}`,
    slug: overrides.slug || `produto-${suffix}`,
    description: overrides.description || 'Produto para testes',
    price: overrides.price !== undefined ? overrides.price : 100,
    stock: overrides.stock !== undefined ? overrides.stock : 5,
    sku: overrides.sku || `SKU-${suffix}`,
    material: overrides.material || 'Madeira',
    isActive: overrides.isActive !== undefined ? overrides.isActive : true,
  });
}

module.exports = {
  sequelize,
  resetDatabase,
  closeDatabase,
  createUser,
  createAddress,
  createCategory,
  createProduct,
};
