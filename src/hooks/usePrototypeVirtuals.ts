import { useState, useEffect } from "react";
import { IAssetsData, IVirtual } from "@/utils/interface";
import { ethers } from "ethers";
import approvalService from "@/services/contract/approvalService";
import { usePeriodicRefresh } from "./usePeriodicRefresh";
import { useLocalStorage } from "./useLocalStorage";

interface PrototypeVirtualResponse {
  data: {
    id: number;
    name: string;
    description: string;
    role: string;
    preToken: string;
    image: {
      url: string;
    };
    symbol: string;
    priceChangePercent24h: number;
    volume24h: number;
    totalValueLocked: string;
    holderCount: number;
    virtualTokenValue: string;
    mcapInVirtual: number;
    socials: {
      VERIFIED_LINKS: {
        TWITTER: string;
        WEBSITE: string;
      };
    };
    cores: Array<{
      name: string;
      coreId: number;
    }>;
    creator: {
      username: string;
      avatar: {
        url: string;
      };
    };
    genesis: {
      startsAt: string;
      endsAt: string;
    };
  }[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export const usePrototypeVirtuals = () => {
  const [virtuals, setVirtuals] = useState<IVirtual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [localVirtuals, setLocalVirtuals] = useLocalStorage<IVirtual[]>(
    "prototype-virtuals",
    []
  );
  const [dataList] = useLocalStorage<IAssetsData[]>("arbt-assets");

  function getTokenUSDPrice(
    virtualTokenValue: string,
    virtualTokenUSDPrice: number
  ): number {
    const valueInTokens = Number(virtualTokenValue) / 1e18;
    const priceInUSD = valueInTokens * virtualTokenUSDPrice;
    return parseFloat(priceInUSD.toFixed(6)); // return price with 6 decimal precision
  }

  const fetchVirtuals = async () => {
    try {
      const response = await fetch(
        "https://api.virtuals.io/api/virtuals?filters[status]=1&filters[chain]=BASE&sort[0]=volume24h%3Adesc&sort[1]=createdAt%3Adesc&populate[0]=image&populate[1]=genesis&pagination[page]=1&pagination[pageSize]=100&isGrouped=1&noCache=0"
      );
      if (!response.ok) {
        throw new Error("Failed to fetch prototype virtuals");
      }
      const data: PrototypeVirtualResponse = await response.json();

      const transformedVirtuals: IVirtual[] = data.data.map((virtual) => ({
        id: virtual.id.toString(),
        name: virtual.name,
        description: virtual.description,
        role: virtual.role,
        preToken: virtual.preToken,
        image: virtual.image,
        symbol: virtual.symbol,
        priceChangePercent24h: virtual.priceChangePercent24h,
        volume24h: virtual.volume24h,
        totalValueLocked: virtual.totalValueLocked,
        holderCount: virtual.holderCount,
        virtualTokenValue: virtual.virtualTokenValue,
        mcapInVirtual: virtual.mcapInVirtual,
        socials: virtual.socials,
        cores: virtual.cores,
        creator: virtual.creator,
        genesis: virtual.genesis,
        nextLaunchstartsAt: [],
        price: getTokenUSDPrice(
          virtual.virtualTokenValue,
          virtual.mcapInVirtual / 1.94
        ),
      }));

      transformedVirtuals.map((virtual) => {
        const filter = dataList?.filter((data) => data.token == virtual.symbol);
        if (filter?.length) {
          virtual.userBalance = filter[0]?.tokenAmount;
        }
      });

      setVirtuals(transformedVirtuals);
      setLocalVirtuals(transformedVirtuals); // Store successful data in localStorage
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      // Keep using the previous data if available
      if (!virtuals.length && localVirtuals?.length) {
        setVirtuals(localVirtuals);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVirtuals();
  }, [dataList]);

  // Use periodic refresh hook
  usePeriodicRefresh({
    interval: 30000, // 30 seconds
    onRefresh: fetchVirtuals,
    onError: (error) => {
      console.error("Prototype virtuals refresh error:", error);
      // Keep using the previous data if available
      if (!virtuals.length && localVirtuals?.length) {
        setVirtuals(localVirtuals);
      }
    },
  });

  return { virtuals, loading, error };
};
