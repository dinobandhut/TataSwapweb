import { and, desc, eq, ilike, inArray, or } from 'drizzle-orm';
import { db } from './index.ts';
import {
  adminAuditLogs,
  liquidityPositions,
  listingFees,
  networks,
  poolEvents,
  pools,
  priceHistory,
  swaps,
  tokenListings,
  tokens,
  transactions,
  users,
  wallets,
} from './schema.ts';

export const OFFICIAL_FEE_RECEIVER = '0xD9e5c5d0522B1eeE8Ff9bC006F64d53d2C411CA4';

const RAW_DEFAULT_FEE = (process.env.TATASWAP_DEFAULT_LISTING_FEE_USDT || '').trim();
const SAFE_DEFAULT_LISTING_FEE_USDT =
  RAW_DEFAULT_FEE && !RAW_DEFAULT_FEE.startsWith('0x') && Number.isFinite(Number(RAW_DEFAULT_FEE))
    ? RAW_DEFAULT_FEE
    : '5';

const DEFAULT_NETWORKS = [
  {
    chainId: 810161,
    name: 'TataService Blockchain',
    shortName: 'Tata',
    rpcUrl: process.env.TATASERVICE_RPC_URL || 'https://rpctata.duckdns.org/rpc',
    explorerUrl: 'https://exploretata.duckdns.org',
    nativeSymbol: 'TATA',
    wrappedNativeAddress: process.env.TATASWAP_TATASERVICE_WTATA || '',
    usdtAddress: process.env.TATASWAP_TATASERVICE_USDT || '',
    isTestnet: false,
    isEnabled: true,
    isPaused: false,
    factoryAddress: process.env.TATASWAP_TATASERVICE_FACTORY || '',
    routerAddress: process.env.TATASWAP_TATASERVICE_ROUTER || '',
    listingFeeContract: process.env.TATASWAP_TATASERVICE_LISTING_FEE || '',
    feeManagerContract: process.env.TATASWAP_TATASERVICE_FEE_MANAGER || '',
    uniswapV2Factory: '',
    uniswapV2Router: '',
    uniswapV3Factory: '',
    uniswapV3PositionManager: '',
    uniswapV3SwapRouter: '',
    uniswapV3Quoter: '',
    uniswapV4PoolManager: '',
    listingFeeUsdt: SAFE_DEFAULT_LISTING_FEE_USDT,
    feeReceiverWallet: OFFICIAL_FEE_RECEIVER,
    acceptedPaymentToken: process.env.TATASWAP_TATASERVICE_USDT || '',
    swapFeeBps: 30,
    protocolFeeBps: 5,
  },
  {
    chainId: 137,
    name: 'Polygon PoS',
    shortName: 'Polygon',
    rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-bor-rpc.publicnode.com',
    explorerUrl: 'https://polygonscan.com',
    nativeSymbol: 'POL',
    wrappedNativeAddress: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    usdtAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    isTestnet: false,
    isEnabled: true,
    isPaused: false,
    factoryAddress: '',
    routerAddress: '',
    listingFeeContract: '',
    feeManagerContract: '',
    uniswapV2Factory: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
    uniswapV2Router: '0xedf6066a2b290C185783862C7F4776A2C8077AD1',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    uniswapV3PositionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    uniswapV3SwapRouter: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    uniswapV3Quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
    uniswapV4PoolManager: '0x67366782805870060151383F4BbFF9daB53e5cD6',
    listingFeeUsdt: '5',
    feeReceiverWallet: OFFICIAL_FEE_RECEIVER,
    acceptedPaymentToken: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    swapFeeBps: 30,
    protocolFeeBps: 5,
  },
  {
    chainId: 56,
    name: 'BNB Smart Chain',
    shortName: 'BSC',
    rpcUrl: process.env.BSC_MAINNET_RPC_URL || 'https://bsc-dataseed.bnbchain.org',
    explorerUrl: 'https://bscscan.com',
    nativeSymbol: 'BNB',
    wrappedNativeAddress: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    usdtAddress: '0x55d398326f99059fF775485246999027B3197955',
    isTestnet: false,
    isEnabled: true,
    isPaused: false,
    factoryAddress: '',
    routerAddress: '',
    listingFeeContract: '',
    feeManagerContract: '',
    uniswapV2Factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
    uniswapV2Router: '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24',
    uniswapV3Factory: '0xdb1d10011ad0ff90774d0c6bb92e5c5c8b4461f7',
    uniswapV3PositionManager: '0x7b8a01b39d58278b5de7e48c8449c9f4f5170613',
    uniswapV3SwapRouter: '0xB971eF87ede563556b2ED4b1C0b0019111Dd85d2',
    uniswapV3Quoter: '0x78D78E420Da98ad378D7799bE8f4AF69033EB077',
    uniswapV4PoolManager: '0x28e2Ea090877bF75740558f6BFB36A5ffeE9e9dF',
    listingFeeUsdt: '5',
    feeReceiverWallet: OFFICIAL_FEE_RECEIVER,
    acceptedPaymentToken: '0x55d398326f99059fF775485246999027B3197955',
    swapFeeBps: 30,
    protocolFeeBps: 5,
  },
  {
    chainId: 1,
    name: 'Ethereum Mainnet',
    shortName: 'Ethereum',
    rpcUrl: process.env.ETH_RPC_URL || 'https://ethereum-rpc.publicnode.com',
    explorerUrl: 'https://etherscan.io',
    nativeSymbol: 'ETH',
    wrappedNativeAddress: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    usdtAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    isTestnet: false,
    isEnabled: true,
    isPaused: false,
    factoryAddress: '',
    routerAddress: '',
    listingFeeContract: '',
    feeManagerContract: '',
    uniswapV2Factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
    uniswapV2Router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    uniswapV3PositionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    uniswapV3SwapRouter: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    uniswapV3Quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
    uniswapV4PoolManager: '0x000000000004444c5dc75cB358380D2e3dE08A90',
    listingFeeUsdt: '5',
    feeReceiverWallet: OFFICIAL_FEE_RECEIVER,
    acceptedPaymentToken: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    swapFeeBps: 30,
    protocolFeeBps: 5,
  },
  {
    chainId: 8453,
    name: 'Base',
    shortName: 'Base',
    rpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    nativeSymbol: 'ETH',
    wrappedNativeAddress: '0x4200000000000000000000000000000000000006',
    usdtAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    isTestnet: false,
    isEnabled: true,
    isPaused: false,
    factoryAddress: '',
    routerAddress: '',
    listingFeeContract: '',
    feeManagerContract: '',
    uniswapV2Factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
    uniswapV2Router: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    uniswapV3PositionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    uniswapV3SwapRouter: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    uniswapV3Quoter: '0x3d4e44Eb1374240CE5F1B871ab261CD16335B76a',
    uniswapV4PoolManager: '0x498581fF718922c3f8e6A244956aF099B2652b2b',
    listingFeeUsdt: '5',
    feeReceiverWallet: OFFICIAL_FEE_RECEIVER,
    acceptedPaymentToken: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    swapFeeBps: 30,
    protocolFeeBps: 5,
  },
  {
    chainId: 42161,
    name: 'Arbitrum One',
    shortName: 'Arbitrum',
    rpcUrl: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    explorerUrl: 'https://arbiscan.io',
    nativeSymbol: 'ETH',
    wrappedNativeAddress: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    usdtAddress: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    isTestnet: false,
    isEnabled: true,
    isPaused: false,
    factoryAddress: '',
    routerAddress: '',
    listingFeeContract: '',
    feeManagerContract: '',
    uniswapV2Factory: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
    uniswapV2Router: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
    uniswapV3Factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    uniswapV3PositionManager: '0xC36442b4a4522E871399CD717aBDD847Ab11FE88',
    uniswapV3SwapRouter: '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45',
    uniswapV3Quoter: '0x61fFE014bA17989E743c5F6cB21bF9697530B21e',
    uniswapV4PoolManager: '0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32',
    listingFeeUsdt: '5',
    feeReceiverWallet: OFFICIAL_FEE_RECEIVER,
    acceptedPaymentToken: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
    swapFeeBps: 30,
    protocolFeeBps: 5,
  },
  {
    chainId: 11155111,
    name: 'Ethereum Sepolia',
    shortName: 'Sepolia',
    rpcUrl: process.env.SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com',
    explorerUrl: 'https://sepolia.etherscan.io',
    nativeSymbol: 'ETH',
    wrappedNativeAddress: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    usdtAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    isTestnet: true,
    isEnabled: true,
    isPaused: false,
    factoryAddress: '',
    routerAddress: '',
    listingFeeContract: '',
    feeManagerContract: '',
    uniswapV2Factory: '0xF62c03E08ada871A0bEb309762E260a7a6a880E6',
    uniswapV2Router: '0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3',
    uniswapV3Factory: '0x0227628f3F023bb0B980b67D528571c95c6DaC1c',
    uniswapV3PositionManager: '0x1238536071E1c677A632429e3655c799b22cDA52',
    uniswapV3SwapRouter: '0x3bFA4769FB09eefC5a80d6E87c3B9C650f7Ae48E',
    uniswapV3Quoter: '',
    uniswapV4PoolManager: '0xE03A1074c86CFeDd5C142C4F04F1a1536e203543',
    listingFeeUsdt: '5',
    feeReceiverWallet: OFFICIAL_FEE_RECEIVER,
    acceptedPaymentToken: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    swapFeeBps: 30,
    protocolFeeBps: 5,
  },
];

