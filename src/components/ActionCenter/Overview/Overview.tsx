import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { OverviewData, KPIData } from "./interfaces";
import OverviewChart from "./OverviewChart";

const KPICard: React.FC<KPIData> = ({
  title,
  todayValue,
  todayChange,
  allTimeValue,
  isCurrency = false,
}) => {
  return (
    <div className="bg-[#0F172A]/80 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-[#B0BEC5] text-sm mb-2">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-white text-2xl font-medium">
          {isCurrency ? "$" : ""}
          {todayValue.toLocaleString()}
        </span>
        <span
          className={`text-sm ${
            todayChange >= 0 ? "text-[#00CFFF]" : "text-[#FF2FE6]"
          }`}
        >
          {todayChange >= 0 ? "+" : ""}
          {todayChange}%
        </span>
      </div>
      <div className="mt-2 text-[#B0BEC5] text-sm">
        All time: {isCurrency ? "$" : ""}
        {allTimeValue.toLocaleString()}
      </div>
    </div>
  );
};

const Overview: React.FC<OverviewData> = ({
  volumeData,
  virgenPointsData,
  chartData,
}) => {
  const [timeRange, setTimeRange] = useState("Daily");

  return (
    <div className="relative h-full w-full justify-center items-center">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 p-4 border-b border-primary-100/40">
        <h2 className="text-[#26fcfc] text-xl font-medium">Overview</h2>
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#0F172A]/80 text-white border border-[#444B5A] rounded-lg px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-[#26fcfc]/50 font-light"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <IoIosArrowDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-[#B0BEC5] pointer-events-none" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <KPICard {...volumeData} isCurrency={true} />
        <KPICard {...virgenPointsData} />
      </div>

      {/* Chart Section */}

      <OverviewChart data={chartData} />
    </div>
  );
};

export default Overview;
