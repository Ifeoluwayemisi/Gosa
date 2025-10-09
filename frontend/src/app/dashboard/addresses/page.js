"use client";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export default function DashboardAddressPage() {
  const { token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, handleSubmit, reset } = useForm();
  const newAddressRef = useRef(null);
  const [showForm, setShowForm] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    if (!token) return;
    fetchAddresses();
  }, [token]);

  const fetchAddresses = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/addresses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) setAddresses(data.addresses);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/addresses`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        }
      );
      const result = await res.json();
      if (result.success) {
        let updatedAddresses = result.address.isDefault
          ? [
              result.address,
              ...addresses.map((a) => ({ ...a, isDefault: false })),
            ]
          : [result.address, ...addresses];

        setAddresses(updatedAddresses);
        reset();
        toast.success("Address added ✅");

        setTimeout(() => {
          newAddressRef.current?.scrollIntoView({ behavior: "smooth" });
          newAddressRef.current?.classList.add("ring-4", "ring-yellow-300");
          setTimeout(() => {
            newAddressRef.current?.classList.remove(
              "ring-4",
              "ring-yellow-300"
            );
          }, 2000);
        }, 100);
      } else {
        toast.error("Failed to add address");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add address");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this address?")) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/addresses/${id}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        setAddresses((prev) => prev.filter((a) => a.id !== id));
        toast.success("Address deleted ✅");
      } else toast.error("Failed to delete address");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/dashboard/addresses/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ isDefault: true }),
        }
      );
      const result = await res.json();
      if (result.success) {
        setAddresses((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, isDefault: true } : { ...a, isDefault: false }
          )
        );
        toast.success("Default address updated ✅");
      } else toast.error("Failed to update default address");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update default address");
    }
  };

  if (loading) return <p className="p-6 text-gray-500">Loading addresses...</p>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">My Addresses</h1>

      {/* Toggle Form Button */}
      <button
        onClick={() => {
          setShowForm(!showForm);
          if (!showForm) {
            setTimeout(() => {
              formRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 100);
          }
        }}
        className="mb-6 bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition"
      >
        {showForm ? "Cancel" : "Add New Address"}
      </button>

      {/* Conditional Form */}
      <div
        ref={formRef}
        className={`overflow-hidden transition-all duration-300 ${
          showForm ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 mb-10 p-6 bg-white rounded-xl shadow-md border border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              {...register("label")}
              placeholder="Label (Home, Work)"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
            <input
              {...register("street")}
              placeholder="Street"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
            <input
              {...register("city")}
              placeholder="City"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
            <input
              {...register("state")}
              placeholder="State"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
            <input
              {...register("postal")}
              placeholder="Postal Code"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
            <input
              {...register("country")}
              placeholder="Country"
              className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("isDefault")}
              className="h-4 w-4 text-blue-600"
            />
            Set as default
          </label>
          <button className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700 transition">
            Add Address
          </button>
        </form>
      </div>

      {/* Address List with Estimated Delivery */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <p className="text-gray-500">No addresses found.</p>
        ) : (
          addresses.map((a, idx) => (
            <div
              key={a.id}
              ref={idx === 0 ? newAddressRef : null}
              className="border p-5 rounded-xl flex justify-between items-start hover:shadow-lg transition-all bg-white"
            >
              <div className="space-y-1">
                <h2 className="font-semibold text-gray-800">
                  {a.label || "Unnamed"}
                </h2>
                <p className="text-gray-600">
                  {a.street}, {a.city}, {a.state}
                </p>
                <p className="text-gray-600">
                  {a.country} - {a.postal}
                </p>

                {a.isDefault && (
                  <p className="text-green-600 text-sm font-medium">Default</p>
                )}

                {/* Estimated Delivery */}
                {a.estimatedDelivery && (
                  <p className="text-gray-600 text-sm mt-1">
                    Estimated Delivery: {a.estimatedDelivery}
                  </p>
                )}

                {!a.isDefault && (
                  <button
                    onClick={() => handleSetDefault(a.id)}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Set as Default
                  </button>
                )}
              </div>

              <button
                onClick={() => handleDelete(a.id)}
                className="text-red-600 hover:underline font-semibold"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