const DEFAULT_BASE_TOKENS = [
  {
    chainId: 137,
    address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    name: 'Wrapped POL',
    symbol: 'WPOL',
    decimals: 18,
    totalSupply: '0',
    listedByWallet: OFFICIAL_FEE_RECEIVER,
    listingTxHash: '',
    listingFeePaid: '0',
    feePaymentToken: '',
    feeReceiverWallet: OFFICIAL_FEE_RECEIVER,
    verificationStatus: 'verified',
    onChainVerified: true,
    pairAddress: '',
    txCount: 0,
  },
  {
    chainId: 137,
    address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    name: 'Tether USD (PoS)',
    symbol: 'USDT',
    decimals: 6,
    totalSupply: '0',
    listedByWallet: OFFICIAL_FEE_RECEIVER,
    listingTxHash: '',
    listingFeePaid: '0',
    feePaymentToken: '',
    feeReceiverWallet: OFFICIAL_FEE_RECEIVER,
    verificationStatus: 'verified',
    onChainVerified: true,
    pairAddress: '',
    txCount: 0,
  },
  {
    chainId: 11155111,
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    name: 'Wrapped Ether (Sepolia)',
    symbol: 'WETH',
    decimals: 18,
    totalSupply: '0',
    listedByWallet: OFFICIAL_FEE_RECEIVER,
    listingTxHash: '',
    listingFeePaid: '0',
    feePaymentToken: '',
    feeReceiverWallet: OFFICIAL_FEE_RECEIVER,
    verificationStatus: 'verified',
    onChainVerified: true,
    pairAddress: '',
    txCount: 0,
  },
  {
    chainId: 11155111,
    address: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238',
    name: 'USD Coin (Sepolia)',
    symbol: 'USDC',
    decimals: 6,
    totalSupply: '0',
    listedByWallet: OFFICIAL_FEE_RECEIVER,
    listingTxHash: '',
    listingFeePaid: '0',
    feePaymentToken: '',
    feeReceiverWallet: OFFICIAL_FEE_RECEIVER,
    verificationStatus: 'verified',
    onChainVerified: true,
    pairAddress: '',
    txCount: 0,
  },
];

