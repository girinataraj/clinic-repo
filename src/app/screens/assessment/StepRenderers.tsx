import { type ChangeEvent } from 'react';
import { SectionCard, FormField, inputClass, MultiSelectDropdown, ToggleChip } from './FormComponents';
import { CHIEF_COMPLAINT_OPTIONS, ASSOCIATED_SYMPTOM_OPTIONS, MEDICAL_HISTORY_OPTIONS, FUNCTIONAL_ACTIVITIES, RATING_LABELS } from './clinicalConfig';
import { User, Heart, CheckSquare, Sliders, ClipboardList, Phone, Search, UserPlus, ImagePlus, X, Check, Loader2, AlertTriangle, UserCog, ChevronDown } from 'lucide-react';

// ── Step 0: Patient Info ──────────────────────────────────────────────────────
export function StepPatient({ patientInfo, setPatientInfo, intakePhotoUrl, handlePhotoChange, handlePhotoRemove, photoInputKey, isDoctorRole, selectedTherapistId, setSelectedTherapistId, therapistsList, therapistsLoading, updatePatientMutation, resolvedPatientId, user }: any) {
  return (
    <SectionCard icon={<User size={18} className="text-teal-700 dark:text-teal-400" />} title="Patient Information" subtitle="Demographics & assignment" accent="teal">
      {/* Photo upload */}
      <div className="mb-4 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <ImagePlus size={15} className="text-teal-600" />
            <span className="text-[12px] font-bold text-slate-700 dark:text-white">Assessment Photo</span>
          </div>
          {intakePhotoUrl && <button onClick={handlePhotoRemove} className="text-[11px] font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1"><X size={11} /> Remove</button>}
        </div>
        {intakePhotoUrl ? (
          <img src={intakePhotoUrl} alt="Upload preview" className="w-full max-h-44 object-cover rounded-lg border border-slate-200 dark:border-slate-700" />
        ) : (
          <label htmlFor="intake-photo" className="flex flex-col items-center gap-1 py-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 transition-colors">
            <ImagePlus size={18} className="text-teal-600" />
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
            <input type={f.type} value={(patientInfo as any)[f.key]} onChange={e => setPatientInfo({ ...patientInfo, [f.key]: e.target.value })} placeholder={f.placeholder} className={inputClass} />
          </FormField>
        ))}
      </div>
      <FormField label="Gender">
        <div className="flex gap-2">
          {['Male', 'Female', 'Other'].map(g => (
            <button key={g} onClick={() => setPatientInfo({ ...patientInfo, gender: g })} className={`flex-1 py-2 rounded-xl text-[12px] font-bold border-2 transition-colors ${patientInfo.gender === g ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/30 text-teal-700' : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500'}`}>{g}</button>
          ))}
        </div>
      </FormField>
      <FormField label={isDoctorRole ? 'Assigned Therapist *' : 'Assigned Therapist'}>
        {isDoctorRole ? (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-teal-500">
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
export function StepVitals({ vitals, setVitals }: { vitals: any; setVitals: (v: any) => void }) {
  return (
    <SectionCard icon={<Heart size={18} className="text-rose-600 dark:text-rose-400" />} title="Vital Signs" subtitle="Record current vitals" accent="rose">
      <FormField label="Blood Pressure (mmHg)">
        <div className="flex gap-2 items-center">
          <input value={vitals.bp_sys} onChange={e => setVitals({ ...vitals, bp_sys: e.target.value })} placeholder="Systolic" className={`${inputClass} text-center`} />
          <span className="text-slate-400 font-bold">/</span>
          <input value={vitals.bp_dia} onChange={e => setVitals({ ...vitals, bp_dia: e.target.value })} placeholder="Diastolic" className={`${inputClass} text-center`} />
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
            <input type="number" value={(vitals as any)[f.key]} onChange={e => setVitals({ ...vitals, [f.key]: e.target.value })} placeholder={f.placeholder} className={inputClass} />
          </FormField>
        ))}
      </div>
    </SectionCard>
  );
}

// ── Step 2: Chief Complaints & Associated Symptoms ────────────────────────────
export function StepComplaints({ chiefComplaints, setChiefComplaints, associatedSymptoms, setAssociatedSymptoms, complaintsText, setComplaintsText }: any) {
  return (
    <div className="flex flex-col gap-3">
      <SectionCard icon={<CheckSquare size={18} className="text-fuchsia-600 dark:text-fuchsia-400" />} title="Chief Complaints" subtitle="Select or type primary complaints" accent="fuchsia">
        <MultiSelectDropdown options={CHIEF_COMPLAINT_OPTIONS} selected={chiefComplaints} onChange={setChiefComplaints} placeholder="Search complaints…" accent="fuchsia" />
        <textarea value={complaintsText} onChange={(e: any) => setComplaintsText(e.target.value)} placeholder="Additional complaint details or free-text notes…" className={`${inputClass} h-[70px] resize-none mt-3`} />
      </SectionCard>
      <SectionCard icon={<ClipboardList size={18} className="text-blue-600 dark:text-blue-400" />} title="Associated Symptoms" subtitle="Select all that apply" accent="blue">
        <MultiSelectDropdown options={ASSOCIATED_SYMPTOM_OPTIONS} selected={associatedSymptoms} onChange={setAssociatedSymptoms} placeholder="Search symptoms…" accent="blue" />
      </SectionCard>
    </div>
  );
}

