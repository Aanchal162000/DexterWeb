import { Dispatch, SetStateAction, useEffect, useState } from "react";
import clsx from "clsx";
import ImageNext from "../../common/ImageNext";
import { formatPrecision } from "@/utils/helper";

interface VolumeLoopData {
  id: string;
  token: {
    name: string;
    symbol: string;
    icon: string;
  };
  maxVolume: number;
  status: "Active" | "Completed";
  progress: {
    amount: number;
    percentage: number;
  };
  pointsEarned: number;
  swaps: number;
  startEnd: {
    start: string;
    end: string;
  };
  balance: number;
}

// Mock data for demonstration
const mockVolumeLoopData: VolumeLoopData[] = [
  {
    id: "1",
    token: {
      name: "aixbt",
      symbol: "AIXBT",
      icon: "/tokens/aixbt.png"
    },
    maxVolume: 50000,
    status: "Active",
    progress: {
      amount: 12500,
      percentage: 25
    },
    pointsEarned: 220,
    swaps: 55,
    startEnd: {
      start: "06/06/25 13:54:15",
      end: "12/06/25 13:54:15"
    },
    balance: 825
  },
  {
    id: "2",
    token: {
      name: "WAI Combo",
      symbol: "WAI",
      icon: "/tokens/wai.png"
    },
    maxVolume: 70000,
    status: "Completed",
    progress: {
      amount: 70000,
      percentage: 100
    },
    pointsEarned: 1570,
    swaps: 389,
    startEnd: {
      start: "01/06/25 09:30:22",
      end: "05/06/25 18:45:10"
    },
    balance: 1250
  },
  {
    id: "3",
    token: {
      name: "Dexter Picks",
      symbol: "DXT",
      icon: "/tokens/dexter.png"
    },
    maxVolume: 35000,
    status: "Active",
    progress: {
      amount: 8750,
      percentage: 25
    },
    pointsEarned: 125,
    swaps: 28,
    startEnd: {
      start: "08/06/25 11:20:45",
      end: "15/06/25 11:20:45"
    },
    balance: 440
  },
  {
    id: "4",
    token: {
      name: "aixbt",
      symbol: "AIXBT",
      icon: "/tokens/aixbt.png"
    },
    maxVolume: 50000,
    status: "Active",
    progress: {
      amount: 12500,
      percentage: 25
    },
    pointsEarned: 220,
    swaps: 55,
    startEnd: {
      start: "06/06/25 13:54:15",
      end: "12/06/25 13:54:15"
    },
    balance: 825
  },
  {
    id: "5",
    token: {
      name: "WAI Combo",
      symbol: "WAI",
      icon: "/tokens/wai.png"
    },
    maxVolume: 70000,
    status: "Completed",
    progress: {
      amount: 70000,
      percentage: 100
    },
    pointsEarned: 1570,
    swaps: 389,
    startEnd: {
      start: "01/06/25 09:30:22",
      end: "05/06/25 18:45:10"
    },
    balance: 1250
  },
  {
    id: "6",
    token: {
      name: "Dexter Picks",
      symbol: "DXT",
      icon: "/tokens/dexter.png"
    },
    maxVolume: 35000,
    status: "Active",
    progress: {
      amount: 8750,
      percentage: 25
    },
    pointsEarned: 125,
    swaps: 28,
    startEnd: {
      start: "08/06/25 11:20:45",
      end: "15/06/25 11:20:45"
    },
    balance: 440
  }
];

const VolumeLoop = ({
  setBalance,
  isAmountMasked,
}: {
  setBalance: Dispatch<SetStateAction<number>>;
  isAmountMasked: boolean;
}) => {
  const [dataList] = useState<VolumeLoopData[]>(mockVolumeLoopData);
  const [loading] = useState<boolean>(false);

  useEffect(() => {
    const balance = dataList?.reduce(
      (prev, curr) => prev + (curr.balance ?? 0),
      0
    ) as number;
    setBalance(balance);
  }, [dataList, setBalance]);

  const handleAction = (id: string, status: "Active" | "Completed") => {
    if (status === "Active") {
      // Handle cancel action
      console.log("Cancelling volume loop:", id);
    } else {
      // Handle restart action
      console.log("Restarting volume loop:", id);
    }
  };

  if (loading) {
    return (
      <div className="flex gap-2 size-full flex-col items-center justify-center border-t-2 border-prime-zinc-100/50">
        <div className="size-20 text-prime-zinc-100 animate-spin rounded-full border-4 border-transparent border-t-primary-100" />
        <span className="font-bold text-lg text-prime-zinc-100">
          Loading volume loops...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full text-white overflow-hidden text-[0.94rem] leading-4 small-bar">
      <div
        className="flex w-full h-full overflow-x-auto overflow-y-auto small-bar"
      >
        <table className="table-auto w-full h-fit text-left relative border-collapse">
          <thead className="top-0 transition-colors duration-300 bg-[#201926]/10 sticky z-40 backdrop-blur-md">
            <tr>
              {new Array(9).fill(0).map((_, index) => (
                <th key={index} className="h-[1px] p-0 bg-[#26fcfc]/30"></th>
              ))}
            </tr>
            <tr className="text-white text-sm [&>th:first-child]:pl-8 [&>th:last-child]:pr-8 [&>th]:py-2 [&>th]:px-[0.7rem]">
              <th>Token</th>
              <th>Max Volume</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Points Earned</th>
              <th>Swaps</th>
              <th>Start/End</th>
              <th>Balance</th>
              <th>Action</th>
            </tr>
            <tr>
              {new Array(9).fill(0).map((_, index) => (
                <th key={index} className="h-[1.1px] p-0 bg-[#26fcfc]/30"></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataList?.map((item: VolumeLoopData, index: number) => (
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
                <td className="text-right">
                  {isAmountMasked
                    ? "XXXXXX"
                    : `$${formatPrecision(item.maxVolume)}`}
                </td>
                <td>
                  <span
                    className={clsx(
                      "px-3 py-1 rounded-full text-xs font-medium",
                      item.status === "Active"
                        ? "bg-[#173B63] text-[#00E0FF]"
                        : "bg-[#193F3C] text-[#00FF94]"
                    )}
                  >
                    {item.status}
                  </span>
                </td>
                <td>
                  <div className="flex flex-col gap-2">
                    <div className="text-sm">
                      {isAmountMasked
                        ? "XXXXXX"
                        : `$${formatPrecision(item.progress.amount)}`} | {item.progress.percentage}%
                    </div>
                    <div className="w-full bg-[#26303F] rounded-full h-1.5">
                      <div
                        className="bg-[#00E0FF] h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="text-center font-medium">
                  {formatPrecision(item.pointsEarned)}
                </td>
                <td className="text-center font-medium">
                  {item.swaps}
                </td>
                <td>
                  <div className="flex flex-col gap-1 text-xs">
                    <div>{item.startEnd.start}</div>
                    <div className="">{item.startEnd.end}</div>
                  </div>
                </td>
                <td className="text-right">
                  {isAmountMasked
                    ? "XXXXXX"
                    : `$${formatPrecision(item.balance)}`}
                </td>
                <td>
                  <button
                    onClick={() => handleAction(item.id, item.status)}
                    className={clsx(
                      "px-4 py-2 rounded text-sm font-medium transition-colors",
                      item.status === "Active"
                        ? "bg-[#1F2D3D] text-white hover:bg-[#2D3B4F]"
                        : "bg-[#00E0FF] text-[#0B111A] hover:bg-[#00BBD6]"
                    )}
                  >
                    {item.status === "Active" ? "Cancel" : "Restart"}
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

export default VolumeLoop;
