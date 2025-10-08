"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";

export default function NotificationsPage() {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const containerRef = useRef();
  const pollingRef = useRef(null);

  const fetchNotifications = useCallback(
    async (pageNumber = 1) => {
      try {
        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/notifications?page=${pageNumber}&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (data.success) {
          setTotalPages(data.totalPages);
          setNotifications((prev) => {
            // Avoid duplicates when loading more
            const newItems = data.notifications.filter(
              (n) => !prev.some((p) => p.id === n.id)
            );
            // Show toast for new notifications (only for page 1)
            if (pageNumber === 1) {
              newItems.forEach((n) => toast(`New: ${n.title} 🎉`));
            }
            return pageNumber === 1
              ? data.notifications
              : [...prev, ...newItems];
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  const markAsRead = async (id) => {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/notifications/${id}/read`,
        {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      toast.success("Marked as read ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/read-all`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success("All notifications marked as read ✅");
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark all notifications");
    }
  };

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = containerRef.current;
    if (
      container &&
      container.scrollTop + container.clientHeight >=
        container.scrollHeight - 50 &&
      page < totalPages &&
      !loading
    ) {
      setPage((prev) => prev + 1);
    }
  }, [page, totalPages, loading]);

  useEffect(() => {
    if (!token) return;

    fetchNotifications(1); // initial load

    // Poll every 30 seconds for new notifications (page 1)
    pollingRef.current = setInterval(() => fetchNotifications(1), 30000);

    const container = containerRef.current;
    if (container) container.addEventListener("scroll", handleScroll);

    return () => {
      clearInterval(pollingRef.current);
      if (container) container.removeEventListener("scroll", handleScroll);
    };
  }, [token, fetchNotifications, handleScroll]);

  // Load next page when `page` state changes
  useEffect(() => {
    if (page > 1) fetchNotifications(page);
  }, [page, fetchNotifications]);

  if (loading && page === 1)
    return <p className="text-center mt-10">Loading notifications...</p>;

  if (!notifications.length)
    return <p className="text-center mt-10">No notifications yet 🎉</p>;

  return (
    <div className="max-w-3xl mx-auto mt-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <button
          onClick={markAllAsRead}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
        >
          Mark All as Read
        </button>
      </div>

      <div
        ref={containerRef}
        className="space-y-4 max-h-[80vh] overflow-y-auto border rounded-lg p-4"
      >
        {notifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 border rounded-lg shadow-sm transition ${
              n.read ? "bg-gray-50" : "bg-blue-50"
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-lg">{n.title}</h2>
                <p className="text-gray-600">{n.message}</p>
                <p className="text-sm text-gray-400 mt-1">
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
              {!n.read && (
                <button
                  onClick={() => markAsRead(n.id)}
                  className="text-blue-600 hover:underline text-sm"
                >
                  Mark as Read
                </button>
              )}
            </div>
          </div>
        ))}

        {loading && page > 1 && (
          <p className="text-center py-2">Loading more...</p>
        )}
      </div>
    </div>
  );
}
