// context/cartContext.jsx
"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [totals, setTotals] = useState({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    discount: 0,
    grandTotal: 0,
  });

  useEffect(() => {
    calculateTotals();
  }, [cartItems, coupon]);

  const addToCart = (product) => {
    const exists = cartItems.find((item) => item.productId === product.id);
    if (exists) {
      setCartItems(
        cartItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems(
      cartItems.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  const applyCoupon = (couponData, discount) => {
    setCoupon({ ...couponData, discount });
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const tax = subtotal * 0.075; // example 7.5% tax
    const shipping = subtotal > 5000 ? 0 : 500; // free shipping over 5000
    const discount = coupon ? coupon.discount : 0;
    const grandTotal = subtotal + tax + shipping - discount;

    setTotals({ subtotal, tax, shipping, discount, grandTotal });
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totals,
        coupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        applyCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
