import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Layers,
  Minus,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { Contract, formatUnits, isAddress, parseUnits } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { ContractStatusNotice } from '../components/ContractStatusNotice';
import { ERC20_ABI, FACTORY_ABI, ROUTER_ABI } from '../lib/abis';
import {
  UNISWAP_V3_FACTORY_ABI,
  UNISWAP_V3_NPM_ABI,
  UNISWAP_V4_POSITION_MANAGER_ABI,
} from '../lib/uniswap/abis';
import {
  ZERO_ADDRESS,
  checkPoolExists,
  computeV4PoolId,
  encodeSqrtPriceX96,
  estimateV3PairedAmount,
  fullRangeTicks,
  getV4PeripheryContracts,
  nearestUsableTick,
  priceToTick,
  sortTokens,
} from '../lib/uniswap/adapters';
import type { IndexedPool, IndexedToken, PageRoute } from '../types/dex';

interface TokenChoice {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  isNative: boolean;
}

interface FeeTierCard {
  id: string;
  label: string;
  bps: number;
  v3Fee: number;
  tickSpacing: number;
  description: string;
}

const FEE_TIERS: FeeTierCard[] = [
  {
    id: '0.0075',
    label: '0.0075%',
    bps: 1,
    v3Fee: 100,
    tickSpacing: 1,
    description: 'Commonly used for very stable pairs.',
  },
  {
    id: '0.0375',
    label: '0.0375%',
    bps: 4,
    v3Fee: 500,
    tickSpacing: 10,
    description: 'Commonly used for stable pairs.',
  },
  {
    id: '0.25',
    label: '0.25%',
    bps: 25,
    v3Fee: 2500,
    tickSpacing: 50,
    description: 'Commonly used for most pairs.',
  },
  {
    id: '0.9',
    label: '0.9%',
    bps: 90,
    v3Fee: 10000,
    tickSpacing: 200,
    description: 'Commonly used for exotic pairs.',
  },
];

const EXTRA_SEARCH_TIERS: FeeTierCard[] = [
  {
    id: '0.01',
    label: '0.01%',
    bps: 1,
    v3Fee: 100,
    tickSpacing: 1,
    description: 'Standard ultra-stable tier (1 bps).',
  },
  {
    id: '0.05',
    label: '0.05%',
    bps: 5,
    v3Fee: 500,
    tickSpacing: 10,
    description: 'Standard stable pair tier (5 bps).',
  },
  {
    id: '0.30',
    label: '0.30%',
    bps: 30,
    v3Fee: 3000,
    tickSpacing: 60,
    description: 'Standard volatile pair tier (30 bps).',
  },
  {
    id: '1.00',
    label: '1.00%',
    bps: 100,
    v3Fee: 10000,
    tickSpacing: 200,
    description: 'Standard exotic pair tier (100 bps).',
  },
];

function formatCompactBalance(raw: string): string {
  const num = Number.parseFloat(raw || '0');
  if (!Number.isFinite(num) || num <= 0) return '0';
  if (num >= 1000) {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
    }).format(num);
  }
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 5,
  }).format(num);
}

