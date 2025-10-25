export interface AggregateSwapInfoResult {
  fromToken: TokenAddressInfo;
  toToken: TokenAddressInfo;
  exactIn: boolean;
  feeAmount: string;
  fromTokenAmount: string;
  minToTokenAmount: string;
  maxFromTokenAmount: string;
  toTokenAmount: string;
  quotes: Quotes;
}

export interface Quotes {
  route: AggregateSwapRoute[];
  refundRoute: AggregateSwapRoute[];
}

export interface AggregateSwapRoute {
  amountIn: string;
  amountOut: string;
  percentage: number;
  feeAmount: string;
  routeTaken: AggregateSwapRouteTaken[];
}

export interface AggregateSwapRouteTaken {
  fromToken: TokenTypeInfo;
  toToken: TokenTypeInfo;
  dexName: string;
  poolId: string;
  a2b: boolean;
  sqrtPriceLimit: string;
  poolType: string;
  amountIn: string;
  amountOut: string;
}

export interface TokenTypeInfo {
  tokenType: string;
}

export interface TokenAddressInfo {
  address: string;
}
