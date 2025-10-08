"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";
import toast from "react-hot-toast";

export default function WishlistPage() {
  const { token } = useAuth();
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🛒 Add product to cart
  const addToCart = async (productId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/cart/${productId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) toast.success("Added to cart ✅");
      else toast.error(data.message || "Could not add to cart");
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Something went wrong");
    }
  };

  // Fetch wishlist
  useEffect(() => {
    if (!token) return;

    const fetchWishlist = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setWishlist(data.wishlist || []);
      } catch (err) {
        console.error("Error fetching wishlist:", err);
        toast.error("Could not load wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [token]);

  // Remove item from wishlist
  const removeItem = async (productId) => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wishlist/${productId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setWishlist(wishlist.filter((item) => item.productId !== productId));
      toast.success("Removed from wishlist ❌");
    } catch (err) {
      console.error("Error removing wishlist item:", err);
      toast.error("Could not remove item");
    }
  };

  // 🕐 Loading state
  if (loading)
    return (
      <div className="p-6 text-center text-gray-500 animate-pulse">
        Loading your wishlist...
      </div>
    );

  // Empty state
  if (!wishlist.length)
    return (
      <div className="p-6 text-center text-gray-500">
        No items in your wishlist yet 😢
      </div>
    );

  // 💅 Wishlist Grid
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Your Wishlist</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {wishlist.map((item) => (
          <div
            key={item.id}
            className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition"
          >
            {item.product ? (
              <>
                <img
                  src={item.product.image || "/placeholder.jpg"}
                  alt={item.product.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h2 className="text-lg font-semibold mb-2">
                    {item.product.name}
                  </h2>
                  <p className="text-gray-600 mb-4">
                    ₦{item.product.price?.toLocaleString() ?? "N/A"}
                  </p>
                  <div className="flex justify-between items-center">
                    <Link
                      href={`/product/${item.product.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                    <div className="flex gap-3">
                      <button
                        onClick={() => addToCart(item.product.id)}
                        className="text-green-600 hover:underline"
                      >
                        Add to Cart 🛒
                      </button>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-red-600 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-4 text-gray-400">
                Product no longer available
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
