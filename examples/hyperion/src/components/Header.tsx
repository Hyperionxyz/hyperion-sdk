"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { copy } from "@/lib/utils";
import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react";
import { Utils } from "aptos-tool";
import { Copy, LogOut } from "lucide-react";
import { Badge } from "./ui/badge";
import { useAutoConnect } from "./AutoConnectProvider";
import Link from "next/link";
import { useEffect } from "react";

export function Header() {
  const { account, disconnect, connect, wallets } = useWallet();
  const { setAutoConnect } = useAutoConnect();

  // Enable auto-connect when user manually connects
  useEffect(() => {
    if (account?.address) {
      setAutoConnect(true);
    }
  }, [account?.address, setAutoConnect]);

  const handleDisconnect = () => {
    setAutoConnect(false);
    disconnect();
  };

  const handleConnect = async () => {
    try {
      console.log("Header: Attempting to connect wallet...");
      await connect("Petra" as WalletName);
      setAutoConnect(true);
      console.log("Header: Wallet connected successfully, autoConnect enabled");
    } catch (error) {
      console.error("Header: Failed to connect wallet:", error);
    }
  };

  return (
    <div className='flex flex-row justify-between items-center px-4 shadow-sm fixed w-full bg-white/40 backdrop-blur-sm h-[60px] top-0 z-[1]'>
      <div className='flex flex-row items-center gap-1'>
        <h1 className='text-2xl font-bold drop-shadow-[1px_-1px_white]'>
          Hyperion SDK Demo
        </h1>
        <Badge>Testnet</Badge>

        <ul className='ml-4'>
          <li>
            <Link href='/'>Home</Link>
          </li>
          <li>
            <Link href='/bridge'>Bridge</Link>
          </li>
        </ul>
      </div>

      <div className='py-3 font-semibold'>
        {account?.address ? (
          <div className='flex gap-2 items-center'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className='font-semibold'>
                  {Utils.ShortAddress(account?.address)}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className='text-xs'>
                <DropdownMenuItem onClick={() => copy(account?.address)}>
                  <Copy size={14} />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDisconnect}>
                  <LogOut size={14} />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button onClick={handleConnect}>Connect Wallet</Button>
        )}
      </div>
    </div>
  );
}
