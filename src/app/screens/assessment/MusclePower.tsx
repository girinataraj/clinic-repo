import { useState, useEffect } from 'react';
import { ROM_CONFIG, getRomKey, getRomDegreesPlaceholder, type RomData, type RomEntry } from './clinicalConfig';
import { SectionCard } from './FormComponents';
import { Activity } from 'lucide-react';

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

function ValidatedTableInput({ value, onChange, placeholder, focusBorder, isRom }: { value: string; onChange: (v: string) => void; placeholder: string; focusBorder: string; isRom: boolean }) {
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
        // Reject input value completely but show red border
        setIsInvalid(true);
      }
    }
  };

  const borderColor = isInvalid 
    ? "border-red-500 dark:border-red-500 focus:border-red-500 focus:ring-red-500 focus:ring-1" 
    : "border-slate-100 dark:border-slate-800 " + focusBorder;

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      className={`w-full text-center outline-none py-1.5 rounded-md border bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder:text-slate-400/70 ${borderColor} transition-colors ${isRom ? 'text-[10px] font-bold' : 'text-[11px] font-black'}`}
    />
  );
}

interface MusclePowerProps {
  data: RomData;
  onChange: (data: RomData) => void;
  isDoctorRole?: boolean;
  chiefComplaints?: string[];
}

export function MusclePower({ data, onChange, isDoctorRole }: MusclePowerProps) {
  const updateEntry = (key: string, field: keyof RomEntry, value: string) => {
    const existing = data[key] ?? {};
    onChange({ ...data, [key]: { ...existing, [field]: value } });
  };

  const handlePowerChange = (romKey: string, field: 'powerRt' | 'powerLt', rawValue: string) => {
    const clean = rawValue.replace(/[^0-9]/g, '');
    updateEntry(romKey, field, clean.slice(0, 1));
  };

  const handleRomChange = (romKey: string, field: 'romRt' | 'romLt', rawValue: string) => {
    const clean = rawValue.replace(/[^0-9]/g, '');
    updateEntry(romKey, field, clean.slice(0, 3));
  };

  const accent = isDoctorRole ? "doctor" : "fuchsia";

  // Flatten ROM_CONFIG to rows with calculated row spans for sections and joints
  const rows: any[] = [];
  ROM_CONFIG.forEach((section) => {
    const totalMovements = section.joints.reduce((acc, j) => acc + j.movements.length, 0);

    let isFirstSectionRow = true;
    section.joints.forEach((joint) => {
      let isFirstJointRow = true;
      joint.movements.forEach((movement) => {
        rows.push({
          section: section.label,
          joint: joint.label,
          movement: movement,
          romKey: getRomKey(joint.label, movement),
          sectionRowSpan: isFirstSectionRow ? totalMovements : 0,
          jointRowSpan: isFirstJointRow ? joint.movements.length : 0,
        });
        isFirstSectionRow = false;
        isFirstJointRow = false;
      });
    });
  });

  const focusBorder = isDoctorRole ? "focus:border-[#262842] dark:focus:border-indigo-400" : "focus:border-fuchsia-500 dark:focus:border-fuchsia-400";

  return (
    <SectionCard
      icon={<Activity size={20} className={isDoctorRole ? "text-[#262842]" : "text-fuchsia-600 dark:text-fuchsia-400"} />}
      title="Muscle Power & ROM"
      subtitle="Joint muscle strength and range of motion matrix"
      accent={accent}
    >
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                <th colSpan={3} className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-center text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  MUSCLE POWER & ROM
                </th>
                <th colSpan={2} className="border-r border-slate-200 dark:border-slate-800 px-3 py-2.5 text-center text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-900/40">
                  POWER
                </th>
                <th colSpan={2} className="px-3 py-2.5 text-center text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-900/40">
                  ROM
                </th>
              </tr>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider w-[100px]">
                  LIMB
                </th>
                <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider w-[110px]">
                  JOINT
                </th>
                <th className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-left text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider pl-4">
                  MOVEMENT
                </th>
                <th className="border-r border-slate-200 dark:border-slate-800 px-2 py-2 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider w-[70px] bg-slate-50/50 dark:bg-slate-900/20">
                  RT
                </th>
                <th className="border-r border-slate-200 dark:border-slate-800 px-2 py-2 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider w-[70px] bg-slate-50/50 dark:bg-slate-900/20">
                  LT
                </th>
                <th className="border-r border-slate-200 dark:border-slate-800 px-2 py-2 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider w-[75px] bg-slate-50/50 dark:bg-slate-900/20">
                  RT
                </th>
                <th className="px-2 py-2 text-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider w-[75px] bg-slate-50/50 dark:bg-slate-900/20">
                  LT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {rows.map((row, index) => {
                const entry = data[row.romKey] ?? {};
                const romPlaceholder = getRomDegreesPlaceholder(row.joint, row.movement);

                return (
                  <tr key={index} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/10 transition-colors">
                    {row.sectionRowSpan > 0 && (
                      <td rowSpan={row.sectionRowSpan} className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-center text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-900/60 w-[100px] align-middle">
                        {row.section}
                      </td>
                    )}
                    {row.jointRowSpan > 0 && (
                      <td rowSpan={row.jointRowSpan} className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-center text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider bg-slate-50/30 dark:bg-slate-900/30 w-[110px] align-middle">
                        {row.joint}
                      </td>
                    )}
                    <td className="border-r border-slate-200 dark:border-slate-800 px-3 py-2 text-left text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider pl-4">
                      {row.movement}
                    </td>
                    <td className="border-r border-slate-200 dark:border-slate-800 p-1 w-[70px]">
                      <ValidatedTableInput
                        value={entry.powerRt ?? ''}
                        onChange={v => updateEntry(row.romKey, 'powerRt', v)}
                        placeholder="0-5"
                        focusBorder={focusBorder}
                        isRom={false}
                      />
                    </td>
                    <td className="border-r border-slate-200 dark:border-slate-800 p-1 w-[70px]">
                      <ValidatedTableInput
                        value={entry.powerLt ?? ''}
                        onChange={v => updateEntry(row.romKey, 'powerLt', v)}
                        placeholder="0-5"
                        focusBorder={focusBorder}
                        isRom={false}
                      />
                    </td>
                    <td className="border-r border-slate-200 dark:border-slate-800 p-1 w-[75px]">
                      <ValidatedTableInput
                        value={entry.romRt ?? ''}
                        onChange={v => updateEntry(row.romKey, 'romRt', v)}
                        placeholder={romPlaceholder}
                        focusBorder={focusBorder}
                        isRom={true}
                      />
                    </td>
                    <td className="p-1 w-[75px]">
                      <ValidatedTableInput
                        value={entry.romLt ?? ''}
                        onChange={v => updateEntry(row.romKey, 'romLt', v)}
                        placeholder={romPlaceholder}
                        focusBorder={focusBorder}
                        isRom={true}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}
