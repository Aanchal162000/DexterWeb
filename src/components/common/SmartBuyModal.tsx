import React, { useState, useEffect, useRef } from "react";
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
import useClickOutside from "@/hooks/useClickOutside";
import { toastError, toastProcess, toastSuccess } from "@/utils/toast";

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
  const { balances, isLoading: isBalanceLoading } = useWalletBalance();
  const balance =
    selectedVitualtoken.symbol === "ETH" ? balances.ETH : balances.VIRT;
  const calculatedAmount = (parseFloat(balance || "0") * 10) / 100;

  const [amount, setAmount] = useState(calculatedAmount.toFixed(4).toString());
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { networkData } = useLoginContext();
  const percentageButtons = [10, 25, 50, 100];
  const { address } = useLoginContext();
  const [isFromCoinOpen, setIsFromCoinOpen] = useState(false);
  const { triggerAPIs } = useLoginContext();
  const coinSelectRef = useRef<HTMLDivElement>(null);
  const [selectedPercentage, setSelectPercentage] = useState<
    10 | 25 | 50 | 100 | number
  >(10);
  useClickOutside(coinSelectRef, () => {
    if (isFromCoinOpen) {
      setIsFromCoinOpen(false);
    }
  });

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
    {
      name: "Dexter",
      symbol: "DEXTER",
      logo: "/Trade/dexterLogo.png",
      balance: "0",
    },
  ];

  useEffect(() => {
    setIsButtonDisabled(
      !amount || parseFloat(amount) <= 0 || isLoading || isProcessing
    );
  }, [amount, isLoading, isProcessing]);
  useEffect(() => {
    handlePercentageClick(10);
  }, [balances]);

  const handleTokenSelect = (token: TokenOption) => {
    setSelctedVirtualToken(token);
    setIsFromCoinOpen(false);
    // Reset amount when token changes
    setAmount("");
  };

  const handlePercentageClick = (percentage: number) => {
    if (!selectedVitualtoken || isLoading || isProcessing) return;
    setSelectPercentage(percentage);
    const balance =
      selectedVitualtoken.symbol === "ETH" ? balances.ETH : balances.VIRT;
    const calculatedAmount = (parseFloat(balance || "0") * percentage) / 100;
    setAmount(calculatedAmount.toFixed(4).toString());
  };

  const handleSmartBuy = async () => {
    if (!selectedVitualtoken || isLoading || isProcessing) return;

    let approveToastId: string | number | null = null;
    let processToastId: string | number | null = null;

    try {
      setIsLoading(true);
      setIsProcessing(true);
      processToastId = toastProcess("Processing Transaction...");

      const isEth = selectedVitualtoken.symbol === "ETH" ? true : false;

      if (!isEth) {
        try {
          const allowance = await approvalService.checkAllowance({
            tokenAddress: VIRTUALS_TOKEN_ADDRESS,
            provider: networkData?.provider!,
            spenderAddress: BuyContract,
          });

          // If allowance is less than amount, approve first
          const amountWithBuffer = Number(amount) + 0.001 * Number(amount);
          if (Number(allowance) < amountWithBuffer) {
            if (approveToastId) toast.dismiss(approveToastId);

            await approvalService.approveVirtualToken(
              (Number(amount) + 0.2).toString(),
              networkData?.provider!,
              VIRTUALS_TOKEN_ADDRESS,
              BuyContract
            );
            if (approveToastId) toast.dismiss(approveToastId);
            toast.success("Token approved successfully!");
          } else {
            if (approveToastId) toast.dismiss(approveToastId);
          }
        } catch (error: any) {
          if (approveToastId) toast.dismiss(approveToastId);
          // toast.error("Failed to approve token");
          throw error;
        }
      }

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
        if (processToastId) toast.dismiss(processToastId);
        triggerAPIs();
        toastSuccess("Smart Buy successful!");
        onClose();
      } else {
        if (processToastId) toast.dismiss(processToastId);
        toastError("Smart Buy Failed. Please try again.");
      }
    } catch (error: any) {
      if (approveToastId) toast.dismiss(approveToastId);
      if (processToastId) toast.dismiss(processToastId);
      console.error("Error in smart buy:", error);
      console.error("Error in quick buy:", error);

      // Handle specific error cases
      if (error.code === "INSUFFICIENT_FUNDS") {
        toastError("Insufficient funds to complete the transaction");
      } else if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        toastError(
          "Transaction would fail. Please check your input amounts and try again"
        );
      } else if (error.message?.includes("user rejected")) {
        toastError("Transaction was rejected by user");
      } else if (error.message?.includes("insufficient funds")) {
        toastError("Insufficient balance to complete the transaction");
      } else if (error.message?.includes("execution reverted")) {
        toastError("Transaction failed: Contract execution reverted");
      } else {
        // For other errors, show a more user-friendly message

        toastError(`Transaction failed. Please try again.`);
      }
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <div
      className={`w-[95%] mx-auto transition-all duration-300 ease-in-out ${
        isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="rounded-b-xl bg-primary-100/10 py-2 px-4 relative">
        <div className="relative flex flex-col pt-3">
          <div className="absolute top-3 right-1 flex justify-end items-start">
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
              Max Amount
            </label>
            <div className="relative items-center justify-center">
              <div className="relative w-full border border-primary-100/70 rounded flex flex-col items-start justify-center px-4">
                <div className="relative w-full flex flex-row items-center justify-between">
                  <input
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isLoading || isProcessing}
                    className=" py-3 bg-transparent rounded-lg text-white focus:outline-none focus:border-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter amount"
                  />
                  <button
                    className="flex items-center gap-2"
                    onClick={() => setIsFromCoinOpen((prev) => !prev)}
                  >
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
                    <button className="text-primary-100 hover:text-primary-100/80 transition-colors">
                      <TiArrowSortedDown className="size-5" />
                    </button>
                  </button>
                </div>
              </div>
              {/* Token Selector Dropdown */}
              {isFromCoinOpen && (
                <div
                  ref={coinSelectRef}
                  className="absolute z-[100] right-0  mt-2 w-48 overflow-auto border border-primary-100/20 backdrop-blur-sm bg-black/40 drop-shadow-lg rounded shadow-lg max-h-[200px]"
                  style={{ top: "100%" }}
                >
                  <div className="py-1">
                    {tokenOptions.map((token) => (
                      <button
                        key={token.symbol}
                        onClick={() => handleTokenSelect(token)}
                        disabled={token.symbol === "DEXTER" || isBalanceLoading}
                        className="w-full px-4 py-2 text-left text-white hover:bg-primary-100/10 flex border-b last:border-b-0 border-primary-100/20 items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                            Balance:{" "}
                            {isBalanceLoading ? (
                              <div className="inline-block animate-spin rounded-full h-2 w-2 border-b-2 border-gray-400"></div>
                            ) : (
                              Number(token.balance).toFixed(6)
                            )}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center my-2">
              <div className="text-gray-400 text-[11px] text-nowrap">
                Available:{" "}
                {isBalanceLoading ? (
                  <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-gray-400"></div>
                ) : selectedVitualtoken?.symbol === "ETH" ? (
                  Number(balances.ETH).toFixed(6)
                ) : (
                  Number(balances.VIRT).toFixed(6)
                )}
              </div>
              <div className="flex flex-row gap-1">
                {percentageButtons.map((percentage) => (
                  <button
                    key={percentage}
                    onClick={() => handlePercentageClick(percentage)}
                    disabled={isLoading || isProcessing || isBalanceLoading}
                    className={`text-white/80 text-[11px] rounded font-bold border ${
                      selectedPercentage == percentage
                        ? "border-primary-100"
                        : "border-[#818284]"
                    }  px-[0.1875rem]  disabled:bg-white/5 disabled:text-white/20`}
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
