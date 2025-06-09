import React, { useEffect, useRef, useState } from "react";
import { useLoginContext } from "@/context/LoginContext";
import { VscSync } from "react-icons/vsc";
import { LuCalendarX2 } from "react-icons/lu";
import clsx from "clsx";
import ImageNext from "../common/ImageNext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatAddress } from "@/utils/helper";
import { toastSuccess } from "@/utils/toast";
import CopyTooltip from "../common/CopyTooltip";
import InfoTooltip from "../common/InfoTooltip";
import { MdCallMade, MdCallReceived } from "react-icons/md";
import { VscArrowSwap } from "react-icons/vsc";
import { TbArrowsCross } from "react-icons/tb";
import { FiUserCheck } from "react-icons/fi";
import { IoBan } from "react-icons/io5";
import dayjs from "@/services/dayjsConfig";
import LoaderLine from "../common/LoaderLine";
import { agentService } from "@/services/contract/agentService";
import { ParseWeiUtil } from "@/utils/helper";
import { tokenSymbolList, chainsLogo } from "@/constants/config";
import { useMergedTokens } from "@/hooks/useMergedTokens";

interface IVirtualTransaction {
  type: "in" | "out";
  fromNetwork: string;
  toNetwork: string;
  fromToken: string;
  toToken: string;
  srcAmount: string;
  hash: string;
  depositToken: string;
  processed: string;
  ago: string;
  date: string;
  dateShort: string;
  imgFromToken: string;
  imgToToken: string;
  imgFromNetwork: string;
  imgToNetwork: string;
  actionType: string;
}

const typeChange: { [key: string]: string } = {
  in: "IN",
  out: "OUT",
};

