"use client";

import { useState, useEffect } from "react";
import { HyperionBridge, TOKENS } from "@hyperionxyz/bridge";
import { Button } from "@/components/ui/button";
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { Header } from "@/components/Header";
import { AutoConnectStatus } from "@/components/AutoConnectStatus";

import { useBridgeWallets } from "@/hooks/useBridgeWallets";
import { TokenSelection } from "@/components/TokenSelection";
import { WalletConnections } from "@/components/WalletConnections";
import { BridgeDirectionSelector } from "@/components/BridgeDirection";
import { BridgeForm } from "@/components/BridgeForm";
import { QuoteResult, BridgePayloadResult } from "@/components/BridgeResults";
import { ApiDocumentation } from "@/components/ApiDocumentation";

type BridgeDirection = "aptos-to-bsc" | "bsc-to-aptos";

export default function BridgePage() {
  const bridge = new HyperionBridge();
  
  const [direction, setDirection] = useState<BridgeDirection>("aptos-to-bsc");
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);
  const [amount, setAmount] = useState("0.01");
  const [recipient, setRecipient] = useState("");
  const [quoteResult, setQuoteResult] = useState<any>(null);
  const [bridgePayload, setBridgePayload] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copied, setCopied] = useState("");
  const [realQuoteResult, setRealQuoteResult] = useState<any>(null);
  const [bscTxHash, setBscTxHash] = useState<string | null>(null);

  const {
    account,
    bscAddress,
    isBscConnected,
    aptosBalance,
    bscBalance,
    executeAptosPayload,
  } = useBridgeWallets(selectedTokenIndex);

  const selectedToken = TOKENS[selectedTokenIndex];

  // BSC write contract hook
  const {
    writeContract,
    data: bscTxData,
    error: bscTxError,
  } = useWriteContract();

  // BSC transaction confirmation
  const { isLoading: isBscTxConfirming, isSuccess: isBscTxSuccess } =
    useWaitForTransactionReceipt({
      hash: bscTxData,
    });

  // BSC quote readContract hook
  const { data: bscQuoteData, refetch: refetchBscQuote } = useReadContract({
    address: selectedToken.chain.bsc.address as `0x${string}`,
    abi: quoteResult?.abi || [],
    functionName: quoteResult?.functionName || "quoteSend",
    args: quoteResult?.args || [],
    chainId: quoteResult?.chainId,
    query: {
      enabled: !!quoteResult && direction === "bsc-to-aptos" && !!bscAddress,
    },
  });

  const handleGetQuote = async () => {
    if (direction === "aptos-to-bsc" && !account?.address) {
      setError("Please connect your Aptos wallet first");
      return;
    }

    if (direction === "bsc-to-aptos" && !bscAddress) {
      setError("Please connect your BSC wallet first");
      return;
    }

    if (!recipient.trim()) {
      setError("Please enter recipient address");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    setQuoteResult(null);
    setBridgePayload(null);
    setRealQuoteResult(null);

    try {
      const token = TOKENS[selectedTokenIndex];
      const senderAddress = direction === "aptos-to-bsc" ? account?.address : bscAddress;
      const args = {
        token,
        amount: parseFloat(amount),
        sender: senderAddress || "",
        recipient: recipient.trim(),
      };

      let result;
      if (direction === "aptos-to-bsc") {
        result = bridge.createQuoteSendPayloadFromAptosToBSC(args);
      } else {
        result = bridge.createQuoteSendPayloadFromBSCToAptos(args);
      }

      setQuoteResult(result);
      setSuccessMessage("Quote retrieved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to get quote");
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteQuote = async () => {
    if (!quoteResult) return;

    try {
      setLoading(true);
      let result;

      if (direction === "aptos-to-bsc") {
        result = await executeAptosPayload(quoteResult, "view");
        if (result) {
          setRealQuoteResult(result);
          setSuccessMessage(
            `Aptos quote executed successfully! Result: [${result.join(", ")}] - Now you can create bridge payload with real quote data.`
          );
        }
      } else {
        await refetchBscQuote();
        if (bscQuoteData) {
          setRealQuoteResult(bscQuoteData);
          setSuccessMessage(
            `BSC quote executed successfully! Result: ${JSON.stringify(bscQuoteData)} - Now you can create bridge payload with real quote data.`
          );
        } else {
          setError("Failed to get BSC quote data - refetch returned undefined");
        }
      }
    } catch (error) {
      console.error("Execute quote error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBridgePayload = async () => {
    if (direction === "aptos-to-bsc" && !account?.address) {
      setError("Please connect your Aptos wallet first");
      return;
    }

    if (direction === "bsc-to-aptos" && !bscAddress) {
      setError("Please connect your BSC wallet first");
      return;
    }

    if (!recipient.trim()) {
      setError("Please enter recipient address");
      return;
    }

    if (!quoteResult) {
      setError("Please get quote first");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMessage("");
    setBridgePayload(null);

    try {
      const token = TOKENS[selectedTokenIndex];
      const senderAddress = direction === "aptos-to-bsc" ? account!.address : bscAddress!;
      const args = {
        token,
        amount: parseFloat(amount),
        sender: senderAddress,
        recipient: recipient.trim(),
      };

      let result;
      if (direction === "aptos-to-bsc") {
        result = bridge.createBridgePayloadFromAptosToBSC(args, realQuoteResult);
      } else {
        result = bridge.createBridgePayloadFromBSCToAptos(args, realQuoteResult);
      }

      setBridgePayload(result);
      setSuccessMessage("Bridge payload created successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to create bridge payload");
    } finally {
      setLoading(false);
    }
  };

  const executeBscWriteContract = async (payload: any) => {
    if (!bscAddress) {
      setError("Please connect your BSC wallet first");
      return;
    }

    try {
      writeContract({
        address: payload.address,
        abi: payload.abi,
        functionName: payload.functionName,
        args: payload.args,
        chainId: payload.chainId,
        value: payload.value,
      });
      setSuccessMessage(`BSC transaction initiated successfully!`);
    } catch (error: any) {
      setError(`BSC execution failed: ${error.message}`);
      throw error;
    }
  };

  const handleExecuteBridge = async () => {
    if (!bridgePayload) return;

    try {
      setLoading(true);

      if (direction === "aptos-to-bsc") {
        await executeAptosPayload(bridgePayload, "transaction");
      } else {
        await executeBscWriteContract(bridgePayload);
      }
    } catch (error) {
      console.error("Execute bridge transaction error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetDemo = () => {
    setQuoteResult(null);
    setBridgePayload(null);
    setRealQuoteResult(null);
    setError("");
    setSuccessMessage("");
    setAmount("100");
    setRecipient("");
    setSelectedTokenIndex(0);

    setTimeout(() => {
      if (direction === "aptos-to-bsc" && bscAddress) {
        setRecipient(bscAddress);
      } else if (direction === "bsc-to-aptos" && account?.address) {
        setRecipient(account.address);
      }
    }, 0);
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleAutoFillRecipient = () => {
    if (direction === "aptos-to-bsc" && bscAddress) {
      setRecipient(bscAddress);
    } else if (direction === "bsc-to-aptos" && account?.address) {
      setRecipient(account.address);
    }
  };

  const canAutoFillRecipient = 
    (direction === "aptos-to-bsc" && !!bscAddress) ||
    (direction === "bsc-to-aptos" && !!account?.address);

  // Handle BSC transaction status updates
  useEffect(() => {
    if (bscTxData) {
      setBscTxHash(bscTxData);
      setSuccessMessage(`BSC transaction submitted! Hash: ${bscTxData}`);
    }
  }, [bscTxData]);

  useEffect(() => {
    if (isBscTxSuccess) {
      setSuccessMessage(`BSC transaction confirmed successfully! Hash: ${bscTxHash}`);
    }
  }, [isBscTxSuccess, bscTxHash]);

  useEffect(() => {
    if (bscTxError) {
      setError(`BSC transaction failed: ${bscTxError.message}`);
    }
  }, [bscTxError]);

  // Auto-fill recipient address when direction changes and wallets are connected
  useEffect(() => {
    setRecipient("");
    if (direction === "aptos-to-bsc" && bscAddress) {
      setRecipient(bscAddress);
    } else if (direction === "bsc-to-aptos" && account?.address) {
      setRecipient(account.address);
    }
  }, [direction]);

  useEffect(() => {
    if (direction === "aptos-to-bsc" && bscAddress && !recipient) {
      setRecipient(bscAddress);
    }
  }, [bscAddress]);

  useEffect(() => {
    if (direction === "bsc-to-aptos" && account?.address && !recipient) {
      setRecipient(account.address);
    }
  }, [account?.address]);

  return (
    <>
      <Header />

      <div className="max-w-7xl w-full mx-auto p-4 mt-16">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">Hyperion Bridge Demo</h1>
            <Button onClick={resetDemo} variant="outline">
              Reset
            </Button>
          </div>

          <TokenSelection
            selectedTokenIndex={selectedTokenIndex}
            onTokenChange={setSelectedTokenIndex}
          />

          <WalletConnections
            aptosAccount={account}
            bscAddress={bscAddress}
            isBscConnected={isBscConnected}
            selectedToken={selectedToken}
            aptosBalance={aptosBalance}
            bscBalance={bscBalance}
          />

          <BridgeDirectionSelector
            direction={direction}
            onDirectionChange={setDirection}
          />

          <BridgeForm
            direction={direction}
            aptosAccount={account}
            bscAddress={bscAddress}
            amount={amount}
            recipient={recipient}
            error={error}
            successMessage={successMessage}
            loading={loading}
            onAmountChange={setAmount}
            onRecipientChange={setRecipient}
            onGetQuote={handleGetQuote}
            onExecuteQuote={handleExecuteQuote}
            onAutoFillRecipient={handleAutoFillRecipient}
            canAutoFillRecipient={canAutoFillRecipient}
            realQuoteResult={realQuoteResult}
          />

          {quoteResult && (
            <QuoteResult
              quoteResult={quoteResult}
              onCopy={copyToClipboard}
              copied={copied}
              onCreateBridgePayload={handleCreateBridgePayload}
              realQuoteResult={realQuoteResult}
              loading={loading}
            />
          )}

          {bridgePayload && (
            <BridgePayloadResult
              bridgePayload={bridgePayload}
              onCopy={copyToClipboard}
              copied={copied}
              onExecuteBridge={handleExecuteBridge}
              realQuoteResult={realQuoteResult}
              loading={loading}
              direction={direction}
              bscTxData={bscTxData}
              isBscTxConfirming={isBscTxConfirming}
              isBscTxSuccess={isBscTxSuccess}
              aptosAccount={account}
              bscAddress={bscAddress}
            />
          )}

          <ApiDocumentation />
        </div>
      </div>
      <AutoConnectStatus />
    </>
  );
}