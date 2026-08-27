const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, closeDatabase, createUser } = require('../helpers/db');

describe('Address routes', () => {
  beforeEach(resetDatabase);
  afterAll(closeDatabase);

  it('creates the first address as default', async () => {
    const { token } = await createUser();

    const response = await request(app)
      .post('/api/v1/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        label: 'Casa',
        recipientName: 'Cliente Teste',
        street: 'Rua das Flores',
        number: '123',
        neighborhood: 'Centro',
        city: 'Sao Paulo',
        state: 'SP',
        zipCode: '01001-000',
      });

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      label: 'Casa',
      isDefault: true,
    });
  });

  it('validates required address fields', async () => {
    const { token } = await createUser();

    const response = await request(app)
      .post('/api/v1/addresses')
      .set('Authorization', `Bearer ${token}`)
      .send({ state: 'S' });

    expect(response.status).toBe(400);
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'recipientName' }),
        expect.objectContaining({ field: 'state' }),
      ])
    );
  });

  it('rejects address listing without token', async () => {
    const response = await request(app).get('/api/v1/addresses');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });
});
