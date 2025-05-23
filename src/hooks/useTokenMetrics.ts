import { useMemo } from "react";
import { IVirtual, IGenesisVirtual, IGenesis } from "@/utils/interface";
import { weiToEther } from "@/utils/tokenCalculations";
import VirtualTokenSelector from "@/components/Snipe/VirtualTokenSelector";

interface TokenMetrics {
  priceUSD: number;
  fdvUSD: number;
  tvlUSD: number;
  holders: number;
  volume24hUSD: number;
  priceChange24h: number;
}

export const useTokenMetrics = (
  virtual: IVirtual | IGenesisVirtual,
  genesis?: IGenesis
): TokenMetrics => {
  return useMemo(() => {
    const isVirtual = (data: IVirtual | IGenesisVirtual): data is IVirtual => {
      return "role" in data;
    };

    // For IVirtual type
    if (isVirtual(virtual)) {
      // 1. Price
      const price = virtual.mcapInVirtual
        ? virtual.mcapInVirtual /
          (parseFloat(virtual.virtualTokenValue || "0") / 1e18)
        : 0;

      // 2. FDV
      const totalSupply =
        virtual.tokenomics?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const fdv = price * totalSupply;

      // 3. TVL
      const tvl = parseFloat(virtual.totalValueLocked || "0") * price;

      return {
        priceUSD: Number(price.toFixed(3)),
        fdvUSD: Number(fdv.toFixed(2)),
        tvlUSD: Number(tvl.toFixed(2)),
        holders: virtual.holderCount || 0,
        volume24hUSD: virtual.volume24h || 0,
        priceChange24h: virtual.priceChangePercent24h || 0,
      };
    }

    // For IGenesisVirtual type with IGenesis data
    if (genesis) {
      const price = genesis.price || 0;
      const fdv = genesis.fdv || 0;

      return {
        priceUSD: Number(price.toFixed(3)),
        fdvUSD: Number(fdv.toFixed(2)),
        tvlUSD: 0, // Genesis doesn't have TVL
        holders: 0, // Genesis doesn't have holders
        volume24hUSD: 0, // Genesis doesn't have volume
        priceChange24h: genesis.priceChange24h || 0,
      };
    }

    // Fallback for IGenesisVirtual without genesis data
    return {
      priceUSD: 0,
      fdvUSD: 0,
      tvlUSD: 0,
      holders: 0,
      volume24hUSD: 0,
      priceChange24h: 0,
    };
  }, [virtual, genesis]);
};
