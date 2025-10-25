import {
  AptosScriptComposer,
  CallArgument,
} from "@aptos-labs/script-composer-sdk";

const cellanaConatract =
  "0x4bf51972879e3b95c4781a5cdcb9e1ee24ef483e7d22f2d903626f126df62bd1";

/**
 * Cellana Swap
 * @param builder The builder of the transaction
 * @param assetIn The input token
 * @param outMetaId The output token
 * @param stable Whether the swap is stable
 * @returns The output token
 */
export async function cellanaSwap(
  builder: AptosScriptComposer,
  assetIn: CallArgument,
  outMetaId: string,
  stable: boolean
): Promise<CallArgument> {
  let ret = await builder.addBatchedCalls({
    function: `${cellanaConatract}::router::swap`,
    typeArguments: [],
    functionArguments: [assetIn, 0, outMetaId, stable],
  });
  return ret[0];
}
