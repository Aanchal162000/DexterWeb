"use client";

import React from "react";
import Image from "next/image";
import { RxHamburgerMenu } from "react-icons/rx";
import { useLoginContext } from "@/context/LoginContext";
import { headerRoutes, networkCards } from "@/constants/config";
import { IRouter } from "@/utils/interface";

const Header = (props: any) => {
  const tabs = ["Trade", "Snipe", "Alerts", "DCA", "Support"];
  const { activeTab, address, setActiveTab, networkData } = useLoginContext();
  const network = networkCards.filter(
    (network) => network?.id == networkData?.chainId!
  );
  console.log("networkss", network);

  return (
    <div className="relative flex items-center sm:justify-between justify-center w-screen bg-[#15181B]/80 border-b-[1px] border-primary-100/60 px-14 py-3 z-30">
      <Image src="/Login/logo.png" alt="Dexter" height={130} width={110} />
      <div className="relative flex flex-row space-x-4">
        <div className="relative flex flex-row space-x-4 justify-center items-center">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => {
                let tab = headerRoutes.filter(
                  (route: IRouter) => route.name == item
                );
                setActiveTab(tab[0]?.name);
              }}
              className={`text-sm font-normal ${
                activeTab == item ? "text-primary-100" : "text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <button className=" flex w-[150px] flex-row p-2 items-center  justify-between space-x-3 bg-primary-100 text-black text-base text-center font-bold rounded-md">
          <Image
            alt="Dexter"
            src="/Trade/dexterLogo.png"
            width={20}
            height={20}
          />
          <div className="flex flex-row space-x-1 justify-center items-center">
            <p className="text-black font-semibold text-sm">1,412,912</p>
            <p className="text-black font-medium text-[10px] translate-y-[1px]">
              DEXTER
            </p>
          </div>
        </button>
        <button className=" flex flex-row py-2 px-4 w-[150px] items-center  justify-between space-x-3 border border-primary-100 text-black text-base text-center font-bold rounded-md">
          <Image alt="Dexter" src={network[0]?.image} width={20} height={20} />
          <div className="flex flex-row space-x-1">
            <p className="text-white font-semibold text-sm">
              {address?.slice(0, 4)}....{address?.slice(-4)}
            </p>
          </div>
        </button>

        <button>
          <RxHamburgerMenu className="text-primary-100 size-7" />
        </button>
      </div>
    </div>
  );
};

export default Header;
