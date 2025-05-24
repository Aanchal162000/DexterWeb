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
import DetailModal from "@/components/common/DetailModal";
import Link from "next/link";

interface GenesisCardProps {
  genesis: IGenesis;
  onClick?: () => void;
  subscriptionData?: any;
  fetchSubscriptionData: () => Promise<void>;
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

const GenesisCard: React.FC<GenesisCardProps> = ({
  genesis,
  onClick,
  subscriptionData,
  fetchSubscriptionData,
}) => {
  const [timeLeft, setTimeLeft] = useState<string | React.ReactNode>("");
  const [status, setStatus] = useState<"upcoming" | "live" | "ended">(
    "upcoming"
  );
  const [isSnipeModalOpen, setIsSnipeModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const { address } = useLoginContext();

  const isSubscribed = subscriptionData?.filter(
    (sub: any) => sub.genesisId === genesis.genesisId
  ).length;
  console.log("genesisi:", isSubscribed);

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

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetailModalOpen(true);
  };

  return (
    <div className="relative">
      <div
        className="ralative flex flex-col rounded-xl cursor-pointer border-[0.5px] border-cyan-500/50  transition-all duration-300 h-fit  min-h-[7.2rem]"
        onClick={handleCardClick}
      >
        {/* Top Row */}
        <div className="flex items-center justify-between px-3 py-4">
          <div className="flex items-center gap-2">
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-cyan-500/30">
              <Image
                src={genesis.virtual.image?.url || "/placeholder.png"}
                alt={genesis.virtual.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-center  text-center gap-1">
                <h3 className="text-sm font-semibold leading-none text-white ">
                  {genesis.virtual.name}
                </h3>
                <span className="text-[10px] text-center leading-none text-gray-400 font-light">
                  ${genesis.virtual.symbol}
                </span>
                <Link
                  key={genesis.virtual.name}
                  href={`https://app.virtuals.io/geneses/${genesis.id}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FaExternalLinkAlt className="w-3 h-3 mb-[1px]  text-gray-400 cursor-pointer hover:text-cyan-500" />
                </Link>
              </div>
              <div className="flex items-center gap-1">
                {/* <span className="px-1 rounded-md text-[10px] border border-cyan-400/50 text-gray-300  capitalize">
                  {genesis.totalParticipants}
                </span> */}

                {genesis.genesisAddress && (
                  <div className="flex items-center space-x-1 px-1 rounded-md text-[10px] border border-cyan-400/50 text-gray-300">
                    <span>
                      {genesis.genesisAddress.slice(0, 4)}...
                      {genesis.genesisAddress.slice(-4)}
                    </span>
                    <BsCopy
                      className="w-2 h-2 cursor-pointer hover:text-cyan-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(genesis.genesisAddress || "");
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          {status === "live" && (
            <button
              onClick={handleSnipe}
              className="px-2 py-1 rounded-lg  text-sm text-primary-100 border border-primary-100/80 font-semibold hover:bg-cyan-500/20 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <FaCrosshairs className="w-4 h-4" />
              <span>Snipe</span>
            </button>
          )}
        </div>
        {isSubscribed ? (
          <div className="flex flex-col gap-2 mt-2">
            <div className="border-t-[0.5px] border-cyan-500/50 flex justify-center items-center p-2 text-sm font-medium">
              Snipe active! Dexter will auto-buy at launch
            </div>
          </div>
        ) : (
          <></>
        )}
        {/* Bottom Row */}
        <div className="flex flex-col gap-2 ">
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
        fetchSubscriptionData={fetchSubscriptionData}
      />

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={genesis}
        type="genesis"
      />
    </div>
  );
};

export default GenesisCard;
