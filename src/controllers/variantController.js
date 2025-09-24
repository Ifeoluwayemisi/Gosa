import prisma from "../config/prisma.js";

export const createVariant = async (req, res) => {
  try {
    const { productId, sku, attributes, stock, price } = req.body;

    const variant = await prisma.variant.upsert({
      where: {
        productId_sku: {
          productId: parseInt(productId),
          sku,
        },
      },
      update: {
        attributes,
        stock: parseInt(stock),
        price: parseFloat(price),
      },
      create: {
        productId: parseInt(productId),
        sku,
        attributes,
        stock: parseInt(stock),
        price: parseFloat(price),
      },
    });

    res.json({ message: "Variant created/updated", variant });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Server error. Failed to create/update variant" });
  }
};

// Bulk create variants
export const bulkCreateVariants = async (req, res) => {
  try {
    const { productId, variants } = req.body;

    if (!variants || !Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({ error: "Variants array required" });
    }

    const createdVariants = await prisma.$transaction(
      variants.map(v =>
        prisma.variant.upsert({
          where: {
            productId_sku: {
              productId: parseInt(productId),
              sku: v.sku,
            },
          },
          update: {
            attributes: v.attributes,
            stock: parseInt(v.stock),
            price: parseFloat(v.price),
          },
          create: {
            productId: parseInt(productId),
            sku: v.sku,
            attributes: v.attributes,
            stock: parseInt(v.stock),
            price: parseFloat(v.price),
          },
        })
      )
    );

    res.json({ message: "Variants created/updated", createdVariants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to bulk create/update variants" });
  }
};



// Get all variants for a product
export const getVariantsByProduct = async (req, res) => {
  try {
    const productId = parseInt(req.params.productId);
    const variants = await prisma.variant.findMany({
      where: { productId, isDeleted: false },
    });

    res.json(variants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch variants" });
  }
};

// Get variant by ID
export const getVariantById = async (req, res) => {
  try {
    const variant = await prisma.variant.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!variant || variant.isDeleted)
      return res.status(404).json({ error: "Variant not found" });

    res.json(variant);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch variant" });
  }
};

export const getVariant = async (req, res) => {
  try {
    const variants = await prisma.variant.findMany({
      where: { isDeleted: false },
    });

    res.json(variants);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch variants" });
  }
};


// Update variant
export const updateVariant = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // First, check if variant exists
    const existing = await prisma.variant.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Variant not found" }); // Hard deleted or never existed
    }

    if (existing.isDeleted) {
      return res
        .status(400)
        .json({ error: "Variant is deleted and cannot be updated" });
    }

    // Proceed with update
    const { stock, price, attributes } = req.body;

    const variant = await prisma.variant.update({
      where: { id },
      data: {
        ...(stock !== undefined && { stock: parseInt(stock) }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(attributes !== undefined && { attributes }),
      },
    });

    res.json({ message: "Variant updated", variant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update variant" });
  }
};

// Soft delete variant
export const deleteVariant = async (req, res) => {
  try {
    await prisma.variant.update({
      where: { id: parseInt(req.params.id) },
      data: { isDeleted: true },
    });

    res.json({ message: "Variant soft deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete variant" });
  }
};

// Recover variant
export const recoverVariant = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // check if variant exists
    const existing = await prisma.variant.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Variant not found" });
    }

    if (!existing.isDeleted) {
      return res.status(400).json({ error: "Variant is not deleted" });
    }

    const variant = await prisma.variant.update({
      where: { id },
      data: { isDeleted: false },
    });

    res.json({ message: "Variant recovered", variant });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to recover variant" });
  }
};

// Hard delete
export const hardDeleteVariant = async (req, res) => {
  try {
    await prisma.variant.delete({
      where: { id: parseInt(req.params.id) },
    });

    res.json({ message: "Variant permanently deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to hard delete variant" });
  }
};
