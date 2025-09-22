import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();
const app = express();
const prisma =new PrismaClient();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => 
    res.send("SaaS backend running"));

    app.get("/products", async (req, res) => {
    const products = await prisma.product.findMany();
    res.json(products);
});

app.listen(process.env.PORT || 5000, () => console.log("server is running on port 5000"))