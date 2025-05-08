"use client";

import APIGetSection from "@/components/APIGetSection";
import APIPostSection from "@/components/APIPostSection";
import { useHyperionSDK } from "@/components/HyperionSDKProvider";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  FeeTierIndex,
  priceToTick,
  roundTickBySpacing,
} from "@hyperionxyz/sdk";
import { useEffect, useState } from "react";
import { Header } from "../components/Header";

export default function Home() {
  const { SDK } = useHyperionSDK();
  const { account } = useWallet();
  const feeTierIndex = FeeTierIndex["PER_0.05_SPACING_5"];
  const positionId = "";
  const [accountAddress, setAccountAddress] = useState("");
  const DocURL =
    "https://hyperfluid.gitbook.io/hyperion-docs/developer/via-sdk/features-available/";

  useEffect(() => {
    setAccountAddress(account?.address || "");
  }, [account]);

  // console.log(tickToPrice({ tick: 25930, decimalsRatio: 100 }));
  // console.log(tickToPrice({ tick: 25930, decimalsRatio: 100 }));
  // console.log(tickToPrice({ tick: 22983, decimalsRatio: 100 }));

  return (
    <>
      <Header />
      <div className='flex min-h-screen flex-col items-center justify-between mt-[60px]'>
        <div className='p-4 rounded-lg w-full pb-40 flex flex-col'>
          <h2>Pool</h2>
          <div className='flex flex-col gap-3'>
            {/* fetchAllPools */}
            {/* Here, cause the function `fetchAllPools` is defined in the `poolModule.ts` file */}
            {/* we need to use the `bind` method to bind the `this` context to the `Pool` instance for React components */}
            <APIGetSection
              description='Fetch All Pools'
              label={"Pool.fetchAllPools"}
              api={SDK.Pool.fetchAllPools.bind(SDK.Pool)}
              docUrl={`${DocURL}get-pools#id-1.-get-all-pools`}
            ></APIGetSection>

            {/* fetchPoolById */}
            <APIGetSection
              description='Fetch Pool Information by Pool ID'
              label={"Pool.fetchPoolById"}
              api={SDK.Pool.fetchPoolById.bind(SDK.Pool)}
              apiParams={{
                poolId: "",
              }}
              docUrl={`${DocURL}get-pools#id-2.-get-pool-by-poolid`}
            ></APIGetSection>

            <APIGetSection
              description='Fetch Pool Information by TokenPairs and FeeTierIndex'
              label={"Pool.getPoolByTokenPairAndFeeTier"}
              api={SDK.Pool.getPoolByTokenPairAndFeeTier.bind(SDK.Pool)}
              apiParams={{
                token1: "",
                token2: "",
                feeTier: FeeTierIndex["PER_0.01_SPACING_1"],
              }}
              docUrl={`${DocURL}/get-pools#id-3.-get-pool-by-token-asset-types-and-feetier`}
            ></APIGetSection>

            <APIGetSection
              description='Fetch Ticks by Pool ID'
              label={"Pool.fetchTicks"}
              api={SDK.Pool.fetchTicks.bind(SDK.Pool)}
              apiParams={{
                poolId: "",
              }}
              docUrl={`${DocURL}get-ticks#id-1.-batch-get-ticks-by-pool-id`}
            ></APIGetSection>

            <APIPostSection
              description='Generate Pool Creation Transaction Payload'
              label='Pool.createPoolTransactionPayload'
              api={SDK.Pool.createPoolTransactionPayload.bind(SDK.Pool)}
              apiParams={{
                currencyA: "0x1::aptos_coin::AptosCoin",
                currencyB:
                  "0x6926bff1eab5554fa72ae167ed736acf623ab17fe81ebf2ea0d2138f8c533f77::type::T",
                currencyAAmount: Math.pow(10, 8),
                currencyBAmount: 1209161039,
                feeTierIndex: feeTierIndex,
                currentPriceTick: priceToTick({
                  price: 992,
                  feeTierIndex,
                  decimalsRatio: 100,
                })?.toNumber(),
                tickLower: roundTickBySpacing(22410, feeTierIndex),
                tickUpper: roundTickBySpacing(25930, feeTierIndex),
                slippage: 0.1,
              }}
              docUrl={`${DocURL}create-pool#id-1.-create-a-pool-with-some-initial-liquidity-to-be-added`}
            ></APIPostSection>

            <APIGetSection
              label='Pool.estCurrencyAAmountFromB'
              api={SDK.Pool.estCurrencyAAmountFromB.bind(SDK.Pool)}
              apiParams={{
                currencyA: "0xa",
                currencyB:
                  "0xc5bcdea4d8a9f5809c5c945a3ff5698a347afb982c7389a335100e1b0043d115",
                currencyBAmount: 1000000,
                feeTierIndex,
                tickLower: roundTickBySpacing(22410, feeTierIndex),
                tickUpper: roundTickBySpacing(25930, feeTierIndex),
                currentPriceTick: roundTickBySpacing(22983, feeTierIndex),
              }}
              docUrl={`${DocURL}create-pool#id-1.-create-a-pool-with-some-initial-liquidity-to-be-added`}
            ></APIGetSection>

            <APIGetSection
              label='Pool.estCurrencyBAmountFromA'
              api={SDK.Pool.estCurrencyBAmountFromA.bind(SDK.Pool)}
              apiParams={{
                currencyA: "0xa",
                currencyB:
                  "0xc5bcdea4d8a9f5809c5c945a3ff5698a347afb982c7389a335100e1b0043d115",
                currencyAAmount: 100000000,
                feeTierIndex,
                tickLower: roundTickBySpacing(22410, feeTierIndex),
                tickUpper: roundTickBySpacing(25930, feeTierIndex),
                currentPriceTick: roundTickBySpacing(22983, feeTierIndex),
              }}
              docUrl={`${DocURL}create-pool#id-1.-create-a-pool-with-some-initial-liquidity-to-be-added`}
            ></APIGetSection>
          </div>

          <h2 className='mt-5'>Position</h2>
          <div className='flex flex-col gap-3'>
            <APIGetSection
              label={"Position.fetchAllPositionsByAddress"}
              api={SDK.Position.fetchAllPositionsByAddress.bind(SDK.Position)}
              apiParams={{
                address: accountAddress,
              }}
              docUrl={`${DocURL}get-positions#id-1.-get-all-positions-by-owneraddress`}
            ></APIGetSection>

            <APIGetSection
              label={"Position.fetchPositionById"}
              api={SDK.Position.fetchPositionById.bind(SDK.Position)}
              apiParams={{
                positionId,
                address: accountAddress,
              }}
              docUrl={`${DocURL}get-positions#id-2.-get-position-by-positionid`}
            ></APIGetSection>

            <APIGetSection
              label={"Position.fetchFeeHistory"}
              api={SDK.Position.fetchFeeHistory.bind(SDK.Position)}
              apiParams={{
                positionId,
                address:
                  "0x0fd95328afbea0e51bd4c948d695bc785a248a1783417c818a22f5e37bfe1bbf",
              }}
              docUrl={`${DocURL}get-positions#id-3.-get-fee-history-of-the-position`}
            ></APIGetSection>

            {/* <APIViewSection
              label={"Position.fetchFeePayload"}
              api={SDK.Position.fetchFeePayload.bind(SDK.Position)}
              apiParams={{
                positionId,
              }}
            ></APIViewSection> */}

            <APIPostSection
              label='Position.addLiquidityTransactionPayload'
              api={SDK.Position.addLiquidityTransactionPayload.bind(
                SDK.Position
              )}
              apiParams={{
                positionId,
                currencyA: "0x1::aptos_coin::AptosCoin",
                currencyB:
                  "0x6926bff1eab5554fa72ae167ed736acf623ab17fe81ebf2ea0d2138f8c533f77::type::T",
                currencyAAmount: Math.pow(10, 7),
                currencyBAmount: 20566984,
                slippage: 0.1,
                feeTierIndex,
              }}
              docUrl={`${DocURL}add-liquidity#id-1.-create-the-payload-of-add-liquidity`}
            ></APIPostSection>

            <APIGetSection
              label={"Position.fetchTokensAmountByPositionId"}
              api={SDK.Position.fetchTokensAmountByPositionId.bind(
                SDK.Position
              )}
              apiParams={{
                positionId,
              }}
              docUrl={`${DocURL}remove-liquidity#id-1.-remove-liquidity-by-inputting-liquidity-value`}
            ></APIGetSection>

            <APIPostSection
              label='Position.removeLiquidityTransactionPayload'
              description='You can find liquidity amount from `currentAmount` in `Position.fetchPositionById`'
              api={SDK.Position.removeLiquidityTransactionPayload.bind(
                SDK.Position
              )}
              apiParams={{
                positionId,
                currencyA: "0x1::aptos_coin::AptosCoin",
                currencyB:
                  "0x6926bff1eab5554fa72ae167ed736acf623ab17fe81ebf2ea0d2138f8c533f77::type::T",
                currencyAAmount: Math.pow(10, 7),
                currencyBAmount: 20566984,
                deltaLiquidity: 396855612,
                slippage: 0.1,
                recipient: accountAddress,
              }}
              docUrl={`${DocURL}remove-liquidity#id-1.-remove-liquidity-by-inputting-liquidity-value`}
            ></APIPostSection>
          </div>

          <h2 className='mt-5'>Fee & Reward</h2>
          <div className='flex flex-col gap-3'>
            <APIPostSection
              label={"Position.claimFeeTransactionPayload"}
              api={SDK.Position.claimFeeTransactionPayload.bind(SDK.Position)}
              apiParams={{
                positionId,
                recipient: accountAddress,
              }}
              docUrl={`${DocURL}fee-and-rewards#id-2.-generate-fee-claim-payload`}
            ></APIPostSection>

            <APIPostSection
              label={"Position.claimRewardTransactionPayload"}
              api={SDK.Position.claimRewardTransactionPayload.bind(
                SDK.Position
              )}
              apiParams={{
                positionId,
                recipient: accountAddress,
              }}
              docUrl={`${DocURL}fee-and-rewards#id-3.-generate-reward-claim-payload`}
            ></APIPostSection>

            <APIPostSection
              label={"Position.claimAllRewardsTransactionPayload"}
              api={SDK.Position.claimAllRewardsTransactionPayload.bind(
                SDK.Position
              )}
              apiParams={{
                positionId,
                recipient: accountAddress,
              }}
              docUrl={`${DocURL}fee-and-rewards#id-3.-generate-all-reward-claim-payload`}
            ></APIPostSection>
          </div>

          <h2 className='mt-5'>Swap</h2>
          <div className='flex flex-col gap-3'>
            <APIGetSection
              label={"Swap.estFromAmount"}
              api={SDK.Swap.estFromAmount.bind(SDK.Position)}
              apiParams={{
                amount: Math.pow(10, 7),
                from: "0xa",
                to: "0xc5bcdea4d8a9f5809c5c945a3ff5698a347afb982c7389a335100e1b0043d115",
                safeMode: true,
              }}
              docUrl={`${DocURL}swap#swap`}
            ></APIGetSection>

            <APIGetSection
              label={"Swap.estToAmount"}
              api={SDK.Swap.estToAmount.bind(SDK.Position)}
              apiParams={{
                amount: Math.pow(10, 7),
                from: "0xa",
                to: "0xc5bcdea4d8a9f5809c5c945a3ff5698a347afb982c7389a335100e1b0043d115",
                safeMode: true,
              }}
              docUrl={`${DocURL}swap#swap`}
            ></APIGetSection>

            <APIPostSection
              label={"Swap.swapTransactionPayload"}
              description='You can find opposite direction amount estimation and poolRoute from the functions above.'
              api={SDK.Swap.swapTransactionPayload.bind(SDK.Swap)}
              apiParams={{
                currencyB:
                  "0xce0329021a6c041caf9f532e8b187b70c9ffe743e5f1c91e31078a3d4f220864",
                currencyA: "0x1::aptos_coin::AptosCoin",
                currencyBAmount: "9516108",
                currencyAAmount: "10000000",
                slippage: 0.1,
                poolRoute: [
                  "0x9a4957cf0549ad011cd21f1f5aa83af556292ebeb9c173cb4b31bbbdc90e83d7",
                ],
                recipient: accountAddress,
              }}
              docUrl={`${DocURL}swap#swap`}
            ></APIPostSection>
          </div>
        </div>
      </div>
    </>
  );
}
