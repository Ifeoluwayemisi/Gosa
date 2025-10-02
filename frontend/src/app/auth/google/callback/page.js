"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    // decode user info from token or fetch user
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((user) => {
        login(token, user);
        if (!user.phone || !user.address) {
          router.push("/complete-profile");
        } else {
          router.push("/");
        }
      })
      .catch(() => router.push("/auth/login"));
  }, [login, router]);

  return <p className="text-center mt-20">Logging you in...</p>;
}
