import { Controller, Get, Param } from "@nestjs/common";
import { AppService } from "./app.service";
import { initHyperionSDK } from "@hyperionxyz/sdk";
import { Network } from "@aptos-labs/ts-sdk";

const sdk = initHyperionSDK({
  network: Network.MAINNET,
  APTOS_API_KEY: "AG-",
});

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get("est-from-amount")
  async estFromAmount() {
    const ret: any = await sdk.Swap.estFromAmount({
      amount: Math.pow(10, 7),
      from: "0xa",
      to: "0xace541cbd9b5d60f38cf545ac27738353f70b4f9b970c37a54cf7acfd19dad76",
      safeMode: false,
    });

    return ret;
  }

  @Get("position-token")
  async positionToken() {
    const ret: any = await sdk.Position.fetchTokensAmountByPositionId({
      positionId:
        "0xd8246f44fcc1b4908caad8b0850f9ac4665c392578098bcff9344c2d19e9475a",
    });

    return ret;
  }

  @Get(":poolId")
  async getHello(@Param("poolId") poolId): Promise<string> {
    if (!poolId) return "Please provide poolId";

    const pool = await sdk.Pool.fetchPoolById({
      poolId,
    });

    return pool;
  }
}
