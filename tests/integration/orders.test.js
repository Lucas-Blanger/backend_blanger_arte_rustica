const request = require('supertest');
const app = require('../../src/app');
const {
  resetDatabase,
  closeDatabase,
  createUser,
  createAddress,
  createProduct,
} = require('../helpers/db');
const { Product } = require('../../src/database/associations');

describe('Order routes', () => {
  beforeEach(resetDatabase);
  afterAll(closeDatabase);

  it('creates an order and decrements product stock transactionally', async () => {
    const { user, token } = await createUser();
    const address = await createAddress(user.id);
    const product = await createProduct({ price: 150, stock: 5 });

    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        addressId: address.id,
        items: [{ productId: product.id, quantity: 2 }],
        paymentMethod: 'pix',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      status: 'pending',
      paymentMethod: 'pix',
    });
    expect(Number(response.body.data.subtotal)).toBe(300);
    expect(Number(response.body.data.total)).toBe(325);
    expect(response.body.data.items).toHaveLength(1);

    const reloaded = await Product.findByPk(product.id);
    expect(reloaded.stock).toBe(3);
  });

  it('rejects orders without enough stock and keeps stock unchanged', async () => {
    const { user, token } = await createUser();
    const address = await createAddress(user.id);
    const product = await createProduct({ stock: 1 });

    const response = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        addressId: address.id,
        items: [{ productId: product.id, quantity: 2 }],
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toContain('Estoque insuficiente');

    const reloaded = await Product.findByPk(product.id);
    expect(reloaded.stock).toBe(1);
  });

  it('rejects protected order routes without token', async () => {
    const response = await request(app).get('/api/v1/orders');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('allows admins to list all orders through the admin route', async () => {
    const { user, token } = await createUser();
    const { token: adminToken } = await createUser({ role: 'admin', email: 'admin@email.com' });
    const address = await createAddress(user.id);
    const product = await createProduct({ stock: 5 });

    await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        addressId: address.id,
        items: [{ productId: product.id, quantity: 1 }],
      });

    const response = await request(app)
      .get('/api/v1/orders/admin/all')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
  });
});
