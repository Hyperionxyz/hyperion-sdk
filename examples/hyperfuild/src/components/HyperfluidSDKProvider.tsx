"use client";

import { Network } from "@aptos-labs/ts-sdk";
import { HyperfluidSDK, initHyperfluidSDK } from "@hyperfluid/sdk";
import { createContext, useContext } from "react";

export interface HyperfluidSDKContextState {
  SDK: HyperfluidSDK;
}

export const HyperfluidSDKContext = createContext<HyperfluidSDKContextState>(
  {} as HyperfluidSDKContextState
);

export function useHyperfluidSDK(): HyperfluidSDKContextState {
  return useContext(HyperfluidSDKContext);
}

export const HyperfluidSDKProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const SDK = initHyperfluidSDK({
    network: Network.TESTNET,
  });

  return (
    <HyperfluidSDKContext.Provider value={{ SDK }}>
      {children}
    </HyperfluidSDKContext.Provider>
  );
};
