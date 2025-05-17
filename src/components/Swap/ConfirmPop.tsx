/* eslint-disable @next/next/no-img-element */
import { useFiatContext } from "../../context/FiatContext";
import {
  isContractSymbiosisFlow,
  isSymbiosisFlow,
  useSwapContext,
} from "../../context/SwapContext";
import { Dispatch, SetStateAction } from "react";
import { FaArrowRight } from "react-icons/fa6";

function ConfirmPop({
  setIsConfirmPop,
}: {
  setIsConfirmPop: Dispatch<SetStateAction<boolean>>;
}) {
  const {
    selectedCoin,
    selectedNetwork,
    fromAmount,
    toAmount,
    selectedToCoin,
    selectedToNetwork,
    isApproved,
    approveAmount,
    continueTransaction,
    isFiatBridge,
    isConvert,
    isSwapped,
    isTokenRelease,
    setIsFinalStep,
    resetSwapStates,
  } = useSwapContext();
  const { transakStatus, resetFiatStates } = useFiatContext();
  const isSameChain = selectedNetwork?.id === selectedToNetwork?.id;

  return (
    <div className="size-full flex flex-col z-10 px-5 gap-3 py-5">
      <div className="w-[100%] px-[5%] pt-2 pb-4 flex flex-row items-center justify-evenly rounded text-white">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <img
              src={selectedCoin?.logo}
              alt="coin-logo"
              className="w-7 h-7 object-contain rounded-full"
            />
            <div className="flex flex-col">
              <p className="text-sm leading-none">{selectedCoin?.shortName}</p>
              <caption className="text-[0.625rem]">
                {selectedNetwork?.name}
              </caption>
            </div>
          </div>
          <p className="text-sm text-center">
            {fromAmount} {selectedCoin?.shortName}
          </p>
        </div>
        <FaArrowRight />
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <img
              src={selectedToCoin?.logo}
              alt="coin-logo"
              className="w-7 h-7 object-contain rounded-full"
            />
            <div className="flex flex-col">
              <p className="text-sm leading-none">
                {selectedToCoin?.shortName}
              </p>
              <caption className="text-[0.625rem]">
                {selectedToNetwork?.name}
              </caption>
            </div>
          </div>
          <p className="text-sm text-center">
            {toAmount} {selectedToCoin?.shortName}
          </p>
        </div>
      </div>
      <div className="relative w-full flex items-center justify-between gap-x-2 text-sm">
        <div className="opacity-60">Type</div>
        <div className="">
          {selectedNetwork?.name != selectedToNetwork?.name
            ? "Cross-Chain Swap"
            : "On-Chain Swap"}
        </div>
      </div>
      {selectedNetwork?.name == selectedToNetwork?.name ||
        (false && (
          <div className="relative w-full flex items-center justify-between gap-x-2 text-sm">
            <div className="opacity-60">Rate</div>
            <div className="">
              1 {selectedCoin?.shortName} = {Number(3002).toFixed(4)}{" "}
              {selectedToCoin?.shortName}
            </div>
          </div>
        ))}
      <div className="relative w-full flex items-center justify-between gap-x-2 text-sm">
        <div className="opacity-60">Transaction Fees</div>
        <div className="">
          {((0.5 / 100) * Number(fromAmount)).toFixed(
            Number((0.5 / 100) * Number(fromAmount)) > 0.0001 ? 4 : 6
          )}{" "}
          {selectedCoin?.shortName}
        </div>
      </div>
      <div className="relative w-full flex items-center justify-between gap-x-2 text-sm">
        <div className="opacity-60">Estimated Time</div>
        <div className="">
          {selectedNetwork?.name != selectedToNetwork?.name
            ? isSymbiosisFlow || isContractSymbiosisFlow
              ? "~ 5-15 mins"
              : "~ 4-5 mins"
            : "~ 2-3 mins"}
        </div>
      </div>
      <div className="w-full mt-4 flex gap-3 items-center justify-center">
        {isConvert &&
        (transakStatus === "processing" ||
          !isApproved ||
          !isSwapped ||
          (!isSameChain && !isTokenRelease)) ? (
          <button
            onClick={() => {
              setIsFinalStep(false);
              resetFiatStates();
              resetSwapStates();
              setIsConfirmPop(false);
            }}
            className="w-full h-10 disabled:bg-prime-gray-200 bg-prime-blue-100 items-center justify-center text-center rounded-lg text-sm"
          >
            Swap Again
          </button>
        ) : (
          <>
            {!isApproved && (
              <button
                onClick={() => approveAmount()}
                className="w-full h-10 disabled:bg-prime-gray-200 bg-prime-blue-100 items-center justify-center text-center rounded-lg text-sm"
              >
                Approve
              </button>
            )}
            <button
              onClick={() => continueTransaction()}
              disabled={!isApproved}
              className={`w-full h-10 disabled:bg-prime-gray-200 bg-prime-blue-100 items-center justify-center text-center rounded-lg text-sm ${
                !!isApproved ? "animate-blinker" : ""
              }`}
            >
              Swap
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ConfirmPop;
