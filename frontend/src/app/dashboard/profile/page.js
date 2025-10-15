"use client";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";
import Image from "next/image";

export default function ProfileOverviewPage() {
  const { user, loading } = useAuth();

  // Skeleton loader
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 animate-pulse">
        <div className="h-10 bg-gray-300 rounded w-1/4 mb-8"></div>

        <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
            <div className="w-32 h-32 rounded-full bg-gray-300"></div>

            <div className="flex-1 space-y-3 mt-4 sm:mt-0">
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-1/3"></div>
              <div className="h-4 bg-gray-300 rounded w-1/4"></div>
              <div className="h-10 bg-gray-300 rounded w-32 mt-4"></div>
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="h-16 bg-gray-300 rounded-lg"></div>
            <div className="h-16 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <p className="text-center mt-10 text-red-500">No user data found.</p>
    );
  }

  const avatarUrl = user.profileImage
    ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${user.profileImage}`
    : "/images/avatar.jpg";

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-4xl font-extrabold mb-8 mt-0.5 text-gray-800">My Profile</h1>

      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <div className="relative">
            <Image
              src={avatarUrl}
              alt={user.name || "User Avatar"}
              width={120}
              height={120}
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
            />
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold text-gray-900">
              {user.name || "Unnamed User"}
            </h2>
            <p className="text-gray-600 mt-1">{user.email || "-"}</p>
            <p className="text-gray-600">
              {user.phone || "No phone number added"}
            </p>

            <div className="mt-4">
              <Link
                href="/dashboard/profile/edit"
                className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-200"
              >
                Edit Profile
              </Link>
            </div>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 font-medium">User ID</p>
            <p className="text-gray-800 font-semibold break-all">
              {user.id || "-"}
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 font-medium">
              <span className="font-medium">{user.role || "Customer"}</span>{" "}
              SINCE
            </p>
            <p className="text-gray-800 font-semibold">
              {user.createdAt
                ? new Date(user.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
