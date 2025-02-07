"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useWallet, WalletName } from "@aptos-labs/wallet-adapter-react";
import { Utils } from "aptos-tool";
import { Copy, LogOut } from "lucide-react";
import { Badge } from "./ui/badge";

export function Header() {
  const { account, disconnect, connect, wallets } = useWallet();

  return (
    <div className='flex flex-row justify-between items-center px-4 shadow-sm fixed w-full bg-white/40 backdrop-blur-sm h-[60px] top-0 z-1'>
      <div className='flex flex-row items-center gap-1'>
        <h1 className='text-2xl font-bold drop-shadow-[1px_-1px_white]'>
          Hyperfluid SDK Demo
        </h1>
        <Badge>Testnet</Badge>
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
                <DropdownMenuItem>
                  <Copy size={14} />
                  Copy Address
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => disconnect()}>
                  <LogOut size={14} />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <Button onClick={() => connect("Petra" as WalletName)}>
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  );
}
