const { notFoundHandler, errorHandler } = require('../../src/middlewares/error.middleware');
const ApiError = require('../../src/utils/apiError');

describe('error.middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = { method: 'GET', originalUrl: '/api/v1/unknown' };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe('notFoundHandler', () => {
    it('passes ApiError 404 to next()', () => {
      notFoundHandler(req, res, next);

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 404,
          message: 'Rota não encontrada: GET /api/v1/unknown',
        })
      );
    });
  });

  describe('errorHandler', () => {
    it('formats ApiError correctly', () => {
      const err = ApiError.badRequest('Dados inválidos', [{ field: 'email' }]);

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Dados inválidos',
        details: [{ field: 'email' }],
      });
    });

    it('formats SequelizeValidationError with status 400', () => {
      const err = {
        name: 'SequelizeValidationError',
        errors: [{ path: 'name', message: 'nome é obrigatório' }],
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erro de validação',
        details: [{ field: 'name', message: 'nome é obrigatório' }],
      });
    });

    it('formats SequelizeUniqueConstraintError with status 409', () => {
      const err = {
        name: 'SequelizeUniqueConstraintError',
        errors: [{ path: 'email', message: 'email em uso' }],
      };

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Registro já existe',
        details: [{ field: 'email', message: 'email em uso' }],
      });
    });

    it('defaults unhandled errors to 500', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      const err = new Error('Erro inesperado');

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Erro interno do servidor',
        details: undefined,
      });

      consoleSpy.mockRestore();
    });
  });
});
