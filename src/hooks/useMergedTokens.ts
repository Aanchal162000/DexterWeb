import { useMemo } from "react";
import { IVirtual, IGenesis } from "@/utils/interface";
import { useGenesis } from "./useGenesis";
import { usePrototypeVirtuals } from "./usePrototypeVirtuals";
import { useSentientVirtuals } from "./useSentientVirtuals";

interface IMergedToken {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  address: string;
  type: "genesis" | "prototype" | "sentient";
}

export const useMergedTokens = () => {
  const { data: genesisData, loading: genesisLoading } = useGenesis();
  const { virtuals: prototypeVirtuals, loading: prototypeLoading } =
    usePrototypeVirtuals();
  const { virtuals: sentientVirtuals, loading: sentientLoading } =
    useSentientVirtuals();

  const mergedTokens = useMemo(() => {
    const tokens: IMergedToken[] = [];

    // Add genesis tokens
    if (genesisData?.data) {
      genesisData.data.forEach((genesis: IGenesis) => {
        if (genesis.genesisAddress) {
          tokens.push({
            id: genesis.virtual.id.toString(),
            name: genesis.virtual.name,
            symbol: genesis.virtual.symbol,
            logo: genesis.virtual.image?.url || "",
            address: genesis.genesisAddress,
            type: "genesis",
          });
        }
      });
    }

    // Add prototype tokens
    if (prototypeVirtuals?.length) {
      prototypeVirtuals.forEach((virtual: IVirtual) => {
        if (virtual.contractAddress) {
          tokens.push({
            id: virtual.id,
            name: virtual.name,
            symbol: virtual.symbol,
            logo: virtual.image?.url || "",
            address: virtual.contractAddress,
            type: "prototype",
          });
        }
      });
    }

    // Add sentient tokens
    if (sentientVirtuals?.length) {
      sentientVirtuals.forEach((virtual: IVirtual) => {
        if (virtual.contractAddress) {
          tokens.push({
            id: virtual.id,
            name: virtual.name,
            symbol: virtual.symbol,
            logo: virtual.image?.url || "",
            address: virtual.contractAddress,
            type: "sentient",
          });
        }
      });
    }

    return tokens;
  }, [genesisData, prototypeVirtuals, sentientVirtuals]);

  const isLoading = genesisLoading || prototypeLoading || sentientLoading;

  return { mergedTokens, isLoading };
};
