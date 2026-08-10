import { type ChangeEvent } from 'react';
import { SectionCard, FormField, inputClass, doctorInputClass, MultiSelectDropdown, ToggleChip } from './FormComponents';
import { FUNCTIONAL_ACTIVITIES, RATING_LABELS, SPECIFIC_PROBLEM_OPTIONS, SPECIFIC_PROBLEMS_BY_COMPLAINT, getSortedDiagnoses, type TreatmentPlanData, getEmptyTreatmentPlan, getTreatmentSelectionCount } from './clinicalConfig';
import { User, Heart, CheckSquare, Sliders, ClipboardList, Phone, Search, UserPlus, ImagePlus, X, Check, Loader2, AlertTriangle, UserCog, ChevronDown, Stethoscope, FileSearch, PenTool, CalendarDays } from 'lucide-react';
import { ClinicalExamination } from './ClinicalExamination';
import { RomMatrix } from './RomMatrix';
import { MusclePower } from './MusclePower';
import { TreatmentExerciseModule } from './TreatmentExerciseModule';

// ── Step 0: Patient Info ──────────────────────────────────────────────────────
export function StepPatient({ patientInfo, setPatientInfo, isDoctorRole, selectedTherapistId, setSelectedTherapistId, therapistsList, therapistsLoading, updatePatientMutation, resolvedPatientId, user }: any) {
  const accent = isDoctorRole ? 'doctor' : 'teal';
  const ic = isDoctorRole ? doctorInputClass : inputClass;
  const iconColor = isDoctorRole ? 'text-[#262842]' : 'text-teal-700';
  const btnActive = isDoctorRole ? 'border-[#262842] bg-indigo-50 dark:bg-indigo-900/30 text-[#262842]' : 'border-teal-600 bg-teal-50 dark:bg-teal-900/30 text-teal-700';

  return (
    <SectionCard icon={<User size={18} className={`${iconColor} dark:text-indigo-400`} />} title="Patient Information" subtitle="Demographics & assignment" accent={accent}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
        {[
          { key: 'name', label: 'Full Name', placeholder: 'e.g. Priya Sharma', type: 'text' },
          { key: 'age', label: 'Age', placeholder: 'e.g. 32', type: 'number' },
          { key: 'phone', label: 'Phone', placeholder: '9876543210', type: 'tel' },
          { key: 'address', label: 'Address', placeholder: 'City / area', type: 'text' },
          { key: 'referredBy', label: 'Referred By', placeholder: 'e.g. Self, Dr. Kumar', type: 'text' },
        ].map(f => (
          <FormField key={f.key} label={f.label}>
            <input type={f.type} value={(patientInfo as any)[f.key]} onChange={e => setPatientInfo({ ...patientInfo, [f.key]: e.target.value })} placeholder={f.placeholder} className={ic} />
          </FormField>
        ))}
      </div>
      <FormField label="Gender">
        <div className="flex gap-2">
          {['Male', 'Female', 'Other'].map(g => (
            <button key={g} onClick={() => setPatientInfo({ ...patientInfo, gender: g })} className={`flex-1 py-2 rounded-xl text-[12px] font-bold border-2 transition-colors ${patientInfo.gender === g ? btnActive : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>{g}</button>
          ))}
        </div>
      </FormField>
      <FormField label="Assigned Therapist">
        <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 opacity-90 cursor-not-allowed">
          <UserCog size={15} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
            Self (Doctor: {user?.name || 'Doctor'})
          </span>
        </div>
      </FormField>
      <FormField label="Condition (Check all that apply)">
        <div className="flex gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
          {['Ortho', 'Neuro', 'Cardio'].map((c) => {
            const isChecked = patientInfo.condition?.includes(c) || false;
            return (
              <label key={c} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => {
                    const current = patientInfo.condition || [];
                    const next = isChecked
                      ? current.filter((x: string) => x !== c)
                      : [...current, c];
                    setPatientInfo({ ...patientInfo, condition: next });
                  }}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
                {c}
              </label>
            );
          })}
        </div>
      </FormField>
    </SectionCard>
  );
}

// ── Step 1: Vitals ────────────────────────────────────────────────────────────
export function StepVitals({ vitals, setVitals, isDoctorRole }: { vitals: any; setVitals: (v: any) => void; isDoctorRole?: boolean }) {
  const ic = isDoctorRole ? doctorInputClass : inputClass;
  const accent = isDoctorRole ? 'doctor' : 'rose';
  const iconColor = isDoctorRole ? 'text-[#262842]' : 'text-rose-600';

  return (
    <SectionCard icon={<Heart size={18} className={`${iconColor} dark:text-rose-400`} />} title="Vital Signs" subtitle="Record current vitals" accent={accent}>
      <FormField label="Blood Pressure (mmHg)">
        <div className="flex gap-2 items-center">
          <input value={vitals.bp_sys} onChange={e => setVitals({ ...vitals, bp_sys: e.target.value })} placeholder="Systolic" className={`${ic} text-center`} />
          <span className="text-slate-400 font-bold">/</span>
          <input value={vitals.bp_dia} onChange={e => setVitals({ ...vitals, bp_dia: e.target.value })} placeholder="Diastolic" className={`${ic} text-center`} />
        </div>
      </FormField>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0">
        {[
          { key: 'pr', label: 'Pulse Rate (bpm)', placeholder: '72' },
          { key: 'spo2', label: 'SpO₂ (%)', placeholder: '98' },
          { key: 'temp', label: 'Temperature (°F)', placeholder: '98.6' },
          { key: 'ef', label: 'Ejection Fraction (%)', placeholder: '55' },
        ].map(f => (
          <FormField key={f.key} label={f.label}>
            <input type="number" value={(vitals as any)[f.key]} onChange={e => setVitals({ ...vitals, [f.key]: e.target.value })} placeholder={f.placeholder} className={ic} />
          </FormField>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Step 2: Chief Complaints & Associated Symptoms ────────────────────────────
export function StepComplaints({ chiefComplaints, setChiefComplaints, associatedSymptoms, setAssociatedSymptoms, complaintsText, setComplaintsText, specificProblems, setSpecificProblems, isDoctorRole, chiefComplaintsList, associatedSymptomsList }: any) {
  const ic = isDoctorRole ? doctorInputClass : inputClass;
  const accent1 = isDoctorRole ? 'doctor' : 'fuchsia';
  const iconColor1 = isDoctorRole ? 'text-[#262842]' : 'text-fuchsia-600';
  const accent2 = isDoctorRole ? 'doctor' : 'blue';
  const iconColor2 = isDoctorRole ? 'text-[#262842]' : 'text-blue-600';

  const toggleCC = (item: string) => {
    setChiefComplaints((prev: string[]) => prev.includes(item) ? prev.filter(x => x !== item) : [...prev, item]);
  };

  const handleProblemChange = (key: string, value: any) => {
    setSpecificProblems((prev: any) => ({ ...prev, [key]: value }));
  };

  const dynamicOptions = chiefComplaints.filter((c: string) => c !== 'Another');

  return (
    <div className="flex flex-col gap-4">
      <SectionCard icon={<CheckSquare size={18} className={`${iconColor1} dark:text-fuchsia-400`} />} title="Chief Complaints" subtitle="Select affected body parts" accent={accent1}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
          {(chiefComplaintsList || []).map((item: string) => (
            <ToggleChip key={item} label={item} checked={chiefComplaints.includes(item)} onChange={() => toggleCC(item)} accent={accent1} />
          ))}
        </div>
        <textarea value={complaintsText} onChange={(e: any) => setComplaintsText(e.target.value)} placeholder="Additional complaint details or free-text notes…" className={`${ic} h-[70px] resize-none`} />
      </SectionCard>

      {chiefComplaints.length > 0 && (() => {
        const activeComplaints = chiefComplaints.filter((c: string) => c !== 'Another');
        if (activeComplaints.length === 0) return null;

        // Group options by their unique key
        const groupedRows: Record<string, {
          label: string;
          key: string;
          type: 'dropdown' | 'checkbox';
          options: Array<{
            complaint: string;
            value: string;
          }>;
        }> = {};

        activeComplaints.forEach((complaint: string) => {
          const options = SPECIFIC_PROBLEMS_BY_COMPLAINT[complaint] || SPECIFIC_PROBLEM_OPTIONS;
          options.forEach(opt => {
            if (!groupedRows[opt.key]) {
              groupedRows[opt.key] = {
                label: opt.label,
                key: opt.key,
                type: opt.type,
                options: []
              };
            }
            if (Array.isArray(opt.options)) {
              opt.options.forEach(val => {
                groupedRows[opt.key].options.push({
                  complaint,
                  value: val
                });
              });
            }
          });
        });

        const activeChipClass = isDoctorRole
          ? 'border-[#262842] bg-[#262842] text-white shadow-sm shadow-indigo-500/10'
          : 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/10';

        return (
          <SectionCard icon={<ClipboardList size={18} className={`${iconColor2} dark:text-blue-400`} />} title="Specific Problems" subtitle="Provide details about complaints" accent={accent2}>
            <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                      <th className="px-4 py-3 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider w-[180px]">
                        Category
                      </th>
                      <th className="px-4 py-3 text-[11px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Selectable Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {Object.values(groupedRows).map((row) => {
                      // Get unique option values to render them without duplication
                      const uniqueOptionValues = Array.from(new Set(row.options.map(o => o.value)));

                      return (
                        <tr key={row.key} className="hover:bg-slate-50/20 dark:hover:bg-slate-900/10 transition-colors">
                          <td className="px-4 py-3 text-[13px] font-extrabold text-slate-700 dark:text-slate-300 align-top pt-4">
                            {row.label}
                          </td>
                          <td className="px-4 py-3 align-middle">
                            <div className="flex flex-wrap gap-1.5">
                              {uniqueOptionValues.map((v: string) => {
                                // Find all complaints that match this value for the key
                                const matchingComplaints = row.options.filter(o => o.value === v).map(o => o.complaint);

                                const isSelected = matchingComplaints.some(comp => {
                                  const stateKey = `${comp}_${row.key}`;
                                  return row.type === 'checkbox'
                                    ? !!specificProblems[stateKey]?.enabled
                                    : (specificProblems[stateKey]?.values || []).includes(v);
                                });

                                return (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => {
                                      matchingComplaints.forEach(comp => {
                                        const stateKey = `${comp}_${row.key}`;
                                        if (row.type === 'checkbox') {
                                          handleProblemChange(stateKey, {
                                            ...specificProblems[stateKey],
                                            enabled: !isSelected
                                          });
                                        } else {
                                          const current = specificProblems[stateKey]?.values || [];
                                          const next = isSelected
                                            ? current.filter((x: string) => x !== v)
                                            : [...current, v];
                                          handleProblemChange(stateKey, {
                                            enabled: next.length > 0,
                                            values: next
                                          });
                                        }
                                      });
                                    }}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all active:scale-[0.97] cursor-pointer ${
                                      isSelected
                                        ? activeChipClass
                                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800'
                                    }`}
                                  >
                                    {isSelected && <Check size={11} strokeWidth={4} />}
                                    {v}
                                  </button>
                                );
                              })}
                            </div>
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
      })()}

      <SectionCard icon={<ClipboardList size={18} className={`${iconColor2} dark:text-blue-400`} />} title="Associated Symptoms" subtitle="Select all that apply" accent={accent2}>
        <MultiSelectDropdown options={associatedSymptomsList || []} selected={associatedSymptoms} onChange={setAssociatedSymptoms} placeholder="Search symptoms…" accent={accent2} />
      </SectionCard>
    </div>
  );
}

