import prisma from "../config/prisma.js";
import { logActivity } from "../utils/activityLogger.js";

//get all orders for the logged-in user
export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        orderitem: {
          include: { product: true },
        },
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Log that the user viewed their orders
    await logActivity(req.user.id, "VIEWED_ORDERS", { count: orders.length });

    res.json({ success: true, orders });
    await logActivity(req.user.id, "VIEWED_ORDERS", { count: orders.length });
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
        orderitem: { include: { product: true } },
        payment: true,
        address: true,
        coupon: true,
      },
    });

    if (!order)
      return res.status(404).json({ success: false, error: "Order not found" });

    if (order.userId !== req.user.id)
      return res.status(403).json({ success: false, error: "Unauthorized" });

    const subtotal = order.orderitem.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const tax = order.tax || 0;
    const shipping = order.shipping || 0;
    const discount = order.coupon?.value || 0;
    const total = subtotal + tax + shipping - discount;

    // Log that the user viewed a specific order
    await logActivity(req.user.id, "VIEWED_ORDER_DETAIL", {
      orderId: order.id,
      status: order.status,
      total,
    });

    res.json({
      success: true,
      order: {
        ...order,
        subtotal,
        tax,
        shipping,
        discount,
        total,
      },
    });
    await logActivity(req.user.id, "VIEWED_ORDER_DETAIL", {
      orderId: order.id,
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
      include: { orderitem: { include: { variant: true } }, payment: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};
