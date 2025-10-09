"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import { useForm } from "react-hook-form";
import { Camera, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

export default function DashboardProfilePage() {
  const { user, token, login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, watch } = useForm();

  // Prefill form with user data
  useEffect(() => {
    if (user) {
      const {
        street = "",
        city = "",
        state = "",
        country = "",
        postal = "",
      } = typeof user.addresses === "object" && user.addresses !== null
        ? user.addresses
        : {};

      reset({
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
        street,
        city,
        state,
        country,
        postal,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
      formData.append("email", data.email);

      // Addresses object
      formData.append(
        "addresses",
        JSON.stringify({
          street: data.street,
          city: data.city,
          state: data.state,
          country: data.country,
          postal: data.postal,
        })
      );

      if (data.profileImage?.[0]) {
        formData.append("profileImage", data.profileImage[0]);
      }

      const res = await fetch("/user/update-profile", {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const result = await res.json();

      if (result.success) {
        login(token, result.user);
        toast.success("Profile updated successfully ✅");

        setTimeout(() => {
          router.push("/dashboard/profile");
        }, 1500);
      } else {
        toast.error(result.error || "Failed to update profile ❌");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const previewImage = watch("profileImage")?.[0]
    ? URL.createObjectURL(watch("profileImage")[0])
    : user?.profileImage
    ? `${process.env.NEXT_PUBLIC_IMAGE_URL}${user.profileImage}`
    : "/images/avatar.jpg";

  return (
    <div className="relative max-w-4xl mx-auto py-12 px-6">
      <button
        onClick={() => router.back()}
        className="flex items-center text-sm font-medium text-gray-600 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-2 font-bold" /> Go Back
      </button>

      <h1 className="text-3xl font-bold mb-10 text-gray-800 text-center">
        Edit Profile
      </h1>

      <div className="bg-white rounded-2xl shadow-lg p-10 border border-gray-100">
        {/* Profile Image */}
        <div className="flex flex-col items-center mb-10">
          <div className="relative group">
            <img
              src={previewImage}
              alt="Profile Preview"
              className="w-36 h-36 rounded-full object-cover border-4 border-blue-100 shadow-sm transition-all duration-300 group-hover:scale-105"
            />
            <label
              htmlFor="profileImage"
              className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full cursor-pointer shadow-sm hover:bg-blue-700 transition-all duration-200 flex items-center justify-center"
              title="Change profile picture"
            >
              <Camera size={16} />
            </label>
          </div>
          <input
            type="file"
            id="profileImage"
            {...register("profileImage")}
            className="hidden"
          />
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid md:grid-cols-2 gap-6"
        >
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Full Name
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="Enter your full name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="Enter your email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Phone
            </label>
            <input
              type="text"
              {...register("phone")}
              placeholder="Enter your phone number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          {/* Address split fields */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Street
            </label>
            <input
              type="text"
              {...register("street")}
              placeholder="Street"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">City</label>
            <input
              type="text"
              {...register("city")}
              placeholder="City"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              State
            </label>
            <input
              type="text"
              {...register("state")}
              placeholder="State"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Country
            </label>
            <input
              type="text"
              {...register("country")}
              placeholder="Country"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Postal Code
            </label>
            <input
              type="text"
              {...register("postal")}
              placeholder="Postal Code"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>

          <div className="md:col-span-2 pt-4">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold shadow-sm transition-all duration-200 ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
            >
              {loading ? "Updating..." : "Update Profile"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
