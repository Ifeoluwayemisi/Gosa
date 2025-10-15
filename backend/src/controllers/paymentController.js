import prisma from "../config/prisma.js";
import paystack from "../config/paystack.js";
import { sendTemplateEmail } from "../utils/sendTemplate.js";
import { generateCoupon } from "../services/couponServices.js";
import { nanoid } from "nanoid";
import { logActivity } from "./activityController.js";

/**
 * 🧾 INITIATE PAYMENT
 */
export const initiatePayment = async (req, res) => {
  try {
    const { cartItems, totals, paymentMethod, addressId } = req.body;
    const userId = req.user.id;
    const reference = nanoid();

    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });

    if (!address)
      return res
        .status(404)
        .json({ success: false, error: "Address not found" });

    // ✅ Create Order
    const order = await prisma.order.create({
      data: {
        userId,
        status: "PENDING",
        subtotal: totals.subtotal,
        discount: totals.discount || 0,
        shipping: totals.shipping || 0,
        tax: totals.tax || 0,
        total: totals.grandTotal,
        shippingAddress: address,
        orderitem: {
          create: cartItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
    });

    // ✅ Create Payment Record
    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: totals.grandTotal,
        method: paymentMethod,
        status: "PENDING",
        reference,
      },
    });

    // Log activity
    await logActivity(userId, "INITIATED_PAYMENT", {
      orderId: order.id,
      method: paymentMethod,
      amount: totals.grandTotal,
    });

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

/**
 * ✅ PAYMENT CALLBACK
 */
export const paymentCallback = async (req, res) => {
  try {
    const { reference, orderId } = req.query;

    const payment = await prisma.payment.findUnique({ where: { reference } });
    if (!payment) return res.status(404).send("Payment not found");

    // Verify Paystack Payment
    if (payment.method !== "BANK_TRANSFER") {
      const response = await paystack.transaction.verify({ reference });
      if (response.data.status !== "success") return res.send("Payment failed");
    }

    // Update Payment + Order Status
    const updatedPayment = await prisma.payment.update({
      where: { id: payment.id },
      data: { status: "COMPLETED" },
    });

    const order = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: "DELIVERED" },
      include: { user: true },
    });

    const user = order.user;

    // Log Payment Transaction
    await prisma.transaction.create({
      data: {
        userId: user.id,
        paymentId: updatedPayment.id,
        type: "PAYMENT",
        status: "SUCCESS",
        amount: updatedPayment.amount,
        description: `Payment for Order #${order.id}`,
      },
    });

    await logActivity(user.id, "COMPLETED_PAYMENT", {
      orderId: order.id,
      reference,
      amount: payment.amount,
    });

    // 🎁 Auto-generate reward coupon
    const userOrders = await prisma.order.count({
      where: { userId: user.id, status: "DELIVERED" },
    });

    if (userOrders >= 10) {
      const coupon = await generateCoupon({
        prefix: "AUTO",
        discountType: "PERCENTAGE",
        value: 10,
        usageLimit: 3,
        perUserLimit: 1,
        expiresInDays: 30,
        minOrders: 10,
      });

      await logActivity(user.id, "RECEIVED_REWARD_COUPON", {
        couponCode: coupon.code,
        discount: coupon.value,
      });

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

    res.send("✅ Payment successful! Reward (if any) sent via email.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Payment verification failed");
  }
};

/* -------------------------------------------------------------------------- */
/* 🧭 PAYMENT METHODS MANAGEMENT */
/* -------------------------------------------------------------------------- */

// 💳 Add a Payment Method
export const addPaymentMethod = async (req, res) => {
  try {
    const { type, provider, last4, isDefault } = req.body;

    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    const method = await prisma.paymentMethod.create({
      data: {
        userId: req.user.id,
        type,
        provider,
        last4,
        isDefault: isDefault || false,
      },
    });

    res.json({ success: true, method });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Failed to add payment method" });
  }
};

// 🧾 Get All Payment Methods
export const getPaymentMethods = async (req, res) => {
  try {
    const methods = await prisma.paymentMethod.findMany({
      where: { userId: req.user.id },
      orderBy: { isDefault: "desc" },
    });
    res.json({ success: true, methods });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch payment methods" });
  }
};

// 🚮 Delete Payment Method
export const deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.paymentMethod.delete({
      where: { id: parseInt(id), userId: req.user.id },
    });
    res.json({ success: true, message: "Payment method deleted" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete payment method" });
  }
};

/* -------------------------------------------------------------------------- */
/* 💰 TRANSACTIONS HISTORY */
/* -------------------------------------------------------------------------- */

// 📜 Get All Transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        payment: {
          select: { reference: true, method: true, amount: true, status: true },
        },
      },
    });
    res.json({ success: true, transactions });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch transactions" });
  }
};
