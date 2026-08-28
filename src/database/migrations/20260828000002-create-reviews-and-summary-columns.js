"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Adicionar colunas de resumo por IA na tabela products
    await queryInterface.addColumn("products", "review_summary", {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn("products", "review_summary_updated_at", {
      type: Sequelize.DATE,
      allowNull: true,
    });

    // 2. Criar tabela de avaliações (reviews)
    await queryInterface.createTable("reviews", {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "products",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("reviews");
    await queryInterface.removeColumn("products", "review_summary_updated_at");
    await queryInterface.removeColumn("products", "review_summary");
  },
};
