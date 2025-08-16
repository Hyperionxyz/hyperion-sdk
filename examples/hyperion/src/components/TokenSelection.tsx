import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TOKENS } from "@hyperionxyz/bridge";

interface TokenSelectionProps {
  selectedTokenIndex: number;
  onTokenChange: (index: number) => void;
}

export const TokenSelection = ({
  selectedTokenIndex,
  onTokenChange,
}: TokenSelectionProps) => {
  const selectedToken = TOKENS[selectedTokenIndex];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Token Selection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="token-select">Select Token</Label>
            <Select
              value={selectedTokenIndex.toString()}
              onValueChange={(value) => onTokenChange(Number(value))}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select a token" />
              </SelectTrigger>
              <SelectContent>
                {TOKENS.map((token, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    <div className="flex items-center gap-2">
                      <img
                        src={token.chain.aptos.logo}
                        alt={token.name}
                        className="w-5 h-5"
                      />
                      {token.name} ({token.symbol})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded">
            <img
              src={selectedToken.chain.aptos.logo}
              alt={selectedToken.name}
              className="w-8 h-8"
            />
            <div className="flex-1">
              <div className="font-semibold">
                {selectedToken.name} ({selectedToken.symbol})
              </div>
              <div className="text-sm text-gray-600">
                Aptos: {selectedToken.chain.aptos.decimals} decimals |
                BSC: {selectedToken.chain.bsc.decimals} decimals
              </div>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
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
  );
};