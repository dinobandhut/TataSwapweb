import express from 'express';
import rateLimit from 'express-rate-limit';
import * as dotenv from 'dotenv';
import http from 'http';
import path from 'path';
import { WebSocket, WebSocketServer } from 'ws';
import { isAddress, isHexString, formatUnits } from 'ethers';
import {
  OFFICIAL_FEE_RECEIVER,
  addAdminAuditLog,
  getNetworkByChainId,
  getNetworks,
  getOrCreateUser,
  getPoolByAddress,
  getTokenByAddress,
  listAdminAuditLogs,
  listFeeCollections,
  listIndexedPools,
  listIndexedTokens,
  listLiquidityPositions,
  listPoolEvents,
  listPriceHistory,
  listSwaps,
  listTokenListings,
  listTransactions,
  recordListingFee,
  recordPoolEvent,
  recordPricePoint,
  recordSwap,
  recordVerifiedTransaction,
  syncWalletRecord,
  updateNetworkConfig,
  updateTokenVerification,
  upsertIndexedPool,
  upsertIndexedToken,
  upsertLiquidityPosition,
  upsertTokenListingRecord,
} from './src/db/queries.ts';
import {
  extractListingFeeFromLogs,
  getProtocolStatusForNetwork,
  getV3PositionsForOwner,
  inspectTokenOnChain,
  readPoolOnChain,
  readV4PoolOnChain,
  verifyTxReceiptOnChain,
} from './src/lib/rpc.ts';
import {
  requireAdmin,
  requireAuth,
  verifyWalletSignature,
  type AuthRequest,
} from './src/middleware/auth.ts';
import type { ProtocolStatus } from './src/types/dex.ts';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.set('trust proxy', 1);

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});
app.use(express.json({ limit: '1mb' }));

const generalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 240,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please slow down.' },
});

const writeRpcLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 45,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded for RPC verification endpoints.' },
});

app.use('/api', generalLimiter);

// WebSocket hub on /ws for real-time verified DEX updates
const wss = new WebSocketServer({ noServer: true });
const protocolCache = new Map<number, { ts: number; status: ProtocolStatus }>();

function broadcastWsEvent(type: string, payload: Record<string, unknown>) {
  const message = JSON.stringify({
    type,
    payload,
    timestamp: new Date().toISOString(),
  });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'tataswap-dex-api',
    wsClients: wss.clients.size,
    timestamp: new Date().toISOString(),
  });
});

// Authenticated User Account Sync
app.post('/api/auth/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const uid = req.user?.uid;
    const email = req.user?.email || '';
    if (!uid) {
      res.status(401).json({ error: 'Invalid user session.' });
      return;
    }
    const walletAddress =
      typeof req.body?.walletAddress === 'string' && isAddress(req.body.walletAddress)
        ? req.body.walletAddress.toLowerCase()
        : undefined;
    const profile = await getOrCreateUser(uid, email, walletAddress);
    res.json({ user: profile });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to synchronize account';
    res.status(500).json({ error: message });
  }
});

// Public: Wallet Session Sync (non-custodial address + chain tracking only)
app.post('/api/wallets/sync', async (req, res) => {
  try {
    const { address, providerName, chainId } = req.body ?? {};
    if (typeof address !== 'string' || !isAddress(address)) {
      res.status(400).json({ error: 'Valid wallet address is required.' });
      return;
    }
    const parsedChainId = Number(chainId) || 810161;
    const wallet = await syncWalletRecord({
      address,
      providerName: typeof providerName === 'string' ? providerName : 'injected',
      lastChainId: parsedChainId,
    });
    res.json({ wallet });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to sync wallet';
    res.status(500).json({ error: message });
  }
});

// Public: Supported networks & contract configuration
app.get('/api/networks', async (_req, res) => {
  try {
    const nets = await getNetworks();
    res.json({ networks: nets, officialFeeReceiver: OFFICIAL_FEE_RECEIVER });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load networks';
    res.status(500).json({ error: message });
  }
});

