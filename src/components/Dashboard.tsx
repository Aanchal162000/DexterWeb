"use client";

import React, { ReactNode } from "react";
import { useLoginContext } from "../context/LoginContext";
import Footer from "./common/Footer";
import Image from "next/image";
import Header from "./common/Header";
import Swap from "./Swap/Swap";
import { headerRoutes } from "@/constants/config";
import Snipe from "./Snipe/Snipe";
import HelpCenter from "./HelpCenter/HelpCenter";
import ActionCenter from "./ActionCenter/ActionCenter";

export type IRouterKey = (typeof headerRoutes)[number]["id"];

export const Router: { [key: IRouterKey]: ReactNode } = {
  Trade: <Swap />,
  Virtuals: <Snipe />,
  Support: <HelpCenter />,
  "Action Center": <ActionCenter />,
};

const Dashboard = () => {
  const { address, activeTab } = useLoginContext();

  return (
    <div className="relative h-full w-full">
      <div className="absolute h-full w-full !bg-[url('/Trade/background.jpg')] bg-[position:30%] bg-[size:cover] bg-[repeat:no-repeat] z-10 p-5 after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:shadow-[0px_0px_0px_9999px_rgba(0,0,0,0.68)]"></div>

      <div className="relative flex flex-col z-20 w-full h-[calc(100vh-6.8vh)]">
        <Header />
        {Router[activeTab]}
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
