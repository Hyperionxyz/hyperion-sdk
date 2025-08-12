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
}
