# @hyperionxyz/sdk

This SDK allows you to interact with the Hyperion API.  
You can use it to request data, create pools/positions and more.

## Installation

```bash
pnpm install @aptos-labs/ts-sdk @aptos-labs/script-composer-sdk @hyperionxyz/sdk
```

## Version 0.1 Compatibility

`@hyperionxyz/sdk@0.1.0` migrates Hyperion data reads from GraphQL to REST.

Most integrations do not need code changes if they use the high-level SDK modules:

- `SDK.Pool`
- `SDK.Position`
- `SDK.Reward`
- `SDK.Swap`

The following low-level GraphQL integration points were removed:

- `requestModule.queryIndexer`
- `requestModule.queryOfficialIndexer`
- imports from `src/config/queries`
- `SDKOptions.officialFullNodeIndexerURL`

New SDK options should use the Hyperion API host:

```ts
import { Network } from "@aptos-labs/ts-sdk";
import { HyperionSDK } from "@hyperionxyz/sdk";

const SDK = new HyperionSDK({
  network: Network.MAINNET,
  contractAddress:
    "0x8b4a2c4bb53857c718a04c020b98f8c2e1f99a68b0f57389a8bf5434cd22e05c",
  hyperionFullNodeIndexerURL: "https://api.hyperion.xyz",
  hyperionAPIHost: "https://api.hyperion.xyz",
  APTOS_API_KEY: "",
});
```

Legacy `hyperionFullNodeIndexerURL` values ending in `/v1/graphql` are normalized internally, but new code should pass the API host directly.

## Documentation

[Documentation](https://docs.hyperion.xyz/developer/via-sdk/getting-started)
