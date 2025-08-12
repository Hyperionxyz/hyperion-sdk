import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { bsc } from "@reown/appkit/networks";
import "dotenv/config";

// 1. Get projectId from https://cloud.reown.com
const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
  "1cc748b7175b2e30f772f6860b42a479" ||
  "demo-project-id";

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  console.warn(
    "NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Using demo project ID."
  );
}

// 2. Set up Wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks: [bsc],
  projectId,
});

// 3. Configure the metadata
const metadata = {
  name: "Hyperion Bridge",
  description: "Bridge tokens between Aptos and BSC",
  url: "https://hyperion.xyz", // origin must match your domain & subdomain
  icons: ["https://assets.hyperion.xyz/aptos-token/main/logos/RION.svg"],
};

// 4. Create the modal
export const appKit = createAppKit({
  adapters: [wagmiAdapter],
  networks: [bsc],
  metadata,
  projectId,
  features: {},
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
