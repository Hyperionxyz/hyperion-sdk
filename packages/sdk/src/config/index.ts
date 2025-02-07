import { Network } from "@aptos-labs/ts-sdk";
import { HyperfluidSDK, SDKOptions } from "..";

interface InitHyperfluidOptions {
  network: Network.MAINNET | Network.TESTNET;
}

const TESTNET_CONFIG: SDKOptions = {
  network: Network.TESTNET,
  contractAddress:
    "0x6a582a31e79c2139918b810de8c6a2f46d2c1c8b8500fb7dbe7918a26d75e13a",
  hyperfluidFullnodeIndexerURL: "https://api-testnet.hyperfluid.xyz/v1/graphql",
  officialFullnodeIndexerURL: "https://api.testnet.aptoslabs.com/v1/graphql",
};

const MAINNET_CONFIG: SDKOptions = {
  network: Network.MAINNET,
  contractAddress:
    "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c",
  hyperfluidFullnodeIndexerURL: "https://api.hyperfluid.xyz/v1/graphql",
  officialFullnodeIndexerURL: "https://api.mainnet.aptoslabs.com/v1/graphql",
};

export function initHyperfluidSDK(options: InitHyperfluidOptions) {
  const { network } = options;
  return new HyperfluidSDK(
    network == Network.MAINNET ? MAINNET_CONFIG : TESTNET_CONFIG
  );
}
