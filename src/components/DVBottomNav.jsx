import React from 'react';
import { Home, Music2, BarChart2, Settings } from 'lucide-react';

export const DVBottomNav = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'library', label: 'Library', icon: Music2 },
    { id: 'equalizer', label: 'Equalizer', icon: BarChart2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="w-full bg-[#080312]/95 backdrop-blur-2xl border-t border-purple-500/15 px-4 py-2 flex items-center justify-around select-none z-30">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 py-1 px-4 min-w-[64px] transition-all relative ${
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
                    ? 'text-purple-300 stroke-[2.4px] drop-shadow-[0_0_10px_rgba(192,132,252,0.85)]'
                    : 'stroke-[1.8px]'
                }`}
              />
            </div>
            <span
              className={`text-[11px] tracking-tight truncate max-w-[60px] ${
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
