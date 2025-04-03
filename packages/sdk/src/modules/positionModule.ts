import { AccountAddress } from "@aptos-labs/ts-sdk";
import { TokenPairs } from "aptos-tool";
import BigNumber from "bignumber.js";
import { HyperionSDK } from "..";
import {
  QueryAllPositionByAddress,
  QueryPoolInfoByObjectId,
} from "../config/queries/pool.query";
import {
  currencyCheck,
  POOL_STABLE_TYPE,
  poolDeadline,
  slippageCalculator,
  slippageCheck,
} from "../utils";
import { QueryClaimedFee } from "./../config/queries/reward.query";

export interface AddLiquidityTransactionPayloadArgs {
  positionId: string;
  currencyA: string;
  currencyB: string;
  currencyAAmount: number | string;
  currencyBAmount: number | string;
  slippage: number | string;
  feeTierIndex: number | string;
}

export interface RemoveLiquidityTransactionPayloadArgs {
  positionId: string;
  currencyA: string;
  currencyB: string;
  currencyAAmount: number | string;
  currencyBAmount: number | string;
  deltaLiquidity: number | string;
  slippage: number | string;
  // Remove to
  recipient: string;
}

export class Position {
  protected _sdk: HyperionSDK;

  constructor(sdk: HyperionSDK) {
    this._sdk = sdk;
  }

  async fetchAllPositionsByAddress({ address }: { address: string }) {
    const ret: any = await this._sdk.requestModule.queryIndexer({
      document: QueryAllPositionByAddress,
      variables: {
        address,
      },
    });
    return ret?.api?.getPositionStatsByAddress || [];
  }

  async fetchPositionById(args: { positionId: string; address: string }) {
    const ret: any = await this._sdk.requestModule.queryIndexer({
      document: QueryPoolInfoByObjectId,
      variables: {
        objectId: args.positionId,
        ownerAddress: args.address,
      },
    });
    return ret?.objectOwnership || [];
  }

  /**
   * Fetch the history of Fee Reward claim
   *
   * @param args
   * @returns
   */
  async fetchFeeHistory(args: { positionId: string; address: string }) {
    const ret: any = await this._sdk.requestModule.queryIndexer({
      document: QueryClaimedFee,
      variables: {
        objectId: args.positionId,
        ownerAddress: args.address,
      },
    });

    return ret.rewardStatement?.filter((item: any) => {
      return !new BigNumber(item.amount).isEqualTo(0);
    });
  }

  // async fetchFeePayload({ positionId }: { positionId: string }) {
  //   return {
  //     function: `${this._sdk.sdkOptions.contractAddress}::pool_v3::get_pending_fees`,
  //     typeArguments: [],
  //     functionArguments: [positionId],
  //   };
  // }

  /**
   * Adds liquidity to a liquidity pool
   *
   * This method is used to add liquidity to a liquidity pool.
   */
  async addLiquidityTransactionPayload(
    args: AddLiquidityTransactionPayloadArgs
  ) {
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
      ...currencyAmounts,
      ...currencyAmountsAfterSlippage,
      poolDeadline(),
    ];

    const paramsReverse = [...params];
    [paramsReverse[2], paramsReverse[3]] = [paramsReverse[3], paramsReverse[2]];
    [paramsReverse[4], paramsReverse[5]] = [paramsReverse[5], paramsReverse[4]];

    return TokenPairs.TokenPairTypeCheck(currencyAddresses, [
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_adapter::add_liquidity_entry`,
        typeArguments: [],
        functionArguments: [args.positionId, ...currencyAddresses, ...params],
      },
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_adapter::add_liquidity_both_coin_entry`,
        typeArguments: [...currencyAddresses],
        functionArguments: [args.positionId, ...params],
      },
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_adapter::add_liquidity_coin_entry`,
        typeArguments: [currencyAddresses[0]],
        functionArguments: [args.positionId, currencyAddresses[1], ...params],
      },
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_adapter::add_liquidity_coin_entry`,
        typeArguments: [currencyAddresses[1]],
        functionArguments: [
          args.positionId,
          currencyAddresses[0],
          ...paramsReverse,
        ],
      },
    ]);
  }

  /**
   * Removes liquidity from a liquidity pool
   *
   * This method is used to remove liquidity from a liquidity pool.
   */
  removeLiquidityTransactionPayload(
    args: RemoveLiquidityTransactionPayloadArgs
  ) {
    console.log(args);

    currencyCheck(args);
    slippageCheck(args);

    if (
      !AccountAddress.isValid({ input: args.recipient, strict: true }).valid
    ) {
      throw new Error("Invalid recipient address");
    }

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

    const functionArguments = [
      args.positionId,
      BigNumber(args.deltaLiquidity).dp(0).toNumber(),
      ...currencyAmountsAfterSlippage,
      args.recipient,
      poolDeadline(),
    ];

    return TokenPairs.TokenPairTypeCheck(currencyAddresses, [
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_adapter::remove_liquidity_entry_v2`,
        typeArguments: [],
        functionArguments,
      },
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_adapter::remove_liquidity_both_coins_entry_v2`,
        typeArguments: [...currencyAddresses],
        functionArguments,
      },
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_adapter::remove_liquidity_coin_entry_v2`,
        typeArguments: [currencyAddresses[0]],
        functionArguments,
      },
      {
        function: `${this._sdk.sdkOptions.contractAddress}::router_adapter::remove_liquidity_coin_entry_v2`,
        typeArguments: [currencyAddresses[1]],
        functionArguments,
      },
    ]);
  }

  claimFeeTransactionPayload({
    positionId,
    recipient,
  }: {
    positionId: string;
    recipient: string;
  }) {
    return {
      function: `${this._sdk.sdkOptions.contractAddress}::router_v3::claim_fees`,
      typeArguments: [],
      functionArguments: [[positionId], recipient],
    };
  }

  claimRewardTransactionPayload({
    positionId,
    recipient,
  }: {
    positionId: string;
    recipient: string;
  }) {
    return {
      function: `${this._sdk.sdkOptions.contractAddress}::router_v3::claim_rewards`,
      typeArguments: [],
      functionArguments: [positionId, recipient],
    };
  }

  /**
   *
   * @param positionId
   *
   * @returns [currencyAAmount, currencyBAmount]
   */
  async fetchTokensAmountByPositionId({ positionId }: { positionId: string }) {
    const payload: any = {
      function: `${this._sdk.sdkOptions.contractAddress}::router_v3::get_amount_by_liquidity`,
      typeArguments: [],
      functionArguments: [positionId],
    };

    const ret: any = await this._sdk.AptosClient.view({
      payload,
    });

    return ret;
  }
}
