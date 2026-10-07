'use client';

import { useState } from 'react';
import { HelpCircle, X, ExternalLink, CheckCircle2, ChevronRight, Coins } from 'lucide-react';

export function BuilderAirdropGuideModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full py-2.5 px-4 rounded-xl border border-dashed border-gray-700 bg-gray-900/30 hover:bg-gray-800/40 text-gray-300 font-semibold text-xs flex items-center justify-center gap-2 transition"
      >
        <Coins className="w-4 h-4 text-yellow-400" />
        <span>Hướng dẫn Builder Săn Airdrop Farcaster &amp; Base (Checklist)</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#13141f] border border-gray-800 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-5 relative shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <h3 className="font-bold text-white text-base">
                  Checklist Săn Airdrop Builder Farcaster
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-gray-300">
              <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl">
                <p className="font-semibold text-purple-200 mb-1">Cơ hội Airdrop &amp; Grants:</p>
                <ul className="list-disc list-inside space-y-1 text-gray-300">
                  <li><strong>Base Builder Grants:</strong> Thưởng builder có frame tương tác onchain Base.</li>
                  <li><strong>Moxie Builder Rewards:</strong> Chia thưởng hàng ngày theo lượng tương tác Frame.</li>
                  <li><strong>Farcaster / Warpcast rounds:</strong> Airdrop tiềm năng cho account deploy Mini App.</li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-bold text-white">Deploy lên Vercel</p>
                    <p className="text-gray-400">Push code lên GitHub và import vào Vercel. Nhận domain HTTPS (ví dụ: <code>farcaster-frame.vercel.app</code>).</p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-white">Xác thực Domain trên Warpcast Developer Portal</p>
                    <p className="text-gray-400">
                      Truy cập{' '}
                      <a
                        href="https://warpcast.com/~/developers/frames"
                        target="_blank"
                        rel="noreferrer"
                        className="text-purple-400 underline inline-flex items-center gap-0.5"
                      >
                        warpcast.com/~/developers/frames <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                      , nhập domain để ký chữ ký liên kết tên miền (Account Association).
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-white">Cast Frame lên Warpcast</p>
                    <p className="text-gray-400">
                      Đăng 1 cast chứa URL Vercel lên các kênh đông user: <code>/base</code>, <code>/farcaster</code>, <code>/dev</code>. Frame sẽ tự render giao diện Mini App v2.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-900/60 text-blue-300 flex items-center justify-center shrink-0 font-bold text-[11px] mt-0.5">
                    4
                  </div>
                  <div>
                    <p className="font-bold text-white">Tạo vòng lặp tương tác (Daily Streak &amp; Share)</p>
                    <p className="text-gray-400">
                      User vào check-in hàng ngày, mint pass onchain trên Base và share cast giúp tăng DAU và Transaction count của bạn.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold"
                >
                  Đã hiểu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
