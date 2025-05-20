/* eslint-disable react/no-unescaped-entities */
import React from "react";

export default function SuccessModal({ isOpen, onClose }: any) {
  if (!isOpen) return <></>;
  return (
    <div className="fixed flex items-center justify-center w-full h-full bg-black/10 !z-[100] p-[7%] backdrop-blur-sm inset-0 ">
      <div className="text-white md:w-[700px] sm:w-[600px] w-[90vw] h-fit rounded-lg bg-[#171717] flex items-center justify-center flex-col p-8 shadow-lg border-[#474747] border">
        <h2 className="text-lg md:text-2xl font-semibold text-center flex items-center gap-2 sm:flex-row flex-col">
          {/* <img src="/images/tickmark.svg" className="h-9 inline-flex" alt="success-tick" /> */}
          Message Submitted Successfully
        </h2>
        <hr className="w-full mt-6 border-b border-[#474747]" />
        <div className="text-base md:text-xl font-semibold text-center my-4 opacity-90">Thank you for reaching out!</div>
        <p className="text-sm md:text-base text-center mb-2">
          We're experiencing a high volume of enquiries and are doing our best to respond promptly. Rest assured. Your
          request is important to us.
        </p>
        <p className="text-sm md:text-base text-center md:px-[%]">
          To expedite our response time, we kindly ask that you refrain from sending multiple queries for the same issue
          or contacting our partners who cannot assist with your zkCross-managed DeFi protocols.
        </p>
        <p className="text-sm md:text-base text-center mt-2">
          We value your patience and are eager to assist you soon!
        </p>

        <button
          className="w-[220px] py-2 rounded font-semibold hover:bg-[#216bff] transition-all duration-300 bg-[#0052ff] mt-8 mb-2"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
