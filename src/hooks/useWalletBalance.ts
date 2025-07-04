import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useLoginContext } from "@/context/LoginContext";
import { toast } from "react-toastify";
import { useAlchemyProvider } from "./useAlchemyProvider";

interface TokenBalance {
  symbol: string;
  balance: string;
  decimals?: number;
}

interface WalletBalances {
  [key: string]: string;
}

interface UseWalletBalanceProps {
  targetAddress?: string;
  isManagedWallet?: boolean;
}

let ethereum: any = null;
if (typeof window !== "undefined") {
  ethereum = window?.ethereum;
}

export const useWalletBalance = ({
  targetAddress,
  isManagedWallet = false,
}: UseWalletBalanceProps = {}) => {
  const [balances, setBalances] = useState<WalletBalances>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { address, networkData, trigger } = useLoginContext();
  const { getProvider } = useAlchemyProvider();

  const fetchTokenBalance = async (
    provider: ethers.providers.Provider,
    tokenAddress: string,
    symbol: string,
    decimals: number = 18
  ): Promise<{ symbol: string; balance: string }> => {
    try {
      const targetAddr = targetAddress || address;
      if (!targetAddr) {
        return { symbol, balance: "0" };
      }

      if (
        tokenAddress.toLowerCase() ===
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      ) {
        // Handle native token (ETH)
        const balance = await provider.getBalance(targetAddr);
        return {
          symbol,
          balance: ethers.utils.formatEther(balance),
        };
      }

      // Handle ERC20 tokens
      const tokenContract = new ethers.Contract(
        tokenAddress,
        ["function balanceOf(address) view returns (uint256)"],
        provider
      );
      const balance = await tokenContract.balanceOf(targetAddr);
      return {
        symbol,
        balance: ethers.utils.formatUnits(balance, decimals),
      };
    } catch (err) {
      console.error(`Error fetching ${symbol} balance:`, err);
      return {
        symbol,
        balance: "0",
      };
    }
  };

  const fetchBalances = async () => {
    const targetAddr = targetAddress || address;
    if (!targetAddr || !networkData?.provider) {
      setError("Wallet not connected");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const provider = await getProvider();
      const tokens: TokenBalance[] = [
        {
          symbol: "ETH",
          balance: "0",
          decimals: 18,
        },
        {
          symbol: "VIRT",
          balance: "0",
          decimals: 18,
        },
        // Add more tokens as needed
      ];

      const balancePromises = tokens.map((token) =>
        fetchTokenBalance(
          provider,
          token.symbol === "ETH"
            ? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
            : "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b", // Virtuals token address
          token.symbol,
          token.decimals
        )
      );

      const results = await Promise.all(balancePromises);
      const newBalances: WalletBalances = {};
      results.forEach((result) => {
        newBalances[result.symbol] = result.balance;
      });

      setBalances(newBalances);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch balances";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();

    // Only listen for account changes if we're not using a managed wallet
    if (!isManagedWallet && window.ethereum) {
      window.ethereum.on("accountsChanged", fetchBalances);
      window.ethereum.on("chainChanged", fetchBalances);
    }

    return () => {
      if (!isManagedWallet && window.ethereum) {
        window.ethereum.removeListener("accountsChanged", fetchBalances);
        window.ethereum.removeListener("chainChanged", fetchBalances);
      }
    };
  }, [address, targetAddress, networkData?.provider, trigger, isManagedWallet]);

  return { balances, isLoading, error, refetch: fetchBalances };
};
