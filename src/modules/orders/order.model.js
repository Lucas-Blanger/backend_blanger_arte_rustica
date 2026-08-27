const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class Order extends Model {}

Order.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'user_id',
    },
    addressId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'address_id',
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'paid',
        'processing',
        'shipped',
        'delivered',
        'cancelled'
      ),
      allowNull: false,
      defaultValue: 'pending',
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shippingCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'shipping_cost',
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'payment_method',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Order;
