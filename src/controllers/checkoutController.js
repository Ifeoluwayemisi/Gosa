import prisma from "../config/prisma.js";
import paystack from "../config/paystack.js"; // your paystack config

export const checkout = async (req, res) => {
  try {
    const { couponCode, shipping = 0, tax = 0, email } = req.body;

    const userId = req.user.id;
    const userEmail = email || req.user.email;

    const shopUrl = process.env.FRONTEND_URL || "https://yourshop.com";

    const transaction = await prisma.$transaction(async (prisma) => {
      //  Get user cart
      const cart = await prisma.cart.findUnique({
        where: { userId },
        include: {
          items: {
            where: { isDeleted: false },
            include: { variant: true },
          },
        },
      });

      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      //  Calculate subtotal
      let subtotal = 0;
      cart.items.forEach((item) => {
        subtotal += item.quantity * item.variant.price;
      });

      // Apply coupon
      let discount = 0;
      let coupon = null;
      if (couponCode) {
        coupon = await prisma.coupon.findUnique({
          where: { code: couponCode },
          include: { redemptions: true },
        });

        if (!coupon || !coupon.isActive || new Date() > coupon.expiresAt)
          throw new Error("Invalid or expired coupon");

        if (coupon.usageLimit && coupon.redemptions.length >= coupon.usageLimit)
          throw new Error("Coupon usage limit reached");

        const userRedeems = coupon.redemptions.filter(
          (r) => r.userId === userId
        ).length;
        if (coupon.perUserLimit && userRedeems >= coupon.perUserLimit)
          throw new Error("You have already used this coupon");

        if (coupon.productLimit && cart.items.length < coupon.productLimit)
          throw new Error(
            `Buy at least ${coupon.productLimit} items to use this coupon`
          );

        discount =
          coupon.discountType === "PERCENTAGE"
            ? (subtotal * coupon.value) / 100
            : coupon.value;
      }

      const grandTotal = subtotal + shipping + tax - discount;

      // Create Order
      const order = await prisma.order.create({
        data: { userId, total: grandTotal, status: "PENDING" },
      });

      // Create OrderItems & deduct stock
      for (const item of cart.items) {
        await prisma.orderItem.create({
          data: {
            orderId: order.id,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.variant.price,
          },
        });

        await prisma.variant.update({
          where: { id: item.variantId },
          data: { stock: item.variant.stock - item.quantity },
        });
      }

      // Record coupon redemption
      if (coupon) {
        await prisma.couponRedemption.create({
          data: { couponId: coupon.id, userId, orderId: order.id },
        });
      }

      // Clear cart
      await prisma.cartItem.updateMany({
        where: { cartId: cart.id },
        data: { isDeleted: true },
      });

      // Initialize Paystack Payment
      const paystackResponse = await paystack.transaction.initialize({
        email: userEmail,
        amount: Math.round(grandTotal * 100), // in kobo
        callback_url: `${process.env.BASE_URL}/api/payment/callback?orderId=${order.id}`,
        currency: "NGN",
      });

      // Save payment record with reference
      await prisma.payment.create({
        data: {
          orderId: order.id,
          amount: grandTotal,
          method: "Paystack",
          status: "PENDING",
          reference: paystackResponse.data.reference,
        },
      });

      // Send Order Confirmation Email (HTML template)
      await sendTemplateEmail({
        to: userEmail,
        subject: `Order Confirmation #${order.id} ✅`,
        templateName: "orderConfirmation.html",
        variables: {
          name: req.user.name,
          orderId: order.id,
          items: cart.items.map((i) => ({
            name: i.variant.name,
            quantity: i.quantity,
            price: i.variant.price,
            subtotal: i.quantity * i.variant.price,
          })),
          discount,
          shipping,
          tax,
          grandTotal,
          date: new Date().toDateString(),
          shopUrl,
        },
      });

      //  Notify Admin
      await notifyAdmin({
        subject: `New Order Placed #${order.id}`,
        text: `Order #${order.id} placed by ${req.user.name} (${userEmail}). Total: ₦${grandTotal}`,
      });

      return {
        orderId: order.id,
        paymentUrl: paystackResponse.data.authorization_url,
        grandTotal,
        discount,
      };
    });

    res.json({
      message: "Order created, payment initiated",
      ...transaction,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed" });
  }
};
