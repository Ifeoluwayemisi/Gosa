import prisma from "../config/prisma.js";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (await prisma.category.findUnique({ where: { name } })) {
      return res.status(400).json({ error: "Category already exists" });
    }
    const category = await prisma.category.create({
      data: { name },
    });

    res.json({ message: "Category created", category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to create Product Category" });
  }
};

//get all category
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isDeleted: false },
      include: { products: true },
    });

    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "failed to fetch categories" });
  }
};

// update category
export const recoverProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (!existing.isDeleted) {
      return res.status(400).json({ error: "Product is not deleted" });
    }

    const product = await prisma.product.update({
      where: { id },
      data: { isDeleted: false },
    });

    res.json({ message: "Product recovered", product });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to recover product" });
  }
};

// get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { products: true },
    });

    if (!category || category.isDeleted) {
      return res.status(404).json({ error: "Category not found" });
    }

    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch category" });
  }
};

// update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name },
    });

    res.json({ message: "Category Updated", category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update category" });
  }
};

// soft delete category
export const softDeleteCategory = async (req, res) => {
  try {
    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: { isDeleted: true },
    });
    res.json({ message: "Category soft deleted", category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to soft delete category" });
  }
};

// recover category
export const recoverCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Category not found" });
    }

    if (!existing.isDeleted) {
      return res.status(400).json({ error: "Category is not deleted" });
    }

    const category = await prisma.category.update({
      where: { id },
      data: { isDeleted: false },
    });

    res.json({ message: "Category recovered", category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to recover category" });
  }
};

// hard delete category and its products
export const hardDeleteCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);

    // delete all products first
    await prisma.product.deleteMany({
      where: { categoryId },
    });

    // then delete category
    await prisma.category.delete({
      where: { id: categoryId },
    });

    res.json({ message: "Category and its products permanently deleted" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: "Failed to hard delete category and products" });
  }
};
