"use client";

import React, { useEffect } from "react";
import clsx from "clsx";
import { usePathname, useRouter } from "next/navigation";
import { useMediaQuery } from "react-responsive";

const BottomTab = (props: any) => {
  const pathName = usePathname();
  const router = useRouter();
  const isSwidge = pathName === "/swidge",
    isWallet = pathName === "/wallet";
  const isSm = useMediaQuery({ maxWidth: 640 });

  if (!isSm) return null;

  //If not Swidge or Wallet, return null
  if (!pathName.includes("swidge") && !pathName.includes("wallet")) return null;

  return (
    <div className="relative bottombar flex items-center sm:justify-between justify-center w-screen bg-prime-background h-[7.4vh] z-30">
      <button
        className={clsx(
          "flex items-center justify-center size-full hover:bg-prime-background-200",
          isSwidge ? "opacity-100" : "opacity-60"
        )}
        onClick={() => router.push("/swidge")}
      >
        Swidge
      </button>
      <div className="w-px h-[60%] bg-prime-zinc-300" />
      <button
        className={clsx(
          "flex items-center justify-center size-full hover:bg-prime-background-200",
          isWallet ? "opacity-100" : "opacity-60"
        )}
        onClick={() => router.push("/wallet")}
      >
        Wallet
      </button>
    </div>
  );
};

export default BottomTab;
