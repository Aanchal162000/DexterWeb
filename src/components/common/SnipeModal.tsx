import React, { useState, useEffect, useRef } from "react";
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
  networkCards,
} from "@/constants/config";
import { useLoginContext } from "@/context/LoginContext";
import { TiArrowSortedDown } from "react-icons/ti";
import SliderHandler from "./Slider";
import {
  addCommas,
  formatNumberWithCommas,
  formatNumberWithSuffix,
} from "@/utils/helper";
import useClickOutside from "@/hooks/useClickOutside";
import Slider from "./Slider";
import TransactionSuccessModal from "./TransactionSuccessModal";

interface SnipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  genesisId: string;
  name: string;
  walletAddress: string;
  endsAt: string;
  fetchSubscriptionData: () => Promise<void>;
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
  fetchSubscriptionData,
}) => {
  const { selectedVitualtoken, setSelctedVirtualToken } = useSwapContext();
  const { balances, isLoading: isBalanceLoading } = useWalletBalance();
  const { triggerAPIs } = useLoginContext();
  const balance =
    selectedVitualtoken.symbol === "ETH" ? balances.ETH : balances.VIRT;
  const calculatedAmount = (parseFloat(balance || "0") * 10) / 100;

  const [amount, setAmount] = useState(calculatedAmount.toFixed(4).toString());
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { networkData } = useLoginContext();
  const percentageButtons = [10, 25, 50, 100];
  const [isFromCoinOpen, setIsFromCoinOpen] = useState(false);
  const [selectedPercentage, setSelectPercentage] = useState<
    10 | 25 | 50 | 100 | number
  >(10);
  const [marketCapBuyRange, setMarketCapBuyRange] = useState<number>(10000000);
  const [activeControl, setActiveControl] = useState<"slider" | "input">(
    "slider"
  );
  const coinSelectRef = useRef<HTMLDivElement>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [swapHash, setSwapHash] = useState<string>("");
  const { networkData: selectedNetwork } = useLoginContext();
  const currentNetwork = networkCards.find(
    (network) => network.id === selectedNetwork?.chainId
  );

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

  const handleTokenSelect = (token: TokenOption) => {
    setSelctedVirtualToken(token);
    setIsFromCoinOpen(false);
    // Reset amount when token changes
    setAmount("");
  };
  useEffect(() => {
    handlePercentageClick(10);
  }, [balances]);

  useEffect(() => {
    setIsButtonDisabled(
      !amount || parseFloat(amount) <= 0 || isLoading || isProcessing
    );
  }, [amount, isLoading, isProcessing]);

  const handlePercentageClick = (percentage: number) => {
    if (!selectedVitualtoken || isLoading || isProcessing) return;
    setSelectPercentage(percentage);
    const balance =
      selectedVitualtoken.symbol === "ETH" ? balances.ETH : balances.VIRT;
    const calculatedAmount = (parseFloat(balance || "0") * percentage) / 100;
    setAmount(calculatedAmount.toFixed(4).toString());
  };

  const handleMarketCapChange = (value: number) => {
    setMarketCapBuyRange(value);
    setActiveControl("slider");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and empty string
    if (value === "" || /^\d*$/.test(value)) {
      setMarketCapBuyRange(value === "" ? 0 : Number(value));
      setActiveControl("input");
    }
  };

  const handleSnipe = async () => {
    if (!selectedVitualtoken || isLoading || isProcessing) return;

    let approveToastId: string | number | null = null;
    let processToastId: string | number | null = null;

    try {
      setIsLoading(true);
      setIsProcessing(true);
      processToastId = toast.info("Processing Transaction...", {
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
      });

      const isEth = selectedVitualtoken.symbol === "ETH" ? true : false;

      if (!isEth) {
        try {
          // approveToastId = toast.info("Checking token allowance...", {
          //   autoClose: false,
          //   closeOnClick: false,
          //   closeButton: false,
          // });
          const allowance = await approvalService.checkAllowance({
            tokenAddress: VIRTUALS_TOKEN_ADDRESS,
            provider: networkData?.provider!,
            spenderAddress: SnipeContract,
          });

          // Convert amount to number and add buffer
          const amountWithBuffer = Number(amount) + 0.001 * Number(amount);

          // Ensure we have valid numbers for comparison
          if (isNaN(amountWithBuffer)) {
            throw new Error("Invalid amount value");
          }

          // If allowance is less than amount, approve first
          if (Number(allowance) < amountWithBuffer) {
            if (approveToastId) toast.dismiss(approveToastId);
            approveToastId = toast.info("Approving token spend...", {
              autoClose: false,
              closeOnClick: false,
              closeButton: false,
            });
            await approvalService.approveVirtualToken(
              (Number(amount) + 0.1).toString(),
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

      const receipt = await agentService.deposit({
        tokenAddress: isEth ? WRAPPED_ETH_ADDRESS : VIRTUALS_TOKEN_ADDRESS,
        amount: amount,
        provider: networkData?.provider!,
      });

      if (receipt.transactionHash) {
        // Convert to wei without scientific notation
        const amountInWei = BigInt(
          Math.floor(Number(amount) * 10 ** 18) -
            Math.floor(Number(amount) * 0.003 * 10 ** 18)
        ).toString();
        console.log("amountinWei", amountInWei);
        const response = await agentService.createAgent({
          genesisId,
          name,
          // walletAddress,
          // token: selectedVitualtoken.symbol === "ETH" ? "eth" : "virtual",
          // amount: amountInWei,
          launchTime: new Date(endsAt),
          marketCap: marketCapBuyRange.toString(),
          txHash: receipt.transactionHash,
        });
        triggerAPIs();
        fetchSubscriptionData();

        if (!response.success) {
          throw new Error(response.message);
        }
        if (processToastId) toast.dismiss(processToastId);
        setSwapHash(receipt.transactionHash);
        setShowSuccessModal(true);
        onClose();
      } else {
        if (processToastId) toast.dismiss(processToastId);
        toast.error("Snipe Failed!");
      }
    } catch (error: any) {
      if (approveToastId) toast.dismiss(approveToastId);
      if (processToastId) toast.dismiss(processToastId);
      console.error("Error in snipe:", error);
      console.error("Error in quick buy:", error);

      // Handle specific error cases
      if (error.code === "INSUFFICIENT_FUNDS") {
        toast.error("Insufficient funds to complete the transaction");
      } else if (error.code === "UNPREDICTABLE_GAS_LIMIT") {
        toast.error(
          "Transaction would fail. Please check your input amounts and try again"
        );
      } else if (error.message?.includes("user rejected")) {
        toast.error("Transaction was rejected by user");
      } else if (error.message?.includes("insufficient funds")) {
        toast.error("Insufficient balance to complete the transaction");
      } else if (error.message?.includes("execution reverted")) {
        toast.error("Transaction failed: Contract execution reverted");
      } else {
        // For other errors, show a more user-friendly message
        const errorMessage = error.message || "Unknown error occurred";
        toast.error(`Transaction failed`);
      }
    } finally {
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div
        className={`w-[95%] mx-auto transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="rounded-b-xl bg-primary-100/10 py-2 px-4">
          <div className="relative flex flex-col pt-3">
            <div className="absolute top-3 right-1 flex justify-end items-start">
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
                Max Amount
              </label>
              <div className="relative items-center justify-center">
                <div className="relative w-full border border-primary-100/70 rounded flex flex-col items-start justify-center px-4">
                  <div className="relative w-full flex flex-row items-center justify-between px-2">
                    <input
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      disabled={isLoading || isProcessing}
                      className="w-full  py-3 bg-transparent rounded-lg text-white focus:outline-none focus:border-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
              </div>

              {/* Token Selector Dropdown */}
              {isFromCoinOpen && (
                <div
                  ref={coinSelectRef}
                  className="absolute right-0 mt-2 w-48  border border-primary-100/30  backdrop-blur-sm  bg-black/40 drop-shadow-lg rounded shadow-lg z-10"
                >
                  <div className="py-1">
                    {tokenOptions.map((token) => (
                      <button
                        key={token.symbol}
                        onClick={() => handleTokenSelect(token)}
                        disabled={token.symbol === "DEXTER" || isBalanceLoading}
                        className={`disabled:opacity-50 disabled:cursor-not-allowed w-full px-4 py-2 text-left text-white hover:bg-primary-100/10 flex items-center gap-2 ${
                          token?.symbol != "VIRT"
                            ? "border-t border-primary-100/30"
                            : ""
                        }`}
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

              <div className="flex justify-between items-center my-2">
                <div className="text-gray-300 text-[11px] text-nowrap">
                  Available:{" "}
                  {isBalanceLoading ? (
                    <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-gray-300"></div>
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
            <div className="mt-2">
              <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-300 mb-2"
              >
                Market Cap Buy Range
              </label>
              <div className="relative items-center justify-center">
                <div className="relative w-full border border-primary-100/70 rounded flex flex-col items-start justify-center px-4">
                  <input
                    id="marketCap"
                    value={formatNumberWithCommas(marketCapBuyRange)}
                    onChange={handleInputChange}
                    onFocus={() => setActiveControl("input")}
                    disabled={isLoading || isProcessing}
                    className="w-full py-3 bg-transparent rounded-lg text-white focus:outline-none focus:border-primary-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter market cap"
                  />
                </div>
              </div>
              <div className="flex justify-between items-center my-2 px-2">
                <Slider
                  marketCapBuyRange={
                    activeControl === "slider" ? marketCapBuyRange : 0
                  }
                  setMarketCapBuyRange={handleMarketCapChange}
                />
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
                  "Smart Buy"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <TransactionSuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        transactionHash={swapHash || ""}
        explorerUrl={currentNetwork?.explorer || ""}
        title="Snipe Successful"
        message="Your snipe transaction has been completed successfully!"
      />
    </>
  );
};

export default SnipeModal;
