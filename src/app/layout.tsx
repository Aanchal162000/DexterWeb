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
          theme="light"
        />
      </body>
    </html>
  );
}
