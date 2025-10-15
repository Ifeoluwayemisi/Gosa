"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) return setMessage("Fill all fields");
    if (password !== confirm) return setMessage("Passwords do not match");

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Password reset successful! Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.message || "Reset failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Reset failed");
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <p className="text-center mt-10">Invalid reset link</p>;

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
      {message && <p className="mt-3 text-center text-red-600">{message}</p>}
    </div>
  );
}