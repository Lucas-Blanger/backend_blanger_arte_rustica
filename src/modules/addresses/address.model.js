const { DataTypes, Model } = require('sequelize');
const { sequelize } = require('../../config/database');

class Address extends Model {}

Address.init(
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
    label: {
      type: DataTypes.STRING(50),
      allowNull: true, // ex: "Casa", "Trabalho"
    },
    recipientName: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: 'recipient_name',
    },
    street: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    complement: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    neighborhood: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING(2),
      allowNull: false,
      validate: { len: [2, 2] },
    },
    zipCode: {
      type: DataTypes.STRING(9),
      allowNull: false,
      field: 'zip_code',
    },
    country: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'Brasil',
    },
    isDefault: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_default',
    },
  },
  {
    sequelize,
    modelName: 'Address',
    tableName: 'addresses',
    timestamps: true,
    underscored: true,
  }
);

module.exports = Address;
