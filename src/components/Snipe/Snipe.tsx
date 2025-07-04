"use client";

import React, { useEffect, useState } from "react";

import { useSentientVirtuals } from "@/hooks/useSentientVirtuals";
import { useGenesis } from "@/hooks/useGenesis";
import { usePrototypeVirtuals } from "@/hooks/usePrototypeVirtuals";
import { useLoginContext } from "@/context/LoginContext";
import CreateAgentForm from "./CreateAgentForm";
import SnipeSwap from "./SnipeSwap";
import clsx from "clsx";
import Image from "next/image";
import { toast } from "react-toastify";
import GenesisCard from "./GenesisCard";
import VirtualCard from "./VirtualCard";

import AgentSection from "./AgentSection";
import FilterDropdown from "./FilterDropdown";
import AlertsSettings from "./AlertsSettings";
import { useSettings } from "@/context/SettingsContext";

import VirtualTransactions from "./VirtualTransactions";
import { useMediaQuery } from "react-responsive";

const Snipe = () => {
  const [selectedTab, setSelectedTab] = useState<"swap" | "create">("swap");
  const { virtuals, loading, error, fetchVirtuals } = useSentientVirtuals();
  const { address, isFromHeader, setIsFromHeader } = useLoginContext();
  const isMd = useMediaQuery({ minWidth: 768 });

  const {
    data: genesisData,
    loading: genesisLoading,
    error: genesisError,
    fetchGenesis,
  } = useGenesis();

  const {
    virtuals: prototypeVirtuals,
    loading: prototypeLoading,
    error: prototypeError,
    fetchVirtuals: fetchPrototypeVirtuals,
  } = usePrototypeVirtuals();
  const [selectedSnipeTab, setSelectedSnipeTab] = useState<
    "aiAgents" | "transaction" | null
  >("aiAgents");
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [selectedFilter, setSelectedFilter] = useState<any>();
  const [isDescending, setIsDescending] = useState(true);
  const [resetCount, setResetCount] = useState<number>(0);
  const { showSettings, setShowSettings } = useSettings();
  const [bottomTab, setBottomTab] = useState<"list" | "dex">("list");

  const filterOptions = [
    { id: "24hrsChange", name: "24hrs Change" },
    { id: "volume", name: "Volume" },
    { id: "holders", name: "Holders" },
  ];
  useEffect(() => {
    if (!isFromHeader) {
      setShowSettings(false);
    } else {
      setSelectedSnipeTab(null);
    }
  }, []);
  useEffect(() => {
    if (isFromHeader) {
      setSelectedSnipeTab(null);
    }
  }, [isFromHeader]);

  const handleFilterSelect = (option: any, isDescending: boolean) => {
    setSelectedFilter(option);
    setIsDescending(isDescending);
  };

  const sortVirtuals = (virtuals: any[]) => {
    if (!virtuals) return [];

    // If no filter is selected, return the original array
    if (!selectedFilter) return virtuals;

    const sortedVirtuals = [...virtuals];
    const sortKey =
      selectedFilter?.id === "24hrsChange"
        ? "priceChangePercent24h"
        : selectedFilter?.id === "volume"
        ? "volume24h"
        : "holderCount";

    return sortedVirtuals.sort((a, b) => {
      const aValue = a[sortKey] || 0;
      const bValue = b[sortKey] || 0;
      return isDescending ? aValue - bValue : bValue - aValue;
    });
  };

  // Add useEffect to fetch subscription data
  const fetchSubscriptionData = async () => {
    if (address) {
      try {
        const response = await fetch(
          `https://dexters-backend.zkcross.exchange/api/agent/subscriptions/${address}`
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

  const handleCloseCreateAgent = () => {
    // Handle close create agent
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await Promise.all([
        fetchVirtuals(),
        fetchGenesis(),
        fetchPrototypeVirtuals(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const renderGenesisItem = (genesis: any) => {
    // Check if the Genesis has ended
    const now = new Date();
    const endDate = new Date(genesis.endsAt);
    if (now > endDate) {
      return null; // Don't render ended Genesis cards
    }

    return (
      <GenesisCard
        key={genesis.id}
        genesis={genesis}
        onClick={() => {}}
        subscriptionData={subscriptionData}
        fetchSubscriptionData={fetchSubscriptionData}
      />
    );
  };

  const renderVirtualItem = (virtual: any) => (
    <VirtualCard key={virtual.id} virtual={virtual} />
  );

  return (
    <div className="w-full h-full overflow-y-auto lg:overflow-y-hidden lg:h-full flex-1 flex sm:flex-row flex-col lg:px-14 sm:px-7 px-4 py-3 gap-4 justify-center">
      {(isMd || bottomTab === "list") && (
        <div className="w-full h-full flex overflow-hidden">
          {/* OverView section  */}
          <div className="relative h-full w-full backdrop-blur-sm bg-[#15181B]/80 border border-primary-100/40 rounded-xl text-white flex flex-col ">
            <div className="flex items-center justify-between pt-4 pb-4 border-b border-primary-100 px-8">
              <div className="gap-4 sm:gap-6 flex [&>button]:py-2 sm:w-fit w-full">
                <button
                  className={clsx(
                    "text-sm sm:text-base flex items-center gap-2 font-semibold font-primary sm:w-fit w-full justify-center underline-offset-[0.625rem]",
                    selectedSnipeTab && selectedSnipeTab === "aiAgents"
                      ? "text-primary-100 underline"
                      : "text-prime-zinc-100"
                  )}
                  onClick={() => {
                    setIsFromHeader(false);
                    setSelectedSnipeTab("aiAgents");
                    setShowSettings(false);
                  }}
                >
                  AI Agents
                </button>
                <div className="h-10 w-px bg-prime-background-100 sm:hidden" />
                <button
                  className={clsx(
                    "text-sm sm:text-base flex items-center gap-2 font-semibold font-primary sm:w-fit w-full justify-center text-nowrap underline-offset-[0.625rem]",
                    selectedSnipeTab && selectedSnipeTab === "transaction"
                      ? "text-primary-100 underline"
                      : "text-prime-zinc-100"
                  )}
                  onClick={() => {
                    setIsFromHeader(false);
                    setSelectedSnipeTab("transaction");

                    setShowSettings(false);
                  }}
                >
                  <div className="flex">
                    Transactions&nbsp;
                    <span className="sm:block hidden">History</span>
                  </div>
                </button>
              </div>
              <div className="text-sm sm:text-sm gap-5 font-medium hidden sm:flex items-center">
                <button onClick={handleRefresh} disabled={isRefreshing}>
                  <Image
                    src="/common/Refresh.png"
                    alt="Refresh"
                    width={20}
                    height={20}
                    className={clsx(
                      "transition-transform duration-300",
                      isRefreshing && "animate-spin"
                    )}
                  />
                </button>
                <FilterDropdown
                  options={filterOptions}
                  onSelect={handleFilterSelect}
                  selectedOption={selectedFilter}
                />
                <button
                  onClick={() => {
                    setSelectedSnipeTab(null);
                    setShowSettings(true);
                  }}
                >
                  <Image
                    src="/common/Settings.png"
                    alt="Setting"
                    width={18}
                    height={18}
                  />
                </button>
              </div>
            </div>
            {showSettings ? (
              <AlertsSettings onClose={() => setShowSettings(false)} />
            ) : (
              <div className="flex-1 overflow-y-auto h-full">
                {selectedSnipeTab === "aiAgents" ? (
                  <div className="flex flex-row relative w-full h-full">
                    <AgentSection
                      title="Genesis Launches"
                      type="genesis"
                      data={genesisData?.data || []}
                      loading={genesisLoading}
                      error={genesisError}
                      renderItem={renderGenesisItem}
                    />
                    <AgentSection
                      title="Prototype Agents"
                      type="prototype"
                      data={sortVirtuals(prototypeVirtuals) || []}
                      loading={prototypeLoading}
                      error={prototypeError}
                      renderItem={renderVirtualItem}
                    />
                    <AgentSection
                      title="Sentient Agents"
                      type="sentient"
                      data={sortVirtuals(virtuals) || []}
                      loading={loading}
                      error={error}
                      renderItem={renderVirtualItem}
                    />
                  </div>
                ) : (
                  // <TransactionHistory />
                  <VirtualTransactions />
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Swap/Create Section */}
      {(isMd || bottomTab === "dex") && (
        <div className="sm:!w-[clamp(38%,30rem,43%)] min-w-[23.75rem] w-full flex justify-center items-center h-full">
          <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100/40 rounded-xl relative h-full w-full shadow-md overflow-y-hidden">
            {/* Tab Selection */}
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
                onClick={() => {
                  setResetCount((prev) => prev + 1);
                }}
              >
                Reset
              </button>
            </div>

            {selectedTab === "swap" && (
              <SnipeSwap
                virtuals={virtuals}
                prototypeVirtuals={prototypeVirtuals}
                loading={loading}
                prototypeLoading={prototypeLoading}
                resetCount={resetCount}
              />
            )}

            {selectedTab === "create" && (
              <div className="px-4 lg:px-8">
                <CreateAgentForm onClose={handleCloseCreateAgent} />
              </div>
            )}
          </div>
        </div>
      )}
      <div className="md:hidden w-full flex flex-row border-t border-primary-100 text-sm font-semibold">
        <button
          className={`basis-1/2 shrink-0 rounded py-2 ${
            bottomTab === "list"
              ? "bg-white/20 border border-t-none border-white/5"
              : ""
          }`}
          onClick={() => setBottomTab("list")}
        >
          List
        </button>
        <button
          className={`basis-1/2 shrink-0 rounded py-2 ${
            bottomTab === "dex"
              ? "bg-white/20 border border-t-none border-white/5"
              : ""
          }`}
          onClick={() => setBottomTab("dex")}
        >
          Dex
        </button>
      </div>
    </div>
  );
};

export default Snipe;
