import { TokenPairs } from "aptos-tool";
import BigNumber from "bignumber.js";
import { HyperionSDK } from "..";
import {
  QueryAllPools,
  QueryPoolById,
  queryPoolByTokenPair,
  QueryTickChart,
} from "../config/queries/pool.query";
import {
  currencyCheck,
  FeeTierIndex,
  POOL_STABLE_TYPE,
  poolDeadline,
  slippageCalculator,
  slippageCheck,
  tickComplement,
} from "../utils";
BigNumber.config({ EXPONENTIAL_AT: 1e9 });

/**
 * Arguments for creating a liquidity pool transaction
 */
export interface CreatePoolTransactionPayloadArgs {
  /** Currency A address */
  currencyA: string;
  /** Currency B address */
  currencyB: string;
  /** Amount of currency A */
  currencyAAmount: number | string;
  /** Amount of currency B */
  currencyBAmount: number | string;
  /** Fee tier index */
  feeTierIndex: number | string;
  /** Current price tick */
  currentPriceTick: number | string;
  /** Lower tick of price range */
  tickLower: number | string;
  /** Upper tick of price range */
  tickUpper: number | string;
  /** Slippage tolerance */
  slippage: number | string;
}

/**
 * Base arguments for amount estimation
 */
export interface EstAmountArgs {
  /** Currency A address */
  currencyA: string;
  /** Currency B address */
  currencyB: string;
  /** Fee tier index */
  feeTierIndex: number | string;
  /** Lower tick of price range */
  tickLower: number | string;
  /** Upper tick of price range */
  tickUpper: number | string;
  /** Current price tick */
  currentPriceTick: number | string;
}

/**
 * Arguments for estimating currency A amount from currency B
 */
export type EstCurrencyAAmountArgs = EstAmountArgs & {
  /** Amount of currency B */
  currencyBAmount: number | string;
};

/**
 * Arguments for estimating currency B amount from currency A
 */
export type EstCurrencyBAmountArgs = EstAmountArgs & {
  /** Amount of currency A */
  currencyAAmount: number | string;
};

/**
 * Pool module for managing liquidity pools
 *
 * Provides functionality for creating pools, querying pool information, and estimating liquidity amounts
 */
export default class Pool {
  /** SDK instance */
  protected _sdk: HyperionSDK;

  constructor(sdk: HyperionSDK) {
    this._sdk = sdk;
  }

  /**
   * Fetch all liquidity pools
   *
   * @returns Returns statistics of all liquidity pools
   */
  async fetchAllPools() {
    // TODO: fetch all pools by page
    const ret: any = await this._sdk.requestModule.queryIndexer({
      document: QueryAllPools,
    });
    return ret?.api?.getPoolStat || [];
  }

  /**
   * Fetch liquidity pool information by pool ID
   *
   * @param poolId - Pool ID
   * @returns Returns statistics of the specified pool
   */
  async fetchPoolById({ poolId }: { poolId: string }) {
    const ret: any = await this._sdk.requestModule.queryIndexer({
      document: QueryPoolById,
      variables: {
        poolId,
      },
    });
    return ret?.api?.getPoolStat || [];
  }

  /**
   * Get liquidity pool by token pair and fee tier
   *
   * @param token1 - Token 1 address
   * @param token2 - Token 2 address
   * @param feeTier - Fee tier
   * @returns Returns matching pool information
   */
  async getPoolByTokenPairAndFeeTier({
    token1,
    token2,
    feeTier,
  }: {
    token1: string;
    token2: string;
    feeTier: FeeTierIndex;
  }) {
    const result: any = await this._sdk.requestModule.queryIndexer({
      document: queryPoolByTokenPair,
      variables: {
        token1,
        token2,
        feeTier,
      },
    });

    return result?.api.getPoolByTokenPair || {};
  }

  // TODO: fetch pool by tokenPair Addresses and fee rate

