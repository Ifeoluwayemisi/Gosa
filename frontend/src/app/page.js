import { fetcher } from "../../utils/api";
import HomeClient from "./homeClient";

export default async function HomePage() {
  let categories = [];
  let products = [];

  try {
    categories = await fetcher("/categories");
    products = await fetcher("/products");
  } catch (err) {
    console.error("Failed to fetch data:", err);
    // Optionally, you can return a fallback page or empty arrays
  }

  return (
    <>
      <HomeClient categories={categories} products={products} />

      {/* Newsletter Section */}
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
    </>
  );
}
