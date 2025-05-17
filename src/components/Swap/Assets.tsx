import { MdKeyboardArrowLeft, MdKeyboardArrowRight } from "react-icons/md";
import ImageNext from "../common/ImageNext";

import {
  Dispatch,
  SetStateAction,
  use,
  useEffect,
  useRef,
  useState,
} from "react";
import clsx from "clsx";
import useEffectAsync from "@/hooks/useEffectAsync";
import { toastError, toastInfo } from "@/utils/toast";
import { useLoginContext } from "../../context/LoginContext";
import {
  arbitrumList,
  chainsLogo,
  coinDbConfig,
  extraCoins,
  tokenList,
  tokenSymbolList,
} from "@/constants/config";
import { VscSync } from "react-icons/vsc";
import { getCoinChange, runSyncWorker } from "@/services/apiCached";
import { TbMoodSadDizzy } from "react-icons/tb";
import { getAssets } from "@/services/userService";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  IAssetsData,
  IResponseAssets,
  IResponseCoinDiff,
} from "@/utils/interface";
import LoaderLine from "../common/LoaderLine";
import { formatPrecision } from "@/utils/helper";

const Assets = ({
  setBalance,
  isAmountMasked,
}: {
  setBalance: Dispatch<SetStateAction<number>>;
  isAmountMasked: boolean;
}) => {
  const [dataList, setDataList] = useLocalStorage<IAssetsData[]>("arbt-assets");
  const { address, trigger: triggerMain } = useLoginContext();
  const [loading, setLoading] = useState<boolean>(false);
  const [backgroundSync, setBackgroundSync] = useState<boolean>(false);
  const totalPages = Math.ceil(dataList?.length! / 8);
  const [currentPageNo, setCurrentPageNo] = useState<number>(1);
  const [trigger, setTrigger] = useState<number>(0);

  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let balance = dataList?.reduce(
      (prev, curr) => prev + (Number(curr.usdAmount) ?? 0),
      0
    ) as number;
    setBalance(balance);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataList]);

  useEffectAsync(async () => {
    try {
      !dataList ? setLoading(true) : setBackgroundSync(true);
      // const commonTokenList = [...tokenList, ...arbitrumList, ...extraCoins];
      // const coinChange: IResponseCoinDiff[] = await getCoinChange();
      const assets: IResponseAssets[] = await getAssets({
        address: address as string,
      });
      setDataList(
        assets.map((data: IResponseAssets) => {
          let chain = tokenSymbolList?.find(
            (item) => item.code === data?.chainSymbol
          )?.chainId as number;

          return {
            tokenAmount: data.balanceFormatted,
            usdAmount: Number(data.usdValue)
              ? Number(data.usdValue)?.toFixed(4)
              : 0,
            perUsd: Number(data?.usdPrice)
              ? Number(data?.usdPrice)?.toFixed(4)
              : 0,
            difference: Number(data?.usdPrice24hrUsdChange)?.toFixed(4) ?? 0,
            percentageDifference:
              Number(data?.usdPrice24hrPercentChange)?.toFixed(4) ?? 0,
            network: data?.chainName,
            token: data?.symbol,
            imgToken: data?.logo,
            imgNetwork: chainsLogo[chain] as string,
          };
        }) as IAssetsData[]
      );
    } catch (error) {
      toastError("Something Went Wrong");
    } finally {
      setLoading(false);
      setBackgroundSync(false);
    }
  }, [trigger, triggerMain]);

  // console.log(dataList);

  const handleManualSync = async () => {
    try {
      setLoading(true);
      const res = await runSyncWorker(address as string);
      console.log("dd", res);
      setTrigger((prev) => prev + 1);
    } catch (error) {
      toastError("Sync Error");
      setLoading(false);
      console.error(error);
    }
  };

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

  if (loading) {
    return (
      <div className="flex gap-2 size-full flex-col items-center justify-center border-t-2 border-prime-zinc-100/50">
        <VscSync className="size-20 text-prime-zinc-100 animate-spin" />
        <span className="font-bold text-lg text-prime-zinc-100">
          Syncing wallet assets...
        </span>
      </div>
    );
  }

  if (!loading && !dataList) {
    return (
      <div className="flex gap-2 size-full flex-col items-center justify-center border-t-2 border-prime-zinc-100/50">
        <TbMoodSadDizzy className="size-20 text-prime-zinc-100" />
        <span className="font-bold text-lg text-prime-zinc-100">
          No Asset Found
        </span>
        <span className="font-bold text-lg text-prime-zinc-100">
          Sync manually ?{" "}
          <button
            className="underline hover:font-semibold"
            onClick={handleManualSync}
          >
            Click here
          </button>
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
              {new Array(5).fill(0).map((_, index) => (
                <th key={index} className="h-[1px] p-0 bg-[#26fcfc]/70"></th>
              ))}
            </tr>
            <tr
              className={clsx(
                " text-prime-zinc-100  text-sm [&>th:first-child]:pl-8 [&>th:last-child]:pr-8 [&>th]:py-2 [&>th]:px-[0.7rem]"
              )}
            >
              <th>Holdings</th>
              <th>Balance</th>
              <th>Price (USD)</th>
              <th>Change</th>
              <th>Value (USD)</th>
            </tr>
            <tr>
              {new Array(5).fill(0).map((_, index) => (
                <th key={index} className="h-[1px] p-0 bg-[#26fcfc]/70"></th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataList?.map((item: any, index: number) => (
              <tr
                key={index}
                className={clsx(
                  "[&>td:first-child]:pl-8 [&>th:last-child]:pr-8 [&>td]:py-3 [&>td]:px-3",
                  index === 0 && "[&>td]:pt-5",
                  index % 2 != 0 && "bg-[#818284]/10"
                )}
              >
                <td>
                  <div className="flex flex-row gap-2">
                    <ImageNext
                      src={item.imgToken}
                      className="size-10 rounded-full"
                      alt="token-logo"
                      fullRadius
                    />
                    <div className="flex flex-col gap-1.5">
                      <div className="font-bold text-nowrap">
                        {item?.token?.toUpperCase()}
                      </div>
                      <div className="text-sm flex flex-row space-x-2 justify-center items-center">
                        <ImageNext
                          className="size-4 rounded-full"
                          src={item.imgNetwork}
                          alt="network-logo"
                        />
                        <span className="text-center text-nowrap">
                          {item?.network}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  {isAmountMasked
                    ? "XXXXXX"
                    : formatPrecision(item.tokenAmount)}
                </td>
                <td>
                  {isAmountMasked
                    ? "XXXXXX"
                    : `$ ${formatPrecision(
                        item?.perUsd ? item?.perUsd : "0.00"
                      )}`}
                </td>
                <td>
                  <div
                    className={`${
                      item.difference === 0
                        ? "text-prime-zinc-100"
                        : !item?.difference?.toString().includes("-")
                        ? "text-prime-green"
                        : "text-prime-red"
                    }`}
                  >
                    {formatPrecision(
                      item.difference.toString().replace("-", "")
                    ) +
                      " (" +
                      (!item.difference?.toString().includes("-") ? "+" : "-") +
                      formatPrecision(
                        item.percentageDifference.toString().replace("-", "")
                      ) +
                      "%)"}
                  </div>
                </td>
                <td>
                  {isAmountMasked
                    ? "XXXXXX"
                    : `$ ${formatPrecision(item.usdAmount ?? 0)}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="relative w-full px-4 !!py-3 py-2 border-t border-primary-100/70 mt-auto flex items-center justify-center">
        {/* <Pagination setCurrentPageNo={setCurrentPageNo} currentPageNo={currentPageNo} totalPages={totalPages} /> */}
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
                onClick={handleManualSync}
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

export default Assets;
