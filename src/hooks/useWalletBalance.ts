import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useLoginContext } from "@/context/LoginContext";

interface TokenBalance {
  symbol: string;
  balance: string;
}

let ethereum: any = null;
if (typeof window !== "undefined") {
  ethereum = window?.ethereum;
}

export const useWalletBalance = () => {
  const [balances, setBalances] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address } = useLoginContext();

  const fetchBalances = async () => {
    try {
      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      const provider = new ethers.providers.Web3Provider(
        window.ethereum as any
      );

      // Fetch ETH balance
      const ethBalance = await provider.getBalance(address!);
      const formattedEthBalance = ethers.utils.formatEther(ethBalance);

      // Fetch Virtuals balance (assuming it's an ERC20 token)
      // Replace with actual Virtuals token contract address on Base
      const virtualsAddress = "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b";
      const virtualsABI = [
        "function balanceOf(address) view returns (uint256)",
      ];
      const virtualsContract = new ethers.Contract(
        virtualsAddress,
        virtualsABI,
        provider
      );
      const virtualsBalance = await virtualsContract.balanceOf(address);
      const formattedVirtualsBalance = ethers.utils.formatUnits(
        virtualsBalance,
        18
      ); // Adjust decimals if needed

      setBalances({
        ETH: formattedEthBalance,
        VIRT: formattedVirtualsBalance,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balances");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", fetchBalances);
      window.ethereum.on("chainChanged", fetchBalances);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener("accountsChanged", fetchBalances);
        window.ethereum.removeListener("chainChanged", fetchBalances);
      }
    };
  }, []);

  return { balances, isLoading, error, refetch: fetchBalances };
};
