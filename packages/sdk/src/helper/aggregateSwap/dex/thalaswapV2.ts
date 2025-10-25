import {
  AptosScriptComposer,
  CallArgument,
} from "@aptos-labs/script-composer-sdk";
import { addressToObject } from "../utils";

const thalaSwapV2Contract =
  "0x7730cd28ee1cdc9e999336cbc430f99e7c44397c0aa77516f6f23a78559bb5";

/**
 * Thala Swap Exact In Stable
 * @param builder The builder of the transaction
 * @param poolId The pool ID
 * @param assetIn The input token
 * @param outMetaId The output token
 * @returns The output token
 */
export async function thalaSwapExactInStable(
  builder: AptosScriptComposer,
  poolId: string,
  assetIn: CallArgument,
  outMetaId: string
) {
  let outMeta = await addressToObject(
    builder,
    `0x1::fungible_asset::Metadata`,
    outMetaId
  );
  let ret = await builder.addBatchedCalls({
    function: `${thalaSwapV2Contract}::pool::swap_exact_in_stable`,
    typeArguments: [],
    functionArguments: [CallArgument.newSigner(0), poolId, assetIn, outMeta],
  });
  return ret[0];
}

/**
 * Thala Swap Exact In Meta
 * @param builder The builder of the transaction
 * @param poolId The pool ID
 * @param assetIn The input token
 * @param outMetaId The output token
 * @returns The output token
 */
export async function thalaSwapExactInMeta(
  builder: AptosScriptComposer,
  poolId: string,
  assetIn: CallArgument,
  outMetaId: string
) {
  let outMeta = await addressToObject(
    builder,
    `0x1::fungible_asset::Metadata`,
    outMetaId
  );
  let ret = await builder.addBatchedCalls({
    function: `${thalaSwapV2Contract}::pool::swap_exact_in_metastable`,
    typeArguments: [],
    functionArguments: [CallArgument.newSigner(0), poolId, assetIn, outMeta],
  });
  return ret[0];
}

/**
 * Thala Swap Exact Out Stable
 * @param builder The builder of the transaction
 * @param pool The pool
 * @param assetIn The input token
 * @param metadataOut The output token
 * @param amountOut The amount out
 * @returns The output token
 */
export async function swapExactOutStable(
  builder: AptosScriptComposer,
  pool: CallArgument,
  assetIn: CallArgument,
  metadataOut: CallArgument,
  amountOut: number
) {
  let ret = await builder.addBatchedCalls({
    function: `${thalaSwapV2Contract}::pool::swap_exact_out_stable`,
    typeArguments: [],
    functionArguments: [
      CallArgument.newSigner(0),
      pool,
      assetIn,
      metadataOut,
      amountOut,
    ],
  });
  return ret;
}

/**
 * Thala Swap Exact In Weighted
 * @param builder The builder of the transaction
 * @param poolId The pool ID
 * @param assetIn The input token
 * @param outMetaId The output token
 * @returns The output token
 */
export async function thalaSwapExactInWeighted(
  builder: AptosScriptComposer,
  poolId: string,
  assetIn: CallArgument,
  outMetaId: string
) {
  let ret = await builder.addBatchedCalls({
    function: `${thalaSwapV2Contract}::pool::swap_exact_in_weighted`,
    typeArguments: [],
    functionArguments: [CallArgument.newSigner(0), poolId, assetIn, outMetaId],
  });
  return ret[0];
}

/**
 * Thala Swap Exact Out Weighted
 * @param builder The builder of the transaction
 * @param pool The pool
 * @param assetIn The input token
 * @param metadataOut The output token
 * @param amountOut The amount out
 * @returns The output token
 */
export async function swapExactOutWeighted(
  builder: AptosScriptComposer,
  pool: CallArgument,
  assetIn: CallArgument,
  metadataOut: CallArgument,
  amountOut: number
) {
  let ret = await builder.addBatchedCalls({
    function: `${thalaSwapV2Contract}::pool::swap_exact_out_weighted`,
    typeArguments: [],
    functionArguments: [
      CallArgument.newSigner(0),
      pool,
      assetIn,
      metadataOut,
      amountOut,
    ],
  });
  return ret;
}
