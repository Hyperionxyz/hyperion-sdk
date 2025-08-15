import { APTOS_EID, BSC_ABI, BSC_CHAIN_ID, BSC_EID, TOKENS } from "./config";
import {
  InputGenerateTransactionPayloadData,
  InputViewFunctionData,
} from "@aptos-labs/ts-sdk";
import {
  calculateBridgeAmount,
  calculateSlippage,
  encodeBscRecipient,
} from "./utils";
import BigNumber from "bignumber.js";
BigNumber.config({ EXPONENTIAL_AT: 1e9 });

export { TOKENS } from "./config";
type BridgeDirection = "aptos-to-bsc" | "bsc-to-aptos";

type BridgeArgs = {
  token: BridgeToken;
  amount: number | string;
  sender: string;
  recipient: string;
};
interface BridgeIntermediateData {
  bscRecipientBytes?: number[];
  aptosRecipient?: string;
  bridgeAmount: string;
  slippageAmount: string;
}

export class HyperionBridge {
  tokens: BridgeToken[] = TOKENS;

  /**
   * Add a token to the bridge
   * @param token - The token to add
   */
  addToken(token: BridgeToken) {
    this.tokens.push(token);
  }

  private validateBridgeArgs(args: BridgeArgs): void {
    const { token, amount } = args;
    const errors: string[] = [];

    if (!token.chain.bsc.address) errors.push("BSC address is not set");
    if (!token.chain.aptos.address) errors.push("Aptos address is not set");
    if (!token.chain.aptos.oftContractAddress)
      errors.push("Aptos OFT contract address is not set");
    if (!args.sender) errors.push("Sender address is not set");
    if (!args.recipient) errors.push("Recipient address is not set");
    if (BigNumber(amount).lte(0)) errors.push("Amount must be greater than 0");

    if (errors.length > 0) throw new Error(errors.join(", "));
  }

  private prepareBridgeData(
    args: BridgeArgs,
    direction: BridgeDirection
  ): BridgeIntermediateData {
    const { recipient, amount, token } = args;

    let bridgeAmount;
    if (direction === "aptos-to-bsc") {
      bridgeAmount = calculateBridgeAmount(amount, token.chain.aptos.decimals);
    } else {
      bridgeAmount = calculateBridgeAmount(amount, token.chain.bsc.decimals);
    }

    return Object.assign(
      {
        bridgeAmount,
        slippageAmount: calculateSlippage(bridgeAmount),
      },
      direction === "aptos-to-bsc"
        ? {
            bscRecipientBytes: encodeBscRecipient(recipient),
          }
        : {
            aptosRecipient: recipient,
          }
    );
  }

  /**
   * Create a quote send payload for a token from Aptos to BSC
   * @param args.token - The token to bridge
   * @param args.amount - The amount of token to bridge
   * @param args.aptosSender - The Aptos sender address
   * @param args.bscRecipient - The BSC recipient address
   * @returns The quote send payload
   *
   * const bridge = new HyperionBridge();
   * const payload = await bridge.createQuoteSendPayloadFromAptosToBSC({
   *   token: TONES[0],
   *   amount: 100,
   *   sender: "aptos_account_address",
   *   recipient: "bsc_recipient_address",
   * });
   *
   * const quoteResult = await AptosClient.view({
   *   payload,
   * });
   * console.log(quoteResult); // [12345, 0]
   */
  createQuoteSendPayloadFromAptosToBSC(
    args: BridgeArgs
  ): InputViewFunctionData {
    this.validateBridgeArgs(args);

    const { token, sender } = args;
    const { bscRecipientBytes, bridgeAmount, slippageAmount } =
      this.prepareBridgeData(args, "aptos-to-bsc");

    return {
      function: `${token.chain.aptos.oftContractAddress}::oft::quote_send`,
      typeArguments: [],
      functionArguments: [
        sender,
        BSC_EID, // bsc eid,
        bscRecipientBytes,
        bridgeAmount, // bridge amount,
        slippageAmount,
        "",
        "",
        "",
        false,
      ],
    };
  }

