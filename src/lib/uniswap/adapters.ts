import {
  encodeAbiParameters,
  formatUnits,
  isAddress,
  keccak256,
  parseUnits,
  type Address,
  type PublicClient,
} from 'viem';
import type {
  AmmProtocolVersion,
  LiquidityPositionRecord,
  NetworkConfig,
  ProtocolStatus,
} from '../../types/dex.ts';
import {
  ERC20_VIEM_ABI,
  UNISWAP_V2_FACTORY_ABI,
  UNISWAP_V2_PAIR_ABI,
  UNISWAP_V2_ROUTER_ABI,
  UNISWAP_V3_FACTORY_ABI,
  UNISWAP_V3_NPM_ABI,
  UNISWAP_V3_POOL_ABI,
  UNISWAP_V3_QUOTER_V2_ABI,
  UNISWAP_V4_STATE_VIEW_ABI,
} from './abis.ts';

export const ZERO_ADDRESS: Address = '0x0000000000000000000000000000000000000000';
export const MAX_UINT128 = (1n << 128n) - 1n;
export const MIN_TICK = -887272;
export const MAX_TICK = 887272;
const Q96 = 2n ** 96n;

export interface V3FeeTierOption {
  fee: 100 | 500 | 3000 | 10000;
  bps: number;
  label: string;
  tickSpacing: number;
  description: string;
}

export const V3_FEE_TIERS: V3FeeTierOption[] = [
  { fee: 100, bps: 1, label: '0.01%', tickSpacing: 1, description: 'Best for very stable pairs' },
  { fee: 500, bps: 5, label: '0.05%', tickSpacing: 10, description: 'Best for stable pairs' },
  { fee: 3000, bps: 30, label: '0.30%', tickSpacing: 60, description: 'Best for most pairs' },
  { fee: 10000, bps: 100, label: '1.00%', tickSpacing: 200, description: 'Best for exotic pairs' },
];

export interface V4FeeTierOption {
  fee: number;
  label: string;
  tickSpacing: number;
  description: string;
}

export const V4_FEE_TIERS: V4FeeTierOption[] = [
  { fee: 100, label: '0.01%', tickSpacing: 1, description: 'Best for very stable pairs' },
  { fee: 500, label: '0.05%', tickSpacing: 10, description: 'Best for stable pairs' },
  { fee: 3000, label: '0.30%', tickSpacing: 60, description: 'Best for most pairs' },
  { fee: 10000, label: '1.00%', tickSpacing: 200, description: 'Best for exotic pairs' },
];

export const V4_PERIPHERY_DEPLOYMENTS: Record<
  number,
  { poolManager: Address; positionManager: Address; stateView: Address }
> = {
  1: {
    poolManager: '0x000000000004444c5dc75cB358380D2e3dE08A90',
    positionManager: '0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e',
    stateView: '0x7ffe42c4a5deea5b0fec41c94c136cf115597227',
  },
  137: {
    poolManager: '0x67366782805870060151383F4BbFF9daB53e5cD6',
    positionManager: '0x1ec2ebf4f37e7363fdfe3551602425af0b3ceef9',
    stateView: '0x5ea1bd7974c8a611cbab0bdcafcb1d9cc9b3ba5a',
  },
  8453: {
    poolManager: '0x498581fF718922c3f8e6A244956aF099B2652b2b',
    positionManager: '0x7c5f5a4bbd8fd63184577525326123b519429bdc',
    stateView: '0xa3c0c9b65bad0b08107aa264b0f3db444b867a71',
  },
  42161: {
    poolManager: '0x360E68faCcca8cA495c1B759Fd9EEe466db9FB32',
    positionManager: '0xd88f38f930b7952f2db2432cb002e7abbf3dd869',
    stateView: '0x76fd297e2d437cd7f76d50f01afe6160f86e9990',
  },
  56: {
    poolManager: '0x28e2Ea090877bF75740558f6BFB36A5ffeE9e9dF',
    positionManager: '0x7a4a5c919ae2541aed11041a1aeee68f1287f95b',
    stateView: '0xd13dd3d6e93f276fafc9db9e6bb47c1180aee0c4',
  },
  11155111: {
    poolManager: '0xE03A1074c86CFeDd5C142C4F04F1a1536e203543',
    positionManager: '0x429ba70129df741B2Ca2a85BC3A2a3328e5c09b4',
    stateView: '0xe1dd9c3fa50edb962e442f60dfbc432e24537e4c',
  },
};

