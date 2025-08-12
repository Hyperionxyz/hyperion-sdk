"use client";

import { useState, useEffect } from "react";
import { HyperionBridge, TOKENS } from "@hyperionxyz/bridge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, CheckCircle, AlertCircle, Info } from "lucide-react";
import ReactJson from "react-json-view";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import {
  useAccount as useBSCAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";
import { Header } from "@/components/Header";
import { BSCWalletConnect } from "@/components/BSCWalletConnect";
import { AutoConnectStatus } from "@/components/AutoConnectStatus";

type BridgeDirection = "aptos-to-bsc" | "bsc-to-aptos";

export default function BridgePage() {
  const bridge = new HyperionBridge();
  const { account, signAndSubmitTransaction } = useWallet();
  const { address: bscAddress, isConnected: isBscConnected } = useBSCAccount();

  // Initialize Aptos client
  const aptos = new Aptos(new AptosConfig({ network: Network.MAINNET }));

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
  const [aptosBalance, setAptosBalance] = useState<string>("0");
  const [bscBalance, setBscBalance] = useState<string>("0");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [realQuoteResult, setRealQuoteResult] = useState<any>(null);
  const [bscTxHash, setBscTxHash] = useState<string | null>(null);

  const handleGetQuote = async () => {
    // Check wallet connections based on bridge direction
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
      const token = TOKENS[selectedTokenIndex]; // Use the selected token
      const senderAddress =
        direction === "aptos-to-bsc" ? account?.address : bscAddress;
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

      console.log("first", result);

      setQuoteResult(result);
      setSuccessMessage("Quote retrieved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to get quote");
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
      const senderAddress =
        direction === "aptos-to-bsc" ? account!.address : bscAddress!;
      const args = {
        token,
        amount: parseFloat(amount),
        sender: senderAddress,
        recipient: recipient.trim(),
      };

      // Use real quote result if available, otherwise use mock
      let result;
      if (direction === "aptos-to-bsc") {
        result = bridge.createBridgePayloadFromAptosToBSC(
          args,
          realQuoteResult
        );
      } else {
        result = bridge.createBridgePayloadFromBSCToAptos(
          args,
          realQuoteResult
        );
      }

      setBridgePayload(result);
      setSuccessMessage("Bridge payload created successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to create bridge payload");
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

    // Auto-fill recipient after reset based on current direction
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

  const selectedToken = TOKENS[selectedTokenIndex];

  // Get Aptos balance using view function
  const getAptosBalance = async () => {
    if (!account?.address) return;

    try {
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
    }
  };

  // BSC write contract hook
  const {
    writeContract,
    data: bscTxData,
    error: bscTxError,
    isPending: isBscTxPending,
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

  // Handle BSC transaction status updates
  useEffect(() => {
    if (bscTxData) {
      setBscTxHash(bscTxData);
      setSuccessMessage(`BSC transaction submitted! Hash: ${bscTxData}`);
    }
  }, [bscTxData]);

  useEffect(() => {
    if (isBscTxSuccess) {
      setSuccessMessage(
        `BSC transaction confirmed successfully! Hash: ${bscTxHash}`
      );
    }
  }, [isBscTxSuccess, bscTxHash]);

  useEffect(() => {
    if (bscTxError) {
      setError(`BSC transaction failed: ${bscTxError.message}`);
    }
  }, [bscTxError]);

  // Execute payload functions
  const executeAptosPayload = async (
    payload: any,
    type: "view" | "transaction"
  ) => {
    if (!account?.address) {
      setError("Please connect your Aptos wallet first");
      return;
    }

    try {
      if (type === "view") {
        const result = await aptos.view({ payload });
        setSuccessMessage(
          `View function executed successfully. Result: ${JSON.stringify(result)}`
        );
        return result;
      } else {
        const response = await signAndSubmitTransaction({
          data: payload,
        });
        setSuccessMessage(
          `Transaction submitted successfully. Hash: ${response.hash}`
        );
        return response;
      }
    } catch (error: any) {
      setError(`Aptos execution failed: ${error.message}`);
      throw error;
    }
  };

  // Execute BSC write contract function
  const executeBscWriteContract = async (payload: any) => {
    if (!bscAddress) {
      setError("Please connect your BSC wallet first");
      return;
    }

    try {
      // For BSC write operations, use writeContract hook
      console.log("payload", {
        address: payload.address,
        abi: payload.abi,
        functionName: payload.functionName,
        args: payload.args,
        chainId: payload.chainId,
        value: payload.value,
      });
      await writeContract({
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

  // Auto-fill recipient address when direction changes and wallets are connected
  useEffect(() => {
    // Clear recipient when direction changes to avoid cross-chain address confusion
    setRecipient("");

    // Auto-fill with the target chain wallet address if available
    if (direction === "aptos-to-bsc" && bscAddress) {
      setRecipient(bscAddress);
    } else if (direction === "bsc-to-aptos" && account?.address) {
      setRecipient(account.address);
    }
  }, [direction]);

  // Auto-fill when wallet connects for the first time
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

      <div className='max-w-7xl w-full mx-auto p-4 mt-16'>
        <div className='flex flex-col gap-6'>
          <div className='flex items-center justify-between'>
            <h1 className='text-3xl font-bold'>Hyperion Bridge Demo</h1>
            <Button onClick={resetDemo} variant='outline'>
              Reset
            </Button>
          </div>

          {/* Token Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Token Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-4'>
                <div>
                  <Label htmlFor='token-select'>Select Token</Label>
                  <Select
                    value={selectedTokenIndex.toString()}
                    onValueChange={(value) =>
                      setSelectedTokenIndex(Number(value))
                    }
                  >
                    <SelectTrigger className='mt-1'>
                      <SelectValue placeholder='Select a token' />
                    </SelectTrigger>
                    <SelectContent>
                      {TOKENS.map((token, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          <div className='flex items-center gap-2'>
                            <img
                              src={token.chain.aptos.logo}
                              alt={token.name}
                              className='w-5 h-5'
                            />
                            {token.name} ({token.symbol})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='flex items-center gap-4 p-3 bg-gray-50 rounded'>
                  <img
                    src={selectedToken.chain.aptos.logo}
                    alt={selectedToken.name}
                    className='w-8 h-8'
                  />
                  <div className='flex-1'>
                    <div className='font-semibold'>
                      {selectedToken.name} ({selectedToken.symbol})
                    </div>
                    <div className='text-sm text-gray-600'>
                      Aptos: {selectedToken.chain.aptos.decimals} decimals |
                      BSC: {selectedToken.chain.bsc.decimals} decimals
                    </div>
                  </div>
                  <div className='text-xs text-gray-500 space-y-1'>
                    <div>
                      Aptos: {selectedToken.chain.aptos.address.slice(0, 10)}...
                    </div>
                    <div>
                      BSC: {selectedToken.chain.bsc.address.slice(0, 10)}...
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wallet Connections with Balances */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  Aptos Wallet
                  {account?.address && (
                    <Badge variant='secondary'>Connected</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='text-sm text-gray-600'>
                  {account?.address ? (
                    <>
                      {account.address.slice(0, 10)}...
                      {account.address.slice(-6)}
                    </>
                  ) : (
                    "Not connected - Use Header to connect"
                  )}
                </div>
                {account?.address && (
                  <div className='border rounded p-3 bg-gray-50'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <img
                          src={selectedToken.chain.aptos.logo}
                          alt={selectedToken.symbol}
                          className='w-5 h-5'
                        />
                        <span className='text-sm font-medium'>
                          {selectedToken.symbol}
                        </span>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm font-semibold'>
                          {aptosBalance}
                        </div>
                        <div className='text-xs text-gray-500'>Balance</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  BSC Wallet
                  {isBscConnected && (
                    <Badge variant='secondary'>Connected</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                <div className='text-sm text-gray-600'>
                  {bscAddress ? (
                    <>
                      {bscAddress.slice(0, 10)}...{bscAddress.slice(-6)}
                    </>
                  ) : (
                    "Not connected - Use BSC Wallet Connect above"
                  )}
                </div>
                {bscAddress && (
                  <div className='border rounded p-3 bg-gray-50'>
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center gap-2'>
                        <img
                          src={selectedToken.chain.aptos.logo}
                          alt={selectedToken.symbol}
                          className='w-5 h-5'
                        />
                        <span className='text-sm font-medium'>
                          {selectedToken.symbol}
                        </span>
                      </div>
                      <div className='text-right'>
                        <div className='text-sm font-semibold'>
                          {bscBalance}
                        </div>
                        <div className='text-xs text-gray-500'>Balance</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bridge Direction Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Bridge Direction</CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex gap-4'>
                <Button
                  variant={direction === "aptos-to-bsc" ? "default" : "outline"}
                  onClick={() => setDirection("aptos-to-bsc")}
                >
                  Aptos → BSC
                </Button>
                <Button
                  variant={direction === "bsc-to-aptos" ? "default" : "outline"}
                  onClick={() => setDirection("bsc-to-aptos")}
                >
                  BSC → Aptos
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Parameter Input */}
          <Card>
            <CardHeader>
              <CardTitle>Bridge Parameters</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <Label htmlFor='sender'>Sender Address</Label>
                <Input
                  id='sender'
                  value={
                    direction === "aptos-to-bsc"
                      ? account?.address || "Please connect Aptos wallet"
                      : bscAddress || "Please connect BSC wallet"
                  }
                  disabled
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='amount'>Amount</Label>
                <Input
                  id='amount'
                  type='number'
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder='Enter bridge amount'
                  className='mt-1'
                />
              </div>

              <div>
                <Label htmlFor='recipient'>Recipient Address</Label>
                <div className='flex gap-2 mt-1'>
                  <Input
                    id='recipient'
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder={`Enter ${direction === "aptos-to-bsc" ? "BSC" : "Aptos"} recipient address`}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      if (direction === "aptos-to-bsc" && bscAddress) {
                        setRecipient(bscAddress);
                      } else if (
                        direction === "bsc-to-aptos" &&
                        account?.address
                      ) {
                        setRecipient(account.address);
                      }
                    }}
                    disabled={
                      (direction === "aptos-to-bsc" && !bscAddress) ||
                      (direction === "bsc-to-aptos" && !account?.address)
                    }
                    className='whitespace-nowrap'
                  >
                    Use My Wallet
                  </Button>
                </div>
                <div className='text-xs text-gray-500 mt-1'>
                  {direction === "aptos-to-bsc"
                    ? "Auto-fill with your connected BSC wallet address"
                    : "Auto-fill with your connected Aptos wallet address"}
                </div>
              </div>

              {error && (
                <Alert variant='destructive'>
                  <AlertCircle className='h-4 w-4' />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {successMessage && (
                <Alert className='border-green-500 bg-green-50 text-green-700'>
                  <CheckCircle className='h-4 w-4' />
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleGetQuote}
                disabled={
                  loading ||
                  (direction === "aptos-to-bsc" && !account?.address) ||
                  (direction === "bsc-to-aptos" && !bscAddress)
                }
                className='w-full'
              >
                {loading ? "Getting Quote..." : "Get Quote"}
              </Button>
              <Button
                variant='outline'
                onClick={async () => {
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
                      // Check if conditions are met before refetch
                      await refetchBscQuote();

                      console.log("bscQuoteData", bscQuoteData);

                      if (bscQuoteData) {
                        setRealQuoteResult(bscQuoteData);
                        setSuccessMessage(
                          `BSC quote executed successfully! Result: ${JSON.stringify(bscQuoteData)} - Now you can create bridge payload with real quote data.`
                        );
                      } else {
                        console.error(
                          "Refetch returned no data:",
                          bscQuoteData
                        );
                        setError(
                          "Failed to get BSC quote data - refetch returned undefined"
                        );
                      }
                    }
                  } catch (error) {
                    console.error("Execute quote error:", error);
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={
                  loading ||
                  !quoteResult ||
                  (direction === "aptos-to-bsc" && !account?.address) ||
                  (direction === "bsc-to-aptos" && !bscAddress)
                }
                className='w-full'
              >
                {realQuoteResult
                  ? "✓ Quote Executed"
                  : "Execute Quote (View Function)"}
              </Button>
            </CardContent>
          </Card>

          {/* Quote Result */}
          {quoteResult && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    Quote Result
                    <Badge variant='secondary'>Success</Badge>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(quoteResult, null, 2),
                        "quote"
                      )
                    }
                    className='flex items-center gap-1'
                  >
                    {copied === "quote" ? (
                      <CheckCircle className='h-4 w-4' />
                    ) : (
                      <Copy className='h-4 w-4' />
                    )}
                    {copied === "quote" ? "Copied!" : "Copy"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue='formatted' className='w-full'>
                  <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='formatted'>Formatted View</TabsTrigger>
                    <TabsTrigger value='raw'>Raw JSON</TabsTrigger>
                  </TabsList>
                  <TabsContent value='formatted' className='mt-4'>
                    <ReactJson
                      src={quoteResult}
                      theme='google'
                      collapsed={false}
                      enableClipboard={true}
                      displayDataTypes={false}
                      displayObjectSize={false}
                      name='quotePayload'
                    />
                  </TabsContent>
                  <TabsContent value='raw' className='mt-4'>
                    <pre className='bg-gray-100 p-4 rounded text-sm overflow-auto'>
                      {JSON.stringify(quoteResult, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
                <div className='space-y-2 mt-4'>
                  <Button
                    onClick={handleCreateBridgePayload}
                    disabled={loading}
                    className='w-full'
                  >
                    {loading ? "Creating..." : "Create Bridge Payload"}
                  </Button>
                  {realQuoteResult && (
                    <Alert className='border-green-500 bg-green-50 text-green-700'>
                      <CheckCircle className='h-4 w-4' />
                      <AlertDescription>
                        Bridge payload will use real quote data:{" "}
                        {JSON.stringify(realQuoteResult)}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bridge Payload Result */}
          {bridgePayload && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    Bridge Payload
                    <Badge variant='secondary'>Generated</Badge>
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(bridgePayload, null, 2),
                        "payload"
                      )
                    }
                    className='flex items-center gap-1'
                  >
                    {copied === "payload" ? (
                      <CheckCircle className='h-4 w-4' />
                    ) : (
                      <Copy className='h-4 w-4' />
                    )}
                    {copied === "payload" ? "Copied!" : "Copy"}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue='formatted' className='w-full'>
                  <TabsList className='grid w-full grid-cols-2'>
                    <TabsTrigger value='formatted'>Formatted View</TabsTrigger>
                    <TabsTrigger value='raw'>Raw JSON</TabsTrigger>
                  </TabsList>
                  <TabsContent value='formatted' className='mt-4'>
                    <ReactJson
                      src={bridgePayload}
                      theme='google'
                      collapsed={false}
                      enableClipboard={true}
                      displayDataTypes={false}
                      displayObjectSize={false}
                      name='bridgePayload'
                    />
                  </TabsContent>
                  <TabsContent value='raw' className='mt-4'>
                    <pre className='bg-gray-100 p-4 rounded text-sm overflow-auto'>
                      {JSON.stringify(bridgePayload, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
                <div className='space-y-4 mt-4'>
                  <Button
                    variant='default'
                    onClick={async () => {
                      if (!bridgePayload) return;

                      try {
                        setLoading(true);

                        if (direction === "aptos-to-bsc") {
                          await executeAptosPayload(
                            bridgePayload,
                            "transaction"
                          );
                        } else {
                          // BSC transaction execution using writeContract
                          await executeBscWriteContract(bridgePayload);
                        }
                      } catch (error) {
                        console.error(
                          "Execute bridge transaction error:",
                          error
                        );
                      } finally {
                        setLoading(false);
                      }
                    }}
                    disabled={
                      loading ||
                      !bridgePayload ||
                      (direction === "aptos-to-bsc" && !account?.address) ||
                      (direction === "bsc-to-aptos" && !bscAddress)
                    }
                    className='w-full'
                  >
                    {loading
                      ? "Executing..."
                      : `Execute Bridge Transaction (${direction === "aptos-to-bsc" ? "Aptos" : "BSC"})`}
                  </Button>
                  <Alert>
                    <Info className='h-4 w-4' />
                    <AlertDescription>
                      <strong>Implementation Note:</strong> This bridge payload
                      uses{" "}
                      {realQuoteResult ? "REAL quote data" : "MOCK quote data"}.
                      {!realQuoteResult &&
                        " Execute the quote first to get real chain data."}{" "}
                      Click the button above to execute:
                      <ul className='mt-2 ml-4 list-disc'>
                        <li>
                          For Aptos: Wallet will sign and submit the transaction
                        </li>
                        <li>
                          For BSC: Use wagmi writeContract hook (implemented)
                        </li>
                      </ul>
                      {realQuoteResult && (
                        <div className='mt-2 p-2 bg-green-100 rounded text-sm'>
                          ✓ Using real quote:{" "}
                          {Array.isArray(realQuoteResult)
                            ? `[${realQuoteResult.join(", ")}]`
                            : JSON.stringify(realQuoteResult)}
                        </div>
                      )}
                      {bscTxData && (
                        <div className='mt-2 p-2 bg-blue-100 rounded text-sm'>
                          {isBscTxConfirming &&
                            "⏳ Confirming BSC transaction..."}
                          {isBscTxSuccess && "✅ BSC transaction confirmed!"}
                          <div className='text-xs text-gray-600 mt-1'>
                            Hash: {bscTxData.slice(0, 10)}...
                            {bscTxData.slice(-8)}
                          </div>
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          )}

          {/* API Documentation */}
          <Card>
            <CardHeader>
              <CardTitle>API Methods Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue='methods' className='w-full'>
                <TabsList className='grid w-full grid-cols-3'>
                  <TabsTrigger value='methods'>Methods</TabsTrigger>
                  <TabsTrigger value='usage'>Usage Examples</TabsTrigger>
                  <TabsTrigger value='types'>Types</TabsTrigger>
                </TabsList>

                <TabsContent value='methods' className='mt-4 space-y-4'>
                  <div>
                    <h4 className='font-semibold mb-3'>
                      HyperionBridge Class Methods:
                    </h4>
                    <div className='space-y-3'>
                      <div className='p-3 border rounded'>
                        <code className='bg-gray-100 px-2 py-1 rounded text-sm'>
                          createQuoteSendPayloadFromAptosToBSC(args)
                        </code>
                        <p className='text-sm text-gray-600 mt-1'>
                          Get quote for bridging tokens from Aptos to BSC chain
                        </p>
                        <div className='text-xs text-gray-500 mt-1'>
                          Returns: InputViewFunctionData
                        </div>
                      </div>
                      <div className='p-3 border rounded'>
                        <code className='bg-gray-100 px-2 py-1 rounded text-sm'>
                          createBridgePayloadFromAptosToBSC(args, quoteResult)
                        </code>
                        <p className='text-sm text-gray-600 mt-1'>
                          Create bridge transaction payload from Aptos to BSC
                        </p>
                        <div className='text-xs text-gray-500 mt-1'>
                          Returns: InputGenerateTransactionPayloadData
                        </div>
                      </div>
                      <div className='p-3 border rounded'>
                        <code className='bg-gray-100 px-2 py-1 rounded text-sm'>
                          createQuoteSendPayloadFromBSCToAptos(args)
                        </code>
                        <p className='text-sm text-gray-600 mt-1'>
                          Get quote for bridging tokens from BSC to Aptos chain
                        </p>
                        <div className='text-xs text-gray-500 mt-1'>
                          Returns: BSC contract call data
                        </div>
                      </div>
                      <div className='p-3 border rounded'>
                        <code className='bg-gray-100 px-2 py-1 rounded text-sm'>
                          createBridgePayloadFromBSCToAptos(args, quoteResult)
                        </code>
                        <p className='text-sm text-gray-600 mt-1'>
                          Create bridge transaction payload from BSC to Aptos
                        </p>
                        <div className='text-xs text-gray-500 mt-1'>
                          Returns: BSC contract transaction data
                        </div>
                      </div>
                      <div className='p-3 border rounded'>
                        <code className='bg-gray-100 px-2 py-1 rounded text-sm'>
                          addToken(token)
                        </code>
                        <p className='text-sm text-gray-600 mt-1'>
                          Add a new bridgeable token to the bridge instance
                        </p>
                        <div className='text-xs text-gray-500 mt-1'>
                          Returns: void
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value='usage' className='mt-4'>
                  <div className='space-y-4'>
                    <h4 className='font-semibold'>Basic Usage Example:</h4>
                    <pre className='bg-gray-100 p-4 rounded text-sm overflow-auto'>
                      {`import { HyperionBridge, TOKENS } from "@hyperionxyz/bridge";

const bridge = new HyperionBridge();

// Get quote for Aptos to BSC
const quotePayload = bridge.createQuoteSendPayloadFromAptosToBSC({
  token: TOKENS[0],
  amount: 100,
  sender: "your_aptos_address",
  recipient: "your_bsc_address"
});

// Use quote to create bridge payload
const bridgePayload = bridge.createBridgePayloadFromAptosToBSC(
  args, 
  quoteResult
);`}
                    </pre>
                  </div>
                </TabsContent>

                <TabsContent value='types' className='mt-4'>
                  <div className='space-y-4'>
                    <h4 className='font-semibold'>Type Definitions:</h4>
                    <pre className='bg-gray-100 p-4 rounded text-sm overflow-auto'>
                      {`type BridgeArgs = {
  token: BridgeToken;
  amount: number;
  sender: string;
  recipient: string;
};

type BridgeDirection = "toAptos" | "toBsc";

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
}`}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
      <AutoConnectStatus />
    </>
  );
}
