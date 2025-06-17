import React from "react";
import { useTrendingTokens } from "@/hooks/useTrendingTokens";
import Image from "next/image";

const TrendingTokens: React.FC = () => {
  const trendingTokens = useTrendingTokens();

  return (
    <div className="w-full h-12 backdrop-blur-sm bg-[#15181B]/60 rounded-2xl border border-primary-100/40 px-4 py-2">
      <div className="absolute top-0 left-0 w-[100px] h-12 bg-gradient-to-r from-[#26fcfc]/40 via-[#26fcfc]/20 to-transparent pointer-events-none z-0 rounded-2xl"></div>
      <div className="absolute top-0 right-0 w-[100px] h-12 bg-gradient-to-l from-black/40 via-black/60 to-transparent pointer-events-none z-20 rounded-2xl"></div>
      <div className="flex items-center h-full">
        <h2 className="text-primary-100 sm:text-base text-sm font-semibold whitespace-nowrap mr-6 py-4">
          Trending Tokens
        </h2>
        <div className="relative z-10 flex-1 h-full overflow-x-hidden">
          <div className="flex animate-scroll h-full items-center">
            {[...trendingTokens, ...trendingTokens].map((token, index) => (
              <div
                key={`${token.id}-${index}`}
                className="flex items-center justify-center space-x-2 border-x px-4 border-gray-600"
              >
                <div className="relative w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border-2 border-cyan-500/30">
                  <Image
                    src={token.image?.url || "/placeholder.png"}
                    alt={token.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-row items-center justify-center gap-1">
                  <span className="text-white font-sm">{token.symbol}</span>
                  <span className="text-gray-400 text-xs translate-y-[1px]">
                    {token.symbol}
                  </span>
                </div>
                <span
                  className={`text-sm ${
                    token.priceChangePercent24h >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {token.priceChangePercent24h >= 0 ? "+" : ""}
                  {token.priceChangePercent24h.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendingTokens;
