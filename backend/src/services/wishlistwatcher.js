import prisma from "../config/prisma.js";
import { sendTemplateEmail } from "../utils/sendTemplate.js";

/**
 * Watch all wishlisted products for price drops or stock updates
 * This will only notify if there is a change from the last notified state
 */
export const checkWishlistUpdates = async () => {
  try {
    const wishlists = await prisma.wishlist.findMany({
      include: { product: true, user: true },
    });

    for (const entry of wishlists) {
      const { product, user, lastNotifiedPrice, lastNotifiedStock } = entry;

      let notify = false;
      let message = "";

      // Price drop check
      if (product.price < (lastNotifiedPrice ?? product.price)) {
        notify = true;
        message += `🎉 Price dropped! ${product.name} is now ₦${product.price}. `;
        await prisma.wishlist.update({
          where: { id: entry.id },
          data: { lastNotifiedPrice: product.price },
        });
      }

      // Back in stock check
      if (
        product.stock > 0 &&
        (lastNotifiedStock === 0 || lastNotifiedStock === null)
      ) {
        notify = true;
        message += `📦 ${product.name} is back in stock!`;
        await prisma.wishlist.update({
          where: { id: entry.id },
          data: { lastNotifiedStock: product.stock },
        });
      }

      // Create notification & optional email
      if (notify) {
        await prisma.notification.create({
          data: {
            userId: user.id,
            title: "Wishlist Update",
            message,
            type: "WISHLIST",
          },
        });

        if (user.email) {
          await sendTemplateEmail({
            to: user.email,
            subject: "Wishlist Update!",
            templateName: "wishlistNotification.html",
            variables: { name: user.name, message },
          });
        }
      }
    }

    console.log("✅ Wishlist watcher: check complete");
  } catch (err) {
    console.error("❌ Wishlist watcher error:", err);
  }
};
