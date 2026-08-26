const { Router } = require('express');
const { body } = require('express-validator');
const authController = require('./auth.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Cadastro, login e sessão autenticada
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Maria Silva
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@email.com
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 example: senha123
 *               phone:
 *                 type: string
 *                 example: "11999999999"
 *     responses:
 *       201:
 *         description: Usuário registrado com token JWT
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: E-mail já cadastrado
 */
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
    body('email').isEmail().withMessage('E-mail inválido').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Senha deve ter no mínimo 6 caracteres'),
    body('phone').optional().isString(),
  ],
  validate,
  authController.register
);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Autentica um usuário
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: maria@email.com
 *               password:
 *                 type: string
 *                 example: senha123
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Credenciais inválidas
 *       403:
 *         description: Conta desativada
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('E-mail inválido').normalizeEmail(),
    body('password').notEmpty().withMessage('Senha é obrigatória'),
  ],
  validate,
  authController.login
);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Retorna o usuário autenticado pelo token
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dados do usuário autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Token ausente, inválido ou expirado
 */
router.get('/me', authenticate, authController.me);

module.exports = router;
