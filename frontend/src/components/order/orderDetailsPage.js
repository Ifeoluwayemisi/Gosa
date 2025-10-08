"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { jsPDF } from "jspdf";

export default function OrderDetailsPage({ dashboardMode = false }) {
  const { token } = useAuth();
  const params = useParams();
  const { id } = params;
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchOrder = async () => {
      try {
        const endpoint = dashboardMode
          ? `${process.env.NEXT_PUBLIC_API_URL}/dashboard/orders/${id}`
          : `${process.env.NEXT_PUBLIC_API_URL}/orders/${id}`;

        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success || data.order) setOrder(data.order || data);
        else console.error(data.message || "Failed to fetch order");
      } catch (err) {
        console.error("Fetch order failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, token, dashboardMode]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto mt-10 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-300 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!order) return <p className="text-center mt-10">Order not found.</p>;

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Invoice - Order #${order.id}`, 20, 20);

    doc.setFontSize(12);
    doc.text(
      `Order Date: ${new Date(order.createdAt).toLocaleString()}`,
      20,
      30
    );

    doc.text("Shipping Address:", 20, 40);
    const addr = [
      `${order.address?.street || ""}, ${order.address?.city || ""}`,
      `${order.address?.state || ""} - ${order.address?.postal || ""}`,
    ];
    addr.forEach((line, i) =>
      doc.text(doc.splitTextToSize(line, 170), 20, 46 + i * 6)
    );

    doc.text(`Payment Method: ${order.payment?.method || "N/A"}`, 20, 60);
    doc.text(`Payment Status: ${order.payment?.status || "N/A"}`, 20, 66);

    doc.text("Items:", 20, 74);
    let y = 80;
    order.items?.forEach((item) => {
      const itemText = `${item.product?.name || "Product"} x ${
        item.quantity
      } - ₦${((item.price || 0) * item.quantity).toFixed(2)}`;
      doc.text(doc.splitTextToSize(itemText, 170), 20, y);
      y += 6;
    });

    y += 4;
    doc.text(`Subtotal: ₦${(order.subtotal || 0).toFixed(2)}`, 20, y);
    y += 6;
    doc.text(`Shipping: ₦${(order.shipping || 0).toFixed(2)}`, 20, y);
    y += 6;
    doc.text(`Discount: ₦${(order.discount || 0).toFixed(2)}`, 20, y);
    y += 6;
    if (order.coupon) doc.text(`Coupon: ${order.coupon?.code}`, 20, y);
    y += 6;
    doc.setFontSize(14);
    doc.text(`Grand Total: ₦${(order.total || 0).toFixed(2)}`, 20, y);

    doc.save(`invoice_order_${order.id}.pdf`);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {!dashboardMode && (
        <button
          onClick={() => router.push("/orders")}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to Orders
        </button>
      )}

      <h1 className="text-3xl font-bold mb-6">Order #{order.id}</h1>

      {/* Quick Stats (only visible in Dashboard) */}
      {dashboardMode && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">Status</p>
            <p className="font-semibold text-blue-700">{order.status}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">Total</p>
            <p className="font-semibold text-green-700">
              ₦{(order.total || 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">Items</p>
            <p className="font-semibold text-yellow-700">
              {order.items?.length || 0}
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg text-center">
            <p className="text-sm text-gray-600">Date</p>
            <p className="font-semibold text-purple-700">
              {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      )}

      {/* Shipping Address */}
      {order.address && (
        <div className="border p-4 rounded mb-6">
          <h2 className="text-xl font-semibold mb-2">Shipping Address</h2>
          <p>{order.address.street}</p>
          <p>
            {order.address.city}, {order.address.state} - {order.address.postal}
          </p>
        </div>
      )}

      {/* Payment Info */}
      {order.payment && (
        <div className="border p-4 rounded mb-6">
          <h2 className="text-xl font-semibold mb-2">Payment Info</h2>
          <p>Method: {order.payment.method}</p>
          <p>Status: {order.payment.status}</p>
        </div>
      )}

      {/* Items */}
      <div className="border p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Items</h2>
        <div className="space-y-2">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="flex justify-between border-b py-2 text-gray-800"
            >
              <span>
                {item.product?.name} × {item.quantity}
              </span>
              <span>₦{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border p-4 rounded mb-6">
        <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
        <p>Subtotal: ₦{order.subtotal?.toFixed(2)}</p>
        <p>Shipping: ₦{order.shipping?.toFixed(2)}</p>
        <p>Discount: ₦{order.discount?.toFixed(2)}</p>
        {order.coupon && <p>Coupon: {order.coupon.code}</p>}
        <p className="font-bold text-lg mt-2">
          Total: ₦{order.total?.toFixed(2)}
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