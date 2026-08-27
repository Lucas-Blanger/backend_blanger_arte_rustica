const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, closeDatabase, createUser } = require('../helpers/db');

describe('User routes', () => {
  beforeEach(resetDatabase);
  afterAll(closeDatabase);

  it('returns the authenticated user profile', async () => {
    const { user, token } = await createUser({ email: 'cliente@email.com' });

    const response = await request(app)
      .get('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: user.id,
      email: 'cliente@email.com',
      role: 'customer',
    });
    expect(response.body.data.passwordHash).toBeUndefined();
  });

  it('updates the authenticated user profile', async () => {
    const { token } = await createUser();

    const response = await request(app)
      .patch('/api/v1/users/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cliente Atualizado', phone: '11888888888' });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      name: 'Cliente Atualizado',
      phone: '11888888888',
    });
  });

  it('blocks admin listing for non-admin users', async () => {
    const { token } = await createUser({ role: 'customer' });

    const response = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('allows admins to list users', async () => {
    const { token } = await createUser({ role: 'admin', email: 'admin@email.com' });
    await createUser({ email: 'cliente@email.com' });

    const response = await request(app)
      .get('/api/v1/users')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(2);
  });
});
