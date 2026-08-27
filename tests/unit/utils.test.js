const ApiError = require('../../src/utils/apiError');
const { generateToken, verifyToken } = require('../../src/utils/jwt.util');

describe('Utils', () => {
  describe('ApiError', () => {
    it('creates operational error with custom status and message', () => {
      const err = new ApiError(400, 'Mensagem customizada', { field: 'test' });
      expect(err.statusCode).toBe(400);
      expect(err.message).toBe('Mensagem customizada');
      expect(err.details).toEqual({ field: 'test' });
      expect(err.isOperational).toBe(true);
    });

    it('provides static factory methods', () => {
      expect(ApiError.badRequest('bad').statusCode).toBe(400);
      expect(ApiError.unauthorized().statusCode).toBe(401);
      expect(ApiError.forbidden().statusCode).toBe(403);
      expect(ApiError.notFound().statusCode).toBe(404);
      expect(ApiError.conflict().statusCode).toBe(409);
      expect(ApiError.internal().statusCode).toBe(500);
    });
  });

  describe('jwt.util', () => {
    it('generates and verifies JWT token', () => {
      const payload = { id: 'user-123', role: 'admin' };
      const token = generateToken(payload);

      expect(typeof token).toBe('string');

      const decoded = verifyToken(token);
      expect(decoded).toMatchObject(payload);
    });
  });
});
