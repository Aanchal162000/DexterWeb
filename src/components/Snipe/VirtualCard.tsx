"use client";

import React, { useState } from "react";
import { IVirtual } from "@/utils/interface";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  formatCurrency,
  formatPercentage,
  formatTokenAmount,
  formatLargeNumber,
} from "@/utils/tokenCalculations";
import { FaExternalLinkAlt } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import { toast } from "react-toastify";
import { BsCopy } from "react-icons/bs";
import { useTokenMetrics } from "@/hooks/useTokenMetrics";

import SmartBuyModal from "../common/SmartBuyModal";
import DetailModal from "@/components/common/DetailModal";
import { useMediaQuery } from "react-responsive";
import Link from "next/link";

interface VirtualCardProps {
  virtual: IVirtual;
  onClick?: () => void;
}

const VirtualCard: React.FC<VirtualCardProps> = ({ virtual, onClick }) => {
  const [isSmartBuyModalOpen, setIsSmartBuyModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const metrics = useTokenMetrics(virtual);
  const is2Xl = useMediaQuery({ minWidth: 1536 });

  const getTimeUntilLaunch = () => {
    if (!virtual.genesis?.startsAt) return null;
    const startDate = new Date(virtual.genesis.startsAt);
    return formatDistanceToNow(startDate, { addSuffix: true });
  };

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

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDetailModalOpen(true);
  };

  const handleSmartBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSmartBuyModalOpen(true);
  };
  const diffDays = virtual?.nextLaunchstartsAt?.length
    ? Math.floor(
        (new Date(virtual?.nextLaunchstartsAt[0].startsAt).getTime() -
          Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : -1;

  return (
    <div className="relative">
      <div
        className="h-[8.2rem] rounded-xl cursor-pointer border-[0.5px] border-primary-100/60 hover:border-cyan-500/40 transition-all duration-300 w-full"
        onClick={handleCardClick}
      >
        {/* Top Row */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-1">
            <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-cyan-500/30">
              <Image
                src={virtual.image?.url || "/placeholder.png"}
                alt={virtual.name}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-start gap-1">
                <h3 className="text-sm text-nowrap font-semibold leading-none text-white">
                  {virtual.name}
                </h3>
                <span className="text-[10px] text-gray-400 font-light">
                  ${virtual.symbol}
                </span>
                {is2Xl && (
                  <div
                    className={`flex flex-row justify-center items-center text-[11px] gap-1 rounded p-[2px] ${
                      diffDays > 7
                        ? "bg-[#4ade80]/10 text-[#4ade80]"
                        : diffDays > 0
                        ? "bg-[#eab308]/10 text-[#eab308]"
                        : ""
                    }`}
                  >
                    {diffDays != -1 && (
                      <>
                        <IoIosLock />
                        <p>{Math.abs(diffDays)}d</p>
                      </>
                    )}
                  </div>
                )}
                {virtual.socials?.VERIFIED_LINKS?.WEBSITE && is2Xl && (
                  <Link
                    key={virtual.name}
                    href={`https://app.virtuals.io/virtuals/${virtual.id}`}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <FaExternalLinkAlt className="w-2 h-2 text-gray-400 cursor-pointer hover:text-cyan-500" />
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-2">
                {is2Xl && (
                  <span className="px-2 py-1 rounded-md text-xs border border-cyan-400/50 text-gray-300">
                    {virtual.role}
                  </span>
                )}

                {virtual.contractAddress && (
                  <div className="flex items-center gap-2 px-2 py-1 rounded-md text-xs border border-cyan-400/50 text-gray-300">
                    <span>
                      {virtual.contractAddress.slice(0, 4)}...
                      {virtual.contractAddress.slice(-4)}
                    </span>
                    <BsCopy
                      className="w-3 h-3 cursor-pointer hover:text-cyan-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(virtual.contractAddress || "");
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={handleSmartBuyClick}
            className="w-[100px] px-2 py-1 text-nowrap tex-xs rounded-lg text-primary-100 border border-primary-100/80 font-semibold hover:bg-cyan-500/20 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Image
              src="/Trade/smartBuy.png"
              width={10}
              height={8}
              alt="smart Buy"
            />
            <span>Smart Buy</span>
          </button>
        </div>

        {/* Bottom Row */}
        <div className="relative px-4 py-2 items-center justify-center border-t-[0.5px] border-primary-100/60 w-full">
          <div className="grid desktop:grid-cols-4 grid-cols-2 desktop:gap-4 relative w-full items-center justify-between">
            <div className="text-sm flex flex-row space-x-1 relative text-left">
              <span className="text-gray-400">Price: </span>
              <span className="text-white">
                {formatCurrency(metrics.priceUSD)}
              </span>
            </div>
            <div className="text-sm flex flex-row space-x-1 relative text-left">
              <span className="text-gray-400">24h: </span>
              <span
                className={`${
                  metrics.priceChange24h >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {formatPercentage(metrics.priceChange24h)}
              </span>
            </div>
            <div className="text-sm flex flex-row space-x-1 relative text-left">
              <span className="text-gray-400">Vol: </span>
              <span className="text-white">
                {formatCurrency(metrics.volume24hUSD)}
              </span>
            </div>
            <div className="text-sm flex flex-row space-x-1 relative text-left">
              <span className="text-gray-400">Holders: </span>
              <span className="text-white">
                {formatLargeNumber(metrics.holders)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <SmartBuyModal
        isOpen={isSmartBuyModalOpen}
        onClose={() => setIsSmartBuyModalOpen(false)}
        virtual={virtual}
      />

      <DetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={virtual}
        type="virtual"
      />
    </div>
  );
};

export default VirtualCard;
