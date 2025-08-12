import BigNumber from "bignumber.js";
import { Token } from "aptos-tool";

export function encodeBscRecipient(recipient: string): number[] {
  return Array.from(
    Buffer.from(recipient.replace("0x", "").padStart(64, "0"), "hex")
  );
}

export function calculateBridgeAmount(
  amount: number,
  decimals: number
): string {
  return Token.amountInUnit(amount, decimals).toString();
}

export function calculateSlippage(amount: string): string {
  return new BigNumber(amount).multipliedBy(0.99).dp(0).toString();
}
