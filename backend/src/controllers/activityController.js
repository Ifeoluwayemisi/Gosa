import prisma from "../config/prisma.js";

/**
 * 🧾 Get all user activities
 */
export const getUserActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { action, page = 1, limit = 10, sort = "desc" } = req.query;

    const where = {
      userId,
      ...(action && { action: action.toUpperCase() }), // optional filter by action
    };

    const activities = await prisma.activitylog.findMany({
      where,
      orderBy: { createdAt: sort === "asc" ? "asc" : "desc" },
      skip: (page - 1) * parseInt(limit),
      take: parseInt(limit),
    });

    const total = await prisma.activitylog.count({ where });

    res.json({
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
      activities,
    });
  } catch (err) {
    console.error("❌ Error fetching activity logs:", err);
    res.status(500).json({ error: "Failed to fetch activity log" });
  }
};

/**
 * 🪶 Helper — Log a new user activity
 * Use this in other controllers like Order or Coupon
 */
export const logActivity = async (userId, action, metadata = {}) => {
  try {
    await prisma.activitylog.create({
      data: {
        userId,
        action,
        metadata,
      },
    });
  } catch (err) {
    console.error("⚠️ Failed to log activity:", err);
  }
};
