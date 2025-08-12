# @hyperionxyz/bridge

A TypeScript SDK for bridging tokens between Aptos and BSC (Binance Smart Chain) networks using the Hyperion bridge infrastructure.

## Features

- 🌉 Bidirectional token bridging between Aptos and BSC
- 💰 Quote generation for bridge fees
- 🔧 Easy-to-use TypeScript API
- 🛡️ Built-in validation and error handling
- ⚡ Support for custom tokens and configurations

## Installation

```bash
pnpm install @hyperionxyz/bridge
```

## Quick Start

```typescript
import { HyperionBridge, TOKENS } from "@hyperionxyz/bridge";

const bridge = new HyperionBridge();

// Bridge from Aptos to BSC
const quoteBridge = bridge.createQuoteSendPayloadFromAptosToBSC({
  token: TOKENS[0], // RION token
  amount: 100,
  sender: "0x...", // Aptos sender address
  recipient: "0x...", // BSC recipient address
});

// Get quote from Aptos client
const quoteResult = await aptosClient.view({ payload: quoteBridge });

// Create bridge transaction
const bridgePayload = bridge.createBridgePayloadFromAptosToBSC(
  {
    token: TOKENS[0],
    amount: 100,
    sender: "0x...",
    recipient: "0x...",
  },
  quoteResult
);

// Submit transaction
const tx = await wallet.signAndSubmitTransaction({
  data: bridgePayload,
});
```

## API Reference

### HyperionBridge Class

The main class for interacting with the Hyperion bridge.

#### Constructor

```typescript
const bridge = new HyperionBridge();
```

#### Methods

##### `addToken(token: BridgeToken)`

Add a custom token to the bridge.

```typescript
bridge.addToken({
  name: "Custom Token",
  symbol: "CTK",
  chain: {
    aptos: {
      address: "0x...",
      oftContractAddress: "0x...",
      logo: "https://...",
      decimals: 8,
    },
    bsc: {
      address: "0x...",
      decimals: 18,
    },
  },
});
```

##### Aptos to BSC Bridge

###### `createQuoteSendPayloadFromAptosToBSC(args: BridgeArgs): InputViewFunctionData`

Creates a quote payload for bridging from Aptos to BSC.

**Parameters:**

- `args.token` - The token to bridge
- `args.amount` - Amount to bridge
- `args.sender` - Aptos sender address
- `args.recipient` - BSC recipient address

**Returns:** View function payload for getting bridge quotes

###### `createBridgePayloadFromAptosToBSC(args: BridgeArgs, quoteResult: any[]): InputGenerateTransactionPayloadData`

Creates the actual bridge transaction payload from Aptos to BSC.

**Parameters:**

- `args` - Bridge arguments (same as quote)
- `quoteResult` - Result from the quote view function

**Returns:** Transaction payload for bridge execution

##### BSC to Aptos Bridge

###### `createQuoteSendPayloadFromBSCToAptos(args: BridgeArgs)`

Creates a quote payload for bridging from BSC to Aptos.

**Returns:** Contract call configuration for BSC quote

###### `createBridgePayloadFromBSCToAptos(args: BridgeArgs, quoteResult: any)`

Creates the actual bridge transaction payload from BSC to Aptos.

**Parameters:**

- `args` - Bridge arguments
- `quoteResult` - Result from the BSC quote call

**Returns:** Contract call configuration for BSC bridge execution

### Types

#### BridgeToken

```typescript
interface BridgeToken {
  name: string;
  symbol: string;
  chain: {
    aptos: {
      address: string;
      oftContractAddress: string;
      logo: string;
      decimals: number;
    };
    bsc: {
      address: string;
      decimals: number;
    };
  };
}
```

#### BridgeArgs

```typescript
type BridgeArgs = {
  token: BridgeToken;
  amount: number;
  sender: string;
  recipient: string;
};
```

## Supported Tokens

The bridge comes with pre-configured support for:

- **RION (Hyperion)**: Native bridging between Aptos and BSC

Access supported tokens via:

```typescript
import { TOKENS } from "@hyperionxyz/bridge";
console.log(TOKENS); // Array of supported tokens
```

## Examples

### Complete Aptos to BSC Bridge Flow

```typescript
import { HyperionBridge, TOKENS } from "@hyperionxyz/bridge";
import { AptosConfig, Aptos, Network } from "@aptos-labs/ts-sdk";

const aptosConfig = new AptosConfig({ network: Network.MAINNET });
const aptosClient = new Aptos(aptosConfig);
const bridge = new HyperionBridge();

async function bridgeAptosToBSC() {
  // 1. Create quote payload
  const quotePayload = bridge.createQuoteSendPayloadFromAptosToBSC({
    token: TOKENS[0],
    amount: 100,
    sender: "0x123...", // Your Aptos address
    recipient: "0x456...", // BSC recipient address
  });

  // 2. Get quote
  const quoteResult = await aptosClient.view({ payload: quotePayload });
  console.log("Bridge fee:", quoteResult[0]);

  // 3. Create bridge transaction
  const bridgePayload = bridge.createBridgePayloadFromAptosToBSC(
    {
      token: TOKENS[0],
      amount: 100,
      sender: "0x123...",
      recipient: "0x456...",
    },
    quoteResult
  );

  // 4. Submit transaction (requires wallet integration)
  // const tx = await wallet.signAndSubmitTransaction({
  //   data: bridgePayload,
  // });

  return bridgePayload;
}
```

### Complete BSC to Aptos Bridge Flow

```typescript
import { HyperionBridge, TOKENS } from "@hyperionxyz/bridge";
import { useReadContract, useWriteContract } from "wagmi";

const bridge = new HyperionBridge();

async function bridgeBSCToAptos() {
  // 1. Create quote payload
  const quoteConfig = bridge.createQuoteSendPayloadFromBSCToAptos({
    token: TOKENS[0],
    amount: 100,
    sender: "0x123...", // BSC sender address
    recipient: "0x456...", // Aptos recipient address
  });

  // 2. Get quote (using wagmi or web3 library)
  const { data: quoteResult } = useReadContract(quoteConfig);

  // 3. Create bridge transaction
  const bridgeConfig = bridge.createBridgePayloadFromBSCToAptos(
    {
      token: TOKENS[0],
      amount: 100,
      sender: "0x123...",
      recipient: "0x456...",
    },
    quoteResult
  );

  // 4. Execute bridge transaction
  const { writeContractAsync } = useWriteContract();
  const tx = await writeContractAsync(bridgeConfig);

  console.log("tx", tx);
}
```

## Dependencies

- `@aptos-labs/ts-sdk`: Aptos TypeScript SDK
- `aptos-tool`: Aptos utilities
- `bignumber.js`: Precision arithmetic
- `buffer`: Node.js Buffer polyfill

## License

Apache-2.0

## Support

For issues and questions, please visit the [GitHub repository](https://github.com/hyperionxyz/hyperfluid-sdk).
