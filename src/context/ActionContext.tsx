"use client";

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { actionService } from "@/services/contract/actionService";

interface ActionContextType {
  authToken: string;
  setAuthToken: (token: string) => void;
  totalStaked: string;
  calculateTotalStaked: () => Promise<void>;
}

const ActionContext = createContext<ActionContextType | undefined>(undefined);

export const ActionProvider = ({ children }: { children: ReactNode }) => {
  const [authToken, setAuthTokenState] = useState("");
  const [totalStaked, setTotalStaked] = useState("0");

  const setAuthToken = async (token: string): Promise<void> => {
    setAuthTokenState(token);
    sessionStorage.setItem("dexter:authToken", token);
  };

  const calculateTotalStaked = async (): Promise<void> => {
    if (!authToken) return;

    try {
      const response = await actionService.getUserLoops(
        { page: "1", limit: "100" },
        authToken
      );
      if (response.success && response.data) {
        const activeLoops = response.data.filter(
          (loop) => loop.status === "active"
        );
        const total = activeLoops.reduce((sum, loop) => {
          return sum + parseFloat(loop.maxVolume);
        }, 0);
        setTotalStaked(total.toString());
      }
    } catch (error) {
      console.error("Error calculating total staked:", error);
    }
  };

  useEffect(() => {
    const token = sessionStorage.getItem("dexter:authToken");
    if (token) {
      setAuthTokenState(token);
    }
  }, []);

  useEffect(() => {
    if (authToken) {
      calculateTotalStaked();
    }
  }, [authToken]);

  return (
    <ActionContext.Provider
      value={{
        authToken,
        setAuthToken,
        totalStaked,
        calculateTotalStaked,
      }}
    >
      {children}
    </ActionContext.Provider>
  );
};

export const useActionContext = () => {
  const context = useContext(ActionContext);
  if (context === undefined) {
    throw new Error("useActionContext must be used within a ActionProvider");
  }
  return context;
};
