import { Controller, Get, Param } from "@nestjs/common";
import { AppService } from "./app.service";
import { initHyperionSDK } from "@hyperionxyz/sdk";
import { Network } from "@aptos-labs/ts-sdk";

const sdk = initHyperionSDK({ network: Network.MAINNET });

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

  @Get(":poolId")
  async getHello(@Param("poolId") poolId): Promise<string> {
    if (!poolId) return "Please provide poolId";

    const pool = await sdk.Pool.fetchPoolById({
      poolId,
    });

    return pool;
  }
}
