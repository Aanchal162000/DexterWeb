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
import { FaExternalLinkAlt, FaCrosshairs } from "react-icons/fa";
import { toast } from "react-toastify";

import { useLoginContext } from "@/context/LoginContext";
import SnipeModal from "@/components/common/SnipeModal";
import { useSwapContext } from "@/context/SwapContext";
import { BsCopy } from "react-icons/bs";

interface GenesisCardProps {
  genesis: IGenesis;
  onClick?: () => void;
}

interface StatusBadgeProps {
  status: "upcoming" | "live" | "ended";
  timeLeft: string | React.ReactNode;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, timeLeft }) => {
  return (
    <div
      className={`flex items-center justify-center gap-2  text-primary-100 `}
    >
      {status === "upcoming" && ""}
      {status === "live" && ""}
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
              {String(hours).padStart(2, "0")}h{" "}
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
              {String(hours).padStart(2, "0")}h{" "}
              {String(minutes).padStart(2, "0")}m{" "}
              {String(seconds).padStart(2, "0")}s left
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

    setIsSnipeModalOpen(!isSnipeModalOpen);
  };

  return (
    <div className="flex flex-col w-full">
      <div
        className="flex flex-col flex-1 rounded-xl cursor-pointer border-[0.5px] border-cyan-500/50  transition-all duration-300 w-full h-[8.2rem]"
        onClick={onClick}
      >
        {/* Top Row */}
        <div className="flex items-center justify-between p-4">
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
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-md text-xs  border border-cyan-400/50 text-gray-300">
                  Entertainment
                </span>
                <div className="flex items-center gap-2 px-2 py-1 rounded-md text-xs border border-cyan-400/50  text-gray-300">
                  <span>
                    {genesis.genesisAddress?.slice(0, 4)}...
                    {genesis.genesisAddress?.slice(-4)}
                  </span>
                  <BsCopy
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
              className="px-4 py-1 rounded-lg  text-primary-100 border border-primary-100/80 font-semibold hover:bg-cyan-500/20 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <FaCrosshairs className="w-4 h-4" />
              <span>Snipe</span>
            </button>
          )}
        </div>
        {/* Bottom Row */}
        <div className="flex flex-col gap-2 mt-2">
          <div className="border-t-[0.5px] border-cyan-500/50 flex justify-center items-center p-2">
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
    </div>
  );
};

export default GenesisCard;
