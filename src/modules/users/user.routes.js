const { Router } = require('express');
const { body } = require('express-validator');
const userController = require('./user.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Usuarios
 *     description: Perfil do usuário e administração de contas
 */

// Todas as rotas de usuário exigem autenticação
router.use(authenticate);

// --- Self-service (o próprio usuário) ---
/**
 * @swagger
 * /users/me:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil encontrado
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/me', userController.getProfile);

/**
 * @swagger
 * /users/me:
 *   patch:
 *     summary: Atualiza o perfil do usuário autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Maria Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria.nova@email.com
 *               phone:
 *                 type: string
 *                 example: "11988888888"
 *     responses:
 *       200:
 *         description: Perfil atualizado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 *       409:
 *         description: E-mail já em uso
 */
router.patch(
  '/me',
  [
    body('name').optional().trim().notEmpty(),
    body('email').optional().isEmail().normalizeEmail(),
    body('phone').optional().isString(),
  ],
  validate,
  userController.updateProfile
);

/**
 * @swagger
 * /users/me/password:
 *   patch:
 *     summary: Altera a senha do usuário autenticado
 *     tags: [Usuarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 example: senha123
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 example: novaSenha123
 *     responses:
 *       200:
 *         description: Senha alterada
 *       400:
 *         description: Dados inválidos ou senha atual incorreta
 *       401:
 *         description: Token ausente ou inválido
 */
router.patch(
  '/me/password',
  [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 6 }),
  ],
  validate,
  userController.changePassword
);

// --- Somente admin ---
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lista usuários cadastrados
 *     tags: [Usuarios]
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
 *     responses:
 *       200:
 *         description: Lista paginada de usuários
 *       401:
 *         description: Token ausente ou inválido
 *       403:
 *         description: Usuário sem permissão de admin
 */
router.get('/', authorize('admin'), userController.listUsers);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Busca um usuário por ID
 *     tags: [Usuarios]
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
 *         description: Usuário encontrado
 *       403:
 *         description: Usuário sem permissão de admin
 *       404:
 *         description: Usuário não encontrado
 */
router.get('/:id', authorize('admin'), userController.getUserById);

/**
 * @swagger
 * /users/{id}/role:
 *   patch:
 *     summary: Atualiza o papel de um usuário
 *     tags: [Usuarios]
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
 *             required: [role]
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [customer, admin]
 *                 example: admin
 *     responses:
 *       200:
 *         description: Papel atualizado
 *       400:
 *         description: Papel inválido
 *       403:
 *         description: Usuário sem permissão de admin
 *       404:
 *         description: Usuário não encontrado
 */
router.patch(
  '/:id/role',
  authorize('admin'),
  [body('role').isIn(['customer', 'admin'])],
  validate,
  userController.setUserRole
);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Desativa um usuário
 *     tags: [Usuarios]
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
 *         description: Usuário desativado
 *       403:
 *         description: Usuário sem permissão de admin
 *       404:
 *         description: Usuário não encontrado
 */
router.delete('/:id', authorize('admin'), userController.deactivateUser);

module.exports = router;
