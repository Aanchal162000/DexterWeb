"use client";

import React, { useEffect, useState } from "react";
import { IVirtual } from "@/utils/interface";
import VirtualCard from "./VirtualCard";
import CreateAgentForm from "./CreateAgentForm";
import { useMediaQuery } from "react-responsive";
import { useSentientVirtuals } from "@/hooks/useSentientVirtuals";
import Image from "next/image";
import {
  formatCurrency,
  formatPercentage,
  calculatePrice24hAgo,
  weiToEther,
} from "@/utils/tokenCalculations";
import { useGenesis } from "@/hooks/useGenesis";
import GenesisCard from "./GenesisCard";
import { usePrototypeVirtuals } from "@/hooks/usePrototypeVirtuals";
import { useLoginContext } from "@/context/LoginContext";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { toast } from "react-toastify";
import VirtualTokenSelector from "./VirtualTokenSelector";
import DialogContainer from "../Swap/DialogContainer";
import { LuArrowUpDown } from "react-icons/lu";
import ImageNext from "../common/ImageNext";
import { TiArrowSortedDown } from "react-icons/ti";
import buyService from "@/services/contract/buyService";
import {
  BuyContract,
  VIRTUALS_TOKEN_ADDRESS,
  WRAPPED_ETH_ADDRESS,
} from "@/constants/config";
import approvalService from "@/services/contract/approvalService";
import { useSwapContext } from "@/context/SwapContext";
import SwapSection from "./SwapSection";
import useEffectAsync from "@/hooks/useEffectAsync";

