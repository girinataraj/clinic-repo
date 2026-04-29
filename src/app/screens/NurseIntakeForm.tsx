import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { useCreateEvaluation } from '../../hooks/useEvaluations';
import {
  ArrowLeft, ChevronRight, ChevronLeft, User, Heart,
  Activity, Sliders, CheckSquare, ClipboardList, Save, Check, Loader2,
} from 'lucide-react';

const symptoms = [
  'Lower Back Pain', 'Neck Pain', 'Shoulder Pain', 'Knee Pain',
  'Hip Pain', 'Ankle Pain', 'Wrist Pain', 'Headache',
  'Muscle Weakness', 'Numbness / Tingling', 'Swelling', 'Stiffness',
  'Limited Range of Motion', 'Fatigue', 'Dizziness',
];

const functionalActivities = [
  { label: 'Walking', key: 'walking' },
  { label: 'Climbing Stairs', key: 'stairs' },
  { label: 'Sitting', key: 'sitting' },
  { label: 'Standing', key: 'standing' },
  { label: 'Dressing', key: 'dressing' },
  { label: 'Lifting Objects', key: 'lifting' },
];

const ratingLabels = ['No Difficulty', 'Mild', 'Moderate', 'Severe', 'Unable'];

// Colors for pain scale corresponding to 0-10
const painColors = [
  'bg-green-500', 'bg-lime-500', 'bg-lime-400', 'bg-yellow-400', 'bg-orange-400',
  'bg-orange-500', 'bg-red-500', 'bg-red-600', 'bg-red-700', 'bg-red-800', 'bg-red-900',
];

// corresponding text colors
const painTextColors = [
  'text-green-500', 'text-lime-500', 'text-lime-400', 'text-yellow-400', 'text-orange-400',
  'text-orange-500', 'text-red-500', 'text-red-600', 'text-red-700', 'text-red-800', 'text-red-900',
];

const steps = [
  { label: 'Patient Info', icon: User },
  { label: 'Vitals', icon: Heart },
  { label: 'Symptoms', icon: Activity },
  { label: 'Pain Scale', icon: Sliders },
  { label: 'Functional', icon: ClipboardList },
  { label: 'Complaints', icon: CheckSquare },
  { label: 'Review', icon: Save },
];

