'use client'

import { useAutoConnect } from "./AutoConnectProvider";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Badge } from "./ui/badge";

export function AutoConnectStatus() {
  const { autoConnect } = useAutoConnect();
  const { account, connected } = useWallet();

  if (process.env.NODE_ENV !== 'development') {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 p-3 bg-white/90 backdrop-blur rounded-lg border text-xs space-y-1 z-50">
      <div className="font-semibold">Aptos Wallet Status</div>
      <div className="flex items-center gap-2">
        <span>Auto Connect:</span>
        <Badge variant={autoConnect ? "default" : "secondary"}>
          {autoConnect ? "ON" : "OFF"}
        </Badge>
      </div>
      <div className="flex items-center gap-2">
        <span>Connected:</span>
        <Badge variant={connected ? "default" : "destructive"}>
          {connected ? "YES" : "NO"}
        </Badge>
      </div>
      {account?.address && (
        <div className="text-gray-600">
          Address: {account.address.slice(0, 8)}...
        </div>
      )}
    </div>
  );
}