import React, { useState } from "react";
import { IVirtual } from "@/utils/interface";
import { useSentientVirtuals } from "@/hooks/useSentientVirtuals";
import { useGenesis } from "@/hooks/useGenesis";
import { usePrototypeVirtuals } from "@/hooks/usePrototypeVirtuals";
import { formatCurrency, formatPercentage } from "@/utils/tokenCalculations";
import Image from "next/image";
import { LuSearch } from "react-icons/lu";

interface VirtualTokenSelectorProps {
  setIsCoinOpen: (isOpen: boolean) => void;
  fromOrTo: "FromSelection" | "ToSelection";
  setSelectedCoin: (coin: IVirtual | null) => void;
  title: string;
}

const VirtualTokenSelector: React.FC<VirtualTokenSelectorProps> = ({
  setIsCoinOpen,
  fromOrTo,
  setSelectedCoin,
  title,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState<
    "genesis" | "sentient" | "prototype"
  >("genesis");
  const [showAllTokens, setShowAllTokens] = useState(false);

  const { virtuals: sentientVirtuals, loading: sentientLoading } =
    useSentientVirtuals();
  const { data: genesisData, loading: genesisLoading } = useGenesis();
  const { virtuals: prototypeVirtuals, loading: prototypeLoading } =
    usePrototypeVirtuals();

  const handleTokenSelect = (virtual: IVirtual) => {
    setSelectedCoin(virtual);
    setIsCoinOpen(false);
  };

  const getFilteredTokens = () => {
    const query = searchQuery.toLowerCase();
    let tokens: IVirtual[] = [];

    switch (selectedTab) {
      case "genesis":
        tokens = Array.isArray(genesisData?.data)
          ? genesisData.data.map((genesis) => ({
              id: genesis.virtual.id.toString(),
              name: genesis.virtual.name,
              symbol: genesis.virtual.symbol,
              description: genesis.virtual.description,
              role: "",
              contractAddress: genesis.genesisAddress,
              image: genesis.virtual.image,
              priceChangePercent24h: 0,
              volume24h: 0,
              totalValueLocked: "0",
              holderCount: 0,
              virtualTokenValue: "0",
              mcapInVirtual: 0,
              cores: [],
              socials: {},
              genesis: {
                startsAt: genesis.startsAt,
                endsAt: genesis.endsAt,
              },
            }))
          : [];
        break;
      case "sentient":
        tokens = sentientVirtuals;
        break;
      case "prototype":
        tokens = prototypeVirtuals;
        break;
    }

    return tokens.filter(
      (virtual) =>
        virtual.name.toLowerCase().includes(query) ||
        virtual.symbol.toLowerCase().includes(query)
    );
  };

  const filteredTokens = getFilteredTokens();

  return (
    <div className="relative w-full flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary-100/20">
        <h2 className="text-lg font-semibold text-primary-100">{title}</h2>
        <button
          onClick={() => setIsCoinOpen(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-primary-100/20">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name or symbol"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-100"
          />
          <LuSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Token Type Tabs */}
      <div className="flex gap-2 p-4 border-b border-primary-100/20">
        <button
          onClick={() => setSelectedTab("genesis")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === "genesis"
              ? "bg-primary-100 text-black"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Genesis
        </button>
        <button
          onClick={() => setSelectedTab("sentient")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === "sentient"
              ? "bg-primary-100 text-black"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Sentient
        </button>
        <button
          onClick={() => setSelectedTab("prototype")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selectedTab === "prototype"
              ? "bg-primary-100 text-black"
              : "bg-gray-800 text-gray-400 hover:bg-gray-700"
          }`}
        >
          Prototype
        </button>
      </div>

      {/* Token List */}
      <div className="flex-1 overflow-y-auto max-h-[300px] min-h-[200px]">
        {selectedTab === "genesis" && genesisLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-100"></div>
          </div>
        ) : selectedTab === "sentient" && sentientLoading ? (
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
                className="w-full px-4 py-3 hover:bg-gray-800/50 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden">
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