// ── Step 4: Pain Scale ────────────────────────────────────────────────────────
export function StepPainScale({ painLevel, setPainLevel, isDoctorRole }: any) {
  const painColors = ['bg-green-500','bg-lime-500','bg-lime-400','bg-yellow-400','bg-orange-400','bg-orange-500','bg-red-500','bg-red-600','bg-red-700','bg-red-800','bg-red-900'];
  const painLabel = painLevel === 0 ? 'No Pain' : painLevel <= 2 ? 'Mild' : painLevel <= 4 ? 'Moderate' : painLevel <= 6 ? 'Significant' : painLevel <= 8 ? 'Severe' : 'Worst';
  const funcColors = ['bg-green-500 border-green-500','bg-lime-500 border-lime-500','bg-yellow-400 border-yellow-400','bg-orange-500 border-orange-500','bg-red-500 border-red-500'];
  const accentColor = isDoctorRole ? 'accent-[#262842]' : 'accent-teal-600';
  const accent = isDoctorRole ? 'doctor' : 'orange';
  const accentEmerald = isDoctorRole ? 'doctor' : 'emerald';
  const iconColor1 = isDoctorRole ? 'text-[#262842]' : 'text-orange-500';
  const iconColor2 = isDoctorRole ? 'text-[#262842]' : 'text-emerald-600';

  return (
    <div className="flex flex-col gap-3">
      <SectionCard icon={<Sliders size={18} className={`${iconColor1} dark:text-orange-400`} />} title="VAS Scale" subtitle="Rate current pain 0–10" accent={accent}>
        <div className="flex flex-col items-center mb-4">
          <div className={`rounded-full flex items-center justify-center w-20 h-20 ${painColors[painLevel]} mb-2`}>
            <span className="text-[28px] font-black text-white">{painLevel}</span>
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{painLabel}</p>
        </div>
        <input type="range" min={0} max={10} value={painLevel} onChange={e => setPainLevel(Number(e.target.value))} className={`w-full h-1.5 cursor-pointer ${accentColor} mb-2`} />
        <div className="flex gap-0.5 rounded-xl overflow-hidden">
          {painColors.map((c, i) => (
            <div key={i} className={`flex-1 h-7 flex items-center justify-center cursor-pointer ${c} ${painLevel === i ? 'opacity-100' : 'opacity-35'}`} onClick={() => setPainLevel(i)}>
              <span className="text-[9px] font-bold text-white">{i}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ── Step 5: Examination ───────────────────────────────────────────────────────
export function StepExamination({ examination, setExamination, isDoctorRole, chiefComplaints, clinicalExamData, onClinicalExamChange, testMap, romData, setRomData }: any) {
  return (
    <div className="flex flex-col gap-4">
      <MusclePower
        data={romData || {}}
        onChange={setRomData}
        isDoctorRole={isDoctorRole}
        chiefComplaints={chiefComplaints || []}
      />
      <ClinicalExamination
        chiefComplaints={chiefComplaints ?? []}
        clinicalExamData={clinicalExamData ?? { tests: {}, imaging: {} }}
        onChange={onClinicalExamChange ?? (() => {})}
        examinationNotes={examination}
        onExaminationNotesChange={setExamination}
        isDoctorRole={isDoctorRole}
        testMap={testMap || []}
      />
    </div>
  );
}


// ── Step 6: Diagnosis ─────────────────────────────────────────────────────────
export function StepDiagnosis({ diagnosis, setDiagnosis, isDoctorRole, selectedDiagnoses, setSelectedDiagnoses, chiefComplaints, diagnosisList, relevanceMap }: any) {
  const ic = isDoctorRole ? doctorInputClass : inputClass;
  const accent = isDoctorRole ? 'doctor' : 'fuchsia';
  const iconColor = isDoctorRole ? 'text-[#262842]' : 'text-fuchsia-600';

  // Sort diagnosis options: complaint-relevant first
  const sortedOptions = getSortedDiagnoses(chiefComplaints ?? [], diagnosisList || [], relevanceMap || {});
  const complaints: string[] = chiefComplaints ?? [];

  // Compute which options are "relevant" to highlight the divider
  const relevantSet = new Set<string>();
  if (complaints.length > 0 && relevanceMap && diagnosisList) {
    for (const cc of complaints) {
      const indices = relevanceMap[cc];
      if (indices) indices.forEach((i: number) => { if (diagnosisList[i]) relevantSet.add(diagnosisList[i]); });
    }
  }

  return (
    <SectionCard icon={<FileSearch size={18} className={`${iconColor} dark:text-fuchsia-400`} />} title="Diagnosis" subtitle="Clinical diagnosis & codes" accent={accent}>
      <FormField label="Select Diagnoses">
        <MultiSelectDropdown
          options={sortedOptions}
          selected={selectedDiagnoses ?? []}
          onChange={setSelectedDiagnoses ?? (() => {})}
          placeholder={`Search diagnoses… (${(selectedDiagnoses ?? []).length} selected)`}
          accent={accent}
        />
      </FormField>

      {/* Relevance hint */}
      {relevantSet.size > 0 && (selectedDiagnoses ?? []).length === 0 && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
          <p className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
            💡 Related diagnoses for <span className="font-extrabold">{complaints.join(', ')}</span> are shown first.
          </p>
        </div>
      )}

      <FormField label="Additional Diagnosis Notes">
        <textarea
          value={diagnosis}
          onChange={(e: any) => setDiagnosis(e.target.value)}
          placeholder="Enter any additional diagnosis details, differential diagnosis, clinical notes…"
          className={`${ic} h-[120px] resize-none`}
        />
      </FormField>
    </SectionCard>
  );
}

// ── Step 7: Treatment Plan ────────────────────────────────────────────────────
export function StepTreatment({ treatment, setTreatment, isDoctorRole, treatmentPlan, setTreatmentPlan, treatmentsList, patientId }: any) {
  const ic = isDoctorRole ? doctorInputClass : inputClass;
  const accent = isDoctorRole ? 'doctor' : 'emerald';
  const iconColor = isDoctorRole ? 'text-[#262842]' : 'text-emerald-600';

  const tp: TreatmentPlanData = treatmentPlan ?? getEmptyTreatmentPlan();
  const update = (patch: Partial<TreatmentPlanData>) => {
    if (setTreatmentPlan) setTreatmentPlan({ ...tp, ...patch });
  };

  const toggleItem = (field: 'modalities' | 'manualTherapy' | 'rehabilitation', item: string) => {
    const current = tp[field];
    update({ [field]: current.includes(item) ? current.filter((x: string) => x !== item) : [...current, item] });
  };

  const ChipGroup = ({ label, items, field }: { label: string; items: string[]; field: 'modalities' | 'manualTherapy' | 'rehabilitation' }) => (
    <div className="mb-4">
      <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map(item => (
          <ToggleChip key={item} label={item} checked={tp[field].includes(item)} onChange={() => toggleItem(field, item)} accent={accent} />
        ))}
      </div>
    </div>
  );

  const modalities = (treatmentsList || []).filter((t: any) => t.category === 'Modalities').map((t: any) => t.treatmentName);
  const manualTherapy = (treatmentsList || []).filter((t: any) => t.category === 'Manual Therapy').map((t: any) => t.treatmentName);
  const rehab = (treatmentsList || []).filter((t: any) => t.category === 'Rehabilitation').map((t: any) => t.treatmentName);

  const isExerciseSelected = (tp.rehabilitation || []).some((item: string) => item.trim().toLowerCase() === 'exercise');

  return (
    <div className="flex flex-col gap-4">
      <SectionCard icon={<PenTool size={18} className={`${iconColor} dark:text-emerald-400`} />} title="Treatment Plan" subtitle="Management & follow-up" accent={accent}>
        <ChipGroup label="Modalities / Treatment Given" items={modalities} field="modalities" />
        <ChipGroup label="Manual Therapy" items={manualTherapy} field="manualTherapy" />
        <ChipGroup label="Rehabilitation" items={rehab} field="rehabilitation" />
      </SectionCard>

      {/* Exercise Adding & Prescribing Module — only shown when Exercise is selected in Rehabilitation */}
      {isExerciseSelected && (
        <TreatmentExerciseModule
          treatmentPlan={tp}
          setTreatmentPlan={(newTp: TreatmentPlanData) => {
            if (setTreatmentPlan) setTreatmentPlan(newTp);
          }}
          isDoctorRole={isDoctorRole}
        />
      )}

      <SectionCard icon={<ImagePlus size={18} className={`${iconColor} dark:text-emerald-400`} />} title="Imaging Findings" subtitle="X-Ray, MRI, PFT reports" accent={accent}>
        <div className="flex flex-col gap-3">
          <FormField label="X-Ray Findings">
            <textarea
              value={tp.xrayFindings || ''}
              onChange={e => update({ xrayFindings: e.target.value })}
              placeholder="Enter X-Ray details (if any)"
              className={`${ic} h-[60px] resize-none`}
            />
          </FormField>
          <FormField label="MRI Findings">
            <textarea
              value={tp.mriFindings || ''}
              onChange={e => update({ mriFindings: e.target.value })}
              placeholder="Enter MRI details (if any)"
              className={`${ic} h-[60px] resize-none`}
            />
          </FormField>
          <FormField label="PFT Findings">
            <textarea
              value={tp.pftFindings || ''}
              onChange={e => update({ pftFindings: e.target.value })}
              placeholder="Enter Pulmonary Function Test details (if any)"
              className={`${ic} h-[60px] resize-none`}
            />
          </FormField>
        </div>
      </SectionCard>



      <SectionCard icon={<ClipboardList size={18} className={`${iconColor} dark:text-emerald-400`} />} title="Additional Notes" subtitle="General management remarks" accent={accent}>
        <FormField label="Management Notes">
          <textarea
            value={tp.notes || treatment}
            onChange={e => {
              update({ notes: e.target.value });
              setTreatment(e.target.value);
            }}
            placeholder="Additional treatment management, general precautions…"
            className={`${ic} h-[100px] resize-none`}
          />
        </FormField>
      </SectionCard>
    </div>
  );
}

// ── Step 6: Medical History ───────────────────────────────────────────────────
export function StepHistory({ selectedMedicalHistory, setSelectedMedicalHistory, otherMedicalHistory, setOtherMedicalHistory, showOtherMedicalHistory, setShowOtherMedicalHistory, isDoctorRole, medicalHistoryList }: any) {
  const ic = isDoctorRole ? doctorInputClass : inputClass;
  const accent = isDoctorRole ? 'doctor' : 'fuchsia';
  const iconColor = isDoctorRole ? 'text-[#262842]' : 'text-fuchsia-600';

  return (
    <SectionCard icon={<ClipboardList size={18} className={`${iconColor} dark:text-fuchsia-400`} />} title="Medical History" subtitle="Past conditions & surgeries" accent={accent}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {(medicalHistoryList || []).map((item: string) => (
          <ToggleChip key={item} label={item} checked={selectedMedicalHistory.includes(item)} onChange={() => setSelectedMedicalHistory((prev: string[]) => prev.includes(item) ? prev.filter((x: string) => x !== item) : [...prev, item])} accent={accent} />
        ))}
      </div>
      <div className="mt-3">
        <ToggleChip label="Others (specify)" checked={showOtherMedicalHistory || !!otherMedicalHistory} onChange={() => setShowOtherMedicalHistory(!showOtherMedicalHistory)} accent={accent} />
        {(showOtherMedicalHistory || otherMedicalHistory) && (
          <input value={otherMedicalHistory} onChange={(e: any) => setOtherMedicalHistory(e.target.value)} placeholder="Other medical history…" className={`${ic} mt-2`} autoFocus />
        )}
      </div>
    </SectionCard>
  );
}
