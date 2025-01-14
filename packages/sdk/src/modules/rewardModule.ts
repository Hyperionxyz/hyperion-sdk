import BigNumber from "bignumber.js";
import { HyperfluidSDK } from "..";
import { QueryClaimedRewards } from "../config/queries/reward.query";

export class Reward {
  protected _sdk: HyperfluidSDK;

  constructor(sdk: HyperfluidSDK) {
    this._sdk = sdk;
  }

  fetchRewardsPayload({ positionId }: { positionId: string }) {
    return {
      function: `${this._sdk.sdkOptions.contractAddress}::pool_v3::get_pending_rewards`,
      typeArguments: [],
      functionArguments: [positionId],
    };
  }

  /**
   * Fetch the history of Fee Subsidy claim
   *
   * @param args
   * @returns
   */
  async fetchRewardHistory(args: { positionId: string; address: string }) {
    const ret: any = await this._sdk.requestModule.queryIndexer({
      document: QueryClaimedRewards,
      variables: {
        objectId: args.positionId,
        ownerAddress: args.address,
      },
    });

    return ret.rewardStatement?.filter((item: any) => {
      return !new BigNumber(item.amount).isEqualTo(0);
    });
  }

  claimRewardPayload({
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
}
