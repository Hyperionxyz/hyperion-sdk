"use client";

import { Network } from "@aptos-labs/ts-sdk";
import { HyperionSDK, initHyperionSDK } from "@hyperion/sdk";
import { createContext, useContext } from "react";

export interface HyperionSDKContextState {
  SDK: HyperionSDK;
}

export const HyperionSDKContext = createContext<HyperionSDKContextState>(
  {} as HyperionSDKContextState
);

export function useHyperionSDK(): HyperionSDKContextState {
  return useContext(HyperionSDKContext);
}

export const HyperionSDKProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const SDK = initHyperionSDK({
    network: Network.TESTNET,
  });

  return (
    <HyperionSDKContext.Provider value={{ SDK }}>
      {children}
    </HyperionSDKContext.Provider>
  );
};
