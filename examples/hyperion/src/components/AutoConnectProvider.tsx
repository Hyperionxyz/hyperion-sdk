"use client";

import {
  FC,
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AUTO_CONNECT_LOCAL_STORAGE_KEY = "AptosWalletAutoConnect";

export interface AutoConnectContextState {
  autoConnect: boolean;
  setAutoConnect(autoConnect: boolean): void;
}

export const AutoConnectContext = createContext<AutoConnectContextState>(
  {} as AutoConnectContextState
);

export function useAutoConnect(): AutoConnectContextState {
  return useContext(AutoConnectContext);
}

export const AutoConnectProvider: FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [autoConnect, setAutoConnect] = useState(true);

  useEffect(() => {
    // Wait until the app hydrates before populating `autoConnect` from local storage
    const initializeAutoConnect = () => {
      try {
        const isAutoConnect = localStorage.getItem(
          AUTO_CONNECT_LOCAL_STORAGE_KEY
        );
        if (isAutoConnect) {
          setAutoConnect(JSON.parse(isAutoConnect));
        } else {
          // Default to false if no preference is stored
          setAutoConnect(false);
        }
      } catch (e) {
        console.error("Error reading autoConnect from localStorage:", e);
        setAutoConnect(false);
      }
    };

    // Only run on client side
    if (typeof window !== "undefined") {
      initializeAutoConnect();
    }
  }, []);

  useEffect(() => {
    try {
      if (!autoConnect) {
        localStorage.removeItem(AUTO_CONNECT_LOCAL_STORAGE_KEY);
        console.log("AutoConnect: Disabled and removed from localStorage");
      } else {
        localStorage.setItem(
          AUTO_CONNECT_LOCAL_STORAGE_KEY,
          JSON.stringify(autoConnect)
        );
        console.log("AutoConnect: Enabled and saved to localStorage");
      }
    } catch (error: any) {
      if (typeof window !== "undefined") {
        console.error("AutoConnect localStorage error:", error);
      }
    }
  }, [autoConnect]);

  return (
    <AutoConnectContext.Provider value={{ autoConnect, setAutoConnect }}>
      {children}
    </AutoConnectContext.Provider>
  );
};
