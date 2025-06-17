import React, { useState, useMemo } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { OverviewData, KPIData, ChartDataPoint } from "./interfaces";
import OverviewChart from "./OverviewChart";

const KPICard: React.FC<KPIData> = ({
  title,
  todayValue,
  todayChange,
  allTimeValue,
  isCurrency = false,
}) => {
  return (
    <div className="backdrop-blur-sm rounded-md p-2 border border-primary-100/40">
      <h3 className="text-primary-100 text-sm mb-1">{title}</h3>
      <div className="flex items-baseline gap-2">
        <span className="text-white text-lg font-medium flex items-center gap-1">
          <span className="text-[#B0BEC5] text-sm">Today's:</span>
          {isCurrency ? "$" : ""}
          {todayValue.toLocaleString()}
        </span>
        <span
          className={`text-sm ${
            todayChange >= 0 ? "text-green-500" : "text-red-500"
          }`}
        >
          {todayChange >= 0 ? "+" : ""}
          {todayChange}%
        </span>
      </div>
      <div className="flex items-baseline gap-2 -mt-1">
        <span className="text-white text-lg font-medium flex items-center gap-1">
          <span className="text-[#B0BEC5] text-sm">All time:</span>
          {isCurrency ? "$" : ""}
          {allTimeValue.toLocaleString()}
        </span>
      </div>
    </div>
  );
};

const generateChartData = (timeRange: string): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  const today = new Date();

  switch (timeRange) {
    case "Daily":
      // Generate last 7 days of data
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        data.push({
          date: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          volume: Math.floor(Math.random() * 50000) + 30000,
          virgenPoints: Math.floor(Math.random() * 1000) + 500,
          transactions: Math.floor(Math.random() * 300) + 200,
        });
      }
      break;

    case "Weekly":
      // Generate last 7 weeks of data
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i * 7);
        data.push({
          date: `Week ${7 - i}`,
          volume: Math.floor(Math.random() * 200000) + 150000,
          virgenPoints: Math.floor(Math.random() * 5000) + 3000,
          transactions: Math.floor(Math.random() * 1500) + 1000,
        });
      }
      break;

    case "Monthly":
      // Generate last 7 months of data
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        data.push({
          date: date.toLocaleDateString("en-US", {
            month: "short",
            year: "2-digit",
          }),
          volume: Math.floor(Math.random() * 800000) + 500000,
          virgenPoints: Math.floor(Math.random() * 20000) + 15000,
          transactions: Math.floor(Math.random() * 6000) + 4000,
        });
      }
      break;
  }

  return data;
};

const Overview: React.FC<any> = () => {
  const [timeRange, setTimeRange] = useState("Daily");

  // Generate mock data based on time range
  const overviewData = useMemo(
    () => ({
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
      chartData: generateChartData(timeRange),
    }),
    [timeRange]
  );

  return (
    <div className="relative h-full w-full justify-center items-center bg-gradient-to-br from-primary-100/50 via-10% via-transparent to-transparent">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6 px-4 py-3 border-b border-primary-100/40">
        <h2 className="text-[#26fcfc] sm:text-base text-sm font-semibold">
          Overview
        </h2>
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-[#15181B]/80 backdrop-blur-sm text-white border border-primary-100/40 rounded-lg px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-[#26fcfc]/50 font-light text-sm"
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
          <IoIosArrowDown className="w-4 h-4 absolute right-2 top-1/2 transform -translate-y-1/2 text-[#B0BEC5] pointer-events-none" />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6 mx-6">
        <KPICard {...overviewData.volumeData} isCurrency={true} />
        <KPICard {...overviewData.virgenPointsData} />
      </div>

      {/* Chart Section */}
      <div className="relative w-full justify-end items-right p-2">
        <OverviewChart data={overviewData.chartData} />
      </div>
    </div>
  );
};

export default Overview;
