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
      className={`relative flex items-center sm:justify-between justify-center w-screen bg-[#15181B]/80  h-[6.8vh] px-14 py-4 z-30 ${
        address && "border-t-[1px] border-primary-100/60"
      }`}
    >
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
        <Link key="Twitter" href="">
          <RiTwitterXLine className="text-primary-100 size-7" />
        </Link>
        <Link key="Telegram" href="">
          <RiTelegram2Fill className="text-primary-100 size-7" />
        </Link>
      </div>
    </div>
  );
};

export default Footer;
