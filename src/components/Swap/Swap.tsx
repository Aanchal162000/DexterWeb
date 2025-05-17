import React from "react";
import Overview from "./Overview";
import Swidget from "./Swidget";

const Swap = () => {
  return (
    <div
      className={`w-full h-full overflow-y-auto lg:overflow-y-hidden lg:h-full flex-1 flex flex-row lg:px-14 sm:px-7 px-4 py-3 gap-4 justify-center`}
    >
      <div className="w-full md:flex hidden overflow-hidden">
        <Overview />
      </div>
      <div className="sm:!w-[clamp(38%,30rem,43%)] min-w-[23.75rem] w-full flex justify-center items-center h-full">
        <Swidget />
      </div>
    </div>
  );
};
export default Swap;
