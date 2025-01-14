import { Network } from "@aptos-labs/ts-sdk";
import { HyperfluidSDK, SDKOptions } from "..";

interface InitHyperfluidOptions {
  network: Network.MAINNET | Network.TESTNET;
}

const TESTNET_CONFIG: SDKOptions = {
  contractAddress:
    "0xdd8d1a676801c6789fac9a06b8f6ced76f766c798f7e5ea276f25d80b9aa0af0",
  hyperfluidFullnodeIndexerURL: "https://api-testnet.hyperfluid.xyz/v1/graphql",
  officialFullnodeIndexerURL: "https://api.testnet.aptoslabs.com/v1/graphql",
};

const MAINNET_CONFIG: SDKOptions = {
  contractAddress:
    "0x0debef4d61b6af92fa0ee64fe3ddb5bb2782eca01950ad66c88db40411958725",
  hyperfluidFullnodeIndexerURL: "https://api.hyperfluid.xyz/v1/graphql",
  officialFullnodeIndexerURL: "https://api.mainnet.aptoslabs.com/v1/graphql",
};

export function initHyperfluidSDK(options: InitHyperfluidOptions) {
  const { network } = options;
  return new HyperfluidSDK(
    network == Network.MAINNET ? MAINNET_CONFIG : TESTNET_CONFIG
  );
}
