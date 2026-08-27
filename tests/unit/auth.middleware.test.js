jest.mock('../../src/database/associations', () => ({
  User: {
    findByPk: jest.fn(),
  },
}));

jest.mock('../../src/utils/jwt.util', () => ({
  verifyToken: jest.fn(),
}));

const { authenticate, authorize } = require('../../src/middlewares/auth.middleware');
const { User } = require('../../src/database/associations');
const { verifyToken } = require('../../src/utils/jwt.util');

describe('auth.middleware', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { headers: {} };
    res = {};
    next = jest.fn();
  });

  describe('authenticate', () => {
    it('passes unauthorized error to next() if Authorization header is missing', async () => {
      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Token de autenticação não fornecido',
        })
      );
    });

    it('passes unauthorized error to next() if token is invalid or fails verification', async () => {
      req.headers.authorization = 'Bearer invalid-token';
      verifyToken.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Token inválido ou expirado',
        })
      );
    });

    it('passes unauthorized error to next() if user from payload no longer exists', async () => {
      req.headers.authorization = 'Bearer valid-token';
      verifyToken.mockReturnValue({ id: 'user-1' });
      User.findByPk.mockResolvedValue(null);

      await authenticate(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401,
          message: 'Usuário do token não existe mais',
        })
      );
    });

    it('attaches user to req and calls next() on valid token', async () => {
      req.headers.authorization = 'Bearer valid-token';
      verifyToken.mockReturnValue({ id: 'user-1' });
      const mockUser = { id: 'user-1', name: 'Maria', role: 'customer' };
      User.findByPk.mockResolvedValue(mockUser);

      await authenticate(req, res, next);

      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('authorize', () => {
    it('throws unauthorized if req.user is undefined', () => {
      const middleware = authorize('admin');

      expect(() => middleware(req, res, next)).toThrowExpectMatchObject
        ? null
        : expect(() => middleware(req, res, next)).toThrow();
    });

    it('throws forbidden if user role does not match required role', () => {
      req.user = { id: 'user-1', role: 'customer' };
      const middleware = authorize('admin');

      expect(() => middleware(req, res, next)).toThrow();
    });

    it('calls next if user has allowed role', () => {
      req.user = { id: 'user-1', role: 'admin' };
      const middleware = authorize('admin');

      middleware(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });
});
