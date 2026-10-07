import { createConfig, http } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { farcasterMiniApp } from '@farcaster/miniapp-wagmi-connector';
import { injected } from '@wagmi/core';

export const wagmiConfig = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    farcasterMiniApp(),
    injected(),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
});
