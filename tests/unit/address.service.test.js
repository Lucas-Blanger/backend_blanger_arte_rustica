jest.mock('../../src/database/associations', () => ({
  Address: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
}));

const addressService = require('../../src/modules/addresses/address.service');
const { Address } = require('../../src/database/associations');

describe('address.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('listByUser', () => {
    it('returns addresses for a specific user ordered by default first', async () => {
      Address.findAll.mockResolvedValue([{ id: 'addr-1', label: 'Casa' }]);

      const result = await addressService.listByUser('user-1');

      expect(Address.findAll).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('getOwned', () => {
    it('returns address if owned by user', async () => {
      const mockAddr = { id: 'addr-1', userId: 'user-1' };
      Address.findOne.mockResolvedValue(mockAddr);

      const result = await addressService.getOwned('addr-1', 'user-1');
      expect(result).toEqual(mockAddr);
    });

    it('throws 404 if address is not found or not owned by user', async () => {
      Address.findOne.mockResolvedValue(null);

      await expect(addressService.getOwned('addr-1', 'user-1')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Endereço não encontrado',
      });
    });
  });

  describe('create', () => {
    it('sets first address as default automatically', async () => {
      Address.count.mockResolvedValue(0);
      Address.create.mockImplementation((data) => Promise.resolve(data));

      const result = await addressService.create('user-1', { street: 'Rua A', number: '10' });

      expect(Address.update).toHaveBeenCalledWith({ isDefault: false }, { where: { userId: 'user-1' } });
      expect(result).toMatchObject({
        userId: 'user-1',
        street: 'Rua A',
        isDefault: true,
      });
    });

    it('creates a non-default address when user already has addresses', async () => {
      Address.count.mockResolvedValue(1);
      Address.create.mockImplementation((data) => Promise.resolve(data));

      const result = await addressService.create('user-1', { street: 'Rua B', isDefault: false });

      expect(Address.update).not.toHaveBeenCalled();
      expect(result.isDefault).toBe(false);
    });
  });

  describe('update', () => {
    it('updates address and unsets other defaults if updated to default', async () => {
      const update = jest.fn();
      Address.findOne.mockResolvedValue({ id: 'addr-1', userId: 'user-1', update });

      await addressService.update('addr-1', 'user-1', { label: 'Trabalho', isDefault: true });

      expect(Address.update).toHaveBeenCalledWith({ isDefault: false }, { where: { userId: 'user-1' } });
      expect(update).toHaveBeenCalledWith({ label: 'Trabalho', isDefault: true });
    });
  });

  describe('remove', () => {
    it('removes owned address', async () => {
      const destroy = jest.fn();
      Address.findOne.mockResolvedValue({ id: 'addr-1', userId: 'user-1', destroy });

      await addressService.remove('addr-1', 'user-1');

      expect(destroy).toHaveBeenCalled();
    });
  });
});