  /**
   * Create a bridge payload for a token from Aptos to BSC
   * @param args - The bridge arguments
   * @param quoteResult - The quote result from the BSC to Aptos bridge
   * @returns The quote send payload
   *
   *
   * @example
   * const bridge = new HyperionBridge();
   * const quoteResult = await bridge.createQuoteSendPayloadFromAptosToBSC({
   *   token: TONES[0],
   *   amount: 100,
   *   sender: "aptos_account_address",
   *   recipient: "bsc_recipient_address",
   * });
   * const quoteResult = await AptosClient.view({
   *   payload,
   * });
   *
   * const bridgePayload = await bridge.createBridgePayloadFromAptosToBSC({
   *   token: TONES[0],
   *   amount: 100,
   *   sender: "aptos_account_address",
   *   recipient: "bsc_recipient_address",
   * }, quoteResult);
   *
   * const tx = await wallet.signAndSubmitTransaction({
   *   data: bridgePayload,
   * });
   * await AptosClient.waitForTransaction({
   *   transactionHash: tx.hash,
   * });
   * console.log(tx);
   */
  createBridgePayloadFromAptosToBSC(
    args: BridgeArgs,
    quoteResult: any[]
  ): InputGenerateTransactionPayloadData {
    this.validateBridgeArgs(args);

    const { token } = args;
    const { bscRecipientBytes, bridgeAmount, slippageAmount } =
      this.prepareBridgeData(args, "aptos-to-bsc");

    return {
      function: `${token.chain.aptos.oftContractAddress}::oft::send_withdraw`,
      typeArguments: [],
      functionArguments: [
        BSC_EID,
        bscRecipientBytes,
        bridgeAmount,
        slippageAmount, // min amount
        "", // extra options
        "", // message
        "", // cmd
        // executor + dvn fee
        quoteResult[0],
        // zero fee
        0,
      ],
    };
  }

  /**
   * Create a quote send payload for a token from BSC to Aptos
   * @param args.token - The token to bridge
   * @param args.amount - The amount of token to bridge
   * @param args.sender - The BSC sender address
   * @param args.recipient - The Aptos recipient address
   * @returns The quote send payload
   *
   * @example
   * const bridge = new HyperionBridge();
   * const quoteResult = await bridge.createQuoteSendPayloadFromBSCToAptos({
   *   token: TONES[0],
   *   amount: 100,
   *   sender: "bsc_sender_address",
   *   recipient: "aptos_recipient_address",
   * });
   */

  createQuoteSendPayloadFromBSCToAptos(args: BridgeArgs) {
    this.validateBridgeArgs(args);

    const { token, recipient } = args;
    const { bridgeAmount, slippageAmount } = this.prepareBridgeData(
      args,
      "bsc-to-aptos"
    );

    return {
      address: token.chain.bsc.address,
      abi: BSC_ABI,
      args: [
        [APTOS_EID, recipient, bridgeAmount, slippageAmount, "", "", ""],
        false,
      ],
      functionName: "quoteSend",
      chainId: BSC_CHAIN_ID,
    };
  }

  /**
   * Create a bridge payload for a token from BSC to Aptos
   * @param args.token - The token to bridge
   * @param args.amount - The amount of token to bridge
   * @param args.sender - The BSC sender address
   * @param args.recipient - The Aptos recipient address
   * @param quoteResult - The quote result from the BSC to Aptos bridge
   * @returns The bridge payload
   *
   * @example
   * const bridge = new HyperionBridge();
   * const quoteResult = await bridge.createQuoteSendPayloadFromBSCToAptos({
   *   token: TONES[0],
   *   amount: 100,
   *   sender: "bsc_sender_address",
   *   recipient: "aptos_recipient_address",
   * });
   * const bridgePayload = await bridge.createBridgePayloadFromBSCToAptos(TONES[0], quoteResult);
   *
   * const { data, writeContractAsync } = useWriteContract();
   * await writeContractAsync(bridgePayload);
   * console.log(data);
   */
  createBridgePayloadFromBSCToAptos(args: BridgeArgs, quoteResult: any) {
    this.validateBridgeArgs(args);

    const { token, recipient, sender } = args;
    const { bridgeAmount, slippageAmount } = this.prepareBridgeData(
      args,
      "bsc-to-aptos"
    );

    return {
      address: token.chain.bsc.address,
      abi: BSC_ABI,
      functionName: "send",
      args: [
        [
          APTOS_EID,
          recipient,
          BigInt(bridgeAmount),
          BigInt(slippageAmount),
          "",
          "",
          "",
        ],
        [BigInt(quoteResult.nativeFee), BigInt(quoteResult.lzTokenFee)],
        sender,
      ],
      chainId: BSC_CHAIN_ID,
      value: BigInt(quoteResult.nativeFee),
    };
  }
}
