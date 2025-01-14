import { gql } from "graphql-request";

export const RewardFragment = `
  amount
  objectId
  poolId
  senderAddress
  ownerAddress
  token
  type
`;

export enum REWARD_TYPE {
  "FEE",
  "SUBSIDY",
}

export const QueryClaimedFee = gql`
  query queryClaimedFee($objectId: String = "", $ownerAddress:String = "") {
    rewardStatement(where: { objectId: { _eq: $objectId }, ownerAddress: {_eq: $ownerAddress}, type: { _eq: ${REWARD_TYPE.FEE} } }) {
      ${RewardFragment} 
    }
  }
`;

export const QueryClaimedRewards = gql`
  query queryClaimedRewards($objectId: String = "", $ownerAddress:String = "") {
    rewardStatement(where: { objectId: { _eq: $objectId }, ownerAddress: {_eq: $ownerAddress}, type: { _eq: ${REWARD_TYPE.SUBSIDY} } }) {
      ${RewardFragment} 
    }
  }
`;
