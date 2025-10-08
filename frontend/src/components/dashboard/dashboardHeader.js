"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Menu, Bell } from "lucide-react";
import Image from "next/image";
import { useAuth } from "../../context/AuthContext";

export default function DashboardHeader({ setSidebarOpen }) {
  const { user } = useAuth();
  const router = useRouter();

  // // Redirect guests to login
  // useEffect(() => {
  //   if (!user) {
  //     router.push("/auth/login");
  //   }
  // }, [user, router]);

  // Construct avatar URL
  const avatarUrl = user?.profileImage
    ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${user.profileImage}`
    : "/images/avatar.jpg";
    
console.log("Avatar URL:", avatarUrl);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-sm">
      {/* Mobile menu button */}
      <button
        className="md:hidden text-gray-600 hover:text-blue-600"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu size={22} />
      </button>

      {/* Greeting */}
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          Hey, {user?.name || "Guest"} 👋
        </h1>
        <p className="text-sm text-gray-500">Welcome back to your dashboard.</p>
      </div>

      {/* Notifications + Avatar */}
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-600 hover:text-blue-600">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3">
          <Image
            src={avatarUrl}
            alt={user?.name || "User Avatar"}
            width={36}
            height={36}
            className="rounded-full object-cover"
          />
          <div className="hidden md:flex flex-col text-sm text-gray-700">
            <span className="font-medium">{user?.role || "Customer"}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
