import React, { useState } from "react";
import { useMediaQuery } from "react-responsive";
import TrendingTokens from "./TrendingTokens";
import Overview from "./Overview/Overview";

const ActionCenter = () => {
  const isMd = useMediaQuery({ minWidth: 768 });
  const [bottomTab, setBottomTab] = useState<"list" | "dex">("list");

  // Mock data for Overview component
  const overviewData = {
    volumeData: {
      title: "Volume",
      todayValue: 43500,
      todayChange: -11.22,
      allTimeValue: 179500,
      isCurrency: true,
    },
    virgenPointsData: {
      title: "Virgen Points",
      todayValue: 765,
      todayChange: -13.03,
      allTimeValue: 3420,
    },
    chartData: [
      { date: "June 5", volume: 43500, virgenPoints: 765, transactions: 276 },
      { date: "June 6", volume: 43500, virgenPoints: 765, transactions: 276 },
      { date: "June 7", volume: 43500, virgenPoints: 765, transactions: 276 },
      { date: "June 8", volume: 43500, virgenPoints: 765, transactions: 276 },
      { date: "June 9", volume: 43500, virgenPoints: 765, transactions: 276 },
      { date: "June 10", volume: 43500, virgenPoints: 765, transactions: 276 },
      { date: "June 11", volume: 43500, virgenPoints: 765, transactions: 276 },
    ],
  };

  return (
    <div
      className={`w-full h-screen overflow-y-auto gap-6 flex md:flex-row flex-col lg:px-14 sm:px-7 px-4 py-3 justify-center`}
    >
      <div className="flex flex-col gap-6 relative w-[70%] min-h-screen">
        {/* Trending Tokens */}
        <TrendingTokens />
        {/* Overview */}
        <div className="relative flex flex-row gap-6 w-full h-[500px]">
          <div className="relative h-full w-[40%] border border-primary-100/40 backdrop-blur-sm bg-[#15181B]/60 rounded-2xl before:absolute before:top-0 before:left-0 before:w-44 before:h-44 before:bg-[radial-gradient(circle_at_top_left,#26fcfc_0%,rgba(38,252,252,0)_100%)] before:opacity-30 before:[clip-path:polygon(0_0,0%_100%,100%_0)] before:rounded-tl-2xl">
            <Overview {...overviewData} />
          </div>
          <div className="relative h-full w-[60%] border border-primary-100/40 backdrop-blur-sm bg-[#15181B]/60 rounded-2xl before:absolute before:top-0 before:left-0 before:w-44 before:h-44 before:bg-[radial-gradient(circle_at_top_left,#26fcfc_0%,rgba(38,252,252,0)_100%)] before:opacity-30 before:[clip-path:polygon(0_0,0%_100%,100%_0)] before:rounded-tl-2xl"></div>
        </div>
        <div className="relative flex flex-row gap-6 w-full h-[600px]">
          <div className="relative h-full w-full border border-primary-100/40 backdrop-blur-sm bg-[#15181B]/60 rounded-2xl before:absolute before:top-0 before:left-0 before:w-44 before:h-44 before:bg-[radial-gradient(circle_at_top_left,#26fcfc_0%,rgba(38,252,252,0)_100%)] before:opacity-30 before:[clip-path:polygon(0_0,0%_100%,100%_0)] before:rounded-tl-2xl"></div>
        </div>
      </div>
      <div className="relative flex flex-col gap-6  w-[30%] h-screen">
        <div className="relative h-[48.2%] w-full border border-primary-100/40 backdrop-blur-sm bg-[#15181B]/60 rounded-2xl before:absolute before:top-0 before:left-0 before:w-44 before:h-44 before:bg-[radial-gradient(circle_at_top_left,#26fcfc_0%,rgba(38,252,252,0)_100%)] before:opacity-30 before:[clip-path:polygon(0_0,0%_100%,100%_0)] before:rounded-tl-2xl"></div>
        <div className="relative flex-1 w-full border border-primary-100/40 backdrop-blur-sm bg-[#15181B]/60 rounded-2xl before:absolute before:top-0 before:left-0 before:w-44 before:h-44 before:bg-[radial-gradient(circle_at_top_left,#26fcfc_0%,rgba(38,252,252,0)_100%)] before:opacity-30 before:[clip-path:polygon(0_0,0%_100%,100%_0)] before:rounded-tl-2xl"></div>
      </div>
    </div>
  );
};
export default ActionCenter;
