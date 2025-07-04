import React, { useEffect, useRef, useState } from "react";
import { useLoginContext } from "@/context/LoginContext";
import { VscSync } from "react-icons/vsc";
import { LuCalendarX2 } from "react-icons/lu";
import clsx from "clsx";
import ImageNext from "../common/ImageNext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { formatAddress } from "@/utils/helper";
import {
  toastSuccess,
  toastError,
  toastInfo,
  toastProcess,
} from "@/utils/toast";
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
import {
  tokenSymbolList,
  chainsLogo,
  VIRTUALS_TOKEN_ADDRESS,
} from "@/constants/config";
import { useMergedTokens } from "@/hooks/useMergedTokens";
import { toast } from "react-toastify";

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
const statusType: { [key: string]: string } = {
  failed: "Failed",
  not_started: "Active",
  pending: "Pending",
  confirmed: "Completed",
};

const VirtualTransactions = () => {
  const { address, networkData } = useLoginContext();
  const [loading, setLoading] = useState<boolean>(true);
  const [backgroundSync, setBackgroundSync] = useState<boolean>(false);
  const [processingTx, setProcessingTx] = useState<string | null>(null);
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

      if (response.success && response.data?.transactions) {
        const formattedTransactions = response.data.transactions.map((trx) => {
          const chainObj = tokenSymbolList.find(
            (item) => item.conversionSymbol === "base"
          );

          // Find token in merged tokens list
          const tokenObj = mergedTokens.find(
            (token) =>
              token.name?.toLowerCase() === trx.agentName?.toLowerCase()
          );

          console.log("tokenObj", tokenObj);
          const chainLogo =
            chainsLogo[
              chainObj?.code?.toLowerCase() as keyof typeof chainsLogo
            ] || "";

          // Determine transaction type based on agent type
          const transactionType =
            trx.transaction.status === "not_started"
              ? ("out" as IVirtualTransaction["type"])
              : "in";

          return {
            tokenObj: tokenObj,
            type: transactionType,
            fromNetwork: chainObj?.code || "",
            toNetwork: chainObj?.code || "",
            fromToken: tokenObj?.name || trx.agentName,
            toToken: tokenObj?.name || trx.agentName,
            srcAmount: ParseWeiUtil(trx.userDeposit.amount, 18).toString(),
            depositToken: trx.userDeposit.token === "virtual" ? "VIRT" : "ETH",
            hash:
              trx.transaction.status === "not_started"
                ? trx.userDeposit.depositTxHash
                : trx.transaction.hash || "", // Store full hash
            processed:
              trx.transaction.status == "withdrawn"
                ? "Completed"
                : statusType[trx.transaction.status],
            ago: dayjs(trx.timestamps.createdAt).fromNow(),
            date: dayjs(trx.timestamps.createdAt).format("DD-MM-YYYY HH:mm:ss"),
            dateShort: dayjs(trx.timestamps.createdAt).format(
              "DD-MM-YYYY HH:mm:ss"
            ),
            imgFromToken: tokenObj?.logo || "",
            imgToToken: tokenObj?.logo || "",
            imgFromNetwork: chainLogo,
            imgToNetwork: chainLogo,
            actionType:
              trx.transaction.status === "not_started"
                ? "Smart Buy"
                : trx.transaction.status == "withdrawn"
                ? "Withdraw"
                : "Stake",
          };
        });

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

  const handleWithdraw = async (
    amount: string,
    token: string,
    hash: string,
    item: any
  ) => {
    let processToastId: string | number | null = null;
    setProcessingTx(hash);
    const apiResponse = await agentService.notifyWithdraw({
      txHash:
        "0xab6ae048285cb4249af8af556a155d888738e9e3f9ff252927e610a16bb20876",
      genesisId: item?.tokenObj.id, // Using the original hash as genesisId
    });

    try {
      processToastId = toastProcess("Processing Transaction...");
      const tokenAddress =
        token === "VIRT"
          ? VIRTUALS_TOKEN_ADDRESS
          : "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

      const receipt = await agentService.withdraw({
        tokenAddress: tokenAddress!,
        amount: amount,
        provider: networkData?.provider!,
      });

      if (receipt.transactionHash) {
        // Call the withdraw API endpoint
        const apiResponse = await agentService.notifyWithdraw({
          txHash: receipt.transactionHash,
          genesisId: item?.tokenObj.id, // Using the original hash as genesisId
        });

        if (!apiResponse.success) {
          console.error("Failed to notify withdraw:", apiResponse.message);
        }

        if (processToastId) toast.dismiss(processToastId);
        toastSuccess("Withdrawal initiated successfully!");
      }
    } catch (error: any) {
      if (processToastId) toast.dismiss(processToastId);
      console.error("Withdrawal error:", error);

      // Handle specific error cases
      if (error?.message?.includes("UNPREDICTABLE_GAS_LIMIT")) {
        if (error?.reason?.includes("Insufficient deposit")) {
          toastError("Insufficient deposit balance for withdrawal");
        } else if (error?.reason?.includes("execution reverted")) {
          // Extract the specific error reason from the revert message
          const revertReason = error.reason
            .split("execution reverted:")[1]
            ?.trim();
          toastError(revertReason || "Transaction failed. Please try again.");
        } else {
          toastError(
            "Transaction may fail. Please check your balance and try again."
          );
        }
      } else if (error?.code === 4001) {
        // User rejected the transaction
        toastInfo("Transaction cancelled by user");
      } else if (error?.code === -32603) {
        // Internal JSON-RPC error
        toastError("Network error. Please try again later.");
      } else {
        // Generic error handling
        const errorMessage =
          error?.message || "Failed to process withdrawal. Please try again.";
        toastError(errorMessage);
      }
    } finally {
      setProcessingTx(null);
      await fetchVirtualTransactions();
    }
  };

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
                    {item.hash ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {item.hash.slice(0, 4) + "...." + item.hash.slice(-4)}
                        </span>
                        <CopyTooltip
                          onClick={() => {
                            navigator.clipboard.writeText(item.hash);
                            toastSuccess("Transaction Hash Copied");
                          }}
                          tooltip="Copy Transaction Hash"
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-prime-zinc-100">-</span>
                    )}
                  </div>
                </td>
                <td>
                  {item.processed == "Active" && (
                    <button
                      disabled={processingTx === item.hash}
                      className={clsx(
                        "w-[80px] p-1 border border-primary-100 rounded text-white text-sm font-bold flex items-center justify-center gap-2",
                        processingTx === item.hash
                          ? "opacity-70 cursor-not-allowed"
                          : "hover:bg-primary-100/20"
                      )}
                      onClick={() => {
                        handleWithdraw(
                          item.srcAmount,
                          item.depositToken,
                          item.hash,
                          item
                        );
                      }}
                    >
                      {processingTx === item.hash ? (
                        <>
                          <VscSync className="size-4 animate-spin" />
                          <span>Cancel</span>
                        </>
                      ) : (
                        "Cancel"
                      )}
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
