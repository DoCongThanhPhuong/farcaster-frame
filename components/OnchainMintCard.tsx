'use client';

import { useState, useEffect } from 'react';
import { useAccount, useSendTransaction, useSignMessage, useSwitchChain, useWaitForTransactionReceipt } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { parseEther } from 'viem';
import { Award, Check, ExternalLink, Loader2, Sparkles, Key } from 'lucide-react';

interface OnchainMintCardProps {
  hasMintedPass: boolean;
  onPassMinted: () => void;
  fid: number | null;
}

export function OnchainMintCard({ hasMintedPass, onPassMinted, fid }: OnchainMintCardProps) {
  const { address, isConnected, chain } = useAccount();
  const { sendTransactionAsync } = useSendTransaction();
  const { signMessageAsync } = useSignMessage();
  const { switchChainAsync } = useSwitchChain();

  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [signedMsg, setSignedMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { isSuccess: isTxSuccess } = useWaitForTransactionReceipt({
    hash: (txHash as `0x${string}`) || undefined,
  });

  useEffect(() => {
    if (isTxSuccess) {
      onPassMinted();
    }
  }, [isTxSuccess]);
  const handleOnchainMint = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      if (chain?.id !== base.id && chain?.id !== baseSepolia.id) {
        if (switchChainAsync) {
          try {
            await switchChainAsync({ chainId: base.id });
          } catch {
            setError('Please switch your wallet to Base network.');
            return;
          }
        } else {
          setError('Please switch your wallet to Base network.');
          return;
        }
      }

      const hash = await sendTransactionAsync({
        to: '0x000000000000000000000000000000000000dEaD',
        value: parseEther('0'),
        data: '0x6661726361737465725f6275696c646572',
      });

      setTxHash(hash);
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'shortMessage' in err && typeof err.shortMessage === 'string'
        ? err.shortMessage
        : err instanceof Error
        ? err.message
        : 'Transaction failed. Try Gasless Sign.';
      setError(message);
      setIsLoading(false);
    }
  };

  const handleSignVerification = async () => {
    if (!isConnected || !address) {
      setError('Please connect your wallet first.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const message = `Farcaster Builder Airdrop Verification\nFID: #${fid || 1}\nAddress: ${address}\nTimestamp: ${Date.now()}`;
      const sig = await signMessageAsync({ message });
      const res = await fetch('/api/verify-signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, message, signature: sig }),
      });
      const data = await res.json();
      if (!res.ok || !data.verified) {
        throw new Error(data.error || 'Server signature verification failed');
      }
      setSignedMsg(sig);
      onPassMinted();
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'shortMessage' in err && typeof err.shortMessage === 'string'
        ? err.shortMessage
        : err instanceof Error
        ? err.message
        : 'Signature rejected.';
      setError(message);
      setIsLoading(false);
    }
  };

  const explorerUrl = chain?.blockExplorers?.default?.url || 'https://basescan.org';

  return (
    <div className="bg-[#141522] border border-gray-800 rounded-2xl p-5 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Onchain Builder Pass</h3>
            <p className="text-xs text-gray-400">Verified Base L2 contract interaction (+0.5x)</p>
          </div>
        </div>

        {hasMintedPass && (
          <span className="px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-600/30 text-emerald-300 font-bold text-xs flex items-center gap-1">
            <Check className="w-3.5 h-3.5" />
            Verified
          </span>
        )}
      </div>

      <div className="bg-gradient-to-br from-blue-950/20 to-purple-950/20 border border-blue-900/30 rounded-xl p-3.5 mb-4 text-xs text-gray-300 space-y-1.5">
        <div className="flex justify-between text-gray-400">
          <span>Target Network:</span>
          <span className="text-white font-medium">Base / Base Sepolia</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Mint Cost:</span>
          <span className="text-emerald-400 font-medium">FREE (0 ETH + gas)</span>
        </div>
        <div className="flex justify-between text-gray-400">
          <span>Reward:</span>
          <span className="text-purple-300 font-bold">+50% Score Multiplier</span>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2.5 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-xs">
          {error}
        </div>
      )}

      {txHash && (
        <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs flex items-center justify-between">
          <span>TX: {txHash.slice(0, 8)}...{txHash.slice(-6)}</span>
          <a
            href={`${explorerUrl}/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 underline text-emerald-200"
          >
            View on Explorer <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {signedMsg && (
        <div className="mb-3 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 text-xs">
          Signed &amp; Verified: {signedMsg.slice(0, 10)}...{signedMsg.slice(-8)}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleOnchainMint}
          disabled={isLoading || hasMintedPass}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
            hasMintedPass
              ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-90 text-white shadow-md'
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {hasMintedPass ? 'Pass Minted' : 'Mint on Base'}
        </button>

        <button
          onClick={handleSignVerification}
          disabled={isLoading || hasMintedPass}
          className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition border ${
            hasMintedPass
              ? 'border-gray-800 text-gray-500 cursor-not-allowed'
              : 'border-purple-600/40 bg-purple-950/30 hover:bg-purple-900/40 text-purple-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          Gasless Sign
        </button>
      </div>
    </div>
  );
}
