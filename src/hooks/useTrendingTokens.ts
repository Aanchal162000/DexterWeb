import { useMemo } from "react";
import { IVirtual } from "@/utils/interface";
import { useSentientVirtuals } from "./useSentientVirtuals";
import { usePrototypeVirtuals } from "./usePrototypeVirtuals";

export const useTrendingTokens = () => {
  const { virtuals: sentientVirtuals } = useSentientVirtuals();
  const { virtuals: prototypeVirtuals } = usePrototypeVirtuals();

  const trendingTokens = useMemo(() => {
    // Merge both virtuals arrays
    const allTokens = [...sentientVirtuals, ...prototypeVirtuals];

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
  }, [sentientVirtuals, prototypeVirtuals]);

  return trendingTokens;
};
