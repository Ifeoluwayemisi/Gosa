export const getUserActivity = async (req, res) => {
  try {
    const orderActivities = await prisma.order.findMany({
      where: { userId: req.user.id },
      select: { id: true, status: true, createdAt: true },
    });

    const couponActivities = await prisma.couponRedemption.findMany({
      where: { userId: req.user.id },
      include: { coupon: true },
    });

    res.json({
      orders: orderActivities,
      coupons: couponActivities,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch activity log" });
  }
};