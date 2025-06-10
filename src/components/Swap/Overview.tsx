"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import Assets from "./Assets";
import Transaction from "./Transaction";
import { MdWallet } from "react-icons/md";
import {
  PiClockCounterClockwiseBold,
  PiEyeFill,
  PiEyeSlash,
} from "react-icons/pi";
import { addTrailZeros, numberToMask, numberWithCommas } from "@/utils/helper";
import { ethers } from "ethers";
import { useLoginContext } from "../../context/LoginContext";
import useEffectAsync from "@/hooks/useEffectAsync";
import { useSwapContext } from "../../context/SwapContext";
import { getUSDPrices } from "@/services/apiCached";
import { arbitrumList, tokenList } from "@/constants/config";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type TOverviewTabs = "wallet" | "transaction";

const Overview = () => {
  const [selectedTab, setSelectedTab] = useState<TOverviewTabs>("wallet");
  const { currentProvider, address, networkData } = useLoginContext();
  const { selectedCoin, fromTokenData } = useSwapContext();
  const [isAmountMasked, setIsAmountMasked] = useLocalStorage<boolean>(
    "arbt-isMasked",
    false
  );
  const IconEyed = isAmountMasked ? PiEyeFill : PiEyeSlash;
  const [balance, setBalance] = useState<number>(0.0);
  const printedAmount = isAmountMasked
    ? "XXXXXX"
    : numberWithCommas(addTrailZeros(balance, 1, 2));

  return (
    <>
      <div className="relative h-full w-full backdrop-blur-sm bg-[#15181B]/80 border border-primary-100 rounded-xl text-white flex flex-col sm:px-8 px-2">
        <div className="flex items-center justify-between pt-4 pb-4">
          <div className="gap-4 sm:gap-6 flex [&>button]:py-2 sm:w-fit w-full">
            <button
              className={clsx(
                "text-sm sm:text-base flex items-center gap-2 font-semibold font-primary sm:w-fit w-full justify-center underline-offset-[0.625rem]",
                selectedTab === "wallet"
                  ? "text-primary-100 underline"
                  : "text-prime-zinc-100"
              )}
              onClick={() => setSelectedTab("wallet")}
            >
              {/* <MdWallet className="size-6" /> */}
              Assets
            </button>
            <div className="h-10 w-px bg-prime-background-100 sm:hidden" />
            <button
              className={clsx(
                "text-sm sm:text-base flex items-center gap-2 font-semibold font-primary sm:w-fit w-full justify-center text-nowrap underline-offset-[0.625rem]",
                selectedTab === "transaction"
                  ? "text-primary-100 underline"
                  : "text-prime-zinc-100"
              )}
              onClick={() => setSelectedTab("transaction")}
            >
              {/* <PiClockCounterClockwiseBold className="size-6" /> */}
              <div className="flex">
                Transactions&nbsp;
                <span className="sm:block hidden">History</span>
              </div>
            </button>
          </div>
          <div className="text-sm sm:text-sm gap-4 font-medium hidden sm:flex items-center">
            <div>
              <span className="opacity-70">Balance: &nbsp;</span>
              <span className="font-bold text-primary-100 text-sm sm:text-[1.063rem] font-sans">
                ${printedAmount}
              </span>
            </div>
            <button
              onClick={() => setIsAmountMasked(!isAmountMasked)}
              className="select-none"
            >
              <IconEyed className="size-5" />
            </button>
          </div>
        </div>
        {selectedTab == "wallet" ? (
          <Assets setBalance={setBalance} isAmountMasked={isAmountMasked!} />
        ) : (
          <Transaction />
        )}
      </div>
    </>
  );
};

export default Overview;
