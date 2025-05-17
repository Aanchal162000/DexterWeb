"use client";

import React from "react";
import { IVirtual } from "@/utils/interface";

interface VirtualCardProps {
  virtual: IVirtual;
  showBuyButton?: boolean;
  onBuyClick?: (virtual: IVirtual) => void;
}

const VirtualCard: React.FC<VirtualCardProps> = ({
  virtual,
  showBuyButton = false,
  onBuyClick,
}) => {
  return (
    <div className="bg-[#2A2A2A] rounded-lg p-4">
      <div className="flex items-center space-x-4">
        <img
          src={virtual.image}
          alt={virtual.name}
          className="w-12 h-12 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="text-white font-medium">{virtual.name}</h3>
          <p className="text-gray-400 text-sm">{virtual.description}</p>
          <p className="text-blue-400 text-sm mt-1">{virtual.price} DEX</p>
        </div>
      </div>
      {showBuyButton && onBuyClick && (
        <button
          className="w-full mt-3 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          onClick={() => onBuyClick(virtual)}
        >
          Buy Now
        </button>
      )}
    </div>
  );
};

export default VirtualCard;
