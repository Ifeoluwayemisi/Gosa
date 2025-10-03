// controllers/paymentController.js
import prisma from "../config/prisma.js";

export const uploadReceipt = async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, error: "No file uploaded" });

    const receiptPath = `/uploads/receipts/${req.file.filename}`;

    await prisma.payment.updateMany({
      where: { orderId: parseInt(orderId) },
      data: { receipt: receiptPath, status: "PENDING_CONFIRMATION" },
    });

    res.json({
      success: true,
      message: "Receipt uploaded, awaiting confirmation",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Failed to upload receipt" });
  }
};

export const confirmPayment = async (req, res) => {
  try {
    const { orderId } = req.params;

    await prisma.payment.updateMany({
      where: { orderId: parseInt(orderId), status: "PENDING_CONFIRMATION" },
      data: { status: "COMPLETED" },
    });

    await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { status: "DELIVERED" },
    });

    res.json({ success: true, message: "Payment confirmed & order delivered" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, error: "Failed to confirm payment" });
  }
};