const emailService = require('../../src/services/email.service');

describe('email.service', () => {
  it('sends password reset email successfully', async () => {
    const info = await emailService.sendPasswordResetCode('test@email.com', '123456', 'Teste');
    expect(info).toBeDefined();
  });
});
