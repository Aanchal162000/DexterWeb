"use client";

import React, { useState } from "react";
import { IVirtual, IBuyModalProps } from "@/utils/interface";
import BuyModal from "./BuyModal";
import VirtualCard from "./VirtualCard";
import CreateAgentForm from "./CreateAgentForm";
import { useMediaQuery } from "react-responsive";

// Mock data - In real app, this would come from an API or context
const mockVirtuals: IVirtual[] = [
  {
    id: "1",
    name: "Virtual Agent Alpha",
    description: "Advanced AI trading agent",
    price: 1000,
    image: "/Trade/demo_agent_pic.png",
    subscribers: 45,
    maxSubscribers: 100,
    userBalance: 2,
  },
  {
    id: "2",
    name: "Virtual Agent Beta",
    description: "High-frequency trading specialist",
    price: 1500,
    image: "/Trade/demo_genesis.png",
    subscribers: 78,
    maxSubscribers: 150,
    userBalance: 0,
  },
  {
    id: "3",
    name: "Virtual Agent Gamma",
    description: "Risk management expert",
    price: 2000,
    image: "/Trade/demo_genesis.png",
    subscribers: 120,
    maxSubscribers: 200,
    userBalance: 1,
  },
];

const Snipe = () => {
  const [selectedVirtual, setSelectedVirtual] = useState<IVirtual | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);
  const isMobile = useMediaQuery({ maxWidth: 768 });

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
    setSelectedVirtual(null);
  };

  const handleCreateAgentClick = () => {
    setIsCreatingAgent(true);
  };

  const handleCloseCreateAgent = () => {
    setIsCreatingAgent(false);
  };

  return (
    <div className="flex-1 w-full h-full p-4 md:p-6 pb-24 md:pb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 h-full">
        {/* Genesis Launches Box */}
        <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-y-auto justify-center items-center p-4">
          <h2 className="text-lg md:text-xl font-semibold text-primary-100 text-center mb-4">
            Genesis Launches
          </h2>
          <div className="space-y-4">
            {mockVirtuals.map((virtual) => (
              <div key={virtual.id} className="relative">
                <VirtualCard virtual={virtual} />
                <div className="mt-2 px-2">
                  <div className="flex justify-between items-center text-sm">
                    <span>
                      Subscribers: {virtual.subscribers || 0}/
                      {virtual.maxSubscribers || 0}
                    </span>
                    <span className="text-primary-100">
                      {Math.round(
                        ((virtual.subscribers || 0) /
                          (virtual.maxSubscribers || 1)) *
                          100
                      )}
                      % Filled
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2 mt-1">
                    <div
                      className="bg-primary-100 h-2 rounded-full"
                      style={{
                        width: `${
                          ((virtual.subscribers || 0) /
                            (virtual.maxSubscribers || 1)) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Buy Box */}
        <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-y-auto justify-center items-center p-4">
          <h2 className="text-lg md:text-xl font-semibold text-primary-100 text-center mb-4">
            Sentient Agents
          </h2>
          <div className="space-y-4">
            {mockVirtuals.map((virtual) => (
              <div key={virtual.id} className="relative">
                <VirtualCard virtual={virtual} />
                <div className="mt-2 px-2 flex gap-2">
                  <button
                    onClick={() => handleBuyClick(virtual)}
                    className="flex-1 bg-primary-100 text-black px-4 py-2 rounded-lg font-medium hover:bg-primary-200 transition-colors"
                  >
                    Quick Buy
                  </button>
                  {virtual.userBalance ? (
                    <button
                      onClick={() => handleSellClick(virtual)}
                      className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                      Quick Sell
                    </button>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prototype Agents Box */}
        <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-y-auto justify-center items-center p-4">
          <h2 className="text-lg md:text-xl font-semibold text-primary-100 text-center mb-4">
            Prototype Agents
          </h2>
          <div className="space-y-4">
            {mockVirtuals.map((virtual) => (
              <VirtualCard key={virtual.id} virtual={virtual} />
            ))}
          </div>
        </div>

        {/* Create Virtual Box - Only show in desktop */}
        {!isMobile && (
          <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-y-auto justify-center items-center p-4">
            <>
              <h2 className="text-lg md:text-xl font-semibold text-primary-100 text-center mb-4">
                Create Virtual
              </h2>
              <CreateAgentForm onClose={handleCloseCreateAgent} />
            </>
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
    </div>
  );
};

export default Snipe;
