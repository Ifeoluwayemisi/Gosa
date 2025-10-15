"use client";

import { useState } from "react";

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirm)
      return setMessage("Fill all fields");
    if (newPassword !== confirm) return setMessage("Passwords do not match");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Password changed successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirm("");
      } else {
        setMessage(data.message || "Failed to change password");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error occurred. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Security Settings</h1>

      <form
        onSubmit={handlePasswordChange}
        className="space-y-4 border p-4 rounded"
      >
        <h2 className="text-xl font-semibold mb-2">Change Password</h2>

        <input
          type="password"
          placeholder="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Updating..." : "Update Password"}
        </button>

        {message && <p className="mt-2 text-red-600">{message}</p>}
      </form>

      <div className="mt-8 border p-4 rounded">
        <h2 className="text-xl font-semibold mb-2">Forgot Password?</h2>
        <p>
          Can’t remember your current password?{" "}
          <a href="/auth/forgot-password" className="text-blue-600 hover:underline">
            Reset it here
          </a>
          .
        </p>
      </div>
    </div>
  );
}
