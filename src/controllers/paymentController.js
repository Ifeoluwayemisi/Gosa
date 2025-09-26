import prisma from "../config/prisma.js";
import paystack from "../config/paystack.js";
import { nanoid } from "nanoid";
import { sendTemplateEmail } from "../utils/sendTemplateEmail.js"; // HTML template sender

export const paymentCallback = async (req, res) => {
  try {
    const { reference, orderId } = req.query;

    // Verify transaction with Paystack
    const response = await paystack.transaction.verify({ reference });

    if (response.data.status === "success") {
      // Update payment status
      await prisma.payment.updateMany({
        where: { orderId: parseInt(orderId), status: "PENDING" },
        data: { status: "COMPLETED" },
      });

      // Update order status
      const order = await prisma.order.update({
        where: { id: parseInt(orderId) },
        data: { status: "DELIVERED" },
        include: { user: true },
      });

      const user = order.user;

      // Auto-generate coupon if eligible
      const userOrders = await prisma.order.count({
        where: { userId: user.id, status: "DELIVERED" },
      });

      const minOrdersForCoupon = 10; // Example threshold
      let coupon = null;

      if (userOrders >= minOrdersForCoupon) {
        const code = `AUTO-${nanoid(6).toUpperCase()}`;
        coupon = await prisma.coupon.create({
          data: {
            code,
            discountType: "PERCENTAGE",
            value: 10, // 10% discount
            minOrders: minOrdersForCoupon,
            usageLimit: 3,
            perUserLimit: 1,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          },
        });

        // Send coupon via HTML template email
        if (user.email) {
          await sendTemplateEmail({
            to: user.email,
            subject: "🎉 Congrats! Your Exclusive Coupon is Here",
            templateName: "coupon.html",
            variables: {
              name: user.name,
              couponCode: coupon.code,
              discount: coupon.value,
              expiry: coupon.expiresAt.toDateString(),
            },
          });
        }
      }

      res.send(`Payment successful! ${coupon ? "Coupon sent to email!" : ""}`);
    } else {
      res.send("Payment failed!");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Payment verification failed");
  }
};