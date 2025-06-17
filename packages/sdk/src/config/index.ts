import { Network } from "@aptos-labs/ts-sdk";
import { HyperionSDK, SDKOptions } from "..";

interface InitHyperionSDKOptions {
  network: Network.MAINNET | Network.TESTNET;
  // API Key of Aptos
  APTOS_API_KEY: string;
}

const TESTNET_CONFIG: SDKOptions = {
  network: Network.TESTNET,
  contractAddress:
    "0xfe095a2ce8ed8ff3c152f2bb3a3afdd3603aa3e60395ffea8cb5ad19801e20c9",
  hyperionFullNodeIndexerURL: "https://api-testnet.hyperion.xyz/v1/graphql",
  officialFullNodeIndexerURL: "https://api.testnet.aptoslabs.com/v1/graphql",
  APTOS_API_KEY: "",
};

const MAINNET_CONFIG: SDKOptions = {
  network: Network.MAINNET,
  contractAddress:
    "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c",
  hyperionFullNodeIndexerURL: "https://api.hyperion.xyz/v1/graphql",
  officialFullNodeIndexerURL: "https://api.mainnet.aptoslabs.com/v1/graphql",
  APTOS_API_KEY: "",
};

export function initHyperionSDK(options: InitHyperionSDKOptions) {
  const { network, APTOS_API_KEY } = options;
  return new HyperionSDK({
    ...(network == Network.MAINNET ? MAINNET_CONFIG : TESTNET_CONFIG),
    APTOS_API_KEY,
  });
}
