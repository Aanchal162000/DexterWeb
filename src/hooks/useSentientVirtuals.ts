import { useState, useEffect } from "react";
import { IAssetsData, IVirtual } from "@/utils/interface";
import { useLocalStorage } from "./useLocalStorage";
import { useLoginContext } from "@/context/LoginContext";
import { usePeriodicRefresh } from "./usePeriodicRefresh";
import { useTokenPrices } from "./useTokenPrices";

interface SentientVirtualResponse {
  data: {
    id: number;
    name: string;
    role: string;
    tokenAddress: string;
    description: string;
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
    tokenomics:
      | [
          {
            startsAt: string;
          }
        ]
      | [];
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

export const useSentientVirtuals = () => {
  const [virtuals, setVirtuals] = useState<IVirtual[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataList] = useLocalStorage<IAssetsData[]>("arbt-assets");
  const [localVirtuals, setLocalVirtuals] = useLocalStorage<IVirtual[]>(
    "sentient-virtuals",
    []
  );
  const { trigger } = useLoginContext();

  function getTokenUSDPrice(
    virtualTokenValue: string,
    virtualTokenUSDPrice: number
  ): number {
    console.log("Check", virtualTokenValue, virtualTokenUSDPrice);
    const valueInTokens = Number(virtualTokenValue) / 1e18;
    const priceInUSD = valueInTokens * virtualTokenUSDPrice;
    return parseFloat(priceInUSD.toFixed(6)); // return price with 6 decimal precision
  }

  const fetchVirtuals = async () => {
    let prices: any;

    try {
      const response = await fetch("https://api.virtuals.io/api/dex/prices");
      const data = await response.json();
      prices = data.data;
      console.log("prices", prices);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch token prices");
      setLoading(false);
    }

    try {
      const response = await fetch(
        "https://api.virtuals.io/api/virtuals?filters[status]=2&filters[chain]=BASE&sort[0]=volume24h%3Adesc&sort[1]=createdAt%3Adesc&populate[0]=image&populate[1]=genesis&populate[2]=creator&pagination[page]=1&pagination[pageSize]=100&noCache=0"
      );

      if (!response.ok) {
        throw new Error("Failed to fetch virtuals");
      }

      const data: SentientVirtualResponse = await response.json();

      // Transform the API response to match our IVirtual interface
      const transformedVirtuals: IVirtual[] = data.data.map((item) => ({
        id: item.id.toString(),
        name: item.name,
        role: item.role,
        description: item.description,
        image: item.image,
        symbol: item.symbol,
        priceChangePercent24h: item.priceChangePercent24h,
        price: getTokenUSDPrice(item.virtualTokenValue, prices?.BASE?.virtual!),
        volume24h: item.volume24h,
        totalValueLocked: item.totalValueLocked,
        holderCount: item.holderCount,
        virtualTokenValue: item.virtualTokenValue,
        mcapInVirtual: item.mcapInVirtual,
        socials: item.socials,
        cores: item.cores,
        creator: item.creator,
        genesis: item.genesis,
        contractAddress: item.tokenAddress,
        sentientContractAddress: item.tokenAddress,
        nextLaunchstartsAt: item?.tokenomics?.length ? item?.tokenomics : [],
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
  }, [trigger, dataList]);

  // Use periodic refresh hook
  usePeriodicRefresh({
    interval: 30000, // 30 seconds
    onRefresh: fetchVirtuals,
    onError: (error) => {
      console.error("Sentient virtuals refresh error:", error);
      // Keep using the previous data if available
      if (!virtuals.length && localVirtuals?.length) {
        setVirtuals(localVirtuals);
      }
    },
  });

  return { virtuals, loading, error, fetchVirtuals };
};
