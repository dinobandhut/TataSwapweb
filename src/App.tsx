import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import { wagmiConfig } from './lib/wagmi';
import { Layout } from './components/Layout';
import type { PageRoute } from './types/dex';
import { HomeDashboardPage } from './pages/HomeDashboardPage';
import { SwapPage } from './pages/SwapPage';
import { ExploreTokensPage } from './pages/ExploreTokensPage';
import { TokenDetailsPage } from './pages/TokenDetailsPage';
import { CreateTokenListingPage } from './pages/CreateTokenListingPage';
import { CreatePoolPage } from './pages/CreatePoolPage';
import { AddLiquidityPage } from './pages/AddLiquidityPage';
import { RemoveLiquidityPage } from './pages/RemoveLiquidityPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { TransactionHistoryPage } from './pages/TransactionHistoryPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

const queryClient = new QueryClient();

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageRoute>('home');
  const [selectedToken, setSelectedToken] = useState<{
    chainId: number;
    address: string;
  } | null>(null);

  const handleSelectToken = (chainId: number, address: string) => {
    setSelectedToken({ chainId, address });
    setCurrentPage('token-details');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomeDashboardPage
            onNavigate={setCurrentPage}
            onSelectToken={handleSelectToken}
          />
        );
      case 'swap':
        return <SwapPage onNavigate={setCurrentPage} />;
      case 'explore':
        return (
          <ExploreTokensPage
            onSelectToken={handleSelectToken}
            onNavigate={setCurrentPage}
          />
        );
      case 'token-details':
        return (
          <TokenDetailsPage
            chainId={selectedToken?.chainId ?? 810161}
            address={
              selectedToken?.address ??
              '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd'
            }
            onBack={() => setCurrentPage('explore')}
            onNavigate={setCurrentPage}
          />
        );
      case 'list-token':
        return (
          <CreateTokenListingPage
            onNavigate={setCurrentPage}
            onSelectToken={handleSelectToken}
          />
        );
      case 'create-pool':
      case 'pool-explorer':
        return <CreatePoolPage onNavigate={setCurrentPage} />;
      case 'add-liquidity':
        return <AddLiquidityPage onNavigate={setCurrentPage} />;
      case 'remove-liquidity':
        return <RemoveLiquidityPage onNavigate={setCurrentPage} />;
      case 'portfolio':
        return (
          <PortfolioPage
            onNavigate={setCurrentPage}
            onSelectToken={handleSelectToken}
          />
        );
      case 'history':
        return <TransactionHistoryPage />;
      case 'analytics':
        return <AnalyticsPage />;
      case 'admin':
        return <AdminDashboardPage />;
      default:
        return (
          <HomeDashboardPage
            onNavigate={setCurrentPage}
            onSelectToken={handleSelectToken}
          />
        );
    }
  };

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <WalletProvider>
            <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
              {renderPage()}
            </Layout>
          </WalletProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
