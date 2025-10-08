import prisma from "../config/prisma.js";

//get all orders for the logged-in user
export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: true },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, orders });
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ success: false, error: "Failed to fetch orders" });
  }
};

// Get a specific order with full details
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: { include: { product: true } },
        payment: true,
        address: true, // shipping address
        coupon: true, // applied coupon, if any
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    // Only allow the owner to view their order
    if (order.userId !== req.user.id) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    // Compute subtotal, tax, shipping, and grand total
    const subtotal = order.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = order.tax || 0;
    const shipping = order.shipping || 0;
    const discount = order.coupon?.value || 0;
    const total = subtotal + tax + shipping - discount;

    res.json({
      success: true,
      order: {
        id: order.id,
        items: order.items,
        payment: order.payment,
        address: order.address,
        coupon: order.coupon,
        status: order.status,
        subtotal,
        tax,
        shipping,
        discount,
        total,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    console.error("Error fetching order:", err);
    res.status(500).json({ success: false, error: "Failed to fetch order" });
  }
};

// Alternative simpler version without success flag and detailed error messages
export const getUserOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { variant: true } }, payments: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};
