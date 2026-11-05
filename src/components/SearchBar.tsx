import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Clock, Trash2, ArrowUpRight } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  initialValue?: string;
  autoLeadingQuery?: string;
  autoLeadingVotes?: number;
  timeRemaining?: number;
}

const STORAGE_KEY = 'ym_recent_searches';
const MAX_RECENT_SEARCHES = 8;

const INITIAL_FALLBACK_SEARCHES = [
  'Teddy Afro',
  'Aster Aweke',
  'Rema Calm Down',
  'The Weeknd',
];

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  isLoading,
  initialValue = '',
  autoLeadingQuery,
  autoLeadingVotes,
  timeRemaining,
}) => {
  const [term, setTerm] = useState(initialValue);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Automatically write the top leading voting comment into the search bar
  useEffect(() => {
    if (autoLeadingQuery && !isUserEditing) {
      setTerm(autoLeadingQuery);
    }
  }, [autoLeadingQuery, isUserEditing]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentSearches(parsed.filter((item) => typeof item === 'string' && item.trim().length > 0));
          return;
        }
      }
      // Seed with friendly initial suggestions if storage is empty
      setRecentSearches(INITIAL_FALLBACK_SEARCHES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_SEARCHES));
    } catch {
      setRecentSearches(INITIAL_FALLBACK_SEARCHES);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, []);

  // Helper to persist recent searches to localStorage
  const saveRecentSearches = (queries: string[]) => {
    setRecentSearches(queries);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
    } catch (err) {
      console.warn('Unable to save recent searches to localStorage:', err);
    }
  };

  // Add query to recent searches (deduplicated, placed first)
  const recordQuery = (queryText: string) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    const filtered = recentSearches.filter(
      (item) => item.toLowerCase() !== trimmed.toLowerCase()
    );
    const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    saveRecentSearches(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = term.trim();
    if (query) {
      recordQuery(query);
      setIsOpen(false);
      onSearch(query);
    }
  };

  // Dedicated Clear handler: Clears text, refocuses input, and opens recent queries for fast navigation
  const handleClear = () => {
    setTerm('');
    inputRef.current?.focus();
    setIsOpen(true);
  };

  // Execute search directly from a recent search item
  const handleSelectRecent = (query: string) => {
    setTerm(query);
    recordQuery(query);
    setIsOpen(false);
    onSearch(query);
  };

  // Remove a single query from recent searches without triggering search
  const handleRemoveSingle = (e: React.MouseEvent, queryToRemove: string) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== queryToRemove);
    saveRecentSearches(updated);
  };

  // Clear all recent queries
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveRecentSearches([]);
  };

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#0d0d16]/95 backdrop-blur-md pt-2 pb-2.5 border-b border-white/5"
    >
      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="relative flex w-full items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="search"
            value={term}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setIsUserEditing(true);
              setTerm(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsOpen(false);
              }
            }}
            placeholder="Search song, artist (auto-filled with #1 viewer vote)..."
            className="w-full rounded-xl border border-white/10 bg-[#161624] py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 shadow-inner outline-none transition focus:border-purple-400 focus:ring-1 focus:ring-purple-400/30 font-medium"
          />

          {/* Interactive Clear Icon: Prominent circular button with tooltip */}
          {term && (
            <button
              type="button"
              onClick={() => {
                handleClear();
                setIsUserEditing(true);
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white transition active:scale-90"
              aria-label="Clear search text"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !term.trim()}
          className="flex h-[42px] items-center justify-center rounded-xl bg-purple-500 px-4 text-xs font-bold text-slate-950 transition hover:bg-purple-400 active:scale-95 disabled:opacity-40 shrink-0 shadow-sm"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>Search</span>
          )}
        </button>
      </form>

      {/* Auto-written Live Winner Notification Banner */}
      {autoLeadingQuery && !isUserEditing && (
        <div className="mt-1.5 flex items-center justify-between text-[11px] text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <span className="truncate">
            ★ Live #1 Vote Lead: <strong className="text-white">{autoLeadingQuery}</strong> ({autoLeadingVotes} {autoLeadingVotes === 1 ? 'vote' : 'votes'})
          </span>
          <span className="shrink-0 text-[10px] font-mono text-amber-400 font-bold ml-2">
            Auto-Plays at {timeRemaining ?? 0}s
          </span>
        </div>
      )}

      {/* Recent Search Queries Overlay from localStorage */}
      {isOpen && recentSearches.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-30 rounded-2xl border border-white/10 bg-[#141422] p-2.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between px-2 pb-2 border-b border-white/5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Clock className="h-3.5 w-3.5 text-purple-400" />
              <span>የቅርብ ፍለጋዎች (Recent Searches)</span>
            </div>
            <button
              type="button"
              onClick={handleClearAll}
              className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-rose-400 transition"
              title="Clear all recent searches"
            >
              <Trash2 className="h-3 w-3" />
              <span>Clear all</span>
            </button>
          </div>

          <div className="mt-1 divide-y divide-white/5 max-h-64 overflow-y-auto no-scrollbar">
            {recentSearches.map((query) => (
              <div
                key={query}
                onClick={() => handleSelectRecent(query)}
                className="group flex items-center justify-between gap-2 px-2.5 py-2 rounded-xl text-xs hover:bg-white/5 cursor-pointer transition text-slate-200"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Clock className="h-3.5 w-3.5 text-slate-500 group-hover:text-purple-400 transition-colors shrink-0" />
                  <span className="truncate font-medium group-hover:text-white transition-colors">
                    {query}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-600 group-hover:text-slate-400 transition opacity-0 group-hover:opacity-100" />
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSingle(e, query)}
                    className="p-1 text-slate-500 hover:text-rose-400 hover:bg-white/10 rounded-lg transition active:scale-90"
                    title={`Remove "${query}" from recent searches`}
                    aria-label={`Remove "${query}"`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