// ── Step 3: Pain Scale & Functional ───────────────────────────────────────────
export function StepPainFunction({ painLevel, setPainLevel, funcRatings, setFuncRatings }: any) {
  const painColors = ['bg-green-500','bg-lime-500','bg-lime-400','bg-yellow-400','bg-orange-400','bg-orange-500','bg-red-500','bg-red-600','bg-red-700','bg-red-800','bg-red-900'];
  const painLabel = painLevel === 0 ? 'No Pain' : painLevel <= 2 ? 'Mild' : painLevel <= 4 ? 'Moderate' : painLevel <= 6 ? 'Significant' : painLevel <= 8 ? 'Severe' : 'Worst';
  const funcColors = ['bg-green-500 border-green-500','bg-lime-500 border-lime-500','bg-yellow-400 border-yellow-400','bg-orange-500 border-orange-500','bg-red-500 border-red-500'];

  return (
    <div className="flex flex-col gap-3">
      <SectionCard icon={<Sliders size={18} className="text-orange-500 dark:text-orange-400" />} title="Pain Scale" subtitle="Rate current pain 0–10" accent="orange">
        <div className="flex flex-col items-center mb-4">
          <div className={`rounded-full flex items-center justify-center w-20 h-20 ${painColors[painLevel]} mb-2`}>
            <span className="text-[28px] font-black text-white">{painLevel}</span>
          </div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{painLabel}</p>
        </div>
        <input type="range" min={0} max={10} value={painLevel} onChange={e => setPainLevel(Number(e.target.value))} className="w-full h-1.5 cursor-pointer accent-teal-600 mb-2" />
        <div className="flex gap-0.5 rounded-xl overflow-hidden">
          {painColors.map((c, i) => (
            <div key={i} className={`flex-1 h-7 flex items-center justify-center cursor-pointer ${c} ${painLevel === i ? 'opacity-100' : 'opacity-35'}`} onClick={() => setPainLevel(i)}>
              <span className="text-[9px] font-bold text-white">{i}</span>
            </div>
          ))}
        </div>
      </SectionCard>
      <SectionCard icon={<ClipboardList size={18} className="text-emerald-600 dark:text-emerald-400" />} title="Functional Activities" subtitle="Rate difficulty 0–4" accent="emerald">
        <div className="flex gap-1 mb-3">{RATING_LABELS.map((l, i) => <span key={l} className="flex-1 text-center text-[9px] text-slate-400 font-bold">{i}: {l}</span>)}</div>
        <div className="flex flex-col gap-3">
          {FUNCTIONAL_ACTIVITIES.map(act => (
            <div key={act.key}>
              <p className="text-[12px] font-bold text-slate-900 dark:text-white mb-1.5">{act.label}</p>
              <div className="flex gap-1.5">
                {[0,1,2,3,4].map(val => (
                  <button key={val} onClick={() => setFuncRatings({ ...funcRatings, [act.key]: val })} className={`flex-1 py-2 rounded-xl text-[12px] font-extrabold border-2 transition-colors ${funcRatings[act.key] === val ? `${funcColors[val]} text-white` : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400'}`}>{val}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ── Step 6: Medical History ───────────────────────────────────────────────────
export function StepHistory({ selectedMedicalHistory, setSelectedMedicalHistory, otherMedicalHistory, setOtherMedicalHistory, showOtherMedicalHistory, setShowOtherMedicalHistory }: any) {
  return (
    <SectionCard icon={<ClipboardList size={18} className="text-fuchsia-600 dark:text-fuchsia-400" />} title="Medical History" subtitle="Past conditions & surgeries" accent="fuchsia">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {MEDICAL_HISTORY_OPTIONS.map(item => (
          <ToggleChip key={item} label={item} checked={selectedMedicalHistory.includes(item)} onChange={() => setSelectedMedicalHistory((prev: string[]) => prev.includes(item) ? prev.filter((x: string) => x !== item) : [...prev, item])} accent="fuchsia" />
        ))}
      </div>
      <div className="mt-3">
        <ToggleChip label="Others (specify)" checked={showOtherMedicalHistory || !!otherMedicalHistory} onChange={() => setShowOtherMedicalHistory(!showOtherMedicalHistory)} accent="fuchsia" />
        {(showOtherMedicalHistory || otherMedicalHistory) && (
          <input value={otherMedicalHistory} onChange={(e: any) => setOtherMedicalHistory(e.target.value)} placeholder="Other medical history…" className={`${inputClass} mt-2`} autoFocus />
        )}
      </div>
    </SectionCard>
  );
}
