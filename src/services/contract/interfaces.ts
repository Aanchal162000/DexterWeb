export interface QuoteRequestParams {
  chainId: number;
  toChainId: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  amount: string;
  userWalletAddress: string;
  slippage: number;
  slippageType: number;
  pmm: number;
  gasDropType: number;
  forbiddenBridgeTypes: number;
  dexIds: string;
  timestamp?: number;
}
