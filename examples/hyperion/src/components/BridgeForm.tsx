import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle } from "lucide-react";

type BridgeDirection = "aptos-to-bsc" | "bsc-to-aptos";

interface BridgeFormProps {
  direction: BridgeDirection;
  aptosAccount: any;
  bscAddress: string | undefined;
  amount: string;
  recipient: string;
  error: string;
  successMessage: string;
  loading: boolean;
  onAmountChange: (amount: string) => void;
  onRecipientChange: (recipient: string) => void;
  onGetQuote: () => void;
  onExecuteQuote: () => void;
  onAutoFillRecipient: () => void;
  canAutoFillRecipient: boolean;
  realQuoteResult: any;
}

export const BridgeForm = ({
  direction,
  aptosAccount,
  bscAddress,
  amount,
  recipient,
  error,
  successMessage,
  loading,
  onAmountChange,
  onRecipientChange,
  onGetQuote,
  onExecuteQuote,
  onAutoFillRecipient,
  canAutoFillRecipient,
  realQuoteResult,
}: BridgeFormProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bridge Parameters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="sender">Sender Address</Label>
          <Input
            id="sender"
            value={
              direction === "aptos-to-bsc"
                ? aptosAccount?.address || "Please connect Aptos wallet"
                : bscAddress || "Please connect BSC wallet"
            }
            disabled
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="Enter bridge amount"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="recipient">Recipient Address</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => onRecipientChange(e.target.value)}
              placeholder={`Enter ${direction === "aptos-to-bsc" ? "BSC" : "Aptos"} recipient address`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onAutoFillRecipient}
              disabled={!canAutoFillRecipient}
              className="whitespace-nowrap"
            >
              Use My Wallet
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {direction === "aptos-to-bsc"
              ? "Auto-fill with your connected BSC wallet address"
              : "Auto-fill with your connected Aptos wallet address"}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMessage && (
          <Alert className="border-green-500 bg-green-50 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMessage}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={onGetQuote}
          disabled={
            loading ||
            (direction === "aptos-to-bsc" && !aptosAccount?.address) ||
            (direction === "bsc-to-aptos" && !bscAddress)
          }
          className="w-full"
        >
          {loading ? "Getting Quote..." : "Get Quote"}
        </Button>
        
        <Button
          variant="outline"
          onClick={onExecuteQuote}
          disabled={
            loading ||
            (direction === "aptos-to-bsc" && !aptosAccount?.address) ||
            (direction === "bsc-to-aptos" && !bscAddress)
          }
          className="w-full"
        >
          {realQuoteResult
            ? "✓ Quote Executed"
            : "Execute Quote (View Function)"}
        </Button>
      </CardContent>
    </Card>
  );
};