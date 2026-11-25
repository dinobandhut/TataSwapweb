import { createConfig, http } from 'wagmi';
import {
  arbitrum,
  base,
  bsc,
  mainnet,
  polygon,
  sepolia,
} from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { defineChain, type Chain } from 'viem';

export const tataService = defineChain({
  id: 810161,
  name: 'TataService Blockchain',
  nativeCurrency: {
    name: 'Tata',
    symbol: 'TATA',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://rpctata.duckdns.org/rpc'],
    },
  },
  blockExplorers: {
    default: {
      name: 'TataExplorer',
      url: 'https://exploretata.duckdns.org',
    },
  },
});

export const TATASWAP_CHAINS: readonly [Chain, ...Chain[]] = [
  tataService,
  polygon,
  bsc,
  mainnet,
  sepolia,
  base,
  arbitrum,
];

export function getViemChainById(chainId: number): Chain | undefined {
  return TATASWAP_CHAINS.find((c) => c.id === chainId);
}

export const wagmiConfig = createConfig({
  chains: TATASWAP_CHAINS,
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [tataService.id]: http('https://rpctata.duckdns.org/rpc'),
    [polygon.id]: http('https://polygon-bor-rpc.publicnode.com'),
    [bsc.id]: http('https://bsc-dataseed.bnbchain.org'),
    [mainnet.id]: http('https://ethereum-rpc.publicnode.com'),
    [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
    [base.id]: http('https://mainnet.base.org'),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
  },
});
