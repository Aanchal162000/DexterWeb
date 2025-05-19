import { useState, useEffect } from "react";
import { IVirtual } from "@/utils/interface";

interface PrototypeVirtualResponse {
  data: {
    id: number;
    name: string;
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
          image: item.image,
          symbol: item.symbol,
          priceChangePercent24h: item.priceChangePercent24h,
          volume24h: item.volume24h,
          totalValueLocked: item.totalValueLocked,
          holderCount: item.holderCount,
          virtualTokenValue: item.virtualTokenValue,
          mcapInVirtual: item.mcapInVirtual,
          socials: item.socials,
          cores: item.cores,
          creator: item.creator,
          genesis: item.genesis,
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
