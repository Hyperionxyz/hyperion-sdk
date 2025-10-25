import {
  AptosScriptComposer,
  CallArgument,
} from "@aptos-labs/script-composer-sdk";
import { AGGREGATE_TOOL_CONTRACT_ADDRESS } from "../config";

/**
 * Emoji Swap
 * @param builder The builder of the transaction
 * @param firstType The first type of the swap
 * @param secondType The second type of the swap
 * @param tokenInput The input token
 * @param pool The pool of the swap
 * @param isSell Whether to sell the input token
 * @param integrator The integrator of the swap
 * @param integratorFee The integrator fee of the swap
 * @param abi The ABI of the contract
 * @returns The output token
 */
export async function emojiSwap(
  builder: AptosScriptComposer,
  firstType: string,
  secondType: string,
  tokenInput: CallArgument,
  pool: string,
  isSell: boolean,
  integrator: string,
  integratorFee: number
): Promise<CallArgument> {
  let ret = await builder.addBatchedCalls({
    function: `${AGGREGATE_TOOL_CONTRACT_ADDRESS}::tool::swap_in_emoji`,
    typeArguments: [firstType, secondType],
    functionArguments: [
      CallArgument.newSigner(0),
      pool,
      isSell,
      integrator,
      integratorFee,
      tokenInput,
    ],
  });
  return ret[1];
}
