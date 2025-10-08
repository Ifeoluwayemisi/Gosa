"use client";

import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function CompleteProfilePage() {
  const { user, token, login } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState("/images/avatar.jpg");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Pre-fill form with user data
  useEffect(() => {
    if (user) {
      const [street = "", city = "", state = "", country = "", postal = ""] = (
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

  // Update image preview
  useEffect(() => {
    if (file) setPreviewSrc(URL.createObjectURL(file));
    else if (user?.profileImage)
      setPreviewSrc(`${process.env.NEXT_PUBLIC_API_URL}${user.profileImage}`);
    else setPreviewSrc("/images/avatar.jpg");
  }, [file, user]);

  // Handle file input with toast
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImageLoaded(false);

    const toastId = toast.loading("Uploading avatar... ⏳");

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewSrc(reader.result);
      toast.success("Avatar ready! ✅", { id: toastId });
    };
    reader.onerror = () => {
      toast.error("Failed to load image 😢", { id: toastId });
    };
    reader.readAsDataURL(selectedFile);
  };

  // Submit form
  const onSubmit = async (data) => {
    const toastId = toast.loading("Saving profile... ⏳");
    try {
      setLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("phone", data.phone);
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

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/user/complete-profile`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const result = await res.json();
      if (!res.ok)
        throw new Error(result.error || "Failed to complete profile");

      login(token, result.user);
      toast.success("Profile updated successfully! ✅", { id: toastId });
      router.push("/"); // redirect after success
    } catch (err) {
      console.error("Complete profile error:", err);
      setMessage(err.message);
      toast.error(err.message || "Something went wrong 😢", { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 px-4">
      {/* Toast container */}
      <Toaster position="top-right" />

      <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-lg w-full max-w-lg border border-gray-100">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Complete Your Profile
        </h2>

        {message && (
          <p className="mb-4 text-center text-red-500 font-medium">{message}</p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Profile Image */}
          <div className="flex flex-col items-center">
            <label className="block text-gray-700 mb-2 font-medium">
              Profile Image
            </label>
            <div className="relative group">
              {!previewSrc ? (
                <div className="w-28 h-28 rounded-full bg-gray-200 animate-pulse"></div>
              ) : (
                <div className="relative">
                  {!imageLoaded && (
                    <div className="absolute inset-0 w-28 h-28 rounded-full bg-gray-200 animate-pulse"></div>
                  )}
                  <img
                    src={previewSrc}
                    alt="Profile Preview"
                    onLoad={() => setImageLoaded(true)}
                    className={`w-28 h-28 rounded-full object-cover border-2 border-gray-200 shadow-sm transition-all duration-300 ${
                      !imageLoaded ? "opacity-0" : "opacity-100"
                    }`}
                  />
                </div>
              )}

              <label
                htmlFor="fileInput"
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-all duration-300"
              >
                <span className="text-white text-sm font-semibold">Change</span>
              </label>

              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {file && (
              <p className="mt-2 text-xs text-gray-500">
                {file.name} ({Math.round(file.size / 1024)} KB)
              </p>
            )}
          </div>

          {/* Form Fields */}
          {[
            { label: "Full Name", name: "name", type: "text" },
            { label: "Phone", name: "phone", type: "text" },
            { label: "Street", name: "street", type: "text" },
            { label: "City", name: "city", type: "text" },
            { label: "State", name: "state", type: "text" },
            { label: "Postal Code", name: "postal", type: "text" },
            { label: "Country", name: "country", type: "text" },
          ].map((field) => (
            <div key={field.name}>
              <label className="block text-gray-700 font-medium">
                {field.label}
              </label>
              <input
                type={field.type}
                {...register(field.name, {
                  required: `${field.label} is required`,
                })}
                className="w-full p-2.5 border border-gray-200 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              />
              {errors[field.name] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[field.name].message}
                </p>
              )}
            </div>
          ))}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg shadow-md transition-all duration-300"
          >
            {loading ? "Saving..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
