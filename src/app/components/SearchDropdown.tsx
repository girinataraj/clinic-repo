import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { useClickOutside } from '../../hooks/useClickOutside';

interface SearchDropdownProps {
  module: string;
  searchFields: string[];
  apiEndpoint: string;
  renderItem: (item: any, highlightText: (text: string) => React.ReactNode) => React.ReactNode;
  onSelect: (item: any) => void;
  minChars?: number;
  debounceMs?: number;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// In-memory cache for last 5 queries per module
const globalSearchCache: Record<string, Array<{ query: string; data: any[] }>> = {};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function SearchDropdown({
  module,
  searchFields,
  apiEndpoint,
  renderItem,
  onSelect,
  minChars = 3,
  debounceMs = 300,
  value,
  onChange,
  placeholder = 'Search...',
  className = '',
  disabled = false,
}: SearchDropdownProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const debouncedValue = useDebounce(value, debounceMs);

  useClickOutside(wrapperRef, () => {
    setIsOpen(false);
  });

  // Handle live search when debounced value changes
  useEffect(() => {
    const cleanedQuery = debouncedValue.trim();
    if (cleanedQuery.length < minChars) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    // Stripping formatting specifically for patients mobile search
    let queryToSend = cleanedQuery;
    if (module === 'patients') {
      queryToSend = cleanedQuery.replace(/\D/g, '');
    }

    // Check cache
    const moduleCache = globalSearchCache[module] || [];
    const cachedEntry = moduleCache.find((e) => e.query === queryToSend);
    if (cachedEntry) {
      setSuggestions(cachedEntry.data);
      setError(null);
      return;
    }

    // Abort previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    const separator = apiEndpoint.includes('?') ? '&' : '?';
    const paramName = module === 'patients' ? 'mobile' : 'search';
    const requestUrl = `${apiEndpoint}${separator}${paramName}=${encodeURIComponent(queryToSend)}`;

    api.get<{ success: boolean; data: any[] }>(requestUrl, {
      signal: abortController.signal,
    })
      .then((response) => {
        const results = response.data.data || [];
        
        // Update Cache
        if (!globalSearchCache[module]) {
          globalSearchCache[module] = [];
        }
        const cacheList = globalSearchCache[module];
        const existingIdx = cacheList.findIndex(e => e.query === queryToSend);
        if (existingIdx !== -1) {
          cacheList.splice(existingIdx, 1);
        }
        cacheList.push({ query: queryToSend, data: results });
        if (cacheList.length > 5) {
          cacheList.shift();
        }

        setSuggestions(results);
      })
      .catch((err) => {
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          return;
        }
        console.error(`SearchDropdown API failure for ${module}:`, err);
        setError(`Failed to search ${module}. Please try again.`);
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedValue, minChars, apiEndpoint, module]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    const hasItems = suggestions.length > 0;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (hasItems) {
          setActiveIndex((prev) => (prev === suggestions.length - 1 ? 0 : prev + 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (hasItems) {
          setActiveIndex((prev) => (prev <= 0 ? suggestions.length - 1 : prev - 1));
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (hasItems && activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSelect(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      default:
        break;
    }
  };

  const handleSelect = (item: any) => {
    const displayVal = module === 'patients' ? item.mobile || item.phone : item.name;
    onChange(displayVal || '');
    onSelect(item);
    setIsOpen(false);
  };

  const highlightText = (text: string) => {
    if (!value) return <span>{text}</span>;
    const cleanSearch = module === 'patients' ? value.replace(/\D/g, '') : value.trim();
    if (!cleanSearch) return <span>{text}</span>;

    const regex = new RegExp(`(${escapeRegExp(cleanSearch)})`, 'gi');
    const parts = text.split(regex);

    return (
      <>
        {parts.map((part, index) =>
          part.toLowerCase() === cleanSearch.toLowerCase() ? (
            <mark key={index} className="bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-100 font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={`search-dropdown-${module}`}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
            setActiveIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 dark:focus:ring-teal-400 disabled:opacity-50 transition-all"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
          {loading ? (
            <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
          ) : (
            <Search className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </div>

      {isOpen && value.trim().length >= minChars && (
        <div
          id={`search-dropdown-${module}`}
          role="listbox"
          className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-60 overflow-y-auto overflow-hidden divide-y divide-slate-100 dark:divide-slate-700 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
        >
          {error && (
            <div className="p-3 text-xs text-rose-500 text-center font-semibold">
              {error}
            </div>
          )}

          {!loading && suggestions.length === 0 && !error && (
            <div className="p-4 text-sm text-slate-500 dark:text-slate-400 italic text-center">
              No results — Create new {module}
            </div>
          )}

          {suggestions.map((item, index) => {
            const isSelected = index === activeIndex;
            return (
              <div
                key={item.id || index}
                role="option"
                aria-selected={isSelected}
                onClick={() => handleSelect(item)}
                className={`p-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                }`}
              >
                {renderItem(item, highlightText)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
