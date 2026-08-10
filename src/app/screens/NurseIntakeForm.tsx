import { useState, useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { SearchDropdown } from '../components/SearchDropdown';
import { useCreateEvaluation, useLatestEvaluation } from '../../hooks/useEvaluations';
import { usePatientByPhone, useCreatePatient, usePatient, useUpdatePatient } from '../../hooks/usePatients';
import { useStaffUsers } from '../../hooks/useStaff';
import { useAppConfigScope } from '../../hooks/useAppConfig';
import { useTreatments } from '../../hooks/useTreatments';
import type { Treatment } from '../../hooks/useTreatments';
import type { AppConfigScopes } from '../../hooks/useAppConfig';
import { EvaluationSummaryReport } from '../components/EvaluationSummaryReport';
import {
  ArrowLeft, ChevronRight, ChevronLeft, User, Heart, Phone, Search, UserPlus,
  Activity, Sliders, CheckSquare, ClipboardList, Save, Check, Loader2, AlertTriangle,
  CreditCard, ImagePlus, X, UserCog, ChevronDown, Printer,
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

// ── Searchable multi-select dropdown for associated pains ──────────────────
function PainSearchDropdown({ options, selected, onChange }: {
  options: string[];
  selected: string[];
  onChange: (val: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(
    (o) => o.toLowerCase().includes(search.toLowerCase()) && !selected.includes(o)
  );

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 cursor-pointer hover:border-fuchsia-400 transition-colors"
      >
        <Search size={14} className="text-slate-400 shrink-0" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder={selected.length > 0 ? `${selected.length} selected — type to add more…` : 'Search pains / symptoms…'}
          className="flex-1 bg-transparent outline-none text-[12px] text-slate-800 dark:text-white placeholder:text-slate-400"
        />
        <ChevronDown size={13} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>
      {open && (
        <div className="absolute z-20 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-lg">
          {filtered.length === 0 && (
            <p className="px-3 py-3 text-[11px] text-slate-400 text-center font-semibold">
              {search ? 'No matching pains found' : 'All options selected'}
            </p>
          )}
          {filtered.map((pain) => (
            <button
              key={pain}
              type="button"
              onClick={() => { onChange([...selected, pain]); setSearch(''); }}
              className="w-full flex items-center gap-2 px-3.5 py-2.5 text-left text-[12px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0"
            >
              <span className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600 flex items-center justify-center shrink-0 text-[10px]" />
              {pain}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

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
  const [newPatient, setNewPatient] = useState<{ name: string; age: string; gender: 'Male' | 'Female' | 'Other'; condition: string; referredBy: string }>({ name: '', age: '', gender: 'Male', condition: '', referredBy: '' });

  const { data: foundPatient, isLoading: lookingUp, isError: lookupError } = usePatientByPhone(
    phoneToFetch.trim().length >= 7 ? phoneToFetch.trim() : null
);
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const { data: therapistsList = [], isLoading: therapistsLoading } = useStaffUsers({ role: 'nurse' });
  const [selectedTherapistId, setSelectedTherapistId] = useState('');
  const isDoctorRole = currentRole === 'doctor';

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
        referredBy: patientById.referredBy ?? patientById.referred_by ?? '',
        condition: patientById.condition ?? '',
        fileNumber: patientById.fileNumber ?? '',
      });
      setPhoneInput(patientById.phone ?? phoneToFetch);
      setPhoneToFetch(patientById.phone ?? phoneToFetch);
      if (patientById.therapistId) setSelectedTherapistId(patientById.therapistId);
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
        referredBy: foundPatient.referredBy ?? foundPatient.referred_by ?? '',
        condition: foundPatient.condition ?? '',
        fileNumber: foundPatient.fileNumber ?? '',
      });
      if (foundPatient.therapistId) setSelectedTherapistId(foundPatient.therapistId);
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
      referredBy: foundPatient.referredBy ?? foundPatient.referred_by ?? '',
      condition: foundPatient.condition ?? '',
      fileNumber: foundPatient.fileNumber ?? '',
    });
  }, [foundPatient, phoneToFetch]);

  const handleCreateNewPatient = async () => {
    setSubmitError(null);
    if (!newPatient.name || newPatient.name.trim().length < 2) {
      setSubmitError('Patient name must be at least 2 characters.');
      return;
    }
    const numAge = Number(newPatient.age);
    if (!newPatient.age || isNaN(numAge) || numAge <= 0 || numAge > 120) {
      setSubmitError('Valid age between 1 and 120 is required.');
      return;
    }
    const cleanPhone = phoneInput.trim().replace(/[\s-]/g, '');
    if (!cleanPhone || !/^\d{10}$/.test(cleanPhone)) {
      setSubmitError('Phone number must be exactly 10 digits.');
      return;
    }

    try {
      const created = await createPatientMutation.mutateAsync({
        name: newPatient.name.trim(),
        age: numAge,
        gender: newPatient.gender as 'Male' | 'Female' | 'Other',
        phone: cleanPhone,
        condition: newPatient.condition || undefined,
        referredBy: newPatient.referredBy?.trim() || undefined,
        therapistId: isDoctorRole ? (selectedTherapistId || undefined) : (user?.id || undefined),
      });
      setResolvedPatientId(created.id);
      setPatientInfo({
        name: created.name,
        age: String(created.age),
        phone: created.phone ?? cleanPhone,
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
  const updatePatient = useUpdatePatient();

  const [patientInfo, setPatientInfo] = useState<{ name: string; age: string; phone: string; gender: 'Male' | 'Female' | 'Other'; address: string; referredBy?: string; condition?: string; fileNumber?: string }>({ name: '', age: '', phone: '', gender: 'Male', address: '', referredBy: '', condition: '', fileNumber: '' });
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
  const [associatedPains, setAssociatedPains] = useState<string[]>([]);
  const [intakePhoto, setIntakePhoto] = useState<File | null>(null);
  const [intakePhotoUrl, setIntakePhotoUrl] = useState<string | null>(null);
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | ''>('');
  const [visitType, setVisitType] = useState<'Clinic' | 'Home Visit' | 'IP' | 'Day Care'>('Clinic');
  const [selectedTreatmentIds, setSelectedTreatmentIds] = useState<string[]>([]);

  // Fetch treatment prices from DB
  const { data: treatments = [] } = useTreatments();

  // Compute bill total directly from selected treatments (instant, no useEffect lag)
  const billTotal = selectedTreatmentIds.length === 0
    ? 0
    : treatments
        .filter((t) => selectedTreatmentIds.includes(String(t.id)))
        .reduce((sum, t) => sum + t.charge, 0);


  const toggleTreatment = (id: string) => {
    setSubmitError(null);
    setSelectedTreatmentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };


  // Group treatments by category
  const treatmentsByCategory = treatments.reduce<Record<string, Treatment[]>>((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push({ ...t, id: String(t.id) });
    return acc;
  }, {});

  // Associated pains options
  const associatedPainOptions = [
    'Radiating Pain', 'Referred Pain', 'Joint Stiffness', 'Muscle Spasm',
    'Numbness', 'Tingling', 'Burning Sensation', 'Swelling',
    'Weakness', 'Fatigue', 'Headache', 'Dizziness',
    'Sleep Disturbance', 'Difficulty Walking', 'Restricted Movement',
  ];

  // ── Follow-up detection ───────────────────────────────────────────────────
  const { data: previousEval, isLoading: loadingPrevEval } = useLatestEvaluation(
    resolvedPatientId || null
  );
  const isFollowUp = Boolean(previousEval);

  // Pre-fill clinical data from previous assessment
  useEffect(() => {
    if (previousEval) {
      // Vitals
      setVitals({
        bp_sys: previousEval.bp?.split('/')[0] || '',
        bp_dia: previousEval.bp?.split('/')[1] || '',
        pr: previousEval.pr ? String(previousEval.pr) : '',
        spo2: previousEval.spo2 ? String(previousEval.spo2) : '',
        temp: previousEval.temperature ? String(previousEval.temperature) : '',
        ef: previousEval.ef ? String(previousEval.ef) : '',
      });
      // Complaints
      if (previousEval.chiefComplaints) {
        setComplaints(previousEval.chiefComplaints);
      }
      // Symptoms
      if (previousEval.associatedSymptoms) {
        setCheckedSymptoms(previousEval.associatedSymptoms.filter(s => !s.startsWith('Other: ') && !s.startsWith('Notes: ')));
        const other = previousEval.associatedSymptoms.find(s => s.startsWith('Other: '));
        if (other) {
          setOtherSymptom(other.replace('Other: ', ''));
          setShowOtherSymptom(true);
        }
        const notes = previousEval.associatedSymptoms.find(s => s.startsWith('Notes: '));
        if (notes) setAssociated(notes.replace('Notes: ', ''));
      }
      // Medical History
      if (previousEval.medicalHistory) {
        setSelectedMedicalHistory(previousEval.medicalHistory.filter(s => !s.startsWith('Other: ')));
        const other = previousEval.medicalHistory.find(s => s.startsWith('Other: '));
        if (other) {
          setOtherMedicalHistory(other.replace('Other: ', ''));
          setShowOtherMedicalHistory(true);
        }
      }
      // Pain Level
      if (previousEval.painLevel != null) {
        setPainLevel(previousEval.painLevel);
      }
      // Functional Ratings
      if (previousEval.functionalScores) {
        setFuncRatings(previousEval.functionalScores as Record<string, number>);
      }
      // Associated Pains
      if (previousEval.associatedPains) {
        setAssociatedPains(previousEval.associatedPains);
      }
    }
  }, [previousEval]);

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
  const isPaymentComplete = Boolean(paymentMode && billTotal > 0);

  const formatRupees = (amount: number) => new Intl.NumberFormat('en-IN').format(amount);




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

    if (!paymentMode || billTotal <= 0) {
      setSubmitError('Please select at least one treatment and choose a payment mode.');
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
      if (otherSymptom.trim()) finalSymptoms.push(`Other: ${otherSymptom.trim()}`);
      if (associated.trim()) finalSymptoms.push(`Notes: ${associated.trim()}`);

      const finalHistory = [...selectedMedicalHistory];
      if (otherMedicalHistory.trim()) finalHistory.push(`Other: ${otherMedicalHistory.trim()}`);

      // 1. Update patient demographics if they changed
      await updatePatientMutation.mutateAsync({
        id: patientId,
        name: patientInfo.name,
        age: Number(patientInfo.age),
        gender: patientInfo.gender,
        phone: patientInfo.phone,
        city: patientInfo.address,
        condition: complaints.trim() || (checkedSymptoms.length > 0 ? checkedSymptoms[0] : undefined),
        referredBy: patientInfo.referredBy,
      });

      // 2. Create the evaluation record
      await createEvaluation.mutateAsync({
        patientId,
        vitals: Object.keys(vitalsPayload).length > 0 ? (vitalsPayload as any) : undefined,
        painLevel,
        chiefComplaints: complaints || undefined,
        associatedSymptoms: finalSymptoms.length > 0 ? finalSymptoms : undefined,
        medicalHistory: finalHistory.length > 0 ? finalHistory : undefined,
        status: 'submitted',
        paymentMode,
        billAmount: billTotal,
        visitType,
        referredBy: patientInfo.referredBy || foundPatient?.referredBy || foundPatient?.referred_by || undefined,
        associatedPains: associatedPains.length > 0 ? associatedPains : undefined,
        functionalScores: Object.keys(funcRatings).length > 0 ? funcRatings : undefined,
        treatmentPlan: selectedTreatmentIds.length > 0 ? {
          modalities: treatments
            .filter(t => selectedTreatmentIds.includes(t.id))
            .map(t => t.treatmentName)
        } : undefined
      });
      await updatePatient.mutateAsync({ id: patientId, status: 'completed' });
      setSaved(true);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? 'Failed to save evaluation. Please try again.');
    }
  };

  const handleNext = () => {
    setSubmitError(null);

    // Validation for Patient Step (Step 0)
    if (step === 0 && (!patientInfo.condition || patientInfo.condition.length === 0)) {
      setSubmitError('Please select at least one condition (Ortho, Neuro, or Cardio) before proceeding.');
      return;
    }

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
    const summaryData = {
      patientInfo: {
        name: patientInfo.name || foundPatient?.name || 'Patient',
        age: patientInfo.age || foundPatient?.age || '',
        gender: patientInfo.gender || foundPatient?.gender || 'Male',
        phone: patientInfo.phone || foundPatient?.phone || '',
        patientId: resolvedPatientId,
        visitType: visitType,
        paymentMode: paymentMode,
        billAmount: billTotal,
        status: 'submitted',
        referredBy: patientInfo.referredBy || foundPatient?.referredBy || foundPatient?.referred_by || '',
      },
      bp: vitals.bp_sys && vitals.bp_dia ? `${vitals.bp_sys}/${vitals.bp_dia}` : undefined,
      pr: vitals.pr ? Number(vitals.pr) : undefined,
      spo2: vitals.spo2 ? Number(vitals.spo2) : undefined,
      temperature: vitals.temp ? Number(vitals.temp) : undefined,
      ef: vitals.ef ? Number(vitals.ef) : undefined,
      painScale: painLevel,
      chiefComplaints: complaints.trim() ? [complaints.trim()] : (checkedSymptoms.length > 0 ? checkedSymptoms : undefined),
      medicalHistory: selectedMedicalHistory,
      associatedSymptoms: checkedSymptoms,
      associatedPains: associatedPains,
      treatmentPlan: selectedTreatmentIds.length > 0 ? {
        modalities: treatments
          .filter(t => selectedTreatmentIds.includes(t.id))
          .map(t => t.treatmentName)
      } : undefined
    };

    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans overflow-y-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto w-full bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Patient Intake Summary</h2>
                <p className="text-xs text-slate-500 font-medium">Successfully saved and generated clinical summary.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors"
              >
                <Printer size={14} /> Print Report
              </button>
              <button
                onClick={() => navigate(`/${currentRole}`)}
                className="px-5 py-2.5 rounded-xl bg-[#262842] hover:bg-[#3B3E66] text-white text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                Back to Dashboard <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <EvaluationSummaryReport evaluation={summaryData} isDoctorRole={currentRole === 'doctor'} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header */}
      <div
        className="px-5 pb-4 shrink-0 pt-5"
        style={{ background: 'linear-gradient(135deg, #262842, #3B3E66)' }}
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
          <SearchDropdown
            module="patients"
            searchFields={['name', 'mobile']}
            apiEndpoint="/patients/search"
            value={phoneInput}
            onChange={setPhoneInput}
            onSelect={(patient: any) => {
              setPhoneInput(patient.mobile);
              setPhoneToFetch(patient.mobile);
              setLookupDone(true);
              setShowNewPatientForm(false);
            }}
            renderItem={(patient: any, highlightText: any) => (
              <div className="flex flex-col">
                <span className="font-bold text-slate-800 dark:text-slate-100">
                  {highlightText(patient.name)}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Phone className="w-3 h-3 text-[#3B3E66] dark:text-teal-400" /> {highlightText(patient.mobile)}
                </span>
              </div>
            )}
            placeholder="Enter patient mobile number..."
            className="flex-1"
          />
          <button
            onClick={handlePhoneLookup}
            disabled={phoneInput.trim().length < 7}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-white text-[13px] font-bold disabled:opacity-50 transition-opacity shrink-0"
            style={{ background: 'linear-gradient(135deg, #262842, #3B3E66)' }}
          >
            <Search size={14} />
            Lookup
          </button>
        </div>

        {/* Lookup results */}
        {lookupDone && lookingUp && (
          <div className="flex items-center gap-2 mt-2 px-2 py-1.5">
            <Loader2 size={14} className="animate-spin text-indigo-900" />
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
              style={{ background: '#262842' }}
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
              <input
                placeholder="Referred By (e.g. Self, Dr. Kumar)"
                value={newPatient.referredBy}
                onChange={(e) => setNewPatient(p => ({ ...p, referredBy: e.target.value }))}
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
                style={{ background: '#262842' }}
              >
                {createPatientMutation.isPending ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Create & Continue'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Scrollable form content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full">

        {/* Follow-up Banner */}
        {resolvedPatientId && isFollowUp && previousEval && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <ClipboardList size={16} className="text-blue-600 dark:text-blue-400" />
              <span className="text-[13px] font-extrabold text-blue-800 dark:text-blue-300">Follow-up Visit</span>
              <span className="ml-auto text-[10px] font-bold text-blue-500 bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-full">
                Previous: {new Date(previousEval.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              {previousEval.bp && (
                <p className="text-slate-600 dark:text-slate-400"><span className="font-bold">BP:</span> {previousEval.bp}</p>
              )}
              {previousEval.painLevel !== undefined && (
                <p className="text-slate-600 dark:text-slate-400"><span className="font-bold">Pain:</span> {previousEval.painLevel}/10</p>
              )}
              {previousEval.chiefComplaints && (
                <p className="col-span-2 text-slate-600 dark:text-slate-400"><span className="font-bold">Complaints:</span> {previousEval.chiefComplaints}</p>
              )}
              {previousEval.associatedSymptoms && previousEval.associatedSymptoms.length > 0 && (
                <p className="col-span-2 text-slate-600 dark:text-slate-400">
                  <span className="font-bold">Symptoms:</span> {previousEval.associatedSymptoms.slice(0, 4).join(', ')}
                  {previousEval.associatedSymptoms.length > 4 && ` +${previousEval.associatedSymptoms.length - 4} more`}
                </p>
              )}
              {previousEval.visitType && (
                <p className="text-slate-600 dark:text-slate-400"><span className="font-bold">Visit:</span> {previousEval.visitType}</p>
              )}
              {previousEval.diagnosis && (
                <p className="col-span-2 text-slate-600 dark:text-slate-400"><span className="font-bold">Diagnosis:</span> {previousEval.diagnosis}</p>
              )}
            </div>
          </div>
        )}
        {resolvedPatientId && loadingPrevEval && (
          <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800">
            <Loader2 size={13} className="animate-spin text-indigo-900" />
            <span className="text-[11px] text-slate-500 font-semibold">Checking for previous assessments…</span>
          </div>
        )}

        {/* Step 1: Patient Info */}
        {step === 0 && (
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-xl flex items-center justify-center w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30">
                <User size={18} className="text-indigo-950 dark:text-indigo-400" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Patient Information</h2>
            </div>
            </div>
            {[
              { key: 'name', label: 'Full Name', placeholder: 'e.g. Priya Sharma', type: 'text' },
              { key: 'age', label: 'Age', placeholder: 'e.g. 32', type: 'number' },
              { key: 'phone', label: 'Phone Number', placeholder: 'e.g. 9876543210', type: 'tel' },
              { key: 'address', label: 'Address', placeholder: 'Enter address', type: 'text' },
              { key: 'referredBy', label: 'Referred By', placeholder: 'e.g. Self, Dr. Kumar, Hospital', type: 'text' },
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
                  className="w-full outline-none px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 dark:focus:border-indigo-500 transition-colors"
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
                          ? 'border-teal-700 dark:border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-950 dark:text-indigo-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Assigned Therapist */}
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                <UserCog size={13} className="inline mr-1 text-indigo-900" />
                Assigned Therapist {isDoctorRole && <span className="text-red-500">*</span>}
              </label>
              {isDoctorRole ? (
                <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-colors relative">
                  <UserCog size={15} className="text-slate-400 shrink-0" />
                  <select
                    value={selectedTherapistId}
                    onChange={(e) => {
                      setSelectedTherapistId(e.target.value);
                      if (resolvedPatientId && e.target.value) {
                        updatePatientMutation.mutate({ id: resolvedPatientId, therapistId: e.target.value });
                      }
                    }}
                    className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="">Select a therapist…</option>
                    {therapistsLoading && <option disabled>Loading…</option>}
                    {therapistsList.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="text-slate-400 shrink-0 pointer-events-none" />
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                  <UserCog size={15} className="text-indigo-900 shrink-0" />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {user?.name ?? 'You'} (assigned automatically)
                  </span>
                </div>
              )}
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
                  className="flex-1 outline-none text-center px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-slate-400 dark:text-slate-500 font-bold">/</span>
                <input
                  value={vitals.bp_dia}
                  onChange={(e) => setVitals({ ...vitals, bp_dia: e.target.value })}
                  placeholder="Diastolic"
                  className="flex-1 outline-none text-center px-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                  className="w-full outline-none px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                className="w-full h-[100px] outline-none resize-none px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white mb-2.5">
                Associated Pains / Symptoms
              </h3>

              {/* Selected chips */}
              {associatedPains.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {associatedPains.map((pain) => (
                    <span key={pain} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-200 dark:border-fuchsia-800">
                      {pain}
                      <button
                        type="button"
                        onClick={() => setAssociatedPains(prev => prev.filter(x => x !== pain))}
                        className="ml-0.5 text-fuchsia-400 hover:text-fuchsia-600 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* Searchable dropdown */}
              <PainSearchDropdown
                options={associatedPainOptions}
                selected={associatedPains}
                onChange={setAssociatedPains}
              />

              {/* Free-text notes */}
              <textarea
                value={associated}
                onChange={(e) => setAssociated(e.target.value)}
                placeholder="Additional notes on associated symptoms…"
                className="w-full h-[60px] outline-none resize-none px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 mt-3"
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
                <div className="rounded-xl flex items-center justify-center w-9 h-9 bg-indigo-50 dark:bg-indigo-900/30">
                  <Save size={18} className="text-indigo-950 dark:text-indigo-400" />
                </div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Review & Save</h2>
              </div>

              {/* Summary */}
              <div className="flex flex-col gap-0">
                {/* Visit Type Selection - 4 options */}
                <div className="pb-4 mb-2 border-b border-slate-100 dark:border-slate-800 border-opacity-50">
                  <label className="block text-[11px] font-black text-indigo-900 dark:text-indigo-400 mb-2 uppercase tracking-widest">
                    Visit Type
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['Clinic', 'Home Visit', 'IP', 'Day Care'].map((v) => {
                      const isSelected = visitType === v;
                      return (
                        <button
                          key={v}
                          onClick={() => setVisitType(v as typeof visitType)}
                          className={`py-2.5 rounded-xl text-[12px] font-bold border-2 transition-all ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-950 dark:text-indigo-300'
                              : 'border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-500'
                          }`}
                        >
                          {v}
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
                    value: paymentMode && billTotal > 0
                      ? `${paymentMode} · ₹${formatRupees(billTotal)}`
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

            {/* Treatment Selection */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-4">
                <div className="rounded-xl flex items-center justify-center w-9 h-9 bg-teal-50 dark:bg-teal-900/30">
                  <Activity size={18} className="text-teal-600 dark:text-teal-400" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Select Treatments</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                    {selectedTreatmentIds.length > 0
                      ? `${selectedTreatmentIds.length} treatment${selectedTreatmentIds.length > 1 ? 's' : ''} selected`
                      : 'Choose the treatments provided today'}
                  </p>
                </div>
              </div>

              {Object.entries(treatmentsByCategory).map(([category, items]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <p className="text-[11px] font-black text-indigo-900 dark:text-indigo-400 mb-2 uppercase tracking-widest">
                    {category}
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {items.map((t) => {
                      const isSelected = selectedTreatmentIds.includes(t.id);
                      return (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => toggleTreatment(t.id)}
                          className={`flex items-center gap-3 p-3 rounded-xl text-left border-[1.5px] transition-colors ${
                            isSelected
                              ? 'border-teal-600 dark:border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                              : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <div
                            className={`rounded-lg flex items-center justify-center shrink-0 w-[22px] h-[22px] border-2 ${
                              isSelected
                                ? 'bg-teal-600 border-teal-600 dark:bg-teal-500 dark:border-teal-500'
                                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'
                            }`}
                          >
                            {isSelected && <Check size={13} strokeWidth={3} color="white" />}
                          </div>
                          <span className={`flex-1 text-[13px] ${
                            isSelected
                              ? 'font-bold text-teal-800 dark:text-teal-300'
                              : 'font-semibold text-slate-600 dark:text-slate-300'
                          }`}>
                            {t.treatmentName}
                          </span>
                          <span className={`text-[12px] font-extrabold ${
                            isSelected
                              ? 'text-teal-700 dark:text-teal-300'
                              : 'text-slate-400 dark:text-slate-500'
                          }`}>
                            ₹{formatRupees(t.charge)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {treatments.length === 0 && (
                <div className="flex items-center gap-2 py-4 justify-center">
                  <Loader2 size={14} className="animate-spin text-slate-400" />
                  <span className="text-[12px] text-slate-400 font-semibold">Loading treatments…</span>
                </div>
              )}
            </div>

            {/* Payment Details */}
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

              {/* Auto-calculated total */}
              {selectedTreatmentIds.length > 0 && (
                <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-200 dark:border-teal-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">Auto-calculated Total</span>
                    <span className="text-[18px] font-black text-teal-800 dark:text-teal-300">₹{formatRupees(billTotal)}</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {treatments
                      .filter((t) => selectedTreatmentIds.includes(t.id))
                      .map((t) => (
                        <span key={t.id} className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40 px-1.5 py-0.5 rounded">
                          {t.treatmentName} · ₹{t.charge}
                        </span>
                      ))}
                  </div>
                </div>
              )}

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
                  Bill Amount {selectedTreatmentIds.length > 0 && <span className="text-teal-600 dark:text-teal-400">(auto-filled)</span>}
                </label>
                <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-teal-300 dark:border-teal-700">
                  <span className="text-[13px] font-bold text-slate-500 dark:text-slate-400">₹</span>
                  <span className="flex-1 text-sm font-bold text-slate-900 dark:text-white">
                    {billTotal > 0 ? formatRupees(billTotal) : '—'}
                  </span>
                </div>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
                  {billTotal > 0 ? 'Auto-calculated from selected treatments.' : 'Select treatments above to auto-fill.'}
                </p>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={createEvaluation.isPending}
              className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-white text-base font-extrabold shadow-lg shadow-indigo-700/30 group disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #262842, #3B3E66)' }}
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
              style={{ background: 'linear-gradient(135deg, #262842, #3B3E66)' }}
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
