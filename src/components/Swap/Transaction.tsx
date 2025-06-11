import { useLoginContext } from "@/context/LoginContext";
import useEffectAsync from "@/hooks/useEffectAsync";
import { toastError, toastSuccess } from "@/utils/toast";
import { MouseEvent, useEffect, useRef, useState } from "react";
import { LuCalendarX2 } from "react-icons/lu";
import { useMergedTokens } from "@/hooks/useMergedTokens";

import clsx from "clsx";
import { VscSync } from "react-icons/vsc";
import { MdCallMade, MdCallReceived } from "react-icons/md";
import {
  arbitrumList,
  avalancheList,
  baseList,
  chainsLogo,
  extraCoins,
  optimismList,
  tokenList,
  tokenSymbolList,
} from "@/constants/config";
import { ParseWeiUtil, formatAddress } from "@/utils/helper";
import ImageNext from "../common/ImageNext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getUnifiedTransactions } from "@/services/userService";
import { ITransactionData } from "@/utils/interface";
import CopyTooltip from "../common/CopyTooltip";
import InfoTooltip from "../common/InfoTooltip";
import { TbArrowsCross } from "react-icons/tb";
import { FiUserCheck } from "react-icons/fi";
import { VscArrowSwap } from "react-icons/vsc";
import { IoBanOutline } from "react-icons/io5";
import dayjs from "@/services/dayjsConfig";
import { useInView } from "react-intersection-observer";
import LoaderLine from "../common/LoaderLine";

let isAddressEqual = (a: string, b: string) =>
  a?.toString().toLowerCase() === b?.toString().toLowerCase();

type ITransactionType = "All" | "Bridge" | "Swap" | "Transfer";

const typeChange: { [key: string]: string } = {
  approve: "APPROVED",
  bridge: "BRIDGED",
  swap: "SWAPPED",
  in: "RECEIVED",
  out: "SENT",
  fail: "FAIL",
};

