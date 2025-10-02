"use client";
import { useCart } from "../../context/cartContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // <-- import useRouter

export default function CartPage() {
  const router = useRouter(); // <-- initialize router
  const { cartItems, totals, updateQuantity, removeFromCart } = useCart();
  const [cartTotals, setCartTotals] = useState(totals);
  const [couponCode, setCouponCode] = useState("");
  const [message, setMessage] = useState("");

  // Sync cartTotals when cartItems or totals change
  useEffect(() => {
    setCartTotals(totals);
  }, [totals, cartItems]);

  const applyCoupon = async () => {
    if (!couponCode) return setMessage("Please enter a coupon code");

    try {
      const res = await fetch("/api/coupon/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ code: couponCode, userId: 1, cartItems }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage(`Coupon applied! Discount: ₦${data.discount.toFixed(2)}`);
        setCartTotals({
          ...totals,
          discount: data.discount,
          grandTotal:
            totals.subtotal + totals.tax + totals.shipping - data.discount,
        });
      } else {
        setMessage(data.error || "Invalid coupon code");
      }
    } catch (err) {
      console.error(err);
      setMessage("Failed to apply coupon. Try again.");
    }
  };

  const goToCheckout = () => {
    router.push("/checkout"); // <-- Navigate to checkout page
  };

  if (cartItems.length === 0) {
    return <h2 className="text-center mt-20">Your cart is empty 😢</h2>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Your Cart</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cart Items */}
        <div>
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="flex justify-between items-center border-b py-4"
            >
              <div>
                <h3 className="font-semibold">{item.name}</h3>
                <p>₦{item.price}</p>
                <div className="flex items-center gap-2 mt-1">
                  <button
                    className="px-2 bg-gray-300 rounded"
                    onClick={() =>
                      item.quantity > 1 &&
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    className="px-2 bg-gray-300 rounded"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>
              </div>
              <button
                className="text-red-600"
                onClick={() => removeFromCart(item.productId)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="border p-4 rounded">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <p>Subtotal: ₦{cartTotals.subtotal.toFixed(2)}</p>
          <p>Tax: ₦{cartTotals.tax.toFixed(2)}</p>
          <p>Shipping: ₦{cartTotals.shipping.toFixed(2)}</p>
          <p>Discount: ₦{cartTotals.discount.toFixed(2)}</p>
          <hr className="my-2" />
          <p className="font-bold text-lg">
            Grand Total: ₦{cartTotals.grandTotal.toFixed(2)}
          </p>

          <div className="mt-4">
            <input
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="border p-2 w-full rounded mb-2"
            />
            <button
              onClick={applyCoupon}
              className="bg-green-600 text-white w-full py-2 rounded"
            >
              Apply Coupon
            </button>
            {message && <p className="text-red-500 mt-2">{message}</p>}
          </div>

          <button
            onClick={goToCheckout} // <-- Add this
            className="bg-blue-600 text-white w-full py-2 rounded mt-4"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
