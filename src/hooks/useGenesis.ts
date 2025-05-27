import { useState } from "react";
import { IGenesisResponse } from "@/utils/interface";
import { usePeriodicRefresh } from "./usePeriodicRefresh";

const GENESIS_API_URL =
  "https://api.virtuals.io/api/geneses?pagination[page]=1&pagination[pageSize]=100&filters[virtual][priority][$ne]=-1";

export const useGenesis = () => {
  const [data, setData] = useState<IGenesisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGenesis = async () => {
    try {
      const response = await fetch(GENESIS_API_URL);
      if (!response.ok) {
        throw new Error("Failed to fetch genesis data");
      }
      const jsonData = await response.json();
      setData(jsonData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Use periodic refresh hook
  usePeriodicRefresh({
    interval: 30000, // 30 seconds
    onRefresh: fetchGenesis,
  });

  return { data, loading, error };
};
