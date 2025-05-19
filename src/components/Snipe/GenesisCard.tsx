"use client";

import React, { useEffect, useState } from "react";
import { IGenesis } from "@/utils/interface";
import Image from "next/image";
import { formatDistanceToNow, formatDistance } from "date-fns";
import { formatLargeNumber } from "@/utils/tokenCalculations";

interface GenesisCardProps {
  genesis: IGenesis;
  onClick?: () => void;
}

const GenesisCard: React.FC<GenesisCardProps> = ({ genesis, onClick }) => {
  const [timeLeft, setTimeLeft] = useState<string>("");
  const [isLive, setIsLive] = useState<boolean>(false);

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const startDate = new Date(genesis.startsAt);
      const endDate = new Date(genesis.endsAt);

      if (now < startDate) {
        setTimeLeft(`Starts in ${formatDistance(startDate, now)}`);
        setIsLive(false);
      } else if (now >= startDate && now <= endDate) {
        setTimeLeft(`Ends in ${formatDistance(endDate, now)}`);
        setIsLive(true);
      } else {
        setTimeLeft("Ended");
        setIsLive(false);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [genesis.startsAt, genesis.endsAt]);

  return (
    <div
      className="bg-[#1A1E23] rounded-lg p-4 cursor-pointer hover:bg-[#1E2228] transition-colors w-full"
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
          <Image
            src={genesis.virtual.image?.url || "/placeholder.png"}
            alt={genesis.virtual.name}
            fill
            className="object-cover"
            unoptimized
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-semibold text-white truncate">
              {genesis.virtual.name}
            </h3>
            <span className="text-sm text-gray-400">
              {genesis.virtual.symbol}
            </span>
          </div>

          {/* Status and Time */}
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                isLive
                  ? "bg-green-500/20 text-green-500"
                  : "bg-blue-500/20 text-blue-500"
              }`}
            >
              {isLive ? "LIVE" : "UPCOMING"}
            </span>
            <span className="text-sm text-gray-400">{timeLeft}</span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mb-2">
            <span className="text-sm text-gray-400">
              Participants: {formatLargeNumber(genesis.totalParticipants)}
            </span>
            <span className="text-sm text-gray-400">
              Points: {formatLargeNumber(genesis.totalPoints)}
            </span>
          </div>

          {/* Chain */}
          <div className="text-sm text-gray-400">
            Chain: {genesis.virtual.chain}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenesisCard;
