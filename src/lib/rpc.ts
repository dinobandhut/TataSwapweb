import { Contract, Interface, JsonRpcProvider, formatUnits, isAddress, isHexString } from 'ethers';
import { createPublicClient, http, type Address, type PublicClient } from 'viem';
import { ERC20_ABI, LISTING_FEE_ABI, POOL_ABI } from './abis.ts';
import {
  ERC20_VIEM_ABI,
  UNISWAP_V3_POOL_ABI,
  UNISWAP_V4_STATE_VIEW_ABI,
} from './uniswap/abis.ts';
import {
  ZERO_ADDRESS,
  decodeSqrtPriceX96ToPrice,
  fetchUserV3PositionsOnChain,
  getV4PeripheryContracts,
  verifyProtocolAvailability,
} from './uniswap/adapters.ts';
import type { NetworkConfig, ProtocolStatus } from '../types/dex.ts';

const providerCache = new Map<string, JsonRpcProvider>();
const viemClientCache = new Map<string, PublicClient>();

export function getRpcProvider(rpcUrl: string): JsonRpcProvider {
  let provider = providerCache.get(rpcUrl);
  if (!provider) {
    provider = new JsonRpcProvider(rpcUrl, undefined, {
      staticNetwork: false,
    });
    providerCache.set(rpcUrl, provider);
  }
  return provider;
}

export function getViemPublicClient(rpcUrl: string): PublicClient {
  let client = viemClientCache.get(rpcUrl);
  if (!client) {
    client = createPublicClient({
      transport: http(rpcUrl, { timeout: 10000 }),
    });
    viemClientCache.set(rpcUrl, client);
  }
  return client;
}

export async function withRpcTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('RPC request timed out')), ms)
    ),
  ]);
}

export async function inspectTokenOnChain(rpcUrl: string, tokenAddress: string) {
  if (!isAddress(tokenAddress)) {
    throw new Error('Invalid contract address format.');
  }

  const provider = getRpcProvider(rpcUrl);
  const bytecode = await withRpcTimeout(provider.getCode(tokenAddress));
  if (!bytecode || bytecode === '0x') {
    throw new Error('No smart contract bytecode found at this address on the selected network.');
  }

  const token = new Contract(tokenAddress, ERC20_ABI, provider);

  const [name, symbol, decimalsRaw, totalSupplyRaw] = await withRpcTimeout(
    Promise.all([
      token.name(),
      token.symbol(),
      token.decimals(),
      token.totalSupply(),
    ])
  );

  const decimals = Number(decimalsRaw);
  const totalSupply = formatUnits(totalSupplyRaw, decimals);

  return {
    address: tokenAddress,
    name: String(name),
    symbol: String(symbol),
    decimals,
    totalSupply,
    hasCode: true,
    bytecodeSizeBytes: (bytecode.length - 2) / 2,
  };
}

export async function verifyTxReceiptOnChain(rpcUrl: string, txHash: string) {
  const provider = getRpcProvider(rpcUrl);
  const [receipt, tx] = await withRpcTimeout(
    Promise.all([
      provider.getTransactionReceipt(txHash),
      provider.getTransaction(txHash),
    ])
  );

  if (!receipt || !tx) {
    return {
      found: false,
      confirmed: false,
      status: 'pending' as const,
      blockNumber: 0,
      from: '',
      to: '',
      logs: [] as readonly { topics: readonly string[]; data: string; address: string; index?: number }[],
    };
  }

  const confirmed = receipt.status === 1;
  return {
    found: true,
    confirmed,
    status: confirmed ? ('confirmed' as const) : ('reverted' as const),
    blockNumber: Number(receipt.blockNumber),
    from: tx.from,
    to: tx.to || '',
    logs: receipt.logs.map((l) => ({
      topics: l.topics,
      data: l.data,
      address: l.address,
      index: l.index,
    })),
  };
}

export function extractListingFeeFromLogs(
  logs: readonly { topics: readonly string[]; data: string; address: string }[],
  expectedReceiver: string,
  expectedPaymentToken: string
) {
  const listingIface = new Interface(LISTING_FEE_ABI);
  const erc20Iface = new Interface(ERC20_ABI);

  for (const log of logs) {
    try {
      const parsed = listingIface.parseLog(log);
      if (parsed && parsed.name === 'ListingFeeCollected') {
        const receiver = String(parsed.args.feeReceiverWallet).toLowerCase();
        const payToken = String(parsed.args.paymentToken).toLowerCase();
        if (
          receiver === expectedReceiver.toLowerCase() &&
          (!expectedPaymentToken || payToken === expectedPaymentToken.toLowerCase())
        ) {
          return {
            matched: true,
            lister: String(parsed.args.lister),
            tokenAddress: String(parsed.args.tokenAddress),
            paymentToken: String(parsed.args.paymentToken),
            feeAmountWei: parsed.args.feeAmount.toString(),
            receiver: String(parsed.args.feeReceiverWallet),
          };
        }
      }
    } catch {
      // Not a ListingFeeCollected log
    }

    try {
      const parsedTransfer = erc20Iface.parseLog(log);
      if (
        parsedTransfer &&
        parsedTransfer.name === 'Transfer' &&
        log.address.toLowerCase() === expectedPaymentToken.toLowerCase() &&
        String(parsedTransfer.args.to).toLowerCase() === expectedReceiver.toLowerCase()
      ) {
        return {
          matched: true,
          lister: String(parsedTransfer.args.from),
          tokenAddress: '',
          paymentToken: log.address,
          feeAmountWei: parsedTransfer.args.value.toString(),
          receiver: String(parsedTransfer.args.to),
        };
      }
    } catch {
      // Not an ERC20 Transfer log
    }
  }

  return { matched: false };
}

