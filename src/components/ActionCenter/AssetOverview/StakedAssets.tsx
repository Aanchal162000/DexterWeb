import { Dispatch, SetStateAction, useEffect, useState } from "react";
import clsx from "clsx";
import ImageNext from "../../common/ImageNext";
import { formatPrecision } from "@/utils/helper";

interface StakedAssetData {
  id: string;
  token: {
    name: string;
    symbol: string;
    icon: string;
  };
  protocol: string;
  stakedAmount: number;
  rewardAmount: number;
  apy: number;
  lockPeriod: string;
  status: "Active" | "Unlocking" | "Claimable";
  value: number;
}

// Mock data for demonstration
const mockStakedAssets: StakedAssetData[] = [
  {
    id: "1",
    token: {
      name: "Ethereum",
      symbol: "ETH",
      icon: "/tokens/eth.png"
    },
    protocol: "Lido",
    stakedAmount: 5.0,
    rewardAmount: 0.125,
    apy: 4.2,
    lockPeriod: "No lock",
    status: "Active",
    value: 11500.50
  },
  {
    id: "2",
    token: {
      name: "Arbitrum",
      symbol: "ARB",
      icon: "/tokens/arb.png"
    },
    protocol: "GMX",
    stakedAmount: 1500.0,
    rewardAmount: 45.75,
    apy: 8.5,
    lockPeriod: "7 days",
    status: "Unlocking",
    value: 2250.00
  },
  {
    id: "3",
    token: {
      name: "Pendle",
      symbol: "PENDLE",
      icon: "/tokens/pendle.png"
    },
    protocol: "Pendle",
    stakedAmount: 850.0,
    rewardAmount: 127.5,
    apy: 15.2,
    lockPeriod: "14 days",
    status: "Claimable",
    value: 3825.75
  }
];

const StakedAssets = ({
  setBalance,
  isAmountMasked,
}: {
  setBalance: Dispatch<SetStateAction<number>>;
  isAmountMasked: boolean;
}) => {
  const [dataList] = useState<StakedAssetData[]>(mockStakedAssets);
  const [loading] = useState<boolean>(false);

  useEffect(() => {
    const balance = dataList?.reduce(
      (prev, curr) => prev + (curr.value ?? 0),
      0
    ) as number;
    setBalance(balance);
  }, [dataList, setBalance]);

  const handleAction = (id: string, status: "Active" | "Unlocking" | "Claimable") => {
    if (status === "Active") {
      console.log("Unstaking:", id);
    } else if (status === "Claimable") {
      console.log("Claiming rewards:", id);
    } else {
      console.log("Action not available:", id);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2 size-full flex-col items-center justify-center border-t-2 border-prime-zinc-100/50">
        <div className="size-20 text-prime-zinc-100 animate-spin rounded-full border-4 border-transparent border-t-primary-100" />
        <span className="font-bold text-lg text-prime-zinc-100">
          Loading staked assets...
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
              {new Array(8).fill(0).map((_, index) => (
                <th key={index} className="h-[1px] p-0 bg-[#26fcfc]/30"></th>
              ))}
            </tr>
            <tr className="text-white text-sm [&>th:first-child]:pl-8 [&>th:last-child]:pr-8 [&>th]:py-2 [&>th]:px-[0.7rem]">
              <th>Asset</th>
              <th>Protocol</th>
              <th>Staked Amount</th>
              <th>Rewards</th>
              <th>APY</th>
              <th>Lock Period</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
            <tr>
              {new Array(8).fill(0).map((_, index) => (
                <th key={index} className="h-[1.1px] p-0 bg-[#26fcfc]/30"></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataList?.map((item: StakedAssetData, index: number) => (
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
                  <span className="font-medium">{item.protocol}</span>
                </td>
                <td>
                  <div className="flex flex-col gap-1">
                    <div>
                      {isAmountMasked
                        ? "XXXXXX"
                        : formatPrecision(item.stakedAmount)}
                    </div>
                    <div className="text-xs text-prime-zinc-100">
                      {isAmountMasked
                        ? "XXXXXX"
                        : `$${formatPrecision(item.value)}`}
                    </div>
                  </div>
                </td>
                <td>
                  {isAmountMasked
                    ? "XXXXXX"
                    : `${formatPrecision(item.rewardAmount)} ${item.token.symbol}`}
                </td>
                <td>
                  <span className="text-[#00FF94] font-medium">
                    {item.apy}%
                  </span>
                </td>
                <td>
                  <span className="text-sm">{item.lockPeriod}</span>
                </td>
                <td>
                  <span
                    className={clsx(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      item.status === "Active"
                        ? "bg-[#173B63] text-[#00E0FF]"
                        : item.status === "Claimable"
                        ? "bg-[#193F3C] text-[#00FF94]"
                        : "bg-[#4A3728] text-[#FFC400]"
                    )}
                  >
                    {item.status}
                  </span>
                </td>
                <td>
                  <button
                    onClick={() => handleAction(item.id, item.status)}
                    disabled={item.status === "Unlocking"}
                    className={clsx(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      item.status === "Active"
                        ? "bg-[#1F2D3D] text-white hover:bg-[#2D3B4F]"
                        : item.status === "Claimable"
                        ? "bg-[#00E0FF] text-[#0B111A] hover:bg-[#00BBD6]"
                        : "bg-[#2A2A2A] text-[#666666] cursor-not-allowed"
                    )}
                  >
                    {item.status === "Active"
                      ? "Unstake"
                      : item.status === "Claimable"
                      ? "Claim"
                      : "Locked"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StakedAssets;
