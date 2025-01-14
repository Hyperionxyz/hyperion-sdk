"use client";

import APIGetSection from "@/components/APIGetSection";
import APIPostSection from "@/components/APIPostSection";
import APIViewSection from "@/components/APIViewSection";
import { useHyperfluidSDK } from "@/components/HyperfluidSDKProvider";
import { FeeTierIndex, roundTickBySpacing } from "@hyperfluid/sdk";
import { Header } from "../components/Header";

export default function Home() {
  const { SDK } = useHyperfluidSDK();
  const feeRateTier = FeeTierIndex["PER_0.05_SPACING_5"];
  const positionId =
    "0x4b65447d775934596686ef643ad10f3f552b35ff5c2d1bf992c616e4b527fe77";
  const accountAddress =
    "0x0fd95328afbea0e51bd4c948d695bc785a248a1783417c818a22f5e37bfe1bbf";

  return (
    <>
      <Header />
      <div className='flex min-h-screen flex-col items-center justify-between mt-[60px]'>
        <div className='p-4 rounded-lg w-full'>
          <div className='flex flex-col'>
            <h2>Pool</h2>
          </div>
          <div className='flex flex-col gap-3'>
            {/* fetchAllPools */}
            {/* Here, cause the function `fetchAllPools` is defined in the `poolModule.ts` file */}
            {/* we need to use the `bind` method to bind the `this` context to the `Pool` instance for React components */}
            <APIGetSection
              label={"Pool.fetchAllPools"}
              api={SDK.Pool.fetchAllPools.bind(SDK.Pool)}
            ></APIGetSection>

            {/* fetchPoolById */}
            <APIGetSection
              label={"Pool.fetchPoolById"}
              api={SDK.Pool.fetchPoolById.bind(SDK.Pool)}
              apiParams={{
                poolId:
                  "0xf1083e26e765506c9360d6b07c1478e6bc40376848b4ee44f4f3c729cf2876b5",
              }}
            ></APIGetSection>

            <APIGetSection
              label={"Pool.fetchTicks"}
              api={SDK.Pool.fetchTicks.bind(SDK.Pool)}
              apiParams={{
                poolId:
                  "0xf1083e26e765506c9360d6b07c1478e6bc40376848b4ee44f4f3c729cf2876b5",
              }}
            ></APIGetSection>

            {/* TODO: predict currencyBAmount */}

            <APIPostSection
              label='Pool.createPoolTransactionPayload'
              api={SDK.Pool.createPoolTransactionPayload.bind(SDK.Pool)}
              apiParams={{
                currencyA: "0x1::aptos_coin::AptosCoin",
                currencyB:
                  "0x6926bff1eab5554fa72ae167ed736acf623ab17fe81ebf2ea0d2138f8c533f77::type::T",
                currencyAAmount: Math.pow(10, 8),
                currencyBAmount: 1209161039,
                feeRateTier: feeRateTier,
                currentPriceTick: roundTickBySpacing(22950, feeRateTier),
                tickerLower: roundTickBySpacing(20720, feeRateTier),
                tickerUpper: roundTickBySpacing(24780, feeRateTier),
                slippage: 0.1,
              }}
            ></APIPostSection>
          </div>

          <h2>Position</h2>
          <div className='flex flex-col gap-3'>
            <APIGetSection
              label={"Position.fetchAllPositionsByAddress"}
              api={SDK.Position.fetchAllPositionsByAddress.bind(SDK.Position)}
              apiParams={{
                address: accountAddress,
              }}
            ></APIGetSection>

            <APIGetSection
              label={"Position.fetchPositionById"}
              api={SDK.Position.fetchPositionById.bind(SDK.Position)}
              apiParams={{
                positionId,
                address: accountAddress,
              }}
            ></APIGetSection>

            <APIGetSection
              label={"Position.fetchFeeHistory"}
              api={SDK.Position.fetchFeeHistory.bind(SDK.Position)}
              apiParams={{
                positionId,
                address:
                  "0x0fd95328afbea0e51bd4c948d695bc785a248a1783417c818a22f5e37bfe1bbf",
              }}
            ></APIGetSection>

            <APIViewSection
              label={"Position.fetchFeePayload"}
              api={SDK.Position.fetchFeePayload.bind(SDK.Position)}
              apiParams={{
                positionId,
              }}
            ></APIViewSection>

            {/* TODO: predict currencyBAmount */}

            <APIPostSection
              label='Position.addLiquidityPayload'
              api={SDK.Position.addLiquidityPayload.bind(SDK.Position)}
              apiParams={{
                positionId,
                currencyA: "0x1::aptos_coin::AptosCoin",
                currencyB:
                  "0x6926bff1eab5554fa72ae167ed736acf623ab17fe81ebf2ea0d2138f8c533f77::type::T",
                currencyAAmount: Math.pow(10, 7),
                currencyBAmount: 20566984,
                slippage: 0.1,
                feeRateTier: feeRateTier,
              }}
            ></APIPostSection>

            {/* TODO: calculate deltaLiquidity, Not validated yet */}
            <APIPostSection
              label='Position.removeLiquidityPayload'
              api={SDK.Position.removeLiquidityPayload.bind(SDK.Position)}
              apiParams={{
                positionId,
                currencyA: "0x1::aptos_coin::AptosCoin",
                currencyB:
                  "0x6926bff1eab5554fa72ae167ed736acf623ab17fe81ebf2ea0d2138f8c533f77::type::T",
                currencyAAmount: Math.pow(10, 7),
                currencyBAmount: 20566984,
                deltaLiquidity: 0,
                slippage: 0.1,
                recipient: accountAddress,
              }}
            ></APIPostSection>

            <APIPostSection
              label={"Position.claimFeePayload"}
              api={SDK.Position.claimFeePayload.bind(SDK.Position)}
              apiParams={{
                positionId,
                recipient: accountAddress,
              }}
            ></APIPostSection>
          </div>

          <h3>Swap</h3>
          {/* TODO: Here needs fa type*/}
          <div className='flex flex-col gap-3'>
            <APIPostSection
              label={"Swap.createTransactionPayload"}
              api={SDK.Swap.createTransactionPayload.bind(SDK.Swap)}
              apiParams={{
                currencyA: "0xa",
                currencyB:
                  "0xc5bcdea4d8a9f5809c5c945a3ff5698a347afb982c7389a335100e1b0043d115",
                currencyAAmount: Math.pow(10, 7),
                currencyBAmount: 98465499,
                slippage: 0.1,
                poolRoute: [positionId],
                recipient: accountAddress,
              }}
            ></APIPostSection>
          </div>
        </div>
      </div>
    </>
  );
}
