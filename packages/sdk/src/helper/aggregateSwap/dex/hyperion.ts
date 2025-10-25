import {
  AptosScriptComposer,
  CallArgument,
} from "@aptos-labs/script-composer-sdk";
import { amountFA, depositFA } from "../utils";
import { SDKOptions } from "../../../";
import { AGGREGATOR_PARTNER_NAME } from "../config";

/**
 * Hyperion Swap FA to FA
 * @param builder The builder of the transaction
 * @param sender The sender of the transaction
 * @param poolId The pool ID
 * @param a2b The direction of the swap
 * @param byAmountIn Whether to use the amount in
 * @param faIn The input token
 * @param sqrtPriceLimit The sqrt price limit
 * @param options The options of the SDK
 * @param partnershipId The partnership ID, only work on MAINNET
 * @returns The output token
 */
export async function hyperionSwapFAToFA(
  builder: AptosScriptComposer,
  sender: CallArgument,
  poolId: string,
  a2b: boolean,
  byAmountIn: boolean,
  faIn: CallArgument,
  sqrtPriceLimit: number | string,
  options: SDKOptions,
  partnershipId?: string
): Promise<CallArgument> {
  let amount = await amountFA(builder, faIn);
  let ret = await builder.addBatchedCalls({
    function: `${options.contractAddress}::partnership::swap`,
    typeArguments: [],
    functionArguments: [
      poolId,
      a2b,
      byAmountIn,
      amount,
      faIn,
      sqrtPriceLimit,
      partnershipId || AGGREGATOR_PARTNER_NAME,
    ],
  });

  await depositFA(builder, sender, ret[1]);
  return ret[2];
}
