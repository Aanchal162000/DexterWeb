import { ethers } from "ethers";
let ethereum: any = null;
if (typeof window !== "undefined") {
  ethereum = window?.ethereum;
}

const ALCHEMY_API_KEY = "N0AnlCaVUdAWUKIhcoi0rTGaOjTPZ-l6";
const ALCHEMY_URL = `https://base-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

export const useAlchemyProvider = () => {
  const getProvider = () => {
    return new ethers.providers.JsonRpcProvider(ALCHEMY_URL);
  };

  const getSigner = async () => {
    // Check if window.ethereum is available
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });

        // Create Web3Provider from window.ethereum
        const provider = new ethers.providers.Web3Provider(
          window.ethereum as any
        );

        // Get the signer
        const signer = provider.getSigner();

        // Verify we can get the address
        await signer.getAddress();

        return signer;
      } catch (error) {
        console.error("Error getting signer:", error);
        throw new Error("Failed to connect wallet");
      }
    } else {
      throw new Error(
        "No Ethereum provider found. Please install MetaMask or another Web3 wallet."
      );
    }
  };

  const getReadOnlyProvider = () => {
    return new ethers.providers.JsonRpcProvider(ALCHEMY_URL);
  };

  return {
    getProvider,
    getSigner,
    getReadOnlyProvider,
  };
};