export function getV4PeripheryContracts(chainId: number) {
  return V4_PERIPHERY_DEPLOYMENTS[chainId] || null;
}

export function computeV4PoolId(params: {
  currency0: Address;
  currency1: Address;
  fee: number;
  tickSpacing: number;
  hooks?: Address;
}): `0x${string}` {
  const hooks = params.hooks && isAddress(params.hooks) ? params.hooks : ZERO_ADDRESS;
  const encoded = encodeAbiParameters(
    [
      { type: 'address' },
      { type: 'address' },
      { type: 'uint24' },
      { type: 'int24' },
      { type: 'address' },
    ],
    [params.currency0, params.currency1, params.fee, params.tickSpacing, hooks]
  );
  return keccak256(encoded);
}

export function getTickSpacingForFee(fee: number): number {
  const found =
    V3_FEE_TIERS.find((t) => t.fee === fee) || V4_FEE_TIERS.find((t) => t.fee === fee);
  return found ? found.tickSpacing : 60;
}

export function fullRangeTicks(tickSpacing: number): { tickLower: number; tickUpper: number } {
  const tickLower = Math.ceil(MIN_TICK / tickSpacing) * tickSpacing;
  const tickUpper = Math.floor(MAX_TICK / tickSpacing) * tickSpacing;
  return { tickLower, tickUpper };
}

export function nearestUsableTick(tick: number, tickSpacing: number): number {
  const rounded = Math.round(tick / tickSpacing) * tickSpacing;
  const minUsable = Math.ceil(MIN_TICK / tickSpacing) * tickSpacing;
  const maxUsable = Math.floor(MAX_TICK / tickSpacing) * tickSpacing;
  if (rounded < minUsable) return minUsable;
  if (rounded > maxUsable) return maxUsable;
  return rounded;
}

export function sortTokens(tokenA: string, tokenB: string): {
  token0: Address;
  token1: Address;
  reversed: boolean;
} {
  const a = tokenA.toLowerCase();
  const b = tokenB.toLowerCase();
  if (a < b) {
    return { token0: tokenA as Address, token1: tokenB as Address, reversed: false };
  }
  return { token0: tokenB as Address, token1: tokenA as Address, reversed: true };
}

/**
 * Encodes human-readable price (token1 per 1 token0) into Uniswap V3 sqrtPriceX96.
 */
export function encodeSqrtPriceX96(
  priceToken1PerToken0: number,
  decimals0: number,
  decimals1: number
): bigint {
  if (!Number.isFinite(priceToken1PerToken0) || priceToken1PerToken0 <= 0) {
    throw new Error('Initial price must be greater than 0.');
  }
  const adjustedRatio = priceToken1PerToken0 * 10 ** (decimals1 - decimals0);
  const sqrtRatio = Math.sqrt(adjustedRatio);
  // Maintain 15 significant digits before scaling to 2^96
  const scale = 1e15;
  const scaledInt = BigInt(Math.max(1, Math.round(sqrtRatio * scale)));
  return (scaledInt * Q96) / BigInt(scale);
}

/**
 * Decodes Uniswap V3 sqrtPriceX96 into human price (token1 per 1 token0).
 */
export function decodeSqrtPriceX96ToPrice(
  sqrtPriceX96: bigint,
  decimals0: number,
  decimals1: number
): number {
  if (sqrtPriceX96 <= 0n) return 0;
  // Convert safely using high precision shift
  const ratioScaled = Number((sqrtPriceX96 * 1_000_000_000n) / Q96) / 1_000_000_000;
  const rawPrice = ratioScaled * ratioScaled;
  return rawPrice * 10 ** (decimals0 - decimals1);
}

