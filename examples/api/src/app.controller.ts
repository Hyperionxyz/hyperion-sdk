import { Controller, Get, Param } from "@nestjs/common";
import { AppService } from "./app.service";
import { initHyperionSDK } from "@hyperionxyz/sdk";
import { Network } from "@aptos-labs/ts-sdk";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get(":poolId")
  async getHello(@Param("poolId") poolId): Promise<string> {
    if (!poolId) return "Please provide poolId";

    const sdk = initHyperionSDK({ network: Network.MAINNET });
    const pool = await sdk.Pool.fetchPoolById({
      poolId,
    });

    return pool;
  }
}
