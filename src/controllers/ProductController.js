import prisma from "../config/prisma.js";
export const createProduct = async (req, res) => {
  try {
    const { name, categoryId, price, description, images, stock } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        categoryId,
        price: parseFloat(price),
        description,
        images,
        stock: parseInt(stock),
      },
    });
    res.json({ message: "Product created", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create product" });
  }
};

//get all products
export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { isDeleted: false },
      include: { category: true, variants: true },
    });

    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// to get a single products
export const getProductById = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { category: true, variants: true },
    });

    if (!product) return res.status(404).json({ error: "Product not found" });

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// update product
export const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (existing.isDeleted) {
      return res
        .status(400)
        .json({ error: "Product is deleted and cannot be updated" });
    }

    const { name, categoryId, price, description, images, stock } = req.body;

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(price && { price: parseFloat(price) }),
        ...(description && { description }),
        ...(images && { images }),
        ...(stock && { stock: parseInt(stock) }),
      },
    });

    res.json({ message: "Product updated", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// soft delete product
export const softDeleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { isDeleted: true },
    });
    res.json({ message: "Product added to thrash", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to soft delete product" });
  }
};

// recover product
export const recoverProduct = async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: { isDeleted: false },
    });
    res.json({ message: "Product recovered", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to recover product" });
  }
};

// hard delete product
export const hardDeleteProduct = async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Product permanently deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to hard delete product" });
  }
};
