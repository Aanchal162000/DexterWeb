"use client";

import React, { useState } from "react";
import { IVirtual, IBuyModalProps } from "@/utils/interface";
import BuyModal from "./BuyModal";
import VirtualCard from "./VirtualCard";
import CreateAgentForm from "./CreateAgentForm";

// Mock data - In real app, this would come from an API or context
const mockVirtuals: IVirtual[] = [
  {
    id: "1",
    name: "Virtual Agent Alpha",
    description: "Advanced AI trading agent",
    price: 1000,
    image: "/Trade/demo_agent_pic.png",
  },
  {
    id: "2",
    name: "Virtual Agent Beta",
    description: "High-frequency trading specialist",
    price: 1500,
    image: "/Trade/demo_genesis.png",
  },
  {
    id: "3",
    name: "Virtual Agent Gamma",
    description: "Risk management expert",
    price: 2000,
    image: "/Trade/demo_genesis.png",
  },
];

const Snipe = () => {
  const [selectedVirtual, setSelectedVirtual] = useState<IVirtual | null>(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isCreatingAgent, setIsCreatingAgent] = useState(false);

  const handleBuyClick = (virtual: IVirtual) => {
    setSelectedVirtual(virtual);
    setIsBuyModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsBuyModalOpen(false);
    setSelectedVirtual(null);
  };

  return (
    <div className="flex-1 w-full h-full p-6">
      <div className="grid grid-cols-4 gap-6 h-full">
        {/* Genesis Launches Box */}
        <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-y-hidden justify-center items-center p-4">
          <h2 className="text-xl font-semibold text-primary-100 text-center mb-4">
            Genesis Launches
          </h2>
          <div className="space-y-4">
            {mockVirtuals.map((virtual) => (
              <VirtualCard key={virtual.id} virtual={virtual} />
            ))}
          </div>
        </div>

        {/* Quick Buy Box */}
        <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-y-hidden justify-center items-center p-4">
          <h2 className="text-xl font-semibold text-primary-100 text-center mb-4">
            Quick Buy
          </h2>
          <div className="space-y-4">
            {mockVirtuals.map((virtual) => (
              <VirtualCard
                key={virtual.id}
                virtual={virtual}
                showBuyButton
                onBuyClick={handleBuyClick}
              />
            ))}
          </div>
        </div>

        {/* Prototype Agents Box */}
        <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-y-hidden justify-center items-center p-4">
          <h2 className="text-xl font-semibold text-primary-100 text-center mb-4">
            Prototype Agents
          </h2>
          <div className="space-y-4">
            {mockVirtuals.map((virtual) => (
              <VirtualCard key={virtual.id} virtual={virtual} />
            ))}
          </div>
        </div>

        {/* Create Virtual Box */}
        <div className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100 rounded-xl relative h-full w-full shadow-md overflow-y-hidden justify-center items-center p-4">
          <>
            <h2 className="text-xl font-semibold text-primary-100 text-center mb-4">
              Create Virtual
            </h2>
            <CreateAgentForm onClose={() => setIsCreatingAgent(false)} />
          </>
        </div>
      </div>

      {isBuyModalOpen && selectedVirtual && (
        <BuyModal
          isOpen={isBuyModalOpen}
          onClose={handleCloseModal}
          virtual={selectedVirtual}
        />
      )}
    </div>
  );
};

export default Snipe;
