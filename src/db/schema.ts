import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  walletAddress: text('wallet_address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const wallets = pgTable(
  'wallets',
  {
    id: serial('id').primaryKey(),
    address: text('address').notNull(),
    userId: integer('user_id').references(() => users.id),
    providerName: text('provider_name').default('injected').notNull(),
    lastChainId: integer('last_chain_id').default(810161).notNull(),
    lastSeenAt: timestamp('last_seen_at').defaultNow().notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('wallets_address_idx').on(table.address)]
);

export const networks = pgTable('networks', {
  id: serial('id').primaryKey(),
  chainId: integer('chain_id').notNull().unique(),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  rpcUrl: text('rpc_url').notNull(),
  explorerUrl: text('explorer_url').notNull(),
  nativeSymbol: text('native_symbol').notNull(),
  wrappedNativeAddress: text('wrapped_native_address').notNull(),
  usdtAddress: text('usdt_address').notNull(),
  isTestnet: boolean('is_testnet').default(false).notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  isPaused: boolean('is_paused').default(false).notNull(),
  factoryAddress: text('factory_address').default('').notNull(),
  routerAddress: text('router_address').default('').notNull(),
  listingFeeContract: text('listing_fee_contract').default('').notNull(),
  feeManagerContract: text('fee_manager_contract').default('').notNull(),
  uniswapV2Factory: text('uniswap_v2_factory').default('').notNull(),
  uniswapV2Router: text('uniswap_v2_router').default('').notNull(),
  uniswapV3Factory: text('uniswap_v3_factory').default('').notNull(),
  uniswapV3PositionManager: text('uniswap_v3_position_manager').default('').notNull(),
  uniswapV3SwapRouter: text('uniswap_v3_swap_router').default('').notNull(),
  uniswapV3Quoter: text('uniswap_v3_quoter').default('').notNull(),
  uniswapV4PoolManager: text('uniswap_v4_pool_manager').default('').notNull(),
  listingFeeUsdt: text('listing_fee_usdt').default('5').notNull(),
  feeReceiverWallet: text('fee_receiver_wallet')
    .default('0xD9e5c5d0522B1eeE8Ff9bC006F64d53d2C411CA4')
    .notNull(),
  acceptedPaymentToken: text('accepted_payment_token').default('').notNull(),
  swapFeeBps: integer('swap_fee_bps').default(30).notNull(),
  protocolFeeBps: integer('protocol_fee_bps').default(5).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tokens = pgTable(
  'tokens',
  {
    id: serial('id').primaryKey(),
    chainId: integer('chain_id').notNull(),
    address: text('address').notNull(),
    name: text('name').notNull(),
    symbol: text('symbol').notNull(),
    decimals: integer('decimals').notNull(),
    totalSupply: text('total_supply').default('0').notNull(),
    logoUrl: text('logo_url').default('').notNull(),
    listedByWallet: text('listed_by_wallet').notNull(),
    listingTxHash: text('listing_tx_hash').default('').notNull(),
    listingFeePaid: text('listing_fee_paid').default('0').notNull(),
    feePaymentToken: text('fee_payment_token').default('').notNull(),
    feeReceiverWallet: text('fee_receiver_wallet').default('').notNull(),
    verificationStatus: text('verification_status').default('unverified').notNull(),
    onChainVerified: boolean('on_chain_verified').default(false).notNull(),
    pairAddress: text('pair_address').default('').notNull(),
    txCount: integer('tx_count').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('tokens_chain_address_idx').on(table.chainId, table.address),
  ]
);

export const tokenListings = pgTable(
  'token_listings',
  {
    id: serial('id').primaryKey(),
    chainId: integer('chain_id').notNull(),
    tokenAddress: text('token_address').notNull(),
    tokenName: text('token_name').notNull(),
    tokenSymbol: text('token_symbol').notNull(),
    decimals: integer('decimals').notNull(),
    submitterWallet: text('submitter_wallet').notNull(),
    txHash: text('tx_hash').default('').notNull(),
    feePaid: text('fee_paid').default('0').notNull(),
    feeReceiverWallet: text('fee_receiver_wallet').default('').notNull(),
    status: text('status').default('pending').notNull(),
    reviewerNote: text('reviewer_note').default('').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('token_listings_chain_addr_idx').on(table.chainId, table.tokenAddress),
  ]
);

export const pools = pgTable(
  'pools',
  {
    id: serial('id').primaryKey(),
    chainId: integer('chain_id').notNull(),
    pairAddress: text('pair_address').notNull(),
    protocolVersion: text('protocol_version').default('v3').notNull(),
    token0Address: text('token0_address').notNull(),
    token1Address: text('token1_address').notNull(),
    token0Symbol: text('token0_symbol').notNull(),
    token1Symbol: text('token1_symbol').notNull(),
    token0Decimals: integer('token0_decimals').default(18).notNull(),
    token1Decimals: integer('token1_decimals').default(18).notNull(),
    feeTierBps: integer('fee_tier_bps').default(30).notNull(),
    tickSpacing: integer('tick_spacing').default(60).notNull(),
    sqrtPriceX96: text('sqrt_price_x96').default('0').notNull(),
    currentTick: integer('current_tick').default(0).notNull(),
    currentPrice: text('current_price').default('0').notNull(),
    creatorWallet: text('creator_wallet').notNull(),
    creationTxHash: text('creation_tx_hash').default('').notNull(),
    reserve0: text('reserve0').default('0').notNull(),
    reserve1: text('reserve1').default('0').notNull(),
    totalSupply: text('total_supply').default('0').notNull(),
    volume24h: text('volume_24h').default('0').notNull(),
    txCount: integer('tx_count').default(0).notNull(),
    lastSyncedBlock: integer('last_synced_block').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('pools_chain_pair_idx').on(table.chainId, table.pairAddress),
  ]
);

export const liquidityPositions = pgTable(
  'liquidity_positions',
  {
    id: serial('id').primaryKey(),
    chainId: integer('chain_id').notNull(),
    ownerWallet: text('owner_wallet').notNull(),
    poolAddress: text('pool_address').notNull(),
    protocolVersion: text('protocol_version').default('v3').notNull(),
    tokenId: text('token_id').default('0').notNull(),
    token0Address: text('token0_address').notNull(),
    token1Address: text('token1_address').notNull(),
    token0Symbol: text('token0_symbol').notNull(),
    token1Symbol: text('token1_symbol').notNull(),
    feeTierBps: integer('fee_tier_bps').default(30).notNull(),
    tickLower: integer('tick_lower').default(-887220).notNull(),
    tickUpper: integer('tick_upper').default(887220).notNull(),
    liquidityAmount: text('liquidity_amount').default('0').notNull(),
    amount0Deposited: text('amount0_deposited').default('0').notNull(),
    amount1Deposited: text('amount1_deposited').default('0').notNull(),
    feesEarned0: text('fees_earned0').default('0').notNull(),
    feesEarned1: text('fees_earned1').default('0').notNull(),
    txHash: text('tx_hash').notNull(),
    status: text('status').default('active').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('lp_positions_chain_tx_idx').on(table.chainId, table.txHash, table.tokenId),
  ]
);

export const swaps = pgTable(
  'swaps',
  {
    id: serial('id').primaryKey(),
    chainId: integer('chain_id').notNull(),
    txHash: text('tx_hash').notNull(),
    protocolVersion: text('protocol_version').default('v3').notNull(),
    poolAddress: text('pool_address').default('').notNull(),
    traderWallet: text('trader_wallet').notNull(),
    tokenInAddress: text('token_in_address').notNull(),
    tokenInSymbol: text('token_in_symbol').notNull(),
    tokenOutAddress: text('token_out_address').notNull(),
    tokenOutSymbol: text('token_out_symbol').notNull(),
    amountIn: text('amount_in').notNull(),
    amountOut: text('amount_out').notNull(),
    feePaid: text('fee_paid').default('0').notNull(),
    priceImpactPct: text('price_impact_pct').default('0').notNull(),
    blockNumber: integer('block_number').default(0).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [uniqueIndex('swaps_chain_hash_idx').on(table.chainId, table.txHash)]
);

export const transactions = pgTable(
  'transactions',
  {
    id: serial('id').primaryKey(),
    chainId: integer('chain_id').notNull(),
    txHash: text('tx_hash').notNull(),
    txType: text('tx_type').notNull(),
    walletAddress: text('wallet_address').notNull(),
    tokenInAddress: text('token_in_address').default('').notNull(),
    tokenInSymbol: text('token_in_symbol').default('').notNull(),
    tokenOutAddress: text('token_out_address').default('').notNull(),
    tokenOutSymbol: text('token_out_symbol').default('').notNull(),
    amountIn: text('amount_in').default('0').notNull(),
    amountOut: text('amount_out').default('0').notNull(),
    feeAmount: text('fee_amount').default('0').notNull(),
    feeToken: text('fee_token').default('').notNull(),
    pairAddress: text('pair_address').default('').notNull(),
    blockNumber: integer('block_number').default(0).notNull(),
    status: text('status').default('confirmed').notNull(),
    verifiedOnChain: boolean('verified_on_chain').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('transactions_chain_hash_idx').on(table.chainId, table.txHash),
  ]
);

export const listingFees = pgTable(
  'listing_fees',
  {
    id: serial('id').primaryKey(),
    chainId: integer('chain_id').notNull(),
    txHash: text('tx_hash').notNull(),
    listerWallet: text('lister_wallet').notNull(),
    tokenAddress: text('token_address').notNull(),
    tokenSymbol: text('token_symbol').default('').notNull(),
    paymentTokenAddress: text('payment_token_address').notNull(),
    paymentSymbol: text('payment_symbol').default('USDT').notNull(),
    amountPaid: text('amount_paid').notNull(),
    receiverWallet: text('receiver_wallet').notNull(),
    blockNumber: integer('block_number').default(0).notNull(),
    verifiedOnChain: boolean('verified_on_chain').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('listing_fees_chain_hash_idx').on(table.chainId, table.txHash),
  ]
);

export const poolEvents = pgTable(
  'pool_events',
  {
    id: serial('id').primaryKey(),
    chainId: integer('chain_id').notNull(),
    poolAddress: text('pool_address').notNull(),
    eventName: text('event_name').notNull(),
    txHash: text('tx_hash').notNull(),
    blockNumber: integer('block_number').default(0).notNull(),
    logIndex: integer('log_index').default(0).notNull(),
    actorWallet: text('actor_wallet').default('').notNull(),
    payloadJson: text('payload_json').default('{}').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('pool_events_chain_hash_log_idx').on(
      table.chainId,
      table.txHash,
      table.logIndex,
      table.eventName
    ),
  ]
);

export const priceHistory = pgTable('price_history', {
  id: serial('id').primaryKey(),
  chainId: integer('chain_id').notNull(),
  poolAddress: text('pool_address').notNull(),
  token0Symbol: text('token0_symbol').notNull(),
  token1Symbol: text('token1_symbol').notNull(),
  price: text('price').notNull(),
  reserve0: text('reserve0').default('0').notNull(),
  reserve1: text('reserve1').default('0').notNull(),
  volumeDelta: text('volume_delta').default('0').notNull(),
  blockNumber: integer('block_number').default(0).notNull(),
  recordedAt: timestamp('recorded_at').defaultNow().notNull(),
});

export const adminAuditLogs = pgTable('admin_audit_logs', {
  id: serial('id').primaryKey(),
  actorUid: text('actor_uid').notNull(),
  actorWallet: text('actor_wallet').notNull(),
  action: text('action').notNull(),
  details: text('details').notNull(),
  txHash: text('tx_hash').default('').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  auditLogs: many(adminAuditLogs),
}));
