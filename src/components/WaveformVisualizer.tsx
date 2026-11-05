import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isPlaying: boolean;
  barCount?: number;
  className?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isPlaying,
  barCount = 28,
  className = '',
}) => {
  const bars = Array.from({ length: barCount });

  return (
    <div className={`flex items-end justify-center gap-1 h-12 ${className}`}>
      {bars.map((_, i) => {
        // Stagger animation delays for natural organic wave motion
        const delay = (i % 7) * 0.12;
        const duration = 0.6 + (i % 5) * 0.15;

        return (
          <div
            key={i}
            className="w-1 sm:w-1.5 rounded-full bg-gradient-to-t from-purple-500 via-pink-500 to-amber-400 transition-all duration-300"
            style={{
              height: isPlaying ? '100%' : '15%',
              opacity: isPlaying ? 0.9 : 0.3,
              animation: isPlaying
                ? `waveBounce ${duration}s ease-in-out ${delay}s infinite alternate`
                : 'none',
            }}
          />
        );
      })}

      <style>{`
        @keyframes waveBounce {
          0% { height: 18%; opacity: 0.4; }
          50% { height: 85%; opacity: 0.95; }
          100% { height: 35%; opacity: 0.6; }
        }
      `}</style>
    </div>
  );
};
