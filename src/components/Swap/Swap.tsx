import React, { useEffect, useState } from "react";
import Overview from "./Overview";
import Swidget from "./Swidget";
import { useMediaQuery } from "react-responsive";
import { useLoginContext } from "@/context/LoginContext";

const Swap = () => {
  const isMd = useMediaQuery({ minWidth: 768 });
  const [bottomTab, setBottomTab] = useState<"list" | "dex">("list");
  const { setIsFromHeader } = useLoginContext();
  useEffect(() => {
    setIsFromHeader(false);
  });
  return (
    <div
      className={`w-full h-full overflow-y-auto lg:overflow-y-hidden lg:h-full flex-1 flex md:flex-row flex-col lg:px-14 sm:px-7 px-4 py-3 gap-4 justify-center`}
    >
      {(isMd || bottomTab === "list") && (
        <div className="w-full h-full flex overflow-hidden">
          <Overview />
        </div>
      )}
      {(isMd || bottomTab === "dex") && (
        <div className="sm:!w-[clamp(38%,30rem,43%)] min-w-[23.75rem] w-full flex justify-center items-center h-full">
          <Swidget />
        </div>
      )}
      <div className="md:hidden w-full flex flex-row border-t border-primary-100 text-sm font-semibold">
        <button
          className={`basis-1/2 shrink-0 rounded py-2 ${
            bottomTab === "list"
              ? "bg-white/20 border border-t-none border-white/5"
              : ""
          }`}
          onClick={() => setBottomTab("list")}
        >
          List
        </button>
        <button
          className={`basis-1/2 shrink-0 rounded py-2 ${
            bottomTab === "dex"
              ? "bg-white/20 border border-t-none border-white/5"
              : ""
          }`}
          onClick={() => setBottomTab("dex")}
        >
          Dex
        </button>
      </div>
    </div>
  );
};
export default Swap;
