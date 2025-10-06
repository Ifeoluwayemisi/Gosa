// controllers/dashboardController.js
import prisma from "../config/prisma.js";

// ---------------------------
// Dashboard Summary Controller
// ---------------------------
export const getDashboardOverview = async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch core stats
    const totalOrders = await prisma.order.count({ where: { userId } });
    const pendingOrders = await prisma.order.count({
      where: { userId, status: "PENDING" },
    });

    const completedOrders = await prisma.order.count({
      where: { userId, status: "DELIVERED" },
    });

    const totalSpent = await prisma.order.aggregate({
      where: { userId, status: "DELIVERED" },
      _sum: { total: true },
    });

    const wishlistCount = await prisma.wishlist.count({
      where: { userId },
    });

    // Recent Orders (last 5)
    const recentOrders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { items: { include: { product: true } } },
    });

    // Notifications (example)
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    // Addresses
    const addresses = await prisma.address.findMany({ where: { userId } });

    // Wishlist items
    const wishlist = await prisma.wishlist.findMany({
      where: { userId },
      include: { product: true },
      take: 5,
    });

    res.json({
      overview: {
        totalOrders,
        completedOrders,
        pendingOrders,
        totalSpent: totalSpent._sum.total || 0,
        wishlistCount,
      },
      recentOrders,
      wishlist,
      notifications,
      addresses,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};