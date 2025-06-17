import React from "react";
import { X, MoreHorizontal, CheckCircle, Flame, Bot, AlertCircle, Clock } from "lucide-react";

const activities = [
    {
        id: 1,
        icon: CheckCircle,
        iconColor: "text-green-400",
        iconBg: "bg-green-400/20",
        title: "Volume loop completed",
        description: "Task: $52,343 volume generated across 327 trades in 7 days",
        time: "5 mins ago",
    },
    {
        id: 2,
        icon: Flame,
        iconColor: "text-orange-400",
        iconBg: "bg-orange-400/20",
        title: "Virgen points earned 1,312",
        description: "Task: Volume loop execution on Dexter's Picks",
        time: "9 mins ago",
    },
    {
        id: 3,
        icon: Bot,
        iconColor: "text-cyan-400",
        iconBg: "bg-cyan-400/20",
        title: "IQ Buy executed on $MINT at $0.024",
        description: "Task: Monitoring for exit signal",
        time: "25 mins ago",
    },
    {
        id: 4,
        icon: AlertCircle,
        iconColor: "text-red-400",
        iconBg: "bg-red-400/20",
        title: "You're missing on Virgen points",
        description: "Recommendation: Start a trading loop",
        time: "2 hours ago",
    },
    {
        id: 5,
        icon: Clock,
        iconColor: "text-blue-400",
        iconBg: "bg-blue-400/20",
        title: "Cooling period ended",
        description: "Recommendation: $MANA is now unlocked",
        time: "2 hours 49 mins ago",
    },
];

function ActivityLogs() {
    return (
        <div className="w-full h-full flex flex-col bg-gradient-to-br from-primary-100/50 via-20% via-transparent to-transparent rounded-2xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-teal-300/50">
                <h2 className="sm:text-base text-sm font-semibold text-primary-100">Dexter's Activity Logs</h2>
                <div className="flex items-center gap-3">
                    <MoreHorizontal className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                    <X className="w-5 h-5 text-gray-400 hover:text-white cursor-pointer transition-colors" />
                </div>
            </div>

            {/* Activity List */}
            <div className="overflow-y-auto h-[calc(500px-88px)]">
                {activities.map((activity) => {
                    const IconComponent = activity.icon;
                    return (
                        <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-teal-800/50 transition-all duration-200 border border-teal-700/30 hover:border-teal-600/50">
                            {/* Icon */}
                            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${activity.iconBg} flex items-center justify-center`}>
                                <IconComponent className={`w-5 h-5 ${activity.iconColor}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="text-white font-medium text-sm leading-tight">{activity.title}</h3>
                                    <span className="text-gray-400 text-xs whitespace-nowrap">{activity.time}</span>
                                </div>
                                <p className="text-gray-300 text-xs mt-1 leading-relaxed">{activity.description}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default ActivityLogs;
