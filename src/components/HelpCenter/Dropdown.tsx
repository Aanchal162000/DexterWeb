/* eslint-disable @next/next/no-img-element */
import useClickOutside from "@/hooks/useClickOutside";
import React, { useRef, useState } from "react";

function OutsideAlerter(props: any) {
  const wrapperRef = useRef(null);
  useClickOutside(wrapperRef, props.func);

  return (
    <div ref={wrapperRef} style={props.style} className={props.className}>
      {props.children}
    </div>
  );
}

export default function Dropdown({
  label,
  name,
  value,
  placeholder,
  onChange,
  options,
  dropName,
  isMandatory = false,
  isDisabled = false,
}: any) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div className="border border-primary-100 rounded bg-[#1A1D2180] backdrop-blur-sm] z-20 pt-3 px-3 flex-col sm:col-span-1 col-span-2">
      <p
        className={`flex flex-start text-lg font-bold text-white ${
          isMandatory ? "text-mandatory" : ""
        }`}
        id={name}
      >
        {label}
      </p>
      <div
        className={`px-0 outline-none border-none py-2 text-white bg-transparent w-full flex flex-row items-center justify-between ${
          isDisabled ? "cursor-not-allowed" : "cursor-pointer"
        } relative`}
        onClick={() => !isDisabled && setIsDropdownOpen(!isDropdownOpen)}
      >
        <p className={`m-0 ${value ? "text-white" : "text-white/45"}`}>
          {value ? value : placeholder}
        </p>
        <img
          src="/Login/down.svg"
          alt="down icon"
          style={{ width: "12px", height: "12px" }}
          className={`invert filter transition-all duration-300 ${
            isDropdownOpen ? "rotate-180" : "rotate-0"
          }`}
        />
        {isDropdownOpen && (
          <OutsideAlerter
            //@ts-ignore
            func={() => setIsDropdownOpen(false)}
            className="absolute top-[40px] left-0 border-primary-100/70 w-full z-20 overflow-hidden text-base shadow-md ring-1 ring-primary-100/70 focus:outline-none bg-black/25 text-white drop-shadow-xl backdrop-blur-sm rounded font-medium"
          >
            {options.map((option: any, index: React.Key | null | undefined) => (
              <div
                className="text-white hover:bg-blue-800 px-4 py-3"
                key={index}
                style={{ margin: 0 }}
                onClick={() => {
                  onChange(option);
                  setIsDropdownOpen(false);
                }}
              >
                {dropName(option)}
              </div>
            ))}
          </OutsideAlerter>
        )}
      </div>
    </div>
  );
}