export function priceToTick(priceToken1PerToken0: number, decimals0: number, decimals1: number): number {
  if (!Number.isFinite(priceToken1PerToken0) || priceToken1PerToken0 <= 0) return 0;
  const rawPrice = priceToken1PerToken0 * 10 ** (decimals1 - decimals0);
  const tick = Math.floor(Math.log(rawPrice) / Math.log(1.0001));
  return Math.max(MIN_TICK, Math.min(MAX_TICK, tick));
}

export function tickToPrice(tick: number, decimals0: number, decimals1: number): number {
  const rawPrice = 1.0001 ** tick;
  return rawPrice * 10 ** (decimals0 - decimals1);
}

export function tickToSqrtPriceFloat(tick: number): number {
  return 1.0001 ** (tick / 2);
}

/**
 * Computes proportional Token1 amount (human units) required for a given Token0 deposit
 * inside Uniswap V3 [tickLower, tickUpper] at current sqrtPriceX96.
 */
export function estimateV3PairedAmount(params: {
  amountInput: number;
  isInputToken0: boolean;
  currentPrice1Per0: number;
  tickLower: number;
  tickUpper: number;
  decimals0: number;
  decimals1: number;
}): number {
  const { amountInput, isInputToken0, currentPrice1Per0, tickLower, tickUpper, decimals0, decimals1 } =
    params;
  if (!Number.isFinite(amountInput) || amountInput <= 0 || currentPrice1Per0 <= 0) return 0;

  const rawPrice = currentPrice1Per0 * 10 ** (decimals1 - decimals0);
  const sqrtP = Math.sqrt(rawPrice);
  const sqrtPa = tickToSqrtPriceFloat(tickLower);
  const sqrtPb = tickToSqrtPriceFloat(tickUpper);

  if (sqrtP <= sqrtPa) {
    // Below range: only token0 is needed
    return isInputToken0 ? 0 : amountInput / currentPrice1Per0;
  }
  if (sqrtP >= sqrtPb) {
    // Above range: only token1 is needed
    return isInputToken0 ? amountInput * currentPrice1Per0 : 0;
  }

  if (isInputToken0) {
    const amount0Raw = amountInput * 10 ** decimals0;
    const L = (amount0Raw * sqrtP * sqrtPb) / (sqrtPb - sqrtP);
    const amount1Raw = L * (sqrtP - sqrtPa);
    return amount1Raw / 10 ** decimals1;
  } else {
    const amount1Raw = amountInput * 10 ** decimals1;
    const L = amount1Raw / (sqrtP - sqrtPa);
    const amount0Raw = (L * (sqrtPb - sqrtP)) / (sqrtP * sqrtPb);
    return amount0Raw / 10 ** decimals0;
  }
}

export function estimateV3AmountsFromLiquidity(params: {
  liquidity: bigint;
  sqrtPriceX96: bigint;
  tickLower: number;
  tickUpper: number;
  decimals0: number;
  decimals1: number;
}): { amount0: string; amount1: string } {
  const { liquidity, sqrtPriceX96, tickLower, tickUpper, decimals0, decimals1 } = params;
  if (liquidity === 0n || sqrtPriceX96 === 0n) {
    return { amount0: '0', amount1: '0' };
  }
  const L = Number(liquidity);
  const sqrtP = Number((sqrtPriceX96 * 1_000_000_000n) / Q96) / 1_000_000_000;
  const sqrtPa = tickToSqrtPriceFloat(tickLower);
  const sqrtPb = tickToSqrtPriceFloat(tickUpper);

  let raw0 = 0;
  let raw1 = 0;
  if (sqrtP <= sqrtPa) {
    raw0 = L * (1 / sqrtPa - 1 / sqrtPb);
  } else if (sqrtP < sqrtPb) {
    raw0 = L * (1 / sqrtP - 1 / sqrtPb);
    raw1 = L * (sqrtP - sqrtPa);
  } else {
    raw1 = L * (sqrtPb - sqrtPa);
  }
  return {
    amount0: Math.max(0, raw0 / 10 ** decimals0).toFixed(6),
    amount1: Math.max(0, raw1 / 10 ** decimals1).toFixed(6),
  };
}

