import React, { useState } from 'react';
import { Download, Smartphone, Share, PlusSquare, X, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall.js';

export const PWAInstallBanner = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already installed or dismissed by user, suppress the banner
  if (isInstalled || isDismissed) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstallSuccess(true);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General instructions for browsers that haven't fired beforeinstallprompt yet
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {/* Prominent Floating Install Banner (overlay, never shifts viewport height) */}
      <div className="fixed bottom-3 right-3 z-40 max-w-sm w-[calc(100%-1.5rem)] animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="relative flex items-center justify-between gap-3 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-950/60 via-[#181528] to-pink-950/40 p-2.5 sm:p-3 shadow-lg shadow-purple-950/20 backdrop-blur-md">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25">
              <Smartphone className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white font-ethiopic">
                  በስልክህ ጫን
                </span>
                <span className="text-[10px] text-purple-300 font-medium">
                  · Install App
                </span>
              </div>
              <p className="text-[11px] text-slate-300 truncate">
                ፈጣን መዳረሻ እና ያለ ኢንተርኔት ማጫወቻ
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-md shadow-purple-500/30 hover:opacity-95 active:scale-95 transition"
            >
              {installSuccess ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Installed</span>
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  <span>ጫን / Install</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition active:scale-90"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Guided Modal for iOS Safari / Manual Installation */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#161626] p-5 shadow-2xl text-white">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500 text-slate-950 font-bold">
                  <Smartphone className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-ethiopic">
                    በስልክህ ላይ ጫን (Install on Phone)
                  </h3>
                  <p className="text-[11px] text-slate-400">የሙዚቃ ምርጫ Web App</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="rounded-full p-1 text-slate-400 hover:text-white hover:bg-white/10 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-slate-300">
              <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3 border border-white/5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 font-bold">
                  1
                </div>
                <div>
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    በSafari Share ንካ <Share className="h-3.5 w-3.5 text-blue-400" />
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tap the <strong>Share</strong> button at the bottom of Safari or browser menu (⋮).
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3 border border-white/5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 font-bold">
                  2
                </div>
                <div>
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    'Add to Home Screen' ምረጥ <PlusSquare className="h-3.5 w-3.5 text-purple-400" />
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Scroll down and select <strong>'Add to Home Screen' (ወደ መነሻ ገጽ አክል)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-white/5 p-3 border border-white/5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold">
                  3
                </div>
                <div>
                  <p className="font-semibold text-white">
                    'Add' የሚለውን ተጫን
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tap <strong>Add</strong> in the top right. The app will appear on your phone home screen!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 py-2.5 text-xs font-bold text-slate-950 transition active:scale-95 shadow-md shadow-purple-500/25"
            >
              ተረድቻለሁ (Got it)
            </button>
          </div>
        </div>
      )}
    </>
  );
};
