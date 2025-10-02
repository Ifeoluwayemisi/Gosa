"use client";
import { useCart } from "../../context/cartContext";
import { useState, useEffect } from "react";

export default function CheckoutPage() {
  const { cartItems, totals, coupon } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch user addresses from backend
    fetch("/api/address/me", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data);
        if (data.length > 0) setSelectedAddress(data[0].id);
      });
  }, []);

  const handlePayment = async () => {
    if (!selectedAddress) return alert("Select a shipping address");

    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          cartItems,
          totals,
          addressId: selectedAddress,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Redirect to payment gateway URL
        window.location.href = data.paymentUrl;
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("Payment initiation failed");
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">
            Select Shipping Address
          </h2>
          {addresses.length === 0 ? (
            <p>No addresses found. Add one in your profile.</p>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="flex items-center mb-2">
                <input
                  type="radio"
                  name="address"
                  value={addr.id}
                  checked={selectedAddress === addr.id}
                  onChange={() => setSelectedAddress(addr.id)}
                  className="mr-2"
                />
                <span>
                  {addr.street}, {addr.city}, {addr.state}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Order Summary */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cartItems.map((item) => (
            <div key={item.productId} className="flex justify-between py-1">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>₦{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <hr className="my-2" />
          <p>Subtotal: ₦{totals.subtotal.toFixed(2)}</p>
          <p>Tax: ₦{totals.tax.toFixed(2)}</p>
          <p>Shipping: ₦{totals.shipping.toFixed(2)}</p>
          <p>Discount: ₦{totals.discount.toFixed(2)}</p>
          {coupon && <p>Coupon Applied: {coupon.code}</p>}
          <p className="font-bold text-lg">
            Grand Total: ₦{totals.grandTotal.toFixed(2)}
          </p>

          <div className="mt-4">
            <h3 className="font-semibold mb-2">Payment Method</h3>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="border p-2 w-full rounded"
            >
              <option value="CARD">Card</option>
              <option value="Paystack">Paystack</option>
              <option value="Flutterwave">Flutterwave</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
            </select>
          </div>

          {message && <p className="text-red-600 mt-2">{message}</p>}

          <button
            className="bg-blue-600 text-white w-full py-2 rounded mt-4"
            onClick={handlePayment}
          >
            Pay Now
          </button>
        </div>
      </div>
    </div>
  );
}