// Public: Live on-chain protocol deployment verification (eth_getCode for V2/V3/V4/TataSwap)
app.get('/api/protocols/status', async (req, res) => {
  try {
    const chainId = Number(req.query.chainId || 810161);
    const force = req.query.refresh === 'true';
    const net = await getNetworkByChainId(chainId);
    if (!net) {
      res.status(404).json({ error: 'Unsupported network.' });
      return;
    }

    const cached = protocolCache.get(chainId);
    if (!force && cached && Date.now() - cached.ts < 60_000) {
      res.json({ chainId, status: cached.status, cached: true });
      return;
    }

    const status = await getProtocolStatusForNetwork(net);
    protocolCache.set(chainId, { ts: Date.now(), status });
    res.json({ chainId, status, cached: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check protocol bytecode';
    res.status(500).json({ error: message });
  }
});

// Public: Token explorer & search
app.get('/api/tokens', async (req, res) => {
  try {
    const chainId = req.query.chainId ? Number(req.query.chainId) : undefined;
    const q = typeof req.query.q === 'string' ? req.query.q : undefined;
    const items = await listIndexedTokens(chainId, q);
    res.json({ tokens: items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch tokens';
    res.status(500).json({ error: message });
  }
});

// Public: Single token details
app.get('/api/tokens/:chainId/:address', async (req, res) => {
  try {
    const chainId = Number(req.params.chainId);
    const address = req.params.address;
    if (!Number.isInteger(chainId) || !isAddress(address)) {
      res.status(400).json({ error: 'Invalid chainId or token contract address.' });
      return;
    }

    const net = await getNetworkByChainId(chainId);
    if (!net) {
      res.status(404).json({ error: 'Unsupported blockchain network.' });
      return;
    }

    const indexed = await getTokenByAddress(chainId, address);
    let liveOnChain = null;
    let rpcError = null;
    try {
      liveOnChain = await inspectTokenOnChain(net.rpcUrl, address);
    } catch (err: unknown) {
      rpcError = err instanceof Error ? err.message : 'RPC inspection failed';
    }

    const allPools = await listIndexedPools(chainId);
    const tokenPools = allPools.filter(
      (p) =>
        p.token0Address.toLowerCase() === address.toLowerCase() ||
        p.token1Address.toLowerCase() === address.toLowerCase()
    );

    const allTxs = await listTransactions({ chainId });
    const tokenTxs = allTxs.filter(
      (tx) =>
        tx.tokenInAddress.toLowerCase() === address.toLowerCase() ||
        tx.tokenOutAddress.toLowerCase() === address.toLowerCase()
    );

    res.json({
      token: indexed,
      liveOnChain,
      rpcError,
      pools: tokenPools,
      transactions: tokenTxs.slice(0, 25),
      network: net,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch token details';
    res.status(500).json({ error: message });
  }
});

// Public: Real on-chain ERC-20 / BEP-20 contract inspector
app.post('/api/tokens/inspect', writeRpcLimiter, async (req, res) => {
  try {
    const { chainId, address } = req.body ?? {};
    const parsedChainId = Number(chainId);
    if (!Number.isInteger(parsedChainId) || typeof address !== 'string' || !isAddress(address)) {
      res.status(400).json({ error: 'Valid chainId and ERC-20 contract address are required.' });
      return;
    }

    const net = await getNetworkByChainId(parsedChainId);
    if (!net) {
      res.status(404).json({ error: 'Unsupported network.' });
      return;
    }

    const metadata = await inspectTokenOnChain(net.rpcUrl, address);
    const existing = await getTokenByAddress(parsedChainId, address);
    res.json({
      metadata,
      alreadyListed: Boolean(existing),
      existingToken: existing,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'On-chain token inspection failed';
    res.status(400).json({ error: message });
  }
});

// Public: Permissionless token listing index (verifies real on-chain txHash + fee payment)
app.post('/api/tokens/list', writeRpcLimiter, async (req, res) => {
  try {
    const { chainId, tokenAddress, txHash, listerWallet, pairAddress } = req.body ?? {};
    const parsedChainId = Number(chainId);

    if (
      !Number.isInteger(parsedChainId) ||
      typeof tokenAddress !== 'string' ||
      !isAddress(tokenAddress) ||
      typeof listerWallet !== 'string' ||
      !isAddress(listerWallet) ||
      typeof txHash !== 'string' ||
      !isHexString(txHash, 32)
    ) {
      res.status(400).json({
        error: 'Valid chainId, tokenAddress, listerWallet, and 32-byte on-chain txHash are required.',
      });
      return;
    }

    const net = await getNetworkByChainId(parsedChainId);
    if (!net) {
      res.status(404).json({ error: 'Unsupported network.' });
      return;
    }

    const receipt = await verifyTxReceiptOnChain(net.rpcUrl, txHash);
    if (!receipt.found || !receipt.confirmed) {
      res.status(400).json({
        error: 'Listing transaction has not been confirmed on-chain yet or reverted.',
      });
      return;
    }

    const metadata = await inspectTokenOnChain(net.rpcUrl, tokenAddress);
    const feeCheck = extractListingFeeFromLogs(
      receipt.logs,
      net.feeReceiverWallet,
      net.acceptedPaymentToken || net.usdtAddress
    );

    if (!feeCheck.matched) {
      res.status(400).json({
        error: `Could not verify listing fee payment to ${net.feeReceiverWallet} in transaction logs.`,
      });
      return;
    }

    const feePaidFormatted = feeCheck.feeAmountWei
      ? formatUnits(feeCheck.feeAmountWei, 18)
      : net.listingFeeUsdt;

    const savedToken = await upsertIndexedToken({
      chainId: parsedChainId,
      address: metadata.address,
      name: metadata.name,
      symbol: metadata.symbol,
      decimals: metadata.decimals,
      totalSupply: metadata.totalSupply,
      listedByWallet: listerWallet.toLowerCase(),
      listingTxHash: txHash.toLowerCase(),
      listingFeePaid: feePaidFormatted,
      feePaymentToken: net.acceptedPaymentToken || net.usdtAddress,
      feeReceiverWallet: net.feeReceiverWallet,
      verificationStatus: 'unverified',
      onChainVerified: true,
      pairAddress: typeof pairAddress === 'string' && isAddress(pairAddress) ? pairAddress : '',
    });

    await upsertTokenListingRecord({
      chainId: parsedChainId,
      tokenAddress: metadata.address,
      tokenName: metadata.name,
      tokenSymbol: metadata.symbol,
      decimals: metadata.decimals,
      submitterWallet: listerWallet,
      txHash,
      feePaid: feePaidFormatted,
      feeReceiverWallet: net.feeReceiverWallet,
      status: 'pending',
    });

    await recordListingFee({
      chainId: parsedChainId,
      txHash,
      listerWallet,
      tokenAddress: metadata.address,
      tokenSymbol: metadata.symbol,
      paymentTokenAddress: net.acceptedPaymentToken || net.usdtAddress,
      paymentSymbol: 'USDT',
      amountPaid: feePaidFormatted,
      receiverWallet: net.feeReceiverWallet,
      blockNumber: receipt.blockNumber,
      verifiedOnChain: true,
    });

    await recordVerifiedTransaction({
      chainId: parsedChainId,
      txHash,
      txType: 'token_listing',
      walletAddress: listerWallet,
      tokenInAddress: net.acceptedPaymentToken || net.usdtAddress,
      tokenInSymbol: 'USDT',
      tokenOutAddress: metadata.address,
      tokenOutSymbol: metadata.symbol,
      amountIn: feePaidFormatted,
      amountOut: '1',
      feeAmount: feePaidFormatted,
      feeToken: 'USDT',
      pairAddress: typeof pairAddress === 'string' && isAddress(pairAddress) ? pairAddress : '',
      blockNumber: receipt.blockNumber,
      status: 'confirmed',
      verifiedOnChain: true,
    });

    broadcastWsEvent('token:listed', { chainId: parsedChainId, token: savedToken });
    res.json({ token: savedToken, verifiedOnChain: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify and list token';
    res.status(400).json({ error: message });
  }
});

// Public: List indexed liquidity pools (Phase 6 Explorer)
app.get('/api/pools', async (req, res) => {
  try {
    const chainId = req.query.chainId ? Number(req.query.chainId) : undefined;
    const items = await listIndexedPools(chainId);
    res.json({ pools: items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load pools';
    res.status(500).json({ error: message });
  }
});

// Public: Single pool details + events + price history
app.get('/api/pools/:chainId/:address', async (req, res) => {
  try {
    const chainId = Number(req.params.chainId);
    const address = req.params.address;
    if (!Number.isInteger(chainId) || !isAddress(address)) {
      res.status(400).json({ error: 'Invalid chainId or pool address.' });
      return;
    }

    const [pool, events, history] = await Promise.all([
      getPoolByAddress(chainId, address),
      listPoolEvents(chainId, address),
      listPriceHistory(chainId, address),
    ]);

    res.json({ pool, events, priceHistory: history });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load pool details';
    res.status(500).json({ error: message });
  }
});

// Public: Sync a real on-chain pool contract (V3, V2, V4, or TataSwap) into PostgreSQL
app.post('/api/pools/sync', writeRpcLimiter, async (req, res) => {
  try {
    const {
      chainId,
      pairAddress,
      protocolVersion,
      creatorWallet,
      creationTxHash,
      token0Address,
      token1Address,
      feeTier,
      tickSpacing,
    } = req.body ?? {};
    const parsedChainId = Number(chainId);
    const proto = typeof protocolVersion === 'string' ? protocolVersion : 'v3';
    const isV4PoolId = proto === 'v4' && typeof pairAddress === 'string' && isHexString(pairAddress, 32);
    const isStandardPoolAddr = typeof pairAddress === 'string' && isAddress(pairAddress);

    if (!Number.isInteger(parsedChainId) || (!isV4PoolId && !isStandardPoolAddr)) {
      res.status(400).json({ error: 'Valid chainId and pool address or V4 PoolId are required.' });
      return;
    }

    const net = await getNetworkByChainId(parsedChainId);
    if (!net) {
      res.status(404).json({ error: 'Unsupported network.' });
      return;
    }

    const livePool = isV4PoolId
      ? await readV4PoolOnChain({
          rpcUrl: net.rpcUrl,
          chainId: parsedChainId,
          poolId: pairAddress,
          token0Address: typeof token0Address === 'string' ? token0Address : '',
          token1Address: typeof token1Address === 'string' ? token1Address : '',
          feeTier: Number(feeTier) || 3000,
          tickSpacing: Number(tickSpacing) || 60,
        })
      : await readPoolOnChain(net.rpcUrl, pairAddress, proto);

    const saved = await upsertIndexedPool({
      chainId: parsedChainId,
      pairAddress: livePool.pairAddress,
      protocolVersion: livePool.protocolVersion,
      token0Address: livePool.token0Address,
      token1Address: livePool.token1Address,
      token0Symbol: livePool.token0Symbol,
      token1Symbol: livePool.token1Symbol,
      token0Decimals: livePool.token0Decimals,
      token1Decimals: livePool.token1Decimals,
      feeTierBps: livePool.feeTierBps || net.swapFeeBps,
      tickSpacing: livePool.tickSpacing,
      sqrtPriceX96: livePool.sqrtPriceX96,
      currentTick: livePool.currentTick,
      currentPrice: livePool.currentPrice,
      creatorWallet:
        typeof creatorWallet === 'string' && isAddress(creatorWallet)
          ? creatorWallet.toLowerCase()
          : '0x0000000000000000000000000000000000000000',
      creationTxHash:
        typeof creationTxHash === 'string' && isHexString(creationTxHash, 32)
          ? creationTxHash.toLowerCase()
          : '',
      reserve0: livePool.reserve0,
      reserve1: livePool.reserve1,
      totalSupply: livePool.totalSupply,
      lastSyncedBlock: livePool.blockNumber,
    });

    await recordPricePoint({
      chainId: parsedChainId,
      poolAddress: livePool.pairAddress,
      token0Symbol: livePool.token0Symbol,
      token1Symbol: livePool.token1Symbol,
      price: livePool.currentPrice,
      reserve0: livePool.reserve0,
      reserve1: livePool.reserve1,
      volumeDelta: '0',
      blockNumber: livePool.blockNumber,
    });

    broadcastWsEvent('pool:updated', { chainId: parsedChainId, pool: saved });
    res.json({ pool: saved, livePool });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to sync pool on-chain';
    res.status(400).json({ error: message });
  }
});

// Public: Fetch user liquidity positions (merges live V3 NFT positions from RPC + indexed positions)
app.get('/api/positions', async (req, res) => {
  try {
    const chainId = req.query.chainId ? Number(req.query.chainId) : undefined;
    const owner =
      typeof req.query.owner === 'string' && isAddress(req.query.owner)
        ? req.query.owner
        : undefined;

    const indexed = await listLiquidityPositions(chainId, owner);
    let liveV3: Awaited<ReturnType<typeof getV3PositionsForOwner>> = [];
    if (chainId && owner) {
      const net = await getNetworkByChainId(chainId);
      if (net && net.uniswapV3PositionManager) {
        try {
          liveV3 = await getV3PositionsForOwner(net, owner);
        } catch {
          // Non-fatal if RPC node temporarily throttles
        }
      }
    }

    res.json({ positions: indexed, liveV3Positions: liveV3 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load liquidity positions';
    res.status(500).json({ error: message });
  }
});

// Public: Sync an LP position after on-chain mint / increase / decrease / collect
app.post('/api/positions/sync', writeRpcLimiter, async (req, res) => {
  try {
    const {
      chainId,
      ownerWallet,
      poolAddress,
      protocolVersion,
      tokenId,
      token0Address,
      token1Address,
      token0Symbol,
      token1Symbol,
      feeTierBps,
      tickLower,
      tickUpper,
      liquidityAmount,
      amount0Deposited,
      amount1Deposited,
      feesEarned0,
      feesEarned1,
      txHash,
      status,
    } = req.body ?? {};

    const parsedChainId = Number(chainId);
    if (
      !Number.isInteger(parsedChainId) ||
      typeof ownerWallet !== 'string' ||
      !isAddress(ownerWallet) ||
      typeof txHash !== 'string' ||
      !isHexString(txHash, 32)
    ) {
      res.status(400).json({ error: 'Valid chainId, ownerWallet, and txHash are required.' });
      return;
    }

    const net = await getNetworkByChainId(parsedChainId);
    if (!net) {
      res.status(404).json({ error: 'Unsupported network.' });
      return;
    }

    const receipt = await verifyTxReceiptOnChain(net.rpcUrl, txHash);
    if (!receipt.found || !receipt.confirmed) {
      res.status(400).json({ error: 'Position transaction is not confirmed on-chain yet.' });
      return;
    }

    const saved = await upsertLiquidityPosition({
      chainId: parsedChainId,
      ownerWallet,
      poolAddress: typeof poolAddress === 'string' ? poolAddress : '',
      protocolVersion: typeof protocolVersion === 'string' ? protocolVersion : 'v3',
      tokenId: String(tokenId ?? '0'),
      token0Address: typeof token0Address === 'string' ? token0Address : '',
      token1Address: typeof token1Address === 'string' ? token1Address : '',
      token0Symbol: typeof token0Symbol === 'string' ? token0Symbol : '',
      token1Symbol: typeof token1Symbol === 'string' ? token1Symbol : '',
      feeTierBps: Number(feeTierBps) || 30,
      tickLower: Number.isFinite(Number(tickLower)) ? Number(tickLower) : -887220,
      tickUpper: Number.isFinite(Number(tickUpper)) ? Number(tickUpper) : 887220,
      liquidityAmount: String(liquidityAmount ?? '0'),
      amount0Deposited: String(amount0Deposited ?? '0'),
      amount1Deposited: String(amount1Deposited ?? '0'),
      feesEarned0: String(feesEarned0 ?? '0'),
      feesEarned1: String(feesEarned1 ?? '0'),
      txHash,
      status: typeof status === 'string' ? status : 'active',
    });

    broadcastWsEvent('position:updated', { chainId: parsedChainId, position: saved });
    res.json({ position: saved });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to sync LP position';
    res.status(400).json({ error: message });
  }
});

// Public: Indexed verified transaction history
app.get('/api/transactions', async (req, res) => {
  try {
    const chainId = req.query.chainId ? Number(req.query.chainId) : undefined;
    const walletAddress =
      typeof req.query.wallet === 'string' && isAddress(req.query.wallet)
        ? req.query.wallet
        : undefined;
    const txType = typeof req.query.type === 'string' ? req.query.type : undefined;

    const items = await listTransactions({ chainId, walletAddress, txType });
    res.json({ transactions: items });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load transactions';
    res.status(500).json({ error: message });
  }
});

// Public: Verify an on-chain swap/liquidity/pair transaction hash via RPC and index it
app.post('/api/transactions/verify', writeRpcLimiter, async (req, res) => {
  try {
    const {
      chainId,
      txHash,
      txType,
      protocolVersion,
      walletAddress,
      tokenInAddress,
      tokenInSymbol,
      tokenOutAddress,
      tokenOutSymbol,
      amountIn,
      amountOut,
      feeAmount,
      feeToken,
      priceImpactPct,
      pairAddress,
    } = req.body ?? {};

    const parsedChainId = Number(chainId);
    if (
      !Number.isInteger(parsedChainId) ||
      typeof txHash !== 'string' ||
      !isHexString(txHash, 32) ||
      typeof walletAddress !== 'string' ||
      !isAddress(walletAddress)
    ) {
      res.status(400).json({ error: 'Valid chainId, txHash, and walletAddress are required.' });
      return;
    }

    const net = await getNetworkByChainId(parsedChainId);
    if (!net) {
      res.status(404).json({ error: 'Unsupported network.' });
      return;
    }

    const receipt = await verifyTxReceiptOnChain(net.rpcUrl, txHash);
    if (!receipt.found) {
      res.status(202).json({
        verified: false,
        status: 'pending',
        message: 'Transaction not yet mined on-chain.',
      });
      return;
    }

    const normalizedType = typeof txType === 'string' ? txType : 'swap';
    const proto = typeof protocolVersion === 'string' ? protocolVersion : 'v3';

    const recorded = await recordVerifiedTransaction({
      chainId: parsedChainId,
      txHash,
      txType: normalizedType,
      walletAddress,
      tokenInAddress: typeof tokenInAddress === 'string' ? tokenInAddress : '',
      tokenInSymbol: typeof tokenInSymbol === 'string' ? tokenInSymbol : '',
      tokenOutAddress: typeof tokenOutAddress === 'string' ? tokenOutAddress : '',
      tokenOutSymbol: typeof tokenOutSymbol === 'string' ? tokenOutSymbol : '',
      amountIn: typeof amountIn === 'string' ? amountIn : '0',
      amountOut: typeof amountOut === 'string' ? amountOut : '0',
      feeAmount: typeof feeAmount === 'string' ? feeAmount : '0',
      feeToken: typeof feeToken === 'string' ? feeToken : '',
      pairAddress: typeof pairAddress === 'string' ? pairAddress : '',
      blockNumber: receipt.blockNumber,
      status: receipt.status,
      verifiedOnChain: receipt.confirmed,
    });

    if (receipt.confirmed && normalizedType === 'swap') {
      const swapRec = await recordSwap({
        chainId: parsedChainId,
        txHash,
        protocolVersion: proto,
        poolAddress: typeof pairAddress === 'string' ? pairAddress : '',
        traderWallet: walletAddress,
        tokenInAddress: typeof tokenInAddress === 'string' ? tokenInAddress : '',
        tokenInSymbol: typeof tokenInSymbol === 'string' ? tokenInSymbol : '',
        tokenOutAddress: typeof tokenOutAddress === 'string' ? tokenOutAddress : '',
        tokenOutSymbol: typeof tokenOutSymbol === 'string' ? tokenOutSymbol : '',
        amountIn: typeof amountIn === 'string' ? amountIn : '0',
        amountOut: typeof amountOut === 'string' ? amountOut : '0',
        feePaid: typeof feeAmount === 'string' ? feeAmount : '0',
        priceImpactPct: typeof priceImpactPct === 'string' ? priceImpactPct : '0',
        blockNumber: receipt.blockNumber,
      });
      broadcastWsEvent('swap:confirmed', { chainId: parsedChainId, swap: swapRec });
    }

    if (receipt.confirmed && typeof pairAddress === 'string' && isAddress(pairAddress)) {
      await recordPoolEvent({
        chainId: parsedChainId,
        poolAddress: pairAddress,
        eventName: normalizedType,
        txHash,
        blockNumber: receipt.blockNumber,
        logIndex: 0,
        actorWallet: walletAddress,
        payloadJson: JSON.stringify({
          protocolVersion: proto,
          tokenInSymbol,
          tokenOutSymbol,
          amountIn,
          amountOut,
        }),
      });

      try {
        const livePool = await readPoolOnChain(net.rpcUrl, pairAddress, proto);
        const volDelta = normalizedType === 'swap' ? Number.parseFloat(String(amountIn || '0')) || 0 : 0;
        const savedPool = await upsertIndexedPool({
          chainId: parsedChainId,
          pairAddress: livePool.pairAddress,
          protocolVersion: livePool.protocolVersion,
          token0Address: livePool.token0Address,
          token1Address: livePool.token1Address,
          token0Symbol: livePool.token0Symbol,
          token1Symbol: livePool.token1Symbol,
          token0Decimals: livePool.token0Decimals,
          token1Decimals: livePool.token1Decimals,
          feeTierBps: livePool.feeTierBps || net.swapFeeBps,
          tickSpacing: livePool.tickSpacing,
          sqrtPriceX96: livePool.sqrtPriceX96,
          currentTick: livePool.currentTick,
          currentPrice: livePool.currentPrice,
          creatorWallet: walletAddress.toLowerCase(),
          creationTxHash: txHash.toLowerCase(),
          reserve0: livePool.reserve0,
          reserve1: livePool.reserve1,
          totalSupply: livePool.totalSupply,
          volume24hDelta: volDelta,
          incrementTxCount: true,
          lastSyncedBlock: livePool.blockNumber,
        });

        await recordPricePoint({
          chainId: parsedChainId,
          poolAddress: livePool.pairAddress,
          token0Symbol: livePool.token0Symbol,
          token1Symbol: livePool.token1Symbol,
          price: livePool.currentPrice,
          reserve0: livePool.reserve0,
          reserve1: livePool.reserve1,
          volumeDelta: volDelta.toString(),
          blockNumber: livePool.blockNumber,
        });

        broadcastWsEvent('pool:updated', { chainId: parsedChainId, pool: savedPool });
      } catch {
        // Non-fatal if pool is newly initialized with zero reserves
      }
    }

    res.json({ verified: receipt.confirmed, transaction: recorded });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Transaction verification failed';
    res.status(400).json({ error: message });
  }
});

// Public: Protocol analytics computed strictly from verified PostgreSQL records
app.get('/api/analytics', async (req, res) => {
  try {
    const chainId = req.query.chainId ? Number(req.query.chainId) : undefined;
    const [allTokens, allPools, allTxs, allFees, allNetworks] = await Promise.all([
      listIndexedTokens(chainId),
      listIndexedPools(chainId),
      listTransactions({ chainId }),
      listFeeCollections(chainId),
      getNetworks(),
    ]);

    const swapTxs = allTxs.filter((t) => t.txType === 'swap' && t.status === 'confirmed');
    const totalListingFeesCollected = allFees.reduce(
      (sum, f) => sum + (Number.parseFloat(f.amountPaid) || 0),
      0
    );
    const totalSwapFeesEstimated = swapTxs.reduce(
      (sum, tx) => sum + (Number.parseFloat(tx.feeAmount) || 0),
      0
    );

    res.json({
      summary: {
        totalListedTokens: allTokens.length,
        totalPools: allPools.length,
        totalTransactions: allTxs.length,
        totalSwaps: swapTxs.length,
        totalListingFeesCollected: totalListingFeesCollected.toFixed(4),
        totalProtocolFeesRecorded: totalSwapFeesEstimated.toFixed(6),
        officialFeeReceiver: OFFICIAL_FEE_RECEIVER,
      },
      feeCollections: allFees,
      networks: allNetworks,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to compute analytics';
    res.status(500).json({ error: message });
  }
});

// Public: Analytics charts data (Phase 8: strictly from verified PostgreSQL records)
app.get('/api/analytics/charts', async (req, res) => {
  try {
    const chainId = req.query.chainId ? Number(req.query.chainId) : undefined;
    const poolAddress =
      typeof req.query.poolAddress === 'string' && isAddress(req.query.poolAddress)
        ? req.query.poolAddress
        : undefined;

    const [priceSeries, recentSwaps, topPools, topTokens] = await Promise.all([
      listPriceHistory(chainId, poolAddress),
      listSwaps(chainId),
      listIndexedPools(chainId),
      listIndexedTokens(chainId),
    ]);

    res.json({
      priceHistory: [...priceSeries].reverse(),
      recentSwaps,
      topPools,
      topTokens,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load analytics charts';
    res.status(500).json({ error: message });
  }
});

// Authenticated Admin Overview (Locked to Authorized Owner Email)
app.get('/api/admin/overview', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const [allTokens, allListings, allPools, allTxs, allFees, allNetworks, auditLogs] =
      await Promise.all([
        listIndexedTokens(),
        listTokenListings(),
        listIndexedPools(),
        listTransactions(),
        listFeeCollections(),
        getNetworks(),
        listAdminAuditLogs(),
      ]);

    res.json({
      operatorEmail: req.user?.email || '',
      officialFeeReceiver: OFFICIAL_FEE_RECEIVER,
      metrics: {
        totalListedTokens: allTokens.length,
        totalPools: allPools.length,
        totalTransactions: allTxs.length,
        totalSwaps: allTxs.filter((t) => t.txType === 'swap').length,
        totalListingFeesCollected: allFees
          .reduce((sum, f) => sum + (Number.parseFloat(f.amountPaid) || 0), 0)
          .toFixed(4),
      },
      networks: allNetworks,
      tokenListings: allListings,
      pools: allPools.slice(0, 30),
      recentTransactions: allTxs.slice(0, 30),
      recentFees: allFees.slice(0, 20),
      auditLogs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load admin overview';
    res.status(500).json({ error: message });
  }
});

// Authenticated Admin Network, RPC & Contract Configuration (Locked to Authorized Owner Email)
app.post('/api/admin/network', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const {
      chainId,
      walletAddress,
      signature,
      signedMessage,
      isEnabled,
      isPaused,
      rpcUrl,
      explorerUrl,
      wrappedNativeAddress,
      usdtAddress,
      factoryAddress,
      routerAddress,
      listingFeeContract,
      feeManagerContract,
      uniswapV2Factory,
      uniswapV2Router,
      uniswapV3Factory,
      uniswapV3PositionManager,
      uniswapV3SwapRouter,
      uniswapV3Quoter,
      uniswapV4PoolManager,
      listingFeeUsdt,
      feeReceiverWallet,
      acceptedPaymentToken,
      swapFeeBps,
      protocolFeeBps,
      txHash,
    } = req.body ?? {};

    const parsedChainId = Number(chainId);
    if (
      !Number.isInteger(parsedChainId) ||
      typeof walletAddress !== 'string' ||
      !isAddress(walletAddress) ||
      typeof signature !== 'string' ||
      typeof signedMessage !== 'string'
    ) {
      res.status(400).json({
        error: 'Valid chainId, walletAddress, signedMessage, and signature are required.',
      });
      return;
    }

    const sigValid = verifyWalletSignature(signedMessage, signature, walletAddress);
    if (!sigValid) {
      res.status(403).json({ error: 'Invalid wallet signature.' });
      return;
    }

    const updates: Record<string, unknown> = {};
    if (typeof isEnabled === 'boolean') updates.isEnabled = isEnabled;
    if (typeof isPaused === 'boolean') updates.isPaused = isPaused;
    if (typeof rpcUrl === 'string' && /^https?:\/\//i.test(rpcUrl.trim())) {
      updates.rpcUrl = rpcUrl.trim();
    }
    if (typeof explorerUrl === 'string' && /^https?:\/\//i.test(explorerUrl.trim())) {
      updates.explorerUrl = explorerUrl.trim().replace(/\/+$/, '');
    }

    const addressFields: [string, unknown][] = [
      ['wrappedNativeAddress', wrappedNativeAddress],
      ['usdtAddress', usdtAddress],
      ['factoryAddress', factoryAddress],
      ['routerAddress', routerAddress],
      ['listingFeeContract', listingFeeContract],
      ['feeManagerContract', feeManagerContract],
      ['uniswapV2Factory', uniswapV2Factory],
      ['uniswapV2Router', uniswapV2Router],
      ['uniswapV3Factory', uniswapV3Factory],
      ['uniswapV3PositionManager', uniswapV3PositionManager],
      ['uniswapV3SwapRouter', uniswapV3SwapRouter],
      ['uniswapV3Quoter', uniswapV3Quoter],
      ['uniswapV4PoolManager', uniswapV4PoolManager],
    ];
    for (const [key, val] of addressFields) {
      if (typeof val === 'string' && (val === '' || isAddress(val))) {
        updates[key] = val;
      }
    }

    if (typeof listingFeeUsdt === 'string' && Number(listingFeeUsdt) >= 0) {
      updates.listingFeeUsdt = listingFeeUsdt;
    }
    if (typeof feeReceiverWallet === 'string' && isAddress(feeReceiverWallet)) {
      updates.feeReceiverWallet = feeReceiverWallet;
    }
    if (typeof acceptedPaymentToken === 'string' && isAddress(acceptedPaymentToken)) {
      updates.acceptedPaymentToken = acceptedPaymentToken;
    }
    if (typeof swapFeeBps === 'number' && swapFeeBps >= 0 && swapFeeBps <= 100) {
      updates.swapFeeBps = swapFeeBps;
    }
    if (typeof protocolFeeBps === 'number' && protocolFeeBps >= 0 && protocolFeeBps <= 100) {
      updates.protocolFeeBps = protocolFeeBps;
    }

    const updated = await updateNetworkConfig(parsedChainId, updates);
    if (!updated) {
      res.status(404).json({ error: 'Network not found.' });
      return;
    }

    // Auto-index wrapped native and USDT base tokens so Swap / Create Pool / Liquidity pickers show them right away
    for (const baseAddr of [updated.wrappedNativeAddress, updated.usdtAddress]) {
      if (baseAddr && isAddress(baseAddr)) {
        try {
          const meta = await inspectTokenOnChain(updated.rpcUrl, baseAddr);
          await upsertIndexedToken({
            chainId: parsedChainId,
            address: meta.address,
            name: meta.name,
            symbol: meta.symbol,
            decimals: meta.decimals,
            totalSupply: meta.totalSupply,
            listedByWallet: walletAddress,
            listingTxHash: typeof txHash === 'string' ? txHash : '',
            listingFeePaid: '0',
            feePaymentToken: updated.usdtAddress || '',
            feeReceiverWallet: updated.feeReceiverWallet,
            verificationStatus: 'verified',
            onChainVerified: true,
          });
        } catch {
          // Non-fatal if RPC node is temporarily unreachable while saving addresses
        }
      }
    }

    protocolCache.delete(parsedChainId);
    await addAdminAuditLog({
      actorUid: req.user?.uid || 'unknown',
      actorWallet: walletAddress,
      action: `UPDATE_NETWORK_${parsedChainId}`,
      details: JSON.stringify(updates),
      txHash: typeof txHash === 'string' ? txHash : '',
    });

    broadcastWsEvent('network:updated', { chainId: parsedChainId, network: updated });
    res.json({ network: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update network config';
    res.status(500).json({ error: message });
  }
});

// Authenticated Admin Token Verification Label Update (Locked to Authorized Owner Email)
app.post('/api/admin/token-verification', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const {
      chainId,
      tokenAddress,
      verificationStatus,
      reviewerNote,
      walletAddress,
      signature,
      signedMessage,
    } = req.body ?? {};
    const parsedChainId = Number(chainId);

    if (
      !Number.isInteger(parsedChainId) ||
      typeof tokenAddress !== 'string' ||
      !isAddress(tokenAddress) ||
      !['verified', 'unverified', 'flagged'].includes(verificationStatus) ||
      typeof walletAddress !== 'string' ||
      !isAddress(walletAddress) ||
      typeof signature !== 'string' ||
      typeof signedMessage !== 'string'
    ) {
      res.status(400).json({ error: 'Invalid verification update payload.' });
      return;
    }

    const sigValid = verifyWalletSignature(signedMessage, signature, walletAddress);
    if (!sigValid) {
      res.status(403).json({ error: 'Invalid wallet signature.' });
      return;
    }

    const updated = await updateTokenVerification(
      parsedChainId,
      tokenAddress,
      verificationStatus,
      typeof reviewerNote === 'string' ? reviewerNote : ''
    );
    if (!updated) {
      res.status(404).json({ error: 'Token not found.' });
      return;
    }

    await addAdminAuditLog({
      actorUid: req.user?.uid || 'unknown',
      actorWallet: walletAddress,
      action: `TOKEN_LABEL_${verificationStatus.toUpperCase()}`,
      details: `${tokenAddress} on chain ${parsedChainId}`,
    });

    res.json({ token: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update token label';
    res.status(500).json({ error: message });
  }
});

async function startServer() {
  const httpServer = http.createServer(app);

  // Handle WebSocket upgrade requests cleanly only on /ws
  httpServer.on('upgrade', (request, socket, head) => {
    const url = request.url || '';
    if (url.startsWith('/ws')) {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit('connection', ws, request);
      });
    }
  });

  const isProduction =
    process.env.NODE_ENV === 'production' || process.env.RENDER === 'true';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`TataSwap DEX & WebSocket server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
