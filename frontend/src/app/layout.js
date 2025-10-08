import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/cartContext";
import { UserProvider } from "@/context/UsersContext";
import Link from "next/link";
import { Toaster } from "react-hot-toast"; // ✅ add this import
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="true"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col">
        <AuthProvider>
          <CartProvider>
            <UserProvider>
              {/* Navbar */}
              <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
                <Link href="/" className="text-xl font-bold text-blue-600">
                  GOSA
                </Link>
                <div className="flex space-x-6">
                  <Link href="/shop">Shop</Link>
                  <Link href="/cart">Cart</Link>
                  <Link href="/orders">Orders</Link>
                  <Link href="/profile">Profile</Link>
                </div>
              </nav>

              {/* Page Content */}
              <main className="flex-1 p-6">{children}</main>

              {/* Footer */}
              <footer className="bg-gray-100 text-center py-4 text-sm text-gray-600">
                &copy; {new Date().getFullYear()} GOSA. All rights reserved.
              </footer>

              {/* ✅ Toast Notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#ffffff", // pure white bg
                    color: "#1e3a8a", // deep royal blue text
                    border: "1px solid #facc15", // gold border accent
                    borderRadius: "12px",
                    padding: "12px 16px",
                    fontWeight: "600",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  },
                  success: {
                    iconTheme: {
                      primary: "#f59e0b", // gold icon
                      secondary: "#ffffff", // white inside
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#ef4444", // red icon
                      secondary: "#ffffff",
                    },
                  },
                }}
              />
            </UserProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}