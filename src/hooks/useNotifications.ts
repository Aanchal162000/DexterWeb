import { useState, useEffect } from "react";

interface Notification {
  id: string;
  message: string;
  type: string;
  timestamp: string;
  read: boolean;
  eventData: any;
}

export const useNotifications = (walletAddress: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connecting" | "connected" | "error"
  >("connecting");

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
          retryCount = 0; // Reset retry count on successful connection
        };

        eventSource.onmessage = (event) => {
          console.log("[Notifications] Raw event received:", event);
          console.log("[Notifications] Event type:", event.type);
          console.log("[Notifications] Event data:", event.data);

          try {
            const parsedData = JSON.parse(event.data);
            console.log("[Notifications] Parsed data:", parsedData);

            // Skip ping events
            if (parsedData.type === "ping") {
              console.log("[Notifications] Skipping ping event");
              return;
            }

            // Process all non-ping events
            const newNotification = {
              id: parsedData.id || Date.now().toString(),
              message:
                parsedData.message ||
                parsedData.data?.message ||
                `New ${parsedData.type} event received`,
              type: parsedData.type || "info",
              timestamp: parsedData.timestamp || new Date().toISOString(),
              read: false,
              eventData: parsedData.data || {},
            };

            console.log(
              "[Notifications] Creating new notification:",
              newNotification
            );

            setNotifications((prev) => {
              const updated = [newNotification, ...prev];
              console.log(
                "[Notifications] Updated notifications array:",
                updated
              );
              return updated;
            });

            setHasUnread(true);
            console.log("[Notifications] Set hasUnread to true");
          } catch (error) {
            console.error("[Notifications] Error parsing notification:", error);
          }
        };

        eventSource.addEventListener("event_captured", (event) => {
          console.log("[Notifications] Event captured event received:", event);
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

          // Implement retry logic
          if (retryCount < maxRetries) {
            retryCount++;
            console.log(
              `[Notifications] Retrying connection (${retryCount}/${maxRetries})...`
            );
            setTimeout(connectSSE, 2000 * retryCount); // Exponential backoff
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

  const markAsRead = (notificationId: string) => {
    console.log(
      "[Notifications] Marking notification as read:",
      notificationId
    );
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setHasUnread(false);
  };

  const markAllAsRead = () => {
    console.log("[Notifications] Marking all notifications as read");
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    setHasUnread(false);
  };

  // Log state changes
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
    connectionStatus,
  };
};
