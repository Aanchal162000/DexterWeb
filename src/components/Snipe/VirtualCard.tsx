"use client";

import React from "react";
import { IVirtual } from "@/utils/interface";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  formatCurrency,
  formatPercentage,
  formatTokenAmount,
  weiToEther,
  formatLargeNumber,
} from "@/utils/tokenCalculations";
import { FaCopy, FaExternalLinkAlt, FaCrosshairs } from "react-icons/fa";
import { toast } from "react-toastify";

interface VirtualCardProps {
  virtual: IVirtual;
  onClick?: () => void;
}

const VirtualCard: React.FC<VirtualCardProps> = ({ virtual, onClick }) => {
  const getTimeUntilLaunch = () => {
    if (!virtual.genesis?.startsAt) return null;
    const startDate = new Date(virtual.genesis.startsAt);
    return formatDistanceToNow(startDate, { addSuffix: true });
  };

  // Calculate token price in USD
  const tokenPrice =
    virtual.virtualTokenValue && virtual.mcapInVirtual
      ? weiToEther(virtual.virtualTokenValue) * virtual.mcapInVirtual
      : 0;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  return (
    <div
      className="bg-[#1A1E23] rounded-xl cursor-pointer border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 w-full backdrop-blur-sm"
      onClick={onClick}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-cyan-500/30">
            <Image
              src={virtual.image?.url || "/placeholder.png"}
              alt={virtual.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white font-['Outrun']">
              {virtual.name}
            </h3>
            <span className="text-sm text-gray-400 font-light">
              ${virtual.symbol}
            </span>
          </div>
        </div>
      </div>

      {/* Metadata Chips */}
      <div className="flex items-center gap-1 px-4 py-2">
        <span className="px-3 py-1 rounded-full text-xs bg-gray-800/50 text-gray-300">
          {virtual.role}
        </span>
        {virtual.contractAddress && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-gray-800/50 text-gray-300">
            <span>
              {virtual.contractAddress.slice(0, 6)}...
              {virtual.contractAddress.slice(-4)}
            </span>
            <FaCopy
              className="w-3 h-3 cursor-pointer hover:text-cyan-500"
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(virtual.contractAddress || "");
              }}
            />
          </div>
        )}
        {virtual.socials?.VERIFIED_LINKS?.WEBSITE && (
          <FaExternalLinkAlt className="w-4 h-4 text-gray-400 cursor-pointer hover:text-cyan-500" />
        )}
      </div>

      {/* Bottom Row */}
      <div className="flex flex-col gap-2">
        {/* Stats Box */}
        <div className="border-t border-gray-800 w-full">
          <div className="flex items-center flex-row space-x-4 px-4 py-2">
            <div className="text-xs">
              <span className="text-gray-400">Price: </span>
              <span className="text-white">{formatCurrency(tokenPrice)}</span>
            </div>
            <div className="text-xs">
              <span className="text-gray-400">24h: </span>
              <span
                className={`${
                  (virtual.priceChangePercent24h || 0) >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {formatPercentage(virtual.priceChangePercent24h || 0)}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-400">Vol: </span>
              <span className="text-white">
                {formatCurrency(virtual.volume24h || 0)}
              </span>
            </div>
            <div className="text-xs">
              <span className="text-gray-400">Holders: </span>
              <span className="text-white">
                {formatLargeNumber(virtual.holderCount || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualCard;
