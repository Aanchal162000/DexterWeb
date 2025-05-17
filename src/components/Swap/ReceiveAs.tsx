/* eslint-disable @next/next/no-img-element */
import { HiMiniArrowDownTray } from "react-icons/hi2";
import ImageNext from "../common/ImageNext";
import { Dispatch, SetStateAction } from "react";
import { useSwapContext } from "../../context/SwapContext";
import DotLoader from "../common/DotLoader";
import { addCommas } from "@/utils/helper";
import { TiArrowSortedDown } from "react-icons/ti";

function ReceiveAs({
  setIsToCoinOpen,
}: {
  setIsToCoinOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    toAmount,
    selectedToCoin,
    selectedToNetwork,
    isTypingLoading,
    isFiatBridge,
    usdPriceS2,
    fromAmount,
    transFee,
    fromToken2Bal,
    isBalanceLoading,
    selectedNetwork,
  } = useSwapContext();

  // console.log("isFiiat", isFiatBridge, selectedNetwork?.name == "Fiat" );

  const convertedAmount: string | JSX.Element =
    isTypingLoading || isNaN(Number(toAmount)) ? (
      <DotLoader />
    ) : (
      addCommas(Number(toAmount.toFixed(6)))
    );

  return (
    <>
      <div className="flex flex-col items-center border border-primary-100 px-5 py-3.5 rounded-lg mt-2 gap-2.5">
        <div className="flex w-full items-center  text-prime-zinc-50  justify-between">
          <p className="text-zinc-400 text-sm flex gap-3 items-center justify-center">
            To{" "}
            {Boolean(selectedToNetwork) && (
              <div className="flex gap-1">
                <img
                  src={selectedToNetwork?.image}
                  alt="network icon"
                  className="w-4 h-4 object-contain rounded-full"
                />
                <span className="text-white !leading-tight text-nowrap">
                  {selectedToNetwork?.name}
                </span>
              </div>
            )}
          </p>
          {!isTypingLoading &&
            Boolean(toAmount) &&
            selectedToCoin &&
            Boolean(transFee) &&
            !isFiatBridge && (
              <div className="flex gap-x-2 flex-row justify-center items-center -mr-1">
                <div className="text-white text-xs">$&nbsp;{transFee}</div>
                <div className=" items-center justify-center flex">
                  <button
                    disabled
                    className="text-white text-xs font-bold  flex items-center justify-center bg-white/20 px-1"
                  >
                    Fees
                  </button>
                </div>
              </div>
            )}
        </div>
        <div className="w-full flex justify-between items-center">
          <button
            className={`flex flex-row w-full py-1 justify-start items-center cursor-pointer`}
            onClick={() => setIsToCoinOpen(true)}
          >
            {selectedToCoin?.logo && (
              <ImageNext
                src={selectedToCoin?.logo!}
                className="size-9 rounded-full bg-white overflow-hidden"
                alt="coin-logo"
                fullRadius
              />
            )}
            <div
              className={`flex flex-col ${selectedToCoin ? "ml-2" : ""} mr-1`}
            >
              <span className="text-base text-nowrap text-white font-bold !leading-tight">
                {selectedToCoin?.shortName || "Select Token"}
              </span>
            </div>
            <TiArrowSortedDown className="text-prime-token-200 size-5" />
          </button>
          <span className="text-base sm:font-bold text-white sm:text-lg">
            {convertedAmount}
          </span>
        </div>
        <div className="w-full flex flex-row flex-nowrap justify-between items-center text-white">
          {isBalanceLoading ? (
            <div className="flex flex-row gap-x-1 w-32 animate-blinker h-2 my-1 bg-white/20 rounded-lg text-xs text-zinc-300"></div>
          ) : selectedToCoin && selectedToNetwork?.name != "Fiat" ? (
            <div className="flex flex-row gap-x-1 w-full text-xs text-zinc-300">
              Available
              <span className="">{Number(fromToken2Bal).toFixed(6) || 0}</span>
              {selectedToCoin?.shortName}
            </div>
          ) : (
            <div className="h-4"></div>
          )}
          {Boolean(fromAmount) &&
            Boolean(toAmount) &&
            selectedToCoin &&
            !isFiatBridge &&
            Boolean(usdPriceS2) && (
              <div className="text-xs whitespace-nowrap ml-auto">
                ~ $ {usdPriceS2.toFixed(2)}
              </div>
            )}
        </div>
      </div>
    </>
  );
}

export default ReceiveAs;
