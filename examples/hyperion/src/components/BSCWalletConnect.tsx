'use client'

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAccount, useDisconnect } from 'wagmi';
import { useAppKit } from '@reown/appkit/react'
import { Wallet, LogOut } from 'lucide-react';

export function BSCWalletConnect() {
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit()

  const handleConnect = () => {
    open()
  };

  const handleDisconnect = () => {
    disconnect();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          BSC Wallet Connection
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isConnected && address ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">Connected to BSC</div>
                <div className="text-sm text-gray-600">
                  {address.slice(0, 6)}...{address.slice(-4)}
                </div>
                {chain && (
                  <Badge variant="secondary" className="mt-1">
                    {chain.name}
                  </Badge>
                )}
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDisconnect}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Disconnect
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-sm text-gray-600">
              Connect your BSC wallet to interact with BSC chain
            </div>
            <Button 
              onClick={handleConnect} 
              className="w-full flex items-center gap-2"
            >
              <Wallet className="h-4 w-4" />
              Connect BSC Wallet
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}