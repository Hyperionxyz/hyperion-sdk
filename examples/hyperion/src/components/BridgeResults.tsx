import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, CheckCircle, Info } from "lucide-react";
import { JsonViewer } from "./JsonViewer";
import { useState } from "react";

interface QuoteResultProps {
  quoteResult: any;
  onCopy: (text: string, type: string) => void;
  copied: string;
  onCreateBridgePayload: () => void;
  realQuoteResult: any;
  loading: boolean;
}

interface BridgePayloadResultProps {
  bridgePayload: any;
  onCopy: (text: string, type: string) => void;
  copied: string;
  onExecuteBridge: () => void;
  realQuoteResult: any;
  loading: boolean;
  direction: string;
  bscTxData?: string;
  isBscTxConfirming?: boolean;
  isBscTxSuccess?: boolean;
  aptosAccount: any;
  bscAddress: string | undefined;
}

export const QuoteResult = ({
  quoteResult,
  onCopy,
  copied,
  onCreateBridgePayload,
  realQuoteResult,
  loading,
}: QuoteResultProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            Quote Result
            <Badge variant="secondary">Success</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onCopy(JSON.stringify(quoteResult, null, 2), "quote")
            }
            className="flex items-center gap-1"
          >
            {copied === "quote" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied === "quote" ? "Copied!" : "Copy"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <JsonViewer data={quoteResult} name="quotePayload" />
        <div className="space-y-2 mt-4">
          <Button
            onClick={onCreateBridgePayload}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Creating..." : "Create Bridge Payload"}
          </Button>
          {realQuoteResult && (
            <Alert className="border-green-500 bg-green-50 text-green-700">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Bridge payload will use real quote data:{" "}
                {JSON.stringify(realQuoteResult)}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const BridgePayloadResult = ({
  bridgePayload,
  onCopy,
  copied,
  onExecuteBridge,
  realQuoteResult,
  loading,
  direction,
  bscTxData,
  isBscTxConfirming,
  isBscTxSuccess,
  aptosAccount,
  bscAddress,
}: BridgePayloadResultProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            Bridge Payload
            <Badge variant="secondary">Generated</Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              onCopy(JSON.stringify(bridgePayload, null, 2), "payload")
            }
            className="flex items-center gap-1"
          >
            {copied === "payload" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied === "payload" ? "Copied!" : "Copy"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <JsonViewer data={bridgePayload} name="bridgePayload" />
        <div className="space-y-4 mt-4">
          <Button
            variant="default"
            onClick={onExecuteBridge}
            disabled={
              loading ||
              !bridgePayload ||
              (direction === "aptos-to-bsc" && !aptosAccount?.address) ||
              (direction === "bsc-to-aptos" && !bscAddress)
            }
            className="w-full"
          >
            {loading
              ? "Executing..."
              : `Execute Bridge Transaction (${direction === "aptos-to-bsc" ? "Aptos" : "BSC"})`}
          </Button>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Implementation Note:</strong> This bridge payload uses{" "}
              {realQuoteResult ? "REAL quote data" : "MOCK quote data"}.
              {!realQuoteResult &&
                " Execute the quote first to get real chain data."}{" "}
              Click the button above to execute:
              <ul className="mt-2 ml-4 list-disc">
                <li>
                  For Aptos: Wallet will sign and submit the transaction
                </li>
                <li>
                  For BSC: Use wagmi writeContract hook (implemented)
                </li>
              </ul>
              {realQuoteResult && (
                <div className="mt-2 p-2 bg-green-100 rounded text-sm">
                  ✓ Using real quote:{" "}
                  {Array.isArray(realQuoteResult)
                    ? `[${realQuoteResult.join(", ")}]`
                    : JSON.stringify(realQuoteResult)}
                </div>
              )}
              {bscTxData && (
                <div className="mt-2 p-2 bg-blue-100 rounded text-sm">
                  {isBscTxConfirming && "⏳ Confirming BSC transaction..."}
                  {isBscTxSuccess && "✅ BSC transaction confirmed!"}
                  <div className="text-xs text-gray-600 mt-1">
                    Hash: {bscTxData.slice(0, 10)}...{bscTxData.slice(-8)}
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </CardContent>
    </Card>
  );
};