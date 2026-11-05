import React from 'react';
import { Music2 } from 'lucide-react';

interface HeaderProps {
  onSelectDiscover?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSelectDiscover }) => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#101018]/95 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-xl items-center justify-center px-4 py-3 text-center">
        {/* Full top banner alone: Website App Name only, zero side clutter */}
        <button
          onClick={onSelectDiscover}
          className="flex items-center justify-center gap-2.5 active:scale-95 transition-transform"
          title="የሙዚቃ ምርጫ"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white shadow-md shadow-purple-500/25">
            <Music2 className="h-4.5 w-4.5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-wide text-white font-ethiopic">
            የሙዚቃ ምርጫ
          </h1>
        </button>
      </div>
    </header>
  );
};
