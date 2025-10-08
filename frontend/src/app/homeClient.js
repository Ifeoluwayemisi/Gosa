"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import HeroCarousel from "../components/heroCarousel";
import { fetcher } from "../../utils/api";
import { useCart } from "../context/cartContext";
import { useAuth } from "../context/AuthContext";
import { Heart } from "lucide-react";
import toast from "react-hot-toast";

export default function HomeClient({
  initialCategories = [],
  initialProducts = [],
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState([]);

  const { addToCart } = useCart();
  const { token } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const cats = await fetcher("/categories");
        const prods = await fetcher("/products");
        setCategories(cats);
        setProducts(prods);

        if (token) {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/wishlist`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = await res.json();
          setWishlist(data.wishlist?.map((item) => item.productId) || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token]);

  const getImageSrc = (img) =>
    !img ? "/images/Bags.jpg" : img.startsWith("http") ? img : img;

  const toggleWishlist = async (productId) => {
    if (!token) return toast.error("Please login to add to wishlist!");

    const inWishlist = wishlist.includes(productId);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/wishlist/${productId}`,
        {
          method: inWishlist ? "DELETE" : "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (data.success) {
        setWishlist(
          inWishlist
            ? wishlist.filter((id) => id !== productId)
            : [...wishlist, productId]
        );
        toast.success(
          inWishlist ? "Removed from wishlist ❌" : "Added to wishlist ❤️"
        );
      } else {
        toast.error(data.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong 😢");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-[500px]">
        <p className="text-xl font-semibold">Loading products...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-[500px] text-red-500">
        {error}
      </div>
    );

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative h-[500px] md:h-[600px]">
        <HeroCarousel />
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/shop?category=${cat.id}`}>
              <div className="relative group overflow-hidden rounded-lg shadow-md cursor-pointer">
                <Image
                  src={getImageSrc(cat.img)}
                  alt={cat.name}
                  width={400}
                  height={400}
                  className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-50 transition duration-300">
                  <h3 className="text-white text-2xl font-bold">{cat.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Best Selling Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((p) => (
            <div
              key={p.id}
              className="relative bg-white rounded-lg shadow-md overflow-hidden hover:scale-105 transform transition duration-300"
            >
              <Image
                src={getImageSrc(p.img)}
                alt={p.name}
                width={400}
                height={400}
                className="w-full h-64 object-cover"
              />

              {/* Wishlist Heart */}
              <button
                onClick={() => toggleWishlist(p.id)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow hover:bg-gray-100 transition transform hover:scale-110"
              >
                <Heart
                  className={`w-6 h-6 ${
                    wishlist.includes(p.id)
                      ? "text-red-500"
                      : "text-gray-500 hover:text-red-500 transition-colors"
                  }`}
                />
              </button>

              <div className="p-4">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-purple-600 font-bold">₦{p.price}</p>
                <button
                  onClick={() => addToCart(p, 1)}
                  className="mt-2 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition cursor-pointer"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
