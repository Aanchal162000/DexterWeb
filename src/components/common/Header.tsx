"use client";

import React, { Fragment, useState } from "react";
import Image from "next/image";
import { useLoginContext } from "@/context/LoginContext";
import { useSettings } from "@/context/SettingsContext";
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

import { MdContentCopy } from "react-icons/md";
import { HiOutlineExternalLink, HiOutlineLogout } from "react-icons/hi";
import { TiArrowSortedDown } from "react-icons/ti";
import { toast } from "react-toastify";
import { IoMenu } from "react-icons/io5";
import { IoMdArrowDropup } from "react-icons/io";
import { IoMdArrowDropright } from "react-icons/io";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationDetails from "./NotificationDetails";
import { useActionContext } from "@/context/ActionContext";
import { INotification } from "@/utils/interface";

// Notification type key map
const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  event_captured: "Token Launch",
  transaction_sent: "Transaction Sent",
  transaction_success: "Transaction Success",
  transaction_critical_error: "Transaction Failed",
  genesis_window_alert: "Genesis Launch Alert",
  fundraising_alert: "Fundraising Alert",
  token_launch_alert: "New Token Launch",
  price_alert: "Price Alert",
  bonding_phase_alert: "Bonding Phase Update",
  volume_loop_alert: "Volume Loop Update",
  broadcast: "Announcement",
  custom: "Notification",
};

const Header = () => {
  const tabs = ["Laboratory", "Trenches", "Wallet", "Support"];
  // "Alerts", "DCA"
  const {
    activeTab,
    address,
    setActiveTab,
    networkData,
    setAddress,
    setIsFromHeader,
  } = useLoginContext();
  const { setShowSettings } = useSettings();
  const network = networkCards.filter(
    (network) => network?.id == networkData?.chainId!
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { authToken } = useActionContext();
  const {
    notifications,
    hasUnread,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    connectionStatus,
  } = useNotifications(address!, authToken);
  const [selectedNotification, setSelectedNotification] =
    useState<INotification | null>(null);

  const handleTabClick = (item: string) => {
    let tab = headerRoutes.filter((route: IRouter) => route.name == item);
    setActiveTab(tab[0]?.name);
  };

  const copyAddressHandler = () => {
    if (!address) return;
    toast.info("Address Copied");
    window.navigator.clipboard.writeText(address);
  };

  const handleSettingsClick = () => {
    setIsFromHeader(true);
    setActiveTab(headerRoutes[2]?.name);
    setShowSettings(true);
  };

  const handleNotificationClick = (notification: INotification) => {
    markAsRead(notification.id);
    setSelectedNotification(notification);
  };

  // Filter to show only unread notifications
  const unreadNotifications = notifications.filter((n) => !n.read);

  return (
    <div className="relative w-full bg-[#15181B]/80 border-b-[1px] border-primary-100/60 z-30">
      <div className="max-w-7xl sm:max-w-full mx-auto px-4 sm:px-14 ">
        <div className="flex items-center justify-between h-[4.8rem]">
          {/* Logo */}
          <div className="flex flex-row text-2xl gap-2 justify-center items-center  ">
            <Image
              src="/Login/webLogo.png"
              alt="Dexter"
              height={26}
              width={26}
            />
            <h3 className="text-[1.6rem] leading-[2.1rem] text-white  font-bold font-grotesk">
              DEXTER
            </h3>
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
              <Menu as="div" className="relative inline-block text-left w-fit">
                <div>
                  <MenuButton className="flex items-center justify-center p-2 relative">
                    <img
                      src={
                        hasUnread ? "/alert/bell-on.png" : "/alert/bell-off.png"
                      }
                      alt="notifications"
                      className={`size-6 object-contain ${
                        connectionStatus === "error" ? "opacity-50" : ""
                      }`}
                    />

                    {connectionStatus === "error" && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-500 rounded-full" />
                    )}
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
                  <MenuItems className="absolute left-[-40px] mt-2 w-80 origin-top-right rounded-md border-2 border-primary-100/30 backdrop-blur-sm bg-black/40 drop-shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <IoMdArrowDropup className="absolute left-[44px] top-[-15px] text-primary-100 size-6" />
                    <div className="py-1">
                      <div className="flex items-center justify-between px-4 py-2 text-white">
                        Alerts
                        <div className="flex items-center gap-2">
                          {connectionStatus === "error" && (
                            <span className="text-xs text-yellow-500">
                              Connection error
                            </span>
                          )}

                          <button onClick={handleSettingsClick}>
                            <img
                              src={"/alert/settings.png"}
                              alt="notifications"
                              className="size-5 object-contain"
                            />
                          </button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-primary-100/40 scrollbar-track-transparent">
                        {unreadNotifications.length === 0 ? (
                          <div className="px-4 py-5 text-sm text-white/70 text-center">
                            No unread notifications
                          </div>
                        ) : (
                          unreadNotifications.map((notification) => (
                            <MenuItem key={notification.id}>
                              <button
                                onClick={() =>
                                  handleNotificationClick(notification)
                                }
                                className={`flex w-full items-start justify-start px-4 py-5 text-sm text-white border-t border-primary-100/30 bg-green-500/30`}
                              >
                                <img
                                  src={"/alert/bell-off.png"}
                                  alt="notifications"
                                  className="mr-3 h-7 w-7  rounded-full translate-y-2"
                                />
                                <div className="flex flex-col items-start justify-start text-left">
                                  <p className="text-white text-sm">
                                    {notification.message}
                                  </p>
                                  <p className="opacity-70 text-xs">
                                    {new Date(
                                      notification.timestamp
                                    ).toLocaleTimeString()}{" "}
                                    •{" "}
                                    {NOTIFICATION_TYPE_LABELS[
                                      notification.type
                                    ] || notification.type}
                                  </p>
                                </div>
                              </button>
                            </MenuItem>
                          ))
                        )}
                      </div>
                      {unreadNotifications.length > 0 && (
                        <div className="flex w-full items-center justify-between px-4 py-3 border-t border-primary-100/30">
                          <button
                            onClick={markAllAsRead}
                            className="text-primary-100 text-xs mr-2"
                          >
                            Mark all as read
                          </button>
                          <button
                            onClick={clearAllNotifications}
                            className="text-red-400 text-xs"
                          >
                            Clear All
                          </button>
                        </div>
                      )}
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>

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
                  <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-md border border-primary-100/30  backdrop-blur-sm  bg-black/25 drop-shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
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
                              `https://basescan.org/address/${address}`,
                              "_blank"
                            )
                          }
                          className="flex w-full items-center px-4 py-2 text-sm text-white  border-t border-primary-100/30  hover:bg-primary-100/10"
                        >
                          <HiOutlineExternalLink className="mr-3 h-5 w-5" />
                          View on Explorer
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button
                          onClick={() => setAddress(null)}
                          className="flex w-full items-center px-4 py-2 text-sm  border-t border-primary-100/30  text-white hover:bg-primary-100/10"
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
                <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right rounded-md  backdrop-blur-sm border-[1px] border-primary-100/20 shadow-lg ring-1  ring-opacity-5 focus:outline-none">
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
                                `https://basecscan.com/address/${address}`,
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

      {selectedNotification && (
        <NotificationDetails
          eventData={selectedNotification.eventData}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </div>
  );
};

export default Header;
