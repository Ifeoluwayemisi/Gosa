"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("loading");
  const [details, setDetails] = useState(null);

  const orderId = searchParams.get("orderId");
  const reference = searchParams.get("reference");
  const API = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!orderId || !reference) {
      setStatus("error");
      return;
    }

    const fetchPaymentStatus = async () => {
      try {
        const res = await fetch(`${API}/payment/status/${reference}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.success) {
          setDetails(data.payment);
          setStatus("success");
        } else {
          setStatus("pending");
          setDetails({ message: data.message || "Awaiting confirmation..." });
        }
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    };

    fetchPaymentStatus();
  }, [API, orderId, reference]);

  // ✅ Loading state
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <p className="text-gray-500 text-lg animate-pulse">
          Checking payment status...
        </p>
      </div>
    );
  }

  // ✅ Error state
  if (status === "error") {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-3">Payment Error</h1>
        <p className="text-gray-600">
          We couldn’t find your payment record. Please contact support or try
          again.
        </p>
        <a
          href="/dashboard/orders"
          className="mt-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 transition"
        >
          Go to Orders
        </a>
      </div>
    );
  }

  // ✅ Success state
  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] text-center px-6">
        <div className="bg-green-100 p-6 rounded-full mb-4">
          <span className="text-green-600 text-5xl">✅</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-gray-700 mb-4">
          Your payment was received successfully. Order <b>#{orderId}</b> is now
          being processed.
        </p>

        {details?.method === "BANK_TRANSFER" && (
          <div className="mt-4 p-4 border rounded bg-gray-50 text-left max-w-md">
            <h3 className="font-semibold text-lg mb-2">Bank Transfer Info:</h3>
            <p className="text-sm mb-2">Reference: {reference}</p>
            <p className="text-sm">
              We’ll verify your transfer within 24 hours and update your order
              status.
            </p>
            <p className="text-sm text-gray-600 mt-2">
              Need help? Send your proof of payment to <b>support@gosa.com</b>
            </p>
          </div>
        )}

        <a
          href="/dashboard/orders"
          className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          View My Orders
        </a>
      </div>
    );
  }

  // ✅ Pending (e.g., awaiting transfer confirmation)
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-6">
      <div className="bg-yellow-100 p-6 rounded-full mb-4">
        <span className="text-yellow-600 text-5xl">⏳</span>
      </div>
      <h1 className="text-3xl font-bold mb-2">Payment Pending</h1>
      <p className="text-gray-700 mb-4">
        Your bank transfer is awaiting verification. Please ensure your transfer
        is complete.
      </p>

      <div className="mt-4 p-4 border rounded bg-gray-50 text-left max-w-md">
        <p className="text-sm mb-2">Order ID: {orderId}</p>
        <p className="text-sm mb-2">Reference: {reference}</p>
        <p className="text-sm text-gray-600">
          Once confirmed, your order status will update automatically.
        </p>
      </div>

      <a
        href="/dashboard/orders"
        className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
      >
        Go to My Orders
      </a>
    </div>
  );
}
