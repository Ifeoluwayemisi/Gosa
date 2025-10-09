"use client";
import { useAuth } from "../../../context/AuthContext";
import Link from "next/link";
import Image from "next/image";

export default function ProfileOverviewPage() {
  const { user } = useAuth();
  const avatarUrl = user?.profileImage
    ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${user.profileImage}`
    : "/images/avatar.jpg";

  if (!user) return <p className="text-center mt-10">Loading profile...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
          <div className="relative">
            <Image
              src={avatarUrl}
              alt={user?.name || "User Avatar"}
              width={120}
              height={120}
              className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
            />
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-2xl font-semibold text-gray-900">
              {user.name}
            </h2>
            <p className="text-gray-600 mt-1">{user.email}</p>
            <p className="text-gray-600">
              {user.phone ? user.phone : "No phone number added"}
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

        {/* Divider */}
        <hr className="my-6 border-gray-200" />

        {/* Info Grid */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 font-medium">User ID</p>
            <p className="text-gray-800 font-semibold break-all">{user.id}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-500 font-medium">
              <span className="font-medium">{user?.role || "Customer"}</span> Since
            </p>
            <p className="text-gray-800 font-semibold">
              {new Date(user.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
