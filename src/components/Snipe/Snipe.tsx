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

const Snipe = () => {
  const [selectedVirtual, setSelectedVirtual] = useState<IVirtual | null>(null);
  const [selectedToVirtual, setSelectedToVirtual] = useState<IVirtual | null>(
    null
  );
  const { networkData } = useLoginContext();
  const [isFromCoinOpen, setIsFromCoinOpen] = useState(false);
  const [isToCoinOpen, setIsToCoinOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"swap" | "create">("swap");
  const [fromAmount, setFromAmount] = useState<string>("");
  const [toAmount, setToAmount] = useState<string>("");
  const [buttonText, setButtonText] = useState<string>("Select Token");

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
    if (!selectedVirtual || !selectedToVirtual) {
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

  React.useEffect(() => {
    validationCheck();
  }, [selectedVirtual, selectedToVirtual, fromAmount, toAmount]);

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
    <div
      className={`w-full h-full overflow-y-auto lg:overflow-y-hidden lg:h-full flex-1 flex flex-row lg:px-14 sm:px-7 px-4 py-3 gap-3 justify-center`}
    >
      <div className={`w-full md:flex hidden overflow-hidden gap-3`}>
        <div className="sm:!w-[clamp(42%,34rem,47%)] min-w-[29.75rem] md:flex hidden  overflow-hidden">
          <div className="relative h-full w-full backdrop-blur-sm bg-[#15181B]/80 border border-primary-100 rounded-xl text-white flex flex-col ">
            {/* Genesis Launches Box */}

            <h2 className="text-lg md:text-xl font-semibold text-primary-100 text-center p-4 border-b border-primary-100/20">
              Genesis Launches
            </h2>
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
              <div className="space-y-4 max-w-full">
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

        <div className="w-full md:flex hidden overflow-hidden">
          <div className="relative  h-full w-full backdrop-blur-sm bg-[#15181B]/80 border border-primary-100 rounded-xl text-white flex flex-col">
            <div className="relative flex flex-row space-x-4 w-full border-b border-primary-100/20 text-base md:text-lg font-semibold text-white  text-center p-4">
              <button
                className={`${
                  selectedAgent == "Sentient Agents" &&
                  "underline underline-offset-8 text-primary-100"
                }`}
                onClick={() => setSelectedAgent("Sentient Agents")}
              >
                Sentient Agents
              </button>
              <button
                className={`${
                  selectedAgent == "Prototype Agents" &&
                  "underline underline-offset-8 text-primary-100"
                }`}
                onClick={() => setSelectedAgent("Prototype Agents")}
              >
                Prototype Agents
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-100"></div>
                </div>
              ) : error ? (
                <div className="text-red-500 text-center p-4">{error}</div>
              ) : (
                <div className="space-y-4">
                  {selectedAgent == "Prototype Agents"
                    ? prototypeVirtuals.map((virtual) => (
                        <div key={virtual.id} className="relative">
                          <VirtualCard
                            virtual={virtual}
                            onClick={() => handleCardClick(virtual)}
                          />
                        </div>
                      ))
                    : virtuals.map((virtual) => (
                        <div key={virtual.id} className="relative">
                          <VirtualCard
                            virtual={virtual}
                            onClick={() => handleCardClick(virtual)}
                          />
                        </div>
                      ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="sm:!w-[clamp(38%,30rem,43%)] min-w-[23.75rem] w-full flex justify-center items-center h-full ml-2">
        <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-y-hidden">
          <div className="flex items-center justify-between pt-6 px-8 ">
            <div className="flex gap-4">
              <button
                onClick={() => setSelectedTab("create")}
                className={`rounded-lg text-base font-semibold transition-colors ${
                  selectedTab === "create"
                    ? "underline underline-offset-[0.625rem] text-primary-100"
                    : " text-white"
                }`}
              >
                Create
              </button>
              <button
                onClick={() => setSelectedTab("swap")}
                className={`rounded-lg text-base font-semibold transition-colors ${
                  selectedTab === "swap"
                    ? "underline underline-offset-[0.625rem] text-primary-100"
                    : " text-white"
                }`}
              >
                Swap
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {/* Token Selection Modals */}
            {isFromCoinOpen && (
              <DialogContainer
                setClose={() => setIsFromCoinOpen(false)}
                title="Send From"
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
                title="Receive As"
              >
                <VirtualTokenSelector
                  setIsCoinOpen={setIsToCoinOpen}
                  fromOrTo="ToSelection"
                  setSelectedCoin={setSelectedToVirtual}
                  title="Receive As"
                />
              </DialogContainer>
            )}

            {selectedTab === "create" ? (
              <div className="px-8 py-6">
                <CreateAgentForm onClose={handleCloseCreateAgent} />
              </div>
            ) : (
              <div className="px-8 py-3">
                {/* From Section */}
                <div className="mt-4 border h-[90px] border-primary-100 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">From</span>
                    <span className="text-sm text-gray-400">
                      Balance: {balanceLoading ? "Loading..." : "0.00"}
                    </span>
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <button
                      className="flex flex-row w-full py-1 justify-start items-center cursor-pointer"
                      onClick={() => setIsFromCoinOpen(true)}
                    >
                      {selectedVirtual?.image?.url && (
                        <ImageNext
                          src={selectedVirtual.image.url}
                          className="size-9 rounded-full bg-white overflow-hidden"
                          alt="virtual-logo"
                          fullRadius
                        />
                      )}
                      <div
                        className={`flex flex-col ${
                          selectedVirtual ? "ml-2" : ""
                        } mr-1`}
                      >
                        <span className="text-base text-nowrap text-white font-bold !leading-tight">
                          {selectedVirtual?.symbol || "Select Token"}
                        </span>
                      </div>
                      <TiArrowSortedDown className="text-prime-token-200 size-5" />
                    </button>
                    <input
                      className="!outline-none text-white text-lg w-full placeholder:text-base text-right sm:font-bold [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent placeholder:text-prime-zinc-100"
                      type="text"
                      placeholder="Enter an amount"
                      value={fromAmount}
                      onChange={(e) => setFromAmount(e.target.value)}
                    />
                  </div>
                </div>

                {/* Swap Button */}
                <div className="flex justify-center mx-auto translate-y-[-10px] z-10">
                  <button
                    className="bg-primary-100 rounded-full p-2.5 filter hover:brightness-125 transition-all origin-center"
                    onClick={swapFields}
                  >
                    <LuArrowUpDown className="text-lg text-black text-prime-text-100 size-5" />
                  </button>
                </div>

                {/* To Section */}
                <div className=" h-[90px]  border border-primary-100 rounded-lg p-4 -translate-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">To</span>
                  </div>
                  <div className="w-full flex justify-between items-center">
                    <button
                      className="flex flex-row w-full py-1 justify-start items-center cursor-pointer"
                      onClick={() => setIsToCoinOpen(true)}
                    >
                      {selectedToVirtual?.image?.url && (
                        <ImageNext
                          src={selectedToVirtual.image.url}
                          className="size-9 rounded-full bg-white overflow-hidden"
                          alt="virtual-logo"
                          fullRadius
                        />
                      )}
                      <div
                        className={`flex flex-col ${
                          selectedToVirtual ? "ml-2" : ""
                        } mr-1`}
                      >
                        <span className="text-base text-nowrap text-white font-bold !leading-tight">
                          {selectedToVirtual?.symbol || "Select Token"}
                        </span>
                      </div>
                      <TiArrowSortedDown className="text-prime-token-200 size-5" />
                    </button>
                    <span className="text-base sm:font-bold text-white sm:text-lg">
                      {toAmount}
                    </span>
                  </div>
                </div>

                {/* Trade Button */}
                <button
                  className="w-full mt-6 py-3 px-4 bg-primary-100 text-black font-bold rounded-lg hover:bg-primary-100/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={buttonText !== "Trade"}
                >
                  {buttonText}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Snipe;
