const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../config/database");

class OrderItem extends Model {}

OrderItem.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    orderId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "order_id",
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "product_id",
    },
    productName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      field: "product_name",
    },
    unitPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "unit_price",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    lineTotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "line_total",
    },
  },
  {
    sequelize,
    modelName: "OrderItem",
    tableName: "order_items",
    timestamps: true,
    underscored: true,
  },
);

module.exports = OrderItem;
