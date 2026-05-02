import { useState, useCallback, useEffect, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { useCreateEvaluation } from '../../hooks/useEvaluations';
import { usePatientByPhone, useCreatePatient, usePatient } from '../../hooks/usePatients';
import { useAppConfigScope } from '../../hooks/useAppConfig';
import type { AppConfigScopes } from '../../hooks/useAppConfig';
import {
  ArrowLeft, ChevronRight, ChevronLeft, User, Heart, Phone, Search, UserPlus,
  Activity, Sliders, CheckSquare, ClipboardList, Save, Check, Loader2, AlertTriangle,
  CreditCard, ImagePlus, X,
} from 'lucide-react';

const stepIconMap = { User, Heart, Activity, Sliders, ClipboardList, CheckSquare, Save };

const nonEmptyOrDefault = <T,>(value: T[] | undefined, fallback: T[]) =>
  value && value.length > 0 ? value : fallback;

type ResolvedIntakeConfig = Omit<Required<AppConfigScopes['intake']>, 'painScale'> & {
  painScale: {
    colors: string[];
    textColors: string[];
  };
};

const defaultIntakeConfig: ResolvedIntakeConfig = {
  symptoms: [
    'Lower Back Pain',
    'Neck Pain',
    'Shoulder Pain',
    'Knee Pain',
    'Hip Pain',
    'Ankle Pain',
    'Wrist Pain',
    'Headache',
    'Muscle Weakness',
    'Numbness / Tingling',
    'Swelling',
    'Stiffness',
    'Limited Range of Motion',
    'Fatigue',
    'Dizziness',
  ],
  functionalActivities: [
    { label: 'Walking', key: 'walking' },
    { label: 'Climbing Stairs', key: 'stairs' },
    { label: 'Sitting', key: 'sitting' },
    { label: 'Standing', key: 'standing' },
    { label: 'Dressing', key: 'dressing' },
    { label: 'Lifting Objects', key: 'lifting' },
  ],
  ratingLabels: ['No Difficulty', 'Mild', 'Moderate', 'Severe', 'Unable'],
  functionalRatingColors: [
    'bg-green-500 border-green-500',
    'bg-lime-500 border-lime-500',
    'bg-yellow-400 border-yellow-400',
    'bg-orange-500 border-orange-500',
    'bg-red-500 border-red-500',
  ],
  steps: [
    { label: 'Patient Info', icon: 'User' },
    { label: 'Vitals', icon: 'Heart' },
    { label: 'Symptoms', icon: 'Activity' },
    { label: 'Pain Scale', icon: 'Sliders' },
    { label: 'Functional', icon: 'ClipboardList' },
    { label: 'Complaints', icon: 'CheckSquare' },
    { label: 'Review & Payment', icon: 'Save' },
  ],
  painScale: {
    colors: [
      'bg-green-500',
      'bg-lime-500',
      'bg-lime-400',
      'bg-yellow-400',
      'bg-orange-400',
      'bg-orange-500',
      'bg-red-500',
      'bg-red-600',
      'bg-red-700',
      'bg-red-800',
      'bg-red-900',
    ],
    textColors: [
      'text-green-500',
      'text-lime-500',
      'text-lime-400',
      'text-yellow-400',
      'text-orange-400',
      'text-orange-500',
      'text-red-500',
      'text-red-600',
      'text-red-700',
      'text-red-800',
      'text-red-900',
    ],
  },
};

export function NurseIntakeForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: intakeConfig } = useAppConfigScope('intake');
  const currentRole = (user?.role === 'doctor' ? 'doctor' : 'nurse') as 'nurse' | 'doctor';
  const [searchParams] = useSearchParams();

  // ── Phone lookup state ────────────────────────────────────────────────────
  const [phoneInput, setPhoneInput] = useState(searchParams.get('phone') ?? '');
  const [phoneToFetch, setPhoneToFetch] = useState(searchParams.get('phone') ?? '');
  const [resolvedPatientId, setResolvedPatientId] = useState(searchParams.get('patientId') ?? '');
  const [lookupDone, setLookupDone] = useState(
    Boolean(searchParams.get('patientId') || searchParams.get('phone'))
  );
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState<{ name: string; age: string; gender: 'Male' | 'Female' | 'Other'; condition: string }>({ name: '', age: '', gender: 'Male', condition: '' });

  const { data: foundPatient, isLoading: lookingUp, isError: lookupError } = usePatientByPhone(
    phoneToFetch.trim().length >= 7 ? phoneToFetch.trim() : null
);
  const createPatientMutation = useCreatePatient();

  // Fetch patient by ID when provided in URL - auto-fill the form
  const { data: patientById } = usePatient(
    resolvedPatientId && !foundPatient ? resolvedPatientId : null
  );

  // Auto-fill form when patient is fetched via URL param
  useEffect(() => {
    if (patientById && !foundPatient && resolvedPatientId) {
      setPatientInfo({
        name: patientById.name ?? '',
        age: patientById.age ? String(patientById.age) : '',
        phone: patientById.phone ?? phoneToFetch,
        gender: (patientById.gender as 'Male' | 'Female' | 'Other') ?? 'Male',
        address: patientById.city ?? '',
      });
      setPhoneInput(patientById.phone ?? phoneToFetch);
      setPhoneToFetch(patientById.phone ?? phoneToFetch);
    }
  }, [patientById, foundPatient, resolvedPatientId, phoneToFetch]);

  // Auto-fill form when patient is found via phone lookup and we already have patientId from URL
  useEffect(() => {
    if (foundPatient && resolvedPatientId && resolvedPatientId === foundPatient.id) {
      setPatientInfo({
        name: foundPatient.name ?? '',
        age: foundPatient.age ? String(foundPatient.age) : '',
        phone: foundPatient.phone ?? phoneToFetch,
        gender: (foundPatient.gender as 'Male' | 'Female' | 'Other') ?? 'Male',
        address: foundPatient.city ?? '',
      });
    }
  }, [foundPatient, resolvedPatientId, phoneToFetch]);

  const handlePhoneLookup = useCallback(() => {
    if (phoneInput.trim().length < 7) return;
    setPhoneToFetch(phoneInput.trim());
    setLookupDone(true);
    setShowNewPatientForm(false);
  }, [phoneInput]);

  // When found patient resolves, prefill the form fields and capture UUID
  const handleUsefoundPatient = useCallback(() => {
    if (!foundPatient) return;
    setResolvedPatientId(foundPatient.id);
    setPatientInfo({
      name: foundPatient.name ?? '',
      age: foundPatient.age ? String(foundPatient.age) : '',
      phone: foundPatient.phone ?? phoneToFetch,
      gender: (foundPatient.gender as 'Male' | 'Female' | 'Other') ?? 'Male',
      address: foundPatient.city ?? '',
    });
  }, [foundPatient, phoneToFetch]);

  const handleCreateNewPatient = async () => {
    if (!newPatient.name || !newPatient.age) return;
    try {
      const created = await createPatientMutation.mutateAsync({
        name: newPatient.name,
        age: Number(newPatient.age),
        gender: newPatient.gender as 'Male' | 'Female' | 'Other',
        phone: phoneInput.trim(),
        condition: newPatient.condition || undefined,
      });
      setResolvedPatientId(created.id);
      setPatientInfo({
        name: created.name,
        age: String(created.age),
        phone: created.phone ?? phoneInput.trim(),
        gender: created.gender as 'Male' | 'Female' | 'Other',
        address: created.city ?? '',
      });
      setShowNewPatientForm(false);
      setStep(1);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? 'Failed to create patient.');
    }
  };

  // ── Multi-step form state ─────────────────────────────────────────────────
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createEvaluation = useCreateEvaluation();

  const [patientInfo, setPatientInfo] = useState<{ name: string; age: string; phone: string; gender: 'Male' | 'Female' | 'Other'; address: string }>({ name: '', age: '', phone: '', gender: 'Male', address: '' });
  const [vitals, setVitals] = useState({ bp_sys: '', bp_dia: '', pr: '', spo2: '', temp: '', ef: '' });
  const [checkedSymptoms, setCheckedSymptoms] = useState<string[]>([]);
  const [otherSymptom, setOtherSymptom] = useState('');
  const [showOtherSymptom, setShowOtherSymptom] = useState(false);

  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState<string[]>([]);
  const [otherMedicalHistory, setOtherMedicalHistory] = useState('');
  const [showOtherMedicalHistory, setShowOtherMedicalHistory] = useState(false);

  const [painLevel, setPainLevel] = useState(0);
  const [funcRatings, setFuncRatings] = useState<Record<string, number>>({});
  const [complaints, setComplaints] = useState('');
  const [associated, setAssociated] = useState('');
  const [intakePhoto, setIntakePhoto] = useState<File | null>(null);
  const [intakePhotoUrl, setIntakePhotoUrl] = useState<string | null>(null);
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | ''>('');
  const [billAmount, setBillAmount] = useState<number | null>(null);
  const [billAmountInput, setBillAmountInput] = useState('');
  const [visitType, setVisitType] = useState<'Clinic' | 'Home'>('Clinic');

  const resolvedIntakeConfig = {
    symptoms: nonEmptyOrDefault(intakeConfig?.symptoms, defaultIntakeConfig.symptoms),
    functionalActivities: nonEmptyOrDefault(
      intakeConfig?.functionalActivities,
      defaultIntakeConfig.functionalActivities
    ),
    ratingLabels: nonEmptyOrDefault(intakeConfig?.ratingLabels, defaultIntakeConfig.ratingLabels),
    functionalRatingColors: nonEmptyOrDefault(
      intakeConfig?.functionalRatingColors,
      defaultIntakeConfig.functionalRatingColors
    ),
    steps: nonEmptyOrDefault(intakeConfig?.steps, defaultIntakeConfig.steps),
    painScale: {
      colors: nonEmptyOrDefault(intakeConfig?.painScale?.colors, defaultIntakeConfig.painScale.colors),
      textColors: nonEmptyOrDefault(
        intakeConfig?.painScale?.textColors,
        defaultIntakeConfig.painScale.textColors
      ),
    },
  };
  const symptoms = resolvedIntakeConfig.symptoms;
  const functionalActivities = resolvedIntakeConfig.functionalActivities;
  const ratingLabels = resolvedIntakeConfig.ratingLabels;
  const painColors = resolvedIntakeConfig.painScale.colors;
  const painTextColors = resolvedIntakeConfig.painScale.textColors;
  const functionalRatingColors = resolvedIntakeConfig.functionalRatingColors;
  const steps = resolvedIntakeConfig.steps.map((item) => ({
    label: item.label,
    icon: stepIconMap[item.icon as keyof typeof stepIconMap] ?? ClipboardList,
  }));
  const totalSteps = Math.max(steps.length, 1);

  useEffect(() => {
    if (!intakePhoto) {
      setIntakePhotoUrl(null);
      return;
    }

    const previewUrl = URL.createObjectURL(intakePhoto);
    setIntakePhotoUrl(previewUrl);

    return () => URL.revokeObjectURL(previewUrl);
  }, [intakePhoto]);

  const isPhotoUploaded = Boolean(intakePhoto);
  const isPaymentComplete = Boolean(paymentMode && billAmount && billAmount > 0);

  const formatRupees = (amount: number) => new Intl.NumberFormat('en-IN').format(amount);

  const handleBillAmountChange = (value: string) => {
    setSubmitError(null);
    const digits = value.replace(/[^\d]/g, '');
    if (!digits) {
      setBillAmount(null);
      setBillAmountInput('');
      return;
    }

    const normalized = Number(digits);
    if (Number.isNaN(normalized)) {
      setBillAmount(null);
      setBillAmountInput('');
      return;
    }

    setBillAmount(normalized);
    setBillAmountInput(formatRupees(normalized));
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setSubmitError('Please upload an image file.');
      return;
    }

    setSubmitError(null);
    setIntakePhoto(file);
  };

  const handlePhotoRemove = () => {
    setIntakePhoto(null);
    setPhotoInputKey((prev) => prev + 1);
  };

  const toggleSymptom = (s: string) => {
    setCheckedSymptoms((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const handleSave = async () => {
    setSubmitError(null);

    const patientId = resolvedPatientId;
    if (!patientId) {
      setSubmitError('No patient resolved. Please complete the phone lookup step first.');
      return;
    }

    if (!paymentMode || !billAmount || billAmount <= 0) {
      setSubmitError('Payment mode and bill amount are required before submission.');
      return;
    }

    // Build the vitals nested object (only include fields with values)
    const vitalsPayload: Record<string, unknown> = {};
    if (vitals.bp_sys && vitals.bp_dia) vitalsPayload.bp = `${vitals.bp_sys}/${vitals.bp_dia}`;
    if (vitals.pr) vitalsPayload.pr = Number(vitals.pr);
    if (vitals.spo2) vitalsPayload.spo2 = Number(vitals.spo2);
    if (vitals.temp) vitalsPayload.temperature = Number(vitals.temp);
    if (vitals.ef) vitalsPayload.ef = Number(vitals.ef);

    try {
      const finalSymptoms = [...checkedSymptoms];
      if (visitType) finalSymptoms.push(`Visit Type: ${visitType} Visit`);
      if (otherSymptom.trim()) finalSymptoms.push(`Other: ${otherSymptom.trim()}`);
      if (associated.trim()) finalSymptoms.push(`Notes: ${associated.trim()}`);

      const finalHistory = [...selectedMedicalHistory];
      if (otherMedicalHistory.trim()) finalHistory.push(`Other: ${otherMedicalHistory.trim()}`);

      await createEvaluation.mutateAsync({
        patientId,
        vitals: Object.keys(vitalsPayload).length > 0 ? (vitalsPayload as any) : undefined,
        painLevel,
        chiefComplaints: complaints || undefined,
        associatedSymptoms: finalSymptoms.length > 0 ? finalSymptoms : undefined,
        medicalHistory: finalHistory.length > 0 ? finalHistory : undefined,
        status: 'submitted',
        paymentMode,
        billAmount,
      });
      setSaved(true);
      setTimeout(() => navigate(`/${currentRole}`), 2000);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? 'Failed to save evaluation. Please try again.');
    }
  };

  const handleNext = () => {
    setSubmitError(null);

    // Validation for Symptoms Step (Step 3, index 2)
    if (step === 2) {
      if (showOtherSymptom && !otherSymptom.trim()) {
        setSubmitError('Please specify the other symptom(s) or uncheck the "Others" option.');
        return;
      }
    }

    // Validation for Complaints & Medical History Step (Step 6, index 5)
    if (step === 5) {
      if (showOtherMedicalHistory && !otherMedicalHistory.trim()) {
        setSubmitError('Please specify the other medical history or uncheck the "Others" option.');
        return;
      }
    }

    setStep(step + 1);
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
            onClick={() => {
              setSubmitError(null);
              step > 0 ? setStep(step - 1) : navigate(`/${currentRole}`);
            }}
            className="flex items-center justify-center rounded-xl w-9 h-9 bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <div>
            <h1 className="text-[17px] font-extrabold text-white">Patient Intake Form</h1>
            <p className="text-[11px] text-white/70 font-medium">
              Step {step + 1} of {steps.length} — {steps[step]?.label ?? ''}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="rounded-full h-1.5 bg-white/20">
          <div
            className="rounded-full h-full bg-white transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
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

      {/* ── Phone Lookup Banner ─────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-1 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <Phone size={15} className="text-teal-600 shrink-0" />
            <input
              type="tel"
              inputMode="numeric"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePhoneLookup()}
              placeholder="Enter patient mobile number"
              className="flex-1 bg-transparent outline-none text-[13px] text-slate-800 dark:text-white placeholder:text-slate-400"
            />
          </div>
          <button
            onClick={handlePhoneLookup}
            disabled={phoneInput.trim().length < 7}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-[13px] font-bold disabled:opacity-50 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}
          >
            <Search size={14} />
            Lookup
          </button>
        </div>

        {/* Lookup results */}
        {lookupDone && lookingUp && (
          <div className="flex items-center gap-2 mt-2 px-2 py-1.5">
            <Loader2 size={14} className="animate-spin text-teal-600" />
            <span className="text-[12px] text-slate-500">Looking up patient…</span>
          </div>
        )}
        {lookupDone && !lookingUp && foundPatient && !resolvedPatientId && (
          <div className="mt-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div>
              <p className="text-[12px] font-extrabold text-emerald-800 dark:text-emerald-300">{foundPatient.name}</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{foundPatient.phone} · {foundPatient.gender} · Age {foundPatient.age}</p>
            </div>
            <button
              onClick={handleUsefoundPatient}
              className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-white"
              style={{ background: '#059669' }}
            >
              Use Patient
            </button>
          </div>
        )}
        {lookupDone && !lookingUp && foundPatient && resolvedPatientId && (
          <div className="mt-2 px-2 py-1.5 flex items-center gap-2">
            <Check size={13} className="text-emerald-500" />
            <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400">
              {foundPatient.name} · {foundPatient.phone}
            </span>
          </div>
        )}
        {lookupDone && !lookingUp && foundPatient === null && !showNewPatientForm && (
          <div className="mt-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} className="text-amber-600" />
              <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">
                No patient found for {phoneToFetch}
              </span>
            </div>
            <button
              onClick={() => setShowNewPatientForm(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white"
              style={{ background: '#0f766e' }}
            >
              <UserPlus size={12} /> New Patient
            </button>
          </div>
        )}
        {lookupError && (
          <div className="mt-2 px-2 py-1.5 flex items-center gap-2">
            <AlertTriangle size={13} className="text-red-500" />
            <span className="text-[12px] text-red-600 font-semibold">Lookup failed. Check the number and retry.</span>
          </div>
        )}

        {/* Create new patient mini-form */}
        {showNewPatientForm && (
          <div className="mt-2 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
            <p className="text-[12px] font-extrabold text-slate-700 dark:text-white">Register New Patient — {phoneInput}</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                placeholder="Full Name *"
                value={newPatient.name}
                onChange={(e) => setNewPatient(p => ({ ...p, name: e.target.value }))}
                className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-[13px] text-slate-800 dark:text-white outline-none"
              />
              <input
                placeholder="Age *"
                type="number"
                value={newPatient.age}
                onChange={(e) => setNewPatient(p => ({ ...p, age: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-[13px] text-slate-800 dark:text-white outline-none"
              />
              <select
                value={newPatient.gender}
                onChange={(e) => setNewPatient(p => ({ ...p, gender: e.target.value as 'Male' | 'Female' | 'Other' }))}
                className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-[13px] text-slate-800 dark:text-white outline-none"
              >
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
              <input
                placeholder="Condition (optional)"
                value={newPatient.condition}
                onChange={(e) => setNewPatient(p => ({ ...p, condition: e.target.value }))}
                className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-[13px] text-slate-800 dark:text-white outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewPatientForm(false)}
                className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-[12px] font-bold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewPatient}
                disabled={createPatientMutation.isPending || !newPatient.name || !newPatient.age}
                className="flex-1 py-2 rounded-lg text-white text-[12px] font-bold disabled:opacity-60"
                style={{ background: '#0f766e' }}
              >
                {createPatientMutation.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Create & Continue'}
              </button>
            </div>
          </div>
        )}
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
            <div className="mb-4 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg flex items-center justify-center w-8 h-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                    <ImagePlus size={16} className="text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-[12px] font-extrabold text-slate-700 dark:text-white">Intake Photo</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                      Upload a form or photo to skip manual entry
                    </p>
                  </div>
                </div>
                {intakePhoto && (
                  <button
                    onClick={handlePhotoRemove}
                    className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <X size={12} />
                    Remove
                  </button>
                )}
              </div>
              {intakePhotoUrl ? (
                <div className="flex flex-col gap-2">
                  <img
                    src={intakePhotoUrl}
                    alt="Intake upload preview"
                    className="w-full max-h-56 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
                  />
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    Photo uploaded. You can skip to payment below.
                  </p>
                </div>
              ) : (
                <label
                  htmlFor="intake-photo"
                  className="flex flex-col items-center justify-center gap-1.5 px-3 py-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <ImagePlus size={18} className="text-teal-600 dark:text-teal-400" />
                  <span className="text-[12px] font-bold text-slate-700 dark:text-white">Tap to upload a photo</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold">JPG, PNG, HEIC</span>
                </label>
              )}
              <input
                key={photoInputKey}
                id="intake-photo"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
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
                      onClick={() => setPatientInfo({ ...patientInfo, gender: g as 'Male' | 'Female' | 'Other' })}
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

              {/* Other Symptom */}
              <div className="mt-2">
                <button
                  onClick={() => {
                    setShowOtherSymptom(!showOtherSymptom);
                    setSubmitError(null);
                  }}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl text-left border-[1.5px] transition-colors ${
                    showOtherSymptom || otherSymptom
                      ? 'border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                  }`}
                >
                  <div
                    className={`rounded-lg flex items-center justify-center shrink-0 w-[22px] h-[22px] border-2 ${
                      showOtherSymptom || otherSymptom
                        ? 'bg-blue-600 border-blue-600 dark:bg-blue-500 dark:border-blue-500'
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                    }`}
                  >
                    {(showOtherSymptom || otherSymptom) && <Check size={13} strokeWidth={3} color="white" />}
                  </div>
                  <span className={`text-[13px] ${showOtherSymptom || otherSymptom ? 'font-bold text-blue-800 dark:text-blue-300' : 'font-semibold text-slate-600 dark:text-slate-300'}`}>
                    Others (please specify)
                  </span>
                </button>
                {(showOtherSymptom || otherSymptom) && (
                  <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                    <input
                      value={otherSymptom}
                      onChange={(e) => {
                        setOtherSymptom(e.target.value);
                        if (e.target.value.trim()) setSubmitError(null);
                      }}
                      placeholder="Type other symptoms here..."
                      className={`w-full outline-none px-3.5 py-3 rounded-xl border ${
                        !otherSymptom.trim() && submitError
                          ? 'border-red-500 dark:border-red-500'
                          : 'border-blue-200 dark:border-blue-800'
                      } bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 transition-colors shadow-sm`}
                      autoFocus
                    />
                  </div>
                )}
              </div>
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
              <div className={`rounded-full flex items-center justify-center mb-2 w-[100px] h-[100px] ${painColors[painLevel] ?? ''} bg-opacity-20`}>
                <div className={`rounded-full flex items-center justify-center w-[80px] h-[80px] ${painColors[painLevel] ?? ''}`}>
                  <span className="text-[32px] font-black text-white">{painLevel}</span>
                </div>
              </div>
              <p className={`text-base font-bold ${painTextColors[painLevel] ?? ''}`}>
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
                      const colors = functionalRatingColors;
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
                {['Diabetes', 'Hypertension', 'Heart Disease', 'Previous Surgery', 'Allergies'].map((item) => {
                  const isChecked = selectedMedicalHistory.includes(item);
                  return (
                    <button
                      key={item}
                      onClick={() => setSelectedMedicalHistory(prev =>
                        isChecked ? prev.filter(x => x !== item) : [...prev, item]
                      )}
                      className={`flex items-center gap-3 p-3 rounded-xl text-left border-[1.5px] transition-colors ${
                        isChecked
                          ? 'border-fuchsia-600 dark:border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <div
                        className={`rounded-lg flex items-center justify-center shrink-0 w-[22px] h-[22px] border-2 ${
                          isChecked
                            ? 'bg-fuchsia-600 border-fuchsia-600 dark:bg-fuchsia-500 dark:border-fuchsia-500'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {isChecked && <Check size={13} strokeWidth={3} color="white" />}
                      </div>
                      <label className={`text-[13px] ${isChecked ? 'font-bold text-fuchsia-800 dark:text-fuchsia-300' : 'font-semibold text-slate-600 dark:text-slate-300'} cursor-pointer flex-1`}>
                        {item}
                      </label>
                    </button>
                  );
                })}

                {/* Other Medical History */}
                <div className="mt-1">
                  <button
                    onClick={() => {
                      setShowOtherMedicalHistory(!showOtherMedicalHistory);
                      setSubmitError(null);
                    }}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl text-left border-[1.5px] transition-colors ${
                      showOtherMedicalHistory || otherMedicalHistory
                        ? 'border-fuchsia-600 dark:border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <div
                      className={`rounded-lg flex items-center justify-center shrink-0 w-[22px] h-[22px] border-2 ${
                        showOtherMedicalHistory || otherMedicalHistory
                          ? 'bg-fuchsia-600 border-fuchsia-600 dark:bg-fuchsia-500 dark:border-fuchsia-500'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {(showOtherMedicalHistory || otherMedicalHistory) && <Check size={13} strokeWidth={3} color="white" />}
                    </div>
                    <span className={`text-[13px] ${showOtherMedicalHistory || otherMedicalHistory ? 'font-bold text-fuchsia-800 dark:text-fuchsia-300' : 'font-semibold text-slate-600 dark:text-slate-300'}`}>
                      Others (please specify)
                    </span>
                  </button>
                  {(showOtherMedicalHistory || otherMedicalHistory) && (
                    <div className="mt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      <input
                        value={otherMedicalHistory}
                        onChange={(e) => {
                          setOtherMedicalHistory(e.target.value);
                          if (e.target.value.trim()) setSubmitError(null);
                        }}
                        placeholder="Type other medical history here..."
                        className={`w-full outline-none px-3.5 py-3 rounded-xl border ${
                          !otherMedicalHistory.trim() && submitError
                            ? 'border-red-500 dark:border-red-500'
                            : 'border-fuchsia-200 dark:border-fuchsia-800'
                        } bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-fuchsia-500 transition-colors shadow-sm`}
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 7: Review & Payment */}
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
                {/* Visit Type Selection - Integrated at the top */}
                <div className="pb-4 mb-2 border-b border-slate-100 dark:border-slate-800 border-opacity-50">
                  <label className="block text-[11px] font-black text-teal-600 dark:text-teal-400 mb-2 uppercase tracking-widest">
                    Select Visit Type
                  </label>
                  <div className="flex gap-2">
                    {['Clinic', 'Home'].map((v) => {
                      const isSelected = visitType === v;
                      return (
                        <button
                          key={v}
                          onClick={() => setVisitType(v as 'Clinic' | 'Home')}
                          className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold border-2 transition-all ${
                            isSelected
                              ? 'border-teal-600 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                              : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500'
                          }`}
                        >
                          {v} Visit
                        </button>
                      );
                    })}
                  </div>
                </div>

                {[
                  { label: 'Patient Name', value: patientInfo.name || 'Not entered' },
                  { label: 'Age', value: patientInfo.age || 'Not entered' },
                  { label: 'Phone', value: patientInfo.phone || 'Not entered' },
                  { label: 'Blood Pressure', value: vitals.bp_sys && vitals.bp_dia ? `${vitals.bp_sys}/${vitals.bp_dia} mmHg` : 'Not entered' },
                  { label: 'Pulse Rate', value: vitals.pr ? `${vitals.pr} bpm` : 'Not entered' },
                  { label: 'SpO₂', value: vitals.spo2 ? `${vitals.spo2}%` : 'Not entered' },
                  { label: 'Pain Level', value: `${painLevel}/10` },
                  { label: 'Symptoms', value: checkedSymptoms.length > 0 ? `${checkedSymptoms.length} reported` : 'None' },
                  { label: 'Intake Photo', value: isPhotoUploaded ? 'Uploaded' : 'Not uploaded' },
                  {
                    label: 'Payment',
                    value: paymentMode && billAmount
                      ? `${paymentMode} · ₹${formatRupees(billAmount)}`
                      : 'Required',
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-slate-100 dark:border-slate-800 last:border-0 border-opacity-50">
                    <span className="text-[13px] text-slate-500 dark:text-slate-400 font-bold">{item.label}</span>
                    <span className="text-[13px] text-slate-900 dark:text-white font-extrabold">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-xl flex items-center justify-center w-9 h-9 bg-amber-50 dark:bg-amber-900/30">
                  <CreditCard size={18} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Payment Details</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    Required to submit this intake
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Mode of Payment
                </label>
                <div className="flex gap-2">
                  {['Cash', 'UPI'].map((mode) => {
                    const selected = paymentMode === mode;
                    return (
                      <button
                        key={mode}
                        onClick={() => {
                          setPaymentMode(mode as 'Cash' | 'UPI');
                          setSubmitError(null);
                        }}
                        className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border-2 transition-colors ${
                          selected
                            ? 'border-amber-600 dark:border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {mode}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Bill Amount
                </label>
                <div
                  className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border bg-slate-50 dark:bg-slate-800 transition-colors ${
                    !isPaymentComplete && submitError
                      ? 'border-red-300 dark:border-red-500'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={billAmountInput}
                    onChange={(e) => handleBillAmountChange(e.target.value)}
                    placeholder="0"
                    className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">
                  Enter the total amount for today's intake.
                </p>
              </div>
            </div>

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
      <div className="px-4 py-3 shrink-0 flex flex-col gap-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        {submitError && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-[12px] text-red-700 dark:text-red-400 font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
            <AlertTriangle size={14} />
            {submitError}
          </div>
        )}
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => {
                setSubmitError(null);
                setStep(step - 1);
              }}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-[14px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-extrabold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <ChevronLeft size={16} />
              Back
            </button>
          )}
          {isPhotoUploaded && step < steps.length - 1 && (
            <button
              onClick={() => {
                setSubmitError(null);
                setStep(steps.length - 1);
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-[14px] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-extrabold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Skip to Payment
            </button>
          )}
          {step < steps.length - 1 && (
            <button
              onClick={handleNext}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-[14px] text-white text-sm font-extrabold hover:opacity-90 transition-opacity"
              style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}
            >
              Next Step
              <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>


      <div className="md:hidden">
        <BottomNav role={currentRole} />
      </div>
    </div>
  );
}
