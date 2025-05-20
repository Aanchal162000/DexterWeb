import React from "react";

export default function Input({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  isMandatory = false,
  singleLine = false,
}: any) {
  return (
    <div
      className={`border border-primary-100 backdrop-blur-sm bg-[#1A1D2180] z-10 rounded pt-3 px-3 flex w-full flex-col col-span-2 ${
        singleLine ? "sm:col-span-2" : "sm:col-span-1"
      }`}
    >
      <p
        className={`flex flex-start text-lg font-bold text-white ${
          isMandatory ? "text-mandatory" : ""
        }`}
      >
        {label}
      </p>
      <input
        placeholder={placeholder}
        name={name}
        value={value}
        type={type}
        onChange={onChange}
        className="px-0 outline-none border-none !bg-none placeholder-white/45 py-1 text-white bg-transparent flex flex-start w-full mb-2 autofill:transition-colors autofill:duration-[5000000ms]"
      />
    </div>
  );
}
