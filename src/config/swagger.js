const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Blanger Arte Rústica",
      version: "1.0.0",
      description: "Documentação da API RESTful do e-commerce",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
        description: "Servidor de Desenvolvimento",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Dados inválidos" },
            details: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: { type: "string", example: "email" },
                  message: { type: "string", example: "E-mail inválido" },
                },
              },
            },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Maria Silva" },
            email: {
              type: "string",
              format: "email",
              example: "maria@email.com",
            },
            phone: { type: "string", example: "11999999999" },
            role: {
              type: "string",
              enum: ["customer", "admin"],
              example: "customer",
            },
            isActive: { type: "boolean", example: true },
          },
        },
        Address: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            label: { type: "string", example: "Casa" },
            recipientName: { type: "string", example: "Maria Silva" },
            street: { type: "string", example: "Rua das Flores" },
            number: { type: "string", example: "123" },
            complement: { type: "string", example: "Apto 12" },
            neighborhood: { type: "string", example: "Centro" },
            city: { type: "string", example: "Sao Paulo" },
            state: { type: "string", example: "SP" },
            zipCode: { type: "string", example: "01001-000" },
            country: { type: "string", example: "Brasil" },
            isDefault: { type: "boolean", example: true },
          },
        },
        Category: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            name: { type: "string", example: "Mesas" },
            slug: { type: "string", example: "mesas" },
            description: {
              type: "string",
              example: "Moveis rusticos para sala de jantar",
            },
          },
        },
        Product: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            categoryId: { type: "string", format: "uuid" },
            name: { type: "string", example: "Mesa rustica de madeira" },
            slug: { type: "string", example: "mesa-rustica-de-madeira" },
            description: {
              type: "string",
              example: "Mesa artesanal em madeira macica",
            },
            price: { type: "number", format: "float", example: 899.9 },
            stock: { type: "integer", example: 8 },
            sku: { type: "string", example: "MESA-001" },
            imageUrl: {
              type: "string",
              example: "https://example.com/mesa.jpg",
            },
            material: { type: "string", example: "Madeira de demolicao" },
            isActive: { type: "boolean", example: true },
          },
        },
        Order: {
          type: "object",
          properties: {
            id: { type: "string", format: "uuid" },
            userId: { type: "string", format: "uuid" },
            addressId: { type: "string", format: "uuid" },
            status: {
              type: "string",
              enum: [
                "pending",
                "paid",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
              example: "pending",
            },
            subtotal: { type: "number", format: "float", example: 1799.8 },
            shippingCost: { type: "number", format: "float", example: 25 },
            total: { type: "number", format: "float", example: 1824.8 },
            paymentMethod: { type: "string", example: "pix" },
            notes: { type: "string", example: "Entregar no periodo da tarde" },
          },
        },
      },
    },
  },
  apis: ["./src/modules/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
