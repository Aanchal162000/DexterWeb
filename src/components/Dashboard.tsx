"use client";

import { useLogin } from "../context/LoginContext";
import Footer from "./common/Footer";
import Image from "next/image";

const Dashboard = () => {
  const { user, logout } = useLogin();
  const features = [
    {
      title: "Virtual Sniper",
      description: `Snipe new token launches\nat exhilarating speeds with superior execution`,
    },
    {
      title: "Smart Alerts",
      description: `Get notified of on-chain\nevents that drive market movements`,
    },
    {
      title: "Universal Swap",
      description: `Seamlessly swap assets\nacross multiple leading blockchains`,
    },
  ];

  return (
    <div className="relative h-full w-full">
      <div className="absolute h-full w-full !bg-[url('/Dashboard/background.png')] bg-[position:30%] bg-[size:cover] bg-[repeat:no-repeat] z-10 p-5 after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:shadow-[0px_0px_0px_9999px_rgba(0,0,0,0.68)]"></div>
      <div className="relative z-20 w-full h-[calc(100vh-6.8vh)] px-14  flex flex-col">
        <div className="flex py-4">
          <Image
            src="/Dashboard/logo.png"
            alt="Dexter"
            height={135}
            width={150}
          />
        </div>
        <div className="relative w-full flex-1 flex flex-col space-y-10 items-center justify-center ">
          <div className="relative flex flex-col space-y-4 w-full">
            <h1 className="text-start text-primary-100 text-7xl font-bold">
              DEXTER'S LAB
            </h1>
            <p className="text-[#e4e8ea] text-base  font-normal tracking-widest leading-[20px]">
              The all-in-one platform to elevate your trading and asset <br />
              management: Dexter provides a powerful set of tools to <br />
              maximize Defi opportunities on any chain
            </p>
          </div>
          <div className="relative flex flex-col space-y-4 w-full">
            <h1 className="text-start text-[#e4e8ea] text-2xl font-bold">
              How it works
            </h1>
            <div className="relative flex flex-row space-x-4  w-full">
              {features.map((box, index) => (
                <div
                  key={index}
                  className="relative p-0.5 w-[230px] h-[160px] rounded-4xl before:absolute before:inset-0 before:p-[1px] before:rounded-lg before:bg-gradient-to-tl before:from-[#465e64] before:via-[#00f0ff] before:to-[#00cfff] before:-z-10 before:content-[''] after:absolute after:inset-[1px] after:rounded-lg after:bg-black/40 after:-z-10 after:content-['']"
                >
                  <div className="relative w-full h-full  bg-[#041820] rounded-lg items-center justify-start p-4">
                    <h3 className="text-primary-100 text-base font-normal mb-2">
                      0{index + 1}
                    </h3>
                    <h3 className="text-primary-100 text-base font-semibold mb-2">
                      {box.title}
                    </h3>
                    <p
                      className="text-[#e4e8ea] font-semibold text-sm"
                      style={{ whiteSpace: "pre-line" }}
                    >
                      {box.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative w-full flex flex-start">
            <button className="py-4 px-24 bg-primary-100 text-black text-base text-center font-bold rounded-lg">
              Enter Lab
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
