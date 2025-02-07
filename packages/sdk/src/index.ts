import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import Pool from "./modules/poolModule";
import { Position } from "./modules/positionModule";
import { RequestModule } from "./modules/requestModule";
import { Reward } from "./modules/rewardModule";
import { Swap } from "./modules/swapModule";

export * from "./config";
export * from "./utils";

// Liquidity
// Swap
// Position

export type SDKOptions = {
  network: Network;
  // Hyperfluid Contract Address
  contractAddress: string;
  // Hyperfluid Fullnode Indexer URL
  hyperfluidFullnodeIndexerURL: string;
  // Official Fullnode Indexer URL
  officialFullnodeIndexerURL: string;
};

export class HyperfluidSDK {
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
      indexerURL: this._options.hyperfluidFullnodeIndexerURL,
      officialIndexerURL: this._options.officialFullnodeIndexerURL,
    });

    this._pool = new Pool(this);
    this._position = new Position(this);
    this._swap = new Swap(this);
    this._reward = new Reward(this);
    this._aptosClient = new Aptos(
      new AptosConfig({
        network: this._options.network,
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
