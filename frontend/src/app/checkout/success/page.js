"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const orderId = searchParams.get("orderId");

  const [status, setStatus] = useState("Verifying payment...");
  const [order, setOrder] = useState(null);
  const [file, setFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  useEffect(() => {
    if (!reference || !orderId) {
      setStatus("Invalid payment details.");
      return;
    }

    const verifyPayment = async () => {
      try {
        const res = await fetch(
          `/api/payment/callback?reference=${reference}&orderId=${orderId}`
        );
        const data = await res.json();

        if (res.ok && data.order) {
          setOrder(data.order);
          setStatus("✅ Payment successful!");
        } else {
          setStatus(data.error || "Payment verification failed.");
        }
      } catch (err) {
        console.error(err);
        setStatus("Payment verification failed.");
      }
    };

    verifyPayment();
  }, [reference, orderId]);

  const handleUpload = async () => {
    if (!file) return setUploadMessage("❌ Please select a receipt file");

    // Basic validation
    if (file.size > 5 * 1024 * 1024) {
      return setUploadMessage("❌ File too large (max 5MB)");
    }
    if (!["image/jpeg", "image/png", "application/pdf"].includes(file.type)) {
      return setUploadMessage("❌ Only JPG, PNG, or PDF allowed");
    }

    const formData = new FormData();
    formData.append("receipt", file);

    try {
      const res = await fetch(`/api/payment/${orderId}/upload-receipt`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadMessage("✅ Receipt uploaded, waiting for confirmation");
      } else {
        setUploadMessage("❌ " + (data.error || "Upload failed"));
      }
    } catch (err) {
      console.error(err);
      setUploadMessage("❌ Upload failed, try again.");
    }
  };

  // While verifying
  if (!order) return <p className="text-center mt-20">{status}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{status}</h1>

      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      {order.items.map((item) => (
        <div key={item.id} className="flex justify-between py-1 border-b">
          <span>
            {item.product.name} x {item.quantity}
          </span>
          <span>₦{(item.price * item.quantity).toFixed(2)}</span>
        </div>
      ))}

      <hr className="my-2" />
      <p>Subtotal: ₦{order.subtotal.toFixed(2)}</p>
      <p>Tax: ₦{order.tax.toFixed(2)}</p>
      <p>Shipping: ₦{order.shipping.toFixed(2)}</p>
      {order.coupon && <p>Coupon Applied: {order.coupon.code}</p>}
      <p className="font-bold text-lg">
        Grand Total: ₦{order.total.toFixed(2)}
      </p>

      {order.coupon && (
        <p className="mt-4 text-green-600">
          🎉 Congrats! Your coupon {order.coupon.code} has been sent to your
          email.
        </p>
      )}

      {/* Show receipt upload if required */}
      {order.status === "pending_receipt" && (
        <div className="mt-6 border p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Upload Payment Receipt</h3>
          <p className= "text-lg font-semibold mb-3"> If you've made a transfer please upload your reciept! Thanks </p>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="mb-2"
          />
          <button
            onClick={handleUpload}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Upload Receipt
          </button>
          {uploadMessage && <p className="mt-2 text-sm">{uploadMessage}</p>}
        </div>
      )}
    </div>
  );
}
