import { useState, useEffect } from "react";
import { IVirtual } from "@/utils/interface";
import { ethers } from "ethers";
import approvalService from "@/services/contract/approvalService";

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

  function getTokenUSDPrice(
    virtualTokenValue: string,
    virtualTokenUSDPrice: number
  ): number {
    const valueInTokens = Number(virtualTokenValue) / 1e18;
    const priceInUSD = valueInTokens * virtualTokenUSDPrice;
    return parseFloat(priceInUSD.toFixed(6)); // return price with 6 decimal precision
  }

  useEffect(() => {
    const fetchVirtuals = async () => {
      try {
        const response = await fetch(
          "https://api.virtuals.io/api/virtuals?filters[status]=1&filters[chain]=BASE&sort[0]=volume24h%3Adesc&sort[1]=createdAt%3Adesc&populate[0]=image&populate[1]=genesis&pagination[page]=1&pagination[pageSize]=100&isGrouped=1&noCache=0"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch virtuals");
        }

        const data: PrototypeVirtualResponse = await response.json();

        // Transform the API response to match our IVirtual interface
        const transformedVirtuals: IVirtual[] = data.data.map((item) => ({
          id: item.id.toString(),
          name: item.name,
          description: item.description,
          contractAddress: item.preToken,
          role: item.role,
          image: item.image,
          symbol: item.symbol,
          priceChangePercent24h: item.priceChangePercent24h,
          price: getTokenUSDPrice(
            item.virtualTokenValue,
            item.mcapInVirtual / 1.94
          ),
          volume24h: item.volume24h,
          totalValueLocked: item.totalValueLocked,
          holderCount: item.holderCount,
          virtualTokenValue: item.virtualTokenValue,
          mcapInVirtual: item.mcapInVirtual,
          socials: item.socials,
          cores: item.cores,
          creator: item.creator,
          genesis: item.genesis,
          nextLaunchstartsAt: [],
        }));

        setVirtuals(transformedVirtuals);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        setLoading(false);
      }
    };

    fetchVirtuals();
  }, []);

  return { virtuals, loading, error };
};
