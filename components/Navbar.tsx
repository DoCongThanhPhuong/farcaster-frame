'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { Bookmark, Wallet, LogOut, Sparkles, X, Loader2, AlertCircle } from 'lucide-react';
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
  const { connect, connectors, isPending, error } = useConnect();
  const { disconnect } = useDisconnect();
  const [pinned, setPinned] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);

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

  const handleConnectClick = () => {
    if (isConnected) {
      disconnect();
      return;
    }

    setConnectError(null);

    // If inside Farcaster Mini App, connect directly to Farcaster wallet
    if (isInMiniApp) {
      const fcConnector = connectors.find((c) => c.name.toLowerCase().includes('farcaster'));
      if (fcConnector) {
        connect(
          { connector: fcConnector },
          {
            onError: (err) => setConnectError(err.message),
          }
        );
        return;
      }
    }

    // In browser, open wallet selection modal
    setShowWalletModal(true);
  };

  const handleSelectConnector = (connector: any) => {
    setConnectError(null);
    connect(
      { connector },
      {
        onSuccess: () => setShowWalletModal(false),
        onError: (err) => {
          if (err.message.includes('not found') || err.message.includes('Connector not found')) {
            setConnectError('Không tìm thấy tiện ích ví (MetaMask / Brave). Vui lòng cài đặt extension hoặc mở trong Warpcast.');
          } else {
            setConnectError(err.message || 'Kết nối thất bại.');
          }
        },
      }
    );
  };

  return (
    <>
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
              onClick={handleConnectClick}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                isConnected
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
                  : 'bg-gradient-to-r from-[#855DCD] to-[#0052FF] hover:opacity-95 text-white shadow-md'
              }`}
            >
              {isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Wallet className="w-3.5 h-3.5" />
              )}
              {isConnected && address
                ? `${address.slice(0, 5)}...${address.slice(-4)}`
                : isPending
                ? 'Connecting...'
                : 'Connect Wallet'}
              {isConnected && <LogOut className="w-3 h-3 ml-0.5 text-gray-400" />}
            </button>
          </div>
        </div>
      </header>

      {/* Wallet Selection Modal */}
      {showWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141522] border border-gray-800 rounded-2xl max-w-sm w-full p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Wallet className="w-4 h-4 text-purple-400" />
                Chọn ví kết nối
              </h3>
              <button
                onClick={() => setShowWalletModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(connectError || error) && (
              <div className="mb-3 p-2.5 rounded-xl bg-red-950/40 border border-red-800/40 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <span>{connectError || error?.message}</span>
              </div>
            )}

            <div className="space-y-2">
              {connectors.map((c) => {
                const isFc = c.name.toLowerCase().includes('farcaster');
                return (
                  <button
                    key={c.id}
                    onClick={() => handleSelectConnector(c)}
                    disabled={isPending}
                    className="w-full p-3 rounded-xl border border-gray-700/70 bg-gray-900/60 hover:bg-purple-950/40 hover:border-purple-600/50 flex items-center justify-between transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-base">
                        {isFc ? '🟣' : '🦊'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300">
                          {isFc ? 'Farcaster Wallet' : 'MetaMask / Browser Wallet'}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {isFc ? 'Dành cho app Warpcast' : 'Brave, MetaMask, Coinbase'}
                        </div>
                      </div>
                    </div>
                    {isPending && <Loader2 className="w-4 h-4 animate-spin text-purple-400" />}
                  </button>
                );
              })}
            </div>

            <p className="text-[11px] text-gray-500 mt-4 text-center">
              Chưa có ví? Cài đặt extension MetaMask hoặc mở trực tiếp trên app Warpcast.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
