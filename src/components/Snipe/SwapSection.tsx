import React, { useEffect, useRef, useState } from "react";
import { IVirtual } from "@/utils/interface";
import { LuArrowUpDown } from "react-icons/lu";
import { TiArrowSortedDown } from "react-icons/ti";
import ImageNext from "../common/ImageNext";
import { IoInformationCircle } from "react-icons/io5";
import clsx from "clsx";
import useEffectAsync from "@/hooks/useEffectAsync";
import { useDebounce } from "use-debounce";
import { useLoginContext } from "@/context/LoginContext";
import { ethers } from "ethers";
import { BuyContract, SnipeContract } from "@/constants/config";
import snipeAbi from "@/constants/abis/snipe.json";
import { useAlchemyProvider } from "@/hooks/useAlchemyProvider";
import { QuoteRequestParams } from "@/services/contract/interfaces";
import { agentService } from "@/services/contract/agentService";
import { toastError } from "@/utils/toast";

interface SwapSectionProps {
  selectedVirtual: IVirtual | null;
  selectedToVirtual: IVirtual | null;
  fromAmount: number;
  toAmount: number;
  setIsFromCoinOpen: (isOpen: boolean) => void;
  setIsToCoinOpen: (isOpen: boolean) => void;
  setFromAmount: (amount: number) => void;
  setToAmount: (amount: number) => void;
  swapFields: () => void;
  buttonText: string;
  setIsConfirmPop: (isOpen: boolean) => void;
  isBalanceLoading: boolean;
}

