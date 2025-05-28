import { useEffect, useRef } from "react";

interface UsePeriodicRefreshOptions {
  interval: number; // in milliseconds
  onRefresh: () => Promise<void>;
  initialLoad?: boolean;
}

export const usePeriodicRefresh = ({
  interval,
  onRefresh,
  initialLoad = true,
}: UsePeriodicRefreshOptions) => {
  const isInitialLoad = useRef(initialLoad);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const refresh = async () => {
      try {
        await onRefresh();
      } catch (error) {
        console.error("Error in periodic refresh:", error);
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
  }, [interval, onRefresh]);
};
