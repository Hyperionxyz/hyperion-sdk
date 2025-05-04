import { Token, TokenPairs } from "aptos-tool";
import { HyperionSDK } from "..";
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
  amount: number | string;
  from: string;
  to: string;
  // Only work on MAINNET
  safeMode?: boolean;
}

export class Swap {
  protected _sdk: HyperionSDK;

  constructor(sdk: HyperionSDK) {
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

    // replace coin to fa
    const argumentsAddresses = [...currencyAddresses];
    argumentsAddresses.forEach((addr: string, index: number) => {
      if (addr?.indexOf("::") > -1) {
        const token = new Token({
          coinType: addr,
          // for construct Token instance, useless & meaningless
          name: "token",
          symbol: "token",
          decimals: 5,
          assetType: "",
        });
        token.faTypeCalculate();
        if (token.faType) {
          argumentsAddresses[index] = token.faType;
        }
      }
    });

    const params = [
      args.poolRoute,
      ...argumentsAddresses,
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
        amount: args.amount.toString(),
        from: args.from,
        to: args.to,
        safeMode: args.safeMode,
        flag: "out",
      },
    });

    return ret?.api.getSwapInfo;
  }

  async estToAmount(args: EstFromAmountArgs) {
    const ret: any = await this._sdk.requestModule.queryIndexer({
      document: QuerySwapAmount,
      variables: {
        amount: args.amount.toString(),
        from: args.from,
        to: args.to,
        safeMode: args.safeMode,
        flag: "in",
      },
    });

    return ret?.api.getSwapInfo;
  }
}
