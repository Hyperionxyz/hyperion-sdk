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

/**
 * Arguments for swap transaction payload
 */
export interface SwapTransactionPayloadArgs {
  /** Currency A address */
  currencyA: string;
  /** Currency B address */
  currencyB: string;
  /** Amount of currency A */
  currencyAAmount: number | string;
  /** Amount of currency B */
  currencyBAmount: number | string;
  /** Slippage tolerance */
  slippage: number | string;
  /** Pool route array */
  poolRoute: string[];
  /** Recipient address */
  recipient: string;
}

/**
 * Arguments for estimating amount from a given amount
 */
export interface EstFromAmountArgs {
  /** Input amount */
  amount: number | string;
  /** Source token address */
  from: string;
  /** Target token address */
  to: string;
  /** Safe mode flag - only works on MAINNET */
  safeMode?: boolean;
}

/**
 * Swap module for token swapping functionality
 *
 * Provides methods for creating swap transactions, estimating swap amounts,
 * and handling aggregate swaps across multiple pools
 */
export class Swap {
  /** SDK instance */
  protected _sdk: HyperionSDK;
  /** Aggregate swap helper instance */
  protected _aggregateSwapHelper: AggregateSwapHelper;

  constructor(sdk: HyperionSDK) {
    this._sdk = sdk;
    this._aggregateSwapHelper = new AggregateSwapHelper(sdk);
  }

  /**
   * Generate the transaction payload for swap
   *
   * @param {SwapTransactionPayloadArgs} args - Swap arguments
   * @param {string} args.currencyA - The FA address of currency A
   * @param {string} args.currencyB - The FA address of currency B
   * @param {number|string} args.currencyAAmount - The amount of the input token
   * @param {number|string} args.currencyBAmount - The amount of the output token
   * @param {number|string} args.slippage - The slippage tolerance
   * @param {string[]} args.poolRoute - The pool route
   * @param {string} args.recipient - The recipient address
   * @returns {Object} The transaction payload for swap
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
   *
   * @param {SwapTransactionPayloadArgs & { partnership: string }} args - Swap arguments with partnership
   * @param {string} args.currencyA - The FA address of currency A
   * @param {string} args.currencyB - The FA address of currency B
   * @param {number|string} args.currencyAAmount - The amount of the input token
   * @param {number|string} args.currencyBAmount - The amount of the output token
   * @param {number|string} args.slippage - The slippage tolerance
   * @param {string[]} args.poolRoute - The pool route
   * @param {string} args.recipient - The recipient address
   * @param {string} args.partnership - The partnership address
   * @returns {Object} The transaction payload for swap with partnership
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
   *
   * @param {EstFromAmountArgs} args - Estimation arguments
   * @param {number|string} args.amount - The amount of the input token
   * @param {string} args.from - The address of the input token
   * @param {string} args.to - The address of the output token
   * @param {boolean} [args.safeMode] - Whether to use safe mode, only works on MAINNET
   * @returns {Promise<any>} Estimated swap information
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
   *
   * @param {EstFromAmountArgs} args - Estimation arguments
   * @param {number|string} args.amount - The amount of the input token
   * @param {string} args.from - The address of the input token
   * @param {string} args.to - The address of the output token
   * @param {boolean} [args.safeMode] - Whether to use safe mode, only works on MAINNET
   * @returns {Promise<any>} Estimated swap information
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
   *
   * @param {AggregateSwapRouteArgs} args - Aggregate swap route arguments
   * @param {number|string} args.amount - The amount of the input token
   * @param {string} args.from - The address of the input token
   * @param {string} args.input - The address of the input token, either equals to args.from or args.to
   * @param {number|string} args.slippage - The slippage tolerance
   * @param {string} args.to - The address of the output token
   * @returns {Promise<AggregateSwapInfoResult>} The result of aggregate swap
   *
   * @example
   * // Estimate the result of currency A from currency B by aggregate swap
   * const result = await SDK.Swap.estAmountByAggregateSwap({
   *   amount: "10000000",
   *   from: "A_AssetType",
   *   input: "B_AssetType",
   *   slippage: 0.1,
   *   to: "B_AssetType",
   * });
   * console.log(result);
   *
   * @example
   * // Estimate the result of currency B from currency A by aggregate swap
   * const result = await SDK.Swap.estAmountByAggregateSwap({
   *   amount: "10000000",
   *   from: "B_AssetType",
   *   input: "A_AssetType",
   *   slippage: 0.1,
   *   to: "A_AssetType",
   * });
   * console.log(result);
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
   *
   * @param {AggregateSwapInfoResult & { builder: AptosScriptComposer; partnershipId?: string }} args - Arguments
   * @param {number|string} args.amount - The amount of the input token
   * @param {string} args.from - The address of the input token
   * @param {string} args.input - The address of the input token, either equals to args.from or args.to
   * @param {number|string} args.slippage - The slippage tolerance
   * @param {string} args.to - The address of the output token
   * @param {AptosScriptComposer} args.builder - The builder of the transaction
   * @param {string} [args.partnershipId] - The partnership ID, only works on MAINNET
   * @returns {Promise<any>} The transaction script for aggregate swap
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
