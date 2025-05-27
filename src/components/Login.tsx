"use client";

import { RiTelegram2Fill } from "react-icons/ri";
import { RiTwitterXLine } from "react-icons/ri";
import Link from "next/link";
import { useLoginContext } from "../context/LoginContext";
import Footer from "./common/Footer";
import Image from "next/image";

const Login = () => {
  const { connectWallet, address, loading } = useLoginContext();

  const handleEnterLab = async () => {
    await connectWallet("Metamask");
  };
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
    <div className="relative h-full w-full font-grotesk bg-[linear-gradient(to_bottom,#000A10_70%,#000_90%)] overflow-hidden">
      <div className="absolute sm:h-full h-[60vh] w-full !bg-[url('/Login/background.png')] bg-[position:100%_10%] sm:bg-[position:30%] bg-[size:cover] bg-[repeat:no-repeat] z-10 p-5"></div>
      <div className="relative z-20 w-full h-[calc(100vh-6.8vh)] overflow-y-auto px-4 md:px-14 flex flex-col">
        <div className="flex py-4">
          <div className="flex flex-row gap-2 justify-center items-center text-center  ">
            <Image src="/Login/webLogo.png" alt="Dexter" height={32} width={32} className="sm:size-8 size-6" />
            <h3 className="sm:text-[2.27rem] sm:leading-[2.7rem] text-2xl text-white  font-bold font-grotesk">DEXTER</h3>
          </div>
          <div className="relative sm:hidden flex-row gap-3 flex ml-auto items-center">
            <Link key="Twitter" href="">
              <RiTwitterXLine className="text-primary-100 size-6" />
            </Link>
            <Link key="Telegram" href="">
              <RiTelegram2Fill className="text-primary-100 size-6" />
            </Link>
          </div>
        </div>
        <div className="relative w-full flex-1 flex flex-col sm:pt-0 xs:pt-[30vh] pt-[20vh] space-y-6 md:space-y-10 items-center justify-center">
          <div className="relative flex flex-col space-y-6 w-full">
            <h1 className="sm:text-start text-center text-primary-100 sm:text-4xl text-6xl md:text-8xl font-bold">DEXTER'S LAB</h1>
            <p className="text-[#e4e8ea] text-sm md:text-xl md:text-start text-center font-medium tracking-widest sm:leading-5">
              The all-in-one platform to elevate your trading and asset
              <br className="hidden sm:block" />
              management: Dexter provides a powerful set of tools to maximize
              <br className="hidden sm:block" />
              Defi opportunities on any chain
            </p>
          </div>
          <div className="relative flex flex-col space-y-5 w-full sm:pt-8">
            <h1 className="sm:text-start text-center text-[#e4e8ea] text-xl md:text-3xl font-bold">How it works</h1>
            <div className="relative flex flex-row sm:flex-nowrap flex-wrap gap-x-3 gap-y-4 md:gap-y-0 md:gap-x-4 w-full">
              {features.map((box, index) => (
                <div
                  key={index}
                  className="relative p-0.5 w-[48%] h-auto xs:w-[31%] md:w-[240px] xs:mx-0 mx-auto sm:h-[156px] before:absolute before:inset-0 before:p-[1px] sm:before:rounded-3xl before:rounded-xl before:bg-gradient-to-tl before:from-[#465e64] before:via-[#00f0ff] before:to-[#00cfff] before:-z-10 before:content-[''] after:absolute after:inset-[1px] after:rounded-3xl after:bg-black/40 after:-z-10 after:content-['']"
                >
                  <div className="relative w-full h-full bg-[#041820] sm:rounded-3xl rounded-xl items-center justify-start sm:p-5 p-2.5">
                    <h3 className="text-primary-100 sm:text-lg text-base font-normal mb-2">0{index + 1}</h3>
                    <h3 className="text-primary-100 sm:text-lg text-xs font-bold mb-2">{box.title}</h3>
                    <p className="text-[#e4e8ea] font-semibold sm:text-base text-[0.6875rem] leading-5" style={{ whiteSpace: "pre-line" }}>
                      {box.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative sm:w-full w-[50%] flex justify-center md:justify-start sm:pt-0 pt-4 pb-8">
            <button
              className="w-full md:w-auto py-4 px-8 md:px-24 bg-primary-100 text-black text-base sm:text-xl text-center font-bold sm:rounded-xl rounded-lg hover:shadow-lg shadow-primary-100/20 transition-all duration-300"
              onClick={handleEnterLab}
            >
              {loading ? (
                <div className="flex flex-row space-x-2 items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Connecting...
                </div>
              ) : (
                <>Enter Lab</>
              )}
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
