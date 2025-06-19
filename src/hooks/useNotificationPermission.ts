import { useCallback, useState } from "react";

export type NotificationPermissionState = "default" | "granted" | "denied";

export const useNotificationPermission = () => {
  const [permission, setPermission] = useState<NotificationPermissionState>(
    typeof window !== "undefined" && "Notification" in window
      ? Notification.permission
      : "default"
  );

  const requestPermission = useCallback(async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("denied");
      return "denied";
    }
    const result = await Notification.requestPermission();
    setPermission(result);
    return result;
  }, []);

  return { permission, requestPermission };
};