export function CreatePoolPage({ onNavigate }: { onNavigate: (page: PageRoute) => void }) {
  const {
    account,
    nativeBalance,
    selectedChainId,
    networks,
    activeNetwork,
    switchNetwork,
    getBrowserProvider,
    getReadProvider,
    getViemClient,
    setWalletModalOpen,
  } = useWallet();

  // Indexed tokens & pools
  const [tokens, setTokens] = useState<IndexedToken[]>([]);
  const [pools, setPools] = useState<IndexedPool[]>([]);

  // Step state (Step 1 of 2 / Step 2 of 2)
  const [step, setStep] = useState<1 | 2>(1);

  // Pair selection (Token 1 defaults to native gas token; Token 2 starts unselected -> "Choose token")
  const [tokenAChoice, setTokenAChoice] = useState<TokenChoice | null>(null);
  const [tokenBChoice, setTokenBChoice] = useState<TokenChoice | null>(null);
  const [pickerTarget, setPickerTarget] = useState<'A' | 'B' | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCustomToken, setPickerCustomToken] = useState<TokenChoice | null>(null);
  const [pickerCustomLoading, setPickerCustomLoading] = useState(false);
  const [pickerCustomError, setPickerCustomError] = useState<string | null>(null);
  const [tokenBalancesMap, setTokenBalancesMap] = useState<Record<string, string>>({});
  const [balanceA, setBalanceA] = useState('0');
  const [balanceB, setBalanceB] = useState('0');

  // Optional Hook state
  const [showHookPanel, setShowHookPanel] = useState(false);
  const [hookInput, setHookInput] = useState('');
  const [hookAddress, setHookAddress] = useState('');
  const [hookVerified, setHookVerified] = useState<'none' | 'verified' | 'unverified'>('none');
  const [hookChecking, setHookChecking] = useState(false);

  // Fee tier UI state
  const [feeExpanded, setFeeExpanded] = useState(true);
  const [selectedFeeId, setSelectedFeeId] = useState<string>('0.25');
  const [showAdvancedFee, setShowAdvancedFee] = useState(false);
  const [customFeeQuery, setCustomFeeQuery] = useState('');
  const [customTier, setCustomTier] = useState<FeeTierCard | null>(null);
  const [tierCreatedMap, setTierCreatedMap] = useState<Record<string, boolean>>({});
  const [existingPoolAddr, setExistingPoolAddr] = useState('');
  const [existingPoolPrice, setExistingPoolPrice] = useState('');

  // Step 2: Initial price, range & deposit amounts
  const [priceInverted, setPriceInverted] = useState(false);
  const [initialPrice, setInitialPrice] = useState('');
  const [rangeMode, setRangeMode] = useState<'full' | 'custom'>('custom');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');

  // Execution feedback
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const activeFactoryAddress =
    activeNetwork?.factoryAddress || activeNetwork?.uniswapV2Factory || '';
  const activeRouterAddress =
    activeNetwork?.routerAddress || activeNetwork?.uniswapV2Router || '';
  const v4Periphery = useMemo(
    () => getV4PeripheryContracts(selectedChainId),
    [selectedChainId]
  );

  const nativeChoice: TokenChoice | null = useMemo(() => {
    if (!activeNetwork?.wrappedNativeAddress) return null;
    return {
      address: activeNetwork.wrappedNativeAddress,
      symbol: activeNetwork.nativeSymbol || 'ETH',
      name: `${activeNetwork.nativeSymbol || 'Native'} (Native Gas Token)`,
      decimals: 18,
      isNative: true,
    };
  }, [activeNetwork]);

  const tokenOptions: TokenChoice[] = useMemo(() => {
    const list: TokenChoice[] = [];
    if (nativeChoice) list.push(nativeChoice);
    for (const t of tokens) {
      list.push({
        address: t.address,
        symbol: t.symbol,
        name: t.name,
        decimals: t.decimals,
        isNative: false,
      });
    }
    return list;
  }, [nativeChoice, tokens]);

  const activeFeeTier: FeeTierCard = useMemo(() => {
    if (customTier && selectedFeeId === customTier.id) return customTier;
    return (
      FEE_TIERS.find((f) => f.id === selectedFeeId) ||
      EXTRA_SEARCH_TIERS.find((f) => f.id === selectedFeeId) ||
      FEE_TIERS[2]
    );
  }, [selectedFeeId, customTier]);

  const loadData = useCallback(async () => {
    try {
      const [tRes, pRes] = await Promise.all([
        fetch(`/api/tokens?chainId=${selectedChainId}`),
        fetch(`/api/pools?chainId=${selectedChainId}`),
      ]);
      if (tRes.ok) {
        const list: IndexedToken[] = (await tRes.json()).tokens || [];
        setTokens(list);
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        setPools(pData.pools || []);
      }
    } catch (err) {
      console.error('Failed to load pools:', err);
    }
  }, [selectedChainId]);

  useEffect(() => {
    setStep(1);
    setTokenAChoice(null);
    setTokenBChoice(null);
    setHookAddress('');
    setHookInput('');
    setHookVerified('none');
    setExistingPoolAddr('');
    setExistingPoolPrice('');
    setInitialPrice('');
    setAmountA('');
    setAmountB('');
    setMinPrice('');
    setMaxPrice('');
    setError(null);
    setStatus(null);
    setTxHash(null);
    loadData();
  }, [selectedChainId, loadData]);

  // Default Token 1 to Native gas token (matches PDF Page 2 showing ETH / Choose token)
  useEffect(() => {
    if (!tokenAChoice && nativeChoice) {
      setTokenAChoice(nativeChoice);
    }
  }, [nativeChoice, tokenAChoice]);

  // Refresh balances for selected Token 1, Token 2 & Token Picker list
  const refreshBalances = useCallback(async () => {
    if (!account) {
      setBalanceA('0');
      setBalanceB('0');
      setTokenBalancesMap({});
      return;
    }
    const provider = getReadProvider(selectedChainId);
    const balMap: Record<string, string> = {};

    if (nativeChoice) {
      balMap[`native:${nativeChoice.address.toLowerCase()}`] = nativeBalance || '0';
    }

    if (provider) {
      await Promise.all(
        tokens.map(async (tok) => {
          try {
            const c = new Contract(tok.address, ERC20_ABI, provider);
            const raw = await c.balanceOf(account);
            balMap[`erc20:${tok.address.toLowerCase()}`] = formatUnits(raw, tok.decimals);
          } catch {
            balMap[`erc20:${tok.address.toLowerCase()}`] = '0';
          }
        })
      );
    }
    setTokenBalancesMap(balMap);

    if (tokenAChoice) {
      if (tokenAChoice.isNative) {
        setBalanceA(nativeBalance || '0');
      } else if (provider && isAddress(tokenAChoice.address)) {
        try {
          const c = new Contract(tokenAChoice.address, ERC20_ABI, provider);
          const raw = await c.balanceOf(account);
          setBalanceA(formatUnits(raw, tokenAChoice.decimals));
        } catch {
          setBalanceA('0');
        }
      }
    } else {
      setBalanceA('0');
    }

    if (tokenBChoice) {
      if (tokenBChoice.isNative) {
        setBalanceB(nativeBalance || '0');
      } else if (provider && isAddress(tokenBChoice.address)) {
        try {
          const c = new Contract(tokenBChoice.address, ERC20_ABI, provider);
          const raw = await c.balanceOf(account);
          setBalanceB(formatUnits(raw, tokenBChoice.decimals));
        } catch {
          setBalanceB('0');
        }
      }
    } else {
      setBalanceB('0');
    }
  }, [
    account,
    nativeBalance,
    nativeChoice,
    tokens,
    selectedChainId,
    tokenAChoice,
    tokenBChoice,
    getReadProvider,
  ]);

  useEffect(() => {
    refreshBalances();
  }, [refreshBalances]);

  // Live contract lookup when user pastes an address in the Token Picker search box
  useEffect(() => {
    let cancelled = false;
    async function lookupCustomInPicker() {
      setPickerCustomToken(null);
      setPickerCustomError(null);
      const q = pickerSearch.trim();
      if (!isAddress(q)) return;

      const existing = tokens.find((t) => t.address.toLowerCase() === q.toLowerCase());
      if (existing) return;

      const provider = getReadProvider(selectedChainId);
      if (!provider) return;

      setPickerCustomLoading(true);
      try {
        const c = new Contract(q, ERC20_ABI, provider);
        const [symbol, name, decimals] = await Promise.all([
          c.symbol(),
          c.name(),
          c.decimals(),
        ]);
        if (!cancelled) {
          setPickerCustomToken({
            address: q,
            symbol: String(symbol),
            name: String(name),
            decimals: Number(decimals),
            isNative: false,
          });
        }
      } catch {
        if (!cancelled) {
          setPickerCustomError(
            `No valid ERC-20 / BEP-20 contract found on ${activeNetwork?.shortName || 'this network'}.`
          );
        }
      } finally {
        if (!cancelled) setPickerCustomLoading(false);
      }
    }
    lookupCustomInPicker();
    return () => {
      cancelled = true;
    };
  }, [pickerSearch, tokens, selectedChainId, activeNetwork, getReadProvider]);

  // Check on-chain existence across fee tiers & V2/TataSwap/V3/V4 factories
  useEffect(() => {
    let cancelled = false;
    async function inspectPoolsOnChain() {
      setTierCreatedMap({});
      setExistingPoolAddr('');
      setExistingPoolPrice('');

      if (
        !tokenAChoice ||
        !tokenBChoice ||
        tokenAChoice.address.toLowerCase() === tokenBChoice.address.toLowerCase()
      ) {
        return;
      }

      const client = getViemClient(selectedChainId);
      const provider = getReadProvider(selectedChainId);
      const createdMap: Record<string, boolean> = {};

      if (activeFactoryAddress && provider) {
        try {
          const factory = new Contract(activeFactoryAddress, FACTORY_ABI, provider);
          const pair: string = await factory.getPair(tokenAChoice.address, tokenBChoice.address);
          if (pair && pair !== ZERO_ADDRESS) {
            createdMap[activeFeeTier.id] = true;
            if (!cancelled) setExistingPoolAddr(pair);
          }
        } catch {
          // Ignore pair check failure
        }
      }

      if (client && activeNetwork && isAddress(activeNetwork.uniswapV3Factory)) {
        for (const tier of FEE_TIERS) {
          try {
            const lookup = await checkPoolExists(
              client,
              activeNetwork,
              'v3',
              tokenAChoice.address,
              tokenBChoice.address,
              tier.v3Fee
            );
            if (lookup.exists) {
              createdMap[tier.id] = true;
              if (tier.id === activeFeeTier.id && !cancelled) {
                setExistingPoolAddr(lookup.poolAddress);
                if (lookup.currentPrice) setExistingPoolPrice(lookup.currentPrice);
              }
            }
          } catch {
            // Ignore tier check failure
          }
        }
      }

      if (client && activeNetwork && hookAddress && isAddress(hookAddress) && v4Periphery) {
        try {
          const lookup = await checkPoolExists(
            client,
            activeNetwork,
            'v4',
            tokenAChoice.address,
            tokenBChoice.address,
            activeFeeTier.v3Fee
          );
          if (lookup.exists) {
            createdMap[activeFeeTier.id] = true;
            if (!cancelled) {
              setExistingPoolAddr(lookup.poolAddress);
              if (lookup.currentPrice) setExistingPoolPrice(lookup.currentPrice);
            }
          }
        } catch {
          // Ignore
        }
      }

      if (!cancelled) {
        setTierCreatedMap(createdMap);
      }
    }
    inspectPoolsOnChain();
    return () => {
      cancelled = true;
    };
  }, [
    tokenAChoice,
    tokenBChoice,
    activeNetwork,
    activeFactoryAddress,
    activeFeeTier.id,
    activeFeeTier.v3Fee,
    hookAddress,
    v4Periphery,
    selectedChainId,
    getViemClient,
    getReadProvider,
  ]);

  const handleSelectTokenFromPicker = (choice: TokenChoice) => {
    setError(null);
    if (pickerTarget === 'A') {
      if (tokenBChoice && tokenBChoice.address.toLowerCase() === choice.address.toLowerCase()) {
        setTokenBChoice(tokenAChoice);
      }
      setTokenAChoice(choice);
    } else if (pickerTarget === 'B') {
      if (tokenAChoice && tokenAChoice.address.toLowerCase() === choice.address.toLowerCase()) {
        setTokenAChoice(tokenBChoice);
      }
      setTokenBChoice(choice);
    }
    setPickerTarget(null);
    setPickerSearch('');
    setPickerCustomToken(null);
    setPickerCustomError(null);
  };

  const handleVerifyAndSetHook = async () => {
    setError(null);
    const trimmed = hookInput.trim();
    if (!trimmed || trimmed === ZERO_ADDRESS) {
      setHookAddress('');
      setHookVerified('none');
      setShowHookPanel(false);
      return;
    }
    if (!isAddress(trimmed)) {
      setError('Enter a valid 0x hook contract address.');
      return;
    }
    const provider = getReadProvider(selectedChainId);
    setHookChecking(true);
    try {
      const code = provider ? await provider.getCode(trimmed) : '0x';
      const hasCode = Boolean(code && code !== '0x');
      setHookAddress(trimmed);
      setHookVerified(hasCode ? 'verified' : 'unverified');
      if (!hasCode) {
        setError(
          `No deployed contract bytecode found at ${trimmed.slice(0, 10)}... on ${activeNetwork?.shortName}.`
        );
      }
    } catch {
      setHookAddress(trimmed);
      setHookVerified('unverified');
    } finally {
      setHookChecking(false);
    }
  };

  const handleApplyCustomFeeTier = (pctStr?: string) => {
    const num = Number.parseFloat(pctStr ?? customFeeQuery);
    if (!Number.isFinite(num) || num <= 0 || num > 10) {
      setError('Enter a custom fee tier between 0.001% and 10%.');
      return;
    }
    const v3Fee = Math.round(num * 10000);
    const created: FeeTierCard = {
      id: `custom-${num}`,
      label: `${num}%`,
      bps: Math.max(1, Math.round(num * 100)),
      v3Fee,
      tickSpacing: num <= 0.02 ? 1 : num <= 0.1 ? 10 : num <= 0.5 ? 60 : 200,
      description: 'Custom fee tier configuration.',
    };
    setCustomTier(created);
    setSelectedFeeId(created.id);
    setShowAdvancedFee(false);
    setError(null);
  };

  // Price & Ratio Calculations
  const baseToken = priceInverted ? tokenBChoice : tokenAChoice;
  const quoteToken = priceInverted ? tokenAChoice : tokenBChoice;

  // Price expressed as TokenB per 1 TokenA
  const priceBPerA = useMemo(() => {
    const p = Number.parseFloat(initialPrice || existingPoolPrice || '0');
    if (!Number.isFinite(p) || p <= 0) return 0;
    return priceInverted ? 1 / p : p;
  }, [initialPrice, existingPoolPrice, priceInverted]);

  const syncDefaultRangeFromPrice = (displayPrice: number) => {
    if (!Number.isFinite(displayPrice) || displayPrice <= 0) return;
    setMinPrice((displayPrice * 0.5).toPrecision(5));
    setMaxPrice((displayPrice * 2.0).toPrecision(5));
  };

  const handleInitialPriceChange = (val: string) => {
    setInitialPrice(val);
    const num = Number.parseFloat(val);
    if (Number.isFinite(num) && num > 0) {
      if (!minPrice && !maxPrice) {
        syncDefaultRangeFromPrice(num);
      }
      const bPerA = priceInverted ? 1 / num : num;
      const aNum = Number.parseFloat(amountA);
      if (Number.isFinite(aNum) && aNum > 0) {
        setAmountB((aNum * bPerA).toFixed(6));
      }
    }
  };

  const computePairedAmount = (inputVal: string, isSideA: boolean): string => {
    const val = Number.parseFloat(inputVal);
    if (!Number.isFinite(val) || val <= 0 || priceBPerA <= 0) return '';
    if (rangeMode === 'custom' && tokenAChoice && tokenBChoice) {
      const pMinDisplay = Number.parseFloat(minPrice);
      const pMaxDisplay = Number.parseFloat(maxPrice);
      if (
        Number.isFinite(pMinDisplay) &&
        Number.isFinite(pMaxDisplay) &&
        pMinDisplay > 0 &&
        pMaxDisplay > pMinDisplay
      ) {
        const minBPerA = priceInverted ? 1 / pMaxDisplay : pMinDisplay;
        const maxBPerA = priceInverted ? 1 / pMinDisplay : pMaxDisplay;
        const tickLower = priceToTick(minBPerA, tokenAChoice.decimals, tokenBChoice.decimals);
        const tickUpper = priceToTick(maxBPerA, tokenAChoice.decimals, tokenBChoice.decimals);
        const est = estimateV3PairedAmount({
          amountInput: val,
          isInputToken0: isSideA,
          currentPrice1Per0: priceBPerA,
          tickLower,
          tickUpper,
          decimals0: tokenAChoice.decimals,
          decimals1: tokenBChoice.decimals,
        });
        return est > 0 ? est.toFixed(6) : '0';
      }
    }
    return isSideA ? (val * priceBPerA).toFixed(6) : (val / priceBPerA).toFixed(6);
  };

  const handleAmountAChange = (val: string) => {
    setAmountA(val);
    const paired = computePairedAmount(val, true);
    if (paired !== '') setAmountB(paired);
  };

  const handleAmountBChange = (val: string) => {
    setAmountB(val);
    const paired = computePairedAmount(val, false);
    if (paired !== '') setAmountA(paired);
  };

  const applyBalancePct = (side: 'A' | 'B', pct: number) => {
    const rawBal = Number.parseFloat(side === 'A' ? balanceA : balanceB);
    if (!Number.isFinite(rawBal) || rawBal <= 0) return;
    const isNative = side === 'A' ? tokenAChoice?.isNative : tokenBChoice?.isNative;
    const effective =
      pct === 100 && isNative ? Math.max(0, rawBal - 0.005) : (rawBal * pct) / 100;
    const formatted = effective > 0 ? Number(effective.toFixed(6)).toString() : '0';
    if (side === 'A') handleAmountAChange(formatted);
    else handleAmountBChange(formatted);
  };

  const handleStepMinMax = (which: 'min' | 'max', deltaPct: number) => {
    const curr = Number.parseFloat(which === 'min' ? minPrice : maxPrice);
    const base = Number.isFinite(curr) && curr > 0 ? curr : Number.parseFloat(initialPrice) || 1;
    const next = Math.max(0.000001, base * (1 + deltaPct));
    if (which === 'min') setMinPrice(next.toPrecision(5));
    else setMaxPrice(next.toPrecision(5));
  };

  const handleContinueStep1 = () => {
    setError(null);
    if (!tokenAChoice || !tokenBChoice) {
      setError('Choose both tokens for the liquidity pair first.');
      return;
    }
    if (tokenAChoice.address.toLowerCase() === tokenBChoice.address.toLowerCase()) {
      setError('Select two distinct tokens.');
      return;
    }
    if (existingPoolPrice && !initialPrice) {
      setInitialPrice(existingPoolPrice);
    }
    setStep(2);
  };

  const handleExecuteCreateAndDeposit = async () => {
    setError(null);
    setStatus(null);
    setTxHash(null);

    if (!account) {
      setWalletModalOpen(true);
      return;
    }
    if (!tokenAChoice || !tokenBChoice) {
      setError('Select both tokens first.');
      return;
    }
    if (priceBPerA <= 0 && !existingPoolAddr) {
      setError('Set an initial price greater than 0.');
      return;
    }
    const amtANum = Number.parseFloat(amountA || '0');
    const amtBNum = Number.parseFloat(amountB || '0');
    if (amtANum <= 0 && amtBNum <= 0) {
      setError('Enter token deposit amounts.');
      return;
    }

    const browserProvider = getBrowserProvider();
    if (!browserProvider) {
      setError('Connect MetaMask or Trust Wallet first.');
      return;
    }

    setSubmitting(true);
    try {
      const signer = await browserProvider.getSigner();
      const deadline = Math.floor(Date.now() / 1000) + 1200;

      // Path A: Hooked V4 Pool Initialization when user explicitly configured an on-chain hook
      if (hookAddress && isAddress(hookAddress) && hookAddress !== ZERO_ADDRESS) {
        if (!v4Periphery) {
          throw new Error(
            `Custom hooks require PoolManager support, which is not deployed on ${activeNetwork?.name || 'this network'}. Clear the optional hook or switch to Ethereum, BSC, Polygon, Base, or Arbitrum.`
          );
        }

        const c0Addr = tokenAChoice.isNative ? ZERO_ADDRESS : tokenAChoice.address;
        const c1Addr = tokenBChoice.isNative ? ZERO_ADDRESS : tokenBChoice.address;
        const { token0, token1, reversed } = sortTokens(c0Addr, c1Addr);
        const choice0 = reversed ? tokenBChoice : tokenAChoice;
        const choice1 = reversed ? tokenAChoice : tokenBChoice;
        const price1Per0 = reversed ? 1 / priceBPerA : priceBPerA;
        const sqrtPriceX96 = encodeSqrtPriceX96(
          price1Per0,
          choice0.decimals,
          choice1.decimals
        );

        const v4Pm = new Contract(
          v4Periphery.positionManager,
          UNISWAP_V4_POSITION_MANAGER_ABI,
          signer
        );
        const poolKey = {
          currency0: token0,
          currency1: token1,
          fee: activeFeeTier.v3Fee,
          tickSpacing: activeFeeTier.tickSpacing,
          hooks: hookAddress,
        };

        setStatus('Initializing hooked liquidity pool on-chain...');
        const initTx = await v4Pm.initializePool(poolKey, sqrtPriceX96);
        const receipt = await initTx.wait();
        const poolId = computeV4PoolId({
          currency0: token0,
          currency1: token1,
          fee: activeFeeTier.v3Fee,
          tickSpacing: activeFeeTier.tickSpacing,
          hooks: hookAddress as `0x${string}`,
        });
        setTxHash(receipt.hash);
        setExistingPoolAddr(poolId);

        await fetch('/api/pools/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chainId: selectedChainId,
            pairAddress: poolId,
            creatorWallet: account,
            creationTxHash: receipt.hash,
            protocolVersion: 'v4',
            feeTierBps: activeFeeTier.bps,
          }),
        });

        await fetch('/api/transactions/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chainId: selectedChainId,
            txHash: receipt.hash,
            txType: 'create_pool',
            walletAddress: account,
            tokenInAddress: choice0.address,
            tokenOutAddress: choice1.address,
            amountIn: amountA || '0',
            amountOut: amountB || '0',
            pairAddress: poolId,
          }),
        });

        setStatus(`Hooked pool initialized on-chain (${poolId.slice(0, 12)}...).`);
        await loadData();
        return;
      }

      // Path B: TataSwap Native AMM or V2 Factory + Router
      if (activeFactoryAddress && activeRouterAddress) {
        const factory = new Contract(activeFactoryAddress, FACTORY_ABI, signer);
        const router = new Contract(activeRouterAddress, ROUTER_ABI, signer);

        let pairAddr: string = await factory.getPair(
          tokenAChoice.address,
          tokenBChoice.address
        );
        if (!pairAddr || pairAddr === ZERO_ADDRESS) {
          setStatus('Step 1/3: Confirm pool pair deployment in your wallet...');
          const createTx = await factory.createPair(
            tokenAChoice.address,
            tokenBChoice.address
          );
          await createTx.wait();
          pairAddr = await factory.getPair(tokenAChoice.address, tokenBChoice.address);
        }

        const rawA = parseUnits(amountA || '0', tokenAChoice.decimals);
        const rawB = parseUnits(amountB || '0', tokenBChoice.decimals);
        const minA = (rawA * 95n) / 100n;
        const minB = (rawB * 95n) / 100n;

        if (!tokenAChoice.isNative && rawA > 0n) {
          const cA = new Contract(tokenAChoice.address, ERC20_ABI, signer);
          const allowA: bigint = await cA.allowance(account, activeRouterAddress);
          if (allowA < rawA) {
            setStatus(`Step 2/3: Approving ${tokenAChoice.symbol}...`);
            const tx = await cA.approve(activeRouterAddress, rawA);
            await tx.wait();
          }
        }
        if (!tokenBChoice.isNative && rawB > 0n) {
          const cB = new Contract(tokenBChoice.address, ERC20_ABI, signer);
          const allowB: bigint = await cB.allowance(account, activeRouterAddress);
          if (allowB < rawB) {
            setStatus(`Step 2/3: Approving ${tokenBChoice.symbol}...`);
            const tx = await cB.approve(activeRouterAddress, rawB);
            await tx.wait();
          }
        }

        setStatus('Step 3/3: Confirm initial liquidity deposit in your wallet...');
        let liqTx;
        if (tokenAChoice.isNative) {
          liqTx = await router.addLiquidityETH(
            tokenBChoice.address,
            rawB,
            minB,
            minA,
            account,
            deadline,
            { value: rawA }
          );
        } else if (tokenBChoice.isNative) {
          liqTx = await router.addLiquidityETH(
            tokenAChoice.address,
            rawA,
            minA,
            minB,
            account,
            deadline,
            { value: rawB }
          );
        } else {
          liqTx = await router.addLiquidity(
            tokenAChoice.address,
            tokenBChoice.address,
            rawA,
            rawB,
            minA,
            minB,
            account,
            deadline
          );
        }

        const receipt = await liqTx.wait();
        setTxHash(receipt.hash);
        setExistingPoolAddr(pairAddr);

        await fetch('/api/pools/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chainId: selectedChainId,
            pairAddress: pairAddr,
            creatorWallet: account,
            creationTxHash: receipt.hash,
            protocolVersion: activeNetwork?.factoryAddress ? 'tataswap' : 'v2',
          }),
        });

        await fetch('/api/transactions/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chainId: selectedChainId,
            txHash: receipt.hash,
            txType: 'create_pool',
            walletAddress: account,
            tokenInAddress: tokenAChoice.address,
            tokenOutAddress: tokenBChoice.address,
            amountIn: amountA || '0',
            amountOut: amountB || '0',
            pairAddress: pairAddr,
          }),
        });

        setStatus(`Liquidity pool created and funded at ${pairAddr.slice(0, 10)}...`);
        await loadData();
        await refreshBalances();
        return;
      }

      // Path C: Concentrated Range Pool Initialization & Mint (when V3 PositionManager is configured)
      if (
        activeNetwork &&
        isAddress(activeNetwork.uniswapV3Factory) &&
        isAddress(activeNetwork.uniswapV3PositionManager)
      ) {
        const v3Factory = new Contract(
          activeNetwork.uniswapV3Factory,
          UNISWAP_V3_FACTORY_ABI,
          signer
        );
        const npm = new Contract(
          activeNetwork.uniswapV3PositionManager,
          UNISWAP_V3_NPM_ABI,
          signer
        );

        let effectiveFee = activeFeeTier.v3Fee;
        let tickSpacing = activeFeeTier.tickSpacing;
        try {
          const onChainSpacing = Number(
            await v3Factory.feeAmountTickSpacing(effectiveFee)
          );
          if (onChainSpacing > 0) {
            tickSpacing = onChainSpacing;
          } else {
            for (const cand of [2500, 3000, 500, 100, 10000]) {
              const sp = Number(await v3Factory.feeAmountTickSpacing(cand));
              if (sp > 0) {
                effectiveFee = cand;
                tickSpacing = sp;
                break;
              }
            }
          }
        } catch {
          effectiveFee = 3000;
          tickSpacing = 60;
        }

        const { token0, token1, reversed } = sortTokens(
          tokenAChoice.address,
          tokenBChoice.address
        );
        const choice0 = reversed ? tokenBChoice : tokenAChoice;
        const choice1 = reversed ? tokenAChoice : tokenBChoice;
        const amt0Str = reversed ? amountB || '0' : amountA || '0';
        const amt1Str = reversed ? amountA || '0' : amountB || '0';
        const price1Per0 = reversed ? 1 / priceBPerA : priceBPerA;

        const sqrtPriceX96 = encodeSqrtPriceX96(
          price1Per0,
          choice0.decimals,
          choice1.decimals
        );

        setStatus('Step 1/3: Initializing pool on-chain...');
        const initTx = await npm.createAndInitializePoolIfNecessary(
          token0,
          token1,
          effectiveFee,
          sqrtPriceX96
        );
        await initTx.wait();
        const poolAddr: string = await v3Factory.getPool(token0, token1, effectiveFee);

        const raw0 = parseUnits(amt0Str, choice0.decimals);
        const raw1 = parseUnits(amt1Str, choice1.decimals);

        if (!choice0.isNative && raw0 > 0n) {
          const c0 = new Contract(token0, ERC20_ABI, signer);
          const allow0: bigint = await c0.allowance(
            account,
            activeNetwork.uniswapV3PositionManager
          );
          if (allow0 < raw0) {
            setStatus(`Step 2/3: Approving ${choice0.symbol}...`);
            await (await c0.approve(activeNetwork.uniswapV3PositionManager, raw0)).wait();
          }
        }
        if (!choice1.isNative && raw1 > 0n) {
          const c1 = new Contract(token1, ERC20_ABI, signer);
          const allow1: bigint = await c1.allowance(
            account,
            activeNetwork.uniswapV3PositionManager
          );
          if (allow1 < raw1) {
            setStatus(`Step 2/3: Approving ${choice1.symbol}...`);
            await (await c1.approve(activeNetwork.uniswapV3PositionManager, raw1)).wait();
          }
        }

        let { tickLower, tickUpper } = fullRangeTicks(tickSpacing);
        if (rangeMode === 'custom') {
          const pMinDisp = Number.parseFloat(minPrice);
          const pMaxDisp = Number.parseFloat(maxPrice);
          if (
            Number.isFinite(pMinDisp) &&
            Number.isFinite(pMaxDisp) &&
            pMinDisp > 0 &&
            pMaxDisp > pMinDisp
          ) {
            const minBPerA = priceInverted ? 1 / pMaxDisp : pMinDisp;
            const maxBPerA = priceInverted ? 1 / pMinDisp : pMaxDisp;
            const min1Per0 = reversed ? 1 / maxBPerA : minBPerA;
            const max1Per0 = reversed ? 1 / minBPerA : maxBPerA;
            const tL = nearestUsableTick(
              priceToTick(min1Per0, choice0.decimals, choice1.decimals),
              tickSpacing
            );
            const tU = nearestUsableTick(
              priceToTick(max1Per0, choice0.decimals, choice1.decimals),
              tickSpacing
            );
            if (tU > tL) {
              tickLower = tL;
              tickUpper = tU;
            }
          }
        }

        const nativeValue = choice0.isNative ? raw0 : choice1.isNative ? raw1 : 0n;
        setStatus('Step 3/3: Confirm liquidity deposit in your wallet...');
        const mintTx = await npm.mint(
          {
            token0,
            token1,
            fee: effectiveFee,
            tickLower,
            tickUpper,
            amount0Desired: raw0,
            amount1Desired: raw1,
            amount0Min: 0n,
            amount1Min: 0n,
            recipient: account,
            deadline,
          },
          { value: nativeValue }
        );
        const receipt = await mintTx.wait();
        setTxHash(receipt.hash);
        setExistingPoolAddr(poolAddr);

        await fetch('/api/pools/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chainId: selectedChainId,
            pairAddress: poolAddr,
            creatorWallet: account,
            creationTxHash: receipt.hash,
            protocolVersion: 'v3',
            feeTierBps: Math.round(effectiveFee / 100),
          }),
        });

        await fetch('/api/transactions/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chainId: selectedChainId,
            txHash: receipt.hash,
            txType: 'create_pool',
            walletAddress: account,
            tokenInAddress: choice0.address,
            tokenOutAddress: choice1.address,
            amountIn: amt0Str,
            amountOut: amt1Str,
            pairAddress: poolAddr,
          }),
        });

        setStatus(`Pool initialized & funded at ${poolAddr.slice(0, 10)}...`);
        await loadData();
        await refreshBalances();
        return;
      }

      setError('Factory and Router contracts are not configured for this network yet.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create pool.');
      setStatus(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSyncPool = async (pairAddress: string) => {
    try {
      await fetch('/api/pools/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chainId: selectedChainId, pairAddress }),
      });
      await loadData();
    } catch (err) {
      console.error('Pool sync failed:', err);
    }
  };

  const bothTokensSelected = Boolean(tokenAChoice && tokenBChoice);
  const isSelectedTierCreated = Boolean(
    bothTokensSelected && (tierCreatedMap[activeFeeTier.id] || existingPoolAddr)
  );
  const hasAmounts =
    Number.parseFloat(amountA || '0') > 0 || Number.parseFloat(amountB || '0') > 0;
  const hasValidInitialPrice = priceBPerA > 0 || Boolean(existingPoolAddr);

  const filteredPickerTokens = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    return tokenOptions.filter(
      (t) =>
        !q ||
        t.symbol.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.address.toLowerCase().includes(q)
    );
  }, [tokenOptions, pickerSearch]);

  const filteredAdvancedTiers = useMemo(() => {
    const q = customFeeQuery.trim().toLowerCase();
    const all = [...FEE_TIERS, ...EXTRA_SEARCH_TIERS];
    if (!q) return EXTRA_SEARCH_TIERS;
    return all.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
    );
  }, [customFeeQuery]);

  return (
    <div className="space-y-6">
      <ContractStatusNotice network={activeNetwork} onNavigate={onNavigate} />

      {/* Top Breadcrumb & Back Header (Matches PDF Page 1) */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <button
            type="button"
            onClick={() => onNavigate('portfolio')}
            className="hover:text-emerald-400 transition-colors"
          >
            Your positions
          </button>
          <span>&gt;</span>
          <span className="text-slate-200 font-medium">Create Pool</span>
        </div>

        <button
          type="button"
          onClick={() => {
            if (step === 2) setStep(1);
            else onNavigate('portfolio');
          }}
          className="inline-flex items-center gap-2.5 text-2xl font-bold text-slate-100 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Create Pool</span>
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left: 2-Step Create Pool Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111622] p-5 sm:p-6 space-y-5 lg:col-span-6">
          {/* Step Indicator Header (Matches PDF Page 2) */}
          <div className="flex items-center gap-3 border-b border-white/[0.07] pb-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-slate-950">
              {step}
            </span>
            <div>
              <div className="text-xs text-slate-400">Step {step} of 2</div>
              <div className="text-sm font-semibold text-slate-100">
                {step === 1 ? 'Select token pair and fees' : 'Set initial price and deposit'}
              </div>
            </div>
          </div>

          {step === 1 ? (
            <>
              {/* Select pair (Matches PDF Page 2 stacked selectors) */}
              <div className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-100">Select pair</h2>
                  <p className="text-xs text-slate-400">
                    Choose the tokens you want to provide liquidity for. You can select tokens on
                    all supported networks.
                  </p>
                </div>

                {/* Token 1 Stacked Button */}
                <button
                  type="button"
                  onClick={() => setPickerTarget('A')}
                  className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-[#090C12] px-4 py-3.5 text-left hover:border-emerald-500/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                      {(tokenAChoice?.symbol || '?').slice(0, 3)}
                    </span>
                    <div>
                      <div className="text-sm font-semibold text-slate-100">
                        {tokenAChoice ? tokenAChoice.symbol : 'Choose token'}
                      </div>
                      {tokenAChoice && (
                        <div className="text-[11px] text-slate-400">{tokenAChoice.name}</div>
                      )}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </button>

                {/* Token 2 Stacked Button ("Choose token" when empty) */}
                <button
                  type="button"
                  onClick={() => setPickerTarget('B')}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left transition-colors ${
                    tokenBChoice
                      ? 'border border-white/10 bg-[#090C12] hover:border-emerald-500/40'
                      : 'border border-emerald-500/40 bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                  }`}
                >
                  {tokenBChoice ? (
                    <>
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
                          {tokenBChoice.symbol.slice(0, 3)}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-slate-100">
                            {tokenBChoice.symbol}
                          </div>
                          <div className="text-[11px] text-slate-400">{tokenBChoice.name}</div>
                        </div>
                      </div>
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-bold">Choose token</span>
                      <ChevronDown className="h-4 w-4" />
                    </>
                  )}
                </button>

                {/* Add a hook (optional) card (Matches PDF Page 2) */}
                <div className="rounded-xl border border-white/10 bg-[#090C12] p-3.5 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-100">
                        Add a hook <span className="font-normal text-slate-500">(optional)</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Hooks allow for advanced position customization.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowHookPanel(!showHookPanel)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-[#171D2C] px-3 py-2 text-xs font-medium text-slate-200 hover:border-emerald-500/40"
                    >
                      <Search className="h-3.5 w-3.5" />
                      <span>{hookAddress ? 'Edit' : 'Search'}</span>
                    </button>
                  </div>

                  {hookAddress && !showHookPanel && (
                    <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs">
                      <span className="font-mono text-emerald-300 truncate">
                        Hook: {hookAddress}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setHookAddress('');
                          setHookInput('');
                          setHookVerified('none');
                        }}
                        className="ml-2 text-slate-400 hover:text-white"
                      >
                        Clear
                      </button>
                    </div>
                  )}

                  {showHookPanel && (
                    <div className="space-y-2 border-t border-white/[0.06] pt-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={hookInput}
                          onChange={(e) => setHookInput(e.target.value)}
                          placeholder="0x... Hook contract address (leave blank for none)"
                          className="flex-1 rounded-lg border border-white/10 bg-[#111622] px-3 py-2 font-mono text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          disabled={hookChecking}
                          onClick={handleVerifyAndSetHook}
                          className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50"
                        >
                          {hookChecking ? 'Checking...' : 'Apply'}
                        </button>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {hookVerified === 'verified' ? (
                          <span className="text-emerald-400">
                            Hook contract bytecode verified on {activeNetwork?.shortName}.
                            {!v4Periphery &&
                              ' Note: Hooked pool deployment requires PoolManager (Ethereum, BSC, Polygon, Base, Arbitrum).'}
                          </span>
                        ) : hookVerified === 'unverified' ? (
                          <span className="text-amber-400">
                            No deployed contract bytecode detected at this address on{' '}
                            {activeNetwork?.shortName}.
                          </span>
                        ) : (
                          'Optional custom hook address for PoolManager-enabled networks.'
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Fee Tier Section (Matches PDF Pages 2 & 3) */}
              <div className="space-y-3 border-t border-white/[0.07] pt-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-100">Fee tier</h2>
                  <p className="text-xs text-slate-400">
                    The amount earned providing liquidity. Choose an amount that suits your risk
                    tolerance and strategy.
                  </p>
                </div>

                {/* Collapsible Selected Fee Tier Summary */}
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#090C12] p-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-100">
                        {bothTokensSelected ? `${activeFeeTier.label} fee tier` : '-- fee tier'}
                      </span>
                      {bothTokensSelected && (
                        <span className="rounded-md bg-white/[0.07] px-2 py-0.5 text-[11px] font-medium text-slate-300">
                          {isSelectedTierCreated ? 'Created' : 'New tier'}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">The % you will earn in fees</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeeExpanded(!feeExpanded)}
                    className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-[#171D2C] px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-white/10"
                  >
                    <span>{feeExpanded ? 'Less' : 'More'}</span>
                    {feeExpanded ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                {/* 4-Card Fee Tier Grid */}
                {feeExpanded && (
                  <div className="grid grid-cols-2 gap-3">
                    {FEE_TIERS.map((tier) => {
                      const isSelected = activeFeeTier.id === tier.id;
                      const created = Boolean(bothTokensSelected && tierCreatedMap[tier.id]);
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setSelectedFeeId(tier.id)}
                          className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-colors ${
                            isSelected
                              ? 'border-emerald-500/60 bg-emerald-500/10'
                              : 'border-white/10 bg-[#090C12] hover:border-white/20'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-sm font-bold text-slate-100 tabular-nums">
                                {tier.label}
                              </span>
                              {isSelected && (
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-slate-950">
                                  <Check className="h-3 w-3 stroke-[3]" />
                                </span>
                              )}
                            </div>
                            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                              {tier.description}
                            </p>
                          </div>
                          <div className="mt-3 text-[11px] font-medium text-slate-500">
                            {created ? (
                              <span className="text-emerald-400">Created</span>
                            ) : (
                              'Not created'
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Search or create other fee tiers (Advanced) */}
                <div>
                  <button
                    type="button"
                    onClick={() => setShowAdvancedFee(!showAdvancedFee)}
                    className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-emerald-400"
                  >
                    <Search className="h-3.5 w-3.5" />
                    <span>
                      Search or create other fee tiers{' '}
                      <span className="text-slate-500">(Advanced)</span>
                    </span>
                  </button>

                  {showAdvancedFee && (
                    <div className="mt-2.5 space-y-2.5 rounded-xl border border-white/10 bg-[#090C12] p-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={customFeeQuery}
                          onChange={(e) => setCustomFeeQuery(e.target.value)}
                          placeholder="Search or enter custom % (e.g. 0.01, 0.05, 0.30, 1.00)"
                          className="flex-1 rounded-lg border border-white/10 bg-[#111622] px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCustomFeeTier()}
                          className="rounded-lg bg-emerald-500 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
                        >
                          Create
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {filteredAdvancedTiers.map((t) => (
                          <button
                            key={`adv-${t.id}`}
                            type="button"
                            onClick={() => {
                              setSelectedFeeId(t.id);
                              setShowAdvancedFee(false);
                            }}
                            className={`rounded-lg border px-2.5 py-2 text-left text-xs transition-colors ${
                              activeFeeTier.id === t.id
                                ? 'border-emerald-500/60 bg-emerald-500/10 text-emerald-300'
                                : 'border-white/10 bg-[#111622] text-slate-300 hover:border-white/20'
                            }`}
                          >
                            <div className="font-mono font-semibold">{t.label}</div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {t.description}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Creating new pool callout */}
                <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-[#090C12] p-3.5 text-xs">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-200">
                      {isSelectedTierCreated ? 'Existing pool detected' : 'Creating new pool'}
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                      {isSelectedTierCreated
                        ? `A pool for ${tokenAChoice?.symbol}/${tokenBChoice?.symbol} already exists on-chain. Continuing will deposit liquidity into the existing pool.`
                        : 'Your selections will create a new liquidity pool which may result in lower initial liquidity and increased volatility. Consider adding to an existing pool to minimize these risks.'}
                    </p>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                disabled={!bothTokensSelected}
                onClick={handleContinueStep1}
                className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:bg-white/[0.06] disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
              >
                Continue
              </button>
            </>
          ) : (
            <>
              {/* Step 2 Summary Bar */}
              <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#090C12] px-4 py-3">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-semibold text-slate-100">
                    {tokenAChoice?.symbol} / {tokenBChoice?.symbol}
                  </span>
                  <span className="rounded bg-white/[0.07] px-2 py-0.5 font-mono text-[11px] text-slate-300">
                    {activeFeeTier.label}
                  </span>
                  {hookAddress && (
                    <span className="rounded bg-emerald-500/15 px-2 py-0.5 font-mono text-[11px] text-emerald-300">
                      Hooked
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-medium text-emerald-400 hover:underline"
                >
                  Edit
                </button>
              </div>

              {/* Set Initial Price (Matches PDF Page 4) */}
              <div className="space-y-3">
                <div>
                  <h2 className="text-base font-semibold text-slate-100">Set initial price</h2>
                  <p className="text-xs text-slate-400">
                    When creating a new pool, you must set the starting exchange rate for both
                    tokens. This rate will reflect the initial market price.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#090C12] p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-slate-400">Initial price</span>
                    <div className="inline-flex rounded-full border border-white/10 bg-[#171D2C] p-0.5">
                      <button
                        type="button"
                        onClick={() => setPriceInverted(false)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          !priceInverted
                            ? 'bg-emerald-500 text-slate-950 font-semibold'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {tokenAChoice?.symbol}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPriceInverted(true)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                          priceInverted
                            ? 'bg-emerald-500 text-slate-950 font-semibold'
                            : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        {tokenBChoice?.symbol}
                      </button>
                    </div>
                  </div>

                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={initialPrice}
                    onChange={(e) => handleInitialPriceChange(e.target.value)}
                    placeholder="0"
                    className="w-full bg-transparent font-mono text-3xl font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none tabular-nums"
                  />

                  <div className="text-xs font-mono text-slate-400">
                    {quoteToken?.symbol} = 1 {baseToken?.symbol}
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-xl border border-white/[0.06] bg-[#090C12] p-3 text-xs text-slate-400">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                  <span>
                    {existingPoolPrice
                      ? `On-chain pool market rate detected (${existingPoolPrice}).`
                      : 'Market price not found. Please do your own research to avoid loss of funds.'}
                  </span>
                </div>
              </div>

              {/* Set Price Range (Matches PDF Pages 4 & 5) */}
              <div className="space-y-3 border-t border-white/[0.07] pt-4">
                <h2 className="text-base font-semibold text-slate-100">Set price range</h2>

                <div className="grid grid-cols-2 rounded-full border border-white/10 bg-[#090C12] p-1">
                  <button
                    type="button"
                    onClick={() => setRangeMode('full')}
                    className={`rounded-full py-2 text-xs font-semibold transition-colors ${
                      rangeMode === 'full'
                        ? 'bg-[#171D2C] text-slate-100 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Full range
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRangeMode('custom');
                      const p = Number.parseFloat(initialPrice);
                      if (Number.isFinite(p) && p > 0 && !minPrice && !maxPrice) {
                        syncDefaultRangeFromPrice(p);
                      }
                    }}
                    className={`rounded-full py-2 text-xs font-semibold transition-colors ${
                      rangeMode === 'custom'
                        ? 'bg-[#171D2C] text-slate-100 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Custom range
                  </button>
                </div>

                {rangeMode === 'custom' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-[#090C12] p-3 space-y-1.5">
                      <div className="text-[11px] text-slate-400">Min price</div>
                      <div className="flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepMinMax('min', -0.05)}
                          className="rounded-md border border-white/10 bg-[#171D2C] p-1 text-slate-300 hover:text-white"
                          aria-label="Decrease min price"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          placeholder="0.0"
                          className="w-full bg-transparent text-center font-mono text-sm font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={() => handleStepMinMax('min', 0.05)}
                          className="rounded-md border border-white/10 bg-[#171D2C] p-1 text-slate-300 hover:text-white"
                          aria-label="Increase min price"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-center text-[10px] text-slate-500">
                        {quoteToken?.symbol} per {baseToken?.symbol}
                      </div>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-[#090C12] p-3 space-y-1.5">
                      <div className="text-[11px] text-slate-400">Max price</div>
                      <div className="flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => handleStepMinMax('max', -0.05)}
                          className="rounded-md border border-white/10 bg-[#171D2C] p-1 text-slate-300 hover:text-white"
                          aria-label="Decrease max price"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="∞"
                          className="w-full bg-transparent text-center font-mono text-sm font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none tabular-nums"
                        />
                        <button
                          type="button"
                          onClick={() => handleStepMinMax('max', 0.05)}
                          className="rounded-md border border-white/10 bg-[#171D2C] p-1 text-slate-300 hover:text-white"
                          aria-label="Increase max price"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="text-center text-[10px] text-slate-500">
                        {quoteToken?.symbol} per {baseToken?.symbol}
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs leading-relaxed text-slate-400">
                  Setting full range liquidity when creating a pool ensures continuous market
                  participation across all possible prices, offering simplicity but with potential
                  for higher impermanent loss.
                </p>
              </div>

              {/* Deposit Tokens (Matches PDF Page 5) */}
              <div className="space-y-3 border-t border-white/[0.07] pt-4">
                <div>
                  <h2 className="text-base font-semibold text-slate-100">Deposit tokens</h2>
                  <p className="text-xs text-slate-400">
                    Specify the token amounts for your liquidity contribution.
                  </p>
                </div>

                {/* Token 1 Deposit Box */}
                <div className="rounded-xl border border-white/10 bg-[#090C12] p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={amountA}
                      onChange={(e) => handleAmountAChange(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent font-mono text-2xl font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none tabular-nums"
                    />
                    <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-[#171D2C] px-3 py-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                        {(tokenAChoice?.symbol || 'T').slice(0, 2)}
                      </span>
                      <span className="text-sm font-semibold text-slate-100">
                        {tokenAChoice?.symbol}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={`a-${pct}`}
                          type="button"
                          onClick={() => applyBalancePct('A', pct)}
                          className="rounded-full border border-white/10 bg-[#171D2C] px-2.5 py-0.5 text-[11px] font-medium text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
                        >
                          {pct === 100 ? 'Max' : `${pct}%`}
                        </button>
                      ))}
                    </div>
                    <span className="font-mono text-xs text-slate-400 tabular-nums">
                      {formatCompactBalance(balanceA)} {tokenAChoice?.symbol}
                    </span>
                  </div>
                </div>

                {/* Token 2 Deposit Box */}
                <div className="rounded-xl border border-white/10 bg-[#090C12] p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={amountB}
                      onChange={(e) => handleAmountBChange(e.target.value)}
                      placeholder="0"
                      className="w-full bg-transparent font-mono text-2xl font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none tabular-nums"
                    />
                    <div className="inline-flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-[#171D2C] px-3 py-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400">
                        {(tokenBChoice?.symbol || 'T').slice(0, 2)}
                      </span>
                      <span className="text-sm font-semibold text-slate-100">
                        {tokenBChoice?.symbol}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      {[25, 50, 75, 100].map((pct) => (
                        <button
                          key={`b-${pct}`}
                          type="button"
                          onClick={() => applyBalancePct('B', pct)}
                          className="rounded-full border border-white/10 bg-[#171D2C] px-2.5 py-0.5 text-[11px] font-medium text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300"
                        >
                          {pct === 100 ? 'Max' : `${pct}%`}
                        </button>
                      ))}
                    </div>
                    <span className="font-mono text-xs text-slate-400 tabular-nums">
                      {formatCompactBalance(balanceB)} {tokenBChoice?.symbol}
                    </span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {status && (
                <div className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <div>{status}</div>
                    {txHash && activeNetwork && (
                      <a
                        href={`${activeNetwork.explorerUrl}/tx/${txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex items-center gap-1 font-mono underline"
                      >
                        View Tx {txHash.slice(0, 12)}...
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              )}

              {!account ? (
                <button
                  type="button"
                  onClick={() => setWalletModalOpen(true)}
                  className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Connect Wallet
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting || !hasAmounts || !hasValidInitialPrice}
                  onClick={handleExecuteCreateAndDeposit}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:bg-white/[0.06] disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Layers className="h-4 w-4" />
                  <span>
                    {submitting
                      ? 'Creating Pool...'
                      : !hasValidInitialPrice
                      ? 'Set initial price'
                      : !hasAmounts
                      ? 'Enter an amount'
                      : 'Create Pool & Deposit Liquidity'}
                  </span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Right: On-Chain Liquidity Pools Table */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#111622] p-6 lg:col-span-6 self-start">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100">On-Chain Liquidity Pools</h2>
              <p className="text-xs text-slate-400">
                Real reserves synced from {activeNetwork?.shortName || 'Tata'}
              </p>
            </div>
            <button
              type="button"
              onClick={loadData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {pools.length === 0 ? (
            <div className="py-10 text-center text-sm text-slate-400">
              No pools deployed on this network yet. No simulated liquidity is displayed—create the
              first trading pair to seed real reserves.
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06] text-slate-500">
                    <th className="pb-2.5 font-medium">Pair</th>
                    <th className="pb-2.5 text-right font-medium">Reserves</th>
                    <th className="pb-2.5 text-right font-medium">Fee Tier</th>
                    <th className="pb-2.5 text-right font-medium">Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {pools.map((pool) => (
                    <tr key={pool.id}>
                      <td className="py-3">
                        <div className="font-semibold text-slate-100">
                          {pool.token0Symbol} / {pool.token1Symbol}
                        </div>
                        <div className="font-mono text-[11px] text-slate-500 tabular-nums">
                          {pool.pairAddress.slice(0, 10)}...{pool.pairAddress.slice(-6)}
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-200 tabular-nums">
                        <div>
                          {Number.parseFloat(pool.reserve0).toFixed(4)} {pool.token0Symbol}
                        </div>
                        <div className="text-slate-400">
                          {Number.parseFloat(pool.reserve1).toFixed(4)} {pool.token1Symbol}
                        </div>
                      </td>
                      <td className="py-3 text-right font-mono text-slate-300 tabular-nums">
                        {(pool.feeTierBps / 100).toFixed(2)}%
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleSyncPool(pool.pairAddress)}
                          className="text-emerald-400 hover:underline"
                        >
                          Sync RPC
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Token Picker Modal (Supports All Supported Networks + Custom Contract Import) */}
      {pickerTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setPickerTarget(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111622] p-5 space-y-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-100">
                Select a token ({activeNetwork?.shortName})
              </h3>
              <button
                type="button"
                onClick={() => setPickerTarget(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                aria-label="Close token picker"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Network Switcher Pills inside Picker ("all supported networks") */}
            <div className="flex flex-wrap gap-1.5">
              {networks.map((net) => (
                <button
                  key={net.chainId}
                  type="button"
                  onClick={() => switchNetwork(net.chainId)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-colors ${
                    net.chainId === selectedChainId
                      ? 'bg-emerald-500 text-slate-950 font-semibold'
                      : 'border border-white/10 bg-[#090C12] text-slate-300 hover:border-white/25'
                  }`}
                >
                  {net.shortName}
                </button>
              ))}
            </div>

            {/* Search or Paste Contract Address */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={pickerSearch}
                onChange={(e) => setPickerSearch(e.target.value)}
                placeholder="Search name or paste 0x... contract address"
                className="w-full rounded-xl border border-white/10 bg-[#090C12] pl-9 pr-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none"
                autoFocus
              />
            </div>

            {pickerCustomLoading && (
              <div className="rounded-lg border border-white/10 bg-[#090C12] p-3 text-xs text-slate-400">
                Verifying token contract on {activeNetwork?.shortName}...
              </div>
            )}

            {pickerCustomError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {pickerCustomError}
              </div>
            )}

            {pickerCustomToken && (
              <button
                type="button"
                onClick={() => handleSelectTokenFromPicker(pickerCustomToken)}
                className="flex w-full items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-3 text-left hover:bg-emerald-500/20"
              >
                <div>
                  <div className="text-sm font-semibold text-emerald-300">
                    {pickerCustomToken.symbol} · {pickerCustomToken.name}
                  </div>
                  <div className="font-mono text-[11px] text-slate-400">
                    {pickerCustomToken.address.slice(0, 12)}...{pickerCustomToken.address.slice(-6)}
                  </div>
                </div>
                <span className="rounded-md bg-emerald-500 px-2.5 py-1 text-[11px] font-semibold text-slate-950">
                  Import
                </span>
              </button>
            )}

            <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.06]">
              {filteredPickerTokens.length === 0 && !pickerCustomToken ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No matching tokens found on {activeNetwork?.shortName}.
                </div>
              ) : (
                filteredPickerTokens.map((tok) => {
                  const key = `${tok.isNative ? 'native' : 'erc20'}:${tok.address.toLowerCase()}`;
                  const bal = tokenBalancesMap[key] || '0';
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleSelectTokenFromPicker(tok)}
                      className="flex w-full items-center justify-between py-3 px-2 text-left hover:bg-white/[0.04] rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/15 text-xs font-bold text-emerald-400">
                          {tok.symbol.slice(0, 3)}
                        </span>
                        <div>
                          <div className="text-sm font-semibold text-slate-100">{tok.symbol}</div>
                          <div className="text-[11px] text-slate-400">{tok.name}</div>
                        </div>
                      </div>
                      <div className="text-right font-mono text-xs text-slate-300 tabular-nums">
                        {account ? formatCompactBalance(bal) : '—'}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
