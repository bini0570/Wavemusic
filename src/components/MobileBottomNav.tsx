import React from 'react';
import { Compass, Mic2, Heart } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'discover' | 'lyrics' | 'favorites';
  onSelectTab: (tab: 'discover' | 'lyrics' | 'favorites') => void;
  favoritesCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  favoritesCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#101018]/95 backdrop-blur-xl border-t border-white/5 py-1.5 px-6">
      <div className="mx-auto flex max-w-md items-center justify-around">
        <button
          onClick={() => onSelectTab('discover')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition min-w-[64px] ${
            activeTab === 'discover' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="h-5 w-5 mb-0.5" />
          <span className="text-[11px]">Discover</span>
        </button>

        <button
          onClick={() => onSelectTab('lyrics')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition min-w-[64px] ${
            activeTab === 'lyrics' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Mic2 className="h-5 w-5 mb-0.5" />
          <span className="text-[11px]">Lyrics</span>
        </button>

        <button
          onClick={() => onSelectTab('favorites')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition min-w-[64px] relative ${
            activeTab === 'favorites' ? 'text-purple-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="h-5 w-5 mb-0.5" />
          <span className="text-[11px]">Library</span>
          {favoritesCount > 0 && (
            <span className="absolute top-0.5 right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-pink-500 px-1 text-[9px] font-bold text-white">
              {favoritesCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};
