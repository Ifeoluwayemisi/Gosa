// services/couponService.js
import prisma from "../config/prisma.js";
import { nanoid } from "nanoid";

export const generateCoupon = async ({
  prefix = "GEN",
  discountType,
  value,
  usageLimit,
  perUserLimit,
  expiresInDays = 30,
  minOrders = 0,
  productLimit = null,
  categories = [],
  products = [],
}) => {
  const code = `${prefix}-${nanoid(6).toUpperCase()}`;

  const coupon = await prisma.coupon.create({
    data: {
      code,
      discountType,
      value,
      usageLimit,
      perUserLimit,
      productLimit,
      minOrders,
      expiresAt: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000),
      categories: {
        create: categories.map((c) => ({ categoryId: c })),
      },
      products: {
        create: products.map((p) => ({ productId: p })),
      },
    },
  });

  return coupon;
};

export const findCouponByCode = async (code) => {
  return prisma.coupon.findUnique({
    where: { code },
    include: {
      categories: { include: { category: true } },
      products: { include: { product: true } },
      redemptions: true,
    },
  });
};

export const markCouponAsRedeemed = async ({ couponId, userId, orderId }) => {
  return prisma.couponRedemption.create({
    data: {
      couponId,
      userId,
      orderId,
    },
  });
};

// Validate & Apply coupon
export const validateAndApplyCoupon = async ({ code, orderId, userId }) => {
  // 1. Find coupon
  const coupon = await prisma.coupon.findUnique({
    where: { code },
    include: { redemptions: true },
  });

  if (!coupon || !coupon.isActive || coupon.isDeleted) {
    return { error: "Invalid or inactive coupon" };
  }

  // 2. Expiration check
  if (new Date() > coupon.expiresAt) {
    return { error: "Coupon expired" };
  }

  // 3. Usage limits
  const totalUsed = await prisma.couponRedemption.count({
    where: { couponId: coupon.id },
  });
  if (coupon.usageLimit && totalUsed >= coupon.usageLimit) {
    return { error: "Coupon usage limit reached" };
  }

  const userUsed = await prisma.couponRedemption.count({
    where: { couponId: coupon.id, userId },
  });
  if (coupon.perUserLimit && userUsed >= coupon.perUserLimit) {
    return { error: "You’ve already used this coupon" };
  }

  // 4. Fetch order
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });

  if (!order) {
    return { error: "Order not found" };
  }

  // 5. Check minOrders requirement
  if (order.items.length < coupon.minOrders) {
    return { error: `Coupon requires at least ${coupon.minOrders} products` };
  }

  // 6. Calculate discount
  let discount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discount = (order.total * coupon.value) / 100;
  } else {
    discount = coupon.value;
  }

  const newTotal = Math.max(order.total - discount, 0); // prevent negative totals

  // 7. Save redemption
  await prisma.couponRedemption.create({
    data: {
      couponId: coupon.id,
      userId,
      orderId: order.id,
    },
  });

  // 8. Update order with new total
  const updatedOrder = await prisma.order.update({
    where: { id: order.id },
    data: { total: newTotal },
    include: { items: true },
  });

  return {
    discount,
    newTotal,
    updatedOrder,
  };
};