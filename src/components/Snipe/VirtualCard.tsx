"use client";

import React, { useState } from "react";
import { IVirtual } from "@/utils/interface";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import {
  formatCurrency,
  formatPercentage,
  formatLargeNumber,
} from "@/utils/tokenCalculations";
import { FaExternalLinkAlt } from "react-icons/fa";
import { RiLock2Line } from "react-icons/ri";
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
  function trimName(name: string): string {
    return name.length > 10 ? name.slice(0, 10) + ".." : name;
  }

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
        className="min-h-[7.2rem] h-fit rounded-xl cursor-pointer border-[0.5px] border-primary-100/60 hover:border-cyan-500/40 transition-all duration-300 w-full"
        onClick={handleCardClick}
      >
        {/* Top Row */}
        <div className="flex items-center justify-between px-3 py-4">
          <div className="flex items-center gap-1">
            <div className="relative w-11 h-11 rounded-full overflow-hidden flex-shrink-0 border-2 border-cyan-500/30">
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
                  {trimName(virtual.name)}
                </h3>
                <span className="text-[9px] text-gray-400 font-light">
                  ${virtual.symbol}
                </span>

                <div
                  className={`flex flex-row justify-center items-center text-[10px] gap-[2px] rounded px-[3px] py-[1px] ${
                    diffDays == -1
                      ? "bg-gray-700 text-white"
                      : diffDays! > 7
                      ? "bg-[#4ade80]/10 text-[#4ade80]"
                      : "bg-[#eab308]/10 text-[#eab308]"
                  }`}
                >
                  {diffDays != -1 ? (
                    <>
                      <RiLock2Line className="w-3 h-3" />
                      <p>{Math.abs(diffDays!)}d</p>
                    </>
                  ) : (
                    <p className="text-[9px]">DYOR</p>
                  )}
                </div>

                <Link
                  key={virtual.name}
                  href={`https://app.virtuals.io/virtuals/${virtual.id}`}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Image
                    src="/Trade/Link.png"
                    alt="Link"
                    width={4}
                    height={4}
                    className="w-3 h-3 text-gray-400 cursor-pointer hover:text-cyan-500"
                  />
                </Link>
              </div>
              <div className="flex items-center gap-1">
                <span className="px-1 rounded text-[10px] border border-cyan-400/50 text-gray-300  capitalize">
                  {virtual.role?.toLowerCase()}
                </span>

                {virtual.contractAddress && (
                  <div className="flex items-center space-x-1 px-1 rounded text-[10px] border border-cyan-400/50 text-gray-300">
                    <span>
                      {virtual.contractAddress.slice(0, 4)}...
                      {virtual.contractAddress.slice(-4)}
                    </span>
                    <Image
                      src="/Trade/Copy.png"
                      alt="Copy"
                      width={4}
                      height={4}
                      className="w-2 h-2 cursor-pointer hover:text-cyan-500"
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
            className="w-[72px] p-1   text-nowrap text-[11px] rounded text-primary-100 border border-primary-100/80 font-semibold hover:bg-cyan-500/20 transition-all duration-300 flex items-center justify-center gap-2"
          >
            {/* <Image
              src="/Trade/smartBuy.png"
              width={8}
              height={6}
              alt="smart Buy"
            /> */}
            <span>Smart Buy</span>
          </button>
        </div>

        {/* Bottom Row */}
        <div className="relative px-4 py-2 items-center justify-center border-t-[0.5px] border-primary-100/60 w-full">
          <div className="flex flex-row gap-1 relative w-full items-center justify-between">
            <div className="text-[10px] flex flex-row space-x-1  items-center justify-center">
              <span className="text-gray-400">Price: </span>
              <span className="text-white  text-[11px]">
                {"$" +
                  virtual?.price!?.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 5,
                  })}
              </span>
            </div>
            <div className="text-[10px] flex flex-row space-x-1  items-center justify-center">
              <span className="text-gray-400">24h: </span>
              <span
                className={`text-[11px] ${
                  metrics.priceChange24h >= 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {formatPercentage(metrics.priceChange24h)}
              </span>
            </div>
            <div className="text-[10px] flex flex-row space-x-1 items-center justify-center">
              <span className="text-gray-400">Vol: </span>
              <span className="text-white  text-[11px]">
                {formatCurrency(metrics.volume24hUSD)}
              </span>
            </div>
            <div className="text-[10px] flex flex-row space-x-1 items-center justify-center">
              <span className="text-gray-400">Holders: </span>
              <span className="text-white  text-[11px]">
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
