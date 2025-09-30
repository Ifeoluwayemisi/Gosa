import prisma from "../config/prisma.js";

export const getCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          where: { isDeleted: false },
          include: {
            variant: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!cart)
      return res.json({ message: "Cart is empty", items: [], totals: {} });

    // calculate totals
    let subtotal = 0;
    let discount = 0;
    let shipping = 0;
    let tax = 0;

    cart.items.forEach((item) => {
      subtotal += item.quantity * item.variant.price;
      discount += item.discount || 0;
      shipping += item.shipping || 0;
      tax += item.tax || 0;
    });

    const grandTotal = subtotal + shipping + tax - discount;

    res.json({
      ...cart,
      totals: {
        subtotal,
        discount,
        shipping,
        tax,
        grandTotal,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

export const addToCart = async (req, res) => {
  try {
    const { variantId, quantity } = req.body;

    // check if cart exists
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
      });
    }

    // check if item exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: { cartId: cart.id, variantId, isDeleted: false },
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + parseInt(quantity),
          subtotal:
            (existingItem.quantity + parseInt(quantity)) *
            existingItem.variantId,
        },
        include: { variant: true },
      });
    } else {
      // return price for products
      const variant = await prisma.variant.findUnique({
        where: { id: variantId },
      });
      if (!variant) return res.status(404).json({ error: "Variant not found" });

      cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity: parseInt(quantity),
          subtotal: parseInt(quantity) * variant.price,
        },
        include: { variant: true },
      });
    }

    res.json({ message: "Item added to cart", cartItem });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
};

//update item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { variant: true },
    });

    if (!cartItem || cartItem.isDeleted)
      return res.status(404).json({ error: "Cart item not found" });

    const updated = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: {
        quantity: parseInt(quantity),
        subtotal: parseInt(quantity) * cartItem.variant.price,
      },
      include: { variant: true },
    });

    res.json({ message: "Cart item updated", updated });
  } catch (err) {
    console.error(err);
    res.json(500).json({ error: "Failed to update cart item" });
  }
};

// remove item
export const removeCartItem = async (req, res) => {
  try {
    await prisma.cartItem.update({
      where: { id: parseInt(req.params.id) },
      data: { isDeleted: true },
    });

    res.json({ message: "Cart item removed" });
  } catch (err) {
    console.removeCartItem(err);
    res.status(500).json({ error: "Failed to remove item from cart" });
  }
};

// clear all cart
export const clearCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });
    if (!cart) return res.json({ message: "Cart Is Empty" });

    await prisma.cartItem.updateMany({
      where: { cartId: cart.id, isDeleted: false },
      data: { isDeleted: true },
    });

    res.json({ message: "Cart cleared" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to clear cart" });
  }
};
