const { Router } = require('express');
const { body } = require('express-validator');
const addressController = require('./address.controller');
const validate = require('../../middlewares/validate.middleware');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = Router();

/**
 * @swagger
 * tags:
 *   - name: Enderecos
 *     description: Endereços de entrega do usuário autenticado
 */

router.use(authenticate);

const addressValidation = [
  body('recipientName').trim().notEmpty().withMessage('Nome do destinatário é obrigatório'),
  body('street').trim().notEmpty().withMessage('Rua é obrigatória'),
  body('number').trim().notEmpty().withMessage('Número é obrigatório'),
  body('neighborhood').trim().notEmpty().withMessage('Bairro é obrigatório'),
  body('city').trim().notEmpty().withMessage('Cidade é obrigatória'),
  body('state').isLength({ min: 2, max: 2 }).withMessage('UF deve ter 2 letras'),
  body('zipCode').trim().notEmpty().withMessage('CEP é obrigatório'),
  body('isDefault').optional().isBoolean(),
];

/**
 * @swagger
 * /addresses:
 *   get:
 *     summary: Lista os endereços do usuário autenticado
 *     tags: [Enderecos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de endereços
 *       401:
 *         description: Token ausente ou inválido
 */
router.get('/', addressController.list);

/**
 * @swagger
 * /addresses/{id}:
 *   get:
 *     summary: Busca um endereço do usuário autenticado
 *     tags: [Enderecos]
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
 *         description: Endereço encontrado
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Endereço não encontrado
 */
router.get('/:id', addressController.getOne);

/**
 * @swagger
 * /addresses:
 *   post:
 *     summary: Cadastra um endereço de entrega
 *     tags: [Enderecos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [recipientName, street, number, neighborhood, city, state, zipCode]
 *             properties:
 *               label:
 *                 type: string
 *                 example: Casa
 *               recipientName:
 *                 type: string
 *                 example: Maria Silva
 *               street:
 *                 type: string
 *                 example: Rua das Flores
 *               number:
 *                 type: string
 *                 example: "123"
 *               complement:
 *                 type: string
 *                 example: Apto 12
 *               neighborhood:
 *                 type: string
 *                 example: Centro
 *               city:
 *                 type: string
 *                 example: Sao Paulo
 *               state:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 2
 *                 example: SP
 *               zipCode:
 *                 type: string
 *                 example: 01001-000
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Endereço cadastrado
 *       400:
 *         description: Dados inválidos
 *       401:
 *         description: Token ausente ou inválido
 */
router.post('/', addressValidation, validate, addressController.create);

/**
 * @swagger
 * /addresses/{id}:
 *   patch:
 *     summary: Atualiza um endereço do usuário autenticado
 *     tags: [Enderecos]
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
 *               label:
 *                 type: string
 *                 example: Trabalho
 *               street:
 *                 type: string
 *                 example: Avenida Paulista
 *               number:
 *                 type: string
 *                 example: "1000"
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Endereço atualizado
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Endereço não encontrado
 */
router.patch('/:id', validate, addressController.update);

/**
 * @swagger
 * /addresses/{id}:
 *   delete:
 *     summary: Remove um endereço do usuário autenticado
 *     tags: [Enderecos]
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
 *         description: Endereço removido
 *       401:
 *         description: Token ausente ou inválido
 *       404:
 *         description: Endereço não encontrado
 */
router.delete('/:id', addressController.remove);

module.exports = router;
