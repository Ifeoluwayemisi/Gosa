import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/cartContext";
import Link from "next/link";
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
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
