import { useRef, useState, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

// ── Section Card ──────────────────────────────────────────────────────────────
export function SectionCard({ icon, title, subtitle, children, accent = 'teal' }: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  accent?: string;
}) {
  const bg = accent === 'teal' ? 'bg-teal-50 dark:bg-teal-900/30' : accent === 'rose' ? 'bg-rose-50 dark:bg-rose-900/30' : accent === 'blue' ? 'bg-blue-50 dark:bg-blue-900/30' : accent === 'amber' ? 'bg-amber-50 dark:bg-amber-900/30' : accent === 'fuchsia' ? 'bg-fuchsia-50 dark:bg-fuchsia-900/30' : accent === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-900/30' : accent === 'orange' ? 'bg-orange-50 dark:bg-orange-900/30' : 'bg-slate-50 dark:bg-slate-900/30';
  return (
    <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
        <div className={`rounded-xl flex items-center justify-center w-9 h-9 ${bg} shrink-0`}>{icon}</div>
        <div>
          <h2 className="text-[15px] font-extrabold text-slate-900 dark:text-white leading-tight">{title}</h2>
          {subtitle && <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

// ── Form Field ────────────────────────────────────────────────────────────────
export function FormField({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div className="mb-3.5">
      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

export const inputClass = "w-full outline-none px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors";

// ── Multi-select Searchable Dropdown ──────────────────────────────────────────
export function MultiSelectDropdown({ options, selected, onChange, placeholder, accent = 'teal' }: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
  placeholder?: string;
  accent?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const chipBg = accent === 'fuchsia' ? 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800' : accent === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' : 'bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
  const hoverBg = accent === 'fuchsia' ? 'hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20' : accent === 'blue' ? 'hover:bg-blue-50 dark:hover:bg-blue-900/20' : 'hover:bg-teal-50 dark:hover:bg-teal-900/20';

  return (
    <div ref={ref} className="relative">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map(item => (
            <span key={item} className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${chipBg}`}>
              {item}
              <button type="button" onClick={() => onChange(selected.filter(x => x !== item))} className="opacity-60 hover:opacity-100"><X size={10} /></button>
            </span>
          ))}
        </div>
      )}
      <div onClick={() => setOpen(!open)} className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer ${open ? 'border-teal-400 ring-1 ring-teal-400' : 'hover:border-slate-300'} transition-colors`}>
        <Search size={13} className="text-slate-400 shrink-0" />
        <input value={search} onChange={e => { setSearch(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder={placeholder ?? `Search… (${selected.length} selected)`} className="flex-1 bg-transparent outline-none text-[12px] text-slate-800 dark:text-white placeholder:text-slate-400" />
        <ChevronDown size={12} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 max-h-44 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl">
          {filtered.length === 0 && <p className="px-3 py-3 text-[11px] text-slate-400 text-center font-semibold">No results</p>}
          {filtered.map(item => {
            const isSelected = selected.includes(item);
            return (
              <button key={item} type="button" onClick={() => { onChange(isSelected ? selected.filter(x => x !== item) : [...selected, item]); setSearch(''); }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0 ${isSelected ? (accent === 'fuchsia' ? 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700' : accent === 'blue' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700' : 'bg-teal-50 dark:bg-teal-900/20 text-teal-700') : `text-slate-700 dark:text-slate-300 ${hoverBg}`}`}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${isSelected ? (accent === 'fuchsia' ? 'bg-fuchsia-600 border-fuchsia-600' : accent === 'blue' ? 'bg-blue-600 border-blue-600' : 'bg-teal-600 border-teal-600') : 'border-slate-300 dark:border-slate-600'}`}>
                  {isSelected && <Check size={10} strokeWidth={3} color="white" />}
                </div>
                {item}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Toggle Chip Button ────────────────────────────────────────────────────────
export function ToggleChip({ label, checked, onChange, accent = 'teal' }: {
  label: string; checked: boolean; onChange: () => void; accent?: string;
}) {
  const sel = accent === 'fuchsia' ? 'border-fuchsia-600 bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700' : accent === 'blue' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-700' : 'border-teal-600 bg-teal-50 dark:bg-teal-900/20 text-teal-700';
  return (
    <button type="button" onClick={onChange}
      className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-left border-[1.5px] transition-colors text-[12px] font-semibold ${checked ? sel : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100'}`}>
      <div className={`w-[18px] h-[18px] rounded border-2 flex items-center justify-center shrink-0 ${checked ? (accent === 'fuchsia' ? 'bg-fuchsia-600 border-fuchsia-600' : accent === 'blue' ? 'bg-blue-600 border-blue-600' : 'bg-teal-600 border-teal-600') : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'}`}>
        {checked && <Check size={11} strokeWidth={3} color="white" />}
      </div>
      {label}
    </button>
  );
}
