const { globalLimiter, authLimiter } = require('../../src/middlewares/rateLimit.middleware');

describe('rateLimit.middleware', () => {
  it('exports globalLimiter and authLimiter middlewares', () => {
    expect(typeof globalLimiter).toBe('function');
    expect(typeof authLimiter).toBe('function');
  });

  it('calls next() when NODE_ENV is test (skip condition)', async () => {
    const req = { headers: {}, ip: '127.0.0.1' };
    const res = { setHeader: jest.fn() };
    const next = jest.fn();

    await globalLimiter(req, res, next);
    expect(next).toHaveBeenCalled();

    next.mockClear();
    await authLimiter(req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
