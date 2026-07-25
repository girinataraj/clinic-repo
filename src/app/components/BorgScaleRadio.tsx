import React, { useRef } from 'react';

export const BORG_DISPLAY_LABELS: Record<string, string> = {
  '6': 'No Exertion',
  '7': 'Extremely Light',
  '8': '',
  '9': 'Very light',
  '10': '',
  '11': 'Light',
  '12': '',
  '13': 'Somewhat Hard',
  '14': '',
  '15': 'Hard',
  '16': '',
  '17': 'Very Hard',
  '18': '',
  '19': 'Extremely Hard',
  '20': 'Maximal Exertion'
};

interface BorgScaleRadioProps {
  value?: number | string | null;
  onChange?: (value: number | string | null) => void;
  disabled?: boolean;
  className?: string;
  isDoctorRole?: boolean;
}

export function BorgScaleRadio({ value, onChange, disabled = false, className = '', isDoctorRole = false }: BorgScaleRadioProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValue = value !== undefined && value !== null && value !== '' ? String(value).trim() : null;

  const handleSelect = (rating: string) => {
    if (disabled) return;
    // Single selection logic: checking a new rating unchecks the previous selection
    if (selectedValue === rating) {
      onChange && onChange(null);
    } else {
      onChange && onChange(rating);
    }
  };

  return (
    <div className={`w-full flex flex-col gap-4 ${className}`}>
      {/* Table matching exact structure from design picture */}
      <div 
        ref={containerRef}
        role="radiogroup"
        aria-label="Borg Scale Perceived Exertion Table"
        className="overflow-x-auto max-h-[420px] overflow-y-auto border border-slate-300 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 shadow-sm"
      >
        <table className="w-full border-collapse text-left text-sm font-semibold">
          <thead className="sticky top-0 bg-slate-100 dark:bg-slate-800 z-10 border-b border-slate-300 dark:border-slate-700">
            <tr className="text-slate-800 dark:text-slate-200">
              <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-center w-[20%] border-r border-slate-300 dark:border-slate-700">
                Rating
              </th>
              <th className="py-3 px-4 font-extrabold uppercase tracking-wider">
                Perceived Exertion
              </th>
              <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-center w-[20%] border-l border-slate-300 dark:border-slate-700">
                Select
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {Object.keys(BORG_DISPLAY_LABELS).map((rating) => {
              const isSelected = selectedValue === rating;
              const rowBgClass = isSelected
                ? isDoctorRole
                  ? 'bg-indigo-100/70 dark:bg-indigo-950/50 font-bold text-indigo-950 dark:text-indigo-200'
                  : 'bg-blue-100/70 dark:bg-blue-950/50 font-bold text-blue-950 dark:text-blue-200'
                : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200';

              return (
                <tr
                  key={rating}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={disabled ? -1 : isSelected ? 0 : -1}
                  onClick={() => handleSelect(rating)}
                  className={`transition-colors duration-150 cursor-pointer ${rowBgClass}`}
                >
                  <td className="py-2.5 px-4 text-center font-bold text-base border-r border-slate-300 dark:border-slate-800">
                    {rating}
                  </td>
                  <td className="py-2.5 px-4 text-sm text-slate-700 dark:text-slate-300">
                    {BORG_DISPLAY_LABELS[rating]}
                  </td>
                  <td className="py-2.5 px-4 text-center border-l border-slate-300 dark:border-slate-800">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelect(rating)}
                      onClick={(e) => e.stopPropagation()}
                      disabled={disabled}
                      aria-label={`Select Borg rating ${rating}`}
                      className={`h-5 w-5 rounded cursor-pointer transition-all ${
                        isDoctorRole
                          ? 'accent-[#262842] text-[#262842] focus:ring-[#262842]'
                          : 'accent-blue-600 text-blue-600 focus:ring-blue-500'
                      }`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Single Selection Feedback Banner */}
      {selectedValue !== null && (
        <div className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/30 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Selected Exertion Rating
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              Rating {selectedValue} {BORG_DISPLAY_LABELS[selectedValue] ? `— ${BORG_DISPLAY_LABELS[selectedValue]}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleSelect(selectedValue)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white underline cursor-pointer"
          >
            Clear selection
          </button>
        </div>
      )}
    </div>
  );
}

export default BorgScaleRadio;
