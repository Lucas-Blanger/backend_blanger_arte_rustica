jest.mock('../../src/database/associations', () => ({
  Product: {
    findAndCountAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
  Category: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  },
}));

const productService = require('../../src/modules/products/product.service');
const { Product, Category } = require('../../src/database/associations');

describe('product.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Products', () => {
    it('listProducts applies pagination and default active filter', async () => {
      Product.findAndCountAll.mockResolvedValue({
        rows: [{ id: 'prod-1', name: 'Mesa' }],
        count: 1,
      });

      const result = await productService.listProducts({ page: 1, limit: 10 });

      expect(Product.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
          limit: 10,
          offset: 0,
        })
      );
      expect(result.products).toHaveLength(1);
      expect(result.pagination).toEqual({ total: 1, page: 1, limit: 10, pages: 1 });
    });

    it('getProductById returns product when found', async () => {
      const mockProd = { id: 'prod-1', name: 'Mesa' };
      Product.findByPk.mockResolvedValue(mockProd);

      const prod = await productService.getProductById('prod-1');
      expect(prod).toEqual(mockProd);
    });

    it('getProductById throws not found for missing product', async () => {
      Product.findByPk.mockResolvedValue(null);

      await expect(productService.getProductById('missing-id')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Produto não encontrado',
      });
    });

    it('generates normalized product slugs from names', async () => {
      Product.create.mockImplementation((data) => Promise.resolve(data));

      const product = await productService.createProduct({
        name: 'Mesa Rústica de Madeira',
        price: 100,
      });

      expect(product.slug).toBe('mesa-rustica-de-madeira');
    });

    it('updateProduct updates details and re-slugifies name', async () => {
      const update = jest.fn();
      Product.findByPk.mockResolvedValue({ id: 'prod-1', update });

      await productService.updateProduct('prod-1', { name: 'Nova Mesa' });

      expect(update).toHaveBeenCalledWith({
        name: 'Nova Mesa',
        slug: 'nova-mesa',
      });
    });

    it('updateProduct throws not found for missing product', async () => {
      Product.findByPk.mockResolvedValue(null);

      await expect(productService.updateProduct('missing-id', { name: 'Mesa' })).rejects.toMatchObject({
        statusCode: 404,
        message: 'Produto não encontrado',
      });
    });

    it('soft deletes products by marking them inactive', async () => {
      const update = jest.fn();
      Product.findByPk.mockResolvedValue({ update });

      await productService.deleteProduct('product-id');

      expect(update).toHaveBeenCalledWith({ isActive: false });
    });

    it('deleteProduct throws 404 if product does not exist', async () => {
      Product.findByPk.mockResolvedValue(null);

      await expect(productService.deleteProduct('missing-id')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Produto não encontrado',
      });
    });
  });

  describe('Categories', () => {
    it('listCategories returns categories ordered by name', async () => {
      Category.findAll.mockResolvedValue([{ id: 'cat-1', name: 'Cadeiras' }]);

      const result = await productService.listCategories();

      expect(Category.findAll).toHaveBeenCalledWith({ order: [['name', 'ASC']] });
      expect(result).toHaveLength(1);
    });

    it('createCategory generates slug and creates record', async () => {
      Category.create.mockImplementation((data) => Promise.resolve(data));

      const category = await productService.createCategory({ name: 'Mesas Rústicas' });

      expect(category.slug).toBe('mesas-rusticas');
    });

    it('updateCategory updates name and updates slug', async () => {
      const update = jest.fn();
      Category.findByPk.mockResolvedValue({ id: 'cat-1', update });

      await productService.updateCategory('cat-1', { name: 'Iluminação Rústica' });

      expect(update).toHaveBeenCalledWith({
        name: 'Iluminação Rústica',
        slug: 'iluminacao-rustica',
      });
    });

    it('deleteCategory destroys existing category', async () => {
      const destroy = jest.fn();
      Category.findByPk.mockResolvedValue({ destroy });

      await productService.deleteCategory('cat-1');

      expect(destroy).toHaveBeenCalled();
    });

    it('throws not found when deleting a missing category', async () => {
      Category.findByPk.mockResolvedValue(null);

      await expect(productService.deleteCategory('missing-id')).rejects.toMatchObject({
        statusCode: 404,
        message: 'Categoria não encontrada',
      });
    });
  });
});
