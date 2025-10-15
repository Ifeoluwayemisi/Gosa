"use client";

import { useForm } from "react-hook-form";
import { useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    setMessage("");
    const toastId = toast.loading("Logging in... ⏳");

    try {
      setLoading(true);

      // 🔹 Step 1: Attempt login
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const text = await res.text();
      let result;
      try {
        result = JSON.parse(text);
      } catch {
        console.error("Unexpected response:", text.slice(0, 200));
        throw new Error("Invalid server response (not JSON). Check API URL.");
      }

      if (!res.ok) throw new Error(result.message || "Login failed!");

      // 🔹 Step 2: Save token and user immediately
      login(result.token, result.user);

      // 🔹 Step 3: Delay briefly before fetching profile (backend might still be finalizing)
      await new Promise((resolve) => setTimeout(resolve, 500));

      // 🔹 Step 4: Fetch fresh profile
      const userRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/me`,
        {
          headers: {
            Authorization: `Bearer ${result.token}`,
          },
        }
      );

      const userText = await userRes.text();
      let freshUser;
      try {
        freshUser = JSON.parse(userText);
      } catch {
        console.error(
          "Profile fetch returned non-JSON:",
          userText.slice(0, 200)
        );
        throw new Error("Failed to load profile (invalid JSON).");
      }

      if (!userRes.ok) {
        throw new Error(freshUser.message || "Failed to fetch user profile.");
      }

      toast.success("Logged in successfully! ✅", { id: toastId });

      // 🔹 Step 5: Auto-redirect based on profile completeness
      const isProfileComplete =
        freshUser.name && freshUser.phone && freshUser.addresses?.length > 0;
        
        console.log("Fetched fresh user:", freshUser);

      if (!isProfileComplete) {
        router.push("/auth/complete-profile");
      } else {
        router.push("/"); // or "/dashboard"
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage(err.message || "Login failed!");
      toast.error(err.message || "Login failed 😢", { id: toastId });
    } finally {
      setLoading(false);
    }
  };



  const handleGoogleLogin = () => {
    toast.loading("Redirecting to Google... ⏳");
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Toaster position="top-right" />
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>

        {message && <p className="mb-4 text-center text-red-500">{message}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              {...register("email", { required: "Email is required" })}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.email && (
              <p className="text-red-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          <div className="relative">
            <label className="block text-gray-700">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password", { required: "Password is required" })}
              className="w-full p-2 border rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-[38px] text-gray-500"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
            {errors.password && (
              <p className="text-red-500 mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600 mb-2">Or login with</p>
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 text-gray-900 font-semibold py-2 px-4 rounded-2xl shadow hover:from-yellow-300 hover:to-yellow-400 transition disabled:opacity-50"
          >
            Google
          </button>
        </div>

        <div className="mt-4 text-center text-gray-600">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-blue-600 hover:underline">
            Sign Up
          </Link>
          <br />
          <Link
            href="/auth/forgot-password"
            className="text-blue-600 hover:underline mt-1 inline-block"
          >
            Forgot password?
          </Link>
        </div>
      </div>
    </div>
  );
}