async function hasContractCode(client: PublicClient, addr: string): Promise<boolean> {
  if (!addr || !isAddress(addr)) return false;
  try {
    const code = await client.getBytecode({ address: addr as Address });
    return Boolean(code && code !== '0x');
  } catch {
    return false;
  }
}

/**
 * Verifies real on-chain bytecode for Uniswap V3, Uniswap V2, Uniswap V4, and TataSwap
 * on the selected blockchain network before enabling protocol adapters in UI.
 */
export async function verifyProtocolAvailability(
  client: PublicClient,
  network: NetworkConfig
): Promise<ProtocolStatus> {
  const v4Periphery = getV4PeripheryContracts(network.chainId);
  const [
    v3Factory,
    v3Npm,
    v3Router,
    v3Quoter,
    v2Factory,
    v2Router,
    v4Pm,
    v4PosM,
    tsFactory,
    tsRouter,
    tsListing,
  ] = await Promise.all([
    hasContractCode(client, network.uniswapV3Factory),
    hasContractCode(client, network.uniswapV3PositionManager),
    hasContractCode(client, network.uniswapV3SwapRouter),
    hasContractCode(client, network.uniswapV3Quoter),
    hasContractCode(client, network.uniswapV2Factory),
    hasContractCode(client, network.uniswapV2Router),
    hasContractCode(client, network.uniswapV4PoolManager),
    v4Periphery ? hasContractCode(client, v4Periphery.positionManager) : Promise.resolve(false),
    hasContractCode(client, network.factoryAddress),
    hasContractCode(client, network.routerAddress),
    hasContractCode(client, network.listingFeeContract),
  ]);

  return {
    v3: {
      available: v3Factory && v3Npm && v3Router,
      factoryCode: v3Factory,
      npmCode: v3Npm,
      routerCode: v3Router,
      quoterCode: v3Quoter,
    },
    v2: {
      available: v2Factory && v2Router,
      factoryCode: v2Factory,
      routerCode: v2Router,
    },
    v4: {
      available: v4Pm && v4PosM,
      poolManagerCode: v4Pm,
      note:
        v4Pm && v4PosM
          ? 'Uniswap V4 PoolManager & PositionManager verified live on-chain'
          : v4Pm
          ? 'Uniswap V4 PoolManager deployed'
          : 'Uniswap V4 PoolManager not deployed on this network',
    },
    tataswap: {
      available: tsFactory && tsRouter,
      factoryCode: tsFactory,
      routerCode: tsRouter,
      listingFeeCode: tsListing,
    },
  };
}

export interface PoolLookupResult {
  exists: boolean;
  poolAddress: string;
  protocolVersion: AmmProtocolVersion;
  sqrtPriceX96?: string;
  currentTick?: number;
  currentPrice?: string;
  liquidity?: string;
  reserve0?: string;
  reserve1?: string;
  token0?: string;
  token1?: string;
}

