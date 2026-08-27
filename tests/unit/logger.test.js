const fs = require('fs');
const logger = require('../../src/utils/logger');

describe('logger', () => {
  let appendFileSyncSpy;

  beforeEach(() => {
    appendFileSyncSpy = jest.spyOn(fs, 'appendFileSync').mockImplementation(() => {});
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('exposes log file paths', () => {
    expect(logger.combinedLogPath).toContain('combined.log');
    expect(logger.errorLogPath).toContain('error.log');
    expect(logger.accessLogPath).toContain('access.log');
  });

  it('writes info log to combined.log', () => {
    logger.info('Teste de mensagem INFO');

    expect(appendFileSyncSpy).toHaveBeenCalledWith(
      logger.combinedLogPath,
      expect.stringContaining('[INFO]: Teste de mensagem INFO\n'),
      'utf8'
    );
  });

  it('writes warn log to combined.log', () => {
    logger.warn('Teste de mensagem WARN');

    expect(appendFileSyncSpy).toHaveBeenCalledWith(
      logger.combinedLogPath,
      expect.stringContaining('[WARN]: Teste de mensagem WARN\n'),
      'utf8'
    );
  });

  it('writes error log to combined.log and error.log', () => {
    const errorObj = new Error('Falha de conexão');
    logger.error('Erro de teste', errorObj);

    expect(appendFileSyncSpy).toHaveBeenCalledWith(
      logger.combinedLogPath,
      expect.stringContaining('[ERROR]: Erro de teste'),
      'utf8'
    );
    expect(appendFileSyncSpy).toHaveBeenCalledWith(
      logger.errorLogPath,
      expect.stringContaining('Stack: Error: Falha de conexão'),
      'utf8'
    );
  });

  it('writes http log via morgan stream to access.log and combined.log', () => {
    logger.stream.write('GET /api/v1/products 200 - 15.2 ms');

    expect(appendFileSyncSpy).toHaveBeenCalledWith(
      logger.accessLogPath,
      expect.stringContaining('[HTTP]: GET /api/v1/products 200 - 15.2 ms\n'),
      'utf8'
    );
    expect(appendFileSyncSpy).toHaveBeenCalledWith(
      logger.combinedLogPath,
      expect.stringContaining('[HTTP]: GET /api/v1/products 200 - 15.2 ms\n'),
      'utf8'
    );
  });
});
