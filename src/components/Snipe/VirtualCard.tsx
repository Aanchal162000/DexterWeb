"use client";

import React, { useState } from "react";
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
import { FaExternalLinkAlt } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import { toast } from "react-toastify";
import { BsCopy } from "react-icons/bs";

import SmartBuyModal from "../common/SmartBuyModal";

interface VirtualCardProps {
  virtual: IVirtual;
  onClick?: () => void;
}

const VirtualCard: React.FC<VirtualCardProps> = ({ virtual, onClick }) => {
  const [isSmartBuyModalOpen, setIsSmartBuyModalOpen] = useState(false);

  const getTimeUntilLaunch = () => {
    if (!virtual.genesis?.startsAt) return null;
    const startDate = new Date(virtual.genesis.startsAt);
    return formatDistanceToNow(startDate, { addSuffix: true });
  };

  const tokenPrice =
    virtual.virtualTokenValue && virtual.mcapInVirtual
      ? virtual.mcapInVirtual / weiToEther(virtual.virtualTokenValue)
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
  const diffDays = virtual?.nextLaunchstartsAt?.length
    ? Math.floor(
        (new Date(virtual?.nextLaunchstartsAt[0].startsAt).getTime() -
          Date.now()) /
          (1000 * 60 * 60 * 24)
      )
    : -1;

  const handleSmartBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSmartBuyModalOpen(true);
  };

  return (
    <>
      <div
        className="h-[8.2rem] rounded-xl cursor-pointer border-[0.5px] border-primary-100/60 hover:border-cyan-500/40 transition-all duration-300 w-full font-grotesk"
        onClick={onClick}
      >
        {/* Top Row */}
        <div className="flex items-center justify-between p-4">
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
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-start gap-2">
                <h3 className="text-lg font-semibold leading-none text-white font-['Outrun']">
                  {virtual.name}
                </h3>
                <span className="text-xs text-gray-400 font-light">
                  ${virtual.symbol}
                </span>
                <div
                  className={`flex flex-row justify-center items-center text-xs gap-1 rounded p-[2px] ${
                    diffDays == -1
                      ? "bg-primary-100/70 text-black"
                      : diffDays > 7
                      ? "bg-[#4ade80]/10 text-[#4ade80]"
                      : "bg-[#eab308]/10 text-[#eab308]"
                  }`}
                >
                  {diffDays != -1 ? (
                    <>
                      <IoIosLock />
                      <p>{Math.abs(diffDays)}d</p>
                    </>
                  ) : (
                    <p>DYOR</p>
                  )}
                </div>
                {virtual.socials?.VERIFIED_LINKS?.WEBSITE && (
                  <FaExternalLinkAlt className="w-3 h-3 text-gray-400 cursor-pointer hover:text-cyan-500" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded-md text-xs border border-cyan-400/50 text-gray-300">
                  {virtual.role}
                </span>
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
            className="px-4 py-1 rounded-lg text-primary-100 border border-primary-100/80 font-semibold hover:bg-cyan-500/20 transition-all duration-300 flex items-center justify-center gap-3"
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
        <div className="flex flex-row px-14 py-2 items-center justify-between border-t-[0.5px] border-primary-100/60 w-full">
          <div className="text-sm flex flex-row space-x-2">
            <span className="text-gray-400">Price: </span>
            <span className="text-white">{formatCurrency(tokenPrice)}</span>
          </div>
          <div className="text-sm flex flex-row space-x-1">
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
          <div className="text-sm flex flex-row space-x-1">
            <span className="text-gray-400">Vol: </span>
            <span className="text-white">
              {formatCurrency(virtual.volume24h || 0)}
            </span>
          </div>
          <div className="text-sm flex flex-row space-x-1">
            <span className="text-gray-400">Holders: </span>
            <span className="text-white">
              {formatLargeNumber(virtual.holderCount || 0)}
            </span>
          </div>
        </div>
      </div>

      <SmartBuyModal
        isOpen={isSmartBuyModalOpen}
        onClose={() => setIsSmartBuyModalOpen(false)}
        virtual={virtual}
      />
    </>
  );
};

export default VirtualCard;
