import { Network } from "@aptos-labs/ts-sdk";
import { HyperionSDK, SDKOptions } from "..";

interface InitHyperionSDKOptions {
  network: Network.MAINNET | Network.TESTNET;
}

const TESTNET_CONFIG: SDKOptions = {
  network: Network.TESTNET,
  contractAddress:
    "0x6a582a31e79c2139918b810de8c6a2f46d2c1c8b8500fb7dbe7918a26d75e13a",
  hyperionFullnodeIndexerURL: "https://api-testnet.hyperion.xyz/v1/graphql",
  officialFullnodeIndexerURL: "https://api.testnet.aptoslabs.com/v1/graphql",
};

const MAINNET_CONFIG: SDKOptions = {
  network: Network.MAINNET,
  contractAddress:
    "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c",
  hyperionFullnodeIndexerURL: "https://api.hyperion.xyz/v1/graphql",
  officialFullnodeIndexerURL: "https://api.mainnet.aptoslabs.com/v1/graphql",
};

export function initHyperionSDK(options: InitHyperionSDKOptions) {
  const { network } = options;
  return new HyperionSDK(
    network == Network.MAINNET ? MAINNET_CONFIG : TESTNET_CONFIG
  );
}
