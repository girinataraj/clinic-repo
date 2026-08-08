import { useState } from 'react';
import { ROM_CONFIG, getRomKey, getRomDegreesPlaceholder, type RomData, type RomEntry } from './clinicalConfig';
import { SectionCard } from './FormComponents';
import { Activity, ChevronDown, ChevronUp } from 'lucide-react';

interface RomMatrixProps {
  data: RomData;
  onChange: (data: RomData) => void;
  isDoctorRole?: boolean;
}

function parseRange(placeholder: string) {
  const clean = placeholder.replace('°', '').trim();
  if (clean.includes('-')) {
    const parts = clean.split('-');
    const min = parseInt(parts[0].trim(), 10);
    const max = parseInt(parts[1].trim(), 10);
    return { min, max };
  } else {
    const val = parseInt(clean, 10);
    if (!isNaN(val)) {
      return { min: val, max: val };
    }
  }
  return null;
}

function RomInput({ value, onChange, placeholder, isDoctorRole }: { value: string; onChange: (v: string) => void; placeholder: string; isDoctorRole?: boolean }) {
  const [localValue, setLocalValue] = useState(value);
  const [isInvalid, setIsInvalid] = useState(false);

  useEffect(() => {
    setLocalValue(value);
    setIsInvalid(false);
  }, [value]);

  const range = parseRange(placeholder);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const clean = raw.replace(/\D/g, ''); // only allow digits
    
    if (clean === '') {
      setLocalValue('');
      onChange('');
      setIsInvalid(false);
    } else {
      const num = parseInt(clean, 10);
      if (range && !isNaN(num) && num >= range.min && num <= range.max) {
        setLocalValue(clean);
        onChange(clean);
        setIsInvalid(false);
      } else {
        // Reject the input value (do not update localValue) but show red border
        setIsInvalid(true);
      }
    }
  };

  const focusRing = isDoctorRole 
    ? "focus:border-[#262842] focus:ring-[#262842]" 
    : "focus:border-teal-500 focus:ring-1 focus:ring-teal-500";

  const borderColor = isInvalid 
    ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1" 
    : "border-slate-200 dark:border-slate-700 " + focusRing;

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full text-center outline-none px-1 py-1.5 rounded-lg border bg-slate-50 dark:bg-slate-800 text-[11px] font-black text-slate-900 dark:text-white placeholder:text-slate-400 ${borderColor} transition-colors`}
    />
  );
}

export function RomMatrix({ data, onChange, isDoctorRole }: RomMatrixProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [expandedJoint, setExpandedJoint] = useState<string | null>(null);

  const updateEntry = (key: string, field: keyof RomEntry, value: string) => {
    const existing = data[key] ?? {};
    onChange({ ...data, [key]: { ...existing, [field]: value } });
  };

  const toggleSection = (label: string) => {
    if (expandedSection === label) {
      setExpandedSection(null);
      setExpandedJoint(null);
    } else {
      setExpandedSection(label);
      setExpandedJoint(null); // reset joint when section changes
    }
  };

  const toggleJoint = (label: string) => {
    setExpandedJoint(expandedJoint === label ? null : label);
  };

  const accent = isDoctorRole ? "doctor" : "emerald";
  const sectionActiveBg = isDoctorRole ? "bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/50" : "bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-900/50";
  const sectionActiveDot = isDoctorRole ? "bg-[#262842]" : "bg-emerald-500";
  const sectionActiveText = isDoctorRole ? "text-[#262842] dark:text-indigo-400" : "text-emerald-800 dark:text-emerald-400";
  const sectionActiveIcon = isDoctorRole ? "text-[#262842] dark:text-indigo-400" : "text-emerald-600 dark:text-emerald-500";
  const chipBg = isDoctorRole ? "bg-indigo-100 dark:bg-indigo-900/30 text-[#262842] dark:text-indigo-400" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400";

  return (
    <SectionCard
      icon={<Activity size={20} className={isDoctorRole ? "text-[#262842]" : "text-emerald-600 dark:text-emerald-400"} />}
      title="Range of Motion (ROM)"
      subtitle="Joint range of motion assessment"
      accent={accent}
    >
      <div className="flex flex-col gap-3">
        {ROM_CONFIG.map(section => {
          const isSectionExpanded = expandedSection === section.label;

          return (
            <div key={section.label} className="rounded-[16px] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm bg-white dark:bg-slate-900">
              {/* Section Accordion Header */}
              <button
                onClick={() => toggleSection(section.label)}
                className={`w-full px-4 py-3.5 flex items-center justify-between transition-colors ${
                  isSectionExpanded 
                    ? sectionActiveBg 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`w-2 h-2 rounded-full ${isSectionExpanded ? sectionActiveDot : 'bg-slate-300 dark:bg-slate-600'}`} />
                  <span className={`text-[14px] font-extrabold ${isSectionExpanded ? sectionActiveText : 'text-slate-800 dark:text-slate-200'}`}>
                    {section.label}
                  </span>
                </div>
                {isSectionExpanded ? (
                  <ChevronUp size={18} className={sectionActiveIcon} />
                ) : (
                  <ChevronDown size={18} className="text-slate-400" />
                )}
              </button>

              {/* Section Content */}
              {isSectionExpanded && (
                <div className="p-2 flex flex-col gap-2 bg-slate-50/50 dark:bg-slate-900/50">
                  {section.joints.map(joint => {
                    const isJointExpanded = expandedJoint === joint.label;
                    
                    let completed = 0;
                    let total = joint.movements.length * 2; // 2 inputs per movement (ROM RT, ROM LT)
                    joint.movements.forEach(movement => {
                      const key = getRomKey(joint.label, movement);
                      const entry = data[key];
                      if (entry) {
                        if (entry.romRt) completed++;
                        if (entry.romLt) completed++;
                      }
                    });

                    return (
                      <div key={joint.label} className="rounded-[14px] border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
                        {/* Joint Accordion Header */}
                        <button
                          onClick={() => toggleJoint(joint.label)}
                          className={`w-full px-3 py-2.5 flex items-center justify-between transition-colors ${
                            isJointExpanded 
                              ? 'bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700/30'
                          }`}
                        >
                          <span className="text-[13px] font-bold text-slate-800 dark:text-white">{joint.label}</span>
                          <div className="flex items-center gap-2">
                            {completed > 0 && (
                              <span className={`px-2 py-0.5 rounded-full ${chipBg} text-[10px] font-black`}>
                                {completed}/{total}
                              </span>
                            )}
                            {isJointExpanded ? (
                              <ChevronUp size={16} className="text-slate-400" />
                            ) : (
                              <ChevronDown size={16} className="text-slate-400" />
                            )}
                          </div>
                        </button>

                        {/* Joint Content */}
                        {isJointExpanded && (
                          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
                            {joint.movements.map(movement => {
                              const key = getRomKey(joint.label, movement);
                              const entry = data[key] ?? {};
                              const ph = getRomDegreesPlaceholder(joint.label, movement);
                              return (
                                <div key={key} className="px-3 py-3">
                                  <p className="text-[12px] font-extrabold text-slate-700 dark:text-slate-300 mb-2">{movement}</p>
                                  <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">ROM RT</span>
                                      <RomInput value={entry.romRt ?? ''} onChange={v => updateEntry(key, 'romRt', v)} placeholder={ph} isDoctorRole={isDoctorRole} />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider text-center">ROM LT</span>
                                      <RomInput value={entry.romLt ?? ''} onChange={v => updateEntry(key, 'romLt', v)} placeholder={ph} isDoctorRole={isDoctorRole} />
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
              )}
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
