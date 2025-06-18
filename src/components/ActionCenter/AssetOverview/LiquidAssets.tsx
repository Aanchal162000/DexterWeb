import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import ImageNext from "../../common/ImageNext";
import { formatPrecision } from "@/utils/helper";
import { VscSync } from "react-icons/vsc";
import { TbMoodSadDizzy } from "react-icons/tb";
import { IAssetsData, ILiquidData, IResponseAssets } from "@/utils/interface";
import LoaderLine from "../../common/LoaderLine";
import { getAssets } from "@/services/userService";
import { useLoginContext } from "@/context/LoginContext";
import { chainsLogo, tokenSymbolList } from "@/constants/config";
import { toastError } from "@/utils/toast";

const LiquidAssets = ({
  setBalance,
  isAmountMasked,
}: {
  setBalance: Dispatch<SetStateAction<number>>;
  isAmountMasked: boolean;
}) => {
  const [dataList, setDataList] = useState<ILiquidData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [backgroundSync, setBackgroundSync] = useState<boolean>(false);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const { address } = useLoginContext();

  // Filter assets that end with "Virtuals"
  const filteredDataList = dataList?.filter(
    (item) => item.tokenName?.endsWith("by Virtuals") || item.token == "VIRTUAL"
  );

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const assets = await getAssets({
        address: address as string,
      });

      const formattedAssets = assets
        .filter(
          (data: IResponseAssets) =>
            Number(Number(data.balanceFormatted)?.toFixed(4)) > 0
        )
        .map((data: IResponseAssets) => {
          let chain = tokenSymbolList?.find(
            (item) => item.code === data?.chainSymbol
          )?.chainId as number;

          return {
            tokenAmount: data.balanceFormatted,
            usdAmount: Number(data.usdValue) ? Number(data.usdValue) : 0,
            perUsd: Number(data?.usdPrice) ? Number(data?.usdPrice) : 0,
            difference: Number(data?.usdPrice24hrUsdChange)?.toFixed(4) ?? 0,
            percentageDifference:
              Number(data?.usdPrice24hrPercentChange)?.toFixed(4) ?? 0,
            network: data?.chainName,
            token: data?.symbol, // Using the full name instead of symbol
            tokenName: data?.name,
            imgToken: data?.logo,
            imgNetwork: chainsLogo[chain] as string,
          };
        });

      setDataList(formattedAssets);
    } catch (error) {
      console.error("Error fetching assets:", error);
      toastError("Failed to fetch assets");
    } finally {
      setLoading(false);
      setBackgroundSync(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchAssets();
    }
  }, [address]);

  useEffect(() => {
    let balance = filteredDataList?.reduce(
      (prev, curr) => prev + (Number(curr.usdAmount) ?? 0),
      0
    ) as number;
    setBalance(balance);
  }, [filteredDataList, setBalance]);

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

  const handleManualSync = async () => {
    try {
      setLoading(true);
      setBackgroundSync(true);
      await fetchAssets();
    } catch (error) {
      console.error(error);
      setLoading(false);
      setBackgroundSync(false);
    }
  };

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

  if (!loading && !filteredDataList?.length) {
    return (
      <div className="flex gap-2 size-full flex-col items-center justify-center border-t-2 border-prime-zinc-100/50">
        <TbMoodSadDizzy className="size-20 text-prime-zinc-100" />
        <span className="font-bold text-lg text-prime-zinc-100">
          No Virtual Assets Found
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
            {filteredDataList?.map((item: IAssetsData, index: number) => (
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
                      <div className="font-bold text-nowrap">{item?.token}</div>
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
                    : `$ ${formatPrecision(Number(item?.perUsd) || 0)}`}
                </td>
                <td>
                  <div
                    className={`${
                      Number(item.difference) === 0
                        ? "text-prime-zinc-100"
                        : !item?.difference?.toString().includes("-")
                        ? "text-prime-green"
                        : "text-prime-red"
                    }`}
                  >
                    {(!item.difference?.toString().includes("-") ? "+" : "-") +
                      formatPrecision(
                        Number(
                          item.percentageDifference.toString().replace("-", "")
                        )
                      ) +
                      "% " +
                      "(" +
                      formatPrecision(
                        Number(item.difference.toString().replace("-", ""))
                      ).toString() +
                      ")"}
                  </div>
                </td>
                <td>
                  {isAmountMasked
                    ? "XXXXXX"
                    : `$ ${formatPrecision(Number(item.usdAmount) || 0)}`}
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

export default LiquidAssets;
