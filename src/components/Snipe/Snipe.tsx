"use client";

import React, { useState } from "react";
import { IVirtual, IBuyModalProps } from "@/utils/interface";
import BuyModal from "./BuyModal";
import VirtualCard from "./VirtualCard";
import CreateAgentForm from "./CreateAgentForm";
import { useMediaQuery } from "react-responsive";
import { useSentientVirtuals } from "@/hooks/useSentientVirtuals";
import Image from "next/image";
import {
  formatCurrency,
  formatPercentage,
  formatTokenAmount,
  calculateTokenPrice,
  calculatePrice24hAgo,
  weiToEther,
} from "@/utils/tokenCalculations";
import { useGenesis } from "@/hooks/useGenesis";
import GenesisCard from "./GenesisCard";
import { usePrototypeVirtuals } from "@/hooks/usePrototypeVirtuals";

const Snipe = () => {
  const [selectedVirtual, setSelectedVirtual] = useState<IVirtual | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const { virtuals, loading, error } = useSentientVirtuals();
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

  const handleBuyClick = (virtual: IVirtual) => {
    setSelectedVirtual(virtual);
    setIsBuyModalOpen(true);
  };

  const handleSellClick = (virtual: IVirtual) => {
    setSelectedVirtual(virtual);
    setIsSellModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBuyModalOpen(false);
    setIsSellModalOpen(false);
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

  return (
    <div className="w-full h-full overflow-y-auto lg:overflow-y-hidden lg:h-full flex-1 flex flex-row lg:px-14 sm:px-7 px-4 py-3 gap-4 justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 h-full">
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
        <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relativeh-full w-full shadow-md overflow-hidden flex flex-col">
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
                    <div className="mt-2 px-2 flex gap-2">
                      <button
                        onClick={() => handleBuyClick(virtual)}
                        className="flex-1 bg-primary-100 text-black px-4 py-2 rounded-lg font-medium hover:bg-primary-200 transition-colors"
                      >
                        Quick Buy
                      </button>
                      <button
                        onClick={() => handleSellClick(virtual)}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                      >
                        Quick Sell
                      </button>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Create Virtual Box - Only show in desktop */}
        {!isMobile && (
          <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-hidden flex flex-col">
            <h2 className="text-lg md:text-xl font-semibold text-primary-100 text-center p-4 border-b border-primary-100/20">
              Create Virtual
            </h2>
            <div className="flex-1 overflow-y-auto p-4">
              <CreateAgentForm onClose={handleCloseCreateAgent} />
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

      {/* Buy/Sell Modal */}
      {isBuyModalOpen && selectedVirtual && (
        <BuyModal
          isOpen={isBuyModalOpen}
          onClose={handleCloseModal}
          virtual={selectedVirtual}
          type="buy"
        />
      )}

      {isSellModalOpen && selectedVirtual && (
        <BuyModal
          isOpen={isSellModalOpen}
          onClose={handleCloseModal}
          virtual={selectedVirtual}
          type="sell"
        />
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
