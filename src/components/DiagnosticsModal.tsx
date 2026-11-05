import React from 'react';
import { X, CheckCircle2, AlertTriangle, Terminal, ArrowRight } from 'lucide-react';

interface DiagnosticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiagnosticsModal: React.FC<DiagnosticsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const issues = [
    {
      id: 'cors',
      severity: 'Critical Bug',
      title: 'Direct Client Fetch vs iTunes API CORS Policy',
      codeOld: `const res = await fetch('https://itunes.apple.com/search?...');`,
      codeFixed: `// Solved with Vite dev proxy + JSONP script injection + Offline Curated fallback
searchTracks(query) -> tries /api/itunes/search, then JSONP, then curated tracks`,
      explanation:
        'The iTunes Search API does not consistently support direct client-side fetch from browsers or sandboxed iframes without CORS errors. It frequently resulted in "Could not reach the music catalogue" on first load.',
    },
    {
      id: 'duration',
      severity: 'Logic Flaw',
      title: 'Preview Duration vs Full Song Duration Mismatch',
      codeOld: `$('duration').textContent = time(t.trackTimeMillis / 1000 || 30);`,
      codeFixed: `// Previews are strictly 30s snippets; full song duration is separate
previewDurationSec: 30; // audio.duration or 30s
fullTrackDuration: formatTime(track.trackTimeMillis); // displayed as secondary info`,
      explanation:
        'trackTimeMillis in iTunes represents the full song duration (e.g. 3:45 or 4:12), but previewUrl only plays a 30-second AAC sample. The old code told users the track was 3:45 while the seeker stopped at 30 seconds!',
    },
    {
      id: 'slider',
      severity: 'UX Bug',
      title: 'Seek Slider Jitter / Overwriting While Dragging',
      codeOld: `$('seek').addEventListener('input', () => { audio.currentTime = ... });
audio.addEventListener('timeupdate', sync); // Overwrites seek.value mid-drag!`,
      codeFixed: `const [isScrubbing, setIsScrubbing] = useState(false);
// timeupdate only syncs when isScrubbing is false; commits on release`,
      explanation:
        'While dragging the progress slider, timeupdate fired multiple times per second and continuously overwrote the slider value with the audio current time, fighting the user cursor.',
    },
    {
      id: 'broken-img',
      severity: 'Visual Bug',
      title: 'Empty Image Source on Initial Load',
      codeOld: `<img id="nowArt" alt="" src="">`,
      codeFixed: `<div className="fallback-art"><MusicIcon /></div> // renders high-res art once loaded`,
      explanation:
        'An empty src attribute (<img src="">) triggers an invalid HTTP request to the current page URL and causes browsers (Chrome, Safari) to render a broken missing-image icon in the player before a track is selected.',
    },
    {
      id: 'audio-error',
      severity: 'Reliability',
      title: 'Missing Audio Stream Error Recovery',
      codeOld: `// No audio.addEventListener('error', ...) at all!`,
      codeFixed: `audio.addEventListener('error', () => {
  setHasError(true);
  advanceToNextTrack();
});`,
      explanation:
        'If an audio preview failed to stream, was geo-blocked, or timed out, the old player remained permanently stuck with a frozen playing button and no user feedback.',
    },
    {
      id: 'features',
      severity: 'Missing Controls',
      title: 'No Volume, Repeat, Shuffle, or Waveform Visualizer',
      codeOld: `// Only Prev, Play, Next with no volume or sound visualization`,
      codeFixed: `// Added Volume slider with Mute, Repeat One/All, Shuffle, & Live Audio Waveform`,
      explanation:
        'The application is called "Wave" but lacked audio waveform visualization, had zero volume controls, and lacked playlist looping or shuffling.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-white/10 bg-[#161622] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/20 text-purple-300">
              <Terminal className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                What Was Wrong With the Original Code?
              </h2>
              <p className="text-xs text-slate-400">
                Detailed diagnostic audit of <code className="text-purple-300">index_dbe2db9e.html</code>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            We performed a line-by-line inspection of your attached HTML file. Here are the 6 primary architectural and visual flaws that were causing errors, unexpected audio behavior, and visual glitches:
          </p>

          <div className="space-y-4">
            {issues.map((issue, idx) => (
              <div
                key={issue.id}
                className="rounded-xl border border-white/5 bg-[#1a1a28] p-4 text-xs transition hover:border-purple-500/20"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[10px] font-bold text-purple-300">
                      {idx + 1}
                    </span>
                    <h3 className="font-semibold text-white text-sm">{issue.title}</h3>
                  </div>
                  <span className="rounded bg-rose-500/10 px-2 py-0.5 text-[10px] font-medium text-rose-300 border border-rose-500/20">
                    {issue.severity}
                  </span>
                </div>

                <p className="text-slate-300 mb-3">{issue.explanation}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="rounded-lg bg-rose-950/20 border border-rose-900/40 p-2.5 text-rose-200">
                    <div className="text-[10px] uppercase font-bold text-rose-400 mb-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> Original Snippet
                    </div>
                    <code className="block whitespace-pre-wrap">{issue.codeOld}</code>
                  </div>

                  <div className="rounded-lg bg-emerald-950/20 border border-emerald-900/40 p-2.5 text-emerald-200">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Fixed Implementation
                    </div>
                    <code className="block whitespace-pre-wrap">{issue.codeFixed}</code>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 px-6 py-3.5 bg-[#12121c] flex items-center justify-between">
          <span className="text-xs text-slate-400">
            All issues have been resolved in the current active player.
          </span>
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 rounded-lg bg-purple-500 px-4 py-2 text-xs font-semibold text-slate-950 hover:bg-purple-400 transition"
          >
            <span>Close & Listen</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
