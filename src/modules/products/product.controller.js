const productService = require('./product.service');
const asyncHandler = require('../../utils/asyncHandler');

// --- Produtos ---
const listProducts = asyncHandler(async (req, res) => {
  const { page, limit, search, categoryId, minPrice, maxPrice } = req.query;
  const result = await productService.listProducts({
    page,
    limit,
    search,
    categoryId,
    minPrice,
    maxPrice,
  });
  res.status(200).json({ success: true, data: result.products, pagination: result.pagination });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await productService.getProductById(req.params.id);
  res.status(200).json({ success: true, data: product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, message: 'Produto criado', data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Produto atualizado', data: product });
});

const deleteProduct = asyncHandler(async (req, res) => {
  await productService.deleteProduct(req.params.id);
  res.status(200).json({ success: true, message: 'Produto desativado' });
});

// --- Categorias ---
const listCategories = asyncHandler(async (req, res) => {
  const categories = await productService.listCategories();
  res.status(200).json({ success: true, data: categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await productService.createCategory(req.body);
  res.status(201).json({ success: true, message: 'Categoria criada', data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await productService.updateCategory(req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Categoria atualizada', data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await productService.deleteCategory(req.params.id);
  res.status(200).json({ success: true, message: 'Categoria removida' });
});

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
