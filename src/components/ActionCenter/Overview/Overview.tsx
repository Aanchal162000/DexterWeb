import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { OverviewData, KPIData } from "./interfaces";
import OverviewChart from "./OverviewChart";

const KPICard: React.FC<KPIData> = ({ title, todayValue, todayChange, allTimeValue, isCurrency = false }) => {
    return (
        <div className="bg-[#0F172A]/80 backdrop-blur-sm rounded-md p-4 border border-primary-100/40">
            <h3 className="text-primary-100 text-sm mb-2">{title}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-white text-xl font-medium">
                    <span className="mt-2 text-[#B0BEC5] text-sm">Today's:</span> {isCurrency ? "$" : ""}
                    {todayValue.toLocaleString()}
                </span>
                <span className={`text-sm ${todayChange >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {todayChange >= 0 ? "+" : ""}
                    {todayChange}%
                </span>
            </div>
            <div className="flex items-baseline gap-2 -mt-1">
                <span className="text-white text-xl font-medium">
                    <span className="mt-2 text-[#B0BEC5] text-sm">All time: </span> {isCurrency ? "$" : ""}
                    {allTimeValue.toLocaleString()}
                </span>
            </div>
        </div>
    );
};

const Overview: React.FC<any> = () => {
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

    const [timeRange, setTimeRange] = useState("Daily");

    return (
        <div className="relative h-full w-full justify-center items-center bg-gradient-to-br from-primary-100/50 via-10% via-transparent to-transparent">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-6 px-4 py-3 border-b border-primary-100/40">
                <h2 className="text-[#26fcfc] sm:text-base text-sm font-semibold">Overview</h2>
                <div className="relative">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="bg-[#0F172A]/80 text-white border border-[#444B5A] rounded-lg px-3 py-1.5 pr-8 appearance-none focus:outline-none focus:ring-2 focus:ring-[#26fcfc]/50 font-light text-sm"
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

            <OverviewChart data={overviewData.chartData} />
        </div>
    );
};

export default Overview;
