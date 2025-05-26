import type { Metadata } from "next";

import "./globals.css";
import LoginProvider from "../context/LoginContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FiatProvider from "@/context/FiatContext";
import SwapProvider from "@/context/SwapContext";

export const metadata: Metadata = {
  title: "Dexter",
  description: "Dexter",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" href="/Trade/dexterLogo.png" />
      </head>
      <body className={` w-screen h-screen  antialiased`}>
        <LoginProvider>
          <SwapProvider>
            <FiatProvider>{children}</FiatProvider>
          </SwapProvider>
        </LoginProvider>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          toastStyle={{
            background: "rgba(21, 24, 27, 0.8)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(38, 252, 252, 0.1)",
            borderRadius: "0.4rem",
            top: "70px",
          }}
        />
      </body>
    </html>
  );
}
