import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { agentService } from "@/services/contract/agentService";
import { toast } from "react-toastify";
import { useSwapContext } from "@/context/SwapContext";
import approvalService from "@/services/contract/approvalService";
import {
  SnipeContract,
  VIRTUALS_TOKEN_ADDRESS,
  WRAPPED_ETH_ADDRESS,
} from "@/constants/config";
import { useLoginContext } from "@/context/LoginContext";
import { TiArrowSortedDown } from "react-icons/ti";

interface SnipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  genesisId: string;
  name: string;
  walletAddress: string;
  endsAt: string;
}

interface TokenOption {
  name: string;
  symbol: string;
  logo: string;
  balance: string;
}

const SnipeModal: React.FC<SnipeModalProps> = ({
  isOpen,
  onClose,
  genesisId,
  name,
  walletAddress,
  endsAt,
}) => {
  const { selectedVitualtoken, setSelctedVirtualToken } = useSwapContext();
  const { balances } = useWalletBalance();
  const [amount, setAmount] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { networkData } = useLoginContext();
  const percentageButtons = [25, 50, 75, 100];
  const [isFromCoinOpen, setIsFromCoinOpen] = useState(false);

  const tokenOptions: TokenOption[] = [
    {
      name: "Virtuals",
      symbol: "VIRT",
      logo: "https://static.cx.metamask.io/api/v1/tokenIcons/8453/0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b.png",
      balance: balances.VIRT || "0",
    },
    {
      name: "Ethereum",
      symbol: "ETH",
      logo: "/Networks/ETH.png",
      balance: balances.ETH || "0",
    },
  ];

  const handleTokenSelect = (token: TokenOption) => {
    setSelctedVirtualToken(token);
    setIsFromCoinOpen(false);
    // Reset amount when token changes
    setAmount("");
  };

  useEffect(() => {
    setIsButtonDisabled(
      !amount || parseFloat(amount) <= 0 || isLoading || isProcessing
    );
  }, [amount, isLoading, isProcessing]);

  const handlePercentageClick = (percentage: number) => {
    if (!selectedVitualtoken || isLoading || isProcessing) return;
    const balance =
      selectedVitualtoken.symbol === "ETH" ? balances.ETH : balances.VIRT;
    const calculatedAmount = (parseFloat(balance || "0") * percentage) / 100;
    setAmount(calculatedAmount.toString());
  };

  const handleSnipe = async () => {
    if (!selectedVitualtoken || isLoading || isProcessing) return;

    let approveToastId: string | number | null = null;
    let processToastId: string | number | null = null;

    try {
      setIsLoading(true);
      setIsProcessing(true);
      processToastId = toast.info("Starting snipe process...", {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      });

      const isEth = selectedVitualtoken.symbol === "ETH" ? true : false;

      if (!isEth) {
        try {
          approveToastId = toast.info("Checking token allowance...", {
            autoClose: false,
            closeOnClick: false,
            closeButton: false,
          });
          const allowance = await approvalService.checkAllowance({
            tokenAddress: VIRTUALS_TOKEN_ADDRESS,
            provider: networkData?.provider!,
            spenderAddress: SnipeContract,
          });

          // If allowance is less than amount, approve first
          if (Number(allowance) < Number(amount)) {
            if (approveToastId) toast.dismiss(approveToastId);
            approveToastId = toast.info("Approving token spend...", {
              autoClose: false,
              closeOnClick: false,
              closeButton: false,
            });
            await approvalService.approveVirtualToken(
              amount.toString(),
              networkData?.provider!,
              VIRTUALS_TOKEN_ADDRESS,
              SnipeContract
            );
            if (approveToastId) toast.dismiss(approveToastId);
            toast.success("Token approved successfully!");
          } else {
            if (approveToastId) toast.dismiss(approveToastId);
          }
        } catch (error: any) {
          if (approveToastId) toast.dismiss(approveToastId);
          toast.error(
            "Failed to approve token: " + (error.message || "Unknown error")
          );
          throw error;
        }
      }

      if (processToastId) toast.dismiss(processToastId);
      processToastId = toast.info("Processing deposit...", {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      });
      const receipt = await agentService.deposit({
        tokenAddress: isEth ? WRAPPED_ETH_ADDRESS : VIRTUALS_TOKEN_ADDRESS,
        amount: amount,
        provider: networkData?.provider!,
      });

      if (processToastId) toast.dismiss(processToastId);
      processToastId = toast.info("Creating agent...", {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      });
      if (receipt.transactionHash) {
        const response = await agentService.createAgent({
          genesisId,
          name,
          walletAddress,
          token: selectedVitualtoken.symbol === "ETH" ? "eth" : "virtual",
          amount: (
            (Number(amount) - 0.003 * Number(amount)) *
            10 ** 18
          ).toString(),
          launchTime: new Date(endsAt),
        });

        if (!response.success) {
          throw new Error(response.message);
        }
        if (processToastId) toast.dismiss(processToastId);
        toast.success("Snipe successful! 🎉");
        onClose();
      } else {
        if (processToastId) toast.dismiss(processToastId);
        toast.error("Snipe Failed!");
      }
    } catch (error) {
      if (approveToastId) toast.dismiss(approveToastId);
      if (processToastId) toast.dismiss(processToastId);
      console.error("Error in snipe:", error);
      toast.error(error instanceof Error ? error.message : "Failed to snipe");
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`w-[95%] mx-auto transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="rounded-b-xl bg-primary-100/10 py-2 px-4">
        <div className="flex flex-col gap-4">
          <div className="flex justify-end items-start">
            {/* <h3 className="text-lg font-semibold text-white">Snipe {name}</h3> */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          <div className="">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Max Snipe
            </label>
            <div className="relative">
              <input
                id="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isLoading || isProcessing}
                className="w-full px-4 py-3 bg-transparent border border-primary-100/70 rounded-lg text-white focus:outline-none focus:border-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Enter amount"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {selectedVitualtoken?.logo && (
                  <img
                    src={selectedVitualtoken.logo}
                    alt={selectedVitualtoken.symbol}
                    className="w-6 h-6 rounded-full"
                  />
                )}
                <span className="text-primary-100 text-sm">
                  {selectedVitualtoken?.symbol || "VIRT"}
                </span>
                <button
                  onClick={() => setIsFromCoinOpen(true)}
                  className="text-primary-100 hover:text-primary-100/80 transition-colors"
                >
                  <TiArrowSortedDown className="size-5" />
                </button>
              </div>
            </div>

            {/* Token Selector Dropdown */}
            {isFromCoinOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-primary-100/20 rounded-lg shadow-lg z-10">
                <div className="py-1">
                  {tokenOptions.map((token) => (
                    <button
                      key={token.symbol}
                      onClick={() => handleTokenSelect(token)}
                      className="w-full px-4 py-2 text-left text-white hover:bg-primary-100/10 flex items-center gap-2"
                    >
                      <img
                        src={token.logo}
                        alt={token.symbol}
                        className="w-6 h-6 rounded-full"
                      />
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {token.symbol}
                        </span>
                        <span className="text-xs text-gray-400">
                          Balance: {Number(token.balance).toFixed(6)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-2">
              <span className="text-gray-400 text-xs">
                Available Balance:{" "}
                {selectedVitualtoken?.symbol === "ETH"
                  ? Number(balances.ETH).toFixed(6)
                  : Number(balances.VIRT).toFixed(6)}
              </span>
              <div className="flex gap-1">
                {percentageButtons.map((percentage) => (
                  <button
                    key={percentage}
                    onClick={() => handlePercentageClick(percentage)}
                    disabled={isLoading || isProcessing}
                    className="px-2 py-1 text-xs border border-gray-400/80 hover:bg-primary-100/20 text-white rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {percentage}%
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="my-4 flex justify-center items-center relative w-full">
            <button
              onClick={handleSnipe}
              disabled={isButtonDisabled}
              className={`w-[80%] px-4 py-3 rounded-lg font-medium transition-colors duration-200 ${
                isButtonDisabled
                  ? "bg-gray-600 text-white cursor-not-allowed"
                  : "bg-primary-100 text-black hover:bg-primary-100/90"
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Processing...
                </div>
              ) : isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Transaction in Progress...
                </div>
              ) : (
                "Snipe"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SnipeModal;
