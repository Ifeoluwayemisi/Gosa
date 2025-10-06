"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import { fetcher } from "../../../../utils/api";

export default function CompleteProfilePage() {
  const { user, token, login } = useAuth();
  const [file, setFile] = useState(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      // prefill fields with existing user data if any
      const [street = "", city = "", state = "", country="", postal = ""] = (
        user.address || ""
      ).split(", ");
      reset({
        name: user.name || "",
        phone: user.phone || "",
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
      setMessage("");

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);

      // send addresses as JSON string
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

      if (file) formData.append("profileImage", file);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/complete-profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Failed to complete profile");
      }

      login(token, result.user);
      router.push("/");
    } catch (err) {
      console.error("Complete profile error:", err);
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Complete Your Profile</h2>
        {message && <p className="mb-4 text-red-500">{message}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-700">Full Name</label>
            <input
              type="text"
              {...register("name", { required: "Full name is required" })}
              className="w-full p-2 border rounded mt-1"
            />
            {errors.name && (
              <p className="text-red-500">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Phone</label>
            <input
              type="text"
              {...register("phone", { required: "Phone is required" })}
              className="w-full p-2 border rounded mt-1"
            />
            {errors.phone && (
              <p className="text-red-500">{errors.phone.message}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700">Profile Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full mt-1"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700">Street</label>
            <input
              type="text"
              {...register("street", { required: "Street is required" })}
              className="w-full p-2 border rounded mt-1"
            />
            {errors.street && (
              <p className="text-red-500">{errors.street.message}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">City</label>
            <input
              type="text"
              {...register("city", { required: "City is required" })}
              className="w-full p-2 border rounded mt-1"
            />
            {errors.city && (
              <p className="text-red-500">{errors.city.message}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">State</label>
            <input
              type="text"
              {...register("state", { required: "State is required" })}
              className="w-full p-2 border rounded mt-1"
            />
            {errors.state && (
              <p className="text-red-500">{errors.state.message}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Postal Code</label>
            <input
              type="text"
              {...register("postal", { required: "Postal code is required" })}
              className="w-full p-2 border rounded mt-1"
            />
            {errors.postal && (
              <p className="text-red-500">{errors.postal.message}</p>
            )}
          </div>
          <div>
            <label className="block text-gray-700">Country</label>
            <input
              type="text"
              {...register("country", { required: "Country is required" })}
              className="w-full p-2 border rounded mt-1"
            />
            {errors.country && (
              <p className="text-red-500">{errors.country.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {loading ? "Saving..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