let seedCompleted = false;

export async function getOrCreateUser(uid: string, email: string, walletAddress?: string) {
  try {
    const result = await db
      .insert(users)
      .values({
        uid,
        email,
        walletAddress: walletAddress || null,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          updatedAt: new Date(),
          ...(walletAddress ? { walletAddress } : {}),
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error('Database error in getOrCreateUser:', error);
    throw new Error('Failed to synchronize user account.', { cause: error });
  }
}

export async function syncWalletRecord(input: {
  address: string;
  providerName: string;
  lastChainId: number;
  userId?: number | null;
}) {
  try {
    const rows = await db
      .insert(wallets)
      .values({
        address: input.address.toLowerCase(),
        providerName: input.providerName || 'injected',
        lastChainId: input.lastChainId,
        userId: input.userId || null,
        lastSeenAt: new Date(),
      })
      .onConflictDoUpdate({
        target: wallets.address,
        set: {
          providerName: input.providerName || 'injected',
          lastChainId: input.lastChainId,
          lastSeenAt: new Date(),
          ...(input.userId ? { userId: input.userId } : {}),
        },
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Database error in syncWalletRecord:', error);
    throw new Error('Failed to synchronize wallet record.', { cause: error });
  }
}

export async function ensureSeedNetworksAndBaseTokens() {
  if (seedCompleted) return;
  try {
    // Remove deprecated testnets (BSC Testnet 97 & Polygon Amoy 80002) if present
    await db.delete(networks).where(inArray(networks.chainId, [97, 80002]));
    await db.delete(tokens).where(inArray(tokens.chainId, [97, 80002]));

    for (const net of DEFAULT_NETWORKS) {
      await db
        .insert(networks)
        .values(net)
        .onConflictDoNothing({ target: networks.chainId });

      // Backfill Uniswap V2/V3/V4 addresses on pre-existing networks if empty
      const existing = await db
        .select()
        .from(networks)
        .where(eq(networks.chainId, net.chainId));
      const row = existing[0];
      if (row) {
        const patch: Record<string, unknown> = {};
        if (!row.uniswapV2Factory && net.uniswapV2Factory) patch.uniswapV2Factory = net.uniswapV2Factory;
        if (!row.uniswapV2Router && net.uniswapV2Router) patch.uniswapV2Router = net.uniswapV2Router;
        if (!row.uniswapV3Factory && net.uniswapV3Factory) patch.uniswapV3Factory = net.uniswapV3Factory;
        if (!row.uniswapV3PositionManager && net.uniswapV3PositionManager) {
          patch.uniswapV3PositionManager = net.uniswapV3PositionManager;
        }
        if (!row.uniswapV3SwapRouter && net.uniswapV3SwapRouter) {
          patch.uniswapV3SwapRouter = net.uniswapV3SwapRouter;
        }
        if (!row.uniswapV3Quoter && net.uniswapV3Quoter) patch.uniswapV3Quoter = net.uniswapV3Quoter;
        if (!row.uniswapV4PoolManager && net.uniswapV4PoolManager) {
          patch.uniswapV4PoolManager = net.uniswapV4PoolManager;
        }
        // Correct stale/invalid BSC (56) V3 contract addresses if present
        if (row.chainId === 56) {
          if (row.uniswapV3Factory?.toLowerCase() === '0xdb1d100b2a084a390486246f954f9a0d859d57a4') {
            patch.uniswapV3Factory = net.uniswapV3Factory;
          }
          if (
            row.uniswapV3PositionManager?.toLowerCase() ===
            '0x7b8a01b39d54ec78b96d837f480f68dbe3a65f24'
          ) {
            patch.uniswapV3PositionManager = net.uniswapV3PositionManager;
          }
          if (
            row.uniswapV3SwapRouter?.toLowerCase() === '0x9858effd232b4033e47d960033104b444c9fb165'
          ) {
            patch.uniswapV3SwapRouter = net.uniswapV3SwapRouter;
          }
          if (row.uniswapV3Quoter?.toLowerCase() === '0xb048bbc1ee6b733ffcfb693bfc8fffce0fd79d3d') {
            patch.uniswapV3Quoter = net.uniswapV3Quoter;
          }
        }
        if (row.chainId === 810161) {
          if (!row.factoryAddress && net.factoryAddress) patch.factoryAddress = net.factoryAddress;
          if (!row.routerAddress && net.routerAddress) patch.routerAddress = net.routerAddress;
          if (!row.listingFeeContract && net.listingFeeContract) {
            patch.listingFeeContract = net.listingFeeContract;
          }
          if (!row.feeManagerContract && net.feeManagerContract) {
            patch.feeManagerContract = net.feeManagerContract;
          }
          if (!row.wrappedNativeAddress && net.wrappedNativeAddress) {
            patch.wrappedNativeAddress = net.wrappedNativeAddress;
          }
          if (!row.usdtAddress && net.usdtAddress) patch.usdtAddress = net.usdtAddress;
          if (!row.acceptedPaymentToken && net.acceptedPaymentToken) {
            patch.acceptedPaymentToken = net.acceptedPaymentToken;
          }
        }
        if (
          !row.listingFeeUsdt ||
          row.listingFeeUsdt.startsWith('0x') ||
          !Number.isFinite(Number(row.listingFeeUsdt))
        ) {
          patch.listingFeeUsdt = SAFE_DEFAULT_LISTING_FEE_USDT;
        }
        if (!row.isEnabled && net.isEnabled) patch.isEnabled = true;

        if (Object.keys(patch).length > 0) {
          patch.updatedAt = new Date();
          await db.update(networks).set(patch).where(eq(networks.chainId, net.chainId));
        }
      }
    }

    for (const tok of DEFAULT_BASE_TOKENS) {
      await db
        .insert(tokens)
        .values({
          ...tok,
          address: tok.address.toLowerCase(),
        })
        .onConflictDoNothing();
    }
    seedCompleted = true;
  } catch (error) {
    console.error('Database error in ensureSeedNetworksAndBaseTokens:', error);
    throw new Error('Failed to load network configurations.', { cause: error });
  }
}

export async function getNetworks() {
  try {
    await ensureSeedNetworksAndBaseTokens();
    const rows = await db.select().from(networks).orderBy(networks.chainId);
    return rows.sort((a, b) => {
      if (a.chainId === 810161) return -1;
      if (b.chainId === 810161) return 1;
      return a.chainId - b.chainId;
    });
  } catch (error) {
    console.error('Database error in getNetworks:', error);
    throw new Error('Failed to load supported networks.', { cause: error });
  }
}

export async function getNetworkByChainId(chainId: number) {
  try {
    await ensureSeedNetworksAndBaseTokens();
    const rows = await db.select().from(networks).where(eq(networks.chainId, chainId));
    return rows[0] || null;
  } catch (error) {
    console.error('Database error in getNetworkByChainId:', error);
    throw new Error('Failed to load network configuration.', { cause: error });
  }
}

export async function updateNetworkConfig(
  chainId: number,
  updates: Partial<{
    isEnabled: boolean;
    isPaused: boolean;
    rpcUrl: string;
    explorerUrl: string;
    wrappedNativeAddress: string;
    usdtAddress: string;
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
  }>
) {
  try {
    const rows = await db
      .update(networks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(networks.chainId, chainId))
      .returning();
    return rows[0] || null;
  } catch (error) {
    console.error('Database error in updateNetworkConfig:', error);
    throw new Error('Failed to update network configuration.', { cause: error });
  }
}

export async function listIndexedTokens(chainId?: number, search?: string) {
  try {
    await ensureSeedNetworksAndBaseTokens();
    const conditions = [];
    if (chainId) {
      conditions.push(eq(tokens.chainId, chainId));
    }
    if (search && search.trim()) {
      const q = `%${search.trim()}%`;
      conditions.push(
        or(ilike(tokens.name, q), ilike(tokens.symbol, q), ilike(tokens.address, q))
      );
    }
    if (conditions.length > 0) {
      return await db
        .select()
        .from(tokens)
        .where(and(...conditions))
        .orderBy(desc(tokens.createdAt));
    }
    return await db.select().from(tokens).orderBy(desc(tokens.createdAt));
  } catch (error) {
    console.error('Database error in listIndexedTokens:', error);
    throw new Error('Failed to fetch indexed tokens.', { cause: error });
  }
}

export async function getTokenByAddress(chainId: number, address: string) {
  try {
    const rows = await db
      .select()
      .from(tokens)
      .where(and(eq(tokens.chainId, chainId), eq(tokens.address, address.toLowerCase())));
    return rows[0] || null;
  } catch (error) {
    console.error('Database error in getTokenByAddress:', error);
    throw new Error('Failed to fetch token details.', { cause: error });
  }
}

export async function upsertIndexedToken(input: {
  chainId: number;
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  listedByWallet: string;
  listingTxHash: string;
  listingFeePaid: string;
  feePaymentToken: string;
  feeReceiverWallet: string;
  verificationStatus?: string;
  onChainVerified: boolean;
  pairAddress?: string;
}) {
  try {
    const normalized = input.address.toLowerCase();
    const rows = await db
      .insert(tokens)
      .values({
        ...input,
        address: normalized,
        verificationStatus: input.verificationStatus || 'unverified',
        pairAddress: input.pairAddress || '',
      })
      .onConflictDoUpdate({
        target: [tokens.chainId, tokens.address],
        set: {
          name: input.name,
          symbol: input.symbol,
          decimals: input.decimals,
          totalSupply: input.totalSupply,
          onChainVerified: input.onChainVerified,
          pairAddress: input.pairAddress || '',
          updatedAt: new Date(),
        },
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Database error in upsertIndexedToken:', error);
    throw new Error('Failed to index token listing.', { cause: error });
  }
}

export async function upsertTokenListingRecord(input: {
  chainId: number;
  tokenAddress: string;
  tokenName: string;
  tokenSymbol: string;
  decimals: number;
  submitterWallet: string;
  txHash: string;
  feePaid: string;
  feeReceiverWallet: string;
  status?: string;
}) {
  try {
    const rows = await db
      .insert(tokenListings)
      .values({
        ...input,
        tokenAddress: input.tokenAddress.toLowerCase(),
        submitterWallet: input.submitterWallet.toLowerCase(),
        txHash: input.txHash.toLowerCase(),
        feeReceiverWallet: input.feeReceiverWallet.toLowerCase(),
        status: input.status || 'pending',
      })
      .onConflictDoUpdate({
        target: [tokenListings.chainId, tokenListings.tokenAddress],
        set: {
          txHash: input.txHash.toLowerCase(),
          feePaid: input.feePaid,
          updatedAt: new Date(),
        },
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Database error in upsertTokenListingRecord:', error);
    throw new Error('Failed to record token listing.', { cause: error });
  }
}

export async function listTokenListings(chainId?: number) {
  try {
    if (chainId) {
      return await db
        .select()
        .from(tokenListings)
        .where(eq(tokenListings.chainId, chainId))
        .orderBy(desc(tokenListings.createdAt));
    }
    return await db.select().from(tokenListings).orderBy(desc(tokenListings.createdAt));
  } catch (error) {
    console.error('Database error in listTokenListings:', error);
    throw new Error('Failed to load token listings.', { cause: error });
  }
}

export async function updateTokenVerification(
  chainId: number,
  address: string,
  verificationStatus: string,
  reviewerNote = ''
) {
  try {
    const normalized = address.toLowerCase();
    const rows = await db
      .update(tokens)
      .set({ verificationStatus, updatedAt: new Date() })
      .where(and(eq(tokens.chainId, chainId), eq(tokens.address, normalized)))
      .returning();

    await db
      .update(tokenListings)
      .set({
        status: verificationStatus === 'verified' ? 'verified' : verificationStatus === 'flagged' ? 'flagged' : 'pending',
        reviewerNote,
        updatedAt: new Date(),
      })
      .where(and(eq(tokenListings.chainId, chainId), eq(tokenListings.tokenAddress, normalized)));

    return rows[0] || null;
  } catch (error) {
    console.error('Database error in updateTokenVerification:', error);
    throw new Error('Failed to update token verification status.', { cause: error });
  }
}

export async function listIndexedPools(chainId?: number) {
  try {
    if (chainId) {
      return await db
        .select()
        .from(pools)
        .where(eq(pools.chainId, chainId))
        .orderBy(desc(pools.updatedAt));
    }
    return await db.select().from(pools).orderBy(desc(pools.updatedAt));
  } catch (error) {
    console.error('Database error in listIndexedPools:', error);
    throw new Error('Failed to fetch liquidity pools.', { cause: error });
  }
}

export async function getPoolByAddress(chainId: number, pairAddress: string) {
  try {
    const rows = await db
      .select()
      .from(pools)
      .where(and(eq(pools.chainId, chainId), eq(pools.pairAddress, pairAddress.toLowerCase())));
    return rows[0] || null;
  } catch (error) {
    console.error('Database error in getPoolByAddress:', error);
    throw new Error('Failed to fetch pool.', { cause: error });
  }
}

export async function upsertIndexedPool(input: {
  chainId: number;
  pairAddress: string;
  protocolVersion?: string;
  token0Address: string;
  token1Address: string;
  token0Symbol: string;
  token1Symbol: string;
  token0Decimals: number;
  token1Decimals: number;
  feeTierBps: number;
  tickSpacing?: number;
  sqrtPriceX96?: string;
  currentTick?: number;
  currentPrice?: string;
  creatorWallet: string;
  creationTxHash: string;
  reserve0: string;
  reserve1: string;
  totalSupply: string;
  volume24hDelta?: number;
  incrementTxCount?: boolean;
  lastSyncedBlock: number;
}) {
  try {
    const existing = await getPoolByAddress(input.chainId, input.pairAddress);
    const nextTxCount = (existing?.txCount || 0) + (input.incrementTxCount ? 1 : 0);
    const prevVol = Number.parseFloat(existing?.volume24h || '0') || 0;
    const nextVol = (prevVol + (input.volume24hDelta || 0)).toFixed(6);

    const rows = await db
      .insert(pools)
      .values({
        chainId: input.chainId,
        pairAddress: input.pairAddress.toLowerCase(),
        protocolVersion: input.protocolVersion || 'v3',
        token0Address: input.token0Address.toLowerCase(),
        token1Address: input.token1Address.toLowerCase(),
        token0Symbol: input.token0Symbol,
        token1Symbol: input.token1Symbol,
        token0Decimals: input.token0Decimals,
        token1Decimals: input.token1Decimals,
        feeTierBps: input.feeTierBps,
        tickSpacing: input.tickSpacing ?? 60,
        sqrtPriceX96: input.sqrtPriceX96 || '0',
        currentTick: input.currentTick ?? 0,
        currentPrice: input.currentPrice || '0',
        creatorWallet: input.creatorWallet.toLowerCase(),
        creationTxHash: input.creationTxHash.toLowerCase(),
        reserve0: input.reserve0,
        reserve1: input.reserve1,
        totalSupply: input.totalSupply,
        volume24h: nextVol,
        txCount: nextTxCount,
        lastSyncedBlock: input.lastSyncedBlock,
      })
      .onConflictDoUpdate({
        target: [pools.chainId, pools.pairAddress],
        set: {
          protocolVersion: input.protocolVersion || existing?.protocolVersion || 'v3',
          tickSpacing: input.tickSpacing ?? existing?.tickSpacing ?? 60,
          sqrtPriceX96: input.sqrtPriceX96 || existing?.sqrtPriceX96 || '0',
          currentTick: input.currentTick ?? existing?.currentTick ?? 0,
          currentPrice: input.currentPrice || existing?.currentPrice || '0',
          reserve0: input.reserve0,
          reserve1: input.reserve1,
          totalSupply: input.totalSupply,
          volume24h: nextVol,
          txCount: nextTxCount,
          lastSyncedBlock: input.lastSyncedBlock,
          updatedAt: new Date(),
        },
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Database error in upsertIndexedPool:', error);
    throw new Error('Failed to index liquidity pool.', { cause: error });
  }
}

export async function upsertLiquidityPosition(input: {
  chainId: number;
  ownerWallet: string;
  poolAddress: string;
  protocolVersion: string;
  tokenId: string;
  token0Address: string;
  token1Address: string;
  token0Symbol: string;
  token1Symbol: string;
  feeTierBps: number;
  tickLower: number;
  tickUpper: number;
  liquidityAmount: string;
  amount0Deposited: string;
  amount1Deposited: string;
  feesEarned0: string;
  feesEarned1: string;
  txHash: string;
  status: string;
}) {
  try {
    const rows = await db
      .insert(liquidityPositions)
      .values({
        ...input,
        ownerWallet: input.ownerWallet.toLowerCase(),
        poolAddress: input.poolAddress.toLowerCase(),
        token0Address: input.token0Address.toLowerCase(),
        token1Address: input.token1Address.toLowerCase(),
        txHash: input.txHash.toLowerCase(),
      })
      .onConflictDoUpdate({
        target: [liquidityPositions.chainId, liquidityPositions.txHash, liquidityPositions.tokenId],
        set: {
          liquidityAmount: input.liquidityAmount,
          amount0Deposited: input.amount0Deposited,
          amount1Deposited: input.amount1Deposited,
          feesEarned0: input.feesEarned0,
          feesEarned1: input.feesEarned1,
          status: input.status,
          updatedAt: new Date(),
        },
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Database error in upsertLiquidityPosition:', error);
    throw new Error('Failed to upsert liquidity position.', { cause: error });
  }
}

export async function listLiquidityPositions(chainId?: number, ownerWallet?: string) {
  try {
    const conditions = [];
    if (chainId) conditions.push(eq(liquidityPositions.chainId, chainId));
    if (ownerWallet) conditions.push(eq(liquidityPositions.ownerWallet, ownerWallet.toLowerCase()));
    if (conditions.length > 0) {
      return await db
        .select()
        .from(liquidityPositions)
        .where(and(...conditions))
        .orderBy(desc(liquidityPositions.updatedAt));
    }
    return await db
      .select()
      .from(liquidityPositions)
      .orderBy(desc(liquidityPositions.updatedAt));
  } catch (error) {
    console.error('Database error in listLiquidityPositions:', error);
    throw new Error('Failed to fetch liquidity positions.', { cause: error });
  }
}

export async function recordSwap(input: {
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
}) {
  try {
    const rows = await db
      .insert(swaps)
      .values({
        ...input,
        txHash: input.txHash.toLowerCase(),
        poolAddress: input.poolAddress.toLowerCase(),
        traderWallet: input.traderWallet.toLowerCase(),
        tokenInAddress: input.tokenInAddress.toLowerCase(),
        tokenOutAddress: input.tokenOutAddress.toLowerCase(),
      })
      .onConflictDoNothing()
      .returning();
    return rows[0] || null;
  } catch (error) {
    console.error('Database error in recordSwap:', error);
    throw new Error('Failed to record swap.', { cause: error });
  }
}

export async function listSwaps(chainId?: number) {
  try {
    if (chainId) {
      return await db
        .select()
        .from(swaps)
        .where(eq(swaps.chainId, chainId))
        .orderBy(desc(swaps.createdAt))
        .limit(100);
    }
    return await db.select().from(swaps).orderBy(desc(swaps.createdAt)).limit(100);
  } catch (error) {
    console.error('Database error in listSwaps:', error);
    throw new Error('Failed to load swaps.', { cause: error });
  }
}

export async function recordPoolEvent(input: {
  chainId: number;
  poolAddress: string;
  eventName: string;
  txHash: string;
  blockNumber: number;
  logIndex: number;
  actorWallet: string;
  payloadJson: string;
}) {
  try {
    const rows = await db
      .insert(poolEvents)
      .values({
        ...input,
        poolAddress: input.poolAddress.toLowerCase(),
        txHash: input.txHash.toLowerCase(),
        actorWallet: input.actorWallet.toLowerCase(),
      })
      .onConflictDoNothing()
      .returning();
    return rows[0] || null;
  } catch (error) {
    console.error('Database error in recordPoolEvent:', error);
    throw new Error('Failed to record pool event.', { cause: error });
  }
}

export async function listPoolEvents(chainId: number, poolAddress: string) {
  try {
    return await db
      .select()
      .from(poolEvents)
      .where(
        and(
          eq(poolEvents.chainId, chainId),
          eq(poolEvents.poolAddress, poolAddress.toLowerCase())
        )
      )
      .orderBy(desc(poolEvents.createdAt))
      .limit(100);
  } catch (error) {
    console.error('Database error in listPoolEvents:', error);
    throw new Error('Failed to load pool events.', { cause: error });
  }
}

export async function recordPricePoint(input: {
  chainId: number;
  poolAddress: string;
  token0Symbol: string;
  token1Symbol: string;
  price: string;
  reserve0: string;
  reserve1: string;
  volumeDelta: string;
  blockNumber: number;
}) {
  try {
    const rows = await db
      .insert(priceHistory)
      .values({
        ...input,
        poolAddress: input.poolAddress.toLowerCase(),
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Database error in recordPricePoint:', error);
    throw new Error('Failed to record price history point.', { cause: error });
  }
}

export async function listPriceHistory(chainId?: number, poolAddress?: string) {
  try {
    const conditions = [];
    if (chainId) conditions.push(eq(priceHistory.chainId, chainId));
    if (poolAddress) conditions.push(eq(priceHistory.poolAddress, poolAddress.toLowerCase()));
    if (conditions.length > 0) {
      return await db
        .select()
        .from(priceHistory)
        .where(and(...conditions))
        .orderBy(desc(priceHistory.recordedAt))
        .limit(200);
    }
    return await db
      .select()
      .from(priceHistory)
      .orderBy(desc(priceHistory.recordedAt))
      .limit(200);
  } catch (error) {
    console.error('Database error in listPriceHistory:', error);
    throw new Error('Failed to load price history.', { cause: error });
  }
}

export async function listTransactions(filters?: {
  chainId?: number;
  walletAddress?: string;
  txType?: string;
}) {
  try {
    const conditions = [];
    if (filters?.chainId) {
      conditions.push(eq(transactions.chainId, filters.chainId));
    }
    if (filters?.walletAddress) {
      conditions.push(eq(transactions.walletAddress, filters.walletAddress.toLowerCase()));
    }
    if (filters?.txType && filters.txType !== 'all') {
      conditions.push(eq(transactions.txType, filters.txType));
    }

    if (conditions.length > 0) {
      return await db
        .select()
        .from(transactions)
        .where(and(...conditions))
        .orderBy(desc(transactions.createdAt));
    }
    return await db.select().from(transactions).orderBy(desc(transactions.createdAt));
  } catch (error) {
    console.error('Database error in listTransactions:', error);
    throw new Error('Failed to fetch transaction history.', { cause: error });
  }
}

export async function recordVerifiedTransaction(input: {
  chainId: number;
  txHash: string;
  txType: string;
  walletAddress: string;
  tokenInAddress?: string;
  tokenInSymbol?: string;
  tokenOutAddress?: string;
  tokenOutSymbol?: string;
  amountIn?: string;
  amountOut?: string;
  feeAmount?: string;
  feeToken?: string;
  pairAddress?: string;
  blockNumber: number;
  status: string;
  verifiedOnChain: boolean;
}) {
  try {
    const rows = await db
      .insert(transactions)
      .values({
        chainId: input.chainId,
        txHash: input.txHash.toLowerCase(),
        txType: input.txType,
        walletAddress: input.walletAddress.toLowerCase(),
        tokenInAddress: (input.tokenInAddress || '').toLowerCase(),
        tokenInSymbol: input.tokenInSymbol || '',
        tokenOutAddress: (input.tokenOutAddress || '').toLowerCase(),
        tokenOutSymbol: input.tokenOutSymbol || '',
        amountIn: input.amountIn || '0',
        amountOut: input.amountOut || '0',
        feeAmount: input.feeAmount || '0',
        feeToken: input.feeToken || '',
        pairAddress: (input.pairAddress || '').toLowerCase(),
        blockNumber: input.blockNumber,
        status: input.status,
        verifiedOnChain: input.verifiedOnChain,
      })
      .onConflictDoUpdate({
        target: [transactions.chainId, transactions.txHash],
        set: {
          status: input.status,
          blockNumber: input.blockNumber,
          verifiedOnChain: input.verifiedOnChain,
        },
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Database error in recordVerifiedTransaction:', error);
    throw new Error('Failed to record verified transaction.', { cause: error });
  }
}

export async function recordListingFee(input: {
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
}) {
  try {
    const rows = await db
      .insert(listingFees)
      .values({
        ...input,
        txHash: input.txHash.toLowerCase(),
        listerWallet: input.listerWallet.toLowerCase(),
        tokenAddress: input.tokenAddress.toLowerCase(),
        paymentTokenAddress: input.paymentTokenAddress.toLowerCase(),
        receiverWallet: input.receiverWallet.toLowerCase(),
      })
      .onConflictDoNothing()
      .returning();
    return rows[0] || null;
  } catch (error) {
    console.error('Database error in recordListingFee:', error);
    throw new Error('Failed to record listing fee collection.', { cause: error });
  }
}

export async function listFeeCollections(chainId?: number) {
  try {
    if (chainId) {
      return await db
        .select()
        .from(listingFees)
        .where(eq(listingFees.chainId, chainId))
        .orderBy(desc(listingFees.createdAt));
    }
    return await db.select().from(listingFees).orderBy(desc(listingFees.createdAt));
  } catch (error) {
    console.error('Database error in listFeeCollections:', error);
    throw new Error('Failed to fetch listing fee history.', { cause: error });
  }
}

export async function addAdminAuditLog(input: {
  actorUid: string;
  actorWallet: string;
  action: string;
  details: string;
  txHash?: string;
}) {
  try {
    const rows = await db
      .insert(adminAuditLogs)
      .values({
        actorUid: input.actorUid,
        actorWallet: input.actorWallet.toLowerCase(),
        action: input.action,
        details: input.details,
        txHash: input.txHash || '',
      })
      .returning();
    return rows[0];
  } catch (error) {
    console.error('Database error in addAdminAuditLog:', error);
    throw new Error('Failed to record admin audit entry.', { cause: error });
  }
}

export async function listAdminAuditLogs() {
  try {
    return await db
      .select()
      .from(adminAuditLogs)
      .orderBy(desc(adminAuditLogs.createdAt))
      .limit(50);
  } catch (error) {
    console.error('Database error in listAdminAuditLogs:', error);
    throw new Error('Failed to fetch admin audit logs.', { cause: error });
  }
}
