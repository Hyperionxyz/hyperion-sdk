import { Token, TokenPairs } from "aptos-tool";
import { HyperionSDK } from "..";
import { QuerySwapAmount } from "../config/queries/swap.query";
import { currencyCheck, slippageCalculator, slippageCheck } from "../utils";
import {
  AggregateSwapHelper,
  AggregateSwapRouteArgs,
} from "../helper/aggregateSwap";
import { AggregateSwapInfoResult } from "../helper/aggregateSwap/type";
import { AptosScriptComposer } from "@aptos-labs/script-composer-sdk";
import { Network } from "@aptos-labs/ts-sdk";

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
  protected _aggregateSwapHelper: AggregateSwapHelper;

  constructor(sdk: HyperionSDK) {
    this._sdk = sdk;
    this._aggregateSwapHelper = new AggregateSwapHelper(sdk);
  }

  /**
   * Generate the transaction payload for swap
   * @param args SwapTransactionPayloadArgs
   * @param args.currencyA The FA address of currency
   * @param args.currencyB The FA address of currency
   * @param args.currencyAAmount The amount of the input token
   * @param args.currencyBAmount The amount of the output token
   * @param args.slippage The slippage tolerance
   * @param args.poolRoute The pool route
   * @param args.recipient The recipient address
   * @returns The transaction payload for swap
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

  /**
   * Generate the transaction payload for swap with partnership
   * @param args SwapTransactionPayloadArgs & { partnership: string }
   * @param args.currencyA The FA address of currency
   * @param args.currencyB The FA address of currency
   * @param args.currencyAAmount The amount of the input token
   * @param args.currencyBAmount The amount of the output token
   * @param args.slippage The slippage tolerance
   * @param args.poolRoute The pool route
   * @param args.recipient The recipient address
   * @param args.partnership The partnership address
   * @returns
   */
  swapWithPartnershipTransactionPayload(
    args: SwapTransactionPayloadArgs & {
      partnership: string;
    }
  ) {
    currencyCheck(args);
    slippageCheck(args);

    if (!args.partnership || args.partnership.length === 0) {
      throw new Error("partnership is required");
    }

    const currencyAddresses = [args.currencyA, args.currencyB];
    const currencyAmounts = [args.currencyAAmount, args.currencyBAmount];
    const afterSlippage = [
      currencyAmounts[0],
      slippageCalculator(currencyAmounts[1], args.slippage),
    ];

    const payload = {
      function: `${this._sdk.sdkOptions.contractAddress}::partnership::swap_batch_directly_deposit`,
      typeArguments: [],
      functionArguments: [
        args.poolRoute,
        currencyAddresses[0],
        currencyAddresses[1],
        ...afterSlippage,
        args.partnership,
      ],
    };

    return payload;
  }

  /**
   * Estimate the amount of currency A from currency B
   * @param args EstFromAmountArgs
   * @param args.amount The amount of the input token
   * @param args.from The address of the input token
   * @param args.to The address of the output token
   * @param args.safeMode Whether to use safe mode, only work on MAINNET
   * @returns
   */
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

  /**
   * Estimate the amount of currency B from currency A
   * @param args EstFromAmountArgs
   * @param args.amount The amount of the input token
   * @param args.from The address of the input token
   * @param args.to The address of the output token
   * @param args.safeMode Whether to use safe mode, only work on MAINNET
   * @returns
   */
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

  /**
   * Estimate the amount of currency A from currency B by aggregate swap
   * @param args AggregateSwapRouteArgs
   * @param args.amount The amount of the input token
   * @param args.from The address of the input token
   * @param args.input The address of the input token, either equals to args.from or args.to
   * @param args.slippage The slippage tolerance
   * @param args.to The address of the output token
   * @returns The result of aggregate swap
   *
   * @example
   * ```ts
   * // Estimate the result of currency A from currency B by aggregate swap
   * const result = await SDK.Swap.estAmountByAggregateSwap({
   *   amount: "10000000",
   *   from: "A_AssetType",
   *   input: "B_AssetType",
   *   slippage: 0.1,
   *   to: "B_AssetType",
   * });
   * console.log(result);
   * ```
   *
   * or
   * ```ts
   * // Estimate the result of currency B from currency A by aggregate swap
   * const result = await SDK.Swap.estAmountByAggregateSwap({
   *   amount: "10000000",
   *   from: "B_AssetType",
   *   input: "A_AssetType",
   *   slippage: 0.1,
   *   to: "A_AssetType",
   * });
   * console.log(result);
   * ```
   */
  async estAmountByAggregateSwap(
    args: AggregateSwapRouteArgs
  ): Promise<AggregateSwapInfoResult> {
    if (this._sdk.sdkOptions.network !== Network.MAINNET) {
      throw new Error("Aggregate swap is only supported on MAINNET");
    }

    return await this._aggregateSwapHelper.fetchAggregateSwapRoute(args);
  }

  /**
   * Generate the transaction script for aggregate swap
   * @param args AggregateSwapRouteArgs
   * @param args.amount The amount of the input token
   * @param args.from The address of the input token
   * @param args.input The address of the input token, either equals to args.from or args.to
   * @param args.slippage The slippage tolerance
   * @param args.to The address of the output token
   * @param args.builder The builder of the transaction
   * @param args.partnershipId The partnership ID, only work on MAINNET
   * @returns The transaction script for aggregate swap
   */
  async generateAggregateSwapTransactionScript(
    args: AggregateSwapInfoResult & {
      builder: AptosScriptComposer;
      partnershipId?: string;
    }
  ) {
    if (this._sdk.sdkOptions.network !== Network.MAINNET) {
      throw new Error("Aggregate swap is only supported on MAINNET");
    }

    return await this._aggregateSwapHelper.generateAggregateSwapTransactionScript(
      args
    );
  }
}
