"use client";

import React from "react";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";
import { usePathname } from "next/navigation";
import { RiTelegram2Fill, RiTwitterXLine } from "react-icons/ri";
import { useLoginContext } from "@/context/LoginContext";

const Footer = (props: any) => {
  const pathName = usePathname();
  const isSm = useMediaQuery({ maxWidth: 640 });
  const { address } = useLoginContext();

  if (isSm && pathName !== "/") return null;

  return (
    <div
      className={`relative flex items-center sm:justify-between justify-center w-screen bg-black/60  h-[6.8vh] px-14 py-4 z-30 ${
        address && "border-t-[1px] border-primary-100/60"
      }`}
    >
      <div>
        <p className="text-zinc-400 text-xs sm:text-sm">
          All Rights Reserved | Version 1.0
        </p>
      </div>
      <div className="relative sm:flex flex-row gap-3 hidden">
        <Link
          key="Twitter"
          href="https://x.com/DextersLabAI"
          target="_blank"
          rel="noopener noreferrer"
        >
          <RiTwitterXLine className="text-primary-100 size-7" />
        </Link>
        <Link key="Telegram" href="" target="_blank" rel="noopener noreferrer">
          <RiTelegram2Fill className="text-primary-100 size-7" />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
