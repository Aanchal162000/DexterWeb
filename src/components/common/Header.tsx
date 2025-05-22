"use client";

import React, { Fragment, useState } from "react";
import Image from "next/image";
import { useLoginContext } from "@/context/LoginContext";
import { headerRoutes, networkCards } from "@/constants/config";
import { IRouter } from "@/utils/interface";
import TokenSelector from "./TokenSelector";
import {
  Menu,
  Transition,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { HiChevronUpDown } from "react-icons/hi2";
import { MdContentCopy } from "react-icons/md";
import { HiOutlineExternalLink, HiOutlineLogout } from "react-icons/hi";
import { TiArrowSortedDown } from "react-icons/ti";
import { toast } from "react-toastify";
import { IoMenu } from "react-icons/io5";

const Header = () => {
  const tabs = ["Home", "Virtuals", "Alerts", "DCA", "Support"];
  const { activeTab, address, setActiveTab, networkData, setAddress } =
    useLoginContext();
  const network = networkCards.filter(
    (network) => network?.id == networkData?.chainId!
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (item: string) => {
    let tab = headerRoutes.filter((route: IRouter) => route.name == item);
    setActiveTab(tab[0]?.name);
  };

  const copyAddressHandler = () => {
    if (!address) return;
    toast.info("Address Copied");
    window.navigator.clipboard.writeText(address);
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
              <TokenSelector />

              <Menu as="div" className="relative inline-block text-left w-fit">
                <div>
                  <MenuButton className="flex flex-row py-2 px-4 w-[150px] items-center justify-between space-x-3 border border-primary-100 text-black text-base text-center font-bold rounded-md hover:bg-primary-100/10 transition-colors duration-200">
                    <Image
                      alt="Network"
                      src={network[0]?.image}
                      width={20}
                      height={20}
                    />
                    <div className="flex flex-row space-x-1">
                      <p className="text-white font-semibold text-sm">
                        {address?.slice(0, 4)}....{address?.slice(-4)}
                      </p>
                    </div>
                    <TiArrowSortedDown
                      size="1.2rem"
                      className=" text-white transition-all duration-300 rotate-0 group-aria-expanded:rotate-180!"
                    />
                  </MenuButton>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-[#15181B] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <MenuItem>
                        <button
                          onClick={copyAddressHandler}
                          className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-primary-100/10"
                        >
                          <MdContentCopy className="mr-3 h-5 w-5" />
                          Copy Address
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button
                          onClick={() =>
                            address &&
                            window.open(
                              `https://bscscan.com/address/${address}`,
                              "_blank"
                            )
                          }
                          className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-primary-100/10"
                        >
                          <HiOutlineExternalLink className="mr-3 h-5 w-5" />
                          View on Explorer
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button
                          onClick={() => setAddress(null)}
                          className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-primary-100/10"
                        >
                          <HiOutlineLogout className="mr-3 h-5 w-5" />
                          Disconnect
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Menu as="div" className="relative inline-block text-left">
              <MenuButton className="text-primary-100 hover:text-primary-100/80 transition-colors duration-200">
                <IoMenu size="2rem" />
              </MenuButton>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-[#15181B] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="py-1">
                    {tabs.map((item) => (
                      <MenuItem key={item}>
                        <button
                          onClick={() => handleTabClick(item)}
                          className={`flex w-full items-center px-4 py-2 text-sm ${
                            activeTab === item
                              ? "text-primary-100"
                              : "text-white hover:bg-primary-100/10"
                          }`}
                        >
                          {item}
                        </button>
                      </MenuItem>
                    ))}
                    {address && (
                      <>
                        <div className="border-t border-primary-100/20 my-2" />
                        <MenuItem>
                          <button
                            onClick={copyAddressHandler}
                            className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-primary-100/10"
                          >
                            <MdContentCopy className="mr-3 h-5 w-5" />
                            Copy Address
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={() =>
                              address &&
                              window.open(
                                `https://bscscan.com/address/${address}`,
                                "_blank"
                              )
                            }
                            className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-primary-100/10"
                          >
                            <HiOutlineExternalLink className="mr-3 h-5 w-5" />
                            View on Explorer
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            onClick={() => setAddress(null)}
                            className="flex w-full items-center px-4 py-2 text-sm text-white hover:bg-primary-100/10"
                          >
                            <HiOutlineLogout className="mr-3 h-5 w-5" />
                            Disconnect
                          </button>
                        </MenuItem>
                      </>
                    )}
                  </div>
                </MenuItems>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
