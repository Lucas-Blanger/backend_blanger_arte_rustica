const { DataTypes, Model } = require("sequelize");
const { sequelize } = require("../../config/database");

class Review extends Model {}

Review.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "product_id",
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "user_id",
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: { args: [1], msg: "Avaliação mínima é 1 estrela" },
        max: { args: [5], msg: "Avaliação máxima é 5 estrelas" },
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: { msg: "O comentário da avaliação não pode ser vazio" },
      },
    },
  },
  {
    sequelize,
    modelName: "Review",
    tableName: "reviews",
    timestamps: true,
    underscored: true,
  },
);

module.exports = Review;
