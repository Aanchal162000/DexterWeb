"use client";

import React, { useState } from "react";
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
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWalletBalance } from "@/hooks/useWalletBalance";
import { toast } from "react-toastify";
import VirtualTokenSelector from "./VirtualTokenSelector";
import DialogContainer from "../Swap/DialogContainer";
import { LuArrowUpDown } from "react-icons/lu";
import ImageNext from "../common/ImageNext";
import { TiArrowSortedDown } from "react-icons/ti";
import buyService from "@/services/contract/buyService";
import { BuyContract, VIRTUALS_TOKEN_ADDRESS, WRAPPED_ETH_ADDRESS } from "@/constants/config";
import approvalService from "@/services/contract/approvalService";

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
  const [selectedToken] = useLocalStorage("default-token", {
    name: "Virtuals",
    symbol: "VIRT",
    logo: "/Networks/Base.png",
    balance: "0",
  });
  const { balances, isLoading: balanceLoading } = useWalletBalance();

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

  const handlePercentageSelect = async (
    virtual: IVirtual,
    percentage: number,
    type: "buy" | "sell"
  ) => {
    try {
      setActivePercentage(percentage);
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
    }
  };

  const handleQuickBuy = async (virtual: IVirtual, percentage: number) => {
    if (!address || balanceLoading || !selectedToken) {
      toast.error("Please connect your wallet and select a token");
      return;
    }
    const balance = balances[selectedToken.symbol] || "0";
    const amount = (Number(balance) * percentage) / 100;

    try {
      // Check if it's a prototype or sentient agent
      // const isPrototype = prototypeVirtuals.some((pv) => pv.id === virtual.id);
      // const contractAddress = isPrototype
      //   ? virtual.contractAddress
      //   : virtual.sentientContractAddress;

      // if (!contractAddress) {
      //   toast.error("Contract address not found");
      //   return;
      // }

      // Check if approval is needed
      const allowance = await approvalService.checkAllowance({
        tokenAddress: VIRTUALS_TOKEN_ADDRESS,
        provider: networkData?.provider!
      });

      // If allowance is less than amount, approve first
      if (Number(allowance) < amount) {
        await approvalService.approveVirtualToken(
          amount.toString(),
          networkData?.provider!
        );
      }

      const isETH = selectedToken.symbol === "ETH";
      const receipt = await buyService.buyToken(
        {
          amountIn: amount.toString(),
          amountOutMin: "0", // Set minimum amount or calculate slippage
          path: [isETH ? WRAPPED_ETH_ADDRESS : VIRTUALS_TOKEN_ADDRESS, virtual.contractAddress!],
          to: address,
          timestamp: Math.floor(Date.now() / 1000) + 86400, // 1 day from now
          provider: networkData?.provider!,
          selectedToken: selectedToken
        }
      );
      console.log("Transaction successful:", receipt);

      // After successful buy, refresh the virtuals data
      // if (isPrototype) {
      //   // Refresh prototype virtuals
      //   // Add your refresh logic here
      // } else {
      //   // Refresh sentient virtuals
      //   // Add your refresh logic here
      // }
    } catch (error) {
      console.error("Error in quick buy:", error);
      toast.error("Failed to Quick Buy");
    }
  };

  const handleQuickSell = async (virtual: IVirtual, percentage: number) => {
    if (!address || balanceLoading || !selectedToken) {
      toast.error("Please connect your wallet and select a token");
      return;
    }

    try {
      // Check if it's a prototype or sentient agent
      const isPrototype = prototypeVirtuals.some((pv) => pv.id === virtual.id);
      const contractAddress = isPrototype
        ? virtual.contractAddress
        : virtual.sentientContractAddress;

      if (!contractAddress) {
        toast.error("Contract address not found");
        return;
      }

      const balance = virtual.userBalance || "0";
      const amount = (Number(balance) * percentage) / 100;

      // Implement your sell logic here using the appropriate contract address
      console.log(
        `Selling ${amount} ${virtual.symbol} of ${virtual.name} using contract ${contractAddress}`
      );

      // After successful sell, refresh the virtuals data
      if (isPrototype) {
        // Refresh prototype virtuals
        // Add your refresh logic here
      } else {
        // Refresh sentient virtuals
        // Add your refresh logic here
      }
    } catch (error) {
      console.error("Error in quick sell:", error);
      toast.error("Failed to execute quick sell");
    }
  };

  const calculateAmount = (percentage: number, virtual?: IVirtual) => {
    if (!selectedToken || balanceLoading) return "0";
    if (showPercentages?.type === "sell" && virtual) {
      // For sell, calculate based on the virtual token's balance
      const balance = virtual.userBalance || 0;
      return ((Number(balance) * percentage) / 100).toFixed(4);
    }
    // For buy, calculate based on selected token's balance
    const balance = balances[selectedToken.symbol] || "0";
    return ((Number(balance) * percentage) / 100).toFixed(4);
  };

  const getTokenSymbol = (virtual: IVirtual) => {
    return showPercentages?.type === "sell"
      ? virtual.symbol
      : selectedToken?.symbol;
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
    <div className="w-full h-full overflow-y-auto lg:overflow-y-hidden lg:h-full flex-1 flex flex-row lg:px-14 sm:px-7 px-4 py-3 gap-4 justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-1 md:gap-3 h-full">
        {/* Genesis Launches Box */}
        <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-hidden flex flex-col">
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
                    onClick={() => {
                      // Handle click event
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Buy Box */}
        <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-hidden flex flex-col">
          <h2 className="text-lg md:text-xl font-semibold text-primary-100 text-center p-4 border-b border-primary-100/20">
            Sentient Agents
          </h2>
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-100"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center p-4">{error}</div>
            ) : (
              <div className="space-y-4">
                {virtuals.map((virtual) => (
                  <div key={virtual.id} className="relative">
                    <VirtualCard
                      virtual={virtual}
                      onClick={() => handleCardClick(virtual)}
                    />
                    <div className="mt-2 px-2 space-y-2">
                      <div className="flex gap-2 relative h-[40px]">
                        <div
                          className={`flex gap-2 w-full transition-all duration-300 ease-in-out ${
                            showPercentages?.id === virtual.id
                              ? "translate-x-[-100%] opacity-0"
                              : "translate-x-0 opacity-100"
                          }`}
                        >
                          <button
                            onClick={() =>
                              handleShowPercentages(virtual, "buy")
                            }
                            className="flex-1 bg-primary-100 text-black px-4 py-2 rounded-lg font-medium hover:bg-primary-200 transition-colors"
                          >
                            Quick Buy
                          </button>
                          {Number(virtual.userBalance) > 0 && (
                            <button
                              onClick={() =>
                                handleShowPercentages(virtual, "sell")
                              }
                              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                            >
                              Quick Sell
                            </button>
                          )}
                        </div>
                        {showPercentages?.id === virtual.id && (
                          <div
                            className={` absolute -top-7 left-0 w-full flex flex-col space-y-2 transform transition-all duration-300 ease-in-out z-10 ${
                              isAnimating
                                ? "translate-x-0 opacity-100"
                                : "translate-x-[100%] opacity-0"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1 translate-y-3">
                              <span className="text-sm text-gray-400">
                                {showPercentages.type === "buy"
                                  ? "Buy Amount"
                                  : "Sell Amount"}
                              </span>
                              <button
                                onClick={handleClosePercentages}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex justify-between gap-1 bg-[#15181B]  rounded-lg  ">
                              {percentages.map((percentage) => (
                                <button
                                  key={percentage}
                                  onClick={() => {
                                    handlePercentageSelect(
                                      virtual,
                                      percentage,
                                      showPercentages.type
                                    );
                                    handleClosePercentages();
                                  }}
                                  className={`px-2 py-1 rounded text-sm font-medium transition-colors ${
                                    activePercentage === percentage
                                      ? "bg-primary-100 text-black"
                                      : "bg-gray-700 text-primary-100 hover:bg-gray-600"
                                  }`}
                                >
                                  <div className="flex flex-col items-center">
                                    <span className="text-[10px] opacity-80">
                                      {calculateAmount(percentage, virtual)}{" "}
                                      {getTokenSymbol(virtual)}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Prototype Agents Box */}
        <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-hidden flex flex-col">
          <h2 className="text-lg md:text-xl font-semibold text-primary-100 text-center p-4 border-b border-primary-100/20">
            Prototype Agents
          </h2>
          <div className="flex-1 overflow-y-auto p-4">
            {prototypeLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-100"></div>
              </div>
            ) : prototypeError ? (
              <div className="text-red-500 text-center p-4">
                {prototypeError}
              </div>
            ) : (
              <div className="space-y-4">
                {prototypeVirtuals.map((virtual) => (
                  <div key={virtual.id} className="relative">
                    <VirtualCard
                      virtual={virtual}
                      onClick={() => handleCardClick(virtual)}
                    />
                    <div className="mt-2 px-2 space-y-2">
                      <div className="flex gap-2 relative h-[40px]">
                        <div
                          className={`flex gap-2 w-full transition-all duration-300 ease-in-out ${
                            showPercentages?.id === virtual.id
                              ? "translate-x-[-100%] opacity-0"
                              : "translate-x-0 opacity-100"
                          }`}
                        >
                          <button
                            onClick={() =>
                              handleShowPercentages(virtual, "buy")
                            }
                            className="flex-1 bg-primary-100 text-black px-4 py-2 rounded-lg font-medium hover:bg-primary-200 transition-colors"
                          >
                            Quick Buy
                          </button>
                          {Number(virtual.userBalance) > 0 && (
                            <button
                              onClick={() =>
                                handleShowPercentages(virtual, "sell")
                              }
                              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                            >
                              Quick Sell
                            </button>
                          )}
                        </div>
                        {showPercentages?.id === virtual.id && (
                          <div
                            className={`  absolute -top-7 left-0 w-full flex  flex-col space-y-2 transform transition-all duration-300 ease-in-out z-10 ${
                              isAnimating
                                ? "translate-x-0 opacity-100"
                                : "translate-x-[100%] opacity-0"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1 translate-y-3">
                              <span className="text-sm text-gray-400">
                                {showPercentages.type === "buy"
                                  ? "Buy Amount"
                                  : "Sell Amount"}
                              </span>
                              <button
                                onClick={handleClosePercentages}
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                ✕
                              </button>
                            </div>
                            <div className="flex justify-between gap-1 bg-[#15181B]  rounded-lg  ">
                              {percentages.map((percentage) => (
                                <button
                                  key={percentage}
                                  onClick={() => {
                                    handlePercentageSelect(
                                      virtual,
                                      percentage,
                                      showPercentages.type
                                    );
                                    handleClosePercentages();
                                  }}
                                  className={`px-2 py-1 border border-primary-100/60 rounded text-sm font-medium transition-colors ${
                                    activePercentage === percentage
                                      ? "bg-primary-100 text-black"
                                      : "bg-gray-700 text-primary-100 hover:bg-gray-600"
                                  }`}
                                >
                                  <div className="flex flex-col items-center">
                                    <span className="text-[10px] opacity-80">
                                      {calculateAmount(percentage, virtual)}{" "}
                                      {getTokenSymbol(virtual)}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create/Swap Box - Only show in desktop */}
        {!isMobile && (
          <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-hidden flex flex-col">
            <div className="flex items-center justify-between pt-4 px-8 ">
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedTab("create")}
                  className={`rounded-lg text-base font-semibold transition-colors ${
                    selectedTab === "create"
                      ? "undeline underline-offset-[0.625rem] text-primary-100"
                      : " text-white hover:bg-gray-700"
                  }`}
                >
                  Create
                </button>
                <button
                  onClick={() => setSelectedTab("swap")}
                  className={`rounded-lg text-base font-semibold transition-colors ${
                    selectedTab === "swap"
                      ? "underline underline-offset-[0.625rem] text-primary-100"
                      : " text-white hover:bg-gray-700"
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

              {selectedTab === "create" ? (
                <div className="p-4">
                  <CreateAgentForm onClose={handleCloseCreateAgent} />
                </div>
              ) : (
                <div className="px-8 py-2">
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
        )}
      </div>

      {/* Mobile Create Virtual Button */}
      {isMobile && (
        <button
          onClick={handleCreateAgentClick}
          className="fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-primary-100 text-black px-6 py-3 rounded-full shadow-lg font-semibold z-40"
        >
          Create Virtual
        </button>
      )}

      {/* Create Agent Modal */}
      {isCreatingAgent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#15181B] rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-primary-100">
                  Create Virtual
                </h2>
                <button
                  onClick={handleCloseCreateAgent}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <CreateAgentForm onClose={handleCloseCreateAgent} />
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {isDetailsModalOpen && selectedVirtual && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#15181B] rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-primary-100">
                  {selectedVirtual.name}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Basic Info */}
                <div className="flex items-start gap-6">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={selectedVirtual.image?.url || "/placeholder.png"}
                      alt={selectedVirtual.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Symbol</p>
                        <p className="text-white">{selectedVirtual.symbol}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Holders</p>
                        <p className="text-white">
                          {selectedVirtual.holderCount?.toLocaleString() || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">TVL</p>
                        <p className="text-white">
                          {formatCurrency(
                            selectedVirtual.totalValueLocked || 0
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">24h Volume</p>
                        <p className="text-white">
                          {formatCurrency(selectedVirtual.volume24h || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Token Info */}
                {selectedVirtual.virtualTokenValue &&
                  selectedVirtual.mcapInVirtual && (
                    <div className="bg-[#1A1E23] rounded-lg p-4">
                      <h3 className="text-lg font-semibold text-primary-100 mb-4">
                        Token Information
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-gray-400 text-sm">Token Price</p>
                          <p className="text-white">
                            {formatCurrency(
                              weiToEther(selectedVirtual.virtualTokenValue) *
                                selectedVirtual.mcapInVirtual
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Market Cap</p>
                          <p className="text-white">
                            {formatCurrency(selectedVirtual.mcapInVirtual)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">24h Change</p>
                          <p
                            className={`text-white ${
                              (selectedVirtual.priceChangePercent24h || 0) >= 0
                                ? "text-green-500"
                                : "text-red-500"
                            }`}
                          >
                            {formatPercentage(
                              selectedVirtual.priceChangePercent24h || 0
                            )}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400 text-sm">Price 24h Ago</p>
                          <p className="text-white">
                            {formatCurrency(
                              calculatePrice24hAgo(
                                weiToEther(selectedVirtual.virtualTokenValue) *
                                  selectedVirtual.mcapInVirtual,
                                selectedVirtual.priceChangePercent24h || 0
                              )
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-100 mb-2">
                    Description
                  </h3>
                  <p className="text-gray-300">{selectedVirtual.description}</p>
                </div>

                {/* Cores */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-100 mb-2">
                    Cores
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVirtual.cores?.map((core) => (
                      <span
                        key={core.coreId}
                        className="px-3 py-1 bg-primary-100/10 text-primary-100 rounded-full text-sm"
                      >
                        {core.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h3 className="text-lg font-semibold text-primary-100 mb-2">
                    Links
                  </h3>
                  <div className="flex gap-4">
                    {selectedVirtual.socials?.VERIFIED_LINKS?.TWITTER && (
                      <a
                        href={selectedVirtual.socials.VERIFIED_LINKS.TWITTER}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-100 hover:text-primary-200 flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                        Twitter
                      </a>
                    )}
                    {selectedVirtual.socials?.VERIFIED_LINKS?.WEBSITE && (
                      <a
                        href={selectedVirtual.socials.VERIFIED_LINKS.WEBSITE}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-100 hover:text-primary-200 flex items-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                        </svg>
                        Website
                      </a>
                    )}
                  </div>
                </div>

                {/* Genesis Info */}
                {selectedVirtual.genesis && (
                  <div>
                    <h3 className="text-lg font-semibold text-primary-100 mb-2">
                      Genesis Info
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-sm">Start Date</p>
                        <p className="text-white">
                          {new Date(
                            selectedVirtual.genesis.startsAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">End Date</p>
                        <p className="text-white">
                          {new Date(
                            selectedVirtual.genesis.endsAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Snipe;