export function NurseIntakeForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId') ?? '';
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Real API mutation ──────────────────────────────────────────────────────
  const createEvaluation = useCreateEvaluation();

  // Form data
  const [patientInfo, setPatientInfo] = useState({ name: '', age: '', phone: '', gender: 'Male', address: '' });
  const [vitals, setVitals] = useState({ bp_sys: '', bp_dia: '', pr: '', spo2: '', temp: '', ef: '' });
  const [checkedSymptoms, setCheckedSymptoms] = useState<string[]>([]);
  const [painLevel, setPainLevel] = useState(0);
  const [funcRatings, setFuncRatings] = useState<Record<string, number>>({});
  const [complaints, setComplaints] = useState('');
  const [associated, setAssociated] = useState('');

  const toggleSymptom = (s: string) => {
    setCheckedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleSave = async () => {
    setSubmitError(null);
    try {
      await createEvaluation.mutateAsync({
        patientId,
        bp: vitals.bp_sys && vitals.bp_dia ? `${vitals.bp_sys}/${vitals.bp_dia}` : undefined,
        pr: vitals.pr ? Number(vitals.pr) : undefined,
        spo2: vitals.spo2 ? Number(vitals.spo2) : undefined,
        temperature: vitals.temp ? Number(vitals.temp) : undefined,
        ef: vitals.ef ? Number(vitals.ef) : undefined,
        painLevel,
        chiefComplaints: complaints || undefined,
        associatedSymptoms: checkedSymptoms.length > 0 ? checkedSymptoms : undefined,
        functionalScores: Object.keys(funcRatings).length > 0 ? funcRatings : undefined,
        status: 'submitted',
      } as Record<string, unknown>);
      setSaved(true);
      setTimeout(() => navigate('/nurse'), 2000);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? 'Failed to save evaluation. Please try again.');
    }
  };

  if (saved) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-teal-50 dark:bg-slate-950 font-sans">
        <div className="flex flex-col items-center p-8 rounded-[24px] mx-6 bg-white dark:bg-slate-900 shadow-xl dark:shadow-none border border-slate-100 dark:border-slate-800 border-opacity-50">
          <div className="rounded-full flex items-center justify-center mb-4 w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30">
            <Check className="w-11 h-11 text-emerald-500" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white text-center">
            Form Saved!
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 text-center mt-2">
            Patient intake data saved successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header */}
      <div
        className="px-5 pb-4 shrink-0 pt-5"
        style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/nurse')}
            className="flex items-center justify-center rounded-xl w-9 h-9 bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <div>
            <h1 className="text-[17px] font-extrabold text-white">Patient Intake Form</h1>
            <p className="text-[11px] text-white/70 font-medium">
              Step {step + 1} of {steps.length} — {steps[step].label}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="rounded-full h-1.5 bg-white/20">
          <div
            className="rounded-full h-full bg-white transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all h-1.5 ${i <= step ? 'bg-white' : 'bg-white/30'} ${i === step ? 'w-5' : 'w-1.5'}`}
            />
          ))}
        </div>
      </div>

      {/* Scrollable form content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full">

        {/* Step 1: Patient Info */}
        {step === 0 && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-xl flex items-center justify-center w-9 h-9 bg-teal-50 dark:bg-teal-900/30">
                <User size={18} className="text-teal-700 dark:text-teal-400" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Patient Information</h2>
            </div>
            {[
              { key: 'name', label: 'Full Name', placeholder: 'e.g. Priya Sharma', type: 'text' },
              { key: 'age', label: 'Age', placeholder: 'e.g. 32', type: 'number' },
              { key: 'phone', label: 'Phone Number', placeholder: 'e.g. 9876543210', type: 'tel' },
              { key: 'address', label: 'Address', placeholder: 'Enter address', type: 'text' },
            ].map((field) => (
              <div key={field.key} className="mb-3">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={(patientInfo as any)[field.key]}
                  onChange={(e) => setPatientInfo({ ...patientInfo, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full outline-none px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 dark:focus:border-teal-500 transition-colors"
                />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Gender
              </label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map((g) => {
                  const isSelected = patientInfo.gender === g;
                  return (
                    <button
                      key={g}
                      onClick={() => setPatientInfo({ ...patientInfo, gender: g })}
                      className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border-2 transition-colors ${
                        isSelected
                          ? 'border-teal-700 dark:border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vitals */}
        {step === 1 && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-xl flex items-center justify-center w-9 h-9 bg-rose-50 dark:bg-rose-900/30">
                <Heart size={18} className="text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Vital Signs</h2>
            </div>

            {/* Blood Pressure */}
            <div className="mb-3.5">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                Blood Pressure (mmHg)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  value={vitals.bp_sys}
                  onChange={(e) => setVitals({ ...vitals, bp_sys: e.target.value })}
                  placeholder="Systolic"
                  className="flex-1 outline-none text-center px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
                <span className="text-slate-400 dark:text-slate-500 font-bold">/</span>
                <input
                  value={vitals.bp_dia}
                  onChange={(e) => setVitals({ ...vitals, bp_dia: e.target.value })}
                  placeholder="Diastolic"
                  className="flex-1 outline-none text-center px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            </div>

            {[
              { key: 'pr', label: 'Pulse Rate (bpm)', placeholder: 'e.g. 72', icon: '💓' },
              { key: 'spo2', label: 'SpO₂ (%)', placeholder: 'e.g. 98', icon: '🫁' },
              { key: 'temp', label: 'Temperature (°F)', placeholder: 'e.g. 98.6', icon: '🌡️' },
              { key: 'ef', label: 'Ejection Fraction (%)', placeholder: 'e.g. 55', icon: '❤️' },
            ].map((field) => (
              <div key={field.key} className="mb-3">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  {field.icon} {field.label}
                </label>
                <input
                  type="number"
                  value={(vitals as any)[field.key]}
                  onChange={(e) => setVitals({ ...vitals, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full outline-none px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                />
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Symptoms */}
        {step === 2 && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-xl flex items-center justify-center w-9 h-9 bg-blue-50 dark:bg-blue-900/30">
                <Activity size={18} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Symptoms</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">{checkedSymptoms.length} selected</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {symptoms.map((s) => {
                const checked = checkedSymptoms.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className={`flex items-center gap-3 p-3 rounded-xl text-left border-[1.5px] transition-colors ${
                      checked
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div
                      className={`rounded-lg flex items-center justify-center shrink-0 w-[22px] h-[22px] border-2 ${
                        checked
                          ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {checked && <Check size={13} strokeWidth={3} color="white" />}
                    </div>
                    <span className={`text-[13px] ${checked ? 'font-bold text-blue-800 dark:text-blue-300' : 'font-semibold text-slate-600 dark:text-slate-300'}`}>
                      {s}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: Pain Scale */}
        {step === 3 && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-xl flex items-center justify-center w-9 h-9 bg-orange-50 dark:bg-orange-900/30">
                <Sliders size={18} className="text-orange-500 dark:text-orange-400" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Pain Scale</h2>
            </div>

            {/* Pain indicator */}
            <div className="flex flex-col items-center mb-6">
              <div className={`rounded-full flex items-center justify-center mb-2 w-[100px] h-[100px] ${painColors[painLevel]} bg-opacity-20`}>
                <div className={`rounded-full flex items-center justify-center w-[80px] h-[80px] ${painColors[painLevel]}`}>
                  <span className="text-[32px] font-black text-white">{painLevel}</span>
                </div>
              </div>
              <p className={`text-base font-bold ${painTextColors[painLevel]}`}>
                {painLevel === 0 ? 'No Pain' : painLevel <= 2 ? 'Mild Pain' : painLevel <= 4 ? 'Moderate Pain' : painLevel <= 6 ? 'Significant Pain' : painLevel <= 8 ? 'Severe Pain' : 'Worst Pain'}
              </p>
            </div>

            {/* Slider */}
            <div className="mb-4">
              <input
                type="range"
                min={0}
                max={10}
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                className="w-full h-1.5 cursor-pointer accent-teal-600 dark:accent-teal-500"
              />
              <div className="flex justify-between mt-1">
                <span className="text-[11px] text-emerald-500 dark:text-emerald-400 font-bold">0 — None</span>
                <span className="text-[11px] text-orange-500 dark:text-orange-400 font-bold">5 — Moderate</span>
                <span className="text-[11px] text-red-700 dark:text-red-400 font-bold">10 — Severe</span>
              </div>
            </div>

            {/* Color legend */}
            <div className="flex gap-0.5 rounded-xl overflow-hidden mb-3">
              {painColors.map((cClass, i) => (
                <div
                  key={i}
                  className={`flex-1 flex items-center justify-center cursor-pointer h-8 ${cClass} ${painLevel === i ? 'opacity-100' : 'opacity-40'}`}
                  onClick={() => setPainLevel(i)}
                >
                  <span className="text-[10px] font-bold text-white">{i}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                💡 Ask patient to rate their current pain level from 0 (no pain) to 10 (worst imaginable pain)
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Functional Activities */}
        {step === 4 && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-xl flex items-center justify-center w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30">
                <ClipboardList size={18} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Functional Activities</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Rate difficulty level (0–4)</p>
              </div>
            </div>
            <div className="flex gap-1 mb-4 mt-1">
              {ratingLabels.map((l, i) => (
                <div key={l} className="flex-1 text-center text-[9px] text-slate-400 dark:text-slate-500 font-bold leading-[1.2]">
                  {i}: {l}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              {functionalActivities.map((act) => (
                <div key={act.key}>
                  <p className="text-[13px] font-bold text-slate-900 dark:text-white mb-2">{act.label}</p>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4].map((val) => {
                      const selected = funcRatings[act.key] === val;
                      const colors = ['bg-green-500 border-green-500', 'bg-lime-500 border-lime-500', 'bg-yellow-400 border-yellow-400', 'bg-orange-500 border-orange-500', 'bg-red-500 border-red-500'];
                      return (
                        <button
                          key={val}
                          onClick={() => setFuncRatings({ ...funcRatings, [act.key]: val })}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-extrabold border-2 transition-colors ${
                            selected
                              ? `${colors[val]} text-white`
                              : 'bg-slate-100 dark:bg-slate-800 border-transparent text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          {val}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Complaints */}
        {step === 5 && (
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <div className="rounded-xl flex items-center justify-center w-9 h-9 bg-fuchsia-50 dark:bg-fuchsia-900/30">
                  <CheckSquare size={18} className="text-fuchsia-600 dark:text-fuchsia-400" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Chief Complaints</h2>
              </div>
              <textarea
                value={complaints}
                onChange={(e) => setComplaints(e.target.value)}
                placeholder="Describe the patient's main complaints in detail..."
                className="w-full h-[100px] outline-none resize-none px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white mb-2.5">
                Associated Symptoms
              </h3>
              <textarea
                value={associated}
                onChange={(e) => setAssociated(e.target.value)}
                placeholder="Any other symptoms the patient is experiencing..."
                className="w-full h-[80px] outline-none resize-none px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white mb-2.5">
                Medical History
              </h3>
              <div className="flex flex-col gap-2">
                {['Diabetes', 'Hypertension', 'Heart Disease', 'Previous Surgery', 'Allergies'].map((item) => (
                  <div key={item} className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800">
                    <input type="checkbox" id={item} className="w-4 h-4 accent-fuchsia-600 dark:accent-fuchsia-500 rounded" />
                    <label htmlFor={item} className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 cursor-pointer flex-1">{item}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Review */}
        {step === 6 && (
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-xl flex items-center justify-center w-9 h-9 bg-teal-50 dark:bg-teal-900/30">
                  <Save size={18} className="text-teal-700 dark:text-teal-400" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Review & Save</h2>
              </div>

              {/* Summary */}
              <div className="flex flex-col gap-0">
                {[
                  { label: 'Patient Name', value: patientInfo.name || 'Not entered' },
                  { label: 'Age', value: patientInfo.age || 'Not entered' },
                  { label: 'Phone', value: patientInfo.phone || 'Not entered' },
                  { label: 'Blood Pressure', value: vitals.bp_sys && vitals.bp_dia ? `${vitals.bp_sys}/${vitals.bp_dia} mmHg` : 'Not entered' },
                  { label: 'Pulse Rate', value: vitals.pr ? `${vitals.pr} bpm` : 'Not entered' },
                  { label: 'SpO₂', value: vitals.spo2 ? `${vitals.spo2}%` : 'Not entered' },
                  { label: 'Pain Level', value: `${painLevel}/10` },
                  { label: 'Symptoms', value: checkedSymptoms.length > 0 ? `${checkedSymptoms.length} reported` : 'None' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0 border-opacity-50">
                    <span className="text-[13px] text-slate-500 dark:text-slate-400 font-bold">{item.label}</span>
                    <span className="text-[13px] text-slate-900 dark:text-white font-extrabold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {submitError && (
              <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-semibold">
                {submitError}
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={createEvaluation.isPending}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-white text-base font-extrabold shadow-lg shadow-teal-700/30 group disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}
            >
              {createEvaluation.isPending ? (
                <><Loader2 size={18} className="animate-spin" /> Submitting…</>
              ) : (
                <><Save size={18} className="group-hover:scale-110 transition-transform" /> Save Patient Intake Form</>
              )}
            </button>

            <button
              className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-sm font-extrabold border-[1.5px] border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Save as Draft
            </button>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="px-4 py-3 shrink-0 flex gap-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-[14px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-extrabold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}
        {step < steps.length - 1 && (
          <button
            onClick={() => setStep(step + 1)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-white text-sm font-extrabold hover:opacity-90 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}
          >
            Next Step
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      <div className="md:hidden">
        <BottomNav role="nurse" />
      </div>
    </div>
  );
}