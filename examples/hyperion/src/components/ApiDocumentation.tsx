import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ApiDocumentation = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Methods Documentation</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="methods" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="methods">Methods</TabsTrigger>
            <TabsTrigger value="usage">Usage Examples</TabsTrigger>
            <TabsTrigger value="types">Types</TabsTrigger>
          </TabsList>

          <TabsContent value="methods" className="mt-4 space-y-4">
            <div>
              <h4 className="font-semibold mb-3">HyperionBridge Class Methods:</h4>
              <div className="space-y-3">
                <div className="p-3 border rounded">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    createQuoteSendPayloadFromAptosToBSC(args)
                  </code>
                  <p className="text-sm text-gray-600 mt-1">
                    Get quote for bridging tokens from Aptos to BSC chain
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    Returns: InputViewFunctionData
                  </div>
                </div>
                <div className="p-3 border rounded">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    createBridgePayloadFromAptosToBSC(args, quoteResult)
                  </code>
                  <p className="text-sm text-gray-600 mt-1">
                    Create bridge transaction payload from Aptos to BSC
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    Returns: InputGenerateTransactionPayloadData
                  </div>
                </div>
                <div className="p-3 border rounded">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    createQuoteSendPayloadFromBSCToAptos(args)
                  </code>
                  <p className="text-sm text-gray-600 mt-1">
                    Get quote for bridging tokens from BSC to Aptos chain
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    Returns: BSC contract call data
                  </div>
                </div>
                <div className="p-3 border rounded">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    createBridgePayloadFromBSCToAptos(args, quoteResult)
                  </code>
                  <p className="text-sm text-gray-600 mt-1">
                    Create bridge transaction payload from BSC to Aptos
                  </p>
                  <div className="text-xs text-gray-500 mt-1">
                    Returns: BSC contract transaction data
                  </div>
                </div>
                <div className="p-3 border rounded">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    addToken(token)
                  </code>
                  <p className="text-sm text-gray-600 mt-1">
                    Add a new bridgeable token to the bridge instance
                  </p>
                  <div className="text-xs text-gray-500 mt-1">Returns: void</div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="usage" className="mt-4">
            <div className="space-y-4">
              <h4 className="font-semibold">Basic Usage Example:</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
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

          <TabsContent value="types" className="mt-4">
            <div className="space-y-4">
              <h4 className="font-semibold">Type Definitions:</h4>
              <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
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
  );
};