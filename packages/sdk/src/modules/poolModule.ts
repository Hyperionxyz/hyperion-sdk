import { TokenPairs } from "aptos-tool";
import BigNumber from "bignumber.js";
import { HyperionSDK } from "..";
import {
  QueryAllPools,
  QueryPoolById,
  QueryTickChart,
} from "../config/queries/pool.query";
import {
  currencyCheck,
  POOL_STABLE_TYPE,
  poolDeadline,
  slippageCalculator,
  slippageCheck,
  tickComplement,
} from "../utils";

export interface CreatePoolTransactionPayloadArgs {
  currencyA: string;
  currencyB: string;
  currencyAAmount: number | string;
  currencyBAmount: number | string;
  feeTierIndex: number | string;
  currentPriceTick: number | string;
  tickLower: number | string;
  tickUpper: number | string;
  slippage: number | string;
}

export interface EstAmountArgs {
  currencyA: string;
  currencyB: string;
  feeTierIndex: number | string;
  tickLower: number | string;
  tickUpper: number | string;
  currentPriceTick: number | string;
}

export type EstCurrencyAAmountArgs = EstAmountArgs & {
  currencyBAmount: number | string;
};

export type EstCurrencyBAmountArgs = EstAmountArgs & {
  currencyAAmount: number | string;
};

export default class Pool {
  protected _sdk: HyperionSDK;
  constructor(sdk: HyperionSDK) {
    this._sdk = sdk;
  }

  async fetchAllPools() {
    // TODO: fetch all pools by page
    const ret: any = await this._sdk.requestModule.queryIndexer({
      document: QueryAllPools,
    });
    return ret?.api?.getPoolStat || [];
  }

  async fetchPoolById({ poolId }: { poolId: string }) {
    const ret: any = await this._sdk.requestModule.queryIndexer({
      document: QueryPoolById,
      variables: {
        poolId,
      },
    });
    return ret?.api?.getPoolStat || [];
  }

  // TODO: fetch pool by tokenPair Addresses and fee rate

  /**
   * Creates a liquidity pool
   *
   * This method is used to initialize a liquidity pool.
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

  async fetchTicks({ poolId }: { poolId: string }) {
    const ret: any = await this._sdk.requestModule.queryIndexer({
      document: QueryTickChart,
      variables: {
        poolId,
      },
    });
    return ret?.api?.getLiquidityAccumulation || [];
  }

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

    console.log(payload);

    return await this._sdk.AptosClient.view({ payload });
  }

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
