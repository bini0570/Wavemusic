import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Clock, Trash2, ArrowUpRight } from 'lucide-react';

const STORAGE_KEY = 'ym_recent_searches';
const MAX_RECENT_SEARCHES = 8;

export const SearchBar = ({
  onSearch,
  isLoading,
  initialValue = '',
  autoLeadingQuery,
  autoLeadingVotes,
  timeRemaining,
}) => {
  const [term, setTerm] = useState(initialValue);
  const [isUserEditing, setIsUserEditing] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

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
        }
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
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
  const saveRecentSearches = (queries) => {
    setRecentSearches(queries);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queries));
    } catch (err) {
      console.warn('Unable to save recent searches to localStorage:', err);
    }
  };

  // Add query to recent searches (deduplicated, placed first)
  const recordQuery = (queryText) => {
    const trimmed = queryText.trim();
    if (!trimmed) return;

    const filtered = recentSearches.filter(
      (item) => item.toLowerCase() !== trimmed.toLowerCase()
    );
    const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    saveRecentSearches(updated);
  };

  const handleSubmit = (e) => {
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
  const handleSelectRecent = (query) => {
    setTerm(query);
    recordQuery(query);
    setIsOpen(false);
    onSearch(query);
  };

  // Remove a single query from recent searches without triggering search
  const handleRemoveSingle = (e, queryToRemove) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== queryToRemove);
    saveRecentSearches(updated);
  };

  // Clear all recent queries
  const handleClearAll = (e) => {
    e.stopPropagation();
    saveRecentSearches([]);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        background: 'rgba(11,8,22,0.95)',
        backdropFilter: 'blur(12px)',
        paddingTop: '8px',
        paddingBottom: '10px',
        borderBottom: '1px solid rgba(139,92,246,0.15)',
      }}
    >
      {/* Search Input Form */}
      <form onSubmit={handleSubmit} style={{ position: 'relative', display: 'flex', width: '100%', alignItems: 'center', gap: '8px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', height: '16px', width: '16px', color: '#8b5cf6', pointerEvents: 'none' }} />
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
            placeholder="Search song or artist..."
            style={{
              width: '100%',
              borderRadius: '12px',
              border: '1px solid rgba(139,92,246,0.3)',
              background: 'rgba(11,8,22,0.8)',
              padding: '10px 40px 10px 42px',
              fontSize: '14px',
              color: '#fff',
              outline: 'none',
              fontWeight: 500,
              boxSizing: 'border-box',
            }}
            onFocusCapture={(e) => {
              e.target.style.borderColor = 'rgba(6,182,212,0.6)';
              e.target.style.boxShadow = '0 0 12px rgba(6,182,212,0.15)';
            }}
            onBlurCapture={(e) => {
              e.target.style.borderColor = 'rgba(139,92,246,0.3)';
              e.target.style.boxShadow = 'none';
            }}
          />

          {/* Clear Button */}
          {term && (
            <button
              type="button"
              onClick={() => {
                handleClear();
                setIsUserEditing(true);
              }}
              style={{
                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: '24px', width: '24px', borderRadius: '50%',
                background: 'rgba(139,92,246,0.15)', color: '#a78bfa',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              }}
              aria-label="Clear search text"
            >
              <X style={{ height: '12px', width: '12px' }} />
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !term.trim()}
          style={{
            display: 'flex', height: '42px', alignItems: 'center', justifyContent: 'center',
            borderRadius: '12px',
            background: isLoading || !term.trim()
              ? 'rgba(139,92,246,0.3)'
              : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            padding: '0 16px',
            fontSize: '12px', fontWeight: 700, color: '#fff',
            border: 'none', cursor: isLoading || !term.trim() ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            boxShadow: '0 0 12px rgba(139,92,246,0.3)',
            transition: 'all 0.15s',
          }}
        >
          {isLoading ? (
            <Loader2 style={{ height: '16px', width: '16px', animation: 'spin 1s linear infinite' }} />
          ) : (
            <span>Search</span>
          )}
        </button>
      </form>

      {/* Recent Search Queries Dropdown */}
      {isOpen && recentSearches.length > 0 && (
        <div style={{
          position: 'absolute', left: 0, right: 0, top: '100%', marginTop: '6px',
          zIndex: 30, borderRadius: '16px',
          border: '1px solid rgba(139,92,246,0.25)',
          background: 'rgba(11,8,22,0.97)',
          padding: '10px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 8px 8px', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 600, color: '#a78bfa' }}>
              <Clock style={{ height: '14px', width: '14px' }} />
              <span>Recent</span>
            </div>
            <button
              type="button"
              onClick={handleClearAll}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Trash2 style={{ height: '12px', width: '12px' }} />
              <span>Clear all</span>
            </button>
          </div>

          <div style={{ marginTop: '4px', maxHeight: '256px', overflowY: 'auto' }}>
            {recentSearches.map((query) => (
              <div
                key={query}
                onClick={() => handleSelectRecent(query)}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: '8px', padding: '8px 10px', borderRadius: '10px',
                  fontSize: '12px', color: '#cbd5e1', cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139,92,246,0.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                  <Clock style={{ height: '13px', width: '13px', color: '#6366f1', flexShrink: 0 }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500 }}>
                    {query}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                  <ArrowUpRight style={{ height: '13px', width: '13px', color: '#475569' }} />
                  <button
                    type="button"
                    onClick={(e) => handleRemoveSingle(e, query)}
                    style={{ padding: '4px', color: '#475569', background: 'none', border: 'none', cursor: 'pointer', borderRadius: '6px' }}
                    aria-label={`Remove "${query}"`}
                  >
                    <X style={{ height: '12px', width: '12px' }} />
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
