import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import {
  ArrowLeft,
  ChevronRight,
  ChevronLeft,
  User,
  Heart,
  Activity,
  Sliders,
  CheckSquare,
  ClipboardList,
  Save,
  Check,
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

const painColors = [
  '#22c55e', '#84cc16', '#a3e635', '#facc15', '#fb923c',
  '#f97316', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
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
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);

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

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => navigate('/nurse'), 2000);
  };

  if (saved) {
    return (
      <div className="h-full flex flex-col items-center justify-center" style={{ background: '#f0fdfa' }}>
        <div className="flex flex-col items-center p-8 rounded-3xl mx-6"
          style={{ background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
          <div className="rounded-full flex items-center justify-center mb-4"
            style={{ width: '80px', height: '80px', background: '#ecfdf5' }}>
            <Check size={44} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>
            Form Saved!
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginTop: '8px' }}>
            Patient intake data saved successfully.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 pb-4 shrink-0"
        style={{
          background: 'linear-gradient(135deg, #0f766e, #0d9488)',
          paddingTop: '20px',
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => step > 0 ? setStep(step - 1) : navigate('/nurse')}
            className="flex items-center justify-center rounded-xl"
            style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={18} color="white" />
          </button>
          <div>
            <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'white' }}>Patient Intake Form</h1>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
              Step {step + 1} of {steps.length} — {steps[step].label}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="rounded-full" style={{ height: '6px', background: 'rgba(255,255,255,0.2)' }}>
          <div
            className="rounded-full h-full transition-all duration-300"
            style={{ width: `${((step + 1) / steps.length) * 100}%`, background: 'white' }}
          />
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {steps.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === step ? '20px' : '6px',
                height: '6px',
                background: i <= step ? 'white' : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Scrollable form content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full" style={{ background: '#f0fdf9' }}>

        {/* Step 1: Patient Info */}
        {step === 0 && (
          <div className="p-4 rounded-2xl" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-xl flex items-center justify-center" style={{ width: '36px', height: '36px', background: '#f0fdfa' }}>
                <User size={18} color="#0f766e" />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Patient Information</h2>
            </div>
            {[
              { key: 'name', label: 'Full Name', placeholder: 'e.g. Priya Sharma', type: 'text' },
              { key: 'age', label: 'Age', placeholder: 'e.g. 32', type: 'number' },
              { key: 'phone', label: 'Phone Number', placeholder: 'e.g. 9876543210', type: 'tel' },
              { key: 'address', label: 'Address', placeholder: 'Enter address', type: 'text' },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  {field.label}
                </label>
                <input
                  type={field.type}
                  value={(patientInfo as any)[field.key]}
                  onChange={(e) => setPatientInfo({ ...patientInfo, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full outline-none"
                  style={{ padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '14px', color: '#1e293b' }}
                />
              </div>
            ))}
            <div>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Gender
              </label>
              <div className="flex gap-2">
                {['Male', 'Female', 'Other'].map((g) => (
                  <button
                    key={g}
                    onClick={() => setPatientInfo({ ...patientInfo, gender: g })}
                    className="flex-1 py-2.5 rounded-xl"
                    style={{
                      fontSize: '13px', fontWeight: 700,
                      border: `2px solid ${patientInfo.gender === g ? '#0f766e' : '#e2e8f0'}`,
                      background: patientInfo.gender === g ? '#f0fdfa' : '#f8fafc',
                      color: patientInfo.gender === g ? '#0f766e' : '#64748b',
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Vitals */}
        {step === 1 && (
          <div className="p-4 rounded-2xl" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-xl flex items-center justify-center" style={{ width: '36px', height: '36px', background: '#fff1f2' }}>
                <Heart size={18} color="#e11d48" />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Vital Signs</h2>
            </div>

            {/* Blood Pressure */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                Blood Pressure (mmHg)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  value={vitals.bp_sys}
                  onChange={(e) => setVitals({ ...vitals, bp_sys: e.target.value })}
                  placeholder="Systolic"
                  className="flex-1 outline-none text-center"
                  style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '14px' }}
                />
                <span style={{ color: '#94a3b8', fontWeight: 700 }}>/</span>
                <input
                  value={vitals.bp_dia}
                  onChange={(e) => setVitals({ ...vitals, bp_dia: e.target.value })}
                  placeholder="Diastolic"
                  className="flex-1 outline-none text-center"
                  style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '14px' }}
                />
              </div>
            </div>

            {[
              { key: 'pr', label: 'Pulse Rate (bpm)', placeholder: 'e.g. 72', icon: '💓' },
              { key: 'spo2', label: 'SpO₂ (%)', placeholder: 'e.g. 98', icon: '🫁' },
              { key: 'temp', label: 'Temperature (°F)', placeholder: 'e.g. 98.6', icon: '🌡️' },
              { key: 'ef', label: 'Ejection Fraction (%)', placeholder: 'e.g. 55', icon: '❤️' },
            ].map((field) => (
              <div key={field.key} style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                  {field.icon} {field.label}
                </label>
                <input
                  type="number"
                  value={(vitals as any)[field.key]}
                  onChange={(e) => setVitals({ ...vitals, [field.key]: e.target.value })}
                  placeholder={field.placeholder}
                  className="w-full outline-none"
                  style={{ padding: '12px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '14px' }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Step 3: Symptoms */}
        {step === 2 && (
          <div className="p-4 rounded-2xl" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-xl flex items-center justify-center" style={{ width: '36px', height: '36px', background: '#eff6ff' }}>
                <Activity size={18} color="#2563eb" />
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Symptoms</h2>
                <p style={{ fontSize: '11px', color: '#64748b' }}>{checkedSymptoms.length} selected</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {symptoms.map((s) => {
                const checked = checkedSymptoms.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleSymptom(s)}
                    className="flex items-center gap-3 p-3 rounded-xl text-left"
                    style={{
                      border: `1.5px solid ${checked ? '#2563eb' : '#e2e8f0'}`,
                      background: checked ? '#eff6ff' : '#f8fafc',
                    }}
                  >
                    <div
                      className="rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        width: '22px', height: '22px',
                        background: checked ? '#2563eb' : 'white',
                        border: `2px solid ${checked ? '#2563eb' : '#cbd5e1'}`,
                      }}
                    >
                      {checked && <Check size={13} color="white" />}
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: checked ? 700 : 500, color: checked ? '#1e40af' : '#475569' }}>
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
          <div className="p-4 rounded-2xl" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-xl flex items-center justify-center" style={{ width: '36px', height: '36px', background: '#fff7ed' }}>
                <Sliders size={18} color="#f97316" />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Pain Scale</h2>
            </div>

            {/* Pain indicator */}
            <div className="flex flex-col items-center mb-6">
              <div
                className="rounded-full flex items-center justify-center mb-2"
                style={{ width: '100px', height: '100px', background: `${painColors[painLevel]}20` }}
              >
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{ width: '80px', height: '80px', background: painColors[painLevel] }}
                >
                  <span style={{ fontSize: '32px', fontWeight: 900, color: 'white' }}>{painLevel}</span>
                </div>
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: painColors[painLevel] }}>
                {painLevel === 0 ? 'No Pain' : painLevel <= 2 ? 'Mild Pain' : painLevel <= 4 ? 'Moderate Pain' : painLevel <= 6 ? 'Significant Pain' : painLevel <= 8 ? 'Severe Pain' : 'Worst Pain'}
              </p>
            </div>

            {/* Slider */}
            <div style={{ marginBottom: '16px' }}>
              <input
                type="range"
                min={0}
                max={10}
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                className="w-full"
                style={{ accentColor: painColors[painLevel], cursor: 'pointer', height: '6px' }}
              />
              <div className="flex justify-between mt-1">
                <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>0 — None</span>
                <span style={{ fontSize: '11px', color: '#f97316', fontWeight: 700 }}>5 — Moderate</span>
                <span style={{ fontSize: '11px', color: '#991b1b', fontWeight: 700 }}>10 — Severe</span>
              </div>
            </div>

            {/* Color legend */}
            <div className="flex gap-0.5 rounded-xl overflow-hidden mb-3">
              {painColors.map((c, i) => (
                <div
                  key={i}
                  className="flex-1 flex items-center justify-center cursor-pointer"
                  style={{ height: '32px', background: c, opacity: painLevel === i ? 1 : 0.4 }}
                  onClick={() => setPainLevel(i)}
                >
                  <span style={{ fontSize: '10px', fontWeight: 700, color: 'white' }}>{i}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
                💡 Ask patient to rate their current pain level from 0 (no pain) to 10 (worst imaginable pain)
              </p>
            </div>
          </div>
        )}

        {/* Step 5: Functional Activities */}
        {step === 4 && (
          <div className="p-4 rounded-2xl" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-2">
              <div className="rounded-xl flex items-center justify-center" style={{ width: '36px', height: '36px', background: '#f0fdf4' }}>
                <ClipboardList size={18} color="#16a34a" />
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Functional Activities</h2>
                <p style={{ fontSize: '11px', color: '#64748b' }}>Rate difficulty level (0–4)</p>
              </div>
            </div>
            <div className="flex gap-1 mb-4 mt-1">
              {ratingLabels.map((l, i) => (
                <div key={l} className="flex-1 text-center" style={{ fontSize: '9px', color: '#94a3b8', fontWeight: 600, lineHeight: 1.2 }}>
                  {i}: {l}
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-4">
              {functionalActivities.map((act) => (
                <div key={act.key}>
                  <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>{act.label}</p>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4].map((val) => {
                      const selected = funcRatings[act.key] === val;
                      const colors = ['#22c55e', '#84cc16', '#facc15', '#f97316', '#ef4444'];
                      return (
                        <button
                          key={val}
                          onClick={() => setFuncRatings({ ...funcRatings, [act.key]: val })}
                          className="flex-1 py-2.5 rounded-xl"
                          style={{
                            fontSize: '14px', fontWeight: 800,
                            background: selected ? colors[val] : '#f1f5f9',
                            color: selected ? 'white' : '#94a3b8',
                            border: selected ? `2px solid ${colors[val]}` : '2px solid transparent',
                          }}
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
            <div className="p-4 rounded-2xl" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="rounded-xl flex items-center justify-center" style={{ width: '36px', height: '36px', background: '#fdf4ff' }}>
                  <CheckSquare size={18} color="#9333ea" />
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Chief Complaints</h2>
              </div>
              <textarea
                value={complaints}
                onChange={(e) => setComplaints(e.target.value)}
                placeholder="Describe the patient's main complaints in detail..."
                className="w-full outline-none resize-none"
                style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '13px', minHeight: '100px' }}
              />
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                Associated Symptoms
              </h3>
              <textarea
                value={associated}
                onChange={(e) => setAssociated(e.target.value)}
                placeholder="Any other symptoms the patient is experiencing..."
                className="w-full outline-none resize-none"
                style={{ padding: '12px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '13px', minHeight: '80px' }}
              />
            </div>
            <div className="p-4 rounded-2xl" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
                Medical History
              </h3>
              <div className="flex flex-col gap-2">
                {['Diabetes', 'Hypertension', 'Heart Disease', 'Previous Surgery', 'Allergies'].map((item) => (
                  <div key={item} className="flex items-center gap-2 p-2 rounded-xl" style={{ background: '#f8fafc' }}>
                    <input type="checkbox" id={item} style={{ accentColor: '#9333ea', width: '16px', height: '16px' }} />
                    <label htmlFor={item} style={{ fontSize: '13px', color: '#475569', fontWeight: 500, cursor: 'pointer' }}>{item}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Review */}
        {step === 6 && (
          <div className="flex flex-col gap-3">
            <div className="p-4 rounded-2xl" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-xl flex items-center justify-center" style={{ width: '36px', height: '36px', background: '#f0fdfa' }}>
                  <Save size={18} color="#0f766e" />
                </div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Review & Save</h2>
              </div>

              {/* Summary */}
              <div className="flex flex-col gap-3">
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
                  <div key={item.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{item.label}</span>
                    <span style={{ fontSize: '13px', color: '#0f172a', fontWeight: 700 }}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)', color: 'white', fontSize: '16px', fontWeight: 700, boxShadow: '0 8px 24px rgba(15,118,110,0.35)' }}
            >
              <Save size={18} />
              Save Patient Intake Form
            </button>

            <button
              className="w-full py-3 rounded-2xl flex items-center justify-center gap-2"
              style={{ background: 'white', color: '#64748b', fontSize: '14px', fontWeight: 700, border: '1.5px solid #e2e8f0' }}
            >
              Save as Draft
            </button>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="px-4 py-3 shrink-0 flex gap-3" style={{ background: 'white', borderTop: '1px solid #f1f5f9' }}>
        {step > 0 && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl"
            style={{ background: '#f1f5f9', color: '#475569', fontSize: '14px', fontWeight: 700 }}
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}
        {step < steps.length - 1 && (
          <button
            onClick={() => setStep(step + 1)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)', color: 'white', fontSize: '14px', fontWeight: 700 }}
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