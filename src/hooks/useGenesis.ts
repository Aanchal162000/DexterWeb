import { useState, useEffect } from "react";
import { IGenesisResponse } from "@/utils/interface";
import { usePeriodicRefresh } from "./usePeriodicRefresh";
import { useLocalStorage } from "./useLocalStorage";

const GENESIS_API_URL =
  "https://api.virtuals.io/api/geneses?pagination[page]=1&pagination[pageSize]=100&filters[virtual][priority][$ne]=-1";

export const useGenesis = () => {
  const [data, setData] = useState<IGenesisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localData, setLocalData] = useLocalStorage<IGenesisResponse | null>(
    "genesis-data",
    null
  );
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchGenesis = async () => {
    try {
      const response = await fetch(GENESIS_API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch genesis data");
      }
      const jsonData = await response.json();
      setData(jsonData);
      setLocalData(jsonData); // Store successful data in localStorage
      setError(null);
    } catch (err) {
      // Only set error if we don't have any data (initial load) and no local data
      if (!data && !localData) {
        setError(err instanceof Error ? err.message : "An error occurred");
      }
      // Keep using the previous data if available
      if (!data && localData) {
        setData(localData);
      }
    } finally {
      setLoading(false);
      setIsInitialLoad(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (isInitialLoad) {
      fetchGenesis();
    }
  }, [isInitialLoad]);

  // Use periodic refresh hook for subsequent refreshes
  usePeriodicRefresh({
    interval: 30000, // 30 seconds
    onRefresh: fetchGenesis,
    initialLoad: false, // Don't do initial load here since we handle it in useEffect
    onError: (error) => {
      console.error("Genesis refresh error:", error);
      // Keep using the previous data if available
      if (!data && localData) {
        setData(localData);
      }
    },
  });

  return { data, loading, error, fetchGenesis };
};
