import { useEffect, useState } from "react";
import "./Notifications.css";

const API_URL = "http://127.0.0.1:8000";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("access_token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/notifications/`, {
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to load notifications");
      }

      setNotifications(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id) {
    try {
      const response = await fetch(
        `${API_URL}/notifications/${id}/read`,
        {
          method: "PUT",
          headers,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to mark notification");
      }

      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      setMessage(error.message);
    }
  }

  const unreadCount = notifications.filter(
    (notification) => !notification.is_read
  ).length;

  const filteredNotifications = notifications.filter(
    (notification) => {
      if (filter === "UNREAD") {
        return !notification.is_read;
      }

      if (filter === "READ") {
        return notification.is_read;
      }

      return true;
    }
  );

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>Notifications</h1>
          <p>
            Monitor system alerts and important inventory events.
          </p>
        </div>

        <div className="notification-summary">
          <span className="unread-count">
            {unreadCount}
          </span>
          <span>Unread</span>
        </div>
      </div>

      {message && (
        <div className="notification-message">
          {message}
        </div>
      )}

      <div className="notification-toolbar">
        <button
          className={filter === "ALL" ? "active-filter" : ""}
          onClick={() => setFilter("ALL")}
        >
          All
        </button>

        <button
          className={filter === "UNREAD" ? "active-filter" : ""}
          onClick={() => setFilter("UNREAD")}
        >
          Unread
        </button>

        <button
          className={filter === "READ" ? "active-filter" : ""}
          onClick={() => setFilter("READ")}
        >
          Read
        </button>

        <button
          className="refresh-button"
          onClick={loadNotifications}
        >
          ↻ Refresh
        </button>
      </div>

      <div className="notifications-list">
        {loading ? (
          <div className="notification-empty">
            Loading notifications...
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="notification-empty">
            <div className="empty-icon">♢</div>
            <h3>No notifications</h3>
            <p>
              There are no notifications matching this filter.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-card ${
                notification.is_read ? "read" : "unread"
              }`}
            >
              <div className="notification-icon">
                {notification.notification_type === "LOW_STOCK"
                  ? "!"
                  : "i"}
              </div>

              <div className="notification-content">
                <div className="notification-title-row">
                  <h3>{notification.title}</h3>

                  {!notification.is_read && (
                    <span className="new-badge">NEW</span>
                  )}
                </div>

                <p>{notification.message}</p>

                <div className="notification-footer">
                  <span>
                    {notification.notification_type}
                  </span>

                  <span>
                    {notification.created_at
                      ? new Date(
                          notification.created_at
                        ).toLocaleString()
                      : "-"}
                  </span>
                </div>
              </div>

              {!notification.is_read && (
                <button
                  className="mark-read-button"
                  onClick={() =>
                    markAsRead(notification.id)
                  }
                >
                  Mark as read
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Notifications;