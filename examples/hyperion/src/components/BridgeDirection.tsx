import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type BridgeDirection = "aptos-to-bsc" | "bsc-to-aptos";

interface BridgeDirectionProps {
  direction: BridgeDirection;
  onDirectionChange: (direction: BridgeDirection) => void;
}

export const BridgeDirectionSelector = ({
  direction,
  onDirectionChange,
}: BridgeDirectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bridge Direction</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <Button
            variant={direction === "aptos-to-bsc" ? "default" : "outline"}
            onClick={() => onDirectionChange("aptos-to-bsc")}
          >
            Aptos → BSC
          </Button>
          <Button
            variant={direction === "bsc-to-aptos" ? "default" : "outline"}
            onClick={() => onDirectionChange("bsc-to-aptos")}
          >
            BSC → Aptos
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};