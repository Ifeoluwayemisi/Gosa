"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import {
  Home,
  Package,
  Heart,
  CreditCard,
  MapPin,
  Bell,
  User,
  LogOut,
  X,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: Home },
  { href: "/dashboard/orders", label: "Orders", icon: Package },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart },
  { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
  { href: "/dashboard/addresses", label: "Addresses", icon: MapPin },
  { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardSidebar({ sidebarOpen, setSidebarOpen }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      className={`${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } fixed md:static md:translate-x-0 w-64 bg-white shadow-lg z-40 h-full transition-transform duration-300 flex flex-col`}
    >
      {/* Header (User Info + Close Button for mobile) */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-800 truncate">
            {user?.name || "Guest User"}
          </p>
          <p className="text-xs text-gray-500">{user?.email || "—"}</p>
        </div>

        <button
          className="md:hidden text-gray-600 hover:text-gray-900"
          onClick={() => setSidebarOpen(false)}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="mt-4 flex-1 overflow-y-auto space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-6 py-3 text-sm font-medium rounded-md transition ${
                active
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-6 py-3 text-sm font-medium text-red-600 hover:bg-red-50 border-t mt-auto"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
