jest.mock('../../src/config/database', () => ({
  sequelize: {
    transaction: jest.fn((cb) => cb({ LOCK: { UPDATE: 'UPDATE' } })),
  },
}));

jest.mock('../../src/database/associations', () => ({
  Order: {
    create: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    findAndCountAll: jest.fn(),
  },
  OrderItem: {
    bulkCreate: jest.fn(),
    findAll: jest.fn(),
  },
  Product: {
    findByPk: jest.fn(),
    decrement: jest.fn(),
    increment: jest.fn(),
  },
  Address: {
    findOne: jest.fn(),
  },
}));

const orderService = require('../../src/modules/orders/order.service');
const { Order, OrderItem, Product, Address } = require('../../src/database/associations');

describe('order.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('throws error if items array is empty or missing', async () => {
      await expect(
        orderService.createOrder('user-1', { addressId: 'addr-1', items: [] })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'O pedido precisa ter ao menos um item',
      });
    });

    it('throws error if delivery address is invalid or does not belong to user', async () => {
      Address.findOne.mockResolvedValue(null);

      await expect(
        orderService.createOrder('user-1', {
          addressId: 'invalid-addr',
          items: [{ productId: 'prod-1', quantity: 1 }],
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Endereço de entrega inválido',
      });
    });

    it('throws error if product is inactive or out of stock', async () => {
      Address.findOne.mockResolvedValue({ id: 'addr-1' });
      Product.findByPk.mockResolvedValue({
        id: 'prod-1',
        name: 'Mesa',
        price: 100,
        stock: 0,
        isActive: true,
      });

      await expect(
        orderService.createOrder('user-1', {
          addressId: 'addr-1',
          items: [{ productId: 'prod-1', quantity: 2 }],
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Estoque insuficiente para "Mesa"',
      });
    });

    it('creates an order, calculates line total, decrements stock and bulk creates items', async () => {
      Address.findOne.mockResolvedValue({ id: 'addr-1', userId: 'user-1' });
      const mockProduct = {
        id: 'prod-1',
        name: 'Mesa Rústica',
        price: 500.0,
        stock: 10,
        isActive: true,
        decrement: jest.fn(),
      };
      Product.findByPk.mockResolvedValue(mockProduct);

      Order.create.mockResolvedValue({ id: 'order-123' });
      OrderItem.bulkCreate.mockResolvedValue([]);

      const createdOrderMock = {
        id: 'order-123',
        userId: 'user-1',
        total: 525.0,
        items: [{ productId: 'prod-1', quantity: 1 }],
      };
      Order.findOne.mockResolvedValue(createdOrderMock);

      const result = await orderService.createOrder('user-1', {
        addressId: 'addr-1',
        items: [{ productId: 'prod-1', quantity: 1 }],
        paymentMethod: 'pix',
      });

      expect(mockProduct.decrement).toHaveBeenCalledWith('stock', { by: 1, transaction: expect.anything() });
      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'user-1',
          subtotal: 500,
          shippingCost: 25,
          total: 525,
          status: 'pending',
        }),
        expect.anything()
      );
      expect(OrderItem.bulkCreate).toHaveBeenCalledWith(
        [
          expect.objectContaining({
            orderId: 'order-123',
            productId: 'prod-1',
            quantity: 1,
            unitPrice: 500,
            lineTotal: 500,
          }),
        ],
        expect.anything()
      );
      expect(result).toEqual(createdOrderMock);
    });
  });

  describe('getOrderById', () => {
    it('returns order when found', async () => {
      const mockOrder = { id: 'order-1', userId: 'user-1' };
      Order.findOne.mockResolvedValue(mockOrder);

      const result = await orderService.getOrderById('order-1', 'user-1');
      expect(result).toEqual(mockOrder);
    });

    it('throws 404 if order is not found', async () => {
      Order.findOne.mockResolvedValue(null);

      await expect(orderService.getOrderById('missing-order')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Pedido não encontrado',
      });
    });
  });

  describe('updateOrderStatus', () => {
    it('throws error for invalid status transition', async () => {
      Order.findByPk.mockResolvedValue({ id: 'order-1', status: 'delivered' });

      await expect(orderService.updateOrderStatus('order-1', 'pending')).rejects.toMatchObject({
        statusCode: 400,
        message: 'Não é possível mudar o status de "delivered" para "pending"',
      });
    });

    it('returns stock to products when cancelling an order', async () => {
      const update = jest.fn();
      Order.findByPk.mockResolvedValue({ id: 'order-1', status: 'pending', update });
      OrderItem.findAll.mockResolvedValue([
        { productId: 'prod-1', quantity: 2 },
        { productId: 'prod-2', quantity: 1 },
      ]);

      await orderService.updateOrderStatus('order-1', 'cancelled');

      expect(Product.increment).toHaveBeenCalledTimes(2);
      expect(Product.increment).toHaveBeenCalledWith('stock', {
        by: 2,
        where: { id: 'prod-1' },
        transaction: expect.anything(),
      });
      expect(update).toHaveBeenCalledWith({ status: 'cancelled' }, { transaction: expect.anything() });
    });

    it('updates status directly for non-cancellation valid transitions', async () => {
      const update = jest.fn();
      Order.findByPk.mockResolvedValue({ id: 'order-1', status: 'pending', update });

      await orderService.updateOrderStatus('order-1', 'paid');

      expect(update).toHaveBeenCalledWith({ status: 'paid' });
    });
  });
});
