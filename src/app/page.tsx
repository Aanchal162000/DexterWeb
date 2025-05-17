"use client";

import Login from "../components/Login";
import Dashboard from "../components/Dashboard";
import { useLoginContext } from "../context/LoginContext";

export default function Home() {
  const { address } = useLoginContext();

  return address ? <Dashboard /> : <Login />;
}
