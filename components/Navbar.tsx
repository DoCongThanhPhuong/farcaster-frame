'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Bookmark, Wallet, LogOut, Sparkles } from 'lucide-react';
import sdk from '@farcaster/frame-sdk';
import { useState } from 'react';

interface NavbarProps {
  user: {
    fid?: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  } | null;
  isInMiniApp: boolean;
}

export function Navbar({ user, isInMiniApp }: NavbarProps) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [pinned, setPinned] = useState(false);

  const handleAddMiniApp = async () => {
    try {
      const pinAction = (sdk.actions as any).addFrame || (sdk.actions as any).addMiniApp;
      if (pinAction) {
        await pinAction.call(sdk.actions);
        setPinned(true);
      }
    } catch (err) {
      console.warn('Failed to pin app:', err);
    }
  };

  const handleConnectWallet = () => {
    if (isConnected) {
      disconnect();
      return;
    }
    // Prefer farcaster mini app connector if available
    const fcConnector = connectors.find((c) => c.name.toLowerCase().includes('farcaster'));
    const connectorToUse = fcConnector || connectors[0];
    if (connectorToUse) {
      connect({ connector: connectorToUse });
    }
  };

  return (
    <header className="w-full border-b border-gray-800 bg-[#12131c]/90 backdrop-blur sticky top-0 z-50 px-4 py-3">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#855DCD] to-[#0052FF] flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">FARCAST</span>
              <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">
                AIRDROP
              </span>
            </div>
            <p className="text-[11px] text-gray-400">Mini App v2 • Base L2</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isInMiniApp && (
            <button
              onClick={handleAddMiniApp}
              disabled={pinned}
              className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1 transition ${
                pinned
                  ? 'border-green-600/50 bg-green-950/40 text-green-300'
                  : 'border-purple-600/40 bg-purple-950/30 hover:bg-purple-900/40 text-purple-300'
              }`}
              title="Pin to Warpcast"
            >
              <Bookmark className="w-4 h-4" />
              <span className="hidden sm:inline">{pinned ? 'Pinned' : 'Pin App'}</span>
            </button>
          )}

          <button
            onClick={handleConnectWallet}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
              isConnected
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
                : 'bg-gradient-to-r from-[#855DCD] to-[#0052FF] hover:opacity-95 text-white shadow-md'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" />
            {isConnected && address
              ? `${address.slice(0, 5)}...${address.slice(-4)}`
              : 'Connect Wallet'}
            {isConnected && <LogOut className="w-3 h-3 ml-0.5 text-gray-400" />}
          </button>
        </div>
      </div>
    </header>
  );
}