const Snipe = () => {
  const { networkData } = useLoginContext();
  const [isFromCoinOpen, setIsFromCoinOpen] = useState(false);
  const [isToCoinOpen, setIsToCoinOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"swap" | "create">("swap");
  const [fromAmount, setFromAmount] = useState<number>(0.0);
  const [toAmount, setToAmount] = useState<number>(0.0);
  const [buttonText, setButtonText] = useState<string>("Select Token");
  const [isConfirmPop, setIsConfirmPop] = useState<boolean>(false);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);

  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [activePercentage, setActivePercentage] = useState<number | null>(null);

  const [showPercentages, setShowPercentages] = useState<{
    id: string;
    type: "buy" | "sell";
  } | null>(null);

  const [isAnimating, setIsAnimating] = useState(false);

  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { virtuals, loading, error } = useSentientVirtuals();
  const { address } = useLoginContext();
  const { selectedVitualtoken } = useSwapContext();
  const { balances, isLoading: balanceLoading } = useWalletBalance();
  const [selectedAgent, setSelectedAgent] = useState("Sentient Agents");

  const {
    data: genesisData,
    loading: genesisLoading,
    error: genesisError,
  } = useGenesis();

  const {
    virtuals: prototypeVirtuals,
    loading: prototypeLoading,
    error: prototypeError,
  } = usePrototypeVirtuals();

  const [processingVirtuals, setProcessingVirtuals] = useState<{
    [key: string]: {
      buy: boolean;
      sell: boolean;
    };
  }>({});
  const [selectedVirtual, setSelectedVirtual] = useState<IVirtual | null>(
    virtuals[0]
  );
  const [selectedToVirtual, setSelectedToVirtual] = useState<IVirtual | null>(
    virtuals[1]
  );

  const [isBalanceLoading, setIsBalanceLoading] = useState(false);

  // Add useEffect to set selected tokens when sentient agents are loaded
  useEffect(() => {
    if (virtuals.length >= 2 && !loading) {
      setSelectedVirtual(virtuals[0]);
      setSelectedToVirtual(virtuals[1]);
    }
  }, [virtuals, loading]);

  // Add useEffect to fetch subscription data
  const fetchSubscriptionData = async () => {
    if (address) {
      try {
        const response = await fetch(
          `https://dexter-backend-ucdt5.ondigitalocean.app/api/agent/subscriptions/${address}`
        );

        const data = await response.json();
        setSubscriptionData(data?.data);
      } catch (error) {
        console.error("Error fetching subscription data:", error);
        toast.error("Failed to fetch subscription data");
      }
    }
  };
  useEffect(() => {
    fetchSubscriptionData();
  }, [address]);

  const handleSwap = async () => {
    if (!address || balanceLoading || !selectedVirtual || !selectedToVirtual) {
      toast.error("Please connect your wallet and select a token");
      return;
    }

    try {
      toast.info("Starting swap process...", { autoClose: false });
      const allowance = await approvalService.checkAllowance({
        tokenAddress: selectedVirtual.contractAddress!,
        provider: networkData?.provider!,
      });

      // If allowance is less than amount, approve first
      if (Number(allowance) < Number(fromAmount)) {
        toast.info("Approving token spend...");
        await approvalService.approveVirtualToken(
          fromAmount.toString(),
          networkData?.provider!,
          selectedVirtual.contractAddress!,
          BuyContract
        );
        toast.success("Token approved successfully!");
      }
      toast.info("Processing Swap transaction...");

      const receipt = await buyService.buyToken({
        amountIn: fromAmount.toString(),
        amountOutMin: toAmount.toString(), // Set minimum amount or calculate slippage
        path: [
          selectedVirtual.contractAddress!,
          selectedToVirtual.contractAddress!,
        ],
        to: address,
        timestamp: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
        provider: networkData?.provider!,
        selectedToken: {
          logo: "",
          name: "VIRT",
          symbol: "",
          balance: "0",
        },
      });

      toast.success("Swap transaction successful! 🎉");
      console.log("Transaction successful:", receipt);
    } catch (error) {
      console.error("Error in quick buy:", error);
      toast.error(
        "Failed to Swap: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      throw error;
    }
  };
  useEffectAsync(async () => {
    if (selectedVirtual || selectedToVirtual) {
      setIsBalanceLoading(true);
      try {
        if (selectedVirtual) {
          const value = await approvalService.balanceOf({
            tokenAddress: selectedVirtual.contractAddress!,
            provider: networkData?.provider!,
          });
          selectedVirtual.userBalance = Number(value);
        }
        if (selectedToVirtual) {
          const value = await approvalService.balanceOf({
            tokenAddress: selectedToVirtual.contractAddress!,
            provider: networkData?.provider!,
          });
          selectedToVirtual.userBalance = Number(value);
        }
      } catch (error) {
        console.error("Error fetching balance:", error);
      } finally {
        setIsBalanceLoading(false);
      }
    }
  }, [selectedVirtual, selectedToVirtual]);

  const handleCloseCreateAgent = () => {
    setIsCreatingAgent(false);
  };

  const handleCardClick = (virtual: IVirtual) => {
    setSelectedVirtual(virtual);
    setIsDetailsModalOpen(true);
  };

  function validationCheck() {
    if (loading) {
      setButtonText("Loading...");
    } else if (!selectedVirtual || !selectedToVirtual) {
      setButtonText("Select Token");
    } else if (fromAmount == 0 || toAmount == 0) {
      setButtonText("Enter Amount");
    } else {
      setButtonText("Trade");
    }
  }

  function swapFields() {
    const tempFrom = selectedVirtual;
    const tempTo = selectedToVirtual;
    setSelectedVirtual(tempTo);
    setSelectedToVirtual(tempFrom);
  }

  useEffect(() => {
    validationCheck();
  }, [selectedVirtual, selectedToVirtual, fromAmount, toAmount, loading]);

  return (
    <div className="w-full h-full overflow-y-auto lg:overflow-y-hidden lg:h-full flex-1 flex flex-col lg:flex-row lg:px-14 sm:px-7 px-4 py-3 gap-3 justify-center">
      {/* Main content area - now flex-col on mobile, flex-row on larger screens */}
      <div className="w-full flex flex-col lg:flex-row gap-3">
        {/* Left section containing all three boxes */}
        <div className="w-full h-full grid grid-cols-3 gap-3">
          {/* Genesis Launches Box */}
          <div className="h-full w-full backdrop-blur-sm bg-[#15181B]/80 border border-primary-100 rounded-xl text-white flex flex-col overflow-hidden">
            <h2 className="text-lg md:text-xl font-semibold text-primary-100 text-center p-4">
              Genesis Launches
            </h2>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
              <div className="space-y-4">
                {genesisLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-100"></div>
                  </div>
                ) : genesisError ? (
                  <div className="text-red-500 text-center p-4">
                    {genesisError}
                  </div>
                ) : (
                  genesisData?.data.map((genesis) => (
                    <GenesisCard
                      key={genesis.id}
                      genesis={genesis}
                      onClick={() => {}}
                      subscriptionData={subscriptionData}
                      fetchSubscriptionData={fetchSubscriptionData}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
          {/* Sentient Agents Box */}
          <div className="h-full w-full backdrop-blur-sm bg-[#15181B]/80 border border-primary-100 rounded-xl text-white flex flex-col overflow-hidden">
            <h2 className="text-lg md:text-xl font-semibold text-primary-100 text-center p-4">
              Sentient Agents
            </h2>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
              <div className="space-y-4">
                {genesisLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-100"></div>
                  </div>
                ) : genesisError ? (
                  <div className="text-red-500 text-center p-4">
                    {genesisError}
                  </div>
                ) : (
                  virtuals.map((virtual) => (
                    <VirtualCard
                      key={virtual.id}
                      virtual={virtual}
                      onClick={() => handleCardClick(virtual)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
          {/* Prototype Agents Box */}
          <div className="h-full w-full backdrop-blur-sm bg-[#15181B]/80 border border-primary-100 rounded-xl text-white flex flex-col overflow-hidden">
            <h2 className="text-lg md:text-xl font-semibold text-primary-100 text-center p-4">
              Prototype Agents
            </h2>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
              <div className="space-y-4">
                {genesisLoading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-100"></div>
                  </div>
                ) : genesisError ? (
                  <div className="text-red-500 text-center p-4">
                    {genesisError}
                  </div>
                ) : (
                  prototypeVirtuals.map((virtual) => (
                    <VirtualCard
                      key={virtual.id}
                      virtual={virtual}
                      onClick={() => handleCardClick(virtual)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Swap/Create Section */}
        <div className="w-full sm:!w-[clamp(24%,26.8rem,39%)] min-w-[23.75rem] flex-shrink-0 flex justify-center items-center h-full lg:ml-2">
          <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-y-hidden">
            <div className="gap-x-5 flex flex-row items-center justify-around lg:justify-start border-[#818284] w-full px-4 lg:px-8 py-4 lg:py-6">
              <button
                className={`flex flex-row items-center justify-center font-semibold underline-offset-[0.625rem] text-sm sm:text-base ${
                  selectedTab === "swap"
                    ? "text-primary-100 underline"
                    : "text-white/60"
                }`}
                onClick={() => setSelectedTab("swap")}
              >
                Swap
              </button>
              <button
                className={`flex flex-row items-center justify-center font-semibold underline-offset-[0.625rem] text-sm sm:text-base ${
                  selectedTab === "create"
                    ? "text-primary-100 underline"
                    : "text-white/60"
                }`}
                onClick={() => setSelectedTab("create")}
              >
                Create
              </button>

              <button
                className="text-white/60 text-xs ml-auto"
                onClick={() => {}}
              >
                Reset
              </button>
            </div>

            {selectedTab === "swap" && (
              <SwapSection
                selectedVirtual={selectedVirtual}
                selectedToVirtual={selectedToVirtual}
                fromAmount={fromAmount}
                toAmount={toAmount}
                setIsFromCoinOpen={setIsFromCoinOpen}
                setIsToCoinOpen={setIsToCoinOpen}
                setFromAmount={setFromAmount}
                setToAmount={setToAmount}
                swapFields={swapFields}
                buttonText={buttonText}
                setIsConfirmPop={setIsConfirmPop}
                isBalanceLoading={isBalanceLoading}
              />
            )}

            {isFromCoinOpen && (
              <DialogContainer
                setClose={() => setIsFromCoinOpen(false)}
                title="Select Token"
              >
                <VirtualTokenSelector
                  setIsCoinOpen={setIsFromCoinOpen}
                  fromOrTo="FromSelection"
                  setSelectedCoin={setSelectedVirtual}
                  title="Send From"
                  sentientVirtuals={virtuals}
                  prototypeVirtuals={prototypeVirtuals}
                  sentientLoading={loading}
                  prototypeLoading={prototypeLoading}
                />
              </DialogContainer>
            )}

            {isToCoinOpen && (
              <DialogContainer
                setClose={() => setIsToCoinOpen(false)}
                title="Select Token"
              >
                <VirtualTokenSelector
                  setIsCoinOpen={setIsToCoinOpen}
                  fromOrTo="ToSelection"
                  setSelectedCoin={setSelectedToVirtual}
                  title="Receive As"
                  sentientVirtuals={virtuals}
                  prototypeVirtuals={prototypeVirtuals}
                  sentientLoading={loading}
                  prototypeLoading={prototypeLoading}
                />
              </DialogContainer>
            )}

            {isConfirmPop && (
              <DialogContainer
                setClose={() => setIsConfirmPop(false)}
                title="Transaction Confirmation"
              >
                <div className="p-4">
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-medium">Confirm Swap</h3>
                    <p className="text-sm text-gray-400 mt-1">
                      You are about to swap {fromAmount} {selectedVirtual?.name}{" "}
                      for {toAmount} {selectedToVirtual?.name}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <button
                      className="flex-1 py-2 px-4 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
                      onClick={() => setIsConfirmPop(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="flex-1 py-2 px-4 bg-primary-100 text-black rounded-lg hover:brightness-125 transition-all"
                      onClick={async () => {
                        setIsConfirmPop(false);
                        await handleSwap();
                      }}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </DialogContainer>
            )}

            {selectedTab === "create" && (
              <div className="px-4 lg:px-8">
                <CreateAgentForm onClose={handleCloseCreateAgent} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Snipe;
