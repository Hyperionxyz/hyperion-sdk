import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { useAccount as useBSCAccount, useReadContract } from "wagmi";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { TOKENS } from "@hyperionxyz/bridge";

export const useBridgeWallets = (selectedTokenIndex: number) => {
  const { account, signAndSubmitTransaction } = useWallet();
  const { address: bscAddress, isConnected: isBscConnected } = useBSCAccount();
  
  const [aptosBalance, setAptosBalance] = useState<string>("0");
  const [bscBalance, setBscBalance] = useState<string>("0");
  const [balanceLoading, setBalanceLoading] = useState(false);

  const aptos = new Aptos(new AptosConfig({ network: Network.MAINNET }));
  const selectedToken = TOKENS[selectedTokenIndex];

  // Get Aptos balance
  const getAptosBalance = async () => {
    if (!account?.address) return;

    try {
      setBalanceLoading(true);
      const result = await aptos.getCurrentFungibleAssetBalances({
        options: {
          where: {
            owner_address: {
              _eq: account.address,
            },
            asset_type: {
              _eq: selectedToken.chain.aptos.address,
            },
          },
        },
      });

      if (result?.length > 0) {
        const formattedBalance = (
          Number(result?.[0].amount) /
          Math.pow(10, selectedToken.chain.aptos.decimals)
        ).toFixed(6);
        setAptosBalance(formattedBalance);
      } else {
        setAptosBalance("0");
      }
    } catch (error) {
      console.error("Error getting Aptos balance:", error);
      setAptosBalance("Error");
    } finally {
      setBalanceLoading(false);
    }
  };

  // BSC balance using wagmi hook
  const { data: bscBalanceRaw } = useReadContract({
    address: selectedToken.chain.bsc.address as `0x${string}`,
    abi: [
      {
        inputs: [{ name: "account", type: "address" }],
        name: "balanceOf",
        outputs: [{ name: "", type: "uint256" }],
        stateMutability: "view",
        type: "function",
      },
    ],
    functionName: "balanceOf",
    args: bscAddress ? [bscAddress] : undefined,
    query: {
      enabled: !!bscAddress,
    },
  });

  // Format BSC balance
  useEffect(() => {
    if (bscBalanceRaw) {
      const formattedBalance = (
        Number(bscBalanceRaw) / Math.pow(10, selectedToken.chain.bsc.decimals)
      ).toFixed(6);
      setBscBalance(formattedBalance);
    } else {
      setBscBalance("0");
    }
  }, [bscBalanceRaw, selectedToken.chain.bsc.decimals]);

  // Update balances when token or addresses change
  useEffect(() => {
    if (account?.address) {
      getAptosBalance();
    } else {
      setAptosBalance("0");
    }
  }, [account?.address, selectedTokenIndex]);

  const executeAptosPayload = async (payload: any, type: "view" | "transaction") => {
    if (!account?.address) {
      throw new Error("Please connect your Aptos wallet first");
    }

    try {
      if (type === "view") {
        const result = await aptos.view({ payload });
        return result;
      } else {
        const response = await signAndSubmitTransaction({
          data: payload,
        });
        return response;
      }
    } catch (error: any) {
      throw new Error(`Aptos execution failed: ${error.message}`);
    }
  };

  return {
    // Wallet states
    account,
    bscAddress,
    isBscConnected,
    
    // Balances
    aptosBalance,
    bscBalance,
    balanceLoading,
    
    // Methods
    executeAptosPayload,
    refreshAptosBalance: getAptosBalance,
    
    // Wallet check helpers
    isAptosConnected: !!account?.address,
    isBscWalletConnected: !!bscAddress,
  };
};