import { useState } from 'react';
import { ROM_CONFIG, getRomKey, type RomData, type RomEntry } from './clinicalConfig';
import { SectionCard } from './FormComponents';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';

interface MusclePowerProps {
  data: RomData;
  onChange: (data: RomData) => void;
  isDoctorRole?: boolean;
  chiefComplaints?: string[];
}

function PowerInput({ value, onChange, placeholder, isDoctorRole }: { value: string; onChange: (v: string) => void; placeholder: string; isDoctorRole?: boolean }) {
  const focusRing = isDoctorRole ? "focus:border-[#262842] focus:ring-[#262842]" : "focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500";
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full text-center outline-none px-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-black text-slate-900 dark:text-white placeholder:text-slate-400 ${focusRing} transition-colors`}
    />
  );
}

export function MusclePower({ data, onChange, isDoctorRole, chiefComplaints }: MusclePowerProps) {
  const [expandedComplaint, setExpandedComplaint] = useState<string | null>(null);

  const updateEntry = (key: string, field: keyof RomEntry, value: string) => {
    const existing = data[key] ?? {};
    onChange({ ...data, [key]: { ...existing, [field]: value } });
  };

  const toggleComplaint = (label: string) => {
    setExpandedComplaint(expandedComplaint === label ? null : label);
  };

  const accent = isDoctorRole ? "doctor" : "fuchsia";
  const chipBg = isDoctorRole ? "bg-indigo-100 dark:bg-indigo-900/30 text-[#262842] dark:text-indigo-400" : "bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-400";

  // If no complaints selected, show Not Applicable
  if (!chiefComplaints || chiefComplaints.length === 0) {
    return (
      <SectionCard
        icon={<Activity size={20} className={isDoctorRole ? "text-[#262842]" : "text-fuchsia-600 dark:text-fuchsia-400"} />}
        title="Muscle Power"
        subtitle="Power assessment by complaint"
        accent={accent}
      >
        <div className="py-8 flex flex-col items-center text-center">
          <div className={`rounded-full w-14 h-14 flex items-center justify-center mb-3 ${
            isDoctorRole ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-fuchsia-50 dark:bg-fuchsia-900/20'
          }`}>
            <Activity size={24} className={isDoctorRole ? 'text-[#262842]/40 dark:text-indigo-400/40' : 'text-fuchsia-600/40 dark:text-fuchsia-400/40'} />
          </div>
          <p className="text-[14px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
            Not Applicable
          </p>
          <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
            Please select chief complaints to assess muscle power.
          </p>
        </div>
      </SectionCard>
    );
  }

  // Get movements for a complaint
  const getMovementsForComplaint = (complaint: string) => {
    // Try to find a matching joint in ROM_CONFIG
    for (const section of ROM_CONFIG) {
      for (const joint of section.joints) {
        if (complaint.toLowerCase().includes(joint.label.toLowerCase())) {
          return joint.movements;
        }
      }
    }
    // Default movements if no match
    return ['Flexion', 'Extension'];
  };

  return (
    <SectionCard
      icon={<Activity size={20} className={isDoctorRole ? "text-[#262842]" : "text-fuchsia-600 dark:text-fuchsia-400"} />}
      title="Muscle Power"
      subtitle="Power assessment by complaint"
      accent={accent}
    >
      <div className="flex flex-col gap-3">
        {chiefComplaints.map(complaint => {
          const isExpanded = expandedComplaint === complaint;
          const movements = getMovementsForComplaint(complaint);
          
          let completed = 0;
          let total = movements.length * 2; // 2 inputs per movement (RT, LT)
          movements.forEach(movement => {
            const key = getRomKey(complaint, movement);
            const entry = data[key];
            if (entry) {
              if (entry.powerRt) completed++;
              if (entry.powerLt) completed++;
            }
          });

          return (
            <div key={complaint} className="rounded-[14px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden shadow-sm">
              <button
                onClick={() => toggleComplaint(complaint)}
                className={`w-full px-4 py-3.5 flex items-center justify-between transition-colors ${
                  isExpanded 
                    ? 'bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                }`}
              >
                <span className="text-[14px] font-extrabold text-slate-800 dark:text-white">{complaint}</span>
                <div className="flex items-center gap-2.5">
                  {completed > 0 && (
                    <span className={`px-2 py-0.5 rounded-full ${chipBg} text-[10px] font-black`}>
                      {completed}/{total}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="divide-y divide-slate-100 dark:divide-slate-700/50 p-2">
                  {movements.map(movement => {
                    const key = getRomKey(complaint, movement);
                    const entry = data[key] ?? {};
                    return (
                      <div key={key} className="px-3 py-3 bg-slate-50/50 dark:bg-slate-900/50 rounded-lg mb-2 last:mb-0">
                        <p className="text-[12px] font-extrabold text-slate-700 dark:text-slate-300 mb-2">{movement}</p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">Power RT</span>
                            <PowerInput value={entry.powerRt ?? ''} onChange={v => updateEntry(key, 'powerRt', v)} placeholder="—" isDoctorRole={isDoctorRole} />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">Power LT</span>
                            <PowerInput value={entry.powerLt ?? ''} onChange={v => updateEntry(key, 'powerLt', v)} placeholder="—" isDoctorRole={isDoctorRole} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
