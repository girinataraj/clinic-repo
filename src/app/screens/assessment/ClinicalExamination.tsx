import { useState } from 'react';
import { SectionCard, FormField } from './FormComponents';
import {
  getClinicalTestKey,
  type ClinicalExamData,
  type TestResult,
  type ImagingFindings,
} from './clinicalConfig';
import { Stethoscope, ChevronDown, ChevronUp, ImageIcon, FileText } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface ClinicalExaminationProps {
  chiefComplaints: string[];
  clinicalExamData: ClinicalExamData;
  onChange: (data: ClinicalExamData) => void;
  /** Free-text examination notes (kept for backward compatibility) */
  examinationNotes: string;
  onExaminationNotesChange: (notes: string) => void;
  isDoctorRole?: boolean;
  testMap?: any[];
}

const TEST_RESULTS: TestResult[] = ['Positive', 'Negative', 'Not Tested'];

const RESULT_STYLES: Record<TestResult, { active: string; label: string }> = {
  'Positive':   { active: 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 shadow-sm shadow-red-500/10', label: '+ve' },
  'Negative':   { active: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-sm shadow-emerald-500/10', label: '−ve' },
  'Not Tested': { active: 'border-slate-400 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300', label: 'NT' },
};

// ── Component ─────────────────────────────────────────────────────────────────
export function ClinicalExamination({
  chiefComplaints,
  clinicalExamData,
  onChange,
  examinationNotes,
  onExaminationNotesChange,
  isDoctorRole,
  testMap,
}: ClinicalExaminationProps) {
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

  const accent = isDoctorRole ? 'doctor' : 'blue';
  const iconColor = isDoctorRole ? 'text-[#262842]' : 'text-blue-600';
  const ic = isDoctorRole
    ? 'w-full outline-none px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-[#262842] focus:ring-1 focus:ring-[#262842] transition-colors'
    : 'w-full outline-none px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-colors';

  // Filter test groups to only those matching selected complaints
  const activeGroups = (testMap || []).filter((g: any) =>
    chiefComplaints.includes(g.complaint)
  );

  const toggleRegion = (region: string) => {
    setExpandedRegions(prev => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  };

  const setTestResult = (region: string, testName: string, result: TestResult) => {
    const key = getClinicalTestKey(region, testName);
    onChange({
      ...clinicalExamData,
      tests: {
        ...clinicalExamData.tests,
        [key]: { result },
      },
    });
  };

  const getTestResult = (region: string, testName: string): TestResult => {
    const key = getClinicalTestKey(region, testName);
    return clinicalExamData.tests[key]?.result ?? 'Not Tested';
  };

  // Count completed tests per region
  const getRegionProgress = (region: string, tests: { name: string }[]) => {
    let filled = 0;
    for (const t of tests) {
      const key = getClinicalTestKey(region, t.name);
      if (clinicalExamData.tests[key] && clinicalExamData.tests[key].result !== 'Not Tested') {
        filled++;
      }
    }
    return filled;
  };

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        icon={<Stethoscope size={18} className={`${iconColor} dark:text-blue-400`} />}
        title="Clinical Examination"
        subtitle="Observations & physical findings"
        accent={accent}
      >
        {/* Dynamic test sections */}
        {activeGroups.length > 0 ? (
          <div className="flex flex-col gap-3">
            {activeGroups.map(group => {
              const isExpanded = expandedRegions.has(group.region);
              const filled = getRegionProgress(group.region, group.tests);

              return (
                <div
                  key={group.region}
                  className="rounded-[16px] border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900 shadow-sm"
                >
                  {/* Region header — accordion toggle */}
                  <button
                    type="button"
                    onClick={() => toggleRegion(group.region)}
                    className={`w-full px-4 py-3.5 flex items-center justify-between transition-colors ${
                      isExpanded
                        ? isDoctorRole
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 border-b border-indigo-100 dark:border-indigo-900/50'
                          : 'bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/50'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          isExpanded
                            ? isDoctorRole ? 'bg-[#262842]' : 'bg-blue-600'
                            : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      />
                      <span
                        className={`text-[14px] font-extrabold ${
                          isExpanded
                            ? isDoctorRole ? 'text-[#262842] dark:text-indigo-300' : 'text-blue-800 dark:text-blue-300'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {group.region}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {filled > 0 && (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isDoctorRole
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-[#262842] dark:text-indigo-400'
                            : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                        }`}>
                          {filled}/{group.tests.length}
                        </span>
                      )}
                      {isExpanded ? (
                        <ChevronUp size={18} className={isDoctorRole ? 'text-[#262842] dark:text-indigo-400' : 'text-blue-600 dark:text-blue-400'} />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Region content — tests + imaging */}
                  {isExpanded && (
                    <div className="p-4 flex flex-col gap-4">
                      {/* Clinical Tests */}
                      <div className="flex flex-col gap-3">
                        {group.tests.map((test: { name: string }) => {
                          const currentResult = getTestResult(group.region, test.name);
                          return (
                            <div
                              key={test.name}
                              className="p-3 rounded-[14px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50"
                            >
                              <p className="text-[13px] font-extrabold text-slate-800 dark:text-slate-200 mb-2.5">
                                {test.name}
                              </p>
                              {/* Segmented control */}
                              <div className="flex gap-2">
                                {TEST_RESULTS.map(result => {
                                  const isActive = currentResult === result;
                                  const style = RESULT_STYLES[result];
                                  return (
                                    <button
                                      key={result}
                                      type="button"
                                      onClick={() => setTestResult(group.region, test.name, result)}
                                      className={`flex-1 py-2.5 rounded-xl text-[12px] font-black border-2 transition-all active:scale-95 ${
                                        isActive
                                          ? style.active
                                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:border-slate-300'
                                      }`}
                                    >
                                      <span className="hidden sm:inline">{result}</span>
                                      <span className="sm:hidden">{style.label}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 flex flex-col items-center text-center">
            <div className={`rounded-full w-14 h-14 flex items-center justify-center mb-3 ${
              isDoctorRole ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-blue-50 dark:bg-blue-900/20'
            }`}>
              <Stethoscope size={24} className={isDoctorRole ? 'text-[#262842]/40 dark:text-indigo-400/40' : 'text-blue-600/40 dark:text-blue-400/40'} />
            </div>
            <p className="text-[14px] font-extrabold text-slate-700 dark:text-slate-300 mb-1">
              No Relevant Tests
            </p>
            <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              Select <span className="font-bold">Neck, Shoulder, Elbow, Wrist, Hip,</span> or{' '}
              <span className="font-bold">Knee</span> in Chief Complaints to show clinical tests.
            </p>
          </div>
        )}

        {/* General examination notes (backward-compat) */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <FormField label="Additional Examination Notes">
            <textarea
              value={examinationNotes}
              onChange={e => onExaminationNotesChange(e.target.value)}
              placeholder="Enter any additional clinical examination findings, ROM observations, muscle power notes…"
              className={`${ic} h-[120px] resize-none`}
            />
          </FormField>
        </div>
      </SectionCard>
    </div>
  );
}
