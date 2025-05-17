"use client";

import React from "react";
import { IBuyModalProps } from "@/utils/interface";

const BuyModal: React.FC<IBuyModalProps> = ({ isOpen, onClose, virtual }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1A1A1A] rounded-lg p-6 w-[400px] border border-[#2A2A2A]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Buy Virtual</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <img
              src={virtual?.image}
              alt={virtual?.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div>
              <h3 className="text-white font-medium">{virtual?.name}</h3>
              <p className="text-gray-400 text-sm">{virtual?.description}</p>
            </div>
          </div>

          <div className="bg-[#2A2A2A] rounded-lg p-4">
            <div className="flex justify-between text-white mb-2">
              <span>Price:</span>
              <span>{virtual?.price} DEX</span>
            </div>
          </div>

          <button
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            onClick={() => {
              /* Handle purchase */
            }}
          >
            Purchase with DEX
          </button>
        </div>
      </div>
    </div>
  );
};

export default BuyModal;
