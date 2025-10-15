"use client";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { jsPDF } from "jspdf";
import toast from "react-hot-toast";

export default function BillingPage() {
  const [transactions, setTransactions] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalBalance, setTotalBalance] = useState(0);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // 🌟 Fetch billing data every 5 seconds
  useEffect(() => {
    if (!token) return;

    const fetchBillingData = async () => {
      try {
        const [txRes, pmRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/transactions`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payment/methods`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const txData = await txRes.json();
        const pmData = await pmRes.json();

        if (txData.success) {
          setTransactions(txData.transactions || []);
          // calculate total balance from COMPLETED transactions
          const total = (txData.transactions || [])
            .filter((t) => t.status === "COMPLETED")
            .reduce((sum, t) => sum + t.amount, 0);
          setTotalBalance(total);
        }

        if (pmData.success) setPaymentMethods(pmData.methods || []);
      } catch (err) {
        console.error("Billing fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
    const interval = setInterval(fetchBillingData, 5000); // refresh every 5s
    return () => clearInterval(interval);
  }, [token]);

  // ➕ Add payment method
  const onAddMethod = async (data) => {
    try {
      if (!data.accountNumber) {
        toast.error("Account/Card number is required");
        return;
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/methods`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();
      if (result.success) {
        setPaymentMethods((prev) => [...prev, result.method]);
        reset();
        toast.success("Payment method added!");
      } else {
        toast.error(result.error || "Failed to add payment method");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add payment method");
    }
  };

  // ❌ Delete method
  const handleDeleteMethod = async (id) => {
    if (!confirm("Delete this payment method?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/methods/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const result = await res.json();
      if (result.success) {
        setPaymentMethods((prev) => prev.filter((m) => m.id !== id));
        toast.success("Payment method deleted!");
      } else {
        toast.error(result.error || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // 🔄 Set default method
  const handleSetDefault = async (id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/methods/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isDefault: true }),
        }
      );
      const result = await res.json();
      if (result.success) {
        setPaymentMethods((prev) =>
          prev.map((m) =>
            m.id === id ? { ...m, isDefault: true } : { ...m, isDefault: false }
          )
        );
        toast.success("Default payment method updated!");
      } else toast.error("Failed to update default");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update default");
    }
  };

  // 📄 Download Receipt PDF
  const handleDownloadReceipt = (tx) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(`Payment Receipt - #${tx.id}`, 20, 20);
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(tx.createdAt).toLocaleString()}`, 20, 30);
    doc.text(`Amount: ₦${tx.amount.toFixed(2)}`, 20, 40);
    doc.text(`Method: ${tx.method}`, 20, 50);
    doc.text(`Status: ${tx.status}`, 20, 60);
    doc.text(`Reference: ${tx.reference || "N/A"}`, 20, 70);
    doc.save(`receipt_${tx.id}.pdf`);
  };

  if (loading)
    return <div className="p-8 text-center">Loading billing info...</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Billing & Payments</h1>

      {/* Total Balance */}
      <div className="p-4 bg-green-50 text-green-700 font-semibold rounded shadow-sm">
        Total Balance: ₦{totalBalance.toFixed(2)}
      </div>

      {/* Add Payment Method */}
      <div className="border rounded-lg p-5 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Add New Payment Method</h2>
        <form onSubmit={handleSubmit(onAddMethod)} className="space-y-3">
          <select
            {...register("type")}
            className="border p-2 rounded w-full"
            defaultValue="CARD"
          >
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank Transfer</option>
            <option value="PAYSTACK">Paystack</option>
            <option value="FLUTTERWAVE">Flutterwave</option>
          </select>

          <input
            {...register("accountNumber", { required: true })}
            placeholder="Card last 4 digits or Account No."
            className="border p-2 rounded w-full"
          />
          {errors.accountNumber && (
            <p className="text-red-600 text-sm">This field is required</p>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded w-full"
          >
            Add Method
          </button>
        </form>
      </div>

      {/* Saved Payment Methods */}
      <div className="border rounded-lg p-5 bg-white shadow-sm">
        <h2 className="text-xl font-semibold mb-3">Saved Payment Methods</h2>
        {paymentMethods.length === 0 ? (
          <p>No payment methods saved.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="border rounded p-4 flex justify-between items-center shadow-sm"
              >
                <div>
                  <p className="font-medium">{method.type}</p>
                  <p className="text-sm text-gray-600">
                    {method.maskedCard || method.accountNumber}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {method.isDefault ? (
                    <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">
                      Default
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSetDefault(method.id)}
                      className="text-blue-600 text-xs hover:underline"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteMethod(method.id)}
                    className="text-red-600 text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="border rounded-lg p-5 bg-white shadow-sm overflow-x-auto">
        <h2 className="text-xl font-semibold mb-3">Transaction History</h2>
        {transactions.length === 0 ? (
          <p>No transactions found.</p>
        ) : (
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2">Date</th>
                <th className="p-2">Method</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Status</th>
                <th className="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr
                  key={tx.id}
                  className={`border-b hover:bg-gray-50 transition-colors duration-300 ${
                    tx.status === "PENDING" ? "bg-yellow-50" : ""
                  }`}
                >
                  <td className="p-2">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-2">{tx.method}</td>
                  <td className="p-2 font-medium">₦{tx.amount.toFixed(2)}</td>
                  <td
                    className={`p-2 font-semibold ${
                      tx.status === "COMPLETED"
                        ? "text-green-600"
                        : tx.status === "PENDING"
                        ? "text-yellow-600 animate-pulse"
                        : "text-red-600"
                    }`}
                  >
                    {tx.status}
                  </td>
                  <td className="p-2">
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => handleDownloadReceipt(tx)}
                    >
                      Download Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