export async function checkPoolExists(
  client: PublicClient,
  network: NetworkConfig,
  protocol: AmmProtocolVersion,
  tokenA: string,
  tokenB: string,
  feeTier: number = 3000
): Promise<PoolLookupResult> {
  if (!isAddress(tokenA) || !isAddress(tokenB) || tokenA.toLowerCase() === tokenB.toLowerCase()) {
    return { exists: false, poolAddress: '', protocolVersion: protocol };
  }

  const { token0, token1 } = sortTokens(tokenA, tokenB);

  if (protocol === 'v3' && isAddress(network.uniswapV3Factory)) {
    const poolAddr = await client.readContract({
      address: network.uniswapV3Factory as Address,
      abi: UNISWAP_V3_FACTORY_ABI,
      functionName: 'getPool',
      args: [token0, token1, feeTier],
    });
    if (!poolAddr || poolAddr.toLowerCase() === ZERO_ADDRESS) {
      return { exists: false, poolAddress: '', protocolVersion: 'v3' };
    }

    const [slot0, liq, dec0, dec1] = await Promise.all([
      client.readContract({
        address: poolAddr,
        abi: UNISWAP_V3_POOL_ABI,
        functionName: 'slot0',
      }),
      client.readContract({
        address: poolAddr,
        abi: UNISWAP_V3_POOL_ABI,
        functionName: 'liquidity',
      }),
      client.readContract({
        address: token0,
        abi: ERC20_VIEM_ABI,
        functionName: 'decimals',
      }),
      client.readContract({
        address: token1,
        abi: ERC20_VIEM_ABI,
        functionName: 'decimals',
      }),
    ]);

    const sqrtPriceX96 = slot0[0];
    const currentTick = Number(slot0[1]);
    const price = decodeSqrtPriceX96ToPrice(sqrtPriceX96, Number(dec0), Number(dec1));

    return {
      exists: sqrtPriceX96 > 0n,
      poolAddress: poolAddr,
      protocolVersion: 'v3',
      sqrtPriceX96: sqrtPriceX96.toString(),
      currentTick,
      currentPrice: price.toPrecision(8),
      liquidity: liq.toString(),
      token0,
      token1,
    };
  }

  const factoryAddr =
    protocol === 'v2' ? network.uniswapV2Factory : network.factoryAddress;
  if ((protocol === 'v2' || protocol === 'tataswap') && isAddress(factoryAddr)) {
    const pairAddr = await client.readContract({
      address: factoryAddr as Address,
      abi: UNISWAP_V2_FACTORY_ABI,
      functionName: 'getPair',
      args: [token0, token1],
    });
    if (!pairAddr || pairAddr.toLowerCase() === ZERO_ADDRESS) {
      return { exists: false, poolAddress: '', protocolVersion: protocol };
    }

    const [reserves, t0, dec0, dec1] = await Promise.all([
      client.readContract({
        address: pairAddr,
        abi: UNISWAP_V2_PAIR_ABI,
        functionName: 'getReserves',
      }),
      client.readContract({
        address: pairAddr,
        abi: UNISWAP_V2_PAIR_ABI,
        functionName: 'token0',
      }),
      client.readContract({ address: token0, abi: ERC20_VIEM_ABI, functionName: 'decimals' }),
      client.readContract({ address: token1, abi: ERC20_VIEM_ABI, functionName: 'decimals' }),
    ]);

    const isT0 = t0.toLowerCase() === token0.toLowerCase();
    const r0 = formatUnits(isT0 ? reserves[0] : reserves[1], Number(dec0));
    const r1 = formatUnits(isT0 ? reserves[1] : reserves[0], Number(dec1));
    const p = Number(r0) > 0 ? (Number(r1) / Number(r0)).toPrecision(8) : '0';

    return {
      exists: true,
      poolAddress: pairAddr,
      protocolVersion: protocol,
      reserve0: r0,
      reserve1: r1,
      currentPrice: p,
      token0,
      token1,
    };
  }

  if (protocol === 'v4') {
    const v4 = getV4PeripheryContracts(network.chainId);
    if (!v4) {
      return { exists: false, poolAddress: '', protocolVersion: 'v4' };
    }
    const tickSpacing = getTickSpacingForFee(feeTier);
    const poolId = computeV4PoolId({
      currency0: token0,
      currency1: token1,
      fee: feeTier,
      tickSpacing,
      hooks: ZERO_ADDRESS,
    });
    try {
      const [slot0, liq, dec0, dec1] = await Promise.all([
        client.readContract({
          address: v4.stateView,
          abi: UNISWAP_V4_STATE_VIEW_ABI,
          functionName: 'getSlot0',
          args: [poolId],
        }),
        client.readContract({
          address: v4.stateView,
          abi: UNISWAP_V4_STATE_VIEW_ABI,
          functionName: 'getLiquidity',
          args: [poolId],
        }),
        token0.toLowerCase() === ZERO_ADDRESS
          ? Promise.resolve(18)
          : client.readContract({
              address: token0,
              abi: ERC20_VIEM_ABI,
              functionName: 'decimals',
            }),
        token1.toLowerCase() === ZERO_ADDRESS
          ? Promise.resolve(18)
          : client.readContract({
              address: token1,
              abi: ERC20_VIEM_ABI,
              functionName: 'decimals',
            }),
      ]);
      const sqrtPriceX96 = slot0[0];
      if (sqrtPriceX96 === 0n) {
        return { exists: false, poolAddress: '', protocolVersion: 'v4' };
      }
      const currentTick = Number(slot0[1]);
      const price = decodeSqrtPriceX96ToPrice(sqrtPriceX96, Number(dec0), Number(dec1));
      return {
        exists: true,
        poolAddress: poolId,
        protocolVersion: 'v4',
        sqrtPriceX96: sqrtPriceX96.toString(),
        currentTick,
        currentPrice: price.toPrecision(8),
        liquidity: liq.toString(),
        token0,
        token1,
      };
    } catch {
      return { exists: false, poolAddress: '', protocolVersion: 'v4' };
    }
  }

  return { exists: false, poolAddress: '', protocolVersion: protocol };
}

