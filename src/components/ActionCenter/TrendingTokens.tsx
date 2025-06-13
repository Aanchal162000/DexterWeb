import React from "react";

interface Token {
  logo: string;
  name: string;
  shortName: string;
  percentageChange: number;
}

const TrendingTokens: React.FC = () => {
  const tokens: Token[] = [
    { logo: "🚀", name: "Bitcoin", shortName: "BTC", percentageChange: 5.2 },
    { logo: "💎", name: "Ethereum", shortName: "ETH", percentageChange: 3.8 },
    { logo: "🌟", name: "Solana", shortName: "SOL", percentageChange: 7.1 },
    { logo: "🌙", name: "Cardano", shortName: "ADA", percentageChange: -2.3 },
    { logo: "⚡", name: "Polkadot", shortName: "DOT", percentageChange: 4.5 },
  ];

  return (
    <div className="w-full h-12 backdrop-blur-sm bg-[#15181B]/60 rounded-2xl border border-primary-100/40 p-4">
      <div className="absolute top-0 left-0 w-[100px] h-12 bg-gradient-to-r from-[#26fcfc]/40 via-[#26fcfc]/20 to-transparent pointer-events-none z-0 rounded-2xl"></div>
      <div className="absolute top-0 right-0 w-[100px] h-12 bg-gradient-to-l from-black/40 via-black/60 to-transparent pointer-events-none z-20 rounded-2xl"></div>
      <div className="flex items-center h-full">
        <h2 className="text-white text-lg font-semibold whitespace-nowrap mr-6">
          Trending Tokens
        </h2>
        <div className="relative z-10 flex-1 h-full overflow-x-hidden">
          <div className="flex  animate-scroll h-full items-center">
            {[...tokens, ...tokens].map((token, index) => (
              <div
                key={index}
                className="flex items-center justify-center space-x-2 border-x px-4 border-gray-600"
              >
                <span className="text-xl">{token.logo}</span>
                <div className="flex flex-row items-center justify-center gap-1">
                  <span className="text-white font-sm">{token.name}</span>
                  <span className="text-gray-400 text-xs translate-y-[1px]">
                    {token.shortName}
                  </span>
                </div>
                <span
                  className={`text-sm ${
                    token.percentageChange >= 0
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {token.percentageChange >= 0 ? "+" : ""}
                  {token.percentageChange}%
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
