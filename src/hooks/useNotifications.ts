import { useState, useEffect } from "react";
import { INotification, INotificationEventData } from "@/utils/interface";

export const useNotifications = (
  walletAddress: string | null,
  jwtToken: string | null
) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "error"
  >("connecting");

  const processEventData = (event: MessageEvent) => {
    try {
      const parsedData = JSON.parse(event.data);
      console.log("[Notifications] Processing event data:", parsedData);

      // Skip ping events
      if (parsedData.type === "ping") {
        console.log("[Notifications] Skipping ping event");
        return null;
      }

      // Validate required fields
      if (!parsedData.message || !parsedData.type) {
        console.error("[Notifications] Missing required fields in event data");
        return null;
      }

      return {
        id: parsedData.id || Date.now().toString(),
        message: parsedData.message,
        type: parsedData.type,
        timestamp: parsedData.timestamp || new Date().toISOString(),
        read: false,
        eventData: parsedData.data || {},
      };
    } catch (error) {
      console.error("[Notifications] Error processing event data:", error);
      return null;
    }
  };

  useEffect(() => {
    console.log(
      "[Notifications] Effect triggered with walletAddress:",
      walletAddress
    );

    if (!walletAddress) {
      console.log("[Notifications] No wallet address, clearing notifications");
      setNotifications([]);
      setHasUnread(false);
      setConnectionStatus("error");
      return;
    }

    let retryCount = 0;
    const maxRetries = 3;
    let eventSource: EventSource | null = null;

    const connectSSE = () => {
      try {
        const url = `https://dexters-backend.zkcross.exchange/api/notifications/${walletAddress}`;
        console.log("[Notifications] Connecting to SSE endpoint:", url);

        eventSource = new EventSource(url);
        setConnectionStatus("connecting");

        eventSource.onopen = () => {
          console.log("[Notifications] SSE connection opened successfully");
          setConnectionStatus("connected");
          retryCount = 0;
        };

        eventSource.onmessage = (event) => {
          console.log("[Notifications] Raw event received:", event);
          const notification = processEventData(event);
          if (notification) {
            setNotifications((prev) => {
              // Avoid duplicates by id
              if (prev.some((n) => n.id === notification.id)) return prev;
              return [notification, ...prev];
            });
            setHasUnread(true);
            // Optionally, refetch history for perfect sync
            fetchNotificationHistory();
          }
        };

        // Listen for other event types and handle similarly
        [
          "event_captured",
          "transaction_success",
          "transaction_sent",
          "transaction_critical_error",
        ].forEach((eventType) => {
          eventSource!.addEventListener(eventType, (event) => {
            console.log(`[Notifications] ${eventType} event received:`, event);
            const notification = processEventData(event);
            if (notification) {
              setNotifications((prev) => {
                if (prev.some((n) => n.id === notification.id)) return prev;
                return [notification, ...prev];
              });
              setHasUnread(true);
              fetchNotificationHistory();
            }
          });
        });

        eventSource.addEventListener("connection", (event) => {
          console.log("[Notifications] Connection event received:", event);
        });

        eventSource.onerror = (error) => {
          console.error("[Notifications] SSE connection error:", error);
          setConnectionStatus("error");

          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }

          if (retryCount < maxRetries) {
            retryCount++;
            console.log(
              `[Notifications] Retrying connection (${retryCount}/${maxRetries})...`
            );
            setTimeout(connectSSE, 2000 * retryCount);
          } else {
            console.error("[Notifications] Max retries reached, giving up");
          }
        };
      } catch (error) {
        console.error("[Notifications] Error creating EventSource:", error);
        setConnectionStatus("error");
      }
    };

    connectSSE();

    return () => {
      console.log("[Notifications] Cleaning up SSE connection");
      if (eventSource) {
        eventSource.close();
        eventSource = null;
      }
    };
  }, [walletAddress]);

  // Helper to fetch notification history
  const fetchNotificationHistory = async () => {
    if (!jwtToken) return;
    try {
      const res = await fetch(
        `https://dexters-backend.zkcross.exchange/api/user-notifications?limit=100`,
        {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      const data = await res.json();
      if (data.success && data.data?.notifications) {
        setNotifications(
          data.data.notifications.map((n: any) => ({
            id: n.id,
            message: n.message,
            type: n.type,
            timestamp: n.timestamp,
            read: n.isRead,
            eventData: n.data || {},
          }))
        );
        setHasUnread(data.data.summary?.unreadCount > 0);
      }
    } catch (error) {
      console.error(
        "[Notifications] Error fetching notification history:",
        error
      );
    }
  };

  // Mark a notification as read (API)
  const markAsRead = async (notificationId: string) => {
    if (!jwtToken) return;
    try {
      await fetch(
        `https://dexters-backend.zkcross.exchange/api/user-notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );
      setHasUnread(false);
    } catch (error) {
      console.error("[Notifications] Error marking as read:", error);
    }
  };

  // Mark all notifications as read (API)
  const markAllAsRead = async () => {
    if (!jwtToken) return;
    try {
      await fetch(
        `https://dexters-backend.zkcross.exchange/api/user-notifications/mark-all-read`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      setHasUnread(false);
    } catch (error) {
      console.error("[Notifications] Error marking all as read:", error);
    }
  };

  // Clear all notifications (API)
  const clearAllNotifications = async () => {
    if (!jwtToken) return;
    try {
      await fetch(
        `https://dexters-backend.zkcross.exchange/api/user-notifications/clear-all`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        }
      );
      setNotifications([]);
      setHasUnread(false);
    } catch (error) {
      console.error("[Notifications] Error clearing all notifications:", error);
    }
  };

  // Fetch notification history on mount and when wallet/jwtToken changes
  useEffect(() => {
    if (walletAddress && jwtToken) {
      fetchNotificationHistory();
    } else {
      setNotifications([]);
      setHasUnread(false);
    }
  }, [walletAddress, jwtToken]);

  useEffect(() => {
    console.log("[Notifications] Current state:", {
      connectionStatus,
      notificationCount: notifications.length,
      hasUnread,
      notifications,
    });
  }, [notifications, hasUnread, connectionStatus]);

  return {
    notifications,
    hasUnread,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    connectionStatus,
  };
};