export interface SwapQuoteResult {
  protocolVersion: AmmProtocolVersion;
  feeTier: number;
  poolAddress: string;
  amountOutWei: bigint;
  amountOutFormatted: string;
  priceImpactPct: string;
  lpFeeAmount: string;
  gasEstimate: string;
}

export async function quoteSwapExactIn(params: {
  client: PublicClient;
  network: NetworkConfig;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  decimalsIn: number;
  decimalsOut: number;
  preferredProtocol?: AmmProtocolVersion;
  feeTier?: number;
}): Promise<SwapQuoteResult | null> {
  const {
    client,
    network,
    tokenIn,
    tokenOut,
    amountIn,
    decimalsIn,
    decimalsOut,
    preferredProtocol,
    feeTier = 3000,
  } = params;

  if (!amountIn || Number.parseFloat(amountIn) <= 0) return null;
  if (!isAddress(tokenIn) || !isAddress(tokenOut) || tokenIn.toLowerCase() === tokenOut.toLowerCase()) {
    return null;
  }

  const amountInWei = parseUnits(amountIn, decimalsIn);
  if (amountInWei <= 0n) return null;

  // Try Uniswap V3 QuoterV2 if selected or available
  if (
    (!preferredProtocol || preferredProtocol === 'v3') &&
    isAddress(network.uniswapV3Quoter) &&
    isAddress(network.uniswapV3Factory)
  ) {
    const candidateFees = preferredProtocol === 'v3' ? [feeTier] : [feeTier, 500, 3000, 10000, 100];
    const uniqueFees = Array.from(new Set(candidateFees));

    for (const f of uniqueFees) {
      try {
        const poolCheck = await checkPoolExists(client, network, 'v3', tokenIn, tokenOut, f);
        if (!poolCheck.exists || !poolCheck.poolAddress) continue;

        const sim = await client.simulateContract({
          address: network.uniswapV3Quoter as Address,
          abi: UNISWAP_V3_QUOTER_V2_ABI,
          functionName: 'quoteExactInputSingle',
          args: [
            {
              tokenIn: tokenIn as Address,
              tokenOut: tokenOut as Address,
              amountIn: amountInWei,
              fee: f,
              sqrtPriceLimitX96: 0n,
            },
          ],
        });

        const [outWei, sqrtAfter, , gasEst] = sim.result;
        const outFormatted = formatUnits(outWei, decimalsOut);

        // Compute price impact from sqrtPriceX96 before vs after
        let impactPct = '0.01';
        if (poolCheck.sqrtPriceX96 && BigInt(poolCheck.sqrtPriceX96) > 0n && sqrtAfter > 0n) {
          const before = Number(BigInt(poolCheck.sqrtPriceX96) / 1_000_000n);
          const after = Number(sqrtAfter / 1_000_000n);
          if (before > 0) {
            const pBefore = before * before;
            const pAfter = after * after;
            impactPct = Math.min(99.9, Math.abs(((pAfter - pBefore) / pBefore) * 100)).toFixed(2);
          }
        }

        const feeAmt = (Number.parseFloat(amountIn) * (f / 1_000_000)).toFixed(6);
        return {
          protocolVersion: 'v3',
          feeTier: f,
          poolAddress: poolCheck.poolAddress,
          amountOutWei: outWei,
          amountOutFormatted: outFormatted,
          priceImpactPct: impactPct,
          lpFeeAmount: feeAmt,
          gasEstimate: gasEst.toString(),
        };
      } catch {
        // Try next fee tier
      }
    }
  }

  // Fallback or explicit V2 / TataSwap Router quote
  const routersToTry: { version: AmmProtocolVersion; factory: string; router: string; feeBps: number }[] = [];
  if ((!preferredProtocol || preferredProtocol === 'v2') && isAddress(network.uniswapV2Router) && isAddress(network.uniswapV2Factory)) {
    routersToTry.push({
      version: 'v2',
      factory: network.uniswapV2Factory,
      router: network.uniswapV2Router,
      feeBps: 30,
    });
  }
  if ((!preferredProtocol || preferredProtocol === 'tataswap') && isAddress(network.routerAddress) && isAddress(network.factoryAddress)) {
    routersToTry.push({
      version: 'tataswap',
      factory: network.factoryAddress,
      router: network.routerAddress,
      feeBps: network.swapFeeBps || 30,
    });
  }

  for (const r of routersToTry) {
    try {
      const pairAddr = await client.readContract({
        address: r.factory as Address,
        abi: UNISWAP_V2_FACTORY_ABI,
        functionName: 'getPair',
        args: [tokenIn as Address, tokenOut as Address],
      });
      if (!pairAddr || pairAddr.toLowerCase() === ZERO_ADDRESS) continue;

      const [amounts, reserves, t0] = await Promise.all([
        client.readContract({
          address: r.router as Address,
          abi: UNISWAP_V2_ROUTER_ABI,
          functionName: 'getAmountsOut',
          args: [amountInWei, [tokenIn as Address, tokenOut as Address]],
        }),
        client.readContract({
          address: pairAddr,
          abi: UNISWAP_V2_PAIR_ABI,
          functionName: 'getReserves',
        }),
        client.readContract({
          address: pairAddr,
          abi: UNISWAP_V2_PAIR_ABI,
          functionName: 'token0',
        }),
      ]);

      const outWei = amounts[amounts.length - 1];
      const outFormatted = formatUnits(outWei, decimalsOut);
      const isIn0 = tokenIn.toLowerCase() === t0.toLowerCase();
      const rInNum = Number.parseFloat(formatUnits(isIn0 ? reserves[0] : reserves[1], decimalsIn));
      const inNum = Number.parseFloat(amountIn);
      const impact = rInNum > 0 ? ((inNum / (rInNum + inNum)) * 100).toFixed(2) : '0.00';
      const feeAmt = ((inNum * r.feeBps) / 10000).toFixed(6);

      return {
        protocolVersion: r.version,
        feeTier: r.feeBps * 100,
        poolAddress: pairAddr,
        amountOutWei: outWei,
        amountOutFormatted: outFormatted,
        priceImpactPct: impact,
        lpFeeAmount: feeAmt,
        gasEstimate: '145000',
      };
    } catch {
      // Try next router
    }
  }

  return null;
}

