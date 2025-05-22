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

const Snipe = () => {
  const { networkData } = useLoginContext();
  const [isFromCoinOpen, setIsFromCoinOpen] = useState(false);
  const [isToCoinOpen, setIsToCoinOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"swap" | "create">("swap");
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [buttonText, setButtonText] = useState<string>("Select Token");
  const [isConfirmPop, setIsConfirmPop] = useState<boolean>(false);

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

  // Add useEffect to set selected tokens when sentient agents are loaded
  useEffect(() => {
    if (virtuals.length >= 2 && !loading) {
      setSelectedVirtual(virtuals[0]);
      setSelectedToVirtual(virtuals[1]);
    }
  }, [virtuals, loading]);

  const handlePercentageSelect = async (
    virtual: IVirtual,
    percentage: number,
    type: "buy" | "sell"
  ) => {
    if (processingVirtuals[virtual.id]?.[type]) return;

    try {
      setActivePercentage(percentage);
      setProcessingVirtuals((prev) => ({
        ...prev,
        [virtual.id]: {
          ...prev[virtual.id],
          [type]: true,
        },
      }));

      if (type === "buy") {
        await handleQuickBuy(virtual, percentage);
        toast.success(
          `Successfully bought ${calculateAmount(
            percentage,
            virtual
          )} ${getTokenSymbol(virtual)} of ${virtual.name}`
        );
      } else {
        await handleQuickSell(virtual, percentage);
        toast.success(
          `Successfully sold ${calculateAmount(
            percentage,
            virtual
          )} ${getTokenSymbol(virtual)} of ${virtual.name}`
        );
      }
      setShowPercentages(null);
    } catch (error) {
      toast.error(`Failed to ${type} ${virtual.name}`);
      console.error(error);
    } finally {
      setProcessingVirtuals((prev) => ({
        ...prev,
        [virtual.id]: {
          ...prev[virtual.id],
          [type]: false,
        },
      }));
    }
  };

  const handleQuickBuy = async (virtual: IVirtual, percentage: number) => {
    if (!address || balanceLoading || !selectedVitualtoken) {
      toast.error("Please connect your wallet and select a token");
      return;
    }

    try {
      toast.info("Starting quick buy process...", { autoClose: false });
      const balance = balances[selectedVitualtoken.symbol] || "0";
      const amount = (Number(balance) * percentage) / 100;

      const allowance = await approvalService.checkAllowance({
        tokenAddress: VIRTUALS_TOKEN_ADDRESS,
        provider: networkData?.provider!,
      });

      // If allowance is less than amount, approve first
      if (Number(allowance) < amount) {
        toast.info("Approving token spend...");
        await approvalService.approveVirtualToken(
          amount.toString(),
          networkData?.provider!,
          VIRTUALS_TOKEN_ADDRESS,
          BuyContract
        );
        toast.success("Token approved successfully!");
      }

      toast.info("Processing buy transaction...");
      const isETH = selectedVitualtoken.symbol === "ETH";
      const receipt = await buyService.buyToken({
        amountIn: amount.toString(),
        amountOutMin: "0", // Set minimum amount or calculate slippage
        path: [
          isETH ? WRAPPED_ETH_ADDRESS : VIRTUALS_TOKEN_ADDRESS,
          virtual.contractAddress!,
        ],
        to: address,
        timestamp: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
        provider: networkData?.provider!,
        selectedToken: selectedVitualtoken,
      });

      toast.success("Buy transaction successful! 🎉");
      console.log("Transaction successful:", receipt);
    } catch (error) {
      console.error("Error in quick buy:", error);
      toast.error(
        "Failed to Quick Buy: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      throw error;
    }
  };

  const handleQuickSell = async (virtual: IVirtual, percentage: number) => {
    if (!address || balanceLoading || !selectedVitualtoken) {
      toast.error("Please connect your wallet and select a token");
      return;
    }

    try {
      toast.info("Starting quick Sell process...", { autoClose: false });

      const amount = (Number(virtual?.userBalance) * percentage) / 100;
      const allowance = await approvalService.checkAllowance({
        tokenAddress: virtual.contractAddress!,
        provider: networkData?.provider!,
      });

      // If allowance is less than amount, approve first
      if (Number(allowance) < amount) {
        toast.info("Approving token spend...");
        await approvalService.approveVirtualToken(
          amount.toString(),
          networkData?.provider!,
          virtual.contractAddress!,
          BuyContract
        );
        toast.success("Token approved successfully!");
      }

      toast.info("Processing Sell transaction...");
      const isETH = selectedVitualtoken.symbol === "ETH";
      const receipt = await buyService.buyToken({
        amountIn: amount.toString(),
        amountOutMin: "0", // Set minimum amount or calculate slippage
        path: [
          virtual.contractAddress!,
          isETH ? WRAPPED_ETH_ADDRESS : VIRTUALS_TOKEN_ADDRESS,
        ],
        to: address,
        timestamp: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
        provider: networkData?.provider!,
        selectedToken: {
          logo: "",
          symbol: `GET${selectedVitualtoken.symbol}`,
          name: virtual.name,
          balance: virtual.userBalance?.toString()!,
        },
      });

      toast.success("Sell transaction successful! 🎉");
      console.log("Transaction successful:", receipt);
    } catch (error) {
      console.error("Error in quick buy:", error);
      toast.error(
        "Failed to Quick Buy: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
      throw error;
    }
  };

  const calculateAmount = (percentage: number, virtual?: IVirtual) => {
    if (!selectedVitualtoken || balanceLoading) return "0";
    if (showPercentages?.type === "sell" && virtual) {
      // For sell, calculate based on the virtual token's balance
      const balance = virtual.userBalance || 0;
      return ((Number(balance) * percentage) / 100).toFixed(4);
    }
    // For buy, calculate based on selected token's balance
    const balance = balances[selectedVitualtoken.symbol] || "0";
    return ((Number(balance) * percentage) / 100).toFixed(4);
  };

  const getTokenSymbol = (virtual: IVirtual) => {
    return showPercentages?.type === "sell"
      ? virtual.symbol
      : selectedVitualtoken?.symbol;
  };

  const handleCloseModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedVirtual(null);
  };

  const handleCreateAgentClick = () => {
    setIsCreatingAgent(true);
  };

  const handleCloseCreateAgent = () => {
    setIsCreatingAgent(false);
  };

  const handleCardClick = (virtual: IVirtual) => {
    setSelectedVirtual(virtual);
    setIsDetailsModalOpen(true);
  };

  const percentages = [10, 25, 50, 75, 100];

  function validationCheck() {
    if (loading) {
      setButtonText("Loading...");
    } else if (!selectedVirtual || !selectedToVirtual) {
      setButtonText("Select Token");
    } else if (!fromAmount || !toAmount) {
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

  const handleShowPercentages = (virtual: IVirtual, type: "buy" | "sell") => {
    setIsAnimating(true);
    setShowPercentages({ id: virtual.id, type });
  };

  const handleClosePercentages = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowPercentages(null);
    }, 300); // Match this with the animation duration
  };

  return (
    <div className="w-full h-full overflow-y-auto lg:overflow-y-hidden lg:h-full flex-1 flex flex-col lg:flex-row lg:px-14 sm:px-7 px-4 py-3 gap-3 justify-center">
      {/* Main content area - now flex-col on mobile, flex-row on larger screens */}
      <div className="w-full flex flex-col lg:flex-row gap-3">
        {/* Left section containing all three boxes */}
        <div className="w-full grid grid-cols-3 gap-3">
          {/* Genesis Launches Box */}
          <div className="h-[calc(100vh-10.5rem)]">
            <div className="h-full w-full backdrop-blur-sm bg-[#15181B]/80 border border-primary-100 rounded-xl text-white flex flex-col">
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
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Sentient Agents Box */}
          <div className="h-[calc(100vh-10.5rem)]">
            <div className="h-full w-full backdrop-blur-sm bg-[#15181B]/80 border border-primary-100 rounded-xl text-white flex flex-col">
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
          </div>
          {/* Prototype Agents Box */}
          <div className="h-[calc(100vh-10.5rem)]">
            <div className="h-full w-full backdrop-blur-sm bg-[#15181B]/80 border border-primary-100 rounded-xl text-white flex flex-col">
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
                      onClick={() => {
                        setIsConfirmPop(false);
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
