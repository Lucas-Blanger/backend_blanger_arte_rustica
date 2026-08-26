const User = require('../modules/users/user.model');
const Address = require('../modules/addresses/address.model');
const Category = require('../modules/products/category.model');
const Product = require('../modules/products/product.model');
const Order = require('../modules/orders/order.model');
const OrderItem = require('../modules/orders/orderItem.model');

// User <-> Address
User.hasMany(Address, { foreignKey: 'userId', as: 'addresses', onDelete: 'CASCADE' });
Address.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User <-> Order
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Address <-> Order (endereço de entrega usado no pedido)
Address.hasMany(Order, { foreignKey: 'addressId', as: 'orders' });
Order.belongsTo(Address, { foreignKey: 'addressId', as: 'shippingAddress' });

// Category <-> Product
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// Product <-> OrderItem
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

module.exports = { User, Address, Category, Product, Order, OrderItem };
