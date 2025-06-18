import { useMemo, useState, useEffect } from "react";
import { IVirtual } from "@/utils/interface";
import { useSentientVirtuals } from "./useSentientVirtuals";
import { usePrototypeVirtuals } from "./usePrototypeVirtuals";

export const useTrendingTokens = () => {
  const { virtuals: sentientVirtuals, loading: isSentientLoading } =
    useSentientVirtuals();
  const { virtuals: prototypeVirtuals, loading: isPrototypeLoading } =
    usePrototypeVirtuals();
  const [previousTokens, setPreviousTokens] = useState<IVirtual[]>([]);

  const isLoading = isSentientLoading || isPrototypeLoading;

  const trendingTokens: IVirtual[] = useMemo(() => {
    // If loading, return previous tokens or empty array
    if (isLoading) {
      return previousTokens.length > 0 ? previousTokens : [];
    }

    // Ensure we have arrays to work with
    const sentientArray = Array.isArray(sentientVirtuals)
      ? sentientVirtuals
      : [];
    const prototypeArray = Array.isArray(prototypeVirtuals)
      ? prototypeVirtuals
      : [];

    // Merge both virtuals arrays
    const allTokens = [...sentientArray, ...prototypeArray];

    // First, separate positive and negative movers
    const positiveMovers = allTokens.filter(
      (token) => (token.priceChangePercent24h || 0) > 0
    );
    const negativeMovers = allTokens.filter(
      (token) => (token.priceChangePercent24h || 0) <= 0
    );

    // Sort positive movers by highest percentage first
    const sortedPositiveMovers = positiveMovers.sort((a, b) => {
      return (b.priceChangePercent24h || 0) - (a.priceChangePercent24h || 0);
    });

    // Sort negative movers by closest to zero (least negative)
    const sortedNegativeMovers = negativeMovers.sort((a, b) => {
      return (a.priceChangePercent24h || 0) - (b.priceChangePercent24h || 0);
    });

    // Combine positive movers first, then add negative movers if needed
    const combinedTokens = [...sortedPositiveMovers, ...sortedNegativeMovers];

    // Take top 10 tokens
    return combinedTokens.slice(0, 10);
  }, [sentientVirtuals, prototypeVirtuals, isLoading]);

  // Update previous tokens when we have new data and not loading
  useEffect(() => {
    if (!isLoading && trendingTokens.length > 0) {
      setPreviousTokens(trendingTokens);
    }
  }, [isLoading, trendingTokens]);

  return {
    trendingTokens,
    isLoading,
  };
};
