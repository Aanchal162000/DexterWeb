import { useEffect, useRef, useState } from "react";

interface UsePeriodicRefreshOptions {
  interval: number; // in milliseconds
  onRefresh: () => Promise<void>;
  initialLoad?: boolean;
  onError?: (error: Error) => void;
}

export const usePeriodicRefresh = ({
  interval,
  onRefresh,
  initialLoad = true,
  onError,
}: UsePeriodicRefreshOptions) => {
  const isInitialLoad = useRef(initialLoad);
  const [lastSuccessfulRefresh, setLastSuccessfulRefresh] =
    useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const refresh = async () => {
      if (isRefreshing) return; // Prevent concurrent refreshes

      setIsRefreshing(true);
      try {
        await onRefresh();
        setLastSuccessfulRefresh(new Date());
      } catch (error) {
        console.error("Error in periodic refresh:", error);
        if (onError && error instanceof Error) {
          onError(error);
        }
      } finally {
        setIsRefreshing(false);
      }
    };

    const scheduleRefresh = () => {
      timeoutId = setTimeout(async () => {
        await refresh();
        scheduleRefresh();
      }, interval);
    };

    // Initial load
    if (isInitialLoad.current) {
      refresh();
      isInitialLoad.current = false;
    }

    // Schedule periodic refresh
    scheduleRefresh();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [interval, onRefresh, onError]);

  return {
    lastSuccessfulRefresh,
    isRefreshing,
  };
};
