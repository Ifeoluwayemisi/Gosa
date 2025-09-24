import prisma  from "../config/prisma.js";

export const createCategory = async (req, res) => {
    try {
        const { name } = req.body;

        const category = await prisma.category.create({
            data: { name },
        });

        res.json({ message: "Category created", category})
    } catch (err){
    console.error(err);
    res.status(500).json({ error: "failed to create Product Category" })
}
}

//get all category
export const getCategories = async(req, res) => {
    try {
        const categories = await prisma.category.findMany({
            where: { isDeleted: false},
            include: {products: true},
        });

        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "failed to fetch categories"})
    }
}