import useDeviceSize from "@/hooks/useDeviceSize";
import React from "react";

export default function TextArea({
  value,
  onChange,
  label,
  name,
  placeholder,
  isMandatory = false,
}: any) {
  const [width] = useDeviceSize();
  return (
    <div className="border border-primary-100 bg-[#1A1D2180] backdrop-blur-sm] z-10 rounded pt-3 px-3 flex-col col-span-2">
      <p
        className={`flex flex-start text-lg font-bold text-white ${
          isMandatory ? "text-mandatory" : ""
        }`}
      >
        {label}
      </p>
      <textarea
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        rows={width < 768 && width > 0 ? 5 : 3}
        className="px-0 outline-none border-none placeholder-white/45 py-2 resize-none text-white bg-transparent flex flex-start w-full "
      />
    </div>
  );
}
