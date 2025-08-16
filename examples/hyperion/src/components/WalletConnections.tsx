import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BSCWalletConnect } from "./BSCWalletConnect";

interface WalletConnectionsProps {
  aptosAccount: any;
  bscAddress: string | undefined;
  isBscConnected: boolean;
  selectedToken: any;
  aptosBalance: string;
  bscBalance: string;
}

export const WalletConnections = ({
  aptosAccount,
  bscAddress,
  isBscConnected,
  selectedToken,
  aptosBalance,
  bscBalance,
}: WalletConnectionsProps) => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            Aptos Wallet
            {aptosAccount?.address && (
              <Badge variant='secondary'>Connected</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-3'>
          <div className='text-sm text-gray-600'>
            {aptosAccount?.address ? (
              <>
                {aptosAccount.address.slice(0, 10)}...
                {aptosAccount.address.slice(-6)}
              </>
            ) : (
              "Not connected - Use Header to connect"
            )}
          </div>
          {aptosAccount?.address && (
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
                  <div className='text-sm font-semibold'>{aptosBalance}</div>
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
            {isBscConnected && <Badge variant='secondary'>Connected</Badge>}
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
                  <div className='text-sm font-semibold'>{bscBalance}</div>
                  <div className='text-xs text-gray-500'>Balance</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
