const request = require('supertest');
const app = require('../../src/app');
const {
  resetDatabase,
  closeDatabase,
  createUser,
  createProduct,
} = require('../helpers/db');

describe('Product routes', () => {
  beforeEach(resetDatabase);
  afterAll(closeDatabase);

  it('lists active products publicly', async () => {
    await createProduct({ name: 'Banco rustico', stock: 3 });
    await createProduct({ name: 'Produto oculto', isActive: false });

    const response = await request(app).get('/api/v1/products');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].name).toBe('Banco rustico');
  });

  it('allows admins to create products', async () => {
    const { token } = await createUser({ role: 'admin', email: 'admin@email.com' });

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Mesa rustica',
        price: 899.9,
        stock: 4,
        material: 'Madeira',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      name: 'Mesa rustica',
      slug: 'mesa-rustica',
      stock: 4,
    });
  });

  it('allows admins to create categories', async () => {
    const { token } = await createUser({ role: 'admin', email: 'admin@email.com' });

    const response = await request(app)
      .post('/api/v1/products/categories')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Mesas',
        description: 'Moveis rusticos para sala de jantar',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      name: 'Mesas',
      slug: 'mesas',
    });
  });

  it('blocks product creation for authenticated non-admin users', async () => {
    const { token } = await createUser({ role: 'customer' });

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Mesa', price: 100 });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('validates required product fields', async () => {
    const { token } = await createUser({ role: 'admin', email: 'admin@email.com' });

    const response = await request(app)
      .post('/api/v1/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', price: -10 });

    expect(response.status).toBe(400);
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'name' }),
        expect.objectContaining({ field: 'price' }),
      ])
    );
  });
});