export async function readPoolOnChain(
  rpcUrl: string,
  pairAddress: string,
  protocolVersion: string = 'v3'
) {
  if (!isAddress(pairAddress)) {
    throw new Error('Invalid pool contract address.');
  }

  const client = getViemPublicClient(rpcUrl);
  const bytecode = await withRpcTimeout(
    client.getBytecode({ address: pairAddress as Address })
  );
  if (!bytecode || bytecode === '0x') {
    throw new Error('No pool contract found at this address.');
  }

  // Try Uniswap V3 pool signature first if protocolVersion === 'v3'
  if (protocolVersion === 'v3') {
    try {
      const [token0Addr, token1Addr, fee, tickSpacing, liquidity, slot0, blockNumber] =
        await withRpcTimeout(
          Promise.all([
            client.readContract({
              address: pairAddress as Address,
              abi: UNISWAP_V3_POOL_ABI,
              functionName: 'token0',
            }),
            client.readContract({
              address: pairAddress as Address,
              abi: UNISWAP_V3_POOL_ABI,
              functionName: 'token1',
            }),
            client.readContract({
              address: pairAddress as Address,
              abi: UNISWAP_V3_POOL_ABI,
              functionName: 'fee',
            }),
            client.readContract({
              address: pairAddress as Address,
              abi: UNISWAP_V3_POOL_ABI,
              functionName: 'tickSpacing',
            }),
            client.readContract({
              address: pairAddress as Address,
              abi: UNISWAP_V3_POOL_ABI,
              functionName: 'liquidity',
            }),
            client.readContract({
              address: pairAddress as Address,
              abi: UNISWAP_V3_POOL_ABI,
              functionName: 'slot0',
            }),
            client.getBlockNumber(),
          ])
        );

      const [sym0, dec0Raw, bal0Raw, sym1, dec1Raw, bal1Raw] = await withRpcTimeout(
        Promise.all([
          client.readContract({ address: token0Addr, abi: ERC20_VIEM_ABI, functionName: 'symbol' }),
          client.readContract({ address: token0Addr, abi: ERC20_VIEM_ABI, functionName: 'decimals' }),
          client.readContract({
            address: token0Addr,
            abi: ERC20_VIEM_ABI,
            functionName: 'balanceOf',
            args: [pairAddress as Address],
          }),
          client.readContract({ address: token1Addr, abi: ERC20_VIEM_ABI, functionName: 'symbol' }),
          client.readContract({ address: token1Addr, abi: ERC20_VIEM_ABI, functionName: 'decimals' }),
          client.readContract({
            address: token1Addr,
            abi: ERC20_VIEM_ABI,
            functionName: 'balanceOf',
            args: [pairAddress as Address],
          }),
        ])
      );

      const dec0 = Number(dec0Raw);
      const dec1 = Number(dec1Raw);
      const sqrtPriceX96 = slot0[0];
      const currentTick = Number(slot0[1]);
      const price = decodeSqrtPriceX96ToPrice(sqrtPriceX96, dec0, dec1);

      return {
        pairAddress,
        protocolVersion: 'v3',
        token0Address: String(token0Addr),
        token1Address: String(token1Addr),
        token0Symbol: String(sym0),
        token1Symbol: String(sym1),
        token0Decimals: dec0,
        token1Decimals: dec1,
        feeTierBps: Math.round(Number(fee) / 100),
        tickSpacing: Number(tickSpacing),
        sqrtPriceX96: sqrtPriceX96.toString(),
        currentTick,
        currentPrice: price.toPrecision(8),
        reserve0: formatUnits(bal0Raw, dec0),
        reserve1: formatUnits(bal1Raw, dec1),
        totalSupply: liquidity.toString(),
        blockNumber: Number(blockNumber),
      };
    } catch {
      // Fallback to V2 / TataSwap pair read
    }
  }

  const provider = getRpcProvider(rpcUrl);
  const pool = new Contract(pairAddress, POOL_ABI, provider);
  const [token0Addr, token1Addr, reserves, totalSupplyRaw] = await withRpcTimeout(
    Promise.all([
      pool.token0(),
      pool.token1(),
      pool.getReserves(),
      pool.totalSupply(),
    ])
  );

  const t0 = new Contract(token0Addr, ERC20_ABI, provider);
  const t1 = new Contract(token1Addr, ERC20_ABI, provider);

  const [s0, d0, s1, d1, blockNumber] = await withRpcTimeout(
    Promise.all([
      t0.symbol(),
      t0.decimals(),
      t1.symbol(),
      t1.decimals(),
      provider.getBlockNumber(),
    ])
  );

  const dec0 = Number(d0);
  const dec1 = Number(d1);
  const r0 = formatUnits(reserves[0], dec0);
  const r1 = formatUnits(reserves[1], dec1);
  const price = Number(r0) > 0 ? (Number(r1) / Number(r0)).toPrecision(8) : '0';

  return {
    pairAddress,
    protocolVersion: protocolVersion === 'v2' ? 'v2' : 'tataswap',
    token0Address: String(token0Addr),
    token1Address: String(token1Addr),
    token0Symbol: String(s0),
    token1Symbol: String(s1),
    token0Decimals: dec0,
    token1Decimals: dec1,
    feeTierBps: 30,
    tickSpacing: 0,
    sqrtPriceX96: '0',
    currentTick: 0,
    currentPrice: price,
    reserve0: r0,
    reserve1: r1,
    totalSupply: formatUnits(totalSupplyRaw, 18),
    blockNumber: Number(blockNumber),
  };
}