const VirtualTransactions = () => {
  const { address } = useLoginContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [backgroundSync, setBackgroundSync] = useState<boolean>(false);
  const [transactionList, setTransactionList] = useLocalStorage<
    IVirtualTransaction[]
  >("virtual-transactions", []);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { mergedTokens, isLoading: tokensLoading } = useMergedTokens();

  useEffect(() => {
    const handleScroll = () => {
      if (tableContainerRef.current) {
        setIsScrolled(tableContainerRef.current.scrollTop > 0);
      }
    };

    const currentRef = tableContainerRef.current;
    currentRef?.addEventListener("scroll", handleScroll);

    return () => {
      currentRef?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const fetchVirtualTransactions = async () => {
    try {
      setLoading(true);
      const response = await agentService.getUserTransactions(
        address as string
      );
      console.log("Resonse", mergedTokens, response);

      if (response.success && response.data?.transactions) {
        const formattedTransactions = response.data.transactions.map(
          (transaction) => {
            const chainObj = tokenSymbolList.find(
              (item) => item.conversionSymbol === "base"
            );

            // Find token in merged tokens list
            const tokenObj = mergedTokens.find(
              (token) =>
                token.name?.toLowerCase() ===
                transaction.agentName?.toLowerCase()
            );

            const chainLogo =
              chainsLogo[
                chainObj?.code?.toLowerCase() as keyof typeof chainsLogo
              ] || "";

            // Determine transaction type based on agent type
            const transactionType = transaction.genesisId
              ? "in"
              : ("out" as IVirtualTransaction["type"]);

            return {
              type: transactionType,
              fromNetwork: chainObj?.code || "",
              toNetwork: chainObj?.code || "",
              fromToken: tokenObj?.name || transaction.agentName,
              toToken: tokenObj?.name || transaction.agentName,
              srcAmount: ParseWeiUtil(
                transaction.userDeposit.amount,
                18
              ).toString(),
              depositToken:
                transaction.userDeposit.token === "virtual" ? "VIRT" : "ETH",
              hash:
                transaction.transaction.hash.slice(0, 4) +
                  "...." +
                  transaction.transaction.hash.slice(-4) || "", // No transaction hash in new response
              processed:
                transaction.transaction.status === "not_started"
                  ? "Active"
                  : "Completed",
              ago: dayjs(transaction.timestamps.createdAt).fromNow(),
              date: dayjs(transaction.timestamps.createdAt).format(
                "DD-MM-YYYY HH:mm:ss"
              ),
              dateShort: dayjs(transaction.timestamps.createdAt).format(
                "DD-MM-YYYY HH:mm:ss"
              ),
              imgFromToken: tokenObj?.logo || "",
              imgToToken: tokenObj?.logo || "",
              imgFromNetwork: chainLogo,
              imgToNetwork: chainLogo,
              actionType:
                transaction.transaction.status === "not_started"
                  ? "Smart Buy"
                  : "Stake",
            };
          }
        );

        setTransactionList(formattedTransactions);
      }
    } catch (error) {
      console.error("Error fetching virtual transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address && !tokensLoading) {
      fetchVirtualTransactions();
    }
  }, [address, tokensLoading]);

  if (loading || tokensLoading) {
    return (
      <div className="flex gap-2 size-full flex-col items-center justify-center border-t-2 border-prime-zinc-100/50">
        <VscSync className="size-20 text-prime-zinc-100 animate-spin" />
        <span className="font-bold text-lg text-prime-zinc-100">
          Syncing virtual transactions...
        </span>
      </div>
    );
  }

  if (!loading && !transactionList?.length) {
    return (
      <div className="flex gap-2 size-full flex-col items-center justify-center border-t-2 border-prime-zinc-100/50">
        <LuCalendarX2 className="size-16 text-prime-zinc-100" />
        <span className="font-bold text-lg text-prime-zinc-100">
          No Virtual Transactions Found
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full text-white overflow-hidden text-[0.94rem] leading-4 small-bar">
      {backgroundSync && <LoaderLine />}
      <div
        ref={tableContainerRef}
        className={clsx(
          "flex w-full h-full overflow-x-auto overflow-y-auto small-bar",
          !isScrolled && "small-bar-hidden"
        )}
      >
        <table className="table-auto w-full h-fit text-left relative border-collapse">
          <thead
            className={clsx(
              "top-0 transition-colors duration-300",
              isScrolled ? "bg-[#201926]/80 sticky z-40 backdrop-blur-md" : ""
            )}
          >
            <tr>
              {new Array(4).fill(0).map((_, index) => (
                <th key={index} className="h-[1px] p-0 bg-[#26fcfc]/70"></th>
              ))}
            </tr>
            <tr className="text-prime-zinc-100 text-sm [&>th:first-child]:pl-8 [&>th:last-child]:pr-8 [&>th]:py-2 [&>th]:px-[0.7rem]">
              <th>Token</th>
              <th>Type</th>
              <th>Time</th>
              <th>Action Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>TXID</th>
              <th>Actions</th>
            </tr>
            <tr>
              {new Array(8).fill(0).map((_, index) => (
                <th key={index} className="h-[1px] p-0 bg-[#26fcfc]/70"></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {transactionList?.map((item, index) => (
              <tr
                key={index}
                className={clsx(
                  "[&>td:first-child]:pl-8 [&>th:last-child]:pr-8 [&>td]:py-3.5 [&>td]:px-3",
                  index === 0 && "[&>td]:pt-5",
                  index % 2 !== 0 && "bg-[#818284]/10"
                )}
              >
                <td>
                  <div className="flex items-center gap-2">
                    <ImageNext
                      src={item.imgFromToken}
                      className="size-8 border border-gray-800 rounded-full"
                      alt="token-logo"
                      fullRadius
                    />
                    <span className="text-sm font-medium">
                      {item.fromToken?.toUpperCase()}
                    </span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{typeChange[item.type]}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{item.dateShort}</span>
                  </div>
                </td>
                <td>
                  <div className="flex items-center gap-2 text-sm">
                    {item.actionType}
                  </div>
                </td>
                <td>
                  <div className="text-sm">
                    {item.srcAmount} {item.depositToken}
                  </div>
                </td>
                <td>
                  <div className="text-sm text-white">{item.processed}</div>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {item.hash
                      ? item.hash.slice(0, 4) + "....." + item.hash.slice(-4)
                      : ""}
                  </div>
                </td>
                <td>
                  {item.processed == "Active" && (
                    <button className=" w-[80px] p-1 border hover:bg-primary-100/20 border-primary-100 rounded text-white text-sm font-bold ">
                      Cancel
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="relative w-full px-4 !!py-3 py-2 border-t border-primary-100/70 mt-auto flex items-center justify-center">
        <div className="invisible">.</div>
        <span className="absolute text-xs right-9 top-1/2 -translate-y-1/2 font-bold text-prime-zinc-100 flex items-center flex-nowrap text-nowrap">
          {backgroundSync ? (
            <>
              <VscSync className="size-5 text-prime-zinc-100 animate-spin mr-1" />
              Syncing...
            </>
          ) : (
            <>
              Sync manually ?&nbsp;{" "}
              <button
                className="underline hover:font-semibold"
                onClick={fetchVirtualTransactions}
              >
                Click here
              </button>
            </>
          )}
        </span>
      </div>
    </div>
  );
};

export default VirtualTransactions;
