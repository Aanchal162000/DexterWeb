/* eslint-disable @next/next/no-img-element */
import { useLoginContext } from "../../context/LoginContext";
import { isSymbiosisFlow, useSwapContext } from "../../context/SwapContext";
import React, { Dispatch, SetStateAction, useState } from "react";
import { FiLoader } from "react-icons/fi";
import { FaArrowRight, FaLink } from "react-icons/fa6";
import { formatAddress } from "@/utils/helper";
import { useFiatContext } from "../../context/FiatContext";
import { ConfirmationDialogProps } from "../common/interfaces";

function SnipeStatus({
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
  releaseHash,
  setReleaseHash,
}: ConfirmationDialogProps) {
  const { address } = useLoginContext();
  const { networkData, switchNetwork } = useLoginContext();
  const { transakStatus, resetFiatStates } = useFiatContext();
  const isSwitchNeeded = Boolean(selectedNetwork?.id !== networkData?.chainId);
  const isSameChain = selectedNetwork?.id === selectedToNetwork?.id;

  // Show loader if processing else check icon for done.
  const checkerLoader = (isChecked: unknown) =>
    Boolean(isChecked) ? (
      <img
        src="/trx/Tick.png"
        alt="transaction-done"
        className="size-3 object-contain"
      />
    ) : (
      <img
        src="/trx/Loading.png"
        alt="transaction-in-progress"
        className="size-3 object-contain animate-slow"
      />
    );

  return (
    <>
      <div className="flex w-full h-auto flex-col gap-4 px-4 pb-5 mt-auto">
        {/* Step 0: Transaction Info */}
        <div className="w-full px-2 pt-2 pb-6 flex flex-row items-center justify-evenly rounded text-white">
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
            <p className="text-xs">
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
            <p className="text-xs">
              {Number(toAmount).toFixed(6)} {selectedToCoin?.symbol}
            </p>
          </div>
        </div>
        {/* Step 1: Address Step */}
        {/* <div className="w-full h-[3.125rem] border flex items-center space-x-4  px-4 border-[#5a5a5a] rounded">
          {checkerLoader(address)}
          <div className="w-full flex items-center justify-center">
            <p className="text-sm text-[#5a5a5a]">Address: &nbsp;</p>
            <p className="text-sm text-white">{formatAddress(address)}</p>
          </div>
        </div> */}

        {/*Fiat Swap*/}
        {/* {isFiatBridge && (
          <>
            <div className="w-full h-[3.125rem] border flex items-center gap-3 border-[#5a5a5a] rounded">
              {checkerLoader(transakStatus === "completed")}
              <div className="w-full flex items-center justify-center gap-3">
                <p className="text-sm pb-1 xl:text-sm text-[#5a5a5a]">Buy: &#160;</p>
                <div className="text-sm text-wrap leading-4 text-white flex items-center justify-start">
                  <div className="flex flex-col pt-3 pb-1 justify-center text-sm leading-tight items-center">
                    <span>
                      {fiatAmount}&#160;
                      {selectedFiatCoin?.shortName}
                    </span>
                    <span className="text-[0.625rem]">(Fiat)</span>
                  </div>
                  <span className="text-sm mb-1">&#160; to &#160;</span>
                  <div className="flex flex-col pt-3 pb-1 text-sm leading-tight justify-center items-center">
                    <span>
                      {fromAmount}&#160;
                      {selectedCoin?.shortName}
                    </span>
                    <span className="text-[0.625rem] ">({selectedNetwork?.name})</span>
                  </div>
                </div>

                <span className="text-[0.625rem] text-white text-semibold text-nowrap">(2 ~ 10mins)</span>
              </div>
            </div>
            {isSwitchNeeded && transakStatus === "completed" && (
              <button
                className={`text-white px-4 mx-auto rounded-sm border bg-[#004ef5] animate-pulse font-bold flex text-xs items-center justify-center text-center`}
                onClick={onSwitchNetwork}>
                Switch Network
              </button>
            )}
          </>
        )} */}

        {/* Step 3: Transaction Approval */}
        <div className="relative w-full flex items-center justify-between gap-3 rounded">
          <div className="absolute left-[5px] top-[calc(100%+4px)] flex flex-col gap-[4px]">
            {[1, 1].map((_, id) => (
              <div
                className="bg-white/80 h-[1px] aspect-square shrink-0 rounded-full"
                key={id}
              ></div>
            ))}
          </div>
          {checkerLoader(isApproved || isTokenRelease)}
          <div className="w-full flex flex-row items-center justify-start text-sm text-white">
            Transaction Approval
          </div>

          <div className="flex items-center justify-center shrink-0">
            {approvalHash ? (
              <a
                rel="noreferrer"
                href={`${selectedNetwork?.explorer}/tx/${swapHash}`}
                target="_blank"
                className="text-xs flex items-center gap-2 flex-nowrap shrink-0"
              >
                Explore{" "}
                <img
                  src="/trx/Explore.png"
                  alt="open-transaction-link"
                  className="size-3"
                />
              </a>
            ) : (
              <img
                src="/trx/Explore.png"
                alt="open-transaction-link"
                className="size-3 opacity-0"
              />
            )}
          </div>
        </div>

        {/* Step 2: Swap */}
        <div className="relative w-full flex items-center gap-3 rounded">
          <div className="absolute left-[5px] top-[calc(100%+4px)] flex flex-col gap-[4px]">
            {[1, 1].map((_, id) => (
              <div
                className="bg-white/80 h-[1px] aspect-square shrink-0 rounded-full"
                key={id}
              ></div>
            ))}
          </div>
          {checkerLoader(isConvert)}
          <div className="w-full flex  items-center justify-start">
            <span className="text-sm xl:text-sm">
              {!isSameChain ? "Bridge:" : "Swap:"}
              &#160;
            </span>
            <div className="text-sm text-wrap leading-4 text-white flex items-center justify-start">
              <div className="flex flex-col justify-center text-sm leading-tight items-center">
                <span>
                  {fromAmount}&#160;
                  {selectedCoin?.symbol}
                </span>
                {/* <span className="text-[0.625rem]">({selectedNetwork?.name})</span> */}
              </div>
              <span className="text-sm">&#160; to &#160;</span>
              <div className="flex flex-col text-sm leading-tight justify-center items-center">
                <span>
                  {/* {toAmount.toFixed(6)}&#160; */}
                  {selectedToCoin?.symbol}
                </span>
                {/* <span className="text-[0.625rem]">({selectedToNetwork?.name})</span> */}
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Transaction Swap */}
        <div className="relative w-full flex items-center justify-between gap-3 rounded">
          {(!isSameChain || isSymbiosisFlow) && (
            <div className="absolute left-[5px] top-[calc(100%+4px)] flex flex-col gap-[4px]">
              {[1, 1].map((_, id) => (
                <div
                  className="bg-white/80 h-[1px] aspect-square shrink-0 rounded-full"
                  key={id}
                ></div>
              ))}
            </div>
          )}
          {checkerLoader(isSwapped)}
          <div className="w-full flex flex-row items-center justify-start text-sm text-white">
            Token Swap
          </div>

          <div className="flex items-center justify-center shrink-0">
            {swapHash ? (
              <a
                rel="noreferrer"
                href={`${selectedNetwork?.explorer}/tx/${swapHash}`}
                target="_blank"
                className="text-xs flex items-center gap-2 flex-nowrap shrink-0"
              >
                Explore{" "}
                <img
                  src="/trx/Explore.png"
                  alt="open-transaction-link"
                  className="size-3"
                />
              </a>
            ) : (
              <img
                src="/trx/Explore.png"
                alt="open-transaction-link"
                className="size-3 opacity-0"
              />
            )}
          </div>
        </div>

        {/* Step 5: Transaction Release */}
        {(!isSameChain || isSymbiosisFlow) && (
          <div className="w-full flex items-center justify-between gap-3 rounded">
            {checkerLoader(isTokenRelease)}
            <div className="w-full flex flex-row items-center justify-start text-sm text-white">
              Token Release
            </div>

            <div className="flex items-center justify-center shrink-0">
              {releaseHash ? (
                <a
                  rel="noreferrer"
                  href={`${selectedToNetwork?.explorer}/tx/${releaseHash}`}
                  target="_blank"
                  className="text-xs flex items-center gap-2 flex-nowrap shrink-0"
                >
                  Explore{" "}
                  <img
                    src="/trx/Explore.png"
                    alt="open-transaction-link"
                    className="size-3"
                  />
                </a>
              ) : (
                <img
                  src="/trx/Explore.png"
                  alt="open-transaction-link"
                  className="size-3 opacity-0"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Buy Again Button */}
      <div className="pb-4 flex items-center justify-center w-full px-4">
        <button
          onClick={() => {
            setIsConfirmPop(false);
            setIsFinalStep(false);
            resetFiatStates();
            resetSwapStates();
          }}
          disabled={
            isConvert &&
            (transakStatus === "processing" ||
              !isApproved ||
              !isSwapped ||
              (!isSameChain && !isTokenRelease))
          }
          className="disabled:bg-prime-zinc-500 h-10 bg-prime-blue-100 w-full text-white py-3 rounded-md text-sm flex items-center justify-center text-center  justify-self-end"
        >
          Buy Again
        </button>
      </div>
    </>
  );
}

export default SnipeStatus;
