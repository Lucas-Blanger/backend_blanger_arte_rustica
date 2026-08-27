const { sequelize } = require("../../config/database");
const {
  Order,
  OrderItem,
  Product,
  Address,
} = require("../../database/associations");
const ApiError = require("../../utils/apiError");

const SHIPPING_FLAT_RATE = 25.0; // Poderia vir de uma regra de frete

// Cria um pedido a partir de uma lista de itens do carrinho:
// [{ productId, quantity }, ...]
async function createOrder(userId, { addressId, items, paymentMethod, notes }) {
  if (!items || items.length === 0) {
    throw ApiError.badRequest("O pedido precisa ter ao menos um item");
  }

  const address = await Address.findOne({ where: { id: addressId, userId } });
  if (!address) {
    throw ApiError.badRequest("Endereço de entrega inválido");
  }

  return sequelize.transaction(async (t) => {
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await Product.findByPk(item.productId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });

      if (!product || !product.isActive) {
        throw ApiError.badRequest(`Produto ${item.productId} indisponível`);
      }
      if (product.stock < item.quantity) {
        throw ApiError.badRequest(
          `Estoque insuficiente para "${product.name}"`,
        );
      }

      const lineTotal = Number(product.price) * item.quantity;
      subtotal += lineTotal;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        unitPrice: product.price,
        quantity: item.quantity,
        lineTotal,
      });

      await product.decrement("stock", { by: item.quantity, transaction: t });
    }

    const shippingCost = SHIPPING_FLAT_RATE;
    const total = subtotal + shippingCost;

    const order = await Order.create(
      {
        userId,
        addressId,
        subtotal,
        shippingCost,
        total,
        paymentMethod,
        notes,
        status: "pending",
      },
      { transaction: t },
    );

    await OrderItem.bulkCreate(
      orderItemsData.map((i) => ({ ...i, orderId: order.id })),
      { transaction: t },
    );

    return getOrderById(order.id, userId, t);
  });
}

async function getOrderById(orderId, userId, transaction) {
  const where = { id: orderId };
  if (userId) where.userId = userId; // usuário comum só vê seus próprios pedidos

  const order = await Order.findOne({
    where,
    include: [
      { model: OrderItem, as: "items" },
      { model: Address, as: "shippingAddress" },
    ],
    transaction,
  });

  if (!order) throw ApiError.notFound("Pedido não encontrado");
  return order;
}

async function listOrdersByUser(userId, { page = 1, limit = 10 }) {
  const offset = (page - 1) * limit;
  const { rows, count } = await Order.findAndCountAll({
    where: { userId },
    include: [{ model: OrderItem, as: "items" }],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    orders: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(count / limit),
    },
  };
}

async function listAllOrders({ page = 1, limit = 20, status }) {
  const offset = (page - 1) * limit;
  const where = {};
  if (status) where.status = status;

  const { rows, count } = await Order.findAndCountAll({
    where,
    include: [{ model: OrderItem, as: "items" }],
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  return {
    orders: rows,
    pagination: {
      total: count,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(count / limit),
    },
  };
}

const VALID_TRANSITIONS = {
  pending: ["paid", "cancelled"],
  paid: ["processing", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

async function updateOrderStatus(orderId, newStatus) {
  const order = await Order.findByPk(orderId);
  if (!order) throw ApiError.notFound("Pedido não encontrado");

  const allowed = VALID_TRANSITIONS[order.status] || [];
  if (!allowed.includes(newStatus)) {
    throw ApiError.badRequest(
      `Não é possível mudar o status de "${order.status}" para "${newStatus}"`,
    );
  }

  // Se cancelado, devolve o estoque
  if (newStatus === "cancelled") {
    await sequelize.transaction(async (t) => {
      const items = await OrderItem.findAll({
        where: { orderId },
        transaction: t,
      });
      for (const item of items) {
        await Product.increment("stock", {
          by: item.quantity,
          where: { id: item.productId },
          transaction: t,
        });
      }
      await order.update({ status: newStatus }, { transaction: t });
    });
  } else {
    await order.update({ status: newStatus });
  }

  return order;
}

async function cancelOwnOrder(orderId, userId) {
  const order = await getOrderById(orderId, userId);
  return updateOrderStatus(order.id, "cancelled");
}

module.exports = {
  createOrder,
  getOrderById,
  listOrdersByUser,
  listAllOrders,
  updateOrderStatus,
  cancelOwnOrder,
};
