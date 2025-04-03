import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const AptosClient = new Aptos(
  new AptosConfig({
    network: Network.TESTNET,
  })
);

export const copy = (text: string) => {
  navigator.clipboard.writeText(text);
  alert("Copied");
};
