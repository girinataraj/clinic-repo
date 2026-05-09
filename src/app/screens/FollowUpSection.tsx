import { useState, useRef, useEffect } from 'react';
import {
  type FollowUpMode,
  type FollowUpSessionData,
} from './assessment/clinicalConfig';
import {
  RefreshCw,
  Dumbbell,
  MoreHorizontal,
  Check,
  X,
  Search,
  Plus,
  Eye,
  ChevronDown,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface FollowUpSectionProps {
  followUp: FollowUpSessionData;
  onChange: (data: FollowUpSessionData) => void;
  /** Previous treatment plan from the last evaluation (for "Same as today" preview) */
  previousTreatmentPlan?: Record<string, unknown> | null;
  /** Assigned exercises from the patient's exercise plan */
  exercises: { title: string; sets?: number; reps?: number }[];
  allTreatments?: any[];
}

const MODE_CONFIG: { key: FollowUpMode; label: string; icon: typeof RefreshCw; desc: string }[] = [
  { key: 'same_as_today', label: 'Same as Today', icon: RefreshCw, desc: 'Repeat last treatment' },
  { key: 'assigned_exercise', label: 'Assigned Exercise', icon: Dumbbell, desc: 'From exercise plan' },
  { key: 'others', label: 'Others', icon: MoreHorizontal, desc: 'Custom treatments' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export function FollowUpSection({ followUp, onChange, previousTreatmentPlan, exercises, allTreatments }: FollowUpSectionProps) {
  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target as Node)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleMode = (mode: FollowUpMode) => {
    const current = followUp.followUpModes;
    onChange({
      ...followUp,
      followUpModes: current.includes(mode)
        ? current.filter(m => m !== mode)
        : [...current, mode],
    });
  };

  const addOtherTreatment = (item: string) => {
    const trimmed = item.trim();
    if (!trimmed || followUp.otherTreatments.includes(trimmed)) return;
    onChange({
      ...followUp,
      otherTreatments: [...followUp.otherTreatments, trimmed],
    });
    setSearch('');
    setShowSuggestions(false);
  };

  const removeOtherTreatment = (item: string) => {
    onChange({
      ...followUp,
      otherTreatments: followUp.otherTreatments.filter(t => t !== item),
    });
  };

  // Filter suggestions: exclude already-selected, match search
  const ALL_TREATMENT_NAMES = (allTreatments || []).map((t: any) => t.treatmentName);
  const filteredSuggestions = ALL_TREATMENT_NAMES.filter(
    (opt: string) =>
      !followUp.otherTreatments.includes(opt) &&
      opt.toLowerCase().includes(search.toLowerCase())
  );
  const showCustomAdd = search.trim() && !ALL_TREATMENT_NAMES.some(
    (o: string) => o.toLowerCase() === search.trim().toLowerCase()
  ) && !followUp.otherTreatments.some(
    (o: string) => o.toLowerCase() === search.trim().toLowerCase()
  );

  // Extract previous plan items for preview
  const prevPlanItems: string[] = [];
  if (previousTreatmentPlan) {
    const tp = previousTreatmentPlan as any;
    if (Array.isArray(tp.modalities)) prevPlanItems.push(...tp.modalities);
    if (Array.isArray(tp.manualTherapy)) prevPlanItems.push(...tp.manualTherapy);
    if (Array.isArray(tp.rehabilitation)) prevPlanItems.push(...tp.rehabilitation);
  }

  const isActive = (mode: FollowUpMode) => followUp.followUpModes.includes(mode);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-emerald-50">
        <h3 className="text-[14px] font-extrabold text-slate-900 flex items-center gap-2">
          <RefreshCw size={16} className="text-teal-600" />
          Follow-up Treatment
        </h3>
        <p className="text-[11px] text-slate-500 font-medium mt-0.5">Select what the next session should include</p>
      </div>

      {/* Mode selection chips */}
      <div className="p-4 pb-2">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2.5">Treatment Mode</p>
        <div className="flex flex-col gap-2">
          {MODE_CONFIG.map(({ key, label, icon: Icon, desc }) => {
            const active = isActive(key);
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggleMode(key)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 transition-all active:scale-[0.98] ${
                  active
                    ? 'border-teal-500 bg-teal-50 text-teal-800'
                    : 'border-slate-150 bg-slate-50 text-slate-600 hover:border-slate-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  active ? 'bg-teal-600' : 'bg-slate-200'
                }`}>
                  <Icon size={16} className={active ? 'text-white' : 'text-slate-500'} />
                </div>
                <div className="flex-1 text-left">
                  <p className={`text-[13px] font-extrabold ${active ? 'text-teal-800' : 'text-slate-700'}`}>{label}</p>
                  <p className="text-[10px] font-medium text-slate-400">{desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${
                  active ? 'bg-teal-600 border-teal-600' : 'border-slate-300 bg-white'
                }`}>
                  {active && <Check size={12} strokeWidth={3} className="text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conditional panels */}
      <div className="px-4 pb-4">
        {/* Same as Today preview */}
        {isActive('same_as_today') && (
          <div className="mt-2 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Eye size={12} className="text-blue-600" />
              <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider">Previous Treatment Preview</p>
            </div>
            {prevPlanItems.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {prevPlanItems.map(item => (
                  <span key={item} className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 text-[11px] font-bold border border-blue-200">
                    {item}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-blue-500 font-medium italic">No previous treatment plan found. Data will appear after an assessment is saved.</p>
            )}
          </div>
        )}

        {/* Assigned Exercise preview */}
        {isActive('assigned_exercise') && (
          <div className="mt-2 p-3 rounded-xl bg-violet-50/60 border border-violet-100">
            <div className="flex items-center gap-1.5 mb-2">
              <Dumbbell size={12} className="text-violet-600" />
              <p className="text-[10px] font-black text-violet-700 uppercase tracking-wider">Assigned Exercises</p>
            </div>
            {exercises.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {exercises.map((ex, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-violet-100/70 border border-violet-200">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                    <span className="text-[12px] font-bold text-violet-800 flex-1">{ex.title}</span>
                    {ex.sets && ex.reps && (
                      <span className="text-[10px] font-semibold text-violet-500">{ex.sets}×{ex.reps}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-violet-500 font-medium italic">No exercises currently assigned to this patient.</p>
            )}
          </div>
        )}

        {/* Others — autocomplete with free text */}
        {isActive('others') && (
          <div className="mt-2 p-3 rounded-xl bg-amber-50/60 border border-amber-100">
            <div className="flex items-center gap-1.5 mb-2">
              <MoreHorizontal size={12} className="text-amber-600" />
              <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider">Custom Treatments</p>
            </div>

            {/* Selected chips */}
            {followUp.otherTreatments.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {followUp.otherTreatments.map(item => (
                  <span key={item} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-[11px] font-bold border border-amber-200">
                    {item}
                    <button type="button" onClick={() => removeOtherTreatment(item)} className="opacity-60 hover:opacity-100 ml-0.5">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Search input with suggestions */}
            <div ref={suggestRef} className="relative">
              <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border bg-white transition-colors ${
                showSuggestions ? 'border-amber-400 ring-1 ring-amber-400' : 'border-amber-200 hover:border-amber-300'
              }`}>
                <Search size={13} className="text-amber-400 shrink-0" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && search.trim()) {
                      e.preventDefault();
                      addOtherTreatment(search.trim());
                    }
                  }}
                  placeholder="Search or type custom treatment…"
                  className="flex-1 bg-transparent outline-none text-[12px] text-slate-800 placeholder:text-slate-400"
                />
                <ChevronDown size={12} className={`text-slate-400 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
              </div>

              {showSuggestions && (search || filteredSuggestions.length > 0) && (
                <div className="absolute z-30 left-0 right-0 bottom-full mb-1 max-h-40 overflow-y-auto rounded-xl border border-amber-200 bg-white shadow-xl">
                  {filteredSuggestions.map(item => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => addOtherTreatment(item)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] font-semibold text-slate-700 hover:bg-amber-50 transition-colors border-b border-slate-50 last:border-0"
                    >
                      <Plus size={12} className="text-amber-500 shrink-0" />
                      {item}
                    </button>
                  ))}
                  {showCustomAdd && (
                    <button
                      type="button"
                      onClick={() => addOtherTreatment(search.trim())}
                      className="w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors"
                    >
                      <Plus size={12} className="text-amber-600 shrink-0" />
                      Add "{search.trim()}"
                    </button>
                  )}
                  {filteredSuggestions.length === 0 && !showCustomAdd && (
                    <p className="px-3 py-2.5 text-[11px] text-slate-400 text-center font-semibold">No matching options</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary when modes selected */}
        {followUp.followUpModes.length > 0 && (
          <div className="mt-3 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Follow-up Summary</p>
            <div className="flex flex-wrap gap-1">
              {followUp.followUpModes.map(m => (
                <span key={m} className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-700 text-[10px] font-bold border border-teal-200">
                  {MODE_CONFIG.find(c => c.key === m)?.label}
                </span>
              ))}
              {followUp.otherTreatments.length > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 text-[10px] font-bold border border-amber-200">
                  +{followUp.otherTreatments.length} custom
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