export async function readV4PoolOnChain(params: {
  rpcUrl: string;
  chainId: number;
  poolId: string;
  token0Address: string;
  token1Address: string;
  feeTier: number;
  tickSpacing: number;
}) {
  const { rpcUrl, chainId, poolId, token0Address, token1Address, feeTier, tickSpacing } = params;
  if (!isHexString(poolId, 32)) {
    throw new Error('Invalid Uniswap V4 PoolId (expected 32-byte hex).');
  }
  const v4 = getV4PeripheryContracts(chainId);
  if (!v4) {
    throw new Error('Uniswap V4 StateView is not configured for this network.');
  }
  const client = getViemPublicClient(rpcUrl);
  const [slot0, liquidity, blockNumber] = await withRpcTimeout(
    Promise.all([
      client.readContract({
        address: v4.stateView,
        abi: UNISWAP_V4_STATE_VIEW_ABI,
        functionName: 'getSlot0',
        args: [poolId as `0x${string}`],
      }),
      client.readContract({
        address: v4.stateView,
        abi: UNISWAP_V4_STATE_VIEW_ABI,
        functionName: 'getLiquidity',
        args: [poolId as `0x${string}`],
      }),
      client.getBlockNumber(),
    ])
  );

  const sqrtPriceX96 = slot0[0];
  if (sqrtPriceX96 === 0n) {
    throw new Error('Uniswap V4 pool is not initialized yet on-chain.');
  }

  let sym0 = 'ETH';
  let dec0 = 18;
  if (token0Address && token0Address.toLowerCase() !== ZERO_ADDRESS) {
    const [s, d] = await Promise.all([
      client.readContract({
        address: token0Address as Address,
        abi: ERC20_VIEM_ABI,
        functionName: 'symbol',
      }),
      client.readContract({
        address: token0Address as Address,
        abi: ERC20_VIEM_ABI,
        functionName: 'decimals',
      }),
    ]);
    sym0 = String(s);
    dec0 = Number(d);
  }

  let sym1 = 'ETH';
  let dec1 = 18;
  if (token1Address && token1Address.toLowerCase() !== ZERO_ADDRESS) {
    const [s, d] = await Promise.all([
      client.readContract({
        address: token1Address as Address,
        abi: ERC20_VIEM_ABI,
        functionName: 'symbol',
      }),
      client.readContract({
        address: token1Address as Address,
        abi: ERC20_VIEM_ABI,
        functionName: 'decimals',
      }),
    ]);
    sym1 = String(s);
    dec1 = Number(d);
  }

  const price = decodeSqrtPriceX96ToPrice(sqrtPriceX96, dec0, dec1);
  return {
    pairAddress: poolId,
    protocolVersion: 'v4',
    token0Address: token0Address || ZERO_ADDRESS,
    token1Address: token1Address || ZERO_ADDRESS,
    token0Symbol: sym0,
    token1Symbol: sym1,
    token0Decimals: dec0,
    token1Decimals: dec1,
    feeTierBps: Math.round(feeTier / 100),
    tickSpacing,
    sqrtPriceX96: sqrtPriceX96.toString(),
    currentTick: Number(slot0[1]),
    currentPrice: price.toPrecision(8),
    reserve0: '0',
    reserve1: '0',
    totalSupply: liquidity.toString(),
    blockNumber: Number(blockNumber),
  };
}

export async function getProtocolStatusForNetwork(
  network: NetworkConfig
): Promise<ProtocolStatus> {
  const client = getViemPublicClient(network.rpcUrl);
  return await withRpcTimeout(verifyProtocolAvailability(client, network), 12000);
}

export async function getV3PositionsForOwner(
  network: NetworkConfig,
  owner: string
) {
  const client = getViemPublicClient(network.rpcUrl);
  return await withRpcTimeout(fetchUserV3PositionsOnChain(client, network, owner), 15000);
}
