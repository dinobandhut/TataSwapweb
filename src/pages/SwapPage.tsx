import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowDownUp,
  CheckCircle2,
  ExternalLink,
  Settings2,
} from 'lucide-react';
import { Contract, Interface, isAddress, parseEther, parseUnits } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { ContractStatusNotice } from '../components/ContractStatusNotice';
import { ERC20_ABI, ROUTER_ABI } from '../lib/abis';
import { UNISWAP_V3_SWAP_ROUTER02_ABI } from '../lib/uniswap/abis';
import { quoteSwapExactIn, type SwapQuoteResult } from '../lib/uniswap/adapters';
import type { IndexedToken, PageRoute } from '../types/dex';

interface TokenOption {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  isNative?: boolean;
}

export function SwapPage({ onNavigate }: { onNavigate: (page: PageRoute) => void }) {
  const {
    account,
    activeNetwork,
    selectedChainId,
    nativeBalance,
    getBrowserProvider,
    getViemClient,
    getTokenBalance,
    setWalletModalOpen,
  } = useWallet();

  const [tokens, setTokens] = useState<TokenOption[]>([]);
  const [tokenIn, setTokenIn] = useState<TokenOption | null>(null);
  const [tokenOut, setTokenOut] = useState<TokenOption | null>(null);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [balanceIn, setBalanceIn] = useState('0');
  const [balanceOut, setBalanceOut] = useState('0');
  const [slippagePct, setSlippagePct] = useState('0.5');
  const [deadlineMins, setDeadlineMins] = useState('20');
  const [showSettings, setShowSettings] = useState(false);

  const [quote, setQuote] = useState<SwapQuoteResult | null>(null);
  const [quoting, setQuoting] = useState(false);

  const [customAddress, setCustomAddress] = useState('');
  const [customTarget, setCustomTarget] = useState<'in' | 'out'>('out');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadTokens() {
      const nativeOpt: TokenOption = {
        address: 'NATIVE',
        symbol: activeNetwork?.nativeSymbol || 'TATA',
        name: `${activeNetwork?.shortName || 'Tata'} Native`,
        decimals: 18,
        isNative: true,
      };
      try {
        const res = await fetch(`/api/tokens?chainId=${selectedChainId}`);
        const data = res.ok ? await res.json() : { tokens: [] };
        const indexed: TokenOption[] = (data.tokens || []).map((t: IndexedToken) => ({
          address: t.address,
          symbol: t.symbol,
          name: t.name,
          decimals: t.decimals,
        }));
        if (cancelled) return;
        const merged = [nativeOpt, ...indexed];
        setTokens(merged);
        setTokenIn(merged[0] || null);
        setTokenOut(merged[1] || null);
      } catch {
        if (!cancelled) {
          setTokens([nativeOpt]);
          setTokenIn(nativeOpt);
        }
      }
    }
    loadTokens();
    return () => {
      cancelled = true;
    };
  }, [selectedChainId, activeNetwork]);

  useEffect(() => {
    let cancelled = false;
    async function loadBalances() {
      if (!account) {
        setBalanceIn('0');
        setBalanceOut('0');
        return;
      }
      if (tokenIn) {
        if (tokenIn.isNative) {
          setBalanceIn(nativeBalance);
        } else {
          const bal = await getTokenBalance(tokenIn.address, account, selectedChainId);
          if (!cancelled) setBalanceIn(bal);
        }
      }
      if (tokenOut) {
        if (tokenOut.isNative) {
          setBalanceOut(nativeBalance);
        } else {
          const bal = await getTokenBalance(tokenOut.address, account, selectedChainId);
          if (!cancelled) setBalanceOut(bal);
        }
      }
    }
    loadBalances();
    return () => {
      cancelled = true;
    };
  }, [account, tokenIn, tokenOut, nativeBalance, selectedChainId, getTokenBalance]);

  // Automatic best-route AMM quote across configured adapters
  useEffect(() => {
    let cancelled = false;
    async function fetchQuote() {
      setQuote(null);
      setAmountOut('');
      if (!activeNetwork || !tokenIn || !tokenOut) return;
      if (!amountIn || Number.parseFloat(amountIn) <= 0) return;

      const addrA = tokenIn.isNative ? activeNetwork.wrappedNativeAddress : tokenIn.address;
      const addrB = tokenOut.isNative ? activeNetwork.wrappedNativeAddress : tokenOut.address;
      if (!addrA || !addrB || addrA.toLowerCase() === addrB.toLowerCase()) return;

      const client = getViemClient(selectedChainId);
      if (!client) return;

      setQuoting(true);
      try {
        const q = await quoteSwapExactIn({
          client,
          network: activeNetwork,
          tokenIn: addrA,
          tokenOut: addrB,
          amountIn,
          decimalsIn: tokenIn.decimals,
          decimalsOut: tokenOut.decimals,
        });
        if (!cancelled && q) {
          setQuote(q);
          setAmountOut(q.amountOutFormatted);
        }
      } catch (err) {
        console.error('Quote error:', err);
      } finally {
        if (!cancelled) setQuoting(false);
      }
    }

    const timer = setTimeout(fetchQuote, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [amountIn, tokenIn, tokenOut, activeNetwork, selectedChainId, getViemClient]);

  const handleLoadCustomToken = async () => {
    setErrorMessage(null);
    if (!isAddress(customAddress)) {
      setErrorMessage('Enter a valid ERC-20 / BEP-20 contract address.');
      return;
    }
    try {
      const res = await fetch('/api/tokens/inspect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chainId: selectedChainId, address: customAddress }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to inspect token');
      const opt: TokenOption = {
        address: data.metadata.address,
        symbol: data.metadata.symbol,
        name: data.metadata.name,
        decimals: data.metadata.decimals,
      };
      setTokens((prev) =>
        prev.some((t) => t.address.toLowerCase() === opt.address.toLowerCase())
          ? prev
          : [...prev, opt]
      );
      if (customTarget === 'in') setTokenIn(opt);
      else setTokenOut(opt);
      setCustomAddress('');
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Custom token lookup failed');
    }
  };

  const handleFlip = () => {
    const prevIn = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(prevIn);
    setAmountIn('');
    setAmountOut('');
    setQuote(null);
  };

  const handleExecuteSwap = async () => {
    setErrorMessage(null);
    setStatusMessage(null);
    setTxHash(null);

    if (!account) {
      setWalletModalOpen(true);
      return;
    }
    if (!activeNetwork) return;
    if (!tokenIn || !tokenOut || !amountIn || Number.parseFloat(amountIn) <= 0) {
      setErrorMessage('Enter a valid input amount to swap.');
      return;
    }
    if (!quote) {
      setErrorMessage('No active liquidity pool exists on-chain for this token pair.');
      return;
    }

    const browserProvider = getBrowserProvider();
    if (!browserProvider) {
      setErrorMessage('Connect MetaMask or Trust Wallet to sign transactions.');
      return;
    }

    setSubmitting(true);
    try {
      const signer = await browserProvider.getSigner();
      const addrA = tokenIn.isNative ? activeNetwork.wrappedNativeAddress : tokenIn.address;
      const addrB = tokenOut.isNative ? activeNetwork.wrappedNativeAddress : tokenOut.address;
      const amountInWei = parseUnits(amountIn, tokenIn.decimals);
      const slippageBps = Math.floor(Number.parseFloat(slippagePct || '0.5') * 100);
      const minOutWei = (quote.amountOutWei * BigInt(10000 - slippageBps)) / 10000n;
      const deadline = BigInt(
        Math.floor(Date.now() / 1000) + Number.parseInt(deadlineMins || '20', 10) * 60
      );

      let receiptHash = '';

      if (quote.protocolVersion === 'v3') {
        const routerAddr = activeNetwork.uniswapV3SwapRouter;
        if (!routerAddr) throw new Error('Router contract is not configured on this network.');

        if (!tokenIn.isNative) {
          const erc20 = new Contract(tokenIn.address, ERC20_ABI, signer);
          const allowance: bigint = await erc20.allowance(account, routerAddr);
          if (allowance < amountInWei) {
            setStatusMessage(`Requesting ${tokenIn.symbol} approval in your wallet...`);
            const appTx = await erc20.approve(routerAddr, amountInWei);
            await appTx.wait();
          }
        }

        const router = new Contract(routerAddr, UNISWAP_V3_SWAP_ROUTER02_ABI, signer);
        const routerIface = new Interface(UNISWAP_V3_SWAP_ROUTER02_ABI);

        setStatusMessage('Confirming swap transaction in your wallet...');
        let swapTx;
        if (tokenOut.isNative) {
          const exactCall = routerIface.encodeFunctionData('exactInputSingle', [
            {
              tokenIn: addrA,
              tokenOut: addrB,
              fee: quote.feeTier,
              recipient: routerAddr,
              amountIn: amountInWei,
              amountOutMinimum: minOutWei,
              sqrtPriceLimitX96: 0n,
            },
          ]);
          const unwrapCall = routerIface.encodeFunctionData('unwrapWETH9', [minOutWei, account]);
          swapTx = await router['multicall(uint256,bytes[])'](deadline, [exactCall, unwrapCall]);
        } else {
          swapTx = await router.exactInputSingle(
            {
              tokenIn: addrA,
              tokenOut: addrB,
              fee: quote.feeTier,
              recipient: account,
              amountIn: amountInWei,
              amountOutMinimum: minOutWei,
              sqrtPriceLimitX96: 0n,
            },
            { value: tokenIn.isNative ? parseEther(amountIn) : 0n }
          );
        }

        setStatusMessage('Waiting for blockchain confirmation...');
        const receipt = await swapTx.wait();
        if (!receipt || receipt.status !== 1) {
          throw new Error('Swap transaction reverted on-chain.');
        }
        receiptHash = receipt.hash;
      } else {
        const routerAddr =
          quote.protocolVersion === 'v2'
            ? activeNetwork.uniswapV2Router
            : activeNetwork.routerAddress;
        if (!routerAddr) {
          throw new Error(
            'TataSwapRouter is not yet deployed on this network. Deploy contracts via Hardhat and configure addresses in Admin Dashboard.'
          );
        }

        if (!tokenIn.isNative) {
          const erc20 = new Contract(tokenIn.address, ERC20_ABI, signer);
          const allowance: bigint = await erc20.allowance(account, routerAddr);
          if (allowance < amountInWei) {
            setStatusMessage(`Requesting ${tokenIn.symbol} approval in your wallet...`);
            const approveTx = await erc20.approve(routerAddr, amountInWei);
            await approveTx.wait();
          }
        }

        setStatusMessage('Confirming swap transaction in your wallet...');
        const router = new Contract(routerAddr, ROUTER_ABI, signer);
        let swapTx;
        if (tokenIn.isNative) {
          swapTx = await router.swapExactETHForTokens(
            minOutWei,
            [addrA, addrB],
            account,
            deadline,
            { value: parseEther(amountIn) }
          );
        } else if (tokenOut.isNative) {
          swapTx = await router.swapExactTokensForETH(
            amountInWei,
            minOutWei,
            [addrA, addrB],
            account,
            deadline
          );
        } else {
          swapTx = await router.swapExactTokensForTokens(
            amountInWei,
            minOutWei,
            [addrA, addrB],
            account,
            deadline
          );
        }

        setStatusMessage('Waiting for blockchain confirmation...');
        const receipt = await swapTx.wait();
        if (!receipt || receipt.status !== 1) {
          throw new Error('Swap transaction reverted on-chain.');
        }
        receiptHash = receipt.hash;
      }

      setTxHash(receiptHash);

      await fetch('/api/transactions/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chainId: selectedChainId,
          txHash: receiptHash,
          txType: 'swap',
          protocolVersion: quote.protocolVersion,
          walletAddress: account,
          tokenInAddress: addrA,
          tokenInSymbol: tokenIn.symbol,
          tokenOutAddress: addrB,
          tokenOutSymbol: tokenOut.symbol,
          amountIn,
          amountOut: quote.amountOutFormatted,
          feeAmount: quote.lpFeeAmount,
          feeToken: tokenIn.symbol,
          priceImpactPct: quote.priceImpactPct,
          pairAddress: quote.poolAddress,
        }),
      });

      setStatusMessage('Swap confirmed on-chain and indexed.');
      setAmountIn('');
      setAmountOut('');
      setQuote(null);
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Swap transaction failed or rejected.');
      setStatusMessage(null);
    } finally {
      setSubmitting(false);
    }
  };

  const minReceived = amountOut
    ? (
        Number.parseFloat(amountOut) *
        (1 - Number.parseFloat(slippagePct || '0.5') / 100)
      ).toFixed(6)
    : '0.00';

  const hasAnyRouter = Boolean(
    activeNetwork?.routerAddress ||
      activeNetwork?.uniswapV3SwapRouter ||
      activeNetwork?.uniswapV2Router
  );

  return (
    <div className="space-y-6">
      <ContractStatusNotice network={activeNetwork} onNavigate={onNavigate} />

      <div className="mx-auto max-w-lg space-y-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#111622] p-6">
          <div className="flex items-center justify-between border-b border-white/[0.07] pb-4">
            <div>
              <h1 className="text-lg font-semibold text-slate-100">Swap Tokens</h1>
              <p className="text-xs text-slate-400">
                Real AMM execution on {activeNetwork?.name || 'BNB Smart Chain Testnet'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowSettings((s) => !s)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/5"
            >
              <Settings2 className="h-3.5 w-3.5" />
              {slippagePct}% Slippage
            </button>
          </div>

          {showSettings && (
            <div className="mt-4 space-y-3 border-b border-white/[0.07] pb-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Slippage Tolerance</span>
                <div className="flex items-center gap-1.5">
                  {['0.1', '0.5', '1.0'].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setSlippagePct(pct)}
                      className={`rounded-md px-2.5 py-1 font-mono ${
                        slippagePct === pct
                          ? 'bg-emerald-500 text-slate-950 font-semibold'
                          : 'bg-[#171D2C] text-slate-300'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <input
                    type="number"
                    step="0.1"
                    min="0.05"
                    max="49"
                    value={slippagePct}
                    onChange={(e) => setSlippagePct(e.target.value)}
                    className="w-16 rounded-md border border-white/10 bg-[#090C12] px-2 py-1 text-right font-mono text-slate-100"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Transaction Deadline (minutes)</span>
                <input
                  type="number"
                  min="1"
                  max="180"
                  value={deadlineMins}
                  onChange={(e) => setDeadlineMins(e.target.value)}
                  className="w-20 rounded-md border border-white/10 bg-[#090C12] px-2 py-1 text-right font-mono text-slate-100"
                />
              </div>
            </div>
          )}

          {/* Pay Input */}
          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>You Pay</span>
              <button
                type="button"
                onClick={() => setAmountIn(balanceIn)}
                className="font-mono hover:text-emerald-400 tabular-nums"
              >
                Balance: {Number.parseFloat(balanceIn).toFixed(5)} {tokenIn?.symbol}
              </button>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#090C12] p-3">
              <input
                type="number"
                min="0"
                step="any"
                placeholder="0.0"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                className="w-full bg-transparent font-mono text-xl font-semibold text-slate-100 placeholder-slate-600 focus:outline-none tabular-nums"
              />
              <select
                value={tokenIn?.address || ''}
                onChange={(e) => {
                  const found = tokens.find((t) => t.address === e.target.value);
                  if (found) setTokenIn(found);
                }}
                className="rounded-lg border border-white/10 bg-[#151B28] px-3 py-2 text-sm font-semibold text-slate-100 focus:outline-none"
              >
                {tokens.map((t) => (
                  <option key={`in-${t.address}`} value={t.address}>
                    {t.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="my-3 flex justify-center">
            <button
              type="button"
              onClick={handleFlip}
              className="rounded-lg border border-white/10 bg-[#171D2C] p-2 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400 transition-colors"
              aria-label="Flip swap tokens"
            >
              <ArrowDownUp className="h-4 w-4" />
            </button>
          </div>

          {/* Receive Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{quoting ? 'Fetching on-chain quote...' : 'You Receive (Estimated)'}</span>
              <span className="font-mono tabular-nums">
                Balance: {Number.parseFloat(balanceOut).toFixed(5)} {tokenOut?.symbol}
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#090C12] p-3">
              <input
                type="text"
                readOnly
                placeholder="0.0"
                value={amountOut}
                className="w-full bg-transparent font-mono text-xl font-semibold text-slate-100 placeholder-slate-600 focus:outline-none tabular-nums"
              />
              <select
                value={tokenOut?.address || ''}
                onChange={(e) => {
                  const found = tokens.find((t) => t.address === e.target.value);
                  if (found) setTokenOut(found);
                }}
                className="rounded-lg border border-white/10 bg-[#151B28] px-3 py-2 text-sm font-semibold text-slate-100 focus:outline-none"
              >
                {tokens.map((t) => (
                  <option key={`out-${t.address}`} value={t.address}>
                    {t.symbol}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quote Details */}
          <div className="mt-5 space-y-2 border-t border-white/[0.07] pt-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">On-Chain Pair</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {quote?.poolAddress
                  ? `${quote.poolAddress.slice(0, 8)}...${quote.poolAddress.slice(-6)}`
                  : 'No Pool Deployed'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Minimum Received</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {minReceived} {tokenOut?.symbol}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Price Impact</span>
              <span
                className={`font-mono tabular-nums ${
                  Number.parseFloat(quote?.priceImpactPct || '0') > 5
                    ? 'text-amber-400'
                    : 'text-slate-200'
                }`}
              >
                {quote?.priceImpactPct || '0.00'}%
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Swap Fee</span>
              <span className="font-mono text-slate-200 tabular-nums">
                {((activeNetwork?.swapFeeBps ?? 30) / 100).toFixed(2)}%
              </span>
            </div>
            {quote?.gasEstimate && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Estimated Gas</span>
                <span className="font-mono text-slate-200 tabular-nums">
                  {quote.gasEstimate} units
                </span>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <div>
                <div>{statusMessage}</div>
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

          <button
            type="button"
            disabled={submitting || quoting}
            onClick={handleExecuteSwap}
            className="mt-5 w-full rounded-lg bg-emerald-500 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-50 transition-colors"
          >
            {account
              ? submitting
                ? 'Processing Transaction...'
                : quoting
                ? 'Fetching Quote...'
                : hasAnyRouter
                ? quote
                  ? 'Confirm Swap'
                  : 'No Liquidity Pool for Pair'
                : 'Router Contracts Not Configured'
              : 'Connect Wallet to Swap'}
          </button>
        </div>

        {/* Custom ERC-20 Token Loader */}
        <div className="rounded-xl border border-white/[0.08] bg-[#111622] p-5 space-y-3">
          <div className="text-xs font-medium text-slate-300">
            Import Custom ERC-20 / BEP-20 Contract Address
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              placeholder="0x... contract address"
              value={customAddress}
              onChange={(e) => setCustomAddress(e.target.value)}
              className="flex-1 rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 font-mono text-xs text-slate-100 placeholder-slate-600 focus:border-emerald-500 focus:outline-none"
            />
            <select
              value={customTarget}
              onChange={(e) => setCustomTarget(e.target.value as 'in' | 'out')}
              className="rounded-lg border border-white/10 bg-[#171D2C] px-2.5 py-2 text-xs text-slate-200"
            >
              <option value="out">Set Receive</option>
              <option value="in">Set Pay</option>
            </select>
            <button
              type="button"
              onClick={handleLoadCustomToken}
              className="rounded-lg border border-white/10 bg-[#171D2C] px-4 py-2 text-xs font-medium text-slate-100 hover:border-emerald-500/40 whitespace-nowrap"
            >
              Inspect &amp; Load
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
