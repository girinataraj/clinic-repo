import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Phone, User, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { SearchPatientResult } from '../../types';

interface PatientSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (patient: SearchPatientResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Global in-memory cache to store query results during the session
const searchCache: Record<string, SearchPatientResult[]> = {};

// Max items to keep in recently searched list
const MAX_RECENT_PATIENTS = 5;

// Helper to escape regex special characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function PatientSearchInput({
  value,
  onChange,
  onSelect,
  placeholder = 'Search by mobile number...',
  className = '',
  disabled = false,
}: PatientSearchInputProps) {
  const [suggestions, setSuggestions] = useState<SearchPatientResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  // Load recently searched patients from localStorage
  const [recentPatients, setRecentPatients] = useState<SearchPatientResult[]>(() => {
    try {
      const saved = localStorage.getItem('recent_searched_patients');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const wrapperRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce the input value by 300ms
  const debouncedValue = useDebounce(value, 300);

  // Setup click-outside hook to close the dropdown
  useClickOutside(wrapperRef, () => {
    setIsOpen(false);
  });

  // Handle live search when debounced value changes
  useEffect(() => {
    // Only search if the input has at least 3 digits
    const cleanedQuery = debouncedValue.replace(/\D/g, ''); // Extract digits
    if (cleanedQuery.length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    // Check query cache first to avoid redundant API requests
    if (searchCache[cleanedQuery]) {
      setSuggestions(searchCache[cleanedQuery]);
      setError(null);
      return;
    }

    // Abort the previous fetch request if one was in flight
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    setLoading(true);
    setError(null);

    api.get<{ success: boolean; data: SearchPatientResult[] }>('/patients/search', {
      params: { mobile: cleanedQuery },
      signal: abortController.signal,
    })
      .then((response) => {
        const results = response.data.data || [];
        // Cache the results
        searchCache[cleanedQuery] = results;
        setSuggestions(results);
      })
      .catch((err) => {
        // Ignore abort errors
        if (err.name === 'CanceledError' || err.name === 'AbortError') {
          return;
        }
        console.error('Search API failure:', err);
        setError('Failed to fetch patients. Please try again.');
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      // Abort controller clean up
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [debouncedValue]);

  // Handle when input gets focused
  const handleFocus = () => {
    setIsOpen(true);
    setActiveIndex(-1);
  };

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    const currentList = suggestions.length > 0 ? suggestions : recentPatients;
    const hasItems = currentList.length > 0;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (hasItems) {
          setActiveIndex((prevIndex) => 
            prevIndex === currentList.length - 1 ? 0 : prevIndex + 1
          );
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (hasItems) {
          setActiveIndex((prevIndex) => 
            prevIndex <= 0 ? currentList.length - 1 : prevIndex - 1
          );
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (hasItems && activeIndex >= 0 && activeIndex < currentList.length) {
          handleSelectPatient(currentList[activeIndex]);
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

  // Logic to handle selecting a patient
  const handleSelectPatient = (patient: SearchPatientResult) => {
    onChange(patient.mobile);
    onSelect(patient);
    setIsOpen(false);

    // Save to recently searched list
    setRecentPatients((prev) => {
      const filtered = prev.filter((p) => p.id !== patient.id);
      const updated = [patient, ...filtered].slice(0, MAX_RECENT_PATIENTS);
      try {
        localStorage.setItem('recent_searched_patients', JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving recent patients:', err);
      }
      return updated;
    });
  };

  // Helper function to highlight the matched text
  const renderHighlighted = (text: string, searchVal: string) => {
    const cleanedSearch = searchVal.replace(/\D/g, ''); // Highlight digit matches
    if (!cleanedSearch) return <span>{text}</span>;

    const regex = new RegExp(`(${escapeRegExp(cleanedSearch)})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, i) => (
          regex.test(part) ? (
            <mark key={i} className="bg-amber-100 dark:bg-amber-900/60 text-amber-900 dark:text-amber-100 font-extrabold rounded-sm px-0.5">
              {part}
            </mark>
          ) : (
            part
          )
        ))}
      </span>
    );
  };

  // Format date helper
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'No visits recorded';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const showSuggestions = value.replace(/\D/g, '').length >= 3;

  return (
    <div ref={wrapperRef} className={`relative w-full ${className}`}>
      {/* Input container */}
      <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 dark:focus-within:border-blue-500 shadow-sm transition-all">
        <div className="pl-3.5 flex items-center justify-center text-slate-400">
          <Search size={18} />
        </div>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full bg-transparent py-3 px-3 outline-none text-[14px] font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
        />
        {loading && (
          <div className="pr-3.5 flex items-center justify-center text-blue-500">
            <Loader2 size={16} className="animate-spin" />
          </div>
        )}
      </div>

      {/* Suggestion Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl z-50 overflow-hidden max-h-[350px] overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150">
          
          {/* Inline Error Message */}
          {error && (
            <div className="p-3 text-[12px] font-semibold bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-b border-red-100 dark:border-red-900/50">
              {error}
            </div>
          )}

          {/* Search suggestions list */}
          {showSuggestions ? (
            <>
              {suggestions.length > 0 ? (
                <div role="listbox">
                  {suggestions.map((patient, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <div
                        key={patient.id}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleSelectPatient(patient)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`px-4 py-3 flex items-center justify-between border-b last:border-0 border-slate-100 dark:border-slate-700 cursor-pointer transition-colors ${
                          isActive 
                            ? 'bg-blue-50/70 dark:bg-blue-950/30' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-slate-400 shrink-0" />
                            <span className="text-[14px] font-extrabold text-slate-800 dark:text-slate-200">
                              {patient.name}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              {patient.displayId}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400">
                            <Phone size={11} className="text-slate-400 shrink-0" />
                            {renderHighlighted(patient.mobile, value)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          <Calendar size={11} className="text-slate-400 shrink-0" />
                          <span>Last visit: {formatDate(patient.lastVisitDate)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                !loading && (
                  <div className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                    <User size={28} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-[13px] font-bold">No patients found</p>
                    <p className="text-[11px] mt-1">Check the number or add a new patient record.</p>
                  </div>
                )
              )}
            </>
          ) : (
            /* Recently Searched Patients list when focused and input is empty / short */
            recentPatients.length > 0 && (
              <div>
                <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700">
                  <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 dark:text-slate-500">
                    Recently Searched Patients
                  </span>
                </div>
                <div role="listbox">
                  {recentPatients.map((patient, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <div
                        key={patient.id}
                        role="option"
                        aria-selected={isActive}
                        onClick={() => handleSelectPatient(patient)}
                        onMouseEnter={() => setActiveIndex(index)}
                        className={`px-4 py-3 flex items-center justify-between border-b last:border-0 border-slate-100 dark:border-slate-700 cursor-pointer transition-colors ${
                          isActive 
                            ? 'bg-blue-50/70 dark:bg-blue-950/30' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-slate-400 shrink-0" />
                            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-200">
                              {patient.name}
                            </span>
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                              {patient.displayId}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[12px] font-medium text-slate-500 dark:text-slate-400">
                            <Phone size={11} className="text-slate-400 shrink-0" />
                            <span>{patient.mobile}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          <Calendar size={11} className="text-slate-400 shrink-0" />
                          <span>Last visit: {formatDate(patient.lastVisitDate)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