function Transaction() {
  const { address, trigger } = useLoginContext();
  const { mergedTokens } = useMergedTokens();
  const [loading, setLoading] = useState<boolean>(true);
  const [backgroundSync, setBackgroundSync] = useState<boolean>(false);
  const [totalPages, setTotalPages] = useLocalStorage<number>(
    "arbt-total-trans",
    1
  );
  const [currentPageNo, setCurrentPageNo] = useState<number>(1);
  const [transactionType, setTransactionType] =
    useState<ITransactionType>("All");
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [transactionList, setTransactionList] = useState<
    ITransactionData[] | null
  >(null);
  // console.log("trna", transactionList)

  const filteredList: ITransactionData[] | undefined = transactionList?.filter(
    (item: any) =>
      transactionType === "All"
        ? true
        : transactionType === "Bridge"
        ? item?.type === "bridge"
        : transactionType === "Swap"
        ? item?.type === "swap"
        : item?.type === "in" || item?.type === "out"
  );

  const axiosRef: any = useRef(null);

  const { ref, inView, entry } = useInView({
    /* Optional options */
    threshold: 0,
  });

  useEffect(() => {
    if (inView && !isLoadingMore) {
      setCurrentPageNo((prev) => prev + 1);
      setIsLoadingMore(true);
    }
  }, [inView]);

  useEffectAsync(async () => {
    try {
      axiosRef.current?.abort();
      const controller = new AbortController();
      axiosRef.current = controller;

      !transactionList ? setLoading(true) : setBackgroundSync(true);
      let { data, pagination }: any = await getUnifiedTransactions({
        address: address as string,
        page: currentPageNo,
        itemsPerPage: 16,
        controller,
      });
      setTotalPages(Math.ceil(pagination?.pages));
      const commonTokenList = [
        ...tokenList,
        ...arbitrumList,
        ...arbitrumList,
        ...extraCoins,
        ...avalancheList,
        ...baseList,
        ...optimismList,
        ...mergedTokens.map((token) => ({
          address: token.address,
          name: token.name,
          shortName: token.symbol,
          logo: token.logo,
          chainId: 1, // Default to Ethereum mainnet
          decimals: 18, // Default decimals
        })),
      ];
      setTransactionList([
        ...(transactionList?.length ? transactionList : []),
        ...data.map((order: any) => {
          if (
            order?.transactionType === "erc20" ||
            order?.transactionType === "native"
          ) {
            const chainObj = tokenSymbolList.find(
              (item) => item.conversionSymbol === order?.chainId?.toLowerCase()
            );
            const swapChainId = chainObj?.chainId;

            // First try to find in merged tokens
            const mergedToken = mergedTokens.find((token) =>
              isAddressEqual(
                token.address,
                order?.token || "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
              )
            );
            console.log("mergeed", mergedTokens, order);

            // If not found in merged tokens, look in commonTokenList
            const fromTokenObj = mergedToken
              ? {
                  address: mergedToken.address,
                  name: mergedToken.name,
                  shortName: mergedToken.symbol,
                  logo: mergedToken.logo,
                  chainId: swapChainId,
                  decimals: 18,
                }
              : commonTokenList.find(
                  (token) =>
                    isAddressEqual(
                      token.address!,
                      order?.token
                        ? order?.token
                        : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                    ) && token.chainId === swapChainId
                );

            const toTokenObj = mergedToken
              ? {
                  address: mergedToken.address,
                  name: mergedToken.name,
                  shortName: mergedToken.symbol,
                  logo: mergedToken.logo,
                  chainId: swapChainId,
                  decimals: 18,
                }
              : commonTokenList.find(
                  (token) =>
                    isAddressEqual(
                      token.address!,
                      order?.token
                        ? order?.token
                        : "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE"
                    ) && token.chainId === swapChainId
                );

            let { value, hash } = order;
            value = ParseWeiUtil(value, fromTokenObj?.decimals!);
            return {
              type: isAddressEqual(order?.toAddress, address!)
                ? "in"
                : order?.value == 0
                ? "approve"
                : "out",
              fromNetwork: chainObj?.code,
              toNetwork: chainObj?.code,
              fromToken: fromTokenObj?.shortName || "N/A",
              toToken: toTokenObj?.shortName || "N/A",
              srcAmount: value || "0.0",
              releaseAmount: "0.0",
              srcToken: order?.token,
              processed: order?.status === "success",
              ago: dayjs(new Date(order?.createdAt))
                .tz("Asia/Kolkata")
                .fromNow(),
              date: dayjs(new Date(order?.createdAt))
                .tz("Asia/Kolkata")
                .format("hh:mm A, DD/MM/YYYY"),
              dateShort: dayjs(new Date(order?.createdAt))
                .tz("Asia/Kolkata")
                .format("MMM D, YYYY"),
              releaseHash: hash,
              imgFromToken: fromTokenObj?.logo as string,
              imgToToken: toTokenObj?.logo as string,
              imgFromNetwork: chainsLogo[swapChainId as number] as string,
              imgToNetwork: chainsLogo[swapChainId as number] as string,
              fromAddress: order?.fromAddress,
              toAddress: order?.toAddress,
            };
          }
          const fromChain = tokenSymbolList.find(
            (item) => item.code === order?.fromNetwork?.toLowerCase()
          )?.chainId;
          const fromTokenObj = commonTokenList.find(
            (token) =>
              token.shortName === order?.fromToken?.toUpperCase() &&
              token.chainId === fromChain
          );
          const toChain = tokenSymbolList.find(
            (item) => item.code === order?.toNetwork?.toLowerCase()
          )?.chainId;
          const toTokenObj = commonTokenList.find(
            (token) =>
              token.shortName === order?.toToken?.toUpperCase() &&
              token.chainId === toChain
          );
          const srcAmount = Number(order.lockAmount);
          const releaseAmount = Number(order.releaseAmount);
          const {
            fromNetwork,
            toNetwork,
            fromToken,
            status,
            hash,
            releaseHash,
          } = order;
          return {
            type: order?.transactionType,
            fromNetwork,
            toNetwork,
            fromToken: fromTokenObj?.shortName || "N/A",
            toToken: toTokenObj?.shortName || "N/A",
            srcAmount: srcAmount ? srcAmount?.toFixed(4) : "0.0",
            releaseAmount: releaseAmount ? releaseAmount?.toFixed(4) : "0.0",
            srcToken: fromToken,
            lockHash: hash,
            processed: status === "success",
            ago: dayjs(new Date(order?.createdAt)).tz("Asia/Kolkata").fromNow(),
            date: dayjs(new Date(order?.createdAt))
              .tz("Asia/Kolkata")
              .format("hh:mm A, DD/MM/YYYY"),
            dateShort: dayjs(new Date(order?.createdAt))
              .tz("Asia/Kolkata")
              .format("MMM D, YYYY"),
            releaseHash: releaseHash,
            imgFromToken: fromTokenObj?.logo as string,
            imgToToken: toTokenObj?.logo as string,
            imgFromNetwork: chainsLogo[fromChain as number] as string,
            imgToNetwork: chainsLogo[toChain as number] as string,
            fromAddress: order?.fromAddress,
            toAddress: order?.toAddress,
          };
        }),
      ]);
      setLoading(false);
      setBackgroundSync(false);

      // Clean up the axios request when the component is unmounted
      return () => {
        controller.abort();
      };
    } catch (error) {
      if ((error as any)?.code === "ERR_CANCELED") {
        console.log("Axios Request Cancelled");
        return;
      }

      setLoading(false);
      //ts-error
      if ((error as any)?.toString().includes("destructure")) return;
      if ((error as any)?.toString().includes("No Transactions found")) return;

      if (error instanceof Error) toastError(error?.message);
      else toastError("Something Went Wrong");
      console.log("transErr ", error);
    } finally {
      // setLoading(false);
      setIsLoadingMore(false);
    }
  }, [currentPageNo]);

  // Get Transaction History from API and merge all transaction to presentable format
  // useTransaction({
  //   address: address as string,
  //   currentPageNo,
  //   transactionList,
  //   setTransactionList,
  //   setTotalPages,
  //   setLoading,
  //   setBackgroundSync
  // });

  console.log("transactions", transactionList);

  let newestFetchedRecord = transactionList?.slice(0, 1)?.[0]?.dateShort;
  let oldestFetchedRecord = transactionList?.slice(-1)?.[0]?.dateShort;

  const onTabSelect = (event: MouseEvent<HTMLButtonElement>) => {
    setTransactionType(
      (event.currentTarget as HTMLButtonElement)?.name as ITransactionType
    );
  };

  if (loading) {
    return (
      <div className="flex gap-2 size-full flex-col items-center justify-center border-t-2 border-prime-zinc-100/50">
        <VscSync className="size-20 text-prime-zinc-100 animate-spin" />
        <span className="font-bold text-lg text-prime-zinc-100">
          Syncing transaction history...
        </span>
      </div>
    );
  }

  if (!loading && !transactionList) {
    return (
      <div className="flex gap-2 size-full flex-col items-center justify-center border-t-2 border-prime-zinc-100/50">
        {/* <ImageNext className="size-14 mb-3" src="/common/Sad.png" alt="sad-emoji" /> */}
        {/* <LiaDizzy className="size-20 text-prime-zinc-100" /> */}
        <LuCalendarX2 className="size-16 text-prime-zinc-100" />
        <span className="font-bold text-lg text-prime-zinc-100">
          No Transaction Found
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full text-white overflow-hidden text-[0.94rem] leading-4 relative">
      {backgroundSync && <LoaderLine />}
      <ol className="flex items-center border-t-2 border-b-2 list-none border-prime-zinc-100/50 text-prime-zinc-100 px-7 py-2 text-sm gap-8">
        <li>
          <button
            name="All"
            className={clsx(
              "transition-all",
              transactionType === "All" && "text-white"
            )}
            onClick={onTabSelect}
          >
            All
          </button>
        </li>
        <li>
          <button
            name="Bridge"
            className={clsx(
              "flex gap-2 items-center",
              transactionType === "Bridge" && "text-white"
            )}
            onClick={onTabSelect}
          >
            <TbArrowsCross className="size-4" /> Bridge
          </button>
        </li>
        {/* <li>
          <button name="Swap" className={clsx("flex gap-2 items-center", transactionType === "Swap" && "text-white")} onClick={onTabSelect}>
            <IoIosSwap strokeWidth={1} className="size-5" />
            Swap
          </button>
        </li> */}
        <li>
          <button
            name="Transfer"
            className={clsx(
              "flex gap-2 items-center",
              transactionType === "Transfer" && "text-white"
            )}
            onClick={onTabSelect}
          >
            <VscArrowSwap
              strokeWidth={0.5}
              className="size-3 rotate-[135deg]"
            />
            Transfer
          </button>
        </li>
        {Boolean(oldestFetchedRecord) &&
          transactionList &&
          transactionList?.length > 10 && (
            <li className="ml-auto cursor-default">
              Fetched Record Range: {newestFetchedRecord || "N/A"} -{" "}
              {oldestFetchedRecord || "N/A"}
            </li>
          )}
      </ol>
      {!filteredList?.length ? (
        <div className="flex gap-2 size-full flex-col items-center justify-center border-t-2 border-prime-zinc-100/50">
          {/* <ImageNext className="size-14 mb-3" src="/common/Sad.png" alt="sad-emoji" /> */}
          {/* <LiaDizzy className="size-20 text-prime-zinc-100" /> */}
          <LuCalendarX2 className="size-16 text-prime-zinc-100" />
          <span className="font-bold text-lg text-prime-zinc-100">
            No Transaction Found
          </span>
        </div>
      ) : (
        <div className="flex w-full h-full overflow-x-auto small-bar">
          <table className="table-auto w-full h-fit text-left">
            {/* <thead>
            <tr className="border-t-2 border-b-2 border-prime-zinc-100/50 text-prime-zinc-100 [&>th:first-child]:pl-8 [&>th:last-child]:pr-8 [&>th]:py-2 [&>th]:px-[0.7rem]">
              <th>Type</th>
              <th>Transfer From</th>
              <th>Transfer To</th>
              <th>Transfer Amount</th>
              <th>Transaction Hash</th>
            </tr>
          </thead> */}
            <tbody>
              {filteredList?.map((item: ITransactionData, index: number) => (
                <tr
                  key={index}
                  ref={index == filteredList?.length - 1 - 1 ? ref : null}
                  className={clsx(
                    "[&>td:first-child]:pl-8 [&>th:last-child]:pr-8 [&>td]:py-3.5 [&>td]:px-3",
                    index === 0 && "[&>td]:pt-5"
                  )}
                >
                  <td>
                    <div
                      className={clsx(
                        "text-center text-xs flex flex-row items-center justify-start gap-3"
                      )}
                    >
                      {item?.type === "approve" && (
                        <FiUserCheck className="size-8" />
                      )}
                      {item?.type === "bridge" && (
                        <TbArrowsCross className="size-8" />
                      )}
                      {item?.type === "swap" && (
                        <VscArrowSwap className="size-8" />
                      )}
                      {item?.type === "in" && (
                        <MdCallReceived className="size-8" />
                      )}
                      {item?.type === "out" && (
                        <MdCallMade className="size-8" />
                      )}
                      {item?.type === "fail" && (
                        <IoBanOutline className="size-8" />
                      )}
                      {/* <div className="flex flex-col items-start justify-start">
                        <span className="uppercase text-sm font-bold">{item?.type}</span>
                        <div className="flex items-center gap-2 flex-row text-nowrap">
                          <div className="text-[11px]">{item?.ago}</div>
                          <InfoTooltip tooltip={item?.date} />
                        </div>
                      </div> */}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1.5">
                      <div className="font-bold text-nowrap flex items-center gap-1">
                        {item?.type === "in" ? (
                          formatAddress(item?.fromAddress)
                        ) : item?.type === "out" ||
                          item?.type === "approve" ||
                          item?.type === "fail" ? (
                          formatAddress(item?.toAddress)
                        ) : (
                          <>
                            <ImageNext
                              src={item.imgFromToken}
                              className="size-8 z-10 border border-gray-800 rounded-full"
                              alt="token-logo"
                              fullRadius
                            />
                            {(item?.type === "swap" ||
                              item?.type === "bridge" ||
                              item?.type === "fail") && (
                              <ImageNext
                                src={item.imgToToken}
                                className="size-8 -translate-x-2 border border-gray-800 rounded-full"
                                alt="token-logo"
                                fullRadius
                              />
                            )}
                            <div className="text-nowrap">
                              {item?.fromToken?.toUpperCase()} /{" "}
                              {item?.type === "fail"
                                ? formatAddress(item?.toAddress)
                                : item?.toToken?.toUpperCase()}
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <span className="uppercase text-sm font-bold">
                          {typeChange[item?.type]}
                        </span>{" "}
                        on {item?.dateShort}
                        <InfoTooltip tooltip={item?.date} />
                      </div>
                      {/* <div className="text-sm flex flex-row space-x-2 justify-start items-center">
                          <ImageNext className="size-4 rounded-full" src={item.imgFromNetwork} alt="network-logo" />
                          <span className="text-center text-nowrap">
                            {tokenSymbolList.find((i) => i.code === item?.fromNetwork?.toLowerCase())?.fullName}
                          </span>
                        </div> */}
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col gap-1.5">
                      <div>
                        {item?.type === "in" ||
                        item?.type === "out" ||
                        item?.type === "fail" ||
                        item?.type === "approve" ? (
                          <div className="flex gap-1 items-center">
                            {item?.srcAmount}
                            <ImageNext
                              src={item.imgFromToken}
                              className="size-4 ml-2 z-10 border border-gray-800 rounded-full"
                              alt="token-logo"
                              fullRadius
                            />
                            {item?.type === "in"
                              ? item?.toToken?.toUpperCase()
                              : item?.type === "out" ||
                                item?.type === "approve" ||
                                item?.type === "fail"
                              ? item?.fromToken?.toUpperCase()
                              : null}
                          </div>
                        ) : (
                          <div className="flex flex-row gap-2.5">
                            <div className="flex text-nowrap">
                              <ImageNext
                                src={item.imgFromToken}
                                className="size-4 mr-1.5"
                                alt="token-logo"
                                fullRadius
                              />
                              {item?.srcAmount}
                            </div>{" "}
                            /{" "}
                            <div className="flex text-nowrap">
                              <ImageNext
                                src={item.imgToToken}
                                className="size-4 mr-1.5"
                                alt="token-logo"
                                fullRadius
                              />
                              {item?.type === "swap"
                                ? item?.swapAmount
                                : item?.releaseAmount}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-sm flex flex-row space-x-2 justify-start items-center">
                        <ImageNext
                          className="size-4 rounded-full"
                          src={item.imgFromNetwork}
                          alt="network-logo"
                        />
                        <span className="text-center text-nowrap">
                          {
                            tokenSymbolList.find(
                              (i) => i.code === item?.fromNetwork?.toLowerCase()
                            )?.fullName
                          }
                        </span>
                        &nbsp;{" "}
                        {(item?.type === "bridge" || item?.type === "fail") && (
                          <>
                            {" "}
                            /{" "}
                            <ImageNext
                              className="size-4 rounded-full"
                              src={item.imgToNetwork}
                              alt="network-logo"
                            />
                            <span className="text-center text-nowrap">
                              {
                                tokenSymbolList.find(
                                  (i) =>
                                    i.code === item?.toNetwork?.toLowerCase()
                                )?.fullName
                              }
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* <td>
                  <div className="flex items-center gap-2 flex-row text-nowrap">
                    <InfoTooltip tooltip={item?.date} />
                    <div className="text-sm">{item?.ago}</div>
                  </div>
                </td> */}
                  <td>
                    <div className="flex flex-col gap-1.5">
                      {item?.lockHash && (
                        <div className="flex items-center gap-2 flex-row">
                          {formatAddress(item?.lockHash)}
                          <CopyTooltip
                            onClick={() => {
                              navigator.clipboard.writeText(item?.lockHash),
                                toastSuccess("Lock Hash Copied");
                            }}
                          />
                        </div>
                      )}
                      {item?.processed ? (
                        <div className="flex flex-row gap-2">
                          {formatAddress(
                            item?.type === "swap"
                              ? item?.hash
                              : item?.releaseHash
                          )}
                          <CopyTooltip
                            onClick={() => {
                              navigator.clipboard.writeText(
                                item?.type === "swap"
                                  ? item?.hash!
                                  : item?.releaseHash!
                              ),
                                toastSuccess("Transaction Hash Copied");
                            }}
                          />
                        </div>
                      ) : (
                        "Not Processed"
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoadingMore && (
            <div className="absolute bottom-3 bg-zinc-700 border border-white/10 px-6 rounded-lg pt-2 pb-2 w-fit left-[50%] translate-x-[-50%] flex gap-2 items-center justify-center text-xs z-50">
              <div className="size-4 min-w-4 border-2 rounded-full border-l-zinc-200 border-zinc-600 object-contain animate-spin-fast" />
              Loading more...
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      <div className="px-4 py-3 border-t-2 border-prime-zinc-100/50 mt-auto flex items-center justify-center">
        {/* <Pagination
          setCurrentPageNo={setCurrentPageNo}
          currentPageNo={currentPageNo}
          totalPages={totalPages as number}
          onNext={() => setLoading(true)}
          onPrev={() => setLoading(true)}
        />
        {loading && <div>Loading more...</div>} */}
      </div>
    </div>
  );
}

export default Transaction;
