import prisma from "../config/prisma.js";
import {
  generateCoupon,
  validateAndApplyCoupon,
} from "../services/couponServices.js";
import { logActivity } from "../utils/activityLogger.js"; 


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
      category,
      product,
    } = req.body;

    const coupon = await generateCoupon({
      prefix: prefix || "ADMIN",
      discountType,
      value,
      usageLimit,
      perUserLimit,
      expiresInDays,
      minOrders,
      couponcategory: category || [],
      couponproduct: product || [],
    });

    // 🪶 Log activity
    await logActivity(req.user.id, "CREATED_COUPON", {
      code: coupon.code,
      discount: coupon.value,
      type: coupon.discountType,
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
      include: { couponcategory: true, couponproduct: true, couponredemption: true },
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
      include: { couponcategory: true, couponproduct: true, couponredemption: true },
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
      include: { couponredemption: true },
    });

    if (!coupon)
      return res.status(400).json({ error: "Invalid or expired coupon" });

    const redeemedCount = coupon.couponredemption.filter(
      (r) => r.userId === userId
    ).length;
    if (coupon.perUserLimit && redeemedCount >= coupon.perUserLimit)
      return res.status(400).json({ error: "Coupon usage limit reached" });

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

    // 🪶 Log coupon use attempt
    await logActivity(userId, "APPLIED_COUPON", {
      code,
      discount,
    });

    res.json({ success: true, discount });
    await logActivity(req.user.id, "COUPON_REDEEMED", { code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to apply coupon" });
  }
};