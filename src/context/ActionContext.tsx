"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface ActionContextType {
    authToken: string;
    setAuthToken: (token: string) => void;
}

const ActionContext = createContext<ActionContextType | undefined>(undefined);

export const ActionProvider = ({ children }: { children: ReactNode }) => {
    const [authToken, setAuthTokenState] = useState("");

    const setAuthToken = async (token: string): Promise<void> => {
        setAuthTokenState(token);
        sessionStorage.setItem("dexter:authToken", token);
    };

    useEffect(() => {
        const token = sessionStorage.getItem("dexter:authToken");
        if (token) {
            setAuthTokenState(token);
        }
    }, []);

    return <ActionContext.Provider value={{ authToken, setAuthToken }}>{children}</ActionContext.Provider>;
};

export const useActionContext = () => {
    const context = useContext(ActionContext);
    if (context === undefined) {
        throw new Error("useActionContext must be used within a ActionProvider");
    }
    return context;
};
