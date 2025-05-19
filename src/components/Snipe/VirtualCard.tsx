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
  calculateTokenPrice,
} from "@/utils/tokenCalculations";

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

  return (
    <div
      className="bg-[#1A1E23] rounded-lg p-4 cursor-pointer hover:bg-[#1E2228] transition-colors"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={virtual.image?.url || "/placeholder.png"}
            alt={virtual.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-white truncate">
              {virtual.name}
            </h3>
            <span className="text-sm text-gray-400">{virtual.symbol}</span>
          </div>

          {/* Price and Change */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white">{formatCurrency(tokenPrice)}</span>
            <span
              className={`text-sm ${
                (virtual.priceChangePercent24h || 0) >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {formatPercentage(virtual.priceChangePercent24h || 0)}
            </span>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-gray-400">24h Vol</span>
              <p className="text-white">
                {formatCurrency(virtual.volume24h || 0)}
              </p>
            </div>
            <div>
              <span className="text-gray-400">Holders</span>
              <p className="text-white">
                {formatLargeNumber(virtual.holderCount || 0)}
              </p>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex gap-2 mt-2">
            {virtual.socials?.VERIFIED_LINKS?.TWITTER && (
              <a
                href={virtual.socials.VERIFIED_LINKS.TWITTER}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-100"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </a>
            )}
            {virtual.socials?.VERIFIED_LINKS?.WEBSITE && (
              <a
                href={virtual.socials.VERIFIED_LINKS.WEBSITE}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-primary-100"
                onClick={(e) => e.stopPropagation()}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </a>
            )}
          </div>

          {/* Launch Time */}
          {virtual.genesis && (
            <div className="mt-2 text-sm text-gray-400">
              Launch: {getTimeUntilLaunch()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualCard;
