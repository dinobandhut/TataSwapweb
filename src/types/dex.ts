export type PageRoute =
  | 'home'
  | 'swap'
  | 'explore'
  | 'pool-explorer'
  | 'token-details'
  | 'list-token'
  | 'create-pool'
  | 'add-liquidity'
  | 'remove-liquidity'
  | 'portfolio'
  | 'history'
  | 'analytics'
  | 'admin';

export type AmmProtocolVersion = 'v3' | 'v2' | 'v4' | 'tataswap';

export interface NetworkConfig {
  id: number;
  chainId: number;
  name: string;
  shortName: string;
  rpcUrl: string;
  explorerUrl: string;
  nativeSymbol: string;
  wrappedNativeAddress: string;
  usdtAddress: string;
  isTestnet: boolean;
  isEnabled: boolean;
  isPaused: boolean;
  factoryAddress: string;
  routerAddress: string;
  listingFeeContract: string;
  feeManagerContract: string;
  uniswapV2Factory: string;
  uniswapV2Router: string;
  uniswapV3Factory: string;
  uniswapV3PositionManager: string;
  uniswapV3SwapRouter: string;
  uniswapV3Quoter: string;
  uniswapV4PoolManager: string;
  listingFeeUsdt: string;
  feeReceiverWallet: string;
  acceptedPaymentToken: string;
  swapFeeBps: number;
  protocolFeeBps: number;
}

export interface ProtocolStatus {
  v3: { available: boolean; factoryCode: boolean; npmCode: boolean; routerCode: boolean; quoterCode: boolean };
  v2: { available: boolean; factoryCode: boolean; routerCode: boolean };
  v4: { available: boolean; poolManagerCode: boolean; note: string };
  tataswap: { available: boolean; factoryCode: boolean; routerCode: boolean; listingFeeCode: boolean };
}

export interface IndexedToken {
  id: number;
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  logoUrl: string;
  listedByWallet: string;
  listingTxHash: string;
  listingFeePaid: string;
  feePaymentToken: string;
  feeReceiverWallet: string;
  verificationStatus: 'verified' | 'unverified' | 'flagged' | string;
  onChainVerified: boolean;
  pairAddress: string;
  txCount: number;
  createdAt: string;
}

export interface IndexedPool {
  id: number;
  chainId: number;
  pairAddress: string;
  protocolVersion: AmmProtocolVersion | string;
  token0Address: string;
  token1Address: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Decimals: number;
  token1Decimals: number;
  feeTierBps: number;
  tickSpacing: number;
  sqrtPriceX96: string;
  currentTick: number;
  currentPrice: string;
  creatorWallet: string;
  creationTxHash: string;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  volume24h: string;
  txCount: number;
  lastSyncedBlock: number;
  createdAt: string;
}

export interface LiquidityPositionRecord {
  id?: number;
  chainId: number;
  ownerWallet: string;
  poolAddress: string;
  protocolVersion: AmmProtocolVersion | string;
  tokenId: string;
  token0Address: string;
  token1Address: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Decimals?: number;
  token1Decimals?: number;
  feeTierBps: number;
  tickLower: number;
  tickUpper: number;
  liquidityAmount: string;
  amount0Deposited: string;
  amount1Deposited: string;
  feesEarned0: string;
  feesEarned1: string;
  poolSharePct?: string;
  txHash: string;
  status: string;
  createdAt?: string;
}

export interface SwapRecord {
  id: number;
  chainId: number;
  txHash: string;
  protocolVersion: string;
  poolAddress: string;
  traderWallet: string;
  tokenInAddress: string;
  tokenInSymbol: string;
  tokenOutAddress: string;
  tokenOutSymbol: string;
  amountIn: string;
  amountOut: string;
  feePaid: string;
  priceImpactPct: string;
  blockNumber: number;
  createdAt: string;
}

export interface IndexedTransaction {
  id: number;
  chainId: number;
  txHash: string;
  txType: string;
  walletAddress: string;
  tokenInAddress: string;
  tokenInSymbol: string;
  tokenOutAddress: string;
  tokenOutSymbol: string;
  amountIn: string;
  amountOut: string;
  feeAmount: string;
  feeToken: string;
  pairAddress: string;
  blockNumber: number;
  status: string;
  verifiedOnChain: boolean;
  createdAt: string;
}

export interface ListingFeeRecord {
  id: number;
  chainId: number;
  txHash: string;
  listerWallet: string;
  tokenAddress: string;
  tokenSymbol: string;
  paymentTokenAddress: string;
  paymentSymbol: string;
  amountPaid: string;
  receiverWallet: string;
  blockNumber: number;
  verifiedOnChain: boolean;
  createdAt: string;
}

export interface PriceHistoryPoint {
  id: number;
  chainId: number;
  poolAddress: string;
  token0Symbol: string;
  token1Symbol: string;
  price: string;
  reserve0: string;
  reserve1: string;
  volumeDelta: string;
  blockNumber: number;
  recordedAt: string;
}

export interface PoolEventRecord {
  id: number;
  chainId: number;
  poolAddress: string;
  eventName: string;
  txHash: string;
  blockNumber: number;
  logIndex: number;
  actorWallet: string;
  payloadJson: string;
  createdAt: string;
}

export interface TokenListingRecord {
  id: number;
  chainId: number;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  decimals: number;
  submitterWallet: string;
  txHash: string;
  feePaid: string;
  feeReceiverWallet: string;
  status: string;
  reviewerNote: string;
  createdAt: string;
}

export interface AnalyticsSummary {
  totalListedTokens: number;
  totalPools: number;
  totalTransactions: number;
  totalSwaps: number;
  totalListingFeesCollected: string;
  totalProtocolFeesRecorded: string;
  officialFeeReceiver: string;
}
