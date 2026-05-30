"use client";

import { HyperionSDKProvider } from "@/components/HyperionSDKProvider";
import { WagmiProviderWrapper } from "@/components/providers/WagmiProvider";
import { PropsWithChildren, useEffect, useState } from "react";
import { Toaster } from "sonner";
import { AutoConnectProvider } from "./AutoConnectProvider";
import { WalletProvider } from "./WalletProvider";

export function ClientProviders({ children }: PropsWithChildren) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <HyperionSDKProvider>
      <AutoConnectProvider>
        <WagmiProviderWrapper>
          <WalletProvider>{children}</WalletProvider>
        </WagmiProviderWrapper>
      </AutoConnectProvider>
      <Toaster />
    </HyperionSDKProvider>
  );
}
