import prisma from "../config/prisma.js";

/**
 * Logs an activity for a user
 * @param {number} userId - The user's ID
 * @param {string} action - The type of action (e.g. "LOGIN", "ORDER_PLACED")
 * @param {object} metadata - Optional extra data (like orderId, couponId, etc.)
 */
export const logActivity = async (userId, action, metadata = {}) => {
  try {
    await prisma.activitylog.create({
      data: {
        userId,
        action: action.toUpperCase(),
        metadata,
      },
    });
  } catch (err) {
    console.error("⚠️ Failed to log activity:", err);
  }
};
