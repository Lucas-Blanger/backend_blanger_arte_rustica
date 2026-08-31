const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/database");
const {
  User,
  Address,
  Category,
  Product,
  Order,
  OrderItem,
} = require("./associations");

async function seed() {
  console.log("[SEED] Iniciando o povoamento do banco de dados...");

  try {
    await sequelize.query(
      'TRUNCATE TABLE "order_items", "orders", "addresses", "products", "categories", "users" RESTART IDENTITY CASCADE;',
    );
    console.log("[SEED] Tabelas limpas com sucesso.");

    // 1. Criar Categorias
    const categories = await Category.bulkCreate([
      {
        name: "Mesas Rústicas",
        slug: "mesas-rusticas",
        description:
          "Mesas de jantar e centro feitas em madeira maciça e demolição.",
      },
      {
        name: "Cadeiras e Bancos",
        slug: "cadeiras-e-bancos",
        description:
          "Cadeiras, bancos maciços e banquetas com acabamento rústico fino.",
      },
      {
        name: "Aparadores e Racks",
        slug: "aparadores-e-racks",
        description:
          "Móveis para sala de estar e recepção produzidos em madeira nobre.",
      },
      {
        name: "Decoração em Madeira",
        slug: "decoracao-em-madeira",
        description:
          "Espelhos, quadros, esculturas e artigos artesanais de madeira.",
      },
      {
        name: "Iluminação Rústica",
        slug: "iluminacao-rustica",
        description: "Luminárias de tronco, pendentes e arandelas rústicas.",
      },
    ]);
    console.log(`[SEED] ${categories.length} categorias criadas.`);

    const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

    // 2. Criar Produtos
    const products = await Product.bulkCreate([
      {
        categoryId: catMap["mesas-rusticas"],
        name: "Mesa de Jantar Demolição 8 Lugares",
        slug: "mesa-de-jantar-demolicao-8-lugares",
        description:
          "Mesa de jantar fabricada em madeira de demolição Peroba Rosa, com pernas robustas de 12cm e acabamento em verniz fosco.",
        price: 2490.0,
        stock: 4,
        sku: "MESA-DEM-08",
        imageUrl:
          "https://pub-ea1585d30d314fb8b2709a10120e9b61.r2.dev/imagens-products/8-1615066390971-03e4e1c36ddf.jpeg",
        material: "Peroba Rosa Demolição",
        dimensions: "220cm x 100cm x 78cm",
        isActive: true,
      },
      {
        categoryId: catMap["cadeiras-e-bancos"],
        name: "Banco Rústico Maciço 3 Lugares",
        slug: "banco-rustico-macico-3-lugares",
        description:
          "Banco estofado em madeira maciça com nós aparentes e alta durabilidade.",
        price: 890.0,
        stock: 8,
        sku: "BNC-MAC-03",
        imageUrl:
          "https://pub-ea1585d30d314fb8b2709a10120e9b61.r2.dev/imagens-products/3-1538688525198-9b88f6f53126.jpeg",
        material: "Peroba Rosa",
        dimensions: "160cm x 45cm x 48cm",
        isActive: true,
      },
      {
        categoryId: catMap["aparadores-e-racks"],
        name: "Aparador Rústico 2 Gavetas",
        slug: "aparador-rustico-2-gavetas",
        description:
          "Aparador elegante para hall de entrada ou sala de jantar com puxadores de ferro forjado.",
        price: 1350.0,
        stock: 5,
        sku: "APR-RUS-02",
        imageUrl:
          "https://pub-ea1585d30d314fb8b2709a10120e9b61.r2.dev/imagens-products/5-1595428774223-ef52624120d2.jpeg",
        material: "Madeira de Reuso",
        dimensions: "140cm x 40cm x 85cm",
        isActive: true,
      },
      {
        categoryId: catMap["iluminacao-rustica"],
        name: "Luminária de Tronco Entalhado",
        slug: "luminaria-de-tronco-entalhado",
        description:
          "Luminária artesanal feita de tronco de árvore trabalhado com lâmpada filamento de carbono estilo Edison.",
        price: 320.0,
        stock: 12,
        sku: "LUM-TRN-01",
        imageUrl:
          "https://pub-ea1585d30d314fb8b2709a10120e9b61.r2.dev/imagens-products/second-1507473885765-e6ed057f782c.jpeg",
        material: "Tronco Natural Tratado",
        dimensions: "30cm x 25cm x 45cm",
        isActive: true,
      },
      {
        categoryId: catMap["decoracao-em-madeira"],
        name: "Espelho Moldura Rústica Trançada",
        slug: "espelho-moldura-rustica-trancada",
        description:
          "Espelho de parede decorativo com moldura em ripas de madeira entalhada à mão.",
        price: 450.0,
        stock: 10,
        sku: "ESP-MLD-01",
        imageUrl:
          "https://pub-ea1585d30d314fb8b2709a10120e9b61.r2.dev/imagens-products/4-1618221195710-dd6b41faaea6.jpeg",
        material: "Madeira Rústica e Cristal 4mm",
        dimensions: "90cm x 70cm x 5cm",
        isActive: true,
      },
      {
        categoryId: catMap["aparadores-e-racks"],
        name: "Rack Rústico para TV até 65 Polegadas",
        slug: "rack-rustico-para-tv-ate-65-polegadas",
        description:
          "Rack para sala com portas de travamento rústico e nichos para aparelhos eletrônicos.",
        price: 1890.0,
        stock: 3,
        sku: "RCK-TV-65",
        imageUrl:
          "https://pub-ea1585d30d314fb8b2709a10120e9b61.r2.dev/imagens-products/9-1598300042247-d088f8ab3a91.jpeg",
        material: "Peroba Rosa e Estrutura de Ferro",
        dimensions: "180cm x 45cm x 60cm",
        isActive: true,
      },
      {
        categoryId: catMap["aparadores-e-racks"],
        name: "Cristaleira Rústica em Peroba Rosa",
        slug: "cristaleira-rustica-em-peroba-rosa",
        description:
          "Cristaleira alta com 2 portas de vidro, prateleiras reforçadas e acabamento de demolição com ferragens artesanais.",
        price: 2790.0,
        stock: 2,
        sku: "CRI-PER-01",
        imageUrl:
          "https://pub-ea1585d30d314fb8b2709a10120e9b61.r2.dev/imagens-products/7-1555041469-a586c61ea9bc.jpeg",
        material: "Peroba Rosa Demolição e Vidro",
        dimensions: "100cm x 45cm x 190cm",
        isActive: true,
      },
      {
        categoryId: catMap["cadeiras-e-bancos"],
        name: "Cadeira Rústica Anatomic Maciça",
        slug: "cadeira-rustica-anatomic-macica",
        description:
          "Cadeira de jantar com encosto anatômico curvado à mão em madeira maciça de reflorestamento e demolição.",
        price: 420.0,
        stock: 16,
        sku: "CAD-ANT-01",
        imageUrl:
          "https://pub-ea1585d30d314fb8b2709a10120e9b61.r2.dev/imagens-products/first-1771847882473-7c665a0b538a.jpeg",
        material: "Madeira Maciça de Demolição",
        dimensions: "48cm x 52cm x 95cm",
        isActive: true,
      },
      {
        categoryId: catMap["mesas-rusticas"],
        name: "Mesa de Centro de Tronco Rústico",
        slug: "mesa-de-centro-de-tronco-rustico",
        description:
          "Mesa de centro exclusiva esculpida de fatia maciça de árvore com bordas orgânicas preservadas e pés de ferro.",
        price: 1150.0,
        stock: 4,
        sku: "MSC-TRN-01",
        imageUrl:
          "https://pub-ea1585d30d314fb8b2709a10120e9b61.r2.dev/imagens-products/6-1532323544230-7191fd51bc1b.jpeg",
        material: "Tora Natural e Ferro Forjado",
        dimensions: "90cm x 80cm x 40cm",
        isActive: true,
      },
      {
        categoryId: catMap["iluminacao-rustica"],
        name: "Pendente Rústico em Ferro e Madeira",
        slug: "pendente-rustico-em-ferro-e-madeira",
        description:
          "Lustre pendente estilo de oficina rústica com suporte em madeira trabalhada e estrutura de ferro martelado.",
        price: 580.0,
        stock: 7,
        sku: "PND-FRR-01",
        imageUrl:
          "https://pub-ea1585d30d314fb8b2709a10120e9b61.r2.dev/imagens-products/10-1513506003901-1e6a229e2d15.jpeg",
        material: "Ferro Martelado e Peroba",
        dimensions: "60cm x 60cm x 80cm",
        isActive: true,
      },
    ]);
    console.log(`[SEED] ${products.length} produtos criados.`);

    // 3. Criar Usuários (Admin e Clientes)
    const adminPasswordHash = await bcrypt.hash("Admin@123456", 10);
    const customerPasswordHash = await bcrypt.hash("Senha@123456", 10);

    const admin = await User.create({
      name: "Administrador Blanger",
      email: "admin@blangerarterustica.com.br",
      passwordHash: adminPasswordHash,
      phone: "11988887777",
      role: "admin",
      isActive: true,
    });

    const customer1 = await User.create({
      name: "Maria Silva",
      email: "maria.silva@email.com",
      passwordHash: customerPasswordHash,
      phone: "11977776666",
      role: "customer",
      isActive: true,
    });

    const customer2 = await User.create({
      name: "João Pedro Santos",
      email: "joao.pedro@email.com",
      passwordHash: customerPasswordHash,
      phone: "31966665555",
      role: "customer",
      isActive: true,
    });
    console.log("[SEED] 3 usuários criados (1 Admin, 2 Clientes).");

    // 4. Criar Endereços
    const address1 = await Address.create({
      userId: customer1.id,
      label: "Casa",
      recipientName: "Maria Silva",
      street: "Rua das Palmeiras",
      number: "150",
      complement: "Apto 42",
      neighborhood: "Jardins",
      city: "São Paulo",
      state: "SP",
      zipCode: "01415-000",
      isDefault: true,
    });

    const address2 = await Address.create({
      userId: customer2.id,
      label: "Trabalho",
      recipientName: "João Pedro Santos",
      street: "Avenida Afonso Pena",
      number: "800",
      complement: "Salas 301-304",
      neighborhood: "Centro",
      city: "Belo Horizonte",
      state: "MG",
      zipCode: "30130-003",
      isDefault: true,
    });
    console.log("[SEED] 2 endereços criados.");

    // 5. Criar Pedidos e Itens
    const mesaProduct = products.find((p) => p.sku === "MESA-DEM-08");
    const luminariaProduct = products.find((p) => p.sku === "LUM-TRN-01");

    const order1 = await Order.create({
      userId: customer1.id,
      addressId: address1.id,
      status: "delivered",
      subtotal: Number(mesaProduct.price),
      shippingCost: 25.0,
      total: Number(mesaProduct.price) + 25.0,
      paymentMethod: "pix",
      notes: "Entregar preferencialmente na parte da tarde.",
    });

    await OrderItem.create({
      orderId: order1.id,
      productId: mesaProduct.id,
      productName: mesaProduct.name,
      unitPrice: mesaProduct.price,
      quantity: 1,
      lineTotal: mesaProduct.price,
    });

    const order2 = await Order.create({
      userId: customer2.id,
      addressId: address2.id,
      status: "processing",
      subtotal: Number(luminariaProduct.price) * 2,
      shippingCost: 25.0,
      total: Number(luminariaProduct.price) * 2 + 25.0,
      paymentMethod: "credit_card",
      notes: "Solicita embrulho reforçado para presente.",
    });

    await OrderItem.create({
      orderId: order2.id,
      productId: luminariaProduct.id,
      productName: luminariaProduct.name,
      unitPrice: luminariaProduct.price,
      quantity: 2,
      lineTotal: Number(luminariaProduct.price) * 2,
    });

    console.log("[SEED] 2 pedidos de exemplo com itens criados com sucesso.");

    console.log("\n[SEED] Povoamento concluído com sucesso!");
    console.log("---------------------------------------------------------");
    console.log("Credenciais para teste:");
    console.log("Admin:    admin@blangerarterustica.com.br / Admin@123456");
    console.log("Cliente:  maria.silva@email.com           / Senha@123456");
    console.log("Cliente:  joao.pedro@email.com            / Senha@123456");
    console.log("---------------------------------------------------------");

    process.exit(0);
  } catch (error) {
    console.error("[SEED] Erro ao executar o povoamento:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
