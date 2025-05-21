import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { toast } from "react-toastify";
import { useSwapContext } from "@/context/SwapContext";
import approvalService from "@/services/contract/approvalService";
import {
  BuyContract,
  VIRTUALS_TOKEN_ADDRESS,
  WRAPPED_ETH_ADDRESS,
} from "@/constants/config";
import { useLoginContext } from "@/context/LoginContext";
import buyService from "@/services/contract/buyService";
import { IVirtual } from "@/utils/interface";
import { TiArrowSortedDown } from "react-icons/ti";

interface SmartBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  virtual: IVirtual;
}

interface TokenOption {
  name: string;
  symbol: string;
  logo: string;
  balance: string;
}

const SmartBuyModal: React.FC<SmartBuyModalProps> = ({
  isOpen,
  onClose,
  virtual,
}) => {
  const { selectedVitualtoken, setSelctedVirtualToken } = useSwapContext();
  const { balances } = useWalletBalance();
  const [amount, setAmount] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { networkData } = useLoginContext();
  const percentageButtons = [25, 50, 75, 100];
  const { address } = useLoginContext();
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

  const handleSmartBuy = async () => {
    if (!selectedVitualtoken || isLoading || isProcessing) return;

    try {
      setIsLoading(true);
      setIsProcessing(true);
      toast.info("Starting smart buy process...", { autoClose: false });

      const isEth = selectedVitualtoken.symbol === "ETH" ? true : false;

      if (!isEth) {
        try {
          toast.info("Checking token allowance...");
          const allowance = await approvalService.checkAllowance({
            tokenAddress: VIRTUALS_TOKEN_ADDRESS,
            provider: networkData?.provider!,
            spenderAddress: BuyContract,
          });

          // If allowance is less than amount, approve first
          if (Number(allowance) < Number(amount)) {
            toast.info("Approving token spend...");
            await approvalService.approveVirtualToken(
              amount.toString(),
              networkData?.provider!,
              VIRTUALS_TOKEN_ADDRESS,
              BuyContract
            );
            toast.success("Token approved successfully!");
          }
        } catch (error: any) {
          toast.error(
            "Failed to approve token: " + (error.message || "Unknown error")
          );
          throw error;
        }
      }

      toast.info("Processing buy transaction...");
      const receipt = await buyService.buyToken({
        amountIn: amount,
        amountOutMin: "0", // Set minimum amount or calculate slippage
        path: [
          isEth ? WRAPPED_ETH_ADDRESS : VIRTUALS_TOKEN_ADDRESS,
          virtual.contractAddress!,
        ],
        to: address!,
        timestamp: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
        provider: networkData?.provider!,
        selectedToken: selectedVitualtoken,
      });

      if (receipt.transactionHash) {
        toast.success("Smart Buy successful! 🎉");
      } else {
        toast.error("Smart Buy Failed!");
      }

      onClose();
    } catch (error) {
      console.error("Error in smart buy:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to smart buy"
      );
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
              Max Buy
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
              onClick={handleSmartBuy}
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
                "Smart Buy"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartBuyModal;
