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

/**
 * Configuration options for the Hyperion SDK
 */
export type SDKOptions = {
  /** Aptos network (mainnet, testnet, devnet, local) */
  network: Network;
  /** Hyperion contract address */
  contractAddress: string;
  /** Hyperion FullNode indexer URL */
  hyperionFullNodeIndexerURL: string;
  /** Hyperion API host */
  hyperionAPIHost: string;
  /** Official FullNode indexer URL */
  officialFullNodeIndexerURL: string;
  /** API key for Aptos */
  APTOS_API_KEY: string;
};

/**
 * Main SDK class for interacting with Hyperion protocol
 *
 * Provides access to all protocol modules including pools, positions, swaps, and rewards
 *
 * @example
 * const sdk = new HyperionSDK({
 *   network: Network.MAINNET,
 *   contractAddress: "0x...",
 *   hyperionFullNodeIndexerURL: "https://...",
 *   hyperionAPIHost: "https://...",
 *   officialFullNodeIndexerURL: "https://...",
 *   APTOS_API_KEY: "your-api-key",
 * });
 *
 * // Use the SDK
 * const pools = await sdk.Pool.fetchAllPools();
 */
export class HyperionSDK {
  /** SDK configuration options */
  protected _options: SDKOptions;

  /** Request module for GraphQL queries */
  protected _requestModule: RequestModule;

  /** Pool module instance */
  protected _pool: Pool;

  /** Position module instance */
  protected _position: Position;

  /** Swap module instance */
  protected _swap: Swap;

  /** Reward module instance */
  protected _reward: Reward;

  /** Aptos client instance */
  protected _aptosClient: Aptos;

  /**
   * Create a new HyperionSDK instance
   *
   * @param {SDKOptions} opt - SDK configuration options
   *
   * @example
   * const sdk = new HyperionSDK({
   *   network: Network.MAINNET,
   *   contractAddress: "0x...",
   *   hyperionFullNodeIndexerURL: "https://...",
   *   hyperionAPIHost: "https://...",
   *   officialFullNodeIndexerURL: "https://...",
   *   APTOS_API_KEY: "your-api-key",
   * });
   */
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

  /**
   * Get the Pool module instance
   *
   * @returns {Pool} Pool module for managing liquidity pools
   */
  get Pool() {
    return this._pool;
  }

  /**
   * Get the Position module instance
   *
   * @returns {Position} Position module for managing liquidity positions
   */
  get Position() {
    return this._position;
  }

  /**
   * Get the Swap module instance
   *
   * @returns {Swap} Swap module for token swapping
   */
  get Swap() {
    return this._swap;
  }

  /**
   * Get the Reward module instance
   *
   * @returns {Reward} Reward module for managing rewards
   */
  get Reward() {
    return this._reward;
  }

  /**
   * Get the Aptos client instance
   *
   * @returns {Aptos} Aptos client for blockchain interactions
   */
  get AptosClient() {
    return this._aptosClient;
  }

  /**
   * Get the SDK configuration options
   *
   * @returns {SDKOptions} SDK configuration options
   */
  get sdkOptions() {
    return this._options;
  }

  /**
   * Get the Request module instance
   *
   * @returns {RequestModule} Request module for GraphQL queries
   */
  get requestModule() {
    return this._requestModule;
  }
}
