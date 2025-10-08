"use client";

import { useEffect, useState } from "react";
import { fetcher } from "../../../../utils/api";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";

export default function OrdersPage() {
  const { token, user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    if (!token) return;

    const fetchOrders = async () => {
      try {
        const data = await fetcher(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/orders`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setOrders(data);
        setFilteredOrders(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  const handleCancel = async (orderId) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      await fetcher(
        `${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/cancel`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "Cancelled" } : o))
      );
      setFilteredOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "Cancelled" } : o))
      );
    } catch (err) {
      console.error(err);
      alert("Failed to cancel order");
    }
  };

  // 🔍 Handle filter change
  const handleFilterChange = (value) => {
    setFilter(value);
    if (value === "All") setFilteredOrders(orders);
    else setFilteredOrders(orders.filter((o) => o.status === value));
  };

  // ✅ Status badge helper
  const getStatusBadge = (status) => {
    const colors = {
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      Delivered: "bg-green-100 text-green-800 border-green-200",
      Cancelled: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          colors[status] || "bg-gray-100 text-gray-600 border-gray-200"
        }`}
      >
        {status}
      </span>
    );
  };

  if (loading)
    return (
      <div className="text-center py-10 text-gray-600">Loading orders...</div>
    );
  if (error)
    return (
      <div className="text-center text-red-500 font-medium mt-10">{error}</div>
    );
  if (orders.length === 0)
    return (
      <div className="text-center text-gray-500 mt-10">
        <p>No orders found 🛒</p>
        <Link
          href="/shop"
          className="text-blue-600 hover:underline mt-2 inline-block"
        >
          Start Shopping
        </Link>
      </div>
    );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Orders</h1>
          <p className="text-gray-500 text-sm">
            Active account • {user?.role || "Customer"} •{" "}
            <span className="text-green-600 font-semibold">Active</span>
          </p>
        </div>

        {/* 🔽 Filter dropdown */}
        <div className="flex gap-3 items-center">
          <label htmlFor="statusFilter" className="text-sm text-gray-600">
            Filter by:
          </label>
          <select
            id="statusFilter"
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid gap-5">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition p-5 flex flex-col md:flex-row justify-between md:items-center"
          >
            <div className="space-y-1">
              <p className="font-semibold text-gray-800">Order #{order.id}</p>
              <p className="text-gray-600 text-sm">
                Total: ₦{order.total.toFixed(2)}
              </p>
              <p className="text-gray-600 text-sm">
                Items: {order.items.map((i) => i.product.name).join(", ")}
              </p>
            </div>

            <div className="flex items-center gap-3 mt-3 md:mt-0">
              {getStatusBadge(order.status)}
              <Link
                href={`/dashboard/orders/${order.id}`}
                className="bg-blue-600 text-white px-4 py-1.5 text-sm rounded-md hover:bg-blue-700 transition"
              >
                View
              </Link>
              {order.status === "Pending" && (
                <button
                  onClick={() => handleCancel(order.id)}
                  className="bg-red-600 text-white px-4 py-1.5 text-sm rounded-md hover:bg-red-700 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
