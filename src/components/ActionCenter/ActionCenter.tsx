import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";
import TrendingTokens from "./TrendingTokens";
import Overview from "./Overview/Overview";
import SwapOverview from "../Swap/Overview";
import Adborad from "./Adborad";
import AssetOverview from "./AssetOverview/AssetOverview";
import ActivityLogs from "./ActivityLogs";
import CreateLoop from "./CreateLoop";
import AuthModal from "./AuthModal";
import { useActionContext } from "@/context/ActionContext";

const ActionCenter = () => {
  const isMd = useMediaQuery({ minWidth: 768 });
  const [bottomTab, setBottomTab] = useState<"list" | "dex">("list");
  const { authToken } = useActionContext();

  return (
    <div
      className={`w-full relative h-[120vh] overflow-y-auto gap-6 flex md:flex-row flex-col lg:px-14 sm:px-7 px-4 py-3 justify-center`}
    >
      {!authToken && <AuthModal />}
      <div className="flex flex-col gap-6 relative w-[70%] h-[120vh]">
        {/* Trending Tokens */}
        <TrendingTokens />
        {/* Overview */}
        <div className="relative flex flex-row gap-6 w-full">
          <div className="relative h-[440px] w-[60%] border border-primary-100/40 backdrop-blur-sm bg-[#15181B]/80 rounded-xl overflow-hidden">
            <Adborad />
          </div>
          <div className="relative h-[440px] w-[40%] border border-primary-100/40 backdrop-blur-sm bg-[#15181B]/80 rounded-xl overflow-hidden">
            <Overview />
          </div>
        </div>
        <div className="relative flex flex-row gap-6 w-full flex-1 h-[800px] border border-primary-100/40 backdrop-blur-sm bg-[#15181B]/80 rounded-xl overflow-hidden">
          <AssetOverview />
        </div>
      </div>
      <div className="relative flex flex-col gap-6 w-[30%] h-[120vh]">
        <div className="relative min-h-[calc(440px+42px+21px)] w-full border border-primary-100/40 backdrop-blur-sm bg-[#15181B]/80 rounded-xl">
          <CreateLoop />
        </div>
        <div className="relative w-full flex-1 border border-primary-100/40 backdrop-blur-sm bg-[#15181B]/80 rounded-xl overflow-hidden">
          <ActivityLogs />
        </div>
      </div>
    </div>
  );
};
export default ActionCenter;
