import React, { useEffect, useState } from 'react';
import { ExternalLink, Globe2, Plus, RefreshCw, Search } from 'lucide-react';
import { isAddress } from 'ethers';
import { useWallet } from '../context/WalletContext';
import { useDexWebSocket } from '../hooks/useDexWebSocket';
import type { IndexedPool, PageRoute } from '../types/dex';

export function PoolExplorerPage({ onNavigate }: { onNavigate: (page: PageRoute) => void }) {
  const { selectedChainId, activeNetwork, networks } = useWallet();
  const [pools, setPools] = useState<IndexedPool[]>([]);
  const [search, setSearch] = useState('');
  const [chainFilter, setChainFilter] = useState<'active' | 'all'>('active');
  const [importAddr, setImportAddr] = useState('');
  const [importProto, setImportProto] = useState<'v3' | 'v2' | 'tataswap'>('v3');
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadPools = async () => {
    setLoading(true);
    try {
      const url =
        chainFilter === 'active' ? `/api/pools?chainId=${selectedChainId}` : '/api/pools';
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setPools(data.pools || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPools();
  }, [selectedChainId, chainFilter]);

  useDexWebSocket((ev) => {
    if (ev.type === 'pool:updated' || ev.type === 'swap:confirmed') {
      loadPools();
    }
  });

  const handleImportPool = async () => {
    setSyncError(null);
    if (!isAddress(importAddr)) {
      setSyncError('Enter a valid pool contract address (0x...).');
      return;
    }
    setSyncing(true);
    try {
      const res = await fetch('/api/pools/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chainId: selectedChainId,
          pairAddress: importAddr.trim(),
          protocolVersion: importProto,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to inspect pool on-chain');
      setImportAddr('');
      await loadPools();
    } catch (err: unknown) {
      setSyncError(err instanceof Error ? err.message : 'Pool sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const filtered = pools.filter((p) => {
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    return (
      p.token0Symbol.toLowerCase().includes(q) ||
      p.token1Symbol.toLowerCase().includes(q) ||
      p.pairAddress.toLowerCase().includes(q)
    );
  });

  const getNetworkShort = (cid: number) =>
    networks.find((n) => n.chainId === cid)?.shortName || `Chain ${cid}`;

  const getExplorerUrl = (cid: number) =>
    networks.find((n) => n.chainId === cid)?.explorerUrl || activeNetwork?.explorerUrl || '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Pool Explorer</h1>
          <p className="text-sm text-slate-400">
            Browse and sync real on-chain V3, V2, and TataSwap liquidity pools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('create-pool')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-blue-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:from-emerald-400 hover:to-blue-400 whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Pool
          </button>
        </div>
      </div>

      {/* Import Existing On-Chain Pool */}
      <div className="rounded-xl border border-white/[0.08] bg-[#111622] p-4 space-y-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <input
            type="text"
            value={importAddr}
            onChange={(e) => setImportAddr(e.target.value)}
            placeholder={`Index existing ${activeNetwork?.shortName || ''} pool address (0x...)`}
            className="flex-1 rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 font-mono text-xs text-slate-100 placeholder-slate-500"
          />
          <select
            value={importProto}
            onChange={(e) => setImportProto(e.target.value as 'v3' | 'v2' | 'tataswap')}
            className="rounded-lg border border-white/10 bg-[#171D2C] px-3 py-2 text-xs text-slate-200"
          >
            <option value="v3">V3 Pool</option>
            <option value="v2">V2 Pair</option>
            <option value="tataswap">TataSwap Pool</option>
          </select>
          <button
            type="button"
            disabled={syncing}
            onClick={handleImportPool}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/35 bg-blue-500/15 px-4 py-2 text-xs font-semibold text-blue-300 hover:bg-blue-500/25 disabled:opacity-50 whitespace-nowrap"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing RPC...' : 'Sync Pool from Chain'}
          </button>
        </div>
        {syncError && <div className="text-xs text-red-400">{syncError}</div>}
      </div>

      {/* Search & Network Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by token pair (e.g. WPOL, USDC) or 0x pool address..."
            className="w-full rounded-lg border border-white/10 bg-[#111622] py-2.5 pl-9 pr-3 text-sm text-slate-100 placeholder-slate-500 focus:border-blue-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 rounded-lg border border-white/[0.08] bg-[#111622] p-1 text-xs">
          <button
            type="button"
            onClick={() => setChainFilter('active')}
            className={`rounded-md px-3 py-1.5 font-medium ${
              chainFilter === 'active'
                ? 'bg-emerald-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            {activeNetwork?.shortName || 'Current Network'}
          </button>
          <button
            type="button"
            onClick={() => setChainFilter('all')}
            className={`rounded-md px-3 py-1.5 font-medium ${
              chainFilter === 'all'
                ? 'bg-blue-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            All Networks
          </button>
        </div>
      </div>

      {/* Pools Table */}
      <div className="rounded-xl border border-white/[0.08] bg-[#111622] overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-400">
            Loading indexed pools...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center space-y-2 text-sm text-slate-400">
            <Globe2 className="mx-auto h-7 w-7 text-blue-400" />
            <div>No indexed pools found matching your filter.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/[0.07] text-slate-500">
                  <th className="px-4 py-3 font-medium">Token Pair</th>
                  <th className="px-4 py-3 font-medium">Network</th>
                  <th className="px-4 py-3 font-medium">AMM / Fee</th>
                  <th className="px-4 py-3 text-right font-medium">Reserves / TVL</th>
                  <th className="px-4 py-3 text-right font-medium">Current Price</th>
                  <th className="px-4 py-3 text-right font-medium">Volume (Indexed)</th>
                  <th className="px-4 py-3 text-right font-medium">Tx Count</th>
                  <th className="px-4 py-3 text-right font-medium">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filtered.map((pool) => {
                  const exp = getExplorerUrl(pool.chainId);
                  return (
                    <tr key={pool.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-100">
                          {pool.token0Symbol} / {pool.token1Symbol}
                        </div>
                        <a
                          href={exp ? `${exp}/address/${pool.pairAddress}` : '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[11px] text-blue-400 hover:underline tabular-nums"
                        >
                          {pool.pairAddress.slice(0, 8)}...{pool.pairAddress.slice(-6)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                      <td className="px-4 py-3.5 text-slate-300">
                        {getNetworkShort(pool.chainId)}
                      </td>
                      <td className="px-4 py-3.5 font-mono text-emerald-400 uppercase tabular-nums">
                        {pool.protocolVersion || 'v3'} · {(pool.feeTierBps / 100).toFixed(2)}%
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-200 tabular-nums">
                        <div>
                          {Number.parseFloat(pool.reserve0).toFixed(4)} {pool.token0Symbol}
                        </div>
                        <div className="text-slate-400">
                          {Number.parseFloat(pool.reserve1).toFixed(4)} {pool.token1Symbol}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-100 tabular-nums">
                        {pool.currentPrice || '—'}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-blue-300 tabular-nums">
                        {Number.parseFloat(pool.volume24h || '0').toFixed(4)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-300 tabular-nums">
                        {pool.txCount}
                      </td>
                      <td className="px-4 py-3.5 text-right text-slate-400 tabular-nums">
                        {new Date(pool.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
