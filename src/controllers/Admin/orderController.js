import prisma from "../../config/prisma.js";

export const getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const orders = await prisma.order.findMany({
      where: status ? { status } : {},
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true, variant: true } },
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};


//get a single order
export const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        items: { include: { product: true, variant: true } },
        payment: true,
      },
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update order" });
  }
};