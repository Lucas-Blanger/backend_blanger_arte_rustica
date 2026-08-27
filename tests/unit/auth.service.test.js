jest.mock('../../src/database/associations', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
  },
}));

jest.mock('../../src/utils/jwt.util', () => ({
  generateToken: jest.fn(() => 'token-test'),
}));

const bcrypt = require('bcryptjs');
const authService = require('../../src/modules/auth/auth.service');
const { User } = require('../../src/database/associations');
const emailService = require('../../src/services/email.service');

jest.mock('../../src/services/email.service', () => ({
  sendPasswordResetCode: jest.fn().mockResolvedValue(true),
}));

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('rejects duplicate e-mail registrations', async () => {
      User.findOne.mockResolvedValue({ id: 'existing-user' });

      await expect(
        authService.register({
          name: 'Maria Silva',
          email: 'maria@email.com',
          password: 'senha123',
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        message: 'Já existe um usuário cadastrado com este e-mail',
      });
    });

    it('creates a user and returns safe data with token', async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue({
        id: 'user-id',
        role: 'customer',
        toSafeJSON: () => ({
          id: 'user-id',
          name: 'Maria Silva',
          email: 'maria@email.com',
          role: 'customer',
        }),
      });

      const result = await authService.register({
        name: 'Maria Silva',
        email: 'maria@email.com',
        password: 'senha123',
      });

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Maria Silva',
          email: 'maria@email.com',
          passwordHash: expect.any(String),
        })
      );
      expect(await bcrypt.compare('senha123', User.create.mock.calls[0][0].passwordHash)).toBe(true);
      expect(result.token).toBe('token-test');
      expect(result.user.passwordHash).toBeUndefined();
    });
  });

  describe('login', () => {
    it('throws unauthorized error if user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(
        authService.login({ email: 'nonexistent@email.com', password: 'senha123' })
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'E-mail ou senha inválidos',
      });
    });

    it('throws forbidden error if user account is deactivated', async () => {
      User.findOne.mockResolvedValue({
        id: 'user-id',
        email: 'inactive@email.com',
        isActive: false,
      });

      await expect(
        authService.login({ email: 'inactive@email.com', password: 'senha123' })
      ).rejects.toMatchObject({
        statusCode: 403,
        message: 'Esta conta está desativada',
      });
    });

    it('throws unauthorized error if password does not match', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 1);
      User.findOne.mockResolvedValue({
        id: 'user-id',
        email: 'maria@email.com',
        passwordHash,
        isActive: true,
      });

      await expect(
        authService.login({ email: 'maria@email.com', password: 'wrong-password' })
      ).rejects.toMatchObject({
        statusCode: 401,
        message: 'E-mail ou senha inválidos',
      });
    });

    it('returns token and user safe data on valid credentials', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 1);
      User.findOne.mockResolvedValue({
        id: 'user-id',
        email: 'maria@email.com',
        passwordHash,
        role: 'customer',
        isActive: true,
        toSafeJSON: () => ({
          id: 'user-id',
          name: 'Maria Silva',
          email: 'maria@email.com',
          role: 'customer',
        }),
      });

      const result = await authService.login({ email: 'maria@email.com', password: 'correct-password' });

      expect(result.token).toBe('token-test');
      expect(result.user).toEqual({
        id: 'user-id',
        name: 'Maria Silva',
        email: 'maria@email.com',
        role: 'customer',
      });
    });
  });

  describe('forgotPassword', () => {
    it('generates a 6-digit code, saves it with expiration and sends email if user exists', async () => {
      const userMock = {
        id: 'user-id',
        email: 'maria@email.com',
        name: 'Maria Silva',
        resetCode: null,
        resetCodeExpiresAt: null,
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(userMock);

      const result = await authService.forgotPassword({ email: 'maria@email.com' });

      expect(userMock.save).toHaveBeenCalled();
      expect(userMock.resetCode).toMatch(/^\d{6}$/);
      expect(userMock.resetCodeExpiresAt).toBeInstanceOf(Date);
      expect(emailService.sendPasswordResetCode).toHaveBeenCalledWith('maria@email.com', userMock.resetCode, 'Maria Silva');
      expect(result.message).toContain('código de recuperação foi enviado');
    });

    it('returns generic message without sending email if user does not exist', async () => {
      User.findOne.mockResolvedValue(null);

      const result = await authService.forgotPassword({ email: 'unknown@email.com' });

      expect(emailService.sendPasswordResetCode).not.toHaveBeenCalled();
      expect(result.message).toContain('código de recuperação foi enviado');
    });
  });

  describe('resetPassword', () => {
    it('throws error if user is not found or code is invalid', async () => {
      User.findOne.mockResolvedValue(null);

      await expect(
        authService.resetPassword({ email: 'maria@email.com', code: '123456', newPassword: 'novaSenha123' })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Código de recuperação inválido ou expirado',
      });
    });

    it('throws error if code has expired', async () => {
      const userMock = {
        id: 'user-id',
        email: 'maria@email.com',
        resetCode: '123456',
        resetCodeExpiresAt: new Date(Date.now() - 1000 * 60), // 1 minuto atrás
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(userMock);

      await expect(
        authService.resetPassword({ email: 'maria@email.com', code: '123456', newPassword: 'novaSenha123' })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: 'Código de recuperação inválido ou expirado',
      });
    });

    it('updates password and clears reset code on valid code and expiration', async () => {
      const userMock = {
        id: 'user-id',
        email: 'maria@email.com',
        resetCode: '654321',
        resetCodeExpiresAt: new Date(Date.now() + 1000 * 60 * 10), // 10 min no futuro
        passwordHash: 'oldHash',
        save: jest.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(userMock);

      const result = await authService.resetPassword({
        email: 'maria@email.com',
        code: '654321',
        newPassword: 'novaSenha123',
      });

      expect(userMock.save).toHaveBeenCalled();
      expect(userMock.resetCode).toBeNull();
      expect(userMock.resetCodeExpiresAt).toBeNull();
      expect(await bcrypt.compare('novaSenha123', userMock.passwordHash)).toBe(true);
      expect(result.message).toContain('Senha redefinida com sucesso');
    });
  });
});

