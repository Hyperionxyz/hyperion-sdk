# Hyperion SDK

A comprehensive TypeScript SDK ecosystem for interacting with Hyperion's DeFi protocols on Aptos, including bridge functionality between Aptos and BSC networks.

## Overview

Hyperion SDK provides a collection of packages and tools to help developers integrate with Hyperion's ecosystem:

- **Core SDK** (`@hyperionxyz/sdk`): Complete API for interacting with Hyperion's DeFi protocols including pools, positions, swaps, and rewards
- **Bridge SDK** (`@hyperionxyz/bridge`): Bidirectional token bridging between Aptos and BSC (Binance Smart Chain)
- **Example Applications**: Reference implementations showcasing SDK usage

## Packages

### [@hyperionxyz/sdk](./packages/sdk) - Core Hyperion SDK

The main SDK for interacting with Hyperion's DeFi protocols on Aptos.

```bash
pnpm install @hyperionxyz/sdk
```

**Features:**

- Pool and position management
- Swap operations
- Reward claiming
- GraphQL query support
- TypeScript support

### [@hyperionxyz/bridge](./packages/bridge) - Cross-Chain Bridge

TypeScript SDK for bridging tokens between Aptos and BSC networks.

```bash
pnpm install @hyperionxyz/bridge
```

**Features:**

- 🌉 Bidirectional bridging (Aptos ↔ BSC)
- 💰 Bridge fee calculation
- 🔧 Easy-to-use TypeScript API
- 🛡️ Built-in validation and error handling
- ⚡ Custom token support

## Quick Start

### Core SDK Usage

```typescript
import { HyperionSDK } from "@hyperionxyz/sdk";

const sdk = new HyperionSDK();

// Get pool data
const pools = await sdk.getPools();

// Create a swap
const currencyAAmount = Math.pow(10, 7);
const { amountOut: currencyBAmount, path: poolRoute } =
  await sdk.Swap.estToAmount({
    amount: currencyAAmount,
    from: "0xa",
    to: "0xc5bcdea4d8a9f5809c5c945a3ff5698a347afb982c7389a335100e1b0043d115",
    // safeMode
    // if safeMode is true, only few swap token pairs will return path route
    // default: true. support from (v0.0.12)
    safeMode: false,
  });

const params = {
  currencyA: "0xa",
  currencyB:
    "0xc5bcdea4d8a9f5809c5c945a3ff5698a347afb982c7389a335100e1b0043d115",
  currencyAAmount,
  currencyBAmount,
  slippage: 0.1,
  poolRoute,
  recipient: "",
};

const payload = await sdk.Swap.swapTransactionPayload(params);
```

### Bridge Usage

```typescript
import { HyperionBridge, TOKENS } from "@hyperionxyz/bridge";

const bridge = new HyperionBridge();

// Bridge from Aptos to BSC
const quoteBridge = bridge.createQuoteSendPayloadFromAptosToBSC({
  token: TOKENS[0],
  amount: 0.001,
  sender: "0x...", // Aptos address
  recipient: "0x...", // BSC address
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

## Development

This is a monorepo managed with pnpm workspaces and Turbo.

### Prerequisites

- Node.js 18+
- pnpm 9+

### Installation

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run development mode
pnpm dev
```

### Available Scripts

```bash
pnpm build          # Build all packages
pnpm dev            # Development mode with watch
pnpm lint           # Lint all packages
pnpm test           # Run tests
pnpm format         # Format code with Prettier
pnpm clean          # Clean build artifacts
```

## Examples

### [Hyperion Web Demo](./examples/hyperion)

A comprehensive Next.js application demonstrating both Core SDK and Bridge SDK usage:

- Interactive API documentation
- Bridge interface with wallet connections
- Real-time transaction monitoring
- Support for both Aptos and BSC wallets

```bash
cd examples/hyperion
pnpm dev
```

### [API Demo](./examples/api)

NestJS backend service showcasing server-side SDK integration:

```bash
cd examples/api
pnpm start:dev
```

## Documentation

- [Core SDK Documentation](https://hyperfluid.gitbook.io/hyperion-docs/developer/via-sdk/getting-started)
- [Bridge SDK Guide](./packages/bridge/README.md)
- [API Reference](./packages/sdk/README.md)

## Support

- 📖 [Documentation](https://docs.hyperion.xyz/developer/via-sdk)
- 🐛 [Issues](https://github.com/Hyperionxyz/hyperion-sdk/issues)
- 💬 [Discord](https://discord.com/invite/MYex8tHXtN)

## License

Apache-2.0
