"use client";
import { useCart } from "../../context/cartContext";
import { useState, useEffect, useRef } from "react";

export default function CheckoutPage() {
  const { cartItems, totals, coupon } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [token, setToken] = useState(null); // ✅ token state
  const formRef = useRef(null);
  const API = process.env.NEXT_PUBLIC_API_URL;

  // Load token from localStorage on client
  useEffect(() => {
    setToken(localStorage.getItem("token"));
  }, []);

  // Fetch addresses once token is available
  useEffect(() => {
    if (!token) return;

    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${API}/dashboard/addresses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) {
          setAddresses(data.addresses);
          if (data.addresses.length > 0)
            setSelectedAddress(data.addresses[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch addresses:", err);
      }
    };

    fetchAddresses();
  }, [token, API]);

  const handlePayment = async () => {
    if (!token) return alert("You must be logged in");
    if (!selectedAddress) return alert("Select a shipping address");

    try {
      const res = await fetch(`${API}/payment/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
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
        if (paymentMethod === "BANK_TRANSFER") {
          setMessage(
            `Bank transfer initiated. Follow instructions: ${data.details}`
          );
        } else {
          window.location.href = data.paymentUrl;
        }
      } else {
        setMessage(data.error || "Payment failed, try again.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Payment failed, try again.");
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!token) return;

    const formData = new FormData(e.target);
    const newAddress = Object.fromEntries(formData.entries());

    try {
      const res = await fetch(`${API}/dashboard/addresses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAddress),
      });

      const data = await res.json();
      if (data.success) {
        setAddresses((prev) => [data.address, ...prev]);
        setSelectedAddress(data.address.id);
        setShowForm(false);
        e.target.reset();
      }
    } catch (err) {
      console.error("Failed to add address:", err);
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

          <button
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                setTimeout(
                  () => formRef.current?.scrollIntoView({ behavior: "smooth" }),
                  100
                );
              }
            }}
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            {showForm ? "Cancel" : "Add New Address"}
          </button>

          {/* Add Address Form */}
          <div
            ref={formRef}
            className={`overflow-hidden transition-all duration-300 ${
              showForm ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <form onSubmit={handleAddAddress} className="mb-4 space-y-2">
              <input
                name="label"
                placeholder="Label (Home, Work)"
                className="w-full p-2 border rounded"
                required
              />
              <input
                name="street"
                placeholder="Street"
                className="w-full p-2 border rounded"
                required
              />
              <input
                name="city"
                placeholder="City"
                className="w-full p-2 border rounded"
                required
              />
              <input
                name="state"
                placeholder="State"
                className="w-full p-2 border rounded"
                required
              />
              <input
                name="postal"
                placeholder="Postal Code"
                className="w-full p-2 border rounded"
                required
              />
              <input
                name="country"
                placeholder="Country"
                className="w-full p-2 border rounded"
                required
              />
              <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition w-full">
                Save Address
              </button>
            </form>
          </div>

          {/* Address List */}
          {addresses.length === 0 ? (
            <p>No addresses found. Add one above.</p>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex flex-col mb-2 p-2 border rounded"
              >
                <div className="flex items-center">
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
                {addr.estimatedDelivery && (
                  <p className="text-sm text-gray-600 ml-6">
                    Estimated Delivery: {addr.estimatedDelivery}
                  </p>
                )}
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

          {paymentMethod === "BANK_TRANSFER" && (
            <div className="mt-4 p-4 border rounded bg-gray-50">
              <p>Please make a transfer to the following account:</p>
              <p className="font-semibold">Bank: Zenith Bank</p>
              <p>Account Number: 1234567890</p>
              <p>Account Name: Handmade Co.</p>
              <p>
                After transferring, upload your proof of payment or notify us.
              </p>
            </div>
          )}

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
