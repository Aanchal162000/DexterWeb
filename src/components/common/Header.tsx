"use client";

import React, { useState } from "react";
import Image from "next/image";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";
import { useLoginContext } from "@/context/LoginContext";
import { headerRoutes, networkCards } from "@/constants/config";
import { IRouter } from "@/utils/interface";

const Header = (props: any) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const tabs = ["Trade", "Snipe", "Alerts", "DCA", "Support"];
  const { activeTab, address, setActiveTab, networkData } = useLoginContext();
  const network = networkCards.filter(
    (network) => network?.id == networkData?.chainId!
  );

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleTabClick = (item: string) => {
    let tab = headerRoutes.filter((route: IRouter) => route.name == item);
    setActiveTab(tab[0]?.name);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="relative w-full bg-[#15181B]/80 border-b-[1px] border-primary-100/60 z-30">
      <div className="max-w-7xl sm:max-w-full mx-auto px-4 sm:px-14 ">
        <div className="flex items-center justify-between h-[4.8rem]">
          {/* Logo */}
          <div className="flex-shrink-0 ">
            <Image
              src="/Login/logo.png"
              alt="Dexter"
              height={130}
              width={110}
            />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-6 mr-4">
              {tabs.map((item) => (
                <button
                  key={item}
                  onClick={() => handleTabClick(item)}
                  className={`text-base font-normal transition-colors duration-200 ${
                    activeTab == item
                      ? "text-primary-100"
                      : "text-white hover:text-primary-100/80"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Wallet and Token Buttons */}
            <div className="flex items-center space-x-4">
              <button className="flex w-[150px] flex-row p-2 items-center justify-between space-x-3 bg-primary-100 text-black text-base text-center font-bold rounded-md hover:bg-primary-100/90 transition-colors duration-200">
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

              <button className="flex flex-row py-2 px-4 w-[150px] items-center justify-between space-x-3 border border-primary-100 text-black text-base text-center font-bold rounded-md hover:bg-primary-100/10 transition-colors duration-200">
                <Image
                  alt="Dexter"
                  src={network[0]?.image}
                  width={20}
                  height={20}
                />
                <div className="flex flex-row space-x-1">
                  <p className="text-white font-semibold text-sm">
                    {address?.slice(0, 4)}....{address?.slice(-4)}
                  </p>
                </div>
              </button>
              <button
                onClick={toggleMobileMenu}
                className="text-primary-100 hover:text-primary-100/80 transition-colors duration-200"
              >
                <RxHamburgerMenu className="size-7" />
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-primary-100 hover:text-primary-100/80 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <IoClose className="size-7" />
              ) : (
                <RxHamburgerMenu className="size-7" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-[4.8rem] left-0 right-0 bg-[#15181B] border-b border-primary-100/60">
          <div className="px-4 py-3 space-y-4">
            {tabs.map((item) => (
              <button
                key={item}
                onClick={() => handleTabClick(item)}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-normal ${
                  activeTab == item
                    ? "text-primary-100"
                    : "text-white hover:text-primary-100/80"
                }`}
              >
                {item}
              </button>
            ))}

            {/* Mobile Wallet and Token Buttons */}
            <div className="space-y-3 pt-2">
              <button className="w-full flex flex-row p-2 items-center justify-between space-x-3 bg-primary-100 text-black text-base text-center font-bold rounded-md">
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

              <button className="w-full flex flex-row py-2 px-4 items-center justify-between space-x-3 border border-primary-100 text-black text-base text-center font-bold rounded-md">
                <Image
                  alt="Dexter"
                  src={network[0]?.image}
                  width={20}
                  height={20}
                />
                <div className="flex flex-row space-x-1">
                  <p className="text-white font-semibold text-sm">
                    {address?.slice(0, 4)}....{address?.slice(-4)}
                  </p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
