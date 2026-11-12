import React from 'react';
import { Disc, Music2, Sliders, Settings } from 'lucide-react';

export const DVBottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Now Playing', icon: Disc },
    { id: 'library', label: 'Library', icon: Music2 },
    { id: 'equalizer', label: 'Sound Lab', icon: Sliders },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="w-full bg-[#080312]/95 backdrop-blur-2xl border-t border-white/10 px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom,0px))] flex items-center justify-around select-none z-40">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-2 min-w-0 flex-1 transition-all relative ${
              isActive
                ? 'text-purple-300 font-semibold scale-105'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {/* Active glowing indicator pill on top */}
            {isActive && (
              <div className="absolute -top-2 w-8 h-1 rounded-full shadow-[0_0_12px_#c084fc] bg-gradient-to-r from-purple-500 to-indigo-400" />
            )}

            <div className="relative">
              <Icon
                className={`w-5 h-5 transition-transform ${
                  isActive
                    ? 'text-purple-300 stroke-[2.2px] drop-shadow-[0_0_10px_rgba(192,132,252,0.9)]'
                    : 'stroke-[1.8px]'
                }`}
              />
            </div>
            <span
              className={`text-[10px] tracking-tight truncate ${
                isActive ? 'text-purple-200 font-medium' : 'text-neutral-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
