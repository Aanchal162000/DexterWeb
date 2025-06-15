"use client";
import { useEffect, useState } from "react";
import clsx from "clsx";
import LiquidAssets from "./LiquidAssets";
import StakedAssets from "./StakedAssets";
import { PiEyeFill, PiEyeSlash } from "react-icons/pi";
import { addTrailZeros, numberWithCommas } from "@/utils/helper";
import { useLoginContext } from "../../../context/LoginContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import VolumeLoop from "./VolumeLoop";

type TOverviewTabs = "volumeLoop" | "liquidAssets" | "stakedAssets";

const Overview = () => {
    const [selectedTab, setSelectedTab] = useState<TOverviewTabs>("volumeLoop");
    const { address } = useLoginContext();
    const [isAmountMasked, setIsAmountMasked] = useLocalStorage<boolean>("arbt-isMasked", false);
    const IconEyed = isAmountMasked ? PiEyeFill : PiEyeSlash;
    const [balance, setBalance] = useState<number>(0.0);
    const printedAmount = isAmountMasked ? "XXXXXX" : numberWithCommas(addTrailZeros(balance, 1, 2));

    return (
        <>
            <div className="relative h-full w-full backdrop-blur-sm bg-[#15181B]/80 border border-primary-100 rounded-xl text-white flex flex-col sm:px-8 px-2 bg-gradient-to-br from-primary-100/50 via-10% via-transparent to-transparent">
                <div className="flex items-center justify-between pt-4 pb-4">
                    <div className="gap-4 sm:gap-6 flex [&>button]:py-2 sm:w-fit w-full">
                        <button
                            className={clsx(
                                "text-sm sm:text-base flex items-center gap-2 font-semibold font-primary sm:w-fit w-full justify-center underline-offset-[0.625rem]",
                                selectedTab === "volumeLoop" ? "text-primary-100 underline" : "text-prime-zinc-100"
                            )}
                            onClick={() => setSelectedTab("volumeLoop")}
                        >
                            Volume Loop
                        </button>
                        <div className="h-10 w-px bg-prime-background-100 sm:hidden" />
                        <button
                            className={clsx(
                                "text-sm sm:text-base flex items-center gap-2 font-semibold font-primary sm:w-fit w-full justify-center text-nowrap underline-offset-[0.625rem]",
                                selectedTab === "liquidAssets" ? "text-primary-100 underline" : "text-prime-zinc-100"
                            )}
                            onClick={() => setSelectedTab("liquidAssets")}
                        >
                            Liquid Assets
                        </button>
                        <div className="h-10 w-px bg-prime-background-100 sm:hidden" />
                        <button
                            className={clsx(
                                "text-sm sm:text-base flex items-center gap-2 font-semibold font-primary sm:w-fit w-full justify-center text-nowrap underline-offset-[0.625rem]",
                                selectedTab === "stakedAssets" ? "text-primary-100 underline" : "text-prime-zinc-100"
                            )}
                            onClick={() => setSelectedTab("stakedAssets")}
                        >
                            Staked Assets
                        </button>
                    </div>
                    {/* <div className="text-sm sm:text-sm gap-4 font-medium hidden sm:flex items-center">
                        <div>
                            <span className="opacity-70">Balance: &nbsp;</span>
                            <span className="font-bold text-primary-100 text-sm sm:text-[1.063rem] font-sans">${printedAmount}</span>
                        </div>
                        <button onClick={() => setIsAmountMasked(!isAmountMasked)} className="select-none">
                            <IconEyed className="size-5" />
                        </button>
                    </div> */}
                </div>
                {selectedTab === "volumeLoop" ? (
                    <VolumeLoop setBalance={setBalance} isAmountMasked={isAmountMasked!} />
                ) : selectedTab === "liquidAssets" ? (
                    <LiquidAssets setBalance={setBalance} isAmountMasked={isAmountMasked!} />
                ) : (
                    <StakedAssets setBalance={setBalance} isAmountMasked={isAmountMasked!} />
                )}
            </div>
        </>
    );
};

export default Overview;
