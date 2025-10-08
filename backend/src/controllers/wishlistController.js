import prisma from "../config/prisma.js";
import { sendNotification } from "../utils/notification.js";

export const getWishlist = async (req, res) => {
  try {
    const items = await prisma.wishlist.findMany({
      where: { userId: req.user.id },
      include: { product: true },
    });
    res.json({ wishlist: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addToWishlist = async (req, res) => {
  const { productId } = req.params;
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(productId) },
    });
    if (!product) return res.status(404).json({ message: "Product not found" });

    const existing = await prisma.wishlist.findFirst({
      where: { userId: req.user.id, productId: Number(productId) },
    });
    if (existing)
      return res.status(400).json({ message: "Item already in wishlist" });

    const newItem = await prisma.wishlist.create({
      data: {
        userId: req.user.id,
        productId: Number(productId),
        lastKnownPrice: product.price,
      },
    });

    res.status(201).json({ message: "Added to wishlist", item: newItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// check for price drop and send notification
export const checkWishlistPriceDrops = async ({ minDropPercent = 0 } = {}) => {
  const wishlists = await prisma.wishlist.findMany({
    include: { product: true, user: true },
  });

  for (const item of wishlists) {
    const priceDropPercent =
      ((item.lastKnownPrice - item.product.price) / item.lastKnownPrice) * 100;

    if (priceDropPercent >= minDropPercent) {
      // Price dropped enough!
      await prisma.notification.create({
        data: {
          userId: item.userId,
          type: "SALE_ALERT",
          title: "Price Drop Alert 💸",
          message: `${
            item.product.name
          } is now ₦${item.product.price.toLocaleString()} (was ₦${
            item.lastKnownPrice
          })!`,
        },
      });

      // Update last known price
      await prisma.wishlist.update({
        where: { id: item.id },
        data: { lastKnownPrice: item.product.price },
      });

      // Optionally email or push notify
      await sendNotification(item.user.email, item.product);
    }
  }
};


export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  try {
    await prisma.wishlist.deleteMany({
      where: { userId: req.user.id, productId: Number(productId) },
    });
    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
