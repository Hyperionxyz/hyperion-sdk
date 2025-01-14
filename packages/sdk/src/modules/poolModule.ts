import { TokenPairs } from "aptos-tool";
import BigNumber from "bignumber.js";
import { HyperfluidSDK } from "..";
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
  feeRateTier: number | string;
  currentPriceTick: number | string;
  tickerLower: number | string;
  tickerUpper: number | string;
  slippage: number | string;
}

export default class Pool {
  protected _sdk: HyperfluidSDK;
  constructor(sdk: HyperfluidSDK) {
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

  // TODO: fetch pool by ids
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
      BigNumber(args.feeRateTier).toNumber(),
      POOL_STABLE_TYPE,
      tickComplement(args.tickerLower),
      tickComplement(args.tickerUpper),
      tickComplement(args.currentPriceTick),
      ...currencyAmounts,
      ...currencyAmountsAfterSlippage,
      poolDeadline(),
    ];

    const paramsReverse = [...params];
    [paramsReverse[5], paramsReverse[6]] = [paramsReverse[6], paramsReverse[5]];
    [paramsReverse[7], paramsReverse[8]] = [paramsReverse[8], paramsReverse[7]];

    [paramsReverse[2], paramsReverse[3], paramsReverse[4]] = [
      tickComplement(BigNumber(args.tickerUpper).times(-1).toNumber()),
      tickComplement(BigNumber(args.tickerLower).times(-1).toNumber()),
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
}
