import React from 'react';
import { X, ShieldCheck, AlertTriangle, Radio, CheckCircle, ExternalLink } from 'lucide-react';

interface LivestreamLicensingModalProps {
  isOpen: boolean;
  onClose: () => void;
  streamSafeMode: boolean;
  onToggleStreamSafeMode: () => void;
}

export const LivestreamLicensingModal: React.FC<LivestreamLicensingModalProps> = ({
  isOpen,
  onClose,
  streamSafeMode,
  onToggleStreamSafeMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#161626] p-6 shadow-2xl text-white">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">
              Livestream Audio Rights & Licensing
            </h3>
            <p className="text-xs text-slate-400">
              Guidance for TikTok LIVE Broadcasters & DJs
            </p>
          </div>
        </div>

        {/* Advisory Content */}
        <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-300">
                Playable search results vs. Livestream Broadcast Rights
              </p>
              <p className="text-amber-200/80 mt-1 text-[11px]">
                A playable search result or music video is licensed for personal web embedding,
                but re-broadcasting copyrighted audio over TikTok LIVE may trigger TikTok’s automated
                audio detection, muting, or stream strikes.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold text-white text-sm">
              Broadcaster Safety Recommendations:
            </h4>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300 text-[11px]">
              <li>
                <strong className="text-white">Stream-Safe Mode:</strong> Prioritize copyright-cleared,
                Creative Commons, or royalty-free tracks for continuous unmuted broadcasting.
              </li>
              <li>
                <strong className="text-white">Commercial Sounds Library:</strong> In TikTok LIVE Studio,
                ensure your stream audio routing is set up with TikTok’s Commercial Music clearance.
              </li>
              <li>
                <strong className="text-white">OBS / Virtual Audio Cable:</strong> Route WAVE’s master audio
                output directly into your streaming software with live on-screen viewer attribution.
              </li>
            </ul>
          </div>

          {/* Toggle for Stream-Safe Mode */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="font-bold text-white text-xs">Stream-Safe Voting Filter</p>
              <p className="text-[11px] text-slate-400">
                Warn or filter requests that lack public livestream clearance
              </p>
            </div>

            <button
              onClick={onToggleStreamSafeMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                streamSafeMode
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {streamSafeMode ? 'Active (Filtered)' : 'Disabled'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
