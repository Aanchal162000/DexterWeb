import { useState, useEffect } from "react";

interface EventData {
  agentId: string;
  agentName: string;
  genesisId: string;
  tokenAddress: string;
  txHash: string;
  blockNumber: number;
  userAmount: string;
  userMarketCap: string;
  virtualPrice: string;
}

interface Notification {
  id: string;
  message: string;
  type: string;
  timestamp: string;
  read: boolean;
  eventData: EventData;
}

export const useNotifications = (walletAddress: string | null) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
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
              const updated = [notification, ...prev];
              console.log(
                "[Notifications] Updated notifications array:",
                updated
              );
              return updated;
            });
            setHasUnread(true);
          }
        };

        eventSource.addEventListener("event_captured", (event) => {
          console.log("[Notifications] Event captured event received:", event);
          const notification = processEventData(event);

          if (notification) {
            setNotifications((prev) => {
              const updated = [notification, ...prev];
              console.log(
                "[Notifications] Updated notifications array:",
                updated
              );
              return updated;
            });
            setHasUnread(true);
          }
        });

        eventSource.addEventListener("transaction_success", (event) => {
          console.log(
            "[Notifications] Transaction success event received:",
            event
          );
          const notification = processEventData(event);

          if (notification) {
            setNotifications((prev) => {
              const updated = [notification, ...prev];
              console.log(
                "[Notifications] Updated notifications array:",
                updated
              );
              return updated;
            });
            setHasUnread(true);
          }
        });

        eventSource.addEventListener("transaction_sent", (event) => {
          console.log(
            "[Notifications] Transaction sent event received:",
            event
          );
          const notification = processEventData(event);

          if (notification) {
            setNotifications((prev) => {
              const updated = [notification, ...prev];
              console.log(
                "[Notifications] Updated notifications array:",
                updated
              );
              return updated;
            });
            setHasUnread(true);
          }
        });

        eventSource.addEventListener("transaction_critical_error", (event) => {
          console.log(
            "[Notifications] Transaction critical error event received:",
            event
          );
          const notification = processEventData(event);

          if (notification) {
            setNotifications((prev) => {
              const updated = [notification, ...prev];
              console.log(
                "[Notifications] Updated notifications array:",
                updated
              );
              return updated;
            });
            setHasUnread(true);
          }
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
