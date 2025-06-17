"use client";

import Login from "../components/Login";
import Dashboard from "../components/Dashboard";
import { useLoginContext } from "../context/LoginContext";

export default function Home() {
  const { isWhitelisted } = useLoginContext();

  return isWhitelisted ? <Dashboard /> : <Login />;
}
