"use client";

import { useEffect, useState } from "react";
import { fetcher } from "../../../utils/api";
import { useAuth } from "../../context/AuthContext";

export default function DashboardHome() {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    const fetchDashboardData = async () => {
      try {
        const [orders, coupons, activity] = await Promise.all([
          fetcher("/dashboard/orders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetcher("/dashboard/coupons", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetcher("/dashboard/activity", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);

        setStats({
          totalOrders: orders.length,
          totalSpent,
          activeCoupons: coupons.length,
          recentActivity: activity.slice(0, 5),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) return <p>Loading dashboard...</p>;
  if (!stats) return <p>Failed to load dashboard data.</p>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome Back 👋</h1>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Orders" value={stats.totalOrders} />
        <StatCard
          title="Total Spent"
          value={`₦${stats.totalSpent.toFixed(2)}`}
        />
        <StatCard title="Active Coupons" value={stats.activeCoupons} />
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {stats.recentActivity.length === 0 ? (
          <p>No recent activity.</p>
        ) : (
          <ul className="divide-y divide-gray-200">
            {stats.recentActivity.map((act) => (
              <li key={act.id} className="py-2">
                <p className="font-medium">{act.action}</p>
                <p className="text-sm text-gray-500">{act.details}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow text-center">
      <h3 className="text-gray-500">{title}</h3>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

// export default function DashboardPage() {
//   return (
//     <div>
//       <h2 className="text-3xl font-semibold mb-6">Overview</h2>

//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-gray-600">Total Orders</h3>
//           <p className="text-2xl font-bold mt-2">12</p>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-gray-600">Wishlist Items</h3>
//           <p className="text-2xl font-bold mt-2">5</p>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-gray-600">Total Spent</h3>
//           <p className="text-2xl font-bold mt-2">₦154,200</p>
//         </div>

//         <div className="bg-white p-6 rounded-lg shadow">
//           <h3 className="text-gray-600">Loyalty Points</h3>
//           <p className="text-2xl font-bold mt-2">340 pts</p>
//         </div>
//       </div>

//       <div className="mt-10">
//         <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
//         <div className="bg-white shadow rounded-lg p-4">
//           <p className="text-gray-500">You have 2 pending orders.</p>
//         </div>
//       </div>
//     </div>
//   );
// }
