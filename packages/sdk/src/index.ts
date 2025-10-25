import { Aptos, AptosConfig, ClientConfig, Network } from "@aptos-labs/ts-sdk";
import Pool from "./modules/poolModule";
import { Position } from "./modules/positionModule";
import { RequestModule } from "./modules/requestModule";
import { Reward } from "./modules/rewardModule";
import { Swap } from "./modules/swapModule";

export * from "./config";
export * from "./utils";
export type { AggregateSwapRouteArgs } from "./helper/aggregateSwap";
export * from "./helper/aggregateSwap/type.d";

export type SDKOptions = {
  network: Network;
  // Hyperion Contract Address
  contractAddress: string;
  // Hyperion FullNode Indexer URL
  hyperionFullNodeIndexerURL: string;
  // Hyperion API Host
  hyperionAPIHost: string;
  // Official FullNode Indexer URL
  officialFullNodeIndexerURL: string;
  // API Key of Aptos
  APTOS_API_KEY: string;
};

export class HyperionSDK {
  protected _options: SDKOptions;

  protected _requestModule: RequestModule;

  protected _pool: Pool;

  protected _position: Position;

  protected _swap: Swap;

  protected _reward: Reward;

  protected _aptosClient: Aptos;

  constructor(opt: SDKOptions) {
    this._options = opt;

    this._requestModule = new RequestModule({
      indexerURL: this._options.hyperionFullNodeIndexerURL,
      officialIndexerURL: this._options.officialFullNodeIndexerURL,
    });

    this._pool = new Pool(this);
    this._position = new Position(this);
    this._swap = new Swap(this);
    this._reward = new Reward(this);

    // Initialize Aptos Client
    const clientConfig: ClientConfig = {
      API_KEY: this._options.APTOS_API_KEY,
    };
    this._aptosClient = new Aptos(
      new AptosConfig({
        network: this._options.network,
        clientConfig,
      })
    );
  }

  get Pool() {
    return this._pool;
  }

  get Position() {
    return this._position;
  }

  get Swap() {
    return this._swap;
  }

  get Reward() {
    return this._reward;
  }

  get AptosClient() {
    return this._aptosClient;
  }

  get sdkOptions() {
    return this._options;
  }

  get requestModule() {
    return this._requestModule;
  }
}
