import React from "react";

const LoaderLine = () => {
  return (
    <div className="relative w-full h-[1px] overflow-hidden rounded-full">
      <div className="absolute left-[-50%] h-[2px] w-[20%] bg-[#d1dc09] rounded-full animate-lineAnim"></div>
    </div>
  );
};

export default LoaderLine;
