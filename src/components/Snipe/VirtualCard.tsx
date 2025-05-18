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
    <div className="bg-[#2A2A2A] rounded-lg p-3 md:p-4">
      <div className="flex items-center space-x-3 md:space-x-4">
        <img
          src={virtual.image}
          alt={virtual.name}
          className="w-10 h-10 md:w-12 md:h-12 rounded-lg object-cover"
        />
        <div className="flex-1">
          <h3 className="text-white font-medium text-sm md:text-base">
            {virtual.name}
          </h3>
          <p className="text-gray-400 text-xs md:text-sm">
            {virtual.description}
          </p>
          <p className="text-blue-400 text-xs md:text-sm mt-1">
            {virtual.price} DEX
          </p>
        </div>
      </div>
      {showBuyButton && onBuyClick && (
        <button
          className="w-full mt-2 md:mt-3 py-1.5 md:py-2 px-3 md:px-4 bg-primary-100 hover:bg-primary-100/70 text-black rounded-lg transition-colors text-xs md:text-sm"
          onClick={() => onBuyClick(virtual)}
        >
          Buy Now
        </button>
      )}
    </div>
  );
};

export default VirtualCard;