const SwapSection: React.FC<SwapSectionProps> = ({
  selectedVirtual,
  selectedToVirtual,
  fromAmount,
  toAmount,
  setIsFromCoinOpen,
  setIsToCoinOpen,
  setFromAmount,
  setToAmount,
  swapFields,
  buttonText,
  setIsConfirmPop,
  isBalanceLoading,
}) => {
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isEstimating, setIsEstimating] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [debouncedFromAmount] = useDebounce(fromAmount, 1000);
  const { address, networkData, switchNetwork } = useLoginContext();

  // Add network check effect
  useEffect(() => {
    const checkAndSwitchNetwork = async () => {
      if (networkData?.chainId !== 8453) {
        // Base chain ID
        try {
          await switchNetwork(8453);
        } catch (error) {
          console.error("Failed to switch network:", error);
          toastError("Please switch to Base network to continue");
        }
      }
    };

    if (address) {
      checkAndSwitchNetwork();
    }
  }, [
    address,
    networkData?.chainId,
    switchNetwork,
    fromAmount,
    selectedVirtual,
  ]);

  const handleFocus = (ref: React.RefObject<HTMLInputElement>) => {
    const input = ref.current;
    if (input) {
      const length = input.value.length;
      input.setSelectionRange(length, length);
    }
  };
  useEffectAsync(async () => {
    if (
      debouncedFromAmount &&
      selectedVirtual?.contractAddress &&
      selectedToVirtual?.contractAddress
    ) {
      setIsEstimating(true);
      try {
        if (
          !address ||
          !debouncedFromAmount ||
          !selectedVirtual.contractAddress ||
          !selectedToVirtual.contractAddress
        ) {
          setToAmount(0);
          return;
        }

        const fetchQuote = async () => {
          const params: QuoteRequestParams = {
            chainId: 8453, // Base chain
            toChainId: 8453,
            fromTokenAddress: selectedVirtual.contractAddress!,
            toTokenAddress: selectedToVirtual.contractAddress!,
            amount: debouncedFromAmount.toString(),
            userWalletAddress: address,
            slippage: 0.1,
            slippageType: 1,
            pmm: 1,
            gasDropType: 0,
            forbiddenBridgeTypes: 0,
            dexIds: "34,29", // Example DEX IDs
          };

          const estimate = await agentService.getQuote(params);
          console.log("estimate final", estimate);
          setToAmount(Number((estimate - 0.03).toFixed(4)));
        };

        fetchQuote();
      } catch (error: any) {
        console.error("Estimation failed:", error);
        setToAmount(0);
      } finally {
        setIsEstimating(false);
      }
    } else {
      setToAmount(0);
      setIsEstimating(false);
    }
  }, [
    debouncedFromAmount,
    selectedVirtual?.contractAddress,
    selectedToVirtual?.contractAddress,
  ]);

  const handlePercentCost = (value: number) => {
    if (value === 1) {
      let newValue = (value * (100 - 0.5)) / 100;
      setFromAmount(
        Number(
          Number(newValue * Number(selectedVirtual?.userBalance || 0)).toFixed(
            5
          )
        )
      );
    } else {
      setFromAmount(
        Number(
          Number(value * Number(selectedVirtual?.userBalance || 0)).toFixed(5)
        )
      );
    }
  };

  return (
    <div className="px-8">
      {/* From Section */}
      <div
        className="border border-primary-100 rounded-lg py-3 px-4 mb-2 flex flex-col items-center gap-3"
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex w-full items-center text-prime-zinc-50 justify-between">
          <div className="text-zinc-400 text-sm flex gap-3 items-center justify-center">
            From{" "}
            <div className="flex gap-1">
              <img
                src="/Networks/Base.png"
                alt="base icon"
                className="w-4 h-4 object-contain rounded-full shrink-0"
              />
              <p className="text-white !leading-tight text-nowrap">Base</p>
            </div>
          </div>
          <div
            className={clsx(
              "relative grid grid-cols-4 gap-1 group translate-x-1"
            )}
          >
            <div className="absolute bottom-[calc(100%+4px)] border flex gap-1 border-white/30 left-1/2 transform text-xs -translate-x-1/2 px-2 py-1 bg-zinc-800/30 backdrop-blur-sm text-white rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
              <IoInformationCircle className="size-4" /> Gas fee/buffer will be
              adjusted.
            </div>
            {[0.1, 0.25, 0.5, 1].map((value) => (
              <button
                key={value}
                onClick={() => handlePercentCost(value)}
                className="text-white/80 text-xs rounded font-bold border border-[#818284] px-[0.1875rem] mx-0.5 disabled:bg-white/5 disabled:text-white/20"
              >
                {value * 100}%
              </button>
            ))}
          </div>
        </div>
        <div className="w-full flex justify-between items-center">
          <button
            className="flex flex-row w-full py-1 justify-start items-center cursor-pointer"
            onClick={() => setIsFromCoinOpen(true)}
          >
            {selectedVirtual?.image?.url && (
              <ImageNext
                src={selectedVirtual.image.url}
                className="size-9 rounded-full bg-white overflow-hidden"
                alt="token-logo"
                fullRadius
              />
            )}
            <div
              className={`flex flex-col ${selectedVirtual ? "ml-2" : ""} mr-1`}
            >
              <span className="text-base text-nowrap text-white font-bold !leading-tight">
                {selectedVirtual?.name || "Select Token"}
              </span>
            </div>
            <TiArrowSortedDown className="text-prime-token-200 size-5" />
          </button>
          <input
            className="!outline-none text-white text-lg w-full placeholder:text-base text-right sm:font-bold [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none bg-transparent placeholder:text-prime-zinc-100"
            type="text"
            ref={inputRef}
            placeholder="Enter an amount"
            autoComplete="off"
            value={
              !Boolean(Number(fromAmount)) &&
              isFocused &&
              !String(fromAmount).includes(".")
                ? undefined
                : fromAmount
            }
            onFocus={() => {
              handleFocus(inputRef);
              setIsFocused(true);
            }}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setFromAmount(Number(e.target.value))}
          />
        </div>
        <div className="w-full flex flex-row flex-nowrap justify-between items-center text-white">
          {selectedVirtual ? (
            <div className="flex flex-row gap-x-1 w-full text-xs text-zinc-300">
              Available
              {isBalanceLoading ? (
                <div className="animate-pulse bg-gray-700 h-4 w-20 rounded"></div>
              ) : (
                <span className="">
                  {Number(selectedVirtual.userBalance || 0).toFixed(6)}
                </span>
              )}
              {selectedVirtual.name}
            </div>
          ) : (
            <div className="h-4"></div>
          )}
        </div>
      </div>

      {/* Swap Button */}
      <div className="flex justify-center mx-auto -my-4 z-10">
        <button
          className="bg-primary-100 rounded-full p-2.5 filter hover:brightness-125 transition-all origin-center"
          onClick={swapFields}
        >
          <LuArrowUpDown className="text-lg text-black text-prime-text-100 size-5" />
        </button>
      </div>

      {/* To Section */}
      <div className="flex flex-col items-center border border-primary-100 px-5 py-3.5 rounded-lg mt-2 gap-2.5">
        <div className="flex w-full items-center text-prime-zinc-50 justify-between">
          <p className="text-zinc-400 text-sm flex gap-3 items-center justify-center">
            To{" "}
            <div className="flex gap-1">
              <img
                src="/Networks/Base.png"
                alt="base icon"
                className="w-4 h-4 object-contain rounded-full"
              />
              <span className="text-white !leading-tight text-nowrap">
                Base
              </span>
            </div>
          </p>
        </div>
        <div className="w-full flex justify-between items-center">
          <button
            className="flex flex-row w-full py-1 justify-start items-center cursor-pointer"
            onClick={() => setIsToCoinOpen(true)}
          >
            {selectedToVirtual?.image?.url && (
              <ImageNext
                src={selectedToVirtual.image.url}
                className="size-9 rounded-full bg-white overflow-hidden"
                alt="token-logo"
                fullRadius
              />
            )}
            <div
              className={`flex flex-col ${
                selectedToVirtual ? "ml-2" : ""
              } mr-1`}
            >
              <span className="text-base text-nowrap text-white font-bold !leading-tight">
                {selectedToVirtual?.name || "Select Token"}
              </span>
            </div>
            <TiArrowSortedDown className="text-prime-token-200 size-5" />
          </button>
          <div className="text-base sm:font-bold text-white sm:text-lg">
            {isEstimating ? (
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></div>
                </div>
              </div>
            ) : (
              toAmount || "0.0"
            )}
          </div>
        </div>
        <div className="w-full flex flex-row flex-nowrap justify-between items-center text-white">
          {selectedToVirtual ? (
            <div className="flex flex-row gap-x-1 w-full text-xs text-zinc-300">
              Available
              {isBalanceLoading ? (
                <div className="animate-pulse bg-gray-700 h-4 w-20 rounded"></div>
              ) : (
                <span className="">
                  {Number(selectedToVirtual.userBalance || 0).toFixed(6)}
                </span>
              )}
              {selectedToVirtual.name}
            </div>
          ) : (
            <div className="h-4"></div>
          )}
        </div>
      </div>

      {/* Trade Button */}
      <button
        className="w-full mt-6 py-4 bg-primary-100 text-black font-medium rounded-lg hover:brightness-125 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={() => setIsConfirmPop(true)}
        disabled={buttonText !== "Trade"}
      >
        {buttonText}
      </button>
    </div>
  );
};

export default SwapSection;
