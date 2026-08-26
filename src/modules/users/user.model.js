const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../config/database");

class User extends Model {
  toSafeJSON() {
    const { passwordHash, resetCode, resetCodeExpiresAt, ...safe } = this.toJSON();
    return safe;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
      validate: { notEmpty: { msg: "Nome é obrigatório" } },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: { msg: "E-mail inválido" } },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
      field: "password_hash",
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("customer", "admin"),
      defaultValue: "customer",
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: "is_active",
    },
    resetCode: {
      type: DataTypes.STRING(6),
      allowNull: true,
      field: "reset_code",
    },
    resetCodeExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "reset_code_expires_at",
    },
  },

  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    underscored: true,
  },
);

module.exports = User;
