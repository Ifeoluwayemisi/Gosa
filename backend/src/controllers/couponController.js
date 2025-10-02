import prisma from "../config/prisma.js";
import {
  generateCoupon,
  validateAndApplyCoupon,
} from "../services/couponServices.js";


// CREATE (Admin)
export const createCoupon = async (req, res) => {
  try {
    const {
      prefix,
      discountType,
      value,
      usageLimit,
      perUserLimit,
      expiresInDays,
      minOrders,
      categories,
      products,
    } = req.body;

    const coupon = await generateCoupon({
      prefix: prefix || "ADMIN",
      discountType,
      value,
      usageLimit,
      perUserLimit,
      expiresInDays,
      minOrders,
      categories: categories || [],
      products: products || [],
    });

    res.json({ message: "Coupon created", coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create coupon" });
  }
};

// GET ALL
export const getCoupons = async (req, res) => {
  try {
    const coupons = await prisma.coupon.findMany({
      where: { isDeleted: false },
      include: { categories: true, products: true, redemptions: true },
    });
    res.json(coupons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
};

// GET ONE by ID
export const getCouponById = async (req, res) => {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { categories: true, products: true, redemptions: true },
    });
    if (!coupon) return res.status(404).json({ error: "Coupon not found" });
    res.json(coupon);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coupon" });
  }
};

// SOFT DELETE
export const deleteCoupon = async (req, res) => {
  try {
    await prisma.coupon.update({
      where: { id: parseInt(req.params.id) },
      data: { isDeleted: true, isActive: false },
    });
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete coupon" });
  }
};

// RESTORE
export const restoreCoupon = async (req, res) => {
  try {
    const coupon = await prisma.coupon.update({
      where: { id: parseInt(req.params.id) },
      data: { isDeleted: false, isActive: true },
    });
    res.json({ message: "Coupon restored", coupon });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to restore coupon" });
  }
};

// APPLY COUPON (moves heavy logic to service)
export const applyCoupon = async (req, res) => {
  try {
    const { code, userId, cartItems } = req.body;

    const coupon = await prisma.coupon.findFirst({
      where: {
        code,
        isActive: true,
        expiresAt: { gt: new Date() },
      },
      include: { redemptions: true },
    });

    if (!coupon)
      return res.status(400).json({ error: "Invalid or expired coupon" });

    // Check per user limit
    const redeemedCount = coupon.redemptions.filter(
      (r) => r.userId === userId
    ).length;
    if (coupon.perUserLimit && redeemedCount >= coupon.perUserLimit)
      return res.status(400).json({ error: "Coupon usage limit reached" });

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      const subtotal = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
      discount = (subtotal * coupon.value) / 100;
    } else {
      discount = coupon.value;
    }

    res.json({ success: true, discount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to apply coupon" });
  }
};
