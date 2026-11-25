import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  LogIn,
  LogOut,
  PauseCircle,
  PlayCircle,
  Rocket,
  ShieldAlert,
} from 'lucide-react';
import { Contract, ContractFactory, isAddress, parseUnits, type InterfaceAbi } from 'ethers';
import { OWNER_ADMIN_EMAIL, useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { ERC20_ABI, FEE_MANAGER_ABI, LISTING_FEE_ABI } from '../lib/abis';
import { CONTRACT_ARTIFACTS } from '../lib/contractArtifacts';
import type { IndexedToken, NetworkConfig } from '../types/dex';

interface AdminOverview {
  operatorEmail: string;
  officialFeeReceiver: string;
  metrics: {
    totalListedTokens: number;
    totalPools: number;
    totalTransactions: number;
    totalSwaps: number;
    totalListingFeesCollected: string;
  };
  networks: NetworkConfig[];
}

export function AdminDashboardPage() {
  const { user, isAdmin, signingIn, authError, signInWithGoogle, logout, getIdToken } = useAuth();
  const {
    account,
    walletChainId,
    selectedChainId,
    switchNetwork,
    refreshNetworks,
    refreshProtocolStatus,
    getBrowserProvider,
    signMessage,
    setWalletModalOpen,
  } = useWallet();

  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [tokens, setTokens] = useState<IndexedToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editable config for selected network
  const [editChainId, setEditChainId] = useState<number>(selectedChainId);
  const [rpcUrl, setRpcUrl] = useState('');
  const [explorerUrl, setExplorerUrl] = useState('');
  const [wrappedNativeAddr, setWrappedNativeAddr] = useState('');
  const [usdtAddr, setUsdtAddr] = useState('');
  const [factoryAddr, setFactoryAddr] = useState('');
  const [routerAddr, setRouterAddr] = useState('');
  const [listingFeeAddr, setListingFeeAddr] = useState('');
  const [feeManagerAddr, setFeeManagerAddr] = useState('');
  const [listingFeeUsdt, setListingFeeUsdt] = useState('5');
  const [feeReceiver, setFeeReceiver] = useState('0xD9e5c5d0522B1eeE8Ff9bC006F64d53d2C411CA4');
  const [swapFeeBps, setSwapFeeBps] = useState(30);
  const [protocolFeeBps, setProtocolFeeBps] = useState(5);
  const [isEnabled, setIsEnabled] = useState(true);
  const [isDeployingContracts, setIsDeployingContracts] = useState(false);
  const [deployStatus, setDeployStatus] = useState<string | null>(null);

  const loadAdminData = async () => {
    const token = await getIdToken();
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const [ovRes, tokRes] = await Promise.all([
        fetch('/api/admin/overview', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/tokens'),
      ]);
      if (!ovRes.ok) {
        const d = await ovRes.json();
        throw new Error(d.error || 'Failed to load admin overview');
      }
      const ovData: AdminOverview = await ovRes.json();
      setOverview(ovData);

      const targetNet =
        ovData.networks.find((n) => n.chainId === editChainId) || ovData.networks[0];
      if (targetNet) {
        setEditChainId(targetNet.chainId);
        setRpcUrl(targetNet.rpcUrl);
        setExplorerUrl(targetNet.explorerUrl);
        setWrappedNativeAddr(targetNet.wrappedNativeAddress);
        setUsdtAddr(targetNet.usdtAddress);
        setFactoryAddr(targetNet.factoryAddress);
        setRouterAddr(targetNet.routerAddress);
        setListingFeeAddr(targetNet.listingFeeContract);
        setFeeManagerAddr(targetNet.feeManagerContract);
        setListingFeeUsdt(targetNet.listingFeeUsdt);
        setFeeReceiver(targetNet.feeReceiverWallet);
        setSwapFeeBps(targetNet.swapFeeBps);
        setProtocolFeeBps(targetNet.protocolFeeBps);
        setIsEnabled(targetNet.isEnabled);
      }

      if (tokRes.ok) {
        const tData = await tokRes.json();
        setTokens(tData.tokens || []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadAdminData();
    }
  }, [user, isAdmin]);

  const handleSelectEditChain = (cid: number) => {
    setEditChainId(cid);
    const targetNet = overview?.networks.find((n) => n.chainId === cid);
    if (targetNet) {
      setRpcUrl(targetNet.rpcUrl);
      setExplorerUrl(targetNet.explorerUrl);
      setWrappedNativeAddr(targetNet.wrappedNativeAddress);
      setUsdtAddr(targetNet.usdtAddress);
      setFactoryAddr(targetNet.factoryAddress);
      setRouterAddr(targetNet.routerAddress);
      setListingFeeAddr(targetNet.listingFeeContract);
      setFeeManagerAddr(targetNet.feeManagerContract);
      setListingFeeUsdt(targetNet.listingFeeUsdt);
      setFeeReceiver(targetNet.feeReceiverWallet);
      setSwapFeeBps(targetNet.swapFeeBps);
      setProtocolFeeBps(targetNet.protocolFeeBps);
      setIsEnabled(targetNet.isEnabled);
    }
  };

  const handleSaveConfig = async (applyOnChain: boolean) => {
    setError(null);
    setSuccess(null);

    if (!account) {
      setWalletModalOpen(true);
      return;
    }
    if (!isAddress(feeReceiver)) {
      setError('Enter a valid fee receiver EVM address.');
      return;
    }

    try {
      const idToken = await getIdToken();
      if (!idToken) throw new Error('Sign in with Google to authorize admin actions.');

      let onChainTxHash = '';

      if (applyOnChain) {
        const browserProvider = getBrowserProvider();
        if (!browserProvider) throw new Error('Connect owner wallet first.');
        const signer = await browserProvider.getSigner();

        if (listingFeeAddr && isAddress(listingFeeAddr)) {
          const listingContract = new Contract(listingFeeAddr, LISTING_FEE_ABI, signer);
          const feeTx = await listingContract.setListingFee(parseUnits(listingFeeUsdt || '5', 18));
          const r1 = await feeTx.wait();
          onChainTxHash = r1.hash;

          const recTx = await listingContract.setFeeReceiverWallet(feeReceiver);
          await recTx.wait();
        }
        if (feeManagerAddr && isAddress(feeManagerAddr)) {
          const fm = new Contract(feeManagerAddr, FEE_MANAGER_ABI, signer);
          const fmTx = await fm.setProtocolFeeReceiver(feeReceiver);
          await fmTx.wait();
          const bpsTx = await fm.setSwapFees(swapFeeBps, protocolFeeBps);
          await bpsTx.wait();
        }
      }

      const signedMessage = `TataSwap Admin Config Update | Chain ${editChainId} | Fee ${listingFeeUsdt} USDT | Receiver ${feeReceiver} | Timestamp ${Date.now()}`;
      const signature = await signMessage(signedMessage);

      const res = await fetch('/api/admin/network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          chainId: editChainId,
          walletAddress: account,
          signature,
          signedMessage,
          isEnabled,
          rpcUrl: rpcUrl.trim(),
          explorerUrl: explorerUrl.trim(),
          wrappedNativeAddress: wrappedNativeAddr.trim(),
          usdtAddress: usdtAddr.trim(),
          acceptedPaymentToken: usdtAddr.trim() || undefined,
          factoryAddress: factoryAddr.trim(),
          routerAddress: routerAddr.trim(),
          listingFeeContract: listingFeeAddr.trim(),
          feeManagerContract: feeManagerAddr.trim(),
          listingFeeUsdt,
          feeReceiverWallet: feeReceiver,
          swapFeeBps,
          protocolFeeBps,
          txHash: onChainTxHash,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save network config.');

      await refreshNetworks();
      await refreshProtocolStatus(true);
      await loadAdminData();
      setSuccess(
        applyOnChain
          ? 'Smart contract parameters updated on-chain and synced to backend.'
          : 'Network contract configuration saved and signed.'
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Admin update failed.');
    }
  };

  const handleDeployContracts = async () => {
    setError(null);
    setSuccess(null);

    if (!account) {
      setWalletModalOpen(true);
      return;
    }
    if (!isAddress(feeReceiver)) {
      setError('Enter a valid Fee Receiving Wallet Address before deploying contracts.');
      return;
    }

    const targetNetwork = overview?.networks.find((n) => n.chainId === editChainId);
    const nativeSym = targetNetwork?.nativeSymbol || 'TATA';
    const wrappedName = `Wrapped ${nativeSym}`;
    const wrappedSymbol = nativeSym.startsWith('W') ? nativeSym : `W${nativeSym}`;

    setIsDeployingContracts(true);
    setDeployStatus('Checking connected wallet network...');

    try {
      const idToken = await getIdToken();
      if (!idToken) {
        throw new Error('Sign in with Google to authorize admin deployment.');
      }

      if (walletChainId !== editChainId) {
        setDeployStatus(`Switching wallet to ${targetNetwork?.name || `Chain ${editChainId}`}...`);
        await switchNetwork(editChainId);
      }

      const browserProvider = getBrowserProvider();
      if (!browserProvider) {
        throw new Error('Connect your Web3 wallet (MetaMask or Trust Wallet) first.');
      }
      const networkInfo = await browserProvider.getNetwork();
      if (Number(networkInfo.chainId) !== editChainId) {
        throw new Error(
          `Please switch your wallet to ${targetNetwork?.name || `Chain ${editChainId}`} (${editChainId}) before deploying.`
        );
      }

      const signer = await browserProvider.getSigner();

      let nextWrapped = wrappedNativeAddr.trim();
      let nextUsdt = usdtAddr.trim();
      let nextFeeManager = feeManagerAddr.trim();
      let nextFactory = factoryAddr.trim();
      let nextRouter = routerAddr.trim();
      let nextListingFee = listingFeeAddr.trim();
      let lastTxHash = '';

      if (!isAddress(nextWrapped)) {
        setDeployStatus(`1/6 Deploying ${wrappedSymbol} (${wrappedName})... Confirm in wallet`);
        const f = new ContractFactory(
          CONTRACT_ARTIFACTS.WrappedNative.abi as InterfaceAbi,
          CONTRACT_ARTIFACTS.WrappedNative.bytecode,
          signer
        );
        const c = await f.deploy(wrappedName, wrappedSymbol);
        lastTxHash = c.deploymentTransaction()?.hash || lastTxHash;
        await c.waitForDeployment();
        nextWrapped = await c.getAddress();
        setWrappedNativeAddr(nextWrapped);
      }

      if (!isAddress(nextUsdt)) {
        setDeployStatus('2/6 Deploying USDT payment token... Confirm in wallet');
        const f = new ContractFactory(
          CONTRACT_ARTIFACTS.MockERC20.abi as InterfaceAbi,
          CONTRACT_ARTIFACTS.MockERC20.bytecode,
          signer
        );
        const c = await f.deploy('Tether USD', 'USDT', 18, parseUnits('1000000', 18));
        lastTxHash = c.deploymentTransaction()?.hash || lastTxHash;
        await c.waitForDeployment();
        nextUsdt = await c.getAddress();
        setUsdtAddr(nextUsdt);
      }

      if (!isAddress(nextFeeManager)) {
        setDeployStatus('3/6 Deploying TataSwapFeeManager... Confirm in wallet');
        const f = new ContractFactory(
          CONTRACT_ARTIFACTS.TataSwapFeeManager.abi as InterfaceAbi,
          CONTRACT_ARTIFACTS.TataSwapFeeManager.bytecode,
          signer
        );
        const c = await f.deploy(account, feeReceiver, BigInt(swapFeeBps), BigInt(protocolFeeBps));
        lastTxHash = c.deploymentTransaction()?.hash || lastTxHash;
        await c.waitForDeployment();
        nextFeeManager = await c.getAddress();
        setFeeManagerAddr(nextFeeManager);
      }

      if (!isAddress(nextFactory)) {
        setDeployStatus('4/6 Deploying TataSwapFactory... Confirm in wallet');
        const f = new ContractFactory(
          CONTRACT_ARTIFACTS.TataSwapFactory.abi as InterfaceAbi,
          CONTRACT_ARTIFACTS.TataSwapFactory.bytecode,
          signer
        );
        const c = await f.deploy(account, nextFeeManager);
        lastTxHash = c.deploymentTransaction()?.hash || lastTxHash;
        await c.waitForDeployment();
        nextFactory = await c.getAddress();
        setFactoryAddr(nextFactory);
      }

      if (!isAddress(nextRouter)) {
        setDeployStatus('5/6 Deploying TataSwapRouter... Confirm in wallet');
        const f = new ContractFactory(
          CONTRACT_ARTIFACTS.TataSwapRouter.abi as InterfaceAbi,
          CONTRACT_ARTIFACTS.TataSwapRouter.bytecode,
          signer
        );
        const c = await f.deploy(nextFactory, nextWrapped, nextFeeManager);
        lastTxHash = c.deploymentTransaction()?.hash || lastTxHash;
        await c.waitForDeployment();
        nextRouter = await c.getAddress();
        setRouterAddr(nextRouter);
      }

      if (!isAddress(nextListingFee)) {
        setDeployStatus('6/6 Deploying TataSwapListingFee... Confirm in wallet');
        let usdtDecimals = 18;
        try {
          const usdtContract = new Contract(nextUsdt, ERC20_ABI, browserProvider);
          usdtDecimals = Number(await usdtContract.decimals());
        } catch {
          usdtDecimals = 18;
        }
        const feeAmount = parseUnits(listingFeeUsdt || '5', usdtDecimals);
        const f = new ContractFactory(
          CONTRACT_ARTIFACTS.TataSwapListingFee.abi as InterfaceAbi,
          CONTRACT_ARTIFACTS.TataSwapListingFee.bytecode,
          signer
        );
        const c = await f.deploy(account, feeReceiver, nextUsdt, feeAmount, nextFactory);
        lastTxHash = c.deploymentTransaction()?.hash || lastTxHash;
        await c.waitForDeployment();
        nextListingFee = await c.getAddress();
        setListingFeeAddr(nextListingFee);
      }

      setDeployStatus('Signing & saving deployed addresses to backend...');
      const signedMessage = `TataSwap Admin Config Update | Chain ${editChainId} | Fee ${listingFeeUsdt} USDT | Receiver ${feeReceiver} | Timestamp ${Date.now()}`;
      const signature = await signMessage(signedMessage);

      const res = await fetch('/api/admin/network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          chainId: editChainId,
          walletAddress: account,
          signature,
          signedMessage,
          isEnabled: true,
          rpcUrl: rpcUrl.trim(),
          explorerUrl: explorerUrl.trim(),
          wrappedNativeAddress: nextWrapped,
          usdtAddress: nextUsdt,
          acceptedPaymentToken: nextUsdt,
          factoryAddress: nextFactory,
          routerAddress: nextRouter,
          listingFeeContract: nextListingFee,
          feeManagerContract: nextFeeManager,
          listingFeeUsdt,
          feeReceiverWallet: feeReceiver,
          swapFeeBps,
          protocolFeeBps,
          txHash: lastTxHash,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Deployed on-chain, but failed to save addresses. Click Save & Sign Config.');
      }

      await refreshNetworks();
      await refreshProtocolStatus(true);
      await loadAdminData();
      setSuccess(
        `All 6 smart contracts are live on ${targetNetwork?.name || `Chain ${editChainId}`} and saved!`
      );
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'Contract deployment cancelled or failed. Any already-deployed addresses remain filled below.'
      );
    } finally {
      setIsDeployingContracts(false);
      setDeployStatus(null);
    }
  };

  const handleEmergencyPause = async (pause: boolean) => {
    setError(null);
    setSuccess(null);
    if (!account) {
      setWalletModalOpen(true);
      return;
    }

    try {
      const idToken = await getIdToken();
      if (!idToken) throw new Error('Sign in with Google first.');
      const browserProvider = getBrowserProvider();
      if (!browserProvider) throw new Error('Connect owner wallet first.');

      let txHash = '';
      const signer = await browserProvider.getSigner();

      if (listingFeeAddr && isAddress(listingFeeAddr)) {
        const lc = new Contract(listingFeeAddr, LISTING_FEE_ABI, signer);
        const tx = pause ? await lc.pause() : await lc.unpause();
        const r = await tx.wait();
        txHash = r.hash;
      }
      if (feeManagerAddr && isAddress(feeManagerAddr)) {
        const fm = new Contract(feeManagerAddr, FEE_MANAGER_ABI, signer);
        const tx = pause ? await fm.pause() : await fm.unpause();
        const r = await tx.wait();
        if (!txHash) txHash = r.hash;
      }

      const signedMessage = `TataSwap Emergency ${pause ? 'PAUSE' : 'UNPAUSE'} | Chain ${editChainId} | ${Date.now()}`;
      const signature = await signMessage(signedMessage);

      await fetch('/api/admin/network', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          chainId: editChainId,
          walletAddress: account,
          signature,
          signedMessage,
          isPaused: pause,
          txHash,
        }),
      });

      await refreshNetworks();
      await loadAdminData();
      setSuccess(pause ? 'Platform contracts paused.' : 'Platform contracts unpaused.');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Emergency pause action failed.');
    }
  };

  const handleUpdateTokenLabel = async (
    chainId: number,
    tokenAddress: string,
    verificationStatus: 'verified' | 'unverified' | 'flagged'
  ) => {
    setError(null);
    setSuccess(null);
    if (!account) {
      setWalletModalOpen(true);
      return;
    }
    try {
      const idToken = await getIdToken();
      if (!idToken) throw new Error('Sign in with Google first.');
      const signedMessage = `TataSwap Token Label | ${tokenAddress} -> ${verificationStatus} | ${Date.now()}`;
      const signature = await signMessage(signedMessage);

      const res = await fetch('/api/admin/token-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          chainId,
          tokenAddress,
          verificationStatus,
          walletAddress: account,
          signature,
          signedMessage,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || 'Failed to update token label.');
      }
      await loadAdminData();
      setSuccess(`Token verification label updated to ${verificationStatus}.`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update verification label.');
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-white/[0.08] bg-[#111622] p-8 text-center space-y-4">
        <ShieldAlert className="mx-auto h-9 w-9 text-emerald-400" />
        <h1 className="text-xl font-bold text-slate-100">TataSwap Owner Admin Console</h1>
        <p className="text-sm text-slate-400">
          Admin actions are locked to the authorized owner email ({OWNER_ADMIN_EMAIL}) plus an EIP-191 signature from the DEX owner wallet. Owner controls only govern fee parameters, contract pause state, and verification labels—never user wallets or LP assets.
        </p>
        {authError && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-left text-xs text-amber-200">
            {authError}
          </div>
        )}
        <button
          type="button"
          disabled={signingIn}
          onClick={() => void signInWithGoogle()}
          className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {signingIn ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              Sign in with Google
            </>
          )}
        </button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-red-500/20 bg-[#111622] p-8 text-center space-y-4">
        <ShieldAlert className="mx-auto h-9 w-9 text-red-400" />
        <h1 className="text-xl font-bold text-slate-100">Access Denied</h1>
        <p className="text-sm text-slate-400">
          Signed in as <span className="font-mono text-slate-200">{user.email}</span>. Admin Dashboard access is strictly locked to{' '}
          <span className="font-mono text-emerald-400">{OWNER_ADMIN_EMAIL}</span>.
        </p>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-5 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/5"
        >
          <LogOut className="h-4 w-4" />
          Sign Out &amp; Switch Account
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Admin Dashboard</h1>
          <p className="text-xs text-slate-400">
            Operator: {user.email} · Official Fee Wallet:{' '}
            <span className="font-mono text-emerald-400">
              0xD9e5c5d0522B1eeE8Ff9bC006F64d53d2C411CA4
            </span>
          </p>
        </div>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 self-start sm:self-auto"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
      </div>

      {/* Non-custodial Governance Disclosure */}
      <div className="flex items-start gap-2.5 rounded-xl border border-white/[0.08] bg-[#111622] p-4 text-xs text-slate-300">
        <AlertTriangle className="mt-0.5 h-4 w-4 text-amber-400 shrink-0" />
        <div>
          <span className="font-semibold text-slate-100">Non-Custodial Boundary: </span>
          Smart contracts enforce <span className="font-mono">Ownable2Step</span> strictly for fee parameters, emergency pause, and verification labels. The DEX owner cannot move user wallet funds or withdraw liquidity pool reserves.
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Overview KPIs */}
      <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-white/[0.08] bg-[#111622] p-5">
          <div className="text-xs text-slate-400">Total Listed Tokens</div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-100 tabular-nums">
            {loading ? '—' : overview?.metrics.totalListedTokens ?? 0}
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-[#111622] p-5">
          <div className="text-xs text-slate-400">Total Liquidity Pools</div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-100 tabular-nums">
            {loading ? '—' : overview?.metrics.totalPools ?? 0}
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-[#111622] p-5">
          <div className="text-xs text-slate-400">Total Swap Transactions</div>
          <div className="mt-2 font-mono text-2xl font-bold text-slate-100 tabular-nums">
            {loading ? '—' : overview?.metrics.totalSwaps ?? 0}
          </div>
        </div>
        <div className="rounded-xl border border-white/[0.08] bg-[#111622] p-5">
          <div className="text-xs text-slate-400">Listing Fees Collected</div>
          <div className="mt-2 font-mono text-2xl font-bold text-emerald-400 tabular-nums">
            {loading ? '—' : `${overview?.metrics.totalListingFeesCollected ?? '0.0000'} USDT`}
          </div>
        </div>
      </section>

      {/* Network & Contract Configuration */}
      <section className="rounded-xl border border-white/[0.08] bg-[#111622] p-6 space-y-5">
        <div className="flex flex-col gap-3 border-b border-white/[0.07] pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              Network Contracts, Listing Fee &amp; Emergency Controls
            </h2>
            <p className="text-xs text-slate-400">
              Configure deployed Hardhat addresses and on-chain fee parameters per network
            </p>
          </div>
          <select
            value={editChainId}
            onChange={(e) => handleSelectEditChain(Number(e.target.value))}
            className="rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 text-xs text-slate-100"
          >
            {(overview?.networks || []).map((n) => (
              <option key={n.chainId} value={n.chainId}>
                {n.name} ({n.chainId})
              </option>
            ))}
          </select>
        </div>

        {/* One-Click Wallet Contract Deployer */}
        {(() => {
          const activeTargetNet = overview?.networks.find((n) => n.chainId === editChainId);
          const nativeSym = activeTargetNet?.nativeSymbol || 'TATA';
          const wrappedSym = nativeSym.startsWith('W') ? nativeSym : `W${nativeSym}`;
          const missingCount = [
            wrappedNativeAddr,
            usdtAddr,
            feeManagerAddr,
            factoryAddr,
            routerAddr,
            listingFeeAddr,
          ].filter((addr) => !isAddress(addr.trim())).length;

          return (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
                    <Rocket className="h-4 w-4 shrink-0" />
                    <span>Deploy DEX Contracts Directly From Your Wallet</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    {missingCount === 0
                      ? `All 6 contracts are configured for ${activeTargetNet?.name || `Chain ${editChainId}`}.`
                      : `${missingCount} of 6 contract addresses are missing. Connect your wallet with ${nativeSym} for gas to deploy missing contracts automatically (existing addresses are kept).`}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isDeployingContracts || missingCount === 0}
                  onClick={handleDeployContracts}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isDeployingContracts ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Deploying...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      <span>
                        {missingCount === 0
                          ? 'All Contracts Ready'
                          : !account
                          ? 'Connect Wallet to Deploy'
                          : `Deploy ${missingCount} Missing Contracts`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-3 lg:grid-cols-6">
                {[
                  { label: wrappedSym, val: wrappedNativeAddr },
                  { label: 'USDT', val: usdtAddr },
                  { label: 'FeeManager', val: feeManagerAddr },
                  { label: 'Factory', val: factoryAddr },
                  { label: 'Router', val: routerAddr },
                  { label: 'ListingFee', val: listingFeeAddr },
                ].map((item) => {
                  const ok = isAddress(item.val.trim());
                  return (
                    <div
                      key={item.label}
                      className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 ${
                        ok
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                          : 'border-amber-500/25 bg-amber-500/10 text-amber-300'
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${
                          ok ? 'bg-emerald-400' : 'bg-amber-400'
                        }`}
                      />
                      <span className="truncate font-medium">{item.label}</span>
                    </div>
                  );
                })}
              </div>

              {deployStatus && (
                <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-[#090C12] px-3 py-2 text-xs text-emerald-300">
                  <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
                  <span>{deployStatus}</span>
                </div>
              )}
            </div>
          );
        })()}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Network RPC URL</label>
            <input
              type="text"
              value={rpcUrl}
              onChange={(e) => setRpcUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 font-mono text-xs text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Block Explorer URL</label>
            <input
              type="text"
              value={explorerUrl}
              onChange={(e) => setExplorerUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 font-mono text-xs text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Wrapped Native Token (WTATA / WETH)</label>
            <input
              type="text"
              value={wrappedNativeAddr}
              onChange={(e) => setWrappedNativeAddr(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 font-mono text-xs text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Listing Fee Payment Token (USDT)</label>
            <input
              type="text"
              value={usdtAddr}
              onChange={(e) => setUsdtAddr(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 font-mono text-xs text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">TataSwapFactory Address</label>
            <input
              type="text"
              value={factoryAddr}
              onChange={(e) => setFactoryAddr(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 font-mono text-xs text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">TataSwapRouter Address</label>
            <input
              type="text"
              value={routerAddr}
              onChange={(e) => setRouterAddr(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 font-mono text-xs text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">TataSwapListingFee Address</label>
            <input
              type="text"
              value={listingFeeAddr}
              onChange={(e) => setListingFeeAddr(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 font-mono text-xs text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">TataSwapFeeManager Address</label>
            <input
              type="text"
              value={feeManagerAddr}
              onChange={(e) => setFeeManagerAddr(e.target.value)}
              placeholder="0x..."
              className="w-full rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 font-mono text-xs text-slate-100"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div className="space-y-1.5 sm:col-span-2">
            <label className="text-xs text-slate-400">Fee Receiving Wallet Address</label>
            <input
              type="text"
              value={feeReceiver}
              onChange={(e) => setFeeReceiver(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 font-mono text-xs text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Listing Fee (USDT)</label>
            <input
              type="number"
              min="0"
              step="0.1"
              value={listingFeeUsdt}
              onChange={(e) => setListingFeeUsdt(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 font-mono text-xs text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Network Status</label>
            <select
              value={isEnabled ? 'enabled' : 'disabled'}
              onChange={(e) => setIsEnabled(e.target.value === 'enabled')}
              className="w-full rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 text-xs text-slate-100"
            >
              <option value="enabled">Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Total Swap Fee (bps, max 100 = 1.00%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={swapFeeBps}
              onChange={(e) => setSwapFeeBps(Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 font-mono text-xs text-slate-100"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-slate-400">Protocol Fee Share (bps)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={protocolFeeBps}
              onChange={(e) => setProtocolFeeBps(Number(e.target.value))}
              className="w-full rounded-lg border border-white/10 bg-[#090C12] px-3 py-2 font-mono text-xs text-slate-100"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleSaveConfig(false)}
            className="rounded-lg bg-emerald-500 px-4 py-2.5 text-xs font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Save &amp; Sign Config
          </button>
          <button
            type="button"
            onClick={() => handleSaveConfig(true)}
            className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20"
          >
            Push Fee Config On-Chain + Sync
          </button>
          <button
            type="button"
            onClick={() => handleEmergencyPause(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs font-medium text-red-300 hover:bg-red-500/20"
          >
            <PauseCircle className="h-4 w-4" />
            Emergency Pause
          </button>
          <button
            type="button"
            onClick={() => handleEmergencyPause(false)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-200 hover:bg-white/5"
          >
            <PlayCircle className="h-4 w-4" />
            Unpause Contracts
          </button>
        </div>
      </section>

      {/* Token Verification Labels */}
      <section className="rounded-xl border border-white/[0.08] bg-[#111622] p-6">
        <h2 className="text-base font-semibold text-slate-100 border-b border-white/[0.07] pb-3">
          Manage Token Verification Labels
        </h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-500">
                <th className="py-2.5 font-medium">Token</th>
                <th className="py-2.5 font-medium">Contract</th>
                <th className="py-2.5 font-medium">Current Label</th>
                <th className="py-2.5 text-right font-medium">Set Label</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.05]">
              {tokens.map((tok) => (
                <tr key={tok.id}>
                  <td className="py-3 font-medium text-slate-100">
                    {tok.symbol} · {tok.name}
                  </td>
                  <td className="py-3 font-mono text-slate-400 tabular-nums">
                    {tok.address.slice(0, 10)}...{tok.address.slice(-6)}
                  </td>
                  <td className="py-3 capitalize text-slate-300">{tok.verificationStatus}</td>
                  <td className="py-3 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleUpdateTokenLabel(tok.chainId, tok.address, 'verified')}
                      className="text-emerald-400 hover:underline"
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateTokenLabel(tok.chainId, tok.address, 'unverified')}
                      className="text-amber-400 hover:underline"
                    >
                      Unverify
                    </button>
                    <button
                      type="button"
                      onClick={() => handleUpdateTokenLabel(tok.chainId, tok.address, 'flagged')}
                      className="text-red-400 hover:underline"
                    >
                      Flag Risk
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
