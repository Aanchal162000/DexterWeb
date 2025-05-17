"use client";

import React from "react";
import { useLoginContext } from "../context/LoginContext";
import Footer from "./common/Footer";
import Image from "next/image";
import Header from "./common/Header";
import Swap from "./Swap/Swap";

const Dashboard = () => {
  const { address } = useLoginContext();

  return (
    <div className="relative h-full w-full">
      <div className="absolute h-full w-full !bg-[url('/Trade/background.png')] bg-[position:30%] bg-[size:cover] bg-[repeat:no-repeat] z-10 p-5 after:content-[''] after:absolute after:top-0 after:left-0 after:w-full after:h-full after:shadow-[0px_0px_0px_9999px_rgba(0,0,0,0.68)]"></div>

      <div className="relative flex flex-col z-20 w-full h-[calc(100vh-6.8vh)]">
        <Header />
        <Swap />
      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
