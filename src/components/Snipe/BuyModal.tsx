"use client";

import React from "react";
import { IBuyModalProps } from "@/utils/interface";

const BuyModal: React.FC<IBuyModalProps> = ({
  isOpen,
  onClose,
  virtual,
  type,
}) => {
  if (!isOpen) return null;

  const isSell = type === "sell";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A1A] rounded-lg p-4 md:p-6 w-full max-w-[400px] border border-[#2A2A2A]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg md:text-xl font-semibold text-white">
            {isSell ? "Sell Virtual" : "Buy Virtual"}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <img
              src={virtual?.image?.url}
              alt={virtual?.name}
              className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-white font-medium text-sm md:text-base">
                {virtual?.name}
              </h3>
              <p className="text-gray-400 text-xs md:text-sm">
                {virtual?.description}
              </p>
            </div>
          </div>

          <div className="bg-[#2A2A2A] rounded-lg p-3 md:p-4">
            {isSell ? (
              <>
                <div className="flex justify-between text-white text-sm md:text-base mb-2">
                  <span>Your Balance:</span>
                  <span>{virtual?.userBalance} units</span>
                </div>
                <div className="flex justify-between text-white text-sm md:text-base mb-2">
                  <span>Current Price:</span>
                  <span>{virtual?.price} DEX</span>
                </div>
                <div className="flex justify-between text-white text-sm md:text-base">
                  <span>Total Value:</span>
                  <span>
                    {(virtual?.userBalance || 0) * (virtual?.price || 0)} DEX
                  </span>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between text-white text-sm md:text-base mb-2">
                  <span>Price:</span>
                  <span>{virtual?.price} DEX</span>
                </div>
                <div className="flex justify-between text-white text-sm md:text-base">
                  <span>Available Slots:</span>
                  <span>
                    {(virtual?.maxSubscribers || 0) -
                      (virtual?.subscribers || 0)}{" "}
                    remaining
                  </span>
                </div>
              </>
            )}
          </div>

          <button
            className={`w-full py-2 md:py-3 px-4 rounded-lg transition-colors text-sm md:text-base ${
              isSell
                ? "bg-red-600 hover:bg-red-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
            onClick={() => {
              /* Handle purchase/sale */
            }}
          >
            {isSell ? "Sell for DEX" : "Purchase with DEX"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;
