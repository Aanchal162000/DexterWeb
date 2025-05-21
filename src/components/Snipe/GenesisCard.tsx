"use client";

import React, { useEffect, useState } from "react";
import { IGenesis } from "@/utils/interface";
import Image from "next/image";
import {
  formatDistanceToNow,
  formatDistance,
  differenceInSeconds,
} from "date-fns";
import { formatLargeNumber } from "@/utils/tokenCalculations";
import { FaCopy, FaExternalLinkAlt, FaCrosshairs } from "react-icons/fa";
import { toast } from "react-toastify";

import { useLoginContext } from "@/context/LoginContext";
import SnipeModal from "@/components/common/SnipeModal";
import { useSwapContext } from "@/context/SwapContext";

interface GenesisCardProps {
  genesis: IGenesis;
  onClick?: () => void;
}

interface StatusBadgeProps {
  status: "upcoming" | "live" | "ended";
  timeLeft: string | React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, timeLeft }) => {
  const getStatusStyles = () => {
    switch (status) {
      case "upcoming":
        return "text-cyan-500";
      case "live":
        return "text-red-500";
      case "ended":
        return " text-gray-500";
    }
  };

  return (
    <div className={`flex items-center gap-2 px-3 py-2 ${getStatusStyles()}`}>
      {status === "upcoming" && ""}
      {status === "live" && "🔴"}
      {status === "ended" && "✔️"}
      <span className="text-sm font-medium">{timeLeft}</span>
    </div>
  );
};

const GenesisCard: React.FC<GenesisCardProps> = ({ genesis, onClick }) => {
  const [timeLeft, setTimeLeft] = useState<string | React.ReactNode>("");
  const [status, setStatus] = useState<"upcoming" | "live" | "ended">(
    "upcoming"
  );
  const [isSnipeModalOpen, setIsSnipeModalOpen] = useState(false);
  const { address } = useLoginContext();

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const startDate = new Date(genesis.startsAt);
      const endDate = new Date(genesis.endsAt);

      if (now < startDate) {
        const seconds = differenceInSeconds(startDate, now);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const days = Math.floor(seconds / 86400);
        const remainingSeconds = seconds % 60;
        setTimeLeft(
          <>
            Starts in{" "}
            <span className="text-white">
              {String(days).padStart(2, "0")}d {String(hours).padStart(2, "0")}h{" "}
              {String(minutes).padStart(2, "0")}m{" "}
              {String(remainingSeconds).padStart(2, "0")}s
            </span>
          </>
        );
        setStatus("upcoming");
      } else if (now >= startDate && now <= endDate) {
        const remainingSeconds = differenceInSeconds(endDate, now);
        if (remainingSeconds <= 0) {
          setTimeLeft("Ended");
          setStatus("ended");
          return;
        }
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;
        setTimeLeft(
          <>
            Live -{" "}
            <span className="text-white">
              {String(hours).padStart(2, "0")}:
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")} left
            </span>
          </>
        );
        setStatus("live");
      } else {
        const endedTime = formatDistanceToNow(endDate, { addSuffix: true });
        setTimeLeft(`Ended ${endedTime}`);
        setStatus("ended");
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [genesis.startsAt, genesis.endsAt]);

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

  const handleSnipe = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!address) {
      toast.error("Please connect your wallet first!");
      return;
    }

    if (status !== "live") {
      toast.error("Can only snipe live launches!");
      return;
    }

    setIsSnipeModalOpen(true);
  };

  return (
    <>
      <div
        className="bg-[#1A1E23] rounded-xl cursor-pointer border border-cyan-500/50 transition-all duration-300 w-full backdrop-blur-sm"
        onClick={onClick}
      >
        {/* Top Row */}
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <div className="relative w-14 h-14 rounded-full overflow-hidden flex-shrink-0 border-2 border-cyan-500/30">
              <Image
                src={genesis.virtual.image?.url || "/placeholder.png"}
                alt={genesis.virtual.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-end gap-2">
                <h3 className="text-lg font-semibold leading-none text-white font-['Outrun']">
                  {genesis.virtual.name}
                </h3>
                <span className="text-xs text-gray-400 font-light">
                  ${genesis.virtual.symbol}
                </span>
                <FaExternalLinkAlt className="w-3 h-3 mb-[1px] ml-2 text-gray-400 cursor-pointer hover:text-cyan-500" />
              </div>
              <div className="flex items-center gap-1">
                <span className="px-2 py-1 rounded-md text-xs bg-gray-800/50 border border-cyan-400/50 text-gray-300">
                  Entertainment
                </span>
                <div className="flex items-center gap-2 px-2 py-1 rounded-md text-xs border border-cyan-400/50 bg-gray-800/50 text-gray-300">
                  <span>
                    {genesis.genesisAddress?.slice(0, 6)}...
                    {genesis.genesisAddress?.slice(-4)}
                  </span>
                  <FaCopy
                    className="w-3 h-3 cursor-pointer hover:text-cyan-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(genesis.virtual.contractAddress || "");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {status === "live" && (
            <button
              onClick={handleSnipe}
              className="px-3 py-1 rounded-lg bg-cyan-500/10 text-cyan-400 border-2 border-cyan-400/80 font-semibold hover:bg-cyan-500/20 transition-all duration-300 flex items-center gap-2"
            >
              <FaCrosshairs className="w-4 h-4" />
              <span>Snipe</span>
            </button>
          )}
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col gap-2 mt-2">
          {/* <div className="border-t border-gray-800 w-full">
            <div className="flex items-center flex-row space-x-4 px-4 py-2">
              <div className="text-xs">
                <span className="text-gray-400">Ascended: </span>
                <span className="text-white">
                  {new Date(genesis.startsAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-xs">
                <span className="text-gray-400">FDV: </span>
                <span className="text-white">
                  ${formatLargeNumber(genesis.fdv || 0)}
                </span>
              </div>
              <div className="text-xs">
                <span className="text-gray-400">24h: </span>
                <span className="text-green-500">
                  +{formatLargeNumber(genesis.priceChange24h || 0)}%
                </span>
              </div>
              <div className="text-xs">
                <span className="text-gray-400">Price: </span>
                <span className="text-white">${genesis.price?.toFixed(6)}</span>
              </div>
            </div>
          </div> */}
          <div className="border-t border-cyan-500/50 flex justify-center items-center">
            <StatusBadge status={status} timeLeft={timeLeft} />
          </div>
        </div>
      </div>

      <SnipeModal
        isOpen={isSnipeModalOpen}
        onClose={() => setIsSnipeModalOpen(false)}
        genesisId={genesis.genesisId}
        name={genesis.virtual.name}
        endsAt={genesis.endsAt}
        walletAddress={address || ""}
      />
    </>
  );
};

export default GenesisCard;
