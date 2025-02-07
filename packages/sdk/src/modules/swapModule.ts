import { TokenPairs } from "aptos-tool";
import { HyperfluidSDK } from "..";
import { QuerySwapAmount } from "../config/queries/swap.query";
import { currencyCheck, slippageCalculator, slippageCheck } from "../utils";

export interface SwapTransactionPayloadArgs {
  currencyA: string;
  currencyB: string;
  currencyAAmount: number | string;
  currencyBAmount: number | string;
  slippage: number | string;
  poolRoute: string[];
  recipient: string;
}

export interface EstFromAmountArgs {
  amountIn: number | string;
  from: string;
  to: string;
}

export class Swap {
  protected _sdk: HyperfluidSDK;

  constructor(sdk: HyperfluidSDK) {
    this._sdk = sdk;
  }

  /**
   *
   * @param args.currencyA The FA address of currency
   * @param args.currencyB The FA address of currency
   */
  swapTransactionPayload(args: SwapTransactionPayloadArgs) {
    currencyCheck(args);
    slippageCheck(args);

    const currencyAddresses = [args.currencyA, args.currencyB];
    const currencyAmounts = [args.currencyAAmount, args.currencyBAmount];
    const afterSlippage = [
      currencyAmounts[0],
      slippageCalculator(currencyAmounts[1], args.slippage),
    ];

    const params = [
      args.poolRoute,
      ...currencyAddresses,
      ...afterSlippage,
      args.recipient,
    ];

    return TokenPairs.TokenPairTypeCheck(currencyAddresses, [
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_v3::swap_batch`,
        typeArguments: [],
        functionArguments: [...params],
      },
      // ================
      // if the from token is coin token
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_v3::swap_batch_coin_entry`,
        typeArguments: [currencyAddresses[0]],
        functionArguments: [...params],
      },

      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_v3::swap_batch_coin_entry`,
        typeArguments: [currencyAddresses[0]],
        functionArguments: [...params],
      },
      // ================
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_v3::swap_batch`,
        typeArguments: [],
        functionArguments: [...params],
      },
    ]);
  }

  async estFromAmount(args: EstFromAmountArgs) {
    const ret: any = await this._sdk.requestModule.queryIndexer({
      document: QuerySwapAmount,
      variables: {
        amountIn: args.amountIn.toString(),
        from: args.to,
        to: args.from,
      },
    });

    return ret?.api.getSwapInfo;
  }

  async estToAmount(args: EstFromAmountArgs) {
    const ret: any = await this._sdk.requestModule.queryIndexer({
      document: QuerySwapAmount,
      variables: {
        amountIn: args.amountIn.toString(),
        from: args.from,
        to: args.to,
      },
    });

    return ret?.api.getSwapInfo;
  }
}
