import React from 'react';
import { SectionCard, FormField } from './FormComponents';
import { type CardioExamData, BORG_SCALE_MAP, type Anthropometrics } from './clinicalConfig';
import { Heart, Activity, Info } from 'lucide-react';
import { AnthropometricSection } from './AnthropometricSection';
import { BorgScaleRadio } from '../../components/BorgScaleRadio';

interface StepCardioExamProps {
  data: CardioExamData;
  onChange: (data: CardioExamData) => void;
  isDoctorRole?: boolean;
  anthropometrics: Anthropometrics;
  onAnthropometricsChange: (data: Anthropometrics) => void;
  page: 1 | 2;
}

export function StepCardioExam({
  data,
  onChange,
  isDoctorRole,
  anthropometrics,
  onAnthropometricsChange,
  page
}: StepCardioExamProps) {
  const accent = isDoctorRole ? 'doctor' : 'blue';
  const iconColor = isDoctorRole ? 'text-[#262842]' : 'text-blue-600';
  
  const inputStyle = isDoctorRole
    ? 'w-full outline-none px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#262842] focus:ring-1 focus:ring-[#262842] transition-colors'
    : 'w-full outline-none px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors';

  const updateField = (key: keyof CardioExamData, value: any) => {
    onChange({
      ...data,
      [key]: value
    });
  };

  if (page === 1) {
    return (
      <div className="flex flex-col gap-4">
        {/* 1. Borg Scale Section (Single Selection Radio) */}
        <SectionCard
          icon={<Activity size={18} className={`${iconColor} dark:text-blue-400`} />}
          title="Borg Scale (Rate of Perceived Exertion)"
          subtitle="Select single exertion rating (0 to 10)"
          accent={accent}
        >
          <BorgScaleRadio
            value={data.borgRating || ''}
            onChange={(val) => updateField('borgRating', val)}
            isDoctorRole={isDoctorRole}
          />
        </SectionCard>

        {/* 2. Functional Capacity Tests */}
        <SectionCard
          icon={<Heart size={18} className={`${iconColor} dark:text-blue-400`} />}
          title="Functional Capacity Tests"
          subtitle="Record endurance and walking test values"
          accent={accent}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-l-lg">Test Name</th>
                  <th className="px-4 py-3 font-semibold">Value / Score</th>
                  <th className="px-4 py-3 font-semibold rounded-r-lg">Unit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">VO2 Max</td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      maxLength={5}
                      value={data.vo2Max}
                      onChange={(e) => updateField('vo2Max', e.target.value.replace(/[^\d.]/g, '').slice(0, 5))}
                      placeholder="e.g. 35.5"
                      className={inputStyle}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">ml/kg/min</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">6-Minute Walk Test</td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={4}
                      value={data.sixMinWalk}
                      onChange={(e) => updateField('sixMinWalk', e.target.value.replace(/[^\d]/g, '').slice(0, 4))}
                      placeholder="e.g. 450"
                      className={inputStyle}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">meters</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">Rockport 1-Mile Walk</td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      inputMode="decimal"
                      maxLength={5}
                      value={data.rockportWalk}
                      onChange={(e) => updateField('rockportWalk', e.target.value.replace(/[^\d.]/g, '').slice(0, 5))}
                      placeholder="e.g. 14.30"
                      className={inputStyle}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">minutes</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">Harvard Step Test</td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={3}
                      value={data.harvardStep}
                      onChange={(e) => updateField('harvardStep', e.target.value.replace(/[^\d]/g, '').slice(0, 3))}
                      placeholder="e.g. 65"
                      className={inputStyle}
                    />
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">index score</td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    );
  }

  // Page 2: Anthropometrics
  return (
    <div className="flex flex-col gap-4">
      <AnthropometricSection
        data={anthropometrics}
        onChange={onAnthropometricsChange}
        isDoctorRole={isDoctorRole}
      />
    </div>
  );
}
