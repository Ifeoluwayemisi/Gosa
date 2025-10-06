import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./config/prisma.js";
import authRoutes from "./routes/authRoutes.js";
import  userRoutes from "./routes/UserRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import variantRoutes from "./routes/variantRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import checkRoutes from "./routes/checkRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import orderAdminRoutes from "./routes/admin/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoute.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/admin", orderAdminRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/user/", userRoutes);
app.use("/api/orders", orderRoutes);

// app.use("/api/", )

app.get("/", (req, res) => res.send("SaaS backend running"));

app.get("/products", async (req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

app.listen(process.env.PORT || 5000, () =>
  console.log("server is running on port 5000")
);
