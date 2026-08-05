import { useEffect } from 'react';
import { SectionCard, FormField, inputClass, doctorInputClass } from './FormComponents';
import { calcBMI, calcWHRatio, type Anthropometrics } from './clinicalConfig';
import { Ruler } from 'lucide-react';

interface Props {
  data: Anthropometrics;
  onChange: (data: Anthropometrics) => void;
  isDoctorRole?: boolean;
}

export function AnthropometricSection({ data, onChange, isDoctorRole }: Props) {
  const sanitizeDigitInput = (val: string, maxDigits: number) => {
    // Retain only digits and slice to maxDigits
    const digitsOnly = val.replace(/[^\d]/g, '');
    return digitsOnly.slice(0, maxDigits);
  };

  const update = (field: keyof Anthropometrics, value: string, maxDigits?: number) => {
    const finalVal = maxDigits ? sanitizeDigitInput(value, maxDigits) : value;
    onChange({ ...data, [field]: finalVal });
  };

  const ic = isDoctorRole ? doctorInputClass : inputClass;

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
      icon={<Ruler size={18} className={isDoctorRole ? "text-[#262842]" : "text-blue-600 dark:text-blue-400"} />}
      title="Anthropometric Measures"
      subtitle="Body metrics & composition"
      accent={isDoctorRole ? "doctor" : "blue"}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1">
        <FormField label="Height (cm)">
          <input
            type="text"
            inputMode="numeric"
            maxLength={3}
            value={data.height || ''}
            onChange={e => update('height', e.target.value, 3)}
            placeholder="e.g. 170"
            className={ic}
          />
        </FormField>
        <FormField label="Weight (kg)">
          <input
            type="text"
            inputMode="numeric"
            maxLength={3}
            value={data.weight || ''}
            onChange={e => update('weight', e.target.value, 3)}
            placeholder="e.g. 72"
            className={ic}
          />
        </FormField>
        <FormField label="BMI (auto)">
          <div className={`${ic} bg-slate-100 dark:bg-slate-700 font-bold ${data.bmi ? (parseFloat(data.bmi) > 30 ? 'text-red-600' : parseFloat(data.bmi) > 25 ? 'text-amber-600' : 'text-emerald-600') : 'text-slate-400'}`}>
            {data.bmi || '—'}
          </div>
        </FormField>
        <FormField label="Excess Weight">
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={data.excessWeight || ''}
            onChange={e => update('excessWeight', e.target.value, 2)}
            placeholder="kg (max 2 digits)"
            className={ic}
          />
        </FormField>
        <FormField label="Excess Calorie">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={data.excessCalorie || ''}
            onChange={e => update('excessCalorie', e.target.value, 6)}
            placeholder="kcal (max 6 digits)"
            className={ic}
          />
        </FormField>
        <FormField label="Duration">
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={data.duration || ''}
            onChange={e => update('duration', e.target.value, 2)}
            placeholder="e.g. 6 (max 2 digits)"
            className={ic}
          />
        </FormField>
        <FormField label="Waist (cm)">
          <input
            type="text"
            inputMode="numeric"
            maxLength={3}
            value={data.waist || ''}
            onChange={e => update('waist', e.target.value, 3)}
            placeholder="e.g. 85"
            className={ic}
          />
        </FormField>
        <FormField label="Hip (cm)">
          <input
            type="text"
            inputMode="numeric"
            maxLength={3}
            value={data.hip || ''}
            onChange={e => update('hip', e.target.value, 3)}
            placeholder="e.g. 98"
            className={ic}
          />
        </FormField>
        <FormField label="W/H Ratio (auto)">
          <div className={`${ic} bg-slate-100 dark:bg-slate-700 font-bold ${data.whRatio ? (isDoctorRole ? 'text-[#262842]' : 'text-blue-600') : 'text-slate-400'}`}>
            {data.whRatio || '—'}
          </div>
        </FormField>
      </div>
    </SectionCard>
  );
}

export default AnthropometricSection;
