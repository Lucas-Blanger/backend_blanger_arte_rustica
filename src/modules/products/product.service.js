const { Op } = require('sequelize');
const { Product, Category } = require('../../database/associations');
const ApiError = require('../../utils/apiError');

function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

// --- Produtos ---
async function listProducts({ page = 1, limit = 12, search, categoryId, minPrice, maxPrice, onlyActive = true }) {
  const offset = (page - 1) * limit;
  const where = {};

  if (onlyActive) where.isActive = true;
  if (categoryId) where.categoryId = categoryId;
  if (search) where.name = { [Op.iLike]: `%${search}%` };
  if (minPrice || maxPrice) {
    where.price = {};
    if (minPrice) where.price[Op.gte] = minPrice;
    if (maxPrice) where.price[Op.lte] = maxPrice;
  }

  const { rows, count } = await Product.findAndCountAll({
    where,
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    products: rows,
    pagination: { total: count, page: Number(page), limit: Number(limit), pages: Math.ceil(count / limit) },
  };
}

async function getProductById(id) {
  const product = await Product.findByPk(id, {
    include: [{ model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }],
  });
  if (!product) throw ApiError.notFound('Produto não encontrado');
  return product;
}

async function createProduct(data) {
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  return Product.create({ ...data, slug });
}

async function updateProduct(id, data) {
  const product = await Product.findByPk(id);
  if (!product) throw ApiError.notFound('Produto não encontrado');

  const updateData = { ...data };
  if (data.name && !data.slug) updateData.slug = slugify(data.name);
  if (data.slug) updateData.slug = slugify(data.slug);

  await product.update(updateData);
  return product;
}

async function deleteProduct(id) {
  const product = await Product.findByPk(id);
  if (!product) throw ApiError.notFound('Produto não encontrado');
  // Soft delete: apenas desativa, preservando histórico de pedidos
  await product.update({ isActive: false });
}

// --- Categorias ---
async function listCategories() {
  return Category.findAll({ order: [['name', 'ASC']] });
}

async function createCategory(data) {
  const slug = data.slug ? slugify(data.slug) : slugify(data.name);
  return Category.create({ ...data, slug });
}

async function updateCategory(id, data) {
  const category = await Category.findByPk(id);
  if (!category) throw ApiError.notFound('Categoria não encontrada');
  const updateData = { ...data };
  if (data.name && !data.slug) updateData.slug = slugify(data.name);
  await category.update(updateData);
  return category;
}

async function deleteCategory(id) {
  const category = await Category.findByPk(id);
  if (!category) throw ApiError.notFound('Categoria não encontrada');
  await category.destroy();
}

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