/**
 * Fetches all real on-chain Uniswap V3 NFT positions for an owner via NonfungiblePositionManager.
 */
export async function fetchUserV3PositionsOnChain(
  client: PublicClient,
  network: NetworkConfig,
  owner: string
): Promise<LiquidityPositionRecord[]> {
  if (!isAddress(owner) || !isAddress(network.uniswapV3PositionManager)) return [];
  const npm = network.uniswapV3PositionManager as Address;
  const factory = network.uniswapV3Factory as Address;

  try {
    const countBig = await client.readContract({
      address: npm,
      abi: UNISWAP_V3_NPM_ABI,
      functionName: 'balanceOf',
      args: [owner as Address],
    });
    const count = Math.min(Number(countBig), 25);
    if (count === 0) return [];

    const positions: LiquidityPositionRecord[] = [];
    for (let i = 0; i < count; i++) {
      try {
        const tokenId = await client.readContract({
          address: npm,
          abi: UNISWAP_V3_NPM_ABI,
          functionName: 'tokenOfOwnerByIndex',
          args: [owner as Address, BigInt(i)],
        });
        const pos = await client.readContract({
          address: npm,
          abi: UNISWAP_V3_NPM_ABI,
          functionName: 'positions',
          args: [tokenId],
        });

        const token0 = pos[2];
        const token1 = pos[3];
        const fee = Number(pos[4]);
        const tickLower = Number(pos[5]);
        const tickUpper = Number(pos[6]);
        const liquidity = pos[7];
        const tokensOwed0 = pos[10];
        const tokensOwed1 = pos[11];

        const [sym0, dec0Raw, sym1, dec1Raw, poolAddr] = await Promise.all([
          client.readContract({ address: token0, abi: ERC20_VIEM_ABI, functionName: 'symbol' }),
          client.readContract({ address: token0, abi: ERC20_VIEM_ABI, functionName: 'decimals' }),
          client.readContract({ address: token1, abi: ERC20_VIEM_ABI, functionName: 'symbol' }),
          client.readContract({ address: token1, abi: ERC20_VIEM_ABI, functionName: 'decimals' }),
          isAddress(factory)
            ? client.readContract({
                address: factory,
                abi: UNISWAP_V3_FACTORY_ABI,
                functionName: 'getPool',
                args: [token0, token1, fee],
              })
            : Promise.resolve(ZERO_ADDRESS),
        ]);

        const dec0 = Number(dec0Raw);
        const dec1 = Number(dec1Raw);

        let sqrtPriceX96 = 0n;
        let poolLiq = 0n;
        if (poolAddr && poolAddr !== ZERO_ADDRESS) {
          try {
            const [s0, pl] = await Promise.all([
              client.readContract({
                address: poolAddr,
                abi: UNISWAP_V3_POOL_ABI,
                functionName: 'slot0',
              }),
              client.readContract({
                address: poolAddr,
                abi: UNISWAP_V3_POOL_ABI,
                functionName: 'liquidity',
              }),
            ]);
            sqrtPriceX96 = s0[0];
            poolLiq = pl;
          } catch {
            // Non-fatal
          }
        }

        // Static simulate collect to get accurate uncollected fees including feeGrowthInside delta
        let uncollected0 = tokensOwed0;
        let uncollected1 = tokensOwed1;
        try {
          const simCollect = await client.simulateContract({
            address: npm,
            abi: UNISWAP_V3_NPM_ABI,
            functionName: 'collect',
            account: owner as Address,
            args: [
              {
                tokenId,
                recipient: owner as Address,
                amount0Max: MAX_UINT128,
                amount1Max: MAX_UINT128,
              },
            ],
          });
          uncollected0 = simCollect.result[0];
          uncollected1 = simCollect.result[1];
        } catch {
          // Use tokensOwed fallback if collect simulation reverts
        }

        const amounts = estimateV3AmountsFromLiquidity({
          liquidity,
          sqrtPriceX96,
          tickLower,
          tickUpper,
          decimals0: dec0,
          decimals1: dec1,
        });

        const sharePct =
          poolLiq > 0n
            ? ((Number(liquidity) / Number(poolLiq)) * 100).toFixed(4)
            : '0.0000';

        positions.push({
          chainId: network.chainId,
          ownerWallet: owner.toLowerCase(),
          poolAddress: poolAddr.toLowerCase(),
          protocolVersion: 'v3',
          tokenId: tokenId.toString(),
          token0Address: token0.toLowerCase(),
          token1Address: token1.toLowerCase(),
          token0Symbol: String(sym0),
          token1Symbol: String(sym1),
          token0Decimals: dec0,
          token1Decimals: dec1,
          feeTierBps: Math.round(fee / 100),
          tickLower,
          tickUpper,
          liquidityAmount: liquidity.toString(),
          amount0Deposited: amounts.amount0,
          amount1Deposited: amounts.amount1,
          feesEarned0: formatUnits(uncollected0, dec0),
          feesEarned1: formatUnits(uncollected1, dec1),
          poolSharePct: sharePct,
          txHash: '',
          status: liquidity > 0n || uncollected0 > 0n || uncollected1 > 0n ? 'active' : 'closed',
        });
      } catch {
        // Skip unreadable NFT
      }
    }
    return positions;
  } catch {
    return [];
  }
}
