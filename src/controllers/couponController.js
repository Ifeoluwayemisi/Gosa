import prisma from "../config/prisma.js";
import { notifyUser } from "../utils/emailNotifier.js";

export const getUserCoupons = async (req, res) => {
  try {
    const coupons = await prisma.couponRedemption.findMany({
      where: { userId: req.user.id },
      include: {
        coupon: true,
      },
      orderBy: { redeemedAt: "desc" },
    });

    const formatted = coupons.map((c) => ({
      code: c.coupon.code,
      value: c.coupon.value,
      discountType: c.coupon.discountType,
      expiresAt: c.coupon.expiresAt,
      redeemedAt: c.redeemedAt,
    }));

    await notifyUser({
      userEmail: user.email,
      subject: "You earned a coupon! 🎁",
      text: `Hi ${user.name}, use code ${coupon.code} for ${coupon.value}${
        coupon.discountType === "PERCENTAGE" ? "%" : "₦"
      } off. Expires: ${coupon.expiresAt.toDateString()}`,
    });

    res.json({ coupons: formatted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch coupons" });
  }
};