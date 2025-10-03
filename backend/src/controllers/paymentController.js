import prisma from "../config/prisma.js";
import paystack from "../config/paystack.js";
import { sendTemplateEmail } from ".././utils/sendTemplate.js";
import { generateCoupon } from ".././services/couponServices.js";

export const initiatePayment = async (req, res) => {
  try {
    const { cartItems, totals, paymentMethod } = req.body;
    const userId = req.user.id; // auth middleware ensures user is set
    const reference = require("nanoid").nanoid();

    // 1️⃣ Create order
    const order = await prisma.order.create({
      data: {
        userId,
        status: "PENDING",
        total: totals.grandTotal,
        items: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // 2️⃣ Create payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totals.grandTotal,
        method: paymentMethod,
        status: "PENDING",
        reference,
      },
    });

    // 3️⃣ Handle payment type
    if (paymentMethod === "BANK_TRANSFER") {
      return res.json({
        success: true,
        details: "Transfer to Zenith Bank, Account 1234567890",
        orderId: order.id,
      });
    } else {
      const paymentUrl = await paystack.transaction.initialize({
        email: req.user.email,
        amount: totals.grandTotal * 100,
        reference,
      });

      return res.json({
        success: true,
        paymentUrl: paymentUrl.data.authorization_url,
        orderId: order.id,
      });
    }
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Payment initiation failed" });
  }
};

export const paymentCallback = async (req, res) => {
  try {
    const { reference, orderId } = req.query;

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) return res.status(404).send("Payment not found");

    // Verify online payment only
    if (payment.method !== "BANK_TRANSFER") {
      const response = await paystack.transaction.verify({ reference });
      if (response.data.status !== "success") return res.send("Payment failed");
    }

    // Update payment and order
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED" },
    });

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

    const minOrdersForCoupon = 10;
    let coupon = null;

    if (userOrders >= minOrdersForCoupon) {
      coupon = await generateCoupon({
        prefix: "AUTO",
        discountType: "PERCENTAGE",
        value: 10,
        usageLimit: 3,
        perUserLimit: 1,
        expiresInDays: 30,
        minOrders: minOrdersForCoupon,
      });

      // Send email
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
  } catch (err) {
    console.error(err);
    res.status(500).send("Payment verification failed");
  }
};
