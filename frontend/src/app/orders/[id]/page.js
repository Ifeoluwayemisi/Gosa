"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { jsPDF } from "jspdf";

export default function OrderDetailsPage() {
  const { token } = useAuth();
  const params = useParams();
  const { id } = params;
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return; // wait for token

    const fetchOrder = async () => {
      try {
        const res = await fetch(`/api/orders/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setOrder(data.order);
        else console.error(data.error);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 space-y-4">
        <div className="h-8 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
      </div>
    );
  }

  if (!order) return <p className="text-center mt-10">Order not found.</p>;

  const handleDownloadInvoice = () => {
    if (!order) return;

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Invoice - Order #${order.id}`, 20, 20);

    doc.setFontSize(12);
    doc.text(
      `Order Date: ${new Date(order.createdAt).toLocaleString()}`,
      20,
      30
    );

    // Shipping Address
    doc.text("Shipping Address:", 20, 40);
    const addressLines = [
      `${order.address?.street || ""}, ${order.address?.city || ""}`,
      `${order.address?.state || ""} - ${order.address?.postal || ""}`,
    ];
    addressLines.forEach((line, i) =>
      doc.text(doc.splitTextToSize(line, 170), 20, 46 + i * 6)
    );

    // Payment
    doc.text(`Payment Method: ${order.payment?.method || "N/A"}`, 20, 58);
    doc.text(`Payment Status: ${order.payment?.status || "N/A"}`, 20, 64);

    // Items
    doc.text("Items:", 20, 74);
    let y = 80;
    order.items.forEach((item) => {
      const itemText = `${item.product?.name || "Unnamed Product"} x ${
        item.quantity
      } - ₦${((item.price || 0) * item.quantity).toFixed(2)}`;
      doc.text(doc.splitTextToSize(itemText, 170), 20, y);
      y += 6;
    });

    // Totals
    y += 4;
    doc.text(`Subtotal: ₦${(order.subtotal || 0).toFixed(2)}`, 20, y);
    y += 6;
    doc.text(`Tax: ₦${(order.tax || 0).toFixed(2)}`, 20, y);
    y += 6;
    doc.text(`Shipping: ₦${(order.shipping || 0).toFixed(2)}`, 20, y);
    y += 6;
    doc.text(`Discount: ₦${(order.discount || 0).toFixed(2)}`, 20, y);
    y += 6;
    if (order.coupon)
      doc.text(`Coupon Applied: ${order.coupon?.code || ""}`, 20, y);
    y += 6;
    doc.setFontSize(14);
    doc.text(`Grand Total: ₦${(order.total || 0).toFixed(2)}`, 20, y);

    doc.save(`invoice_order_${order.id}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={() => router.push("/orders")}
        className="mb-4 text-blue-600 hover:underline"
      >
        &larr; Back to Orders
      </button>

      <h1 className="text-3xl font-bold mb-6">Order #{order.id}</h1>

      {/* Shipping Address */}
      {order.address && (
        <div className="border p-4 rounded mb-6">
          <h2 className="text-xl font-semibold mb-2">Shipping Address</h2>
          <p>
            {order.address?.street || ""}, {order.address?.city || ""}
          </p>
          <p>
            {order.address?.state || ""} - {order.address?.postal || ""}
          </p>
        </div>
      )}

      {/* Payment Info */}
      {order.payment && (
        <div className="border p-4 rounded mb-6">
          <h2 className="text-xl font-semibold mb-2">Payment Info</h2>
          <p>
            <span className="font-semibold">Method:</span>{" "}
            {order.payment?.method || "N/A"}
          </p>
          <p>
            <span className="font-semibold">Status:</span>{" "}
            {order.payment?.status || "N/A"}
          </p>
        </div>
      )}

      {/* Items */}
      <div className="border p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Items</h2>
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between border-b py-2">
              <span>
                {item.product?.name || "Unnamed Product"} x {item.quantity}
              </span>
              <span>₦{((item.price || 0) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals & Coupon */}
      <div className="border p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
        <p>Subtotal: ₦{(order.subtotal || 0).toFixed(2)}</p>
        <p>Tax: ₦{(order.tax || 0).toFixed(2)}</p>
        <p>Shipping: ₦{(order.shipping || 0).toFixed(2)}</p>
        <p>Discount: ₦{(order.discount || 0).toFixed(2)}</p>
        {order.coupon && <p>Coupon Applied: {order.coupon?.code || ""}</p>}
        <p className="font-bold text-lg mt-2">
          Grand Total: ₦{(order.total || 0).toFixed(2)}
        </p>
      </div>

      {/* Order Status */}
      <div className="border p-4 rounded">
        <p>
          <span className="font-semibold">Status:</span> {order.status || "N/A"}
        </p>
        <p>
          <span className="font-semibold">Ordered On:</span>{" "}
          {new Date(order.createdAt).toLocaleString()}
        </p>
      </div>

      <button
        onClick={handleDownloadInvoice}
        className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Download Invoice
      </button>
    </div>
  );
}
