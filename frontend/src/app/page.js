"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

// Dummy data (replace with API fetch later)
const categories = [
  { id: 1, name: "Bags", img: "/images/Bags.jpg" },
  { id: 2, name: "Shoes", img: "/images/Shoes.jpg" },
  { id: 3, name: "Accessories", img: "/images/Accessories.jpg" },
];

const products = [
  { id: 1, name: "Leather Tote", price: 120, img: "/images/Leather_Tote.jpg" },
  {
    id: 2,
    name: "Handmade Sandals",
    price: 80,
    img: "/images/Handmade_Sandals.jpg",
  },
  { id: 3, name: "Mini Backpack", price: 60, img: "/images/MiniBacks.jpg" },
  { id: 4, name: "Ankle Boots", price: 150, img: "/images/Ankle_boots.jpg" },
  { id: 5, name: "School Bags", price: 200, img: "/images/School_bags.jpg" },
];

export default function HomePage() {
  const [cart, setCart] = useState([]);

  // Programmatic cart handler
  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
    alert(`${product.name} added to cart!`);
  };

  return (
    <div className="space-y-24">
      {/* Hero Section with Photo */}
      <section className="relative h-[500px] md:h-[600px]">
        <Image
          src="/images/hero.jpg"
          alt="Hero"
          layout="fill"
          objectFit="cover"
          className="absolute inset-0 z-0"
        />
        <div className="relative z-10 text-white text-center flex flex-col items-center justify-center h-full bg-black/30">
          <h1 className="text-4xl md:text-6xl font-bold">
            Handcrafted Bags & Shoes
          </h1>
          <p className="text-lg md:text-2xl mt-4">
            Unique designs, made with love and premium materials.
          </p>
          <Link
            href="/shop"
            className="bg-white text-purple-600 font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition mt-6"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/shop?category=${cat.id}`}>
              <div className="relative group overflow-hidden rounded-lg shadow-md cursor-pointer">
                <Image
                  src={cat.img}
                  alt={cat.name}
                  width={400}
                  height={400}
                  className="w-full h-64 object-cover transform group-hover:scale-105 transition duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                  <h3 className="text-white text-2xl font-bold">{cat.name}</h3>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Best Selling Products */}
      <section className="max-w-6xl mx-auto px-6">
        <h2 className="text-3xl font-bold mb-8 text-center">
          Best Selling Products
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:scale-105 transform transition duration-300"
            >
              <Image
                src={p.img}
                alt={p.name}
                width={400}
                height={400}
                className="w-full h-64 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="text-purple-600 font-bold">${p.price}</p>
                <button
                  onClick={() => addToCart(p)}
                  className="mt-2 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="bg-yellow-100 text-yellow-900 py-12 text-center rounded-lg max-w-4xl mx-auto px-6">
        <h2 className="text-2xl font-bold mb-2">Special Offer!</h2>
        <p className="mb-4">
          Get a 10% discount after your first 10 purchases. Check your email for
          your coupon code.
        </p>
        <Link
          href="/shop"
          className="bg-yellow-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-600 transition"
        >
          Start Shopping
        </Link>
      </section>

      {/* Brand Story / Trust */}
      <section className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-xl mb-2">Handmade Quality</h3>
          <p>Every product is crafted by skilled artisans.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-xl mb-2">Premium Materials</h3>
          <p>We source only the finest materials for durability and style.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="font-bold text-xl mb-2">Fast Shipping</h3>
          <p>Reliable delivery straight to your doorstep.</p>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-gray-50 py-12 text-center rounded-lg">
        <h2 className="text-2xl font-bold mb-4">
          Subscribe for Updates & Coupons
        </h2>
        <p className="mb-6">
          Get notified about new arrivals, discounts, and special offers.
        </p>
        <form className="flex flex-col sm:flex-row justify-center gap-4 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-600 flex-1"
          />
          <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
}
