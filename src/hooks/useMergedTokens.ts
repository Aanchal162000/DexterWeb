import { useMemo } from "react";
import { IVirtual, IGenesis } from "@/utils/interface";
import { useGenesis } from "./useGenesis";
import { usePrototypeVirtuals } from "./usePrototypeVirtuals";
import { useSentientVirtuals } from "./useSentientVirtuals";
import { useLocalStorage } from "./useLocalStorage";

interface IGenesisResponse {
  data: IGenesis[];
}

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

  // Get localStorage data
  const [localGenesisData] = useLocalStorage<IGenesisResponse | null>(
    "genesis-data",
    null
  );
  const [localPrototypeVirtuals] = useLocalStorage<IVirtual[]>(
    "prototype-virtuals",
    []
  );
  const [localSentientVirtuals] = useLocalStorage<IVirtual[]>(
    "sentient-virtuals",
    []
  );

  const mergedTokens = useMemo(() => {
    const tokens: IMergedToken[] = [];

    // Add genesis tokens (use local data if API data is not available)
    const genesisTokens = genesisData?.data || localGenesisData?.data || [];
    genesisTokens.forEach((genesis: IGenesis) => {
      if (genesis.genesisAddress) {
        tokens.push({
          id: genesis.genesisId,
          name: genesis.virtual.name,
          symbol: genesis.virtual.symbol,
          logo: genesis.virtual.image?.url || "",
          address: genesis.genesisAddress,
          type: "genesis",
        });
      }
    });

    // Add prototype tokens (use local data if API data is not available)
    const prototypeTokens = prototypeVirtuals?.length
      ? prototypeVirtuals
      : localPrototypeVirtuals || [];
    prototypeTokens.forEach((virtual: IVirtual) => {
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

    // Add sentient tokens (use local data if API data is not available)
    const sentientTokens = sentientVirtuals?.length
      ? sentientVirtuals
      : localSentientVirtuals || [];
    sentientTokens.forEach((virtual: IVirtual) => {
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

    return tokens;
  }, [
    genesisData,
    localGenesisData,
    prototypeVirtuals,
    localPrototypeVirtuals,
    sentientVirtuals,
    localSentientVirtuals,
  ]);

  const isLoading = genesisLoading || prototypeLoading || sentientLoading;

  return { mergedTokens, isLoading };
};
