import React from "react";
import { AgentSectionProps } from "./interfaces";

const AgentSection: React.FC<AgentSectionProps> = ({
  title,
  type,
  data,
  loading,
  error,
  renderItem,
}) => {
  // Filter genesis items to only show BASE chain
  const filteredData =
    type === "genesis"
      ? data?.filter((item: any) => item.virtual?.chain === "BASE")
      : data;
  return (
    <div
      className={`flex flex-col relative sm:w-1/3 w-[90%] shrink-0 ${
        type != "sentient" ? "border-r" : ""
      }  border-primary-100 h-full`}
    >
      <div className="border-b border-primary-200 py-2 flex justify-center items-center text-base font-bold text-primary-100">
        {title}
      </div>
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-4">
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-100"></div>
            </div>
          ) : error && !filteredData?.length ? (
            <div className="text-red-500 text-center p-4">{error}</div>
          ) : filteredData?.length > 0 ? (
            filteredData.map((item) => renderItem(item))
          ) : (
            <div className="text-center text-gray-400 py-8">
              No {type} agents found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentSection;
