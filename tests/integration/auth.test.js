const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, closeDatabase } = require('../helpers/db');

jest.setTimeout(30000);

describe('Auth routes', () => {
  beforeAll(resetDatabase);
  afterAll(closeDatabase);



  it('registers a user and returns a JWT token', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      name: 'Maria Silva',
      email: 'maria@email.com',
      password: 'senha123',
      phone: '11999999999',
    });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(response.body.data.user).toMatchObject({
      name: 'Maria Silva',
      email: 'maria@email.com',
      role: 'customer',
    });
    expect(response.body.data.user.passwordHash).toBeUndefined();
  });

  it('rejects invalid registration data', async () => {
    const response = await request(app).post('/api/v1/auth/register').send({
      name: '',
      email: 'email-invalido',
      password: '123',
    });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: 'email' }),
        expect.objectContaining({ field: 'password' }),
      ])
    );
  });

  it('rejects login with invalid credentials', async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'missing@email.com',
      password: 'senha123',
    });

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('rejects protected auth route without token', async () => {
    const response = await request(app).get('/api/v1/auth/me');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token de autenticação não fornecido');
  });

  it('handles forgot-password and reset-password flow successfully', async () => {
    // 1. Registrar usuário
    await request(app).post('/api/v1/auth/register').send({
      name: 'João Souza',
      email: 'joao@email.com',
      password: 'senhaAntiga123',
    });

    // 2. Solicitar código de recuperação
    const forgotResponse = await request(app).post('/api/v1/auth/forgot-password').send({
      email: 'joao@email.com',
    });
    expect(forgotResponse.status).toBe(200);
    expect(forgotResponse.body.success).toBe(true);

    // 3. Buscar código gerado no banco de dados
    const { User } = require('../../src/database/associations');
    const user = await User.findOne({ where: { email: 'joao@email.com' } });
    expect(user.resetCode).toMatch(/^\d{6}$/);

    // 4. Redefinir senha com o código correto
    const resetResponse = await request(app).post('/api/v1/auth/reset-password').send({
      email: 'joao@email.com',
      code: user.resetCode,
      newPassword: 'novaSenha456',
    });
    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.success).toBe(true);

    // 5. Testar login com a nova senha
    const loginResponse = await request(app).post('/api/v1/auth/login').send({
      email: 'joao@email.com',
      password: 'novaSenha456',
    });
    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.success).toBe(true);
  });
});

