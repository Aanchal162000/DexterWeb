import React from "react";
import Overview from "./Overview";
import Swidget from "./Swidget";

const Swap = () => {
  return (
    <div className={` `}>
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