  /**
   * Creates a liquidity pool transaction payload
   *
   * This method is used to initialize a new liquidity pool and automatically selects
   * the appropriate contract function based on token types
   *
   * @param args - Pool creation arguments
   * @returns Returns transaction payload object
   * @throws Throws error if parameter validation fails
   */
  async createPoolTransactionPayload(args: CreatePoolTransactionPayloadArgs) {
    currencyCheck(args);
    slippageCheck(args);

    const currencyAddresses: string[] = [args.currencyA, args.currencyB];
    const currencyAmounts = [
      BigNumber(args.currencyAAmount).toNumber(),
      BigNumber(args.currencyBAmount).toNumber(),
    ];
    const currencyAmountsAfterSlippage = currencyAmounts.map(
      (amount: number | string) => {
        return slippageCalculator(amount, args.slippage);
      }
    );

    const params = [
      BigNumber(args.feeTierIndex).toNumber(),
      POOL_STABLE_TYPE,
      tickComplement(args.tickLower),
      tickComplement(args.tickUpper),
      tickComplement(args.currentPriceTick),
      ...currencyAmounts,
      ...currencyAmountsAfterSlippage,
      poolDeadline(),
    ];

    const paramsReverse = [...params];
    [paramsReverse[5], paramsReverse[6]] = [paramsReverse[6], paramsReverse[5]];
    [paramsReverse[7], paramsReverse[8]] = [paramsReverse[8], paramsReverse[7]];

    [paramsReverse[2], paramsReverse[3], paramsReverse[4]] = [
      tickComplement(BigNumber(args.tickUpper).times(-1).toNumber()),
      tickComplement(BigNumber(args.tickLower).times(-1).toNumber()),
      tickComplement(BigNumber(args.currentPriceTick).times(-1).toNumber()),
    ];

    return TokenPairs.TokenPairTypeCheck(currencyAddresses, [
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_adapter::create_liquidity_entry`,
        typeArguments: [],
        functionArguments: [...currencyAddresses, ...params],
      },
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_adapter::create_liquidity_both_coin_entry`,
        typeArguments: [...currencyAddresses],
        functionArguments: [...params],
      },
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_adapter::create_liquidity_coin_entry`,
        typeArguments: [currencyAddresses[0]],
        functionArguments: [currencyAddresses[1], ...params],
      },
      // fa & coin
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_adapter::create_liquidity_coin_entry`,
        // TokenB
        typeArguments: [currencyAddresses[1]],
        // TokenA
        // [AmountB, AmountA]
        // [SlippageB, SlippageA]
        functionArguments: [currencyAddresses[0], ...paramsReverse],
      },
    ]);
  }

  /**
   * Fetch tick chart data for a liquidity pool
   *
   * @param poolId - Pool ID
   * @returns Returns liquidity accumulation data
   */
  async fetchTicks({ poolId }: { poolId: string }) {
    const ret: any = await this._sdk.requestModule.queryIndexer({
      document: QueryTickChart,
      variables: {
        poolId,
      },
    });
    return ret?.api?.getLiquidityAccumulation || [];
  }

  /**
   * Estimate optimal currency A amount from currency B amount
   *
   * @param args - Estimation arguments
   * @returns Returns [currency A amount, currency B amount]
   */
  // TODO: return data type in docs
  // [number_a, number_b]
  async estCurrencyAAmountFromB(args: EstCurrencyAAmountArgs) {
    const payload: any = {
      function: `${this._sdk.sdkOptions.contractAddress}::router_v3::optimal_liquidity_amounts_from_b`,
      typeArguments: [],
      functionArguments: [
        tickComplement(args.tickLower),
        tickComplement(args.tickUpper),
        tickComplement(args.currentPriceTick),
        args.currencyA,
        args.currencyB,
        args.feeTierIndex,
        args.currencyBAmount,
        0,
        0,
      ],
    };

    return await this._sdk.AptosClient.view({ payload });
  }

  /**
   * Estimate optimal currency B amount from currency A amount
   *
   * @param args - Estimation arguments
   * @returns Returns [currency A amount, currency B amount]
   */
  async estCurrencyBAmountFromA(args: EstCurrencyBAmountArgs) {
    const payload: any = {
      function: `${this._sdk.sdkOptions.contractAddress}::router_v3::optimal_liquidity_amounts_from_a`,
      typeArguments: [],
      functionArguments: [
        // fixed tick order
        tickComplement(args.tickLower),
        tickComplement(args.tickUpper),
        tickComplement(args.currentPriceTick),
        args.currencyA,
        args.currencyB,
        args.feeTierIndex,
        args.currencyAAmount,
        0,
        0,
      ],
    };

    return await this._sdk.AptosClient.view({ payload });
  }
}
