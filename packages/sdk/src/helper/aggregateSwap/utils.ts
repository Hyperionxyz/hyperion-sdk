import {
  AptosScriptComposer,
  CallArgument,
} from "@aptos-labs/script-composer-sdk";
import { AGGREGATE_TOOL_CONTRACT_ADDRESS } from "./config";

/**
 * Zero Fungible Asset
 * @param builder The builder of the transaction
 * @param assetTypeString The type of the asset
 * @returns The zero asset
 */
export async function zeroFA(
  builder: AptosScriptComposer,
  assetTypeString: string
): Promise<CallArgument> {
  let assetMeta = await addressToObject(
    builder,
    "0x1::fungible_asset::Metadata",
    assetTypeString
  );
  let asset = await builder.addBatchedCalls({
    function: "0x1::fungible_asset::zero",
    typeArguments: ["0x1::fungible_asset::Metadata"],
    functionArguments: [assetMeta],
  });
  return asset[0];
}

/**
 * Extract Fungible Asset
 * @param builder The builder of the transaction
 * @param assetToSplit The asset to split
 * @param amount The amount to extract
 * @returns The extracted asset
 */
export async function extractFA(
  builder: AptosScriptComposer,
  assetToSplit: CallArgument,
  amount: number
): Promise<CallArgument> {
  let asset = await builder.addBatchedCalls({
    function: "0x1::fungible_asset::extract",
    typeArguments: [],
    functionArguments: [assetToSplit.borrowMut(), amount],
  });
  return asset[0];
}

/**
 * Merge Fungible Asset
 * @param builder The builder of the transaction
 * @param asset The asset to merge
 * @param assetToMerge The asset to merge
 * @returns The merged asset
 */
export async function mergeFA(
  builder: AptosScriptComposer,
  asset: CallArgument,
  assetToMerge: CallArgument
) {
  await builder.addBatchedCalls({
    function: "0x1::fungible_asset::merge",
    typeArguments: [],
    functionArguments: [asset.borrowMut(), assetToMerge],
  });
}

/**
 * Withdraw Fungible Asset
 * @param builder The builder of the transaction
 * @param metadata The metadata of the asset
 * @param amount The amount to withdraw
 * @returns The withdrawn asset
 */
export async function withdrawFA(
  builder: AptosScriptComposer,
  metadata: CallArgument,
  amount: number
): Promise<CallArgument> {
  let asset = await builder.addBatchedCalls({
    function: "0x1::primary_fungible_store::withdraw",
    typeArguments: ["0x1::fungible_asset::Metadata"],
    functionArguments: [CallArgument.newSigner(0), metadata, amount],
  });
  return asset[0];
}

/**
 * Deposit Fungible Asset
 * @param builder The builder of the transaction
 * @param receiver The receiver of the asset
 * @param fa The asset to deposit
 * @returns The deposited asset
 */
export async function depositFA(
  builder: AptosScriptComposer,
  receiver: CallArgument,
  fa: CallArgument
) {
  await builder.addBatchedCalls({
    function: "0x1::primary_fungible_store::deposit",
    typeArguments: [],
    functionArguments: [receiver, fa],
  });
}

/**
 * Amount Fungible Asset
 * @param builder The builder of the transaction
 * @param fa The asset to get the amount
 * @returns The amount of the asset
 */
export async function amountFA(
  builder: AptosScriptComposer,
  fa: CallArgument
): Promise<CallArgument> {
  let ret = await builder.addBatchedCalls({
    function: "0x1::fungible_asset::amount",
    typeArguments: [],
    functionArguments: [fa.borrow()],
  });
  return ret[0];
}

/**
 * Address to Object
 * @param builder The builder of the transaction
 * @param type The type of the object
 * @param objectAddress The address of the object
 * @returns The object
 */
export async function addressToObject(
  builder: AptosScriptComposer,
  type: string,
  objectAddress: string
): Promise<CallArgument> {
  const obj = await builder.addBatchedCalls({
    function: `0x1::object::address_to_object`,
    typeArguments: [type],
    functionArguments: [objectAddress],
  });
  return obj[0];
}

/**
 * Split Fungible Asset Proportionally
 * @param builder The builder of the transaction
 * @param fa The asset to split
 * @param amountIn The amount to split
 * @param percent The percentage to split
 * @returns The split asset
 */
export async function faSplitProportionally(
  builder: AptosScriptComposer,
  fa: CallArgument,
  amountIn: CallArgument,
  percent: number
): Promise<CallArgument> {
  const faSplitted = await builder.addBatchedCalls({
    function: `${AGGREGATE_TOOL_CONTRACT_ADDRESS}::tool::split_fa_proportionlly`,
    typeArguments: [],
    functionArguments: [fa.borrowMut(), amountIn, percent * 100],
  });
  return faSplitted[0];
}

/**
 * Amount Check Fungible Asset
 * @param builder The builder of the transaction
 * @param fa The asset to check the amount
 * @param amount The amount to check
 * @returns The checked amount
 */
export async function faAmountCheck(
  builder: AptosScriptComposer,
  fa: CallArgument,
  amount: number
) {
  await builder.addBatchedCalls({
    function: `${AGGREGATE_TOOL_CONTRACT_ADDRESS}::tool::fa_amount_check`,
    typeArguments: [],
    functionArguments: [fa.borrow(), amount],
  });
}

/**
 * Deposit Exact Fungible Asset
 * @param builder The builder of the transaction
 * @param receiver The receiver of the asset
 * @param fa The asset to deposit
 * @param amount The amount to deposit
 * @returns The deposited asset
 */
export async function depositExactFA(
  builder: AptosScriptComposer,
  receiver: CallArgument,
  fa: CallArgument,
  amount: number
) {
  await builder.addBatchedCalls({
    function: `${AGGREGATE_TOOL_CONTRACT_ADDRESS}::tool::deposit_fa_exact`,
    typeArguments: [],
    functionArguments: [receiver, fa.borrowMut(), amount],
  });
}

/**
 * Get Sender
 * @param builder The builder of the transaction
 * @returns The sender
 */
export async function getSender(
  builder: AptosScriptComposer
): Promise<CallArgument> {
  let sender = await builder.addBatchedCalls({
    function: `${AGGREGATE_TOOL_CONTRACT_ADDRESS}::tool::get_signer_address`,
    typeArguments: [],
    functionArguments: [CallArgument.newSigner(0)],
  });

  return sender[0];
}
