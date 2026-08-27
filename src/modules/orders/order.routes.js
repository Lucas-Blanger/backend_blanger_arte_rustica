const { Router } = require('express');
const { body } = require('express-validator');
const orderController = require('./order.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Pedidos
 *     description: Criação, consulta e gestão de pedidos
 */

router.use(authenticate);

const createOrderValidation = [
  body('addressId').isUUID().withMessage('addressId inválido'),
  body('items').isArray({ min: 1 }).withMessage('O pedido precisa de ao menos um item'),
  body('items.*.productId').isUUID().withMessage('productId inválido'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('quantity deve ser >= 1'),
  body('paymentMethod').optional().isString(),
];

// --- Admin ---
/**
 * @swagger
 * /orders/admin/all:
 *   get:
 *     summary: Lista todos os pedidos
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
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
 *           default: 20
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, paid, processing, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: Lista paginada de pedidos
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Usuário sem permissão de admin
 */
router.get('/admin/all', authorize('admin'), orderController.listAllOrders);

/**
 * @swagger
 * /orders/admin/{id}:
 *   get:
 *     summary: Busca qualquer pedido por ID
 *     tags: [Pedidos]
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
 *         description: Pedido encontrado
 *       403:
 *         description: Usuário sem permissão de admin
 *       404:
 *         description: Pedido não encontrado
 */
router.get('/admin/:id', authorize('admin'), orderController.getOrderById);

/**
 * @swagger
 * /orders/admin/{id}/status:
 *   patch:
 *     summary: Atualiza o status de um pedido
 *     tags: [Pedidos]
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
 *             required: [status]
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, paid, processing, shipped, delivered, cancelled]
 *                 example: paid
 *     responses:
 *       200:
 *         description: Status atualizado
 *       400:
 *         description: Status inválido ou transição não permitida
 *       403:
 *         description: Usuário sem permissão de admin
 *       404:
 *         description: Pedido não encontrado
 */
router.patch(
  '/admin/:id/status',
  authorize('admin'),
  [body('status').isIn(['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'])],
  validate,
  orderController.updateOrderStatus
);

// --- Cliente ---
/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Cria um pedido para o usuário autenticado
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [addressId, items]
 *             properties:
 *               addressId:
 *                 type: string
 *                 format: uuid
 *               items:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required: [productId, quantity]
 *                   properties:
 *                     productId:
 *                       type: string
 *                       format: uuid
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       example: 2
 *               paymentMethod:
 *                 type: string
 *                 example: pix
 *               notes:
 *                 type: string
 *                 example: Entregar no periodo da tarde
 *     responses:
 *       201:
 *         description: Pedido criado e estoque debitado em transação
 *       400:
 *         description: Dados inválidos, endereço inválido ou estoque insuficiente
 *       401:
 *         description: Token ausente ou inválido
 */
router.post('/', createOrderValidation, validate, orderController.createOrder);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Lista os pedidos do usuário autenticado
 *     tags: [Pedidos]
 *     security:
 *       - bearerAuth: []
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
 *           default: 10
 *     responses:
 *       200:
 *         description: Lista paginada de pedidos do usuário
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/', orderController.listMyOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Busca um pedido do usuário autenticado
 *     tags: [Pedidos]
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
 *         description: Pedido encontrado
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Pedido não encontrado
 */
router.get('/:id', orderController.getMyOrderById);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   post:
 *     summary: Cancela um pedido próprio permitido pela regra de transição
 *     tags: [Pedidos]
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
 *         description: Pedido cancelado e estoque devolvido
 *       400:
 *         description: Transição de status não permitida
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Pedido não encontrado
 */
router.post('/:id/cancel', orderController.cancelMyOrder);

module.exports = router;
