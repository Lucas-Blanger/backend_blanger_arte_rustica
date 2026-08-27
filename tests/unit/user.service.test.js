jest.mock('../../src/database/associations', () => ({
  User: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
  },
}));

const bcrypt = require('bcryptjs');
const userService = require('../../src/modules/users/user.service');
const { User } = require('../../src/database/associations');

describe('user.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('returns paginated users list without passwordHash', async () => {
      User.findAndCountAll.mockResolvedValue({
        rows: [{ id: 'u-1', name: 'Maria' }],
        count: 1,
      });

      const result = await userService.listUsers({ page: 1, limit: 10 });

      expect(User.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: { exclude: ['passwordHash'] },
          limit: 10,
          offset: 0,
        })
      );
      expect(result.users).toHaveLength(1);
      expect(result.pagination).toEqual({ total: 1, page: 1, limit: 10, pages: 1 });
    });
  });

  describe('getUserById', () => {
    it('returns user by ID', async () => {
      const mockUser = { id: 'u-1', name: 'Maria' };
      User.findByPk.mockResolvedValue(mockUser);

      const result = await userService.getUserById('u-1');
      expect(result).toEqual(mockUser);
    });

    it('throws 404 if user is missing', async () => {
      User.findByPk.mockResolvedValue(null);

      await expect(userService.getUserById('missing-id')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Usuário não encontrado',
      });
    });
  });

  describe('updateUser', () => {
    it('updates user fields successfully', async () => {
      const update = jest.fn();
      const mockUser = {
        id: 'u-1',
        email: 'old@email.com',
        update,
        toSafeJSON: () => ({ id: 'u-1', name: 'Novo Nome', email: 'old@email.com' }),
      };
      User.findByPk.mockResolvedValue(mockUser);

      const result = await userService.updateUser('u-1', { name: 'Novo Nome' });

      expect(update).toHaveBeenCalledWith({ name: 'Novo Nome' });
      expect(result.name).toBe('Novo Nome');
    });

    it('throws 409 conflict when updating to an existing email', async () => {
      User.findByPk.mockResolvedValue({ id: 'u-1', email: 'old@email.com' });
      User.findOne.mockResolvedValue({ id: 'u-2', email: 'existing@email.com' });

      await expect(userService.updateUser('u-1', { email: 'existing@email.com' })).rejects.toMatchObject({
        statusCode: 409,
        message: 'Este e-mail já está em uso',
      });
    });
  });

  describe('changePassword', () => {
    it('changes password when current password is correct', async () => {
      const oldPasswordHash = await bcrypt.hash('old-pass', 1);
      const update = jest.fn();
      User.findByPk.mockResolvedValue({ id: 'u-1', passwordHash: oldPasswordHash, update });

      await userService.changePassword('u-1', 'old-pass', 'new-pass-123');

      expect(update).toHaveBeenCalledWith({
        passwordHash: expect.any(String),
      });
      const newHash = update.mock.calls[0][0].passwordHash;
      expect(await bcrypt.compare('new-pass-123', newHash)).toBe(true);
    });

    it('throws 400 bad request if current password is wrong', async () => {
      const oldPasswordHash = await bcrypt.hash('old-pass', 1);
      User.findByPk.mockResolvedValue({ id: 'u-1', passwordHash: oldPasswordHash });

      await expect(userService.changePassword('u-1', 'wrong-pass', 'new-pass-123')).rejects.toMatchObject({
        statusCode: 400,
        message: 'Senha atual incorreta',
      });
    });
  });

  describe('deactivateUser', () => {
    it('marks user as inactive', async () => {
      const update = jest.fn();
      User.findByPk.mockResolvedValue({ id: 'u-1', update });

      await userService.deactivateUser('u-1');

      expect(update).toHaveBeenCalledWith({ isActive: false });
    });
  });

  describe('setUserRole', () => {
    it('sets user role and returns safe JSON', async () => {
      const update = jest.fn();
      User.findByPk.mockResolvedValue({
        id: 'u-1',
        update,
        toSafeJSON: () => ({ id: 'u-1', role: 'admin' }),
      });

      const result = await userService.setUserRole('u-1', 'admin');

      expect(update).toHaveBeenCalledWith({ role: 'admin' });
      expect(result.role).toBe('admin');
    });
  });
});
