import BigNumber from "bignumber.js";
import { HyperionSDK } from "..";

BigNumber.config({ EXPONENTIAL_AT: 1e9 });

export class Reward {
  protected _sdk: HyperionSDK;

  constructor(sdk: HyperionSDK) {
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
   * Fetch the history of Fee Farm claim
   *
   * @param args
   * @returns
   */
  async fetchRewardHistory(args: { positionId: string; address: string }) {
    const ret: any = await this._sdk.requestModule.get(
      "/base/data/rewards/claimed-farms",
      {
        objectId: args.positionId,
        ownerAddress: args.address,
      }
    );

    return ret?.items?.filter((item: any) => {
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
