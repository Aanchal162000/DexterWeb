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
import { FaCopy, FaExternalLinkAlt } from "react-icons/fa";
import { IoIosLock } from "react-icons/io";
import { toast } from "react-toastify";
import { MdElectricBolt } from "react-icons/md";

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
  const diffDays = virtual?.nextLaunchstartsAt?.length
    ? Math.floor(
        (new Date(virtual?.nextLaunchstartsAt[0].startsAt).getTime() -
          new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : -1;

  return (
    <div
      className="bg-[#1A1E23] h-[100px] rounded-xl cursor-pointer border border-primary-100/60 hover:border-cyan-500/40 transition-all duration-300 w-full backdrop-blur-sm"
      onClick={onClick}
    >
      {/* Top Row */}
      <div className="flex items-center justify-between p-2">
        <div className="flex gap-2">
          <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-cyan-500/30">
            <Image
              src={virtual.image?.url || "/placeholder.png"}
              alt={virtual.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div className="flex flex-col space-y-1">
            <div className="flex flex-row space-x-1 justify-start items-center">
              <div className="text-base font-bold text-white font-['Lato'] whitespace-nowrap">
                {virtual.name}
              </div>
              <div className="text-xs text-gray-400 font-semibold whitespace-nowrap text-center">
                ${virtual.symbol}
              </div>
              <div
                className={` flex flex-row  justify-center items-center text-xs gap-1 rounded p-[2px] ${
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
                    <p>{diffDays}</p>
                  </>
                ) : (
                  <p>DYOR</p>
                )}
              </div>
              {/* {virtual.socials?.VERIFIED_LINKS?.WEBSITE && (
                <FaExternalLinkAlt className="w-3 h-3 text-gray-400 cursor-pointer hover:text-cyan-500" />
              )} */}
            </div>
            <div className="flex flex-row space-x-1 items-start justify-start">
              <span className="p-1  rounded-lg text-[8px] border border-primary-100  text-gray-100">
                {virtual.role}
              </span>
              {virtual.contractAddress && (
                <div className="flex items-center gap-2 p-1  border border-primary-100 rounded-lg text-[8px] text-gray-100">
                  <span>
                    {virtual.contractAddress.slice(0, 4)}...
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
            </div>
          </div>
        </div>
        <button className="border border-primary-100 rounded-lg p-2 item-center justify-center flex flex-row gap-2 text-black">
          <div className="flex justify-center item-center">
            <Image
              src="/Trade/smartBuy.png"
              width={8}
              height={6}
              alt="smart Buy"
            />
          </div>
          <div className="text-xs text-primary-100 font-bold  whitespace-nowrap">
            Smart Buy
          </div>
        </button>
      </div>
      {/* Bottom Row */}
      <div className="flex  flex-row space-x-2  px-2 py-2 items-center justify-center border-t border-primary-100/60 w-full">
        <div className="text-xs flex flex-row space-x-1">
          <span className="text-gray-400">Price: </span>
          <span className="text-white text-[10px]">
            {formatCurrency(tokenPrice)}
          </span>
        </div>
        <div className="text-xs flex flex-row space-x-1">
          <span className="text-gray-400">24h: </span>
          <span
            className={`text-[10px] ${
              (virtual.priceChangePercent24h || 0) >= 0
                ? "text-green-500"
                : "text-red-500"
            }`}
          >
            {formatPercentage(virtual.priceChangePercent24h || 0)}
          </span>
        </div>
        <div className="text-xs flex flex-row space-x-1">
          <span className="text-gray-400">Vol: </span>
          <span className="text-white text-[10px]">
            {formatCurrency(virtual.volume24h || 0)}
          </span>
        </div>
        <div className="text-xs flex flex-row space-x-1">
          <span className="text-gray-400">Holders: </span>
          <span className="text-white text-[10px]">
            {formatLargeNumber(virtual.holderCount || 0)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VirtualCard;
