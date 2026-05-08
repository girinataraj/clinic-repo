import { type ChangeEvent } from 'react';
import { SectionCard, FormField, inputClass, doctorInputClass, MultiSelectDropdown, ToggleChip } from './FormComponents';
import { CHIEF_COMPLAINT_OPTIONS, ASSOCIATED_SYMPTOM_OPTIONS, MEDICAL_HISTORY_OPTIONS, FUNCTIONAL_ACTIVITIES, RATING_LABELS, SPECIFIC_PROBLEM_OPTIONS, DIAGNOSIS_OPTIONS, COMPLAINT_DIAGNOSIS_RELEVANCE, getSortedDiagnoses, TREATMENT_MODALITIES, TREATMENT_MANUAL_THERAPY, TREATMENT_REHABILITATION, type TreatmentPlanData, getEmptyTreatmentPlan, getTreatmentSelectionCount } from './clinicalConfig';
import { User, Heart, CheckSquare, Sliders, ClipboardList, Phone, Search, UserPlus, ImagePlus, X, Check, Loader2, AlertTriangle, UserCog, ChevronDown, Stethoscope, FileSearch, PenTool, CalendarDays } from 'lucide-react';
import { ClinicalExamination } from './ClinicalExamination';

// ── Step 0: Patient Info ──────────────────────────────────────────────────────
export function StepPatient({ patientInfo, setPatientInfo, intakePhotoUrl, handlePhotoChange, handlePhotoRemove, photoInputKey, isDoctorRole, selectedTherapistId, setSelectedTherapistId, therapistsList, therapistsLoading, updatePatientMutation, resolvedPatientId, user }: any) {
  const accent = isDoctorRole ? 'doctor' : 'teal';
  const ic = isDoctorRole ? doctorInputClass : inputClass;
  const iconColor = isDoctorRole ? 'text-[#262842]' : 'text-teal-700';
  const btnActive = isDoctorRole ? 'border-[#262842] bg-indigo-50 dark:bg-indigo-900/30 text-[#262842]' : 'border-teal-600 bg-teal-50 dark:bg-teal-900/30 text-teal-700';

  return (
    <SectionCard icon={<User size={18} className={`${iconColor} dark:text-indigo-400`} />} title="Patient Information" subtitle="Demographics & assignment" accent={accent}>
      {/* Photo upload */}
      <div className="mb-4 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ImagePlus size={15} className={isDoctorRole ? 'text-[#262842]' : 'text-teal-600'} />
            <span className="text-[12px] font-bold text-slate-700 dark:text-white">Assessment Photo</span>
          </div>
          {intakePhotoUrl && <button onClick={handlePhotoRemove} className="text-[11px] font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1"><X size={11} /> Remove</button>}
        </div>
        {intakePhotoUrl ? (
          <img src={intakePhotoUrl} alt="Upload preview" className="w-full max-h-44 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
        ) : (
          <label htmlFor="intake-photo" className="flex flex-col items-center gap-1 py-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 transition-colors">
            <ImagePlus size={18} className={isDoctorRole ? 'text-[#262842]' : 'text-teal-600'} />
            <span className="text-[11px] font-bold text-slate-600">Tap to upload</span>
          </label>
        )}
        <input key={photoInputKey} id="intake-photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-0">
        {[
          { key: 'name', label: 'Full Name', placeholder: 'e.g. Priya Sharma', type: 'text' },
          { key: 'age', label: 'Age', placeholder: 'e.g. 32', type: 'number' },
          { key: 'phone', label: 'Phone', placeholder: '9876543210', type: 'tel' },
          { key: 'address', label: 'Address', placeholder: 'City / area', type: 'text' },
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
      <FormField label={isDoctorRole ? 'Assigned Therapist *' : 'Assigned Therapist'}>
        {isDoctorRole ? (
          <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-[#262842]`}>
            <UserCog size={14} className="text-slate-400 shrink-0" />
            <select value={selectedTherapistId} onChange={(e: any) => { setSelectedTherapistId(e.target.value); if (resolvedPatientId && e.target.value) updatePatientMutation.mutate({ id: resolvedPatientId, therapistId: e.target.value }); }} className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white appearance-none cursor-pointer">
              <option value="">Select therapist…</option>
              {therapistsList.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <ChevronDown size={12} className="text-slate-400 shrink-0" />
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            <UserCog size={14} className="text-teal-600 shrink-0" />
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{user?.name ?? 'You'} (auto)</span>
          </div>
        )}
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
export function StepComplaints({ chiefComplaints, setChiefComplaints, associatedSymptoms, setAssociatedSymptoms, complaintsText, setComplaintsText, specificProblems, setSpecificProblems, isDoctorRole }: any) {
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
          {CHIEF_COMPLAINT_OPTIONS.map(item => (
            <ToggleChip key={item} label={item} checked={chiefComplaints.includes(item)} onChange={() => toggleCC(item)} accent={accent1} />
          ))}
        </div>
        <textarea value={complaintsText} onChange={(e: any) => setComplaintsText(e.target.value)} placeholder="Additional complaint details or free-text notes…" className={`${ic} h-[70px] resize-none`} />
      </SectionCard>

      {chiefComplaints.length > 0 && (
        <SectionCard icon={<ClipboardList size={18} className={`${iconColor2} dark:text-blue-400`} />} title="Specific Problems" subtitle="Provide details about complaints" accent={accent2}>
          <div className="flex flex-col gap-4">
            {SPECIFIC_PROBLEM_OPTIONS.map(opt => {
              const isEnabled = specificProblems[opt.key]?.enabled;
              const options = opt.options === 'dynamic' ? dynamicOptions : opt.options;
              
              return (
                <div key={opt.key} className="flex flex-col gap-2 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleProblemChange(opt.key, { ...specificProblems[opt.key], enabled: !isEnabled })}
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isEnabled ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-300'}`}
                    >
                      {isEnabled && <Check size={12} strokeWidth={3} className="text-white" />}
                    </button>
                    <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{opt.label}</span>
                    
                    {isEnabled && opt.type === 'dropdown' && options.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2 ml-8">
                        {options.map((o: string) => {
                          const isSelected = (specificProblems[opt.key]?.values || []).includes(o);
                          return (
                            <button
                              key={o}
                              type="button"
                              onClick={() => {
                                const current = specificProblems[opt.key]?.values || [];
                                const next = isSelected ? current.filter((x: string) => x !== o) : [...current, o];
                                handleProblemChange(opt.key, { ...specificProblems[opt.key], values: next });
                              }}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border-2 transition-all ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 hover:border-slate-300'
                              }`}
                            >
                              {isSelected && <Check size={12} strokeWidth={4} />}
                              {o}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      <SectionCard icon={<ClipboardList size={18} className={`${iconColor2} dark:text-blue-400`} />} title="Associated Symptoms" subtitle="Select all that apply" accent={accent2}>
        <MultiSelectDropdown options={ASSOCIATED_SYMPTOM_OPTIONS} selected={associatedSymptoms} onChange={setAssociatedSymptoms} placeholder="Search symptoms…" accent={accent2} />
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
      <SectionCard icon={<Sliders size={18} className={`${iconColor1} dark:text-orange-400`} />} title="Pain Scale" subtitle="Rate current pain 0–10" accent={accent}>
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
export function StepExamination({ examination, setExamination, isDoctorRole, chiefComplaints, clinicalExamData, onClinicalExamChange }: any) {
  return (
    <ClinicalExamination
      chiefComplaints={chiefComplaints ?? []}
      clinicalExamData={clinicalExamData ?? { tests: {}, imaging: {} }}
      onChange={onClinicalExamChange ?? (() => {})}
      examinationNotes={examination}
      onExaminationNotesChange={setExamination}
      isDoctorRole={isDoctorRole}
    />
  );
}




// ── Step 6: Diagnosis ─────────────────────────────────────────────────────────
export function StepDiagnosis({ diagnosis, setDiagnosis, isDoctorRole, selectedDiagnoses, setSelectedDiagnoses, chiefComplaints }: any) {
  const ic = isDoctorRole ? doctorInputClass : inputClass;
  const accent = isDoctorRole ? 'doctor' : 'fuchsia';
  const iconColor = isDoctorRole ? 'text-[#262842]' : 'text-fuchsia-600';

  // Sort diagnosis options: complaint-relevant first
  const sortedOptions = getSortedDiagnoses(chiefComplaints ?? []);
  const complaints: string[] = chiefComplaints ?? [];

  // Compute which options are "relevant" to highlight the divider
  const relevantSet = new Set<string>();
  if (complaints.length > 0) {
    for (const cc of complaints) {
      const indices = COMPLAINT_DIAGNOSIS_RELEVANCE[cc];
      if (indices) indices.forEach(i => { if (DIAGNOSIS_OPTIONS[i]) relevantSet.add(DIAGNOSIS_OPTIONS[i]); });
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
export function StepTreatment({ treatment, setTreatment, isDoctorRole, treatmentPlan, setTreatmentPlan }: any) {
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

  return (
    <div className="flex flex-col gap-4">
      <SectionCard icon={<PenTool size={18} className={`${iconColor} dark:text-emerald-400`} />} title="Treatment Plan" subtitle="Management & follow-up" accent={accent}>
        <ChipGroup label="Modalities / Treatment Given" items={TREATMENT_MODALITIES} field="modalities" />
        <ChipGroup label="Manual Therapy" items={TREATMENT_MANUAL_THERAPY} field="manualTherapy" />
        <ChipGroup label="Rehabilitation" items={TREATMENT_REHABILITATION} field="rehabilitation" />
      </SectionCard>

      <SectionCard icon={<CalendarDays size={18} className={`${iconColor} dark:text-emerald-400`} />} title="Schedule & Follow-up" subtitle="Visits, frequency & planning" accent={accent}>
        <div className="grid grid-cols-2 gap-3 mb-3.5">
          <FormField label="Visits Required">
            <input
              type="text"
              inputMode="numeric"
              value={tp.visitsRequired}
              onChange={e => update({ visitsRequired: e.target.value.replace(/[^0-9]/g, '') })}
              placeholder="e.g. 12"
              className={ic}
            />
          </FormField>
          <FormField label="Gap Days (Frequency)">
            <input
              type="text"
              inputMode="numeric"
              value={tp.frequencyGapDays}
              onChange={e => update({ frequencyGapDays: e.target.value.replace(/[^0-9]/g, '') })}
              placeholder="e.g. 2"
              className={ic}
            />
          </FormField>
        </div>

        {tp.frequencyGapDays && Number(tp.frequencyGapDays) > 0 && (
          <div className={`mb-3.5 px-3 py-2 rounded-xl border ${
            isDoctorRole
              ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/30'
              : 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30'
          }`}>
            <p className={`text-[11px] font-bold ${isDoctorRole ? 'text-[#262842] dark:text-indigo-400' : 'text-emerald-700 dark:text-emerald-400'}`}>
              📅 Every <span className="font-extrabold">{tp.frequencyGapDays}</span> day{Number(tp.frequencyGapDays) !== 1 ? 's' : ''}
              {tp.visitsRequired && Number(tp.visitsRequired) > 0 ? ` × ${tp.visitsRequired} visits` : ''}
            </p>
          </div>
        )}

        <FormField label="Suggested Start Date (Optional)">
          <input
            type="date"
            value={tp.suggestedStartDate}
            onChange={e => update({ suggestedStartDate: e.target.value })}
            className={ic}
          />
        </FormField>
      </SectionCard>

      <SectionCard icon={<ClipboardList size={18} className={`${iconColor} dark:text-emerald-400`} />} title="Additional Notes" subtitle="Follow-up & management remarks" accent={accent}>
        <FormField label="Management / Follow-up Notes">
          <textarea
            value={tp.notes || treatment}
            onChange={e => {
              update({ notes: e.target.value });
              setTreatment(e.target.value);
            }}
            placeholder="Additional treatment management, follow-up instructions, precautions…"
            className={`${ic} h-[120px] resize-none`}
          />
        </FormField>
      </SectionCard>
    </div>
  );
}

// ── Step 6: Medical History ───────────────────────────────────────────────────
export function StepHistory({ selectedMedicalHistory, setSelectedMedicalHistory, otherMedicalHistory, setOtherMedicalHistory, showOtherMedicalHistory, setShowOtherMedicalHistory, isDoctorRole }: any) {
  const ic = isDoctorRole ? doctorInputClass : inputClass;
  const accent = isDoctorRole ? 'doctor' : 'fuchsia';
  const iconColor = isDoctorRole ? 'text-[#262842]' : 'text-fuchsia-600';

  return (
    <SectionCard icon={<ClipboardList size={18} className={`${iconColor} dark:text-fuchsia-400`} />} title="Medical History" subtitle="Past conditions & surgeries" accent={accent}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {MEDICAL_HISTORY_OPTIONS.map(item => (
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
