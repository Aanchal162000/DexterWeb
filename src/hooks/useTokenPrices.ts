import { useState, useEffect } from "react";

interface TokenPrices {
  BASE: {
    ethereum: number;
    virtual: number;
  };
  SOLANA: {
    solana: number;
    virtual: number;
  };
}

export const useTokenPrices = () => {
  const [prices, setPrices] = useState<TokenPrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch("https://api.virtuals.io/api/dex/prices");
        const data = await response.json();
        setPrices(data.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch token prices");
        setLoading(false);
      }
    };

    fetchPrices();
    // Refresh prices every 30 seconds
    const interval = setInterval(fetchPrices, 30000);

    return () => clearInterval(interval);
  }, []);

  return { prices, loading, error };
};
