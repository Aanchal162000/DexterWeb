"use client";

import React from "react";
import Link from "next/link";
import { useMediaQuery } from "react-responsive";
import { usePathname } from "next/navigation";
import { RiTelegram2Fill, RiTwitterXLine } from "react-icons/ri";

const Footer = (props: any) => {
  const pathName = usePathname();
  const isSm = useMediaQuery({ maxWidth: 640 });

  if (isSm && pathName !== "/") return null;

  return (
    <div className="relative flex items-center sm:justify-between justify-center w-screen bg-[#15181B]/80 border-b border-[#4f5052] h-[6.8vh] px-14 py-4 z-30">
      <div>
        <p className="text-zinc-400 text-sm sm:text-sm">
          Powered By{" "}
          <a
            href="https://zkcross.network/"
            target="_blank"
            className="text-primary-100"
          >
            zkCross Network
          </a>{" "}
          | Version 1.0
        </p>
      </div>
      <div className="relative sm:flex flex-row gap-3 hidden">
        <Link key="Twitter" href="https://twitter.com/zkCrossNetwork">
          <RiTwitterXLine className="text-primary-100 size-7" />
        </Link>
        <Link key="Telegram" href="https://t.me/zkCrossNetwork">
          <RiTelegram2Fill className="text-primary-100 size-7" />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
