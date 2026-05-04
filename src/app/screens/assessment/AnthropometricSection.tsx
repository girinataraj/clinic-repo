import { useEffect } from 'react';
import { SectionCard, FormField, inputClass } from './FormComponents';
import { calcBMI, calcWHRatio, type Anthropometrics } from './clinicalConfig';
import { Ruler } from 'lucide-react';

interface Props {
  data: Anthropometrics;
  onChange: (data: Anthropometrics) => void;
}

export function AnthropometricSection({ data, onChange }: Props) {
  const update = (field: keyof Anthropometrics, value: string) => {
    onChange({ ...data, [field]: value });
  };

  // Auto-calculate BMI and W/H Ratio
  useEffect(() => {
    const bmi = calcBMI(data.height, data.weight);
    const whr = calcWHRatio(data.waist, data.hip);
    if (bmi !== data.bmi || whr !== data.whRatio) {
      onChange({ ...data, bmi, whRatio: whr });
    }
  }, [data.height, data.weight, data.waist, data.hip]);

  return (
    <SectionCard
      icon={<Ruler size={18} className="text-blue-600 dark:text-blue-400" />}
      title="Anthropometric Measures"
      subtitle="Body metrics & composition"
      accent="blue"
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
        <FormField label="Height (cm)">
          <input type="number" value={data.height} onChange={e => update('height', e.target.value)} placeholder="e.g. 170" className={inputClass} />
        </FormField>
        <FormField label="Weight (kg)">
          <input type="number" value={data.weight} onChange={e => update('weight', e.target.value)} placeholder="e.g. 72" className={inputClass} />
        </FormField>
        <FormField label="BMI (auto)">
          <div className={`${inputClass} bg-slate-100 dark:bg-slate-700 font-bold ${data.bmi ? (parseFloat(data.bmi) > 30 ? 'text-red-600' : parseFloat(data.bmi) > 25 ? 'text-amber-600' : 'text-emerald-600') : 'text-slate-400'}`}>
            {data.bmi || '—'}
          </div>
        </FormField>
        <FormField label="Excess Weight">
          <input type="text" value={data.excessWeight} onChange={e => update('excessWeight', e.target.value)} placeholder="kg" className={inputClass} />
        </FormField>
        <FormField label="Excess Calorie">
          <input type="text" value={data.excessCalorie} onChange={e => update('excessCalorie', e.target.value)} placeholder="kcal" className={inputClass} />
        </FormField>
        <FormField label="Duration">
          <input type="text" value={data.duration} onChange={e => update('duration', e.target.value)} placeholder="e.g. 6 months" className={inputClass} />
        </FormField>
        <FormField label="Waist (cm)">
          <input type="number" value={data.waist} onChange={e => update('waist', e.target.value)} placeholder="e.g. 85" className={inputClass} />
        </FormField>
        <FormField label="Hip (cm)">
          <input type="number" value={data.hip} onChange={e => update('hip', e.target.value)} placeholder="e.g. 98" className={inputClass} />
        </FormField>
        <FormField label="W/H Ratio (auto)">
          <div className={`${inputClass} bg-slate-100 dark:bg-slate-700 font-bold ${data.whRatio ? 'text-blue-600' : 'text-slate-400'}`}>
            {data.whRatio || '—'}
          </div>
        </FormField>
      </div>
    </SectionCard>
  );
}
