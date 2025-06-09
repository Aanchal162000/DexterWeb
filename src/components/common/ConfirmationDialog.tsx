/* eslint-disable @next/next/no-img-element */
import TRXService from "@/services/transaction";
import { useFiatContext } from "../../context/FiatContext";
import {
  isContractSymbiosisFlow,
  isSymbiosisFlow,
  useSwapContext,
} from "../../context/SwapContext";
import { FaArrowRight } from "react-icons/fa6";
import { toast } from "react-toastify";
import { ConfirmationDialogProps } from "./interfaces";
import { useLoginContext } from "@/context/LoginContext";
import { useState } from "react";

function ConfirmationDialog({
  setIsConfirmPop,
  selectedCoin,
  fromAmount,
  selectedToCoin,
  selectedToNetwork,
  selectedNetwork,
  isConvert,
  isApproved,
  isSwapped,
  isTokenRelease,
  setIsFinalStep,
  resetSwapStates,
  walletAddress,
  signer,
  setIsApproved,
  continueTransaction,
  toAmount,
  approvalHash,
  setApprovalHash,
  swapHash,
  setSwapHash,
}: ConfirmationDialogProps) {
  const { networkData } = useLoginContext();
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    if (!selectedCoin || !walletAddress || !selectedNetwork.id || !signer)
      return;

    try {
      setIsApproving(true);
      const trxService = TRXService.getInstance();
      console.log("fromAmount", fromAmount);

      // Convert to wei without scientific notation
      const amountInWei = BigInt(
        Math.floor((Number(fromAmount) + 0.001 * Number(fromAmount)) * 10 ** 18)
      ).toString();

      const result = await trxService.approveTransaction(
        selectedNetwork?.id.toString(),
        amountInWei,
        selectedCoin.contractAddress!,
        networkData?.provider.getSigner()!,
        walletAddress
      );

      if (result) {
        setApprovalHash(result.transactionHash);
        setIsApproved(true);
        toast.success("Token approved successfully!");
      } else {
        setIsApproved(false);
        throw new Error("Approval failed");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to approve token");
    } finally {
      setIsApproving(false);
    }
  };
  return (
    <div className="size-full flex flex-col z-10 px-5 gap-3 py-5">
      <div className="w-[100%] px-[5%] pt-2 pb-4 flex flex-row items-center justify-evenly rounded text-white">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <img
              src={selectedCoin?.image.url}
              alt="coin-logo"
              className="w-7 h-7 object-contain rounded-full"
            />
            <div className="flex flex-col">
              <p className="text-sm leading-none">{selectedCoin?.symbol}</p>
              <caption className="text-[0.625rem]">
                {selectedNetwork?.name}
              </caption>
            </div>
          </div>
          <p className="text-sm text-center">
            {fromAmount} {selectedCoin?.symbol}
          </p>
        </div>
        <FaArrowRight />
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <img
              src={selectedToCoin?.image.url}
              alt="coin-logo"
              className="w-7 h-7 object-contain rounded-full"
            />
            <div className="flex flex-col">
              <p className="text-sm leading-none">{selectedToCoin?.symbol}</p>
              <caption className="text-[0.625rem]">
                {selectedToNetwork?.name}
              </caption>
            </div>
          </div>
          <p className="text-sm text-center">
            {toAmount} {selectedToCoin?.symbol}
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
              1 {selectedCoin?.symbol} = {Number(3002).toFixed(4)}{" "}
              {selectedToCoin?.symbol}
            </div>
          </div>
        ))}
      <div className="relative w-full flex items-center justify-between gap-x-2 text-sm">
        <div className="opacity-60">Transaction Fees</div>
        <div className="">
          {((0.5 / 100) * Number(fromAmount)).toFixed(
            Number((0.5 / 100) * Number(fromAmount)) > 0.0001 ? 4 : 6
          )}{" "}
          {selectedCoin?.symbol}
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
        {isConvert && (!isApproved || !isSwapped || !isTokenRelease) ? (
          <button
            onClick={() => {
              setIsFinalStep(false);

              resetSwapStates();
              setIsConfirmPop(false);
            }}
            className="w-full h-10 disabled:bg-prime-gray-200 bg-prime-blue-100 items-center justify-center text-center rounded-lg text-sm"
          >
            Swap Again
          </button>
        ) : (
          <>
            <button
              onClick={() => handleApprove()}
              disabled={isApproving || isApproved}
              className={`w-full h-10 disabled:bg-prime-gray-200 ${
                !(isApproving || isApproved) ? "animate-blinker" : ""
              } bg-prime-blue-100 items-center justify-center text-center rounded-lg text-sm relative`}
            >
              {isApproving ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Approving...</span>
                </div>
              ) : (
                "Approve"
              )}
            </button>

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

export default ConfirmationDialog;
