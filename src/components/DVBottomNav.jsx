import React from 'react';
import { Home, Music2, BarChart2, Settings, Sliders } from 'lucide-react';

export const DVBottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Now Playing', icon: Home },
    { id: 'library', label: 'Library', icon: Music2 },
    { id: 'studio', label: 'Studio', icon: Sliders },
    { id: 'equalizer', label: 'EQ Lab', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="w-full bg-[#080312]/95 backdrop-blur-2xl border-t border-purple-500/20 px-2 pt-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom,0px))] flex items-center justify-around select-none z-40">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-1.5 min-w-0 flex-1 transition-all relative ${
              isActive
                ? 'text-purple-300 font-semibold scale-105'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {/* Active glowing indicator pill on top */}
            {isActive && (
              <div className="absolute -top-1.5 w-6 h-0.5 rounded-full shadow-[0_0_10px_#c084fc] bg-gradient-to-r from-purple-500 to-indigo-400" />
            )}

            <div className="relative">
              <Icon
                className={`w-4 h-4 transition-transform ${
                  isActive
                    ? 'text-purple-300 stroke-[2.2px] drop-shadow-[0_0_8px_rgba(192,132,252,0.85)]'
                    : 'stroke-[1.8px]'
                }`}
              />
            </div>
            <span
              className={`text-[9px] tracking-tight truncate ${
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
