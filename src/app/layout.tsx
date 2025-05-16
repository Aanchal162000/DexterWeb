import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LoginProvider } from "../context/LoginContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: "Dexter",
  description: "Dexter",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={` w-screen h-screen ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LoginProvider>{children}</LoginProvider>
      </body>
    </html>
  );
}
