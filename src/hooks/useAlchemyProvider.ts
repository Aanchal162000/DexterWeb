import { ethers } from "ethers";

const ALCHEMY_API_KEY = "N0AnlCaVUdAWUKIhcoi0rTGaOjTPZ-l6";
const ALCHEMY_URL = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export const useAlchemyProvider = () => {
  const getProvider = () => {
    return new ethers.providers.JsonRpcProvider(ALCHEMY_URL);
  };

  const getSigner = (privateKey?: string) => {
    const provider = getProvider();
    if (privateKey) {
      return new ethers.Wallet(privateKey, provider);
    }
    return provider.getSigner();
  };

  return {
    getProvider,
    getSigner,
  };
};
