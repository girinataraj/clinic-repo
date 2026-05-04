import { ROM_CONFIG, getRomKey, type RomData, type RomEntry } from './clinicalConfig';
import { SectionCard } from './FormComponents';
import { Activity } from 'lucide-react';

interface RomMatrixProps {
  data: RomData;
  onChange: (data: RomData) => void;
}

function RomInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full text-center outline-none px-1 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors"
    />
  );
}

export function RomMatrix({ data, onChange }: RomMatrixProps) {
  const updateEntry = (key: string, field: keyof RomEntry, value: string) => {
    const existing = data[key] ?? {};
    onChange({ ...data, [key]: { ...existing, [field]: value } });
  };

  return (
    <SectionCard
      icon={<Activity size={18} className="text-emerald-600 dark:text-emerald-400" />}
      title="Muscle Power & ROM"
      subtitle="Range of Motion & Power assessment"
      accent="emerald"
    >
      {ROM_CONFIG.map(section => (
        <div key={section.label} className="mb-5 last:mb-0">
          <h3 className="text-[13px] font-extrabold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {section.label}
          </h3>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800">
                  <th className="text-left px-3 py-2 font-bold text-slate-600 dark:text-slate-400 w-24">Joint</th>
                  <th className="text-left px-2 py-2 font-bold text-slate-600 dark:text-slate-400 w-28">Movement</th>
                  <th className="text-center px-2 py-2 font-bold text-slate-600 dark:text-slate-400">Power RT</th>
                  <th className="text-center px-2 py-2 font-bold text-slate-600 dark:text-slate-400">Power LT</th>
                  <th className="text-center px-2 py-2 font-bold text-slate-600 dark:text-slate-400">ROM RT</th>
                  <th className="text-center px-2 py-2 font-bold text-slate-600 dark:text-slate-400">ROM LT</th>
                </tr>
              </thead>
              <tbody>
                {section.joints.map(joint =>
                  joint.movements.map((movement, mi) => {
                    const key = getRomKey(joint.label, movement);
                    const entry = data[key] ?? {};
                    return (
                      <tr key={key} className="border-t border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        {mi === 0 && (
                          <td rowSpan={joint.movements.length} className="px-3 py-2 font-bold text-slate-800 dark:text-white align-top border-r border-slate-100 dark:border-slate-800">
                            {joint.label}
                          </td>
                        )}
                        <td className="px-2 py-1.5 font-semibold text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">{movement}</td>
                        <td className="px-1.5 py-1"><RomInput value={entry.powerRt ?? ''} onChange={v => updateEntry(key, 'powerRt', v)} placeholder="—" /></td>
                        <td className="px-1.5 py-1"><RomInput value={entry.powerLt ?? ''} onChange={v => updateEntry(key, 'powerLt', v)} placeholder="—" /></td>
                        <td className="px-1.5 py-1"><RomInput value={entry.romRt ?? ''} onChange={v => updateEntry(key, 'romRt', v)} placeholder="—" /></td>
                        <td className="px-1.5 py-1"><RomInput value={entry.romLt ?? ''} onChange={v => updateEntry(key, 'romLt', v)} placeholder="—" /></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden flex flex-col gap-2">
            {section.joints.map(joint => (
              <div key={joint.label} className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-[12px] font-bold text-slate-800 dark:text-white">{joint.label}</span>
                </div>
                {joint.movements.map(movement => {
                  const key = getRomKey(joint.label, movement);
                  const entry = data[key] ?? {};
                  return (
                    <div key={key} className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                      <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1.5">{movement}</p>
                      <div className="grid grid-cols-4 gap-1.5">
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block mb-0.5">Pwr RT</span>
                          <RomInput value={entry.powerRt ?? ''} onChange={v => updateEntry(key, 'powerRt', v)} placeholder="—" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block mb-0.5">Pwr LT</span>
                          <RomInput value={entry.powerLt ?? ''} onChange={v => updateEntry(key, 'powerLt', v)} placeholder="—" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block mb-0.5">ROM RT</span>
                          <RomInput value={entry.romRt ?? ''} onChange={v => updateEntry(key, 'romRt', v)} placeholder="—" />
                        </div>
                        <div>
                          <span className="text-[9px] font-bold text-slate-400 block mb-0.5">ROM LT</span>
                          <RomInput value={entry.romLt ?? ''} onChange={v => updateEntry(key, 'romLt', v)} placeholder="—" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ))}
    </SectionCard>
  );
}
