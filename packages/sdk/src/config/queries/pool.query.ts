import { gql } from "graphql-request";

export const TokenInfoFragment = `
  assetType
  bridge
  coinMarketcapId
  coinType
  coingeckoId
  decimals
  faType
  hyperfluidSymbol
  logoUrl
  name
  symbol
  isBanned
  websiteUrl`;

export const PoolInfoFragment = `
   currentTick
   feeRate
   feeTier
   poolId
   senderAddress
   sqrtPrice
   token1
   token2
  token1Info {
    ${TokenInfoFragment}
  }
  token2Info {
    ${TokenInfoFragment} 
  }
`;

export const PoolStatFragment = `
  id
  aprUSD
  dailyVolumeUSD
  feesUSD
  tvlUSD
  pool {
    ${PoolInfoFragment} 
  }
`;

export const QueryAllPools = gql`
  query queryAllPools {
    api {
      getPoolStat {
		${PoolStatFragment}
      }
    }
  }
`;

export const QueryPoolById = gql`
  query queryPoolById($poolId: String = "") {
    api {
      getPoolStat(poolId: $poolId) {
		${PoolStatFragment}	
      }
    }
  }
`;

export const QueryTickChart = gql`
  query queryTickChart($poolId: String = "") {
    api {
      getLiquidityAccumulation(poolId: $poolId) {
        price0
        price1
        tick
        totalAmount
      }
    }
  }
`;

export const FeeProperties = `
  amount
  amountUSD
  token
`;

export const Claimed = `
  claimed {
    ${FeeProperties}
  }
`;

export const Unclaimed = `
  unclaimed {
    ${FeeProperties}
  }
`;

export const QueryAllPositionByAddress = gql`
  query queryAllPositionByAddress($address: String = "") {
    api {
      getPositionStatsByAddress(address: $address) {
        isActive
        value
        subsidy {
          ${Claimed} 
          ${Unclaimed}
        }
        fees {
          ${Claimed} 
          ${Unclaimed} 
        }
        position {
          objectId
          poolId
          tickLower
          tickUpper
          createdAt
          pool {
            ${PoolInfoFragment}
          }
        }
      }
    }
  }
`;

export const QueryPoolInfoByObjectId = gql`
  query queryPoolInfoByObjectId($ownerAddress: String = "", $objectId: String = "") {
    objectOwnership(
      where: {
        ownerAddress: { _eq: $ownerAddress }
        isDelete: { _eq: false }
        objectId: { _eq: $objectId }
      }
    ) {
      objectId
      poolId
      txnTimestamp
      currentAmount
      position {
        tickLower
        tickUpper
      }
      pool {
        ${PoolInfoFragment} 
      }
    }
  }
`;
