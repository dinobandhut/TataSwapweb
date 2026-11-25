import React, { useEffect, useState } from 'react';
import { Check, Loader2, Search, ShieldAlert, ShieldCheck, X } from 'lucide-react';
import { isAddress } from 'ethers';
import { useWallet } from '../context/WalletContext';
import type { IndexedToken } from '../types/dex';

export interface SelectableToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  isNative?: boolean;
  verificationStatus?: string;
}

export function TokenSelectModal({
  open,
  onClose,
  onSelect,
  tokens,
  chainId,
  excludeAddress,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (token: SelectableToken) => void;
  tokens: SelectableToken[];
  chainId: number;
  excludeAddress?: string;
}) {
  const { account, nativeBalance, activeNetwork, getTokenBalance } = useWallet();
  const [query, setQuery] = useState('');
  const [inspecting, setInspecting] = useState(false);
  const [importedToken, setImportedToken] = useState<SelectableToken | null>(null);
  const [inspectError, setInspectError] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) {
      setQuery('');
      setImportedToken(null);
      setInspectError(null);
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !account) return;
    let cancelled = false;
    async function loadBals() {
      const entries = await Promise.all(
        tokens.slice(0, 20).map(async (tok) => {
          if (tok.isNative) return [tok.address, nativeBalance] as const;
          const bal = await getTokenBalance(tok.address, account!, chainId);
          return [tok.address.toLowerCase(), bal] as const;
        })
      );
      if (!cancelled) {
        setBalances(Object.fromEntries(entries));
      }
    }
    loadBals();
    return () => {
      cancelled = true;
    };
  }, [open, account, tokens, chainId, nativeBalance, getTokenBalance]);

  useEffect(() => {
    const trimmed = query.trim();
    setImportedToken(null);
    setInspectError(null);
    if (!open || !isAddress(trimmed)) return;

    const alreadyListed = tokens.find(
      (t) => t.address.toLowerCase() === trimmed.toLowerCase()
    );
    if (alreadyListed) return;

    let cancelled = false;
    async function inspectCustom() {
      setInspecting(true);
      try {
        const res = await fetch('/api/tokens/inspect', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chainId, address: trimmed }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Not a valid ERC-20 contract on this chain.');
        if (!cancelled && data.metadata) {
          setImportedToken({
            address: data.metadata.address,
            symbol: data.metadata.symbol,
            name: data.metadata.name,
            decimals: data.metadata.decimals,
            verificationStatus: 'unverified',
          });
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setInspectError(err instanceof Error ? err.message : 'Unable to verify ERC-20 token.');
        }
      } finally {
        if (!cancelled) setInspecting(false);
      }
    }
    inspectCustom();
    return () => {
      cancelled = true;
    };
  }, [query, open, chainId, tokens]);

  if (!open) return null;

  const q = query.trim().toLowerCase();
  const filtered = tokens.filter((t) => {
    if (!q) return true;
    return (
      t.symbol.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.address.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl border border-white/10 bg-[#111622] p-5 shadow-2xl sm:rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">Select a token</h2>
            <p className="text-[11px] text-slate-400">
              {activeNetwork?.name} · Search or paste any ERC-20 contract address
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 hover:text-slate-100"
            aria-label="Close token selector"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search symbol or paste 0x... token address"
            className="w-full rounded-xl border border-white/10 bg-[#090C12] py-3 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
          />
        </div>

        {inspecting && (
          <div className="flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 px-3.5 py-2.5 text-xs text-blue-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Reading token metadata from {activeNetwork?.shortName} RPC...</span>
          </div>
        )}

        {inspectError && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2.5 text-xs text-red-300">
            {inspectError}
          </div>
        )}

        {importedToken && (
          <button
            type="button"
            onClick={() => {
              onSelect(importedToken);
              onClose();
            }}
            className="flex w-full items-center justify-between rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-3 text-left transition-colors hover:bg-emerald-500/20"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 font-mono text-xs font-bold text-emerald-300">
                {importedToken.symbol.slice(0, 3)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 font-semibold text-slate-100">
                  <span>{importedToken.symbol}</span>
                  <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                </div>
                <div className="truncate text-xs text-slate-400">
                  {importedToken.name} · Import contract
                </div>
              </div>
            </div>
            <span className="shrink-0 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-950">
              Import
            </span>
          </button>
        )}

        <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.05] pr-1">
          {filtered.length === 0 && !inspecting && !importedToken ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No matching indexed tokens. Paste the ERC-20 contract address above to import on-chain.
            </div>
          ) : (
            filtered.map((tok) => {
              const isDisabled =
                Boolean(excludeAddress) &&
                tok.address.toLowerCase() === excludeAddress?.toLowerCase();
              const bal = tok.isNative
                ? nativeBalance
                : balances[tok.address.toLowerCase()] || '0';
              return (
                <button
                  key={tok.address}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => {
                    onSelect(tok);
                    onClose();
                  }}
                  className="flex min-h-[56px] w-full items-center justify-between gap-3 px-2 py-2.5 text-left transition-colors hover:bg-white/[0.04] disabled:opacity-40"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-xs font-bold ${
                        tok.isNative
                          ? 'bg-gradient-to-br from-emerald-500/25 to-blue-500/25 text-emerald-300 border border-emerald-500/30'
                          : 'bg-[#171D2C] text-slate-200 border border-white/10'
                      }`}
                    >
                      {tok.symbol.slice(0, 3)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-100">
                        <span>{tok.symbol}</span>
                        {tok.verificationStatus === 'verified' && (
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                        )}
                      </div>
                      <div className="truncate text-xs text-slate-400">
                        {tok.name}
                        {!tok.isNative && (
                          <span className="ml-1.5 font-mono text-[10px] text-slate-500">
                            {tok.address.slice(0, 6)}...{tok.address.slice(-4)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {account && (
                      <div className="font-mono text-xs text-slate-200 tabular-nums">
                        {Number.parseFloat(bal).toFixed(4)}
                      </div>
                    )}
                    {isDisabled && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400">
                        <Check className="h-3 w-3" /> Selected
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export function toSelectableList(
  indexedTokens: IndexedToken[],
  nativeSymbol = 'POL'
): SelectableToken[] {
  return [
    {
      address: 'NATIVE',
      symbol: nativeSymbol,
      name: `${nativeSymbol} (Native Gas Token)`,
      decimals: 18,
      isNative: true,
      verificationStatus: 'verified',
    },
    ...indexedTokens.map((t) => ({
      address: t.address,
      symbol: t.symbol,
      name: t.name,
      decimals: t.decimals,
      isNative: false,
      verificationStatus: t.verificationStatus,
    })),
  ];
}
