import React, { useState } from "react";
import { IVirtual } from "@/utils/interface";
import { formatCurrency, formatPercentage } from "@/utils/tokenCalculations";
import Image from "next/image";
import { LuSearch } from "react-icons/lu";
import { useWalletBalance } from "@/hooks/useWalletBalance";

interface VirtualTokenSelectorProps {
  setIsCoinOpen: (isOpen: boolean) => void;
  fromOrTo: "FromSelection" | "ToSelection";
  setSelectedCoin: (coin: IVirtual | null) => void;
  title: string;
  sentientVirtuals: IVirtual[];
  prototypeVirtuals: IVirtual[];
  sentientLoading: boolean;
  prototypeLoading: boolean;
}

const VirtualTokenSelector: React.FC<VirtualTokenSelectorProps> = ({
  setIsCoinOpen,
  fromOrTo,
  setSelectedCoin,
  title,
  sentientVirtuals,
  prototypeVirtuals,
  sentientLoading,
  prototypeLoading,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<
    "sentient" | "prototype" | "base"
  >("sentient");
  const [showAllTokens, setShowAllTokens] = useState(false);
  const { balances } = useWalletBalance();

  const baseTokens: IVirtual[] = [
    {
      id: "eth",
      name: "Ethereum",
      description:
        "Ethereum (ETH) is a decentralized, open-source blockchain with smart contract functionality.",
      role: "base",
      image: { url: "/Networks/ETH.png" },
      symbol: "ETH",
      priceChangePercent24h: 0,
      volume24h: 0,
      totalValueLocked: "0",
      holderCount: 0,
      contractAddress: "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee",
      mcapInVirtual: 0,
      userBalance: parseFloat(balances?.ETH || "0"),
      nextLaunchstartsAt: [],
      cores: [],
      creator: {
        username: "Ethereum",
        avatar: {
          url: "/Networks/ETH.png",
        },
      },
      genesis: {
        startsAt: "",
        endsAt: "",
      },
    },
    {
      id: "virtual",
      name: "Virtuals",
      description: "Virtual Protocol",
      role: "base",
      image: {
        url: "https://static.cx.metamask.io/api/v1/tokenIcons/8453/0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b.png",
      },
      symbol: "VIRT",
      priceChangePercent24h: 0,
      volume24h: 0,
      totalValueLocked: "0",
      holderCount: 0,
      contractAddress: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
      mcapInVirtual: 0,
      userBalance: parseFloat(balances?.VIRT || "0"),
      nextLaunchstartsAt: [],
      cores: [],
      creator: {
        username: "Dexter",
        avatar: {
          url: "/Trade/dexterLogo.png",
        },
      },
      genesis: {
        startsAt: "",
        endsAt: "",
      },
    },
    {
      id: "dexter",
      name: "Dexter",
      description: "Dexter",
      role: "base",
      image: {
        url: "/Trade/dexterLogo.png",
      },
      symbol: "VIRT",
      priceChangePercent24h: 0,
      volume24h: 0,
      totalValueLocked: "0",
      holderCount: 0,
      contractAddress: "0x0b3e328455c4059EEb9e3f84b5543F74E24e7E1b",
      mcapInVirtual: 0,
      userBalance: parseFloat(balances?.VIRT || "0"),
      nextLaunchstartsAt: [],
      cores: [],
      creator: {
        username: "Dexter",
        avatar: {
          url: "/Trade/dexterLogo.png",
        },
      },
      genesis: {
        startsAt: "",
        endsAt: "",
      },
    },
  ];

  const handleTokenSelect = (virtual: IVirtual) => {
    setSelectedCoin(virtual);
    setIsCoinOpen(false);
  };

  const getFilteredTokens = () => {
    const query = searchQuery.toLowerCase();
    let tokens: IVirtual[] = [];

    switch (selectedTab) {
      case "sentient":
        tokens = sentientVirtuals;
        break;
      case "prototype":
        tokens = prototypeVirtuals;
        break;
      case "base":
        tokens = baseTokens;
        break;
    }

    // Filter tokens by search query
    const filteredTokens = tokens.filter(
      (virtual) =>
        virtual.name.toLowerCase().includes(query) ||
        virtual.symbol.toLowerCase().includes(query)
    );

    // Sort tokens by balance (tokens with balance > 0 come first)
    return filteredTokens.sort((a, b) => {
      const balanceA = a.userBalance || 0;
      const balanceB = b.userBalance || 0;
      if (balanceA > 0 && balanceB === 0) return -1;
      if (balanceA === 0 && balanceB > 0) return 1;
      return 0;
    });
  };

  const filteredTokens = getFilteredTokens();

  return (
    <div className="relative w-full flex flex-col h-full">
      {/* Header */}
      {/* <div className="flex items-center justify-between px-4 py-3 border-b border-primary-100/20">
        <h2 className="text-lg font-semibold text-primary-100">{title}</h2>
        <button
          onClick={() => setIsCoinOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div> */}

      {/* Search Bar */}
      <div className="p-4 pt-0 border-b border-primary-100/20">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or symbol"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-700 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Token Type Tabs */}
      <div className="flex gap-2 p-4 border-b border-primary-100/20">
        <button
          onClick={() => setSelectedTab("sentient")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === "sentient"
              ? "bg-primary-100 text-black"
              : "bg-zinc-700 text-gray-400 hover:bg-zinc-600"
          }`}
        >
          Sentient
        </button>
        <button
          onClick={() => setSelectedTab("prototype")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === "prototype"
              ? "bg-primary-100 text-black"
              : "bg-zinc-700 text-gray-400 hover:bg-zinc-600"
          }`}
        >
          Prototype
        </button>
        <button
          onClick={() => setSelectedTab("base")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === "base"
              ? "bg-primary-100 text-black"
              : "bg-zinc-700 text-gray-400 hover:bg-zinc-600"
          }`}
        >
          Base
        </button>
      </div>

      {/* Token List */}
      <div className="flex-1 overflow-y-auto max-h-[300px] min-h-[200px]">
        {selectedTab === "sentient" && sentientLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-100"></div>
          </div>
        ) : selectedTab === "prototype" && prototypeLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-100"></div>
          </div>
        ) : filteredTokens.length === 0 ? (
          <div className="text-center text-gray-400 py-8">No tokens found</div>
        ) : (
          <div className="divide-y divide-primary-100/20">
            {filteredTokens.map((virtual) => (
              <button
                key={virtual.id}
                onClick={() => handleTokenSelect(virtual)}
                disabled={virtual.name == "Dexter"}
                className="w-full px-4 py-3 hover:bg-gray-800/50 transition-colors flex items-center justify-between disabled:opacity-30"
              >
                <div className="flex items-center justify-center gap-3 ">
                  <div className="relative  overflow-hidden items-center justify-center">
                    <Image
                      src={virtual.image?.url || "/placeholder.png"}
                      alt={virtual.name}
                      width={20}
                      height={20}
                      className="rounded-full bg-white overflow-hidden"
                    />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">{virtual.name}</div>
                    <div className="text-sm text-gray-400">
                      {virtual.symbol}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-white">
                    {formatCurrency(virtual.mcapInVirtual || 0)}
                  </div>
                  <div
                    className={`text-sm ${
                      (virtual.priceChangePercent24h || 0) >= 0
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {formatPercentage(virtual.priceChangePercent24h || 0)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTokenSelector;
