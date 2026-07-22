import React from 'react';
import { SectionCard, FormField } from './FormComponents';
import { type CardioExamData, BORG_SCALE_MAP, type Anthropometrics } from './clinicalConfig';
import { Heart, Activity, Dumbbell, Info } from 'lucide-react';
import { AnthropometricSection } from './AnthropometricSection';

interface StepCardioExamProps {
  data: CardioExamData;
  onChange: (data: CardioExamData) => void;
  isDoctorRole?: boolean;
  anthropometrics: Anthropometrics;
  onAnthropometricsChange: (data: Anthropometrics) => void;
  page: 1 | 2;
}

const BORG_DISPLAY_LABELS: Record<string, string> = {
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

  const prescription = {
    warmups: '',
    stretching: '',
    hiit: '',
    aerobics: '',
    strengthTraining: '',
    cooldown: '',
    ...(data?.exercisePrescription || {})
  };

  const updatePrescriptionField = (key: keyof CardioExamData['exercisePrescription'], value: string) => {
    onChange({
      ...data,
      exercisePrescription: {
        ...prescription,
        [key]: value
      }
    });
  };

  const selectedExertion = data.borgRating ? BORG_SCALE_MAP[data.borgRating] : 'No rating selected';

  // Exertion level color helper
  const getBorgBadgeClass = (rating: string) => {
    const r = parseInt(rating, 10);
    if (!r) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-350';
    if (r <= 11) return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30';
    if (r <= 14) return 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30';
    if (r <= 17) return 'bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400 border border-orange-100 dark:border-orange-900/30';
    return 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30';
  };

  if (page === 1) {
    return (
      <div className="flex flex-col gap-4">
        {/* 1. Borg Scale Table */}
        <SectionCard
          icon={<Activity size={18} className={`${iconColor} dark:text-blue-400`} />}
          title="Borg Scale (Rate of Perceived Exertion)"
          subtitle="Select exertion rating from 6 to 20"
          accent={accent}
        >
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto max-h-[380px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
              <table className="w-full border-collapse text-left text-xs font-semibold">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                    <th className="py-3 px-4 font-black uppercase tracking-wider text-center w-[20%]">Rating</th>
                    <th className="py-3 px-4 font-black uppercase tracking-wider">Perceived Exertion</th>
                    <th className="py-3 px-4 font-black uppercase tracking-wider text-center w-[20%]">Select</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {Object.keys(BORG_DISPLAY_LABELS).map((rating) => {
                    const isSelected = data.borgRating === rating;
                    const rowBgClass = isSelected
                      ? isDoctorRole
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20 font-bold'
                        : 'bg-blue-50/50 dark:bg-blue-950/20 font-bold'
                      : 'hover:bg-slate-50/40 dark:hover:bg-slate-850/20';

                    return (
                      <tr key={rating} className={`transition-colors ${rowBgClass}`}>
                        <td className="py-2.5 px-4 text-center font-bold text-slate-800 dark:text-slate-200 text-sm">
                          {rating}
                        </td>
                        <td className="py-2.5 px-4 text-slate-700 dark:text-slate-350 text-sm">
                          {BORG_DISPLAY_LABELS[rating]}
                        </td>
                        <td className="py-2.5 px-4 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                updateField('borgRating', rating);
                              } else {
                                updateField('borgRating', '');
                              }
                            }}
                            className={`h-4.5 w-4.5 rounded cursor-pointer ${
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

            {data.borgRating && (
              <div className={`p-4 rounded-xl flex items-center gap-3 w-full ${getBorgBadgeClass(data.borgRating)}`}>
                <Info size={18} className="shrink-0" />
                <div>
                  <p className="text-xs font-black uppercase tracking-wider mb-0.5">Selected Exertion Level</p>
                  <p className="text-sm font-bold">{data.borgRating} - {selectedExertion}</p>
                </div>
              </div>
            )}
          </div>
        </SectionCard>

        {/* 2. Cardiorespiratory Fitness Tests */}
        <SectionCard
          icon={<Heart size={18} className={`${iconColor} dark:text-blue-400`} />}
          title="Cardiorespiratory Fitness Tests"
          subtitle="Evaluate cardiovascular capacity & endurance"
          accent={accent}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs font-semibold">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-450 dark:text-slate-400">
                  <th className="py-2.5 font-bold uppercase tracking-wider">Test</th>
                  <th className="py-2.5 font-bold uppercase tracking-wider w-1/2">Value / Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                <tr className="border-b border-slate-100 dark:border-slate-850">
                  <td className="py-3 font-bold text-slate-800 dark:text-slate-200">Vo2 Max</td>
                  <td className="py-2">
                    <input
                      type="text"
                      value={data.vo2Max}
                      onChange={(e) => updateField('vo2Max', e.target.value)}
                      placeholder="e.g. 35 ml/kg/min"
                      className={inputStyle}
                    />
                  </td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-850">
                  <td className="py-3 font-bold text-slate-800 dark:text-slate-200">6 Min Walk Test</td>
                  <td className="py-2">
                    <input
                      type="text"
                      value={data.sixMinWalk}
                      onChange={(e) => updateField('sixMinWalk', e.target.value)}
                      placeholder="e.g. 450 meters"
                      className={inputStyle}
                    />
                  </td>
                </tr>
                <tr className="border-b border-slate-100 dark:border-slate-850">
                  <td className="py-3 font-bold text-slate-800 dark:text-slate-200">Rockport Walk Test</td>
                  <td className="py-2">
                    <input
                      type="text"
                      value={data.rockportWalk}
                      onChange={(e) => updateField('rockportWalk', e.target.value)}
                      placeholder="e.g. 12:45 mins, HR 140"
                      className={inputStyle}
                    />
                  </td>
                </tr>
                <tr>
                  <td className="py-3 font-bold text-slate-800 dark:text-slate-200">Harvard Step Test</td>
                  <td className="py-2">
                    <input
                      type="text"
                      value={data.harvardStep}
                      onChange={(e) => updateField('harvardStep', e.target.value)}
                      placeholder="e.g. Index: 75 (Good)"
                      className={inputStyle}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>
    );
  }

  // Page 2: Anthropometrics and Exercise Prescription
  return (
    <div className="flex flex-col gap-4">
      <AnthropometricSection
        data={anthropometrics}
        onChange={onAnthropometricsChange}
        isDoctorRole={isDoctorRole}
      />

      {/* 3. Exercise Prescription */}
      <SectionCard
        icon={<Dumbbell size={18} className={`${iconColor} dark:text-blue-400`} />}
        title="Exercise Prescription"
        subtitle="Customize repetitions and durations"
        accent={accent}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <FormField label="Warm-ups (repetitions)">
            <input
              type="text"
              value={prescription.warmups}
              onChange={(e) => updatePrescriptionField('warmups', e.target.value)}
              placeholder="e.g. 20 repetitions"
              className={inputStyle}
            />
          </FormField>
          
          <FormField label="Stretching (repetitions)">
            <input
              type="text"
              value={prescription.stretching}
              onChange={(e) => updatePrescriptionField('stretching', e.target.value)}
              placeholder="e.g. 5 repetitions"
              className={inputStyle}
            />
          </FormField>
          
          <FormField label="HIIT (minutes)">
            <input
              type="text"
              value={prescription.hiit}
              onChange={(e) => updatePrescriptionField('hiit', e.target.value)}
              placeholder="e.g. 15 mins"
              className={inputStyle}
            />
          </FormField>
          
          <FormField label="Aerobics (minutes)">
            <input
              type="text"
              value={prescription.aerobics}
              onChange={(e) => updatePrescriptionField('aerobics', e.target.value)}
              placeholder="e.g. 30 mins"
              className={inputStyle}
            />
          </FormField>
          
          <FormField label="Strength Training (minutes)">
            <input
              type="text"
              value={prescription.strengthTraining}
              onChange={(e) => updatePrescriptionField('strengthTraining', e.target.value)}
              placeholder="e.g. 20 mins"
              className={inputStyle}
            />
          </FormField>
          
          <FormField label="Cool Down (minutes)">
            <input
              type="text"
              value={prescription.cooldown}
              onChange={(e) => updatePrescriptionField('cooldown', e.target.value)}
              placeholder="e.g. 10 mins"
              className={inputStyle}
            />
          </FormField>
        </div>
      </SectionCard>
    </div>
  );
}
