const { Router } = require('express');
const { body } = require('express-validator');
const productController = require('./product.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Produtos
 *     description: Catálogo público e administração de produtos
 *   - name: Categorias
 *     description: Categorias do catálogo
 */

const productValidation = [
  body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('price').isFloat({ min: 0 }).withMessage('Preço inválido'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Estoque inválido'),
  body('categoryId').optional().isUUID().withMessage('categoryId inválido'),
];

// --- Rotas públicas (catálogo) ---
/**
 * @swagger
 * /products/categories:
 *   get:
 *     summary: Lista categorias do catálogo
 *     tags: [Categorias]
 *     responses:
 *       200:
 *         description: Lista de categorias
 */
router.get('/categories', productController.listCategories);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lista produtos ativos do catálogo
 *     tags: [Produtos]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 12
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           example: mesa
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           example: 100
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           example: 1000
 *     responses:
 *       200:
 *         description: Lista paginada de produtos
 */
router.get('/', productController.listProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Busca um produto por ID
 *     tags: [Produtos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Produto encontrado
 *       404:
 *         description: Produto não encontrado
 */
router.get('/:id', productController.getProductById);

// --- Rotas de administração (protegidas) ---
/**
 * @swagger
 * /products/categories:
 *   post:
 *     summary: Cria uma categoria
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mesas
 *               description:
 *                 type: string
 *                 example: Moveis rusticos para sala de jantar
 *     responses:
 *       201:
 *         description: Categoria criada
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Usuário sem permissão de admin
 */
router.post(
  '/categories',
  authenticate,
  authorize('admin'),
  [body('name').trim().notEmpty()],
  validate,
  productController.createCategory
);

/**
 * @swagger
 * /products/categories/{id}:
 *   patch:
 *     summary: Atualiza uma categoria
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Bancos
 *               description:
 *                 type: string
 *                 example: Bancos artesanais de madeira
 *     responses:
 *       200:
 *         description: Categoria atualizada
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Usuário sem permissão de admin
 *       404:
 *         description: Categoria não encontrada
 */
router.patch('/categories/:id', authenticate, authorize('admin'), productController.updateCategory);

/**
 * @swagger
 * /products/categories/{id}:
 *   delete:
 *     summary: Remove uma categoria
 *     tags: [Categorias]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Categoria removida
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Usuário sem permissão de admin
 *       404:
 *         description: Categoria não encontrada
 */
router.delete('/categories/:id', authenticate, authorize('admin'), productController.deleteCategory);

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Cria um produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mesa rustica de madeira
 *               description:
 *                 type: string
 *                 example: Mesa artesanal em madeira macica
 *               price:
 *                 type: number
 *                 example: 899.9
 *               stock:
 *                 type: integer
 *                 example: 8
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *               sku:
 *                 type: string
 *                 example: MESA-001
 *               imageUrl:
 *                 type: string
 *                 example: https://example.com/mesa.jpg
 *               material:
 *                 type: string
 *                 example: Madeira de demolicao
 *     responses:
 *       201:
 *         description: Produto criado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Usuário sem permissão de admin
 */
router.post('/', authenticate, authorize('admin'), productValidation, validate, productController.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Atualiza um produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mesa rustica grande
 *               price:
 *                 type: number
 *                 example: 999.9
 *               stock:
 *                 type: integer
 *                 example: 6
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Produto atualizado
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Usuário sem permissão de admin
 *       404:
 *         description: Produto não encontrado
 */
router.patch('/:id', authenticate, authorize('admin'), productController.updateProduct);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Desativa um produto
 *     tags: [Produtos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Produto desativado
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Usuário sem permissão de admin
 *       404:
 *         description: Produto não encontrado
 */
router.delete('/:id', authenticate, authorize('admin'), productController.deleteProduct);

module.exports = router;
