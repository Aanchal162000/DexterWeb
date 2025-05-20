/* eslint-disable react/no-unescaped-entities */
import React from "react";
import Form from "./Form";
import SupportContacts from "./SupportContacts";

export default function HelpCenter() {
  return (
    <div
      className={`w-full h-full overflow-y-auto lg:overflow-y-hidden lg:h-full flex-1 flex flex-row lg:px-14 sm:px-7 px-4 py-3 gap-4 items-center justify-between`}
    >
      {/* <div className="flex flex-col overflow-hidden h-full w-screen overflow-y-auto bg-black sm:py-2 py-10"> */}
      {/* <div className="relative shrink-0 screen-container min-h-full overflow-y-auto flex sm:flex-row flex-col overflow-hidden xl:text-lg w-full items-center justify-center px-[6%]"> */}
      <div className="sm:w-1/2 flex flex-col gap-3 m-auto">
        <h3 className="text-primary-100 xl:text-5xl sm:text-3xl text-2xl font-medium sm:text-left text-center">
          How can we help?
        </h3>
        <p className="mt-3 mb-2 md:mb-8 sm:text-lg text-white pb-5 w-full md:w-[72%] font-light sm:text-left text-center">
          Have a question or need some assistance? Drop us a message! We're here
          to ensure your zkCross Network experience is seamless and efficient.
          Let us help you navigate through DeFi.
        </p>
        <div className="md:block hidden">
          <SupportContacts />
        </div>
      </div>
      <Form dashboard="Arbitrum" />
      <div className="md:hidden block mt-20">
        <SupportContacts />
      </div>
    </div>
  );
}
