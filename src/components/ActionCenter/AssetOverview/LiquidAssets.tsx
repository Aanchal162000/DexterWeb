import { Dispatch, SetStateAction, useEffect, useState } from "react";
import clsx from "clsx";
import ImageNext from "../../common/ImageNext";
import { formatPrecision } from "@/utils/helper";

interface LiquidAssetData {
  id: string;
  token: {
    name: string;
    symbol: string;
    icon: string;
  };
  network: {
    name: string;
    icon: string;
  };
  balance: number;
  value: number;
  price: number;
  change24h: number;
}

// Mock data for demonstration
const mockLiquidAssets: LiquidAssetData[] = [
  {
    id: "1",
    token: {
      name: "Ethereum",
      symbol: "ETH",
      icon: "/tokens/eth.png"
    },
    network: {
      name: "Ethereum",
      icon: "/networks/ethereum.png"
    },
    balance: 2.5,
    value: 5750.25,
    price: 2300.10,
    change24h: 2.5
  },
  {
    id: "2",
    token: {
      name: "USD Coin",
      symbol: "USDC",
      icon: "/tokens/usdc.png"
    },
    network: {
      name: "Arbitrum",
      icon: "/networks/arbitrum.png"
    },
    balance: 1250.00,
    value: 1250.00,
    price: 1.00,
    change24h: 0.01
  },
  {
    id: "3",
    token: {
      name: "Wrapped Bitcoin",
      symbol: "WBTC",
      icon: "/tokens/wbtc.png"
    },
    network: {
      name: "Base",
      icon: "/networks/base.png"
    },
    balance: 0.15,
    value: 6450.75,
    price: 43005.00,
    change24h: -1.8
  }
];

const LiquidAssets = ({
  setBalance,
  isAmountMasked,
}: {
  setBalance: Dispatch<SetStateAction<number>>;
  isAmountMasked: boolean;
}) => {
  const [dataList] = useState<LiquidAssetData[]>(mockLiquidAssets);
  const [loading] = useState<boolean>(false);

  useEffect(() => {
    const balance = dataList?.reduce(
      (prev, curr) => prev + (curr.value ?? 0),
      0
    ) as number;
    setBalance(balance);
  }, [dataList, setBalance]);

  if (loading) {
    return (
      <div className="flex gap-2 size-full flex-col items-center justify-center border-t-2 border-prime-zinc-100/50">
        <div className="size-20 text-prime-zinc-100 animate-spin rounded-full border-4 border-transparent border-t-primary-100" />
        <span className="font-bold text-lg text-prime-zinc-100">
          Loading liquid assets...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full text-white overflow-hidden text-[0.94rem] leading-4 small-bar">
      <div className="flex w-full h-full overflow-x-auto overflow-y-auto small-bar">
        <table className="table-auto w-full h-fit text-left relative border-collapse">
          <thead className="top-0 transition-colors duration-300 sticky z-40">
            <tr>
              {new Array(6).fill(0).map((_, index) => (
                <th key={index} className="h-[1px] p-0 bg-[#26fcfc]/30"></th>
              ))}
            </tr>
            <tr className="text-white text-sm [&>th:first-child]:pl-8 [&>th:last-child]:pr-8 [&>th]:py-2 [&>th]:px-[0.7rem]">
              <th>Asset</th>
              <th>Network</th>
              <th>Balance</th>
              <th>Price (USD)</th>
              <th>24h Change</th>
              <th>Value (USD)</th>
            </tr>
            <tr>
              {new Array(6).fill(0).map((_, index) => (
                <th key={index} className="h-[1.1px] p-0 bg-[#26fcfc]/30"></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataList?.map((item: LiquidAssetData, index: number) => (
              <tr
                key={item.id}
                className={clsx(
                  "[&>td:first-child]:pl-8 [&>td:last-child]:pr-8 [&>td]:py-3 [&>td]:px-3",
                  index === 0 && "[&>td]:pt-5",
                  index % 2 !== 0 && "bg-[#818284]/10"
                )}
              >
                <td>
                  <div className="flex flex-row gap-2 items-center">
                    <ImageNext
                      src={item.token.icon}
                      className="size-10 rounded-full"
                      alt="token-logo"
                      fullRadius
                    />
                    <div className="flex flex-col gap-1">
                      <div className="font-bold text-nowrap">
                        {item.token.name}
                      </div>
                      <div className="text-sm text-prime-zinc-100">
                        {item.token.symbol}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <ImageNext
                      src={item.network.icon}
                      className="size-6 rounded-full"
                      alt="network-logo"
                      fullRadius
                    />
                    <span className="text-sm">{item.network.name}</span>
                  </div>
                </td>
                <td>
                  {isAmountMasked
                    ? "XXXXXX"
                    : formatPrecision(item.balance)}
                </td>
                <td>
                  {isAmountMasked
                    ? "XXXXXX"
                    : `$${formatPrecision(item.price)}`}
                </td>
                <td>
                  <span
                    className={clsx(
                      "font-medium",
                      item.change24h >= 0 ? "text-[#00FF94]" : "text-[#FF4D4D]"
                    )}
                  >
                    {item.change24h >= 0 ? "+" : ""}{item.change24h}%
                  </span>
                </td>
                <td className="text-right font-medium">
                  {isAmountMasked
                    ? "XXXXXX"
                    : `$${formatPrecision(item.value)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LiquidAssets;
