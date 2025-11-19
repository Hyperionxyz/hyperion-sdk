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
BigNumber.config({ EXPONENTIAL_AT: 1e9 });

/**
 * Arguments for adding liquidity transaction payload
 */
export interface AddLiquidityTransactionPayloadArgs {
  /** Position ID */
  positionId: string;
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
  /** Fee tier index */
  feeTierIndex: number | string;
}

/**
 * Arguments for removing liquidity transaction payload
 */
export interface RemoveLiquidityTransactionPayloadArgs {
  /** Position ID */
  positionId: string;
  /** Currency A address */
  currencyA: string;
  /** Currency B address */
  currencyB: string;
  /** Amount of currency A */
  currencyAAmount: number | string;
  /** Amount of currency B */
  currencyBAmount: number | string;
  /** Delta liquidity to remove */
  deltaLiquidity: number | string;
  /** Slippage tolerance */
  slippage: number | string;
  /** Recipient address */
  recipient: string;
}

/**
 * Position module for managing liquidity positions
 *
 * Provides functionality for creating, managing, and querying liquidity positions,
 * including adding/removing liquidity and claiming fees/rewards
 */
export class Position {
  /** SDK instance */
  protected _sdk: HyperionSDK;

  constructor(sdk: HyperionSDK) {
    this._sdk = sdk;
  }

  /**
   * Fetch all positions by owner address
   *
   * @param {Object} params - Parameters
   * @param {string} params.address - Owner address
   * @returns {Promise<Array>} Returns array of position statistics
   */
  async fetchAllPositionsByAddress({ address }: { address: string }) {
    const ret: any = await this._sdk.requestModule.queryIndexer({
      document: QueryAllPositionByAddress,
      variables: {
        address,
      },
    });
    return ret?.api?.getPositionStatsByAddress || [];
  }

  /**
   * Fetch position information by position ID
   *
   * @param {Object} args - Parameters
   * @param {string} args.positionId - Position ID
   * @param {string} args.address - Owner address
   * @returns {Promise<Array>} Returns position ownership data
   */
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
   * Fetch the history of fee reward claims
   *
   * @param {Object} args - Parameters
   * @param {string} args.positionId - Position ID
   * @param {string} args.address - Owner address
   * @returns {Promise<Array>} Returns filtered fee claim history (excludes zero-amount records)
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

  /**
   * Generate transaction payload for adding liquidity to a position
   *
   * This method automatically selects the appropriate contract function based on token types
   *
   * @param {AddLiquidityTransactionPayloadArgs} args - Add liquidity arguments
   * @returns {Promise<Object>} Returns transaction payload object
   * @throws Throws error if parameter validation fails
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
   * Generate transaction payload for removing liquidity from a position
   *
   * This method automatically selects the appropriate contract function based on token types
   *
   * @param {RemoveLiquidityTransactionPayloadArgs} args - Remove liquidity arguments
   * @returns {Object} Returns transaction payload object
   * @throws Throws error if parameter validation fails or invalid recipient address
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

  /**
   * Generate transaction payload for claiming fees from a position
   *
   * @param {Object} params - Parameters
   * @param {string} params.positionId - Position ID
   * @param {string} params.recipient - Recipient address
   * @returns {Object} Returns transaction payload for claiming fees
   */
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

  /**
   * Generate transaction payload for claiming rewards from a position
   *
   * @param {Object} params - Parameters
   * @param {string} params.positionId - Position ID
   * @param {string} params.recipient - Recipient address
   * @returns {Object} Returns transaction payload for claiming rewards
   */
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
   * Generate transaction payload for claiming both fees and rewards from a position
   *
   * @param {Object} params - Parameters
   * @param {string} params.positionId - Position ID
   * @param {string} params.recipient - Recipient address
   * @returns {Object} Returns transaction payload for claiming all rewards
   */
  claimAllRewardsTransactionPayload({
    positionId,
    recipient,
  }: {
    positionId: string;
    recipient: string;
  }) {
    return {
      function: `${this._sdk.sdkOptions.contractAddress}::router_v3::claim_fees_and_rewards`,
      typeArguments: [],
      functionArguments: [[positionId], recipient],
    };
  }

  /**
   * Fetch token amounts by position ID
   *
   * @param {Object} params - Parameters
   * @param {string} params.positionId - Position ID
   * @returns {Promise<[string, string]>} Returns [currencyAAmount, currencyBAmount]
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
