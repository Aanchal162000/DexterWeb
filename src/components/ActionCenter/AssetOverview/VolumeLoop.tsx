import { Dispatch, SetStateAction, useEffect, useState } from "react";
import clsx from "clsx";
import ImageNext from "../../common/ImageNext";
import { formatPrecision } from "@/utils/helper";
import { useLoginContext } from "../../../context/LoginContext";
import { useActionContext } from "../../../context/ActionContext";
import { actionService } from "@/services/contract/actionService";

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

const VolumeLoop = ({
  setBalance,
  isAmountMasked,
}: {
  setBalance: Dispatch<SetStateAction<number>>;
  isAmountMasked: boolean;
}) => {
  const [dataList, setDataList] = useState<VolumeLoopData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { address } = useLoginContext();
  const { authToken } = useActionContext();

  useEffect(() => {
    const fetchUserLoops = async () => {
      if (!address || !authToken) return;

      try {
        const response = await actionService.getUserLoops(
          { page: "1", limit: "10" },
          authToken
        );

        if (response.success) {
          const formattedData: VolumeLoopData[] = response.data.map((loop) => ({
            id: loop.id,
            token: {
              name: loop.token.name,
              symbol: loop.token.name,
              icon: loop.token.imageUrl || "/tokens/default.png",
            },
            maxVolume: parseFloat(loop.maxVolume),
            status:
              loop.status.toLowerCase() === "active" ? "Active" : "Completed",
            progress: {
              amount: parseFloat(loop.progress.amount),
              percentage: parseFloat(loop.progress.percentage),
            },
            pointsEarned: loop.pointsEarned,
            swaps: loop.swaps,
            startEnd: {
              start: loop.timeline.start,
              end: loop.timeline.end,
            },
            balance: loop.balance,
          }));
          setDataList(formattedData);
        }
      } catch (error) {
        console.error("Error fetching user loops:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLoops();
  }, [address, authToken]);

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

  if (!dataList.length) {
    return (
      <div className="flex gap-2 size-full flex-col items-center justify-center border-t-2 border-prime-zinc-100/50">
        <span className="font-bold text-lg text-prime-zinc-100">
          No Volume Loops found
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full text-white overflow-hidden text-[0.94rem] leading-4 small-bar">
      <div className="flex w-full h-full overflow-x-auto overflow-y-auto small-bar">
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
                        : `$${formatPrecision(item.progress.amount)}`}{" "}
                      | {item.progress.percentage}%
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
                <td className="text-center font-medium">{item.swaps}</td>
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
