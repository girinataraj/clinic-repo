import { useState, useCallback, useEffect, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { BottomNav } from '../../components/BottomNav';
import { SearchDropdown } from '../../components/SearchDropdown';
import { useCreateEvaluation, useLatestEvaluation } from '../../../hooks/useEvaluations';
import { usePatientByPhone, useCreatePatient, usePatient, useUpdatePatient } from '../../../hooks/usePatients';
import { useTreatments } from '../../../hooks/useTreatments';
import { useClinicalConfig } from '../../../hooks/useAppConfig';
import { useStaffUsers } from '../../../hooks/useStaff';
import { ArrowLeft, ChevronRight, ChevronLeft, Check, Loader2, AlertTriangle, Save, CreditCard, Search, ChevronDown, ChevronUp, Phone } from 'lucide-react';
import { ASSESSMENT_STEPS, type RomData, type Anthropometrics, type ClinicalExamData, getEmptyClinicalExam, type TreatmentPlanData, getEmptyTreatmentPlan, getTreatmentSelectionCount } from './clinicalConfig';
import { SectionCard, FormField, doctorInputClass } from './FormComponents';
import { StepPatient, StepVitals, StepComplaints, StepPainScale, StepHistory, StepExamination, StepDiagnosis, StepTreatment } from './StepRenderers';
import { StepNeuroExam, getEmptyNeuroData } from './StepNeuroExam';

import { AnthropometricSection } from './AnthropometricSection';

export function DoctorAssessmentForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentRole = 'doctor';
  const [searchParams] = useSearchParams();
  const isDoctorRole = true;

  // Phone lookup
  const [phoneInput, setPhoneInput] = useState(searchParams.get('phone') ?? '');
  const [phoneToFetch, setPhoneToFetch] = useState(searchParams.get('phone') ?? '');
  const [resolvedPatientId, setResolvedPatientId] = useState(searchParams.get('patientId') ?? '');
  const [lookupDone, setLookupDone] = useState(Boolean(searchParams.get('patientId') || searchParams.get('phone')));
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState<{name:string;age:string;gender:'Male'|'Female'|'Other';condition:string}>({name:'',age:'',gender:'Male',condition:''});

  const { data: foundPatient, isLoading: lookingUp } = usePatientByPhone(phoneToFetch.trim().length >= 7 ? phoneToFetch.trim() : null);
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const { data: therapistsList = [] } = useStaffUsers({ role: 'nurse' });
  const [selectedTherapistId, setSelectedTherapistId] = useState('');
  const { data: patientById } = usePatient(resolvedPatientId && !foundPatient ? resolvedPatientId : null);

  // Form state
  const [step, setStep] = useState(0);
  const [isHeaderExpanded, setIsHeaderExpanded] = useState(false);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string|null>(null);
  const createEvaluation = useCreateEvaluation();

  const [patientInfo, setPatientInfo] = useState<{name:string;age:string;phone:string;gender:'Male'|'Female'|'Other';address:string;condition:string[]}>({name:'',age:'',phone:'',gender:'Male',address:'',condition:[]});
  const [vitals, setVitals] = useState({bp_sys:'',bp_dia:'',pr:'',spo2:'',temp:'',ef:''});
  const [chiefComplaints, setChiefComplaints] = useState<string[]>([]);
  const [complaintsText, setComplaintsText] = useState('');
  const [specificProblems, setSpecificProblems] = useState<Record<string, any>>({});
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string[]>([]);
  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState<string[]>([]);
  const [otherMedicalHistory, setOtherMedicalHistory] = useState('');
  const [showOtherMedicalHistory, setShowOtherMedicalHistory] = useState(false);
  const [painLevel, setPainLevel] = useState(0);
  const [examinationNotes, setExaminationNotes] = useState('');
  const [diagnosisNotes, setDiagnosisNotes] = useState('');
  const [selectedDiagnoses, setSelectedDiagnoses] = useState<string[]>([]);
  const [treatmentNotes, setTreatmentNotes] = useState('');
  const [treatmentPlanData, setTreatmentPlanData] = useState<TreatmentPlanData>(getEmptyTreatmentPlan());
  const [funcRatings, setFuncRatings] = useState<Record<string,number>>({});
  const [romData, setRomData] = useState<RomData>({});
  const [anthropometrics, setAnthropometrics] = useState<Anthropometrics>({height:'',weight:'',bmi:'',excessWeight:'',excessCalorie:'',duration:'',waist:'',hip:'',whRatio:''});
  const [clinicalExamData, setClinicalExamData] = useState<ClinicalExamData>(getEmptyClinicalExam());
  const [intakePhoto, setIntakePhoto] = useState<File|null>(null);
  const [intakePhotoUrl, setIntakePhotoUrl] = useState<string|null>(null);
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'Cash'|'UPI'|''>('');
  const [billAmount, setBillAmount] = useState<number|null>(null);
  const [billAmountInput, setBillAmountInput] = useState('');
  const [visitType, setVisitType] = useState<'Clinic'|'Home Visit'|'IP'|'Day Care'>('Clinic');
  const [neuroData, setNeuroData] = useState<any>(getEmptyNeuroData());

  // Follow-up
  const { data: previousEval } = useLatestEvaluation(resolvedPatientId || null);
  const isFollowUp = Boolean(previousEval);

  // Billing calculation
  const { data: treatments = [] } = useTreatments();
  const selectedTreatmentNames = [
    ...treatmentPlanData.modalities,
    ...treatmentPlanData.manualTherapy,
    ...treatmentPlanData.rehabilitation
  ];
  const matchedTreatments = treatments.filter(t => selectedTreatmentNames.includes(t.treatmentName));
  const billTotal = matchedTreatments.reduce((sum, t) => sum + t.charge, 0);

  // Dynamic clinical configuration
  const {
    chiefComplaints: chiefComplaintsList,
    associatedSymptoms: associatedSymptomsList,
    medicalHistory: medicalHistoryList,
    diagnoses: diagnosisList,
    complaintDiagnosisRelevance: relevanceMap,
    clinicalTestMap: testMap,
  } = useClinicalConfig();

  useEffect(() => {
    if (patientById && !foundPatient && resolvedPatientId) {
      const cond = patientById.condition
        ? patientById.condition.split(',').map((x: string) => x.trim()).filter((x: string) => ['Ortho', 'Neuro', 'Cardio'].includes(x))
        : [];
      setPatientInfo({name:patientById.name??'',age:patientById.age?String(patientById.age):'',phone:patientById.phone??phoneToFetch,gender:(patientById.gender as any)??'Male',address:patientById.city??'',condition:cond});
      setPhoneInput(patientById.phone??phoneToFetch);
      if (patientById.therapistId) setSelectedTherapistId(patientById.therapistId);
    }
  }, [patientById, foundPatient, resolvedPatientId, phoneToFetch]);

  useEffect(() => {
    if (foundPatient && resolvedPatientId && resolvedPatientId === foundPatient.id) {
      const cond = foundPatient.condition
        ? foundPatient.condition.split(',').map((x: string) => x.trim()).filter((x: string) => ['Ortho', 'Neuro', 'Cardio'].includes(x))
        : [];
      setPatientInfo({name:foundPatient.name??'',age:foundPatient.age?String(foundPatient.age):'',phone:foundPatient.phone??phoneToFetch,gender:(foundPatient.gender as any)??'Male',address:foundPatient.city??'',condition:cond});
      if (foundPatient.therapistId) setSelectedTherapistId(foundPatient.therapistId);
    }
  }, [foundPatient, resolvedPatientId, phoneToFetch]);

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
      // Chief Complaints
      if (previousEval.chiefComplaints) {
        setComplaintsText(previousEval.chiefComplaints);
      }
      // Symptoms
      if (previousEval.associatedSymptoms) {
        setAssociatedSymptoms(previousEval.associatedSymptoms);
      }
      // Medical History
      if (previousEval.medicalHistory) {
        setSelectedMedicalHistory(previousEval.medicalHistory);
      }
      // Pain Level
      if (previousEval.painLevel != null) {
        setPainLevel(previousEval.painLevel);
      }
      // Diagnosis
      if (previousEval.diagnosis) {
        setDiagnosisNotes(previousEval.diagnosis);
      }
      if (previousEval.diagnosisList) {
        setSelectedDiagnoses(previousEval.diagnosisList);
      }
      // Treatment Plan
      if (previousEval.treatmentPlan) {
        const tp = previousEval.treatmentPlan as any;
        setTreatmentPlanData({
          modalities: tp.modalities || [],
          manualTherapy: tp.manualTherapy || [],
          rehabilitation: tp.rehabilitation || [],
          visitsRequired: tp.visitsRequired ? String(tp.visitsRequired) : '',
          frequencyGapDays: tp.frequencyGapDays ? String(tp.frequencyGapDays) : '',
          suggestedStartDate: tp.suggestedStartDate || '',
        });
      }
      if (previousEval.neuroData) {
        setNeuroData(previousEval.neuroData);
      }
    }
  }, [previousEval]);

  useEffect(() => { if (!intakePhoto) { setIntakePhotoUrl(null); return; } const u=URL.createObjectURL(intakePhoto); setIntakePhotoUrl(u); return ()=>URL.revokeObjectURL(u); }, [intakePhoto]);

  const handlePhoneLookup = useCallback(() => { if (phoneInput.trim().length<7) return; setPhoneToFetch(phoneInput.trim()); setLookupDone(true); setShowNewPatientForm(false); }, [phoneInput]);
  const handleUseFoundPatient = useCallback(() => { if (!foundPatient) return; setResolvedPatientId(foundPatient.id); setPatientInfo({name:foundPatient.name??'',age:foundPatient.age?String(foundPatient.age):'',phone:foundPatient.phone??phoneToFetch,gender:(foundPatient.gender as any)??'Male',address:foundPatient.city??''}); }, [foundPatient, phoneToFetch]);

  const handleCreateNewPatient = async () => {
    if (!newPatient.name||!newPatient.age) return;
    try {
      const created = await createPatientMutation.mutateAsync({name:newPatient.name,age:Number(newPatient.age),gender:newPatient.gender,phone:phoneInput.trim(),condition:newPatient.condition||undefined,therapistId:selectedTherapistId||undefined});
      setResolvedPatientId(created.id);
      setPatientInfo({name:created.name,age:String(created.age),phone:created.phone??phoneInput.trim(),gender:created.gender as any,address:created.city??''});
      setShowNewPatientForm(false); setStep(1);
    } catch (err:any) { setSubmitError(err?.response?.data?.message??'Failed to create patient.'); }
  };

  const handlePhotoChange = (e:ChangeEvent<HTMLInputElement>) => { const f=e.target.files?.[0]; if (!f) return; if (!f.type.startsWith('image/')) { setSubmitError('Please upload an image.'); return; } setSubmitError(null); setIntakePhoto(f); };
  const handlePhotoRemove = () => { setIntakePhoto(null); setPhotoInputKey(p=>p+1); };
  const formatRupees = (n:number) => new Intl.NumberFormat('en-IN').format(n);

  const handleBillAmountChange = (v:string) => { setSubmitError(null); const d=v.replace(/[^\d]/g,''); if (!d) { setBillAmount(null); setBillAmountInput(''); return; } const n=Number(d); setBillAmount(n); setBillAmountInput(formatRupees(n)); };

  const handleSave = async () => {
    setSubmitError(null);
    if (!resolvedPatientId) { setSubmitError('No patient resolved.'); return; }
    if (!paymentMode || billTotal <= 0) { setSubmitError('Please select treatments and a payment mode.'); return; }
    const vitalsPayload: Record<string,unknown> = {};
    if (vitals.bp_sys&&vitals.bp_dia) vitalsPayload.bp=`${vitals.bp_sys}/${vitals.bp_dia}`;
    if (vitals.pr) vitalsPayload.pr=Number(vitals.pr);
    if (vitals.spo2) vitalsPayload.spo2=Number(vitals.spo2);
    if (vitals.temp) vitalsPayload.temperature=Number(vitals.temp);
    if (vitals.ef) vitalsPayload.ef=Number(vitals.ef);
    try {
      const finalHistory=[...selectedMedicalHistory]; if (otherMedicalHistory.trim()) finalHistory.push(`Other: ${otherMedicalHistory.trim()}`);
      const allComplaints = [...chiefComplaints, complaintsText.trim()].filter(Boolean).join('; ');
      const hasRomData = Object.keys(romData).length > 0;
      const hasAnthro = Object.values(anthropometrics).some(v => v !== '');
      
      // 1. Update patient demographics if they changed
      await updatePatientMutation.mutateAsync({
        id: resolvedPatientId,
        name: patientInfo.name,
        age: Number(patientInfo.age),
        gender: patientInfo.gender,
        phone: patientInfo.phone,
        city: patientInfo.address,
        condition: patientInfo.condition && patientInfo.condition.length > 0 ? patientInfo.condition.join(', ') : '',
      });

      // 2. Create the evaluation record
      await createEvaluation.mutateAsync({
        patientId: resolvedPatientId,
        vitals: Object.keys(vitalsPayload).length>0 ? (vitalsPayload as any) : undefined,
        painLevel,
        chiefComplaints: allComplaints || undefined,
        associatedSymptoms: associatedSymptoms.length>0 ? associatedSymptoms : undefined,
        medicalHistory: finalHistory.length>0 ? finalHistory : undefined,
        diagnosis: diagnosisNotes.trim() || undefined,
        diagnosisList: selectedDiagnoses.length > 0 ? selectedDiagnoses : undefined,
        plan: treatmentNotes.trim() || undefined,
        treatmentPlan: getTreatmentSelectionCount(treatmentPlanData) > 0 || treatmentPlanData.visitsRequired || treatmentPlanData.frequencyGapDays || treatmentPlanData.suggestedStartDate ? {
          modalities: treatmentPlanData.modalities.length > 0 ? treatmentPlanData.modalities : undefined,
          manualTherapy: treatmentPlanData.manualTherapy.length > 0 ? treatmentPlanData.manualTherapy : undefined,
          rehabilitation: treatmentPlanData.rehabilitation.length > 0 ? treatmentPlanData.rehabilitation : undefined,
          visitsRequired: treatmentPlanData.visitsRequired ? Number(treatmentPlanData.visitsRequired) : undefined,
          frequencyGapDays: treatmentPlanData.frequencyGapDays ? Number(treatmentPlanData.frequencyGapDays) : undefined,
          suggestedStartDate: treatmentPlanData.suggestedStartDate || undefined,
        } : undefined,
        management: examinationNotes.trim() || undefined,
        status: 'submitted',
        paymentMode, billAmount: billAmount !== null ? billAmount : billTotal, visitType,
        associatedPains: chiefComplaints.length>0 ? chiefComplaints : undefined,
        functionalScores: Object.keys(specificProblems).length > 0 ? specificProblems : undefined,
        musclePowerRom: hasRomData ? romData : undefined,
        anthropometrics: hasAnthro ? anthropometrics : undefined,
        clinicalExamination: (Object.keys(clinicalExamData.tests).length > 0 || Object.keys(clinicalExamData.imaging).length > 0 || !!examinationNotes.trim()) ? {
          ...clinicalExamData,
          examinationNotes: examinationNotes.trim() || undefined
        } : undefined,
        neuroData: patientInfo.condition?.includes('Neuro') ? neuroData : undefined,
      });
      setSaved(true);
      setTimeout(() => navigate(`/${currentRole}/report?patientId=${resolvedPatientId}`), 2000);
    } catch (err:any) { setSubmitError(err?.response?.data?.message??'Failed to save.'); }
  };

  const hasNeuro = patientInfo.condition?.includes('Neuro');
  const stepsList = [
    { label: 'Patient', key: 'patient' },
    { label: 'Vitals', key: 'vitals' },
    { label: 'History', key: 'history' },
    { label: 'Complaints', key: 'complaints' },
    { label: 'VAS Scale', key: 'pain' },
    { label: 'Examination', key: 'examination' },
    ...(hasNeuro ? [
      { label: 'Neuro: Mental & Nerves', key: 'neuro_mental' },
      { label: 'Neuro: Sensory & Motor', key: 'neuro_sensory' },
      { label: 'Neuro: Coordination & Balance', key: 'neuro_coordination' },
      { label: 'Neuro: Gait & Hand', key: 'neuro_gait_hand' }
    ] : []),
    { label: 'Diagnosis', key: 'diagnosis' },
    { label: 'Treatment', key: 'treatment' },
    { label: 'Review & Pay', key: 'review' }
  ];
  const totalSteps = stepsList.length;
  const isPhotoUploaded = Boolean(intakePhoto);

  if (saved) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#E8E9F1] dark:bg-slate-950">
        <div className="flex flex-col items-center p-8 rounded-[32px] mx-6 bg-white dark:bg-slate-900 shadow-xl shadow-indigo-500/10 border border-slate-100 dark:border-slate-800">
          <div className="rounded-full flex items-center justify-center mb-5 w-20 h-20 bg-indigo-50 dark:bg-indigo-900/30">
            <Check className="w-11 h-11 text-indigo-600" />
          </div>
          <h2 className="text-[22px] font-black text-slate-900 dark:text-white text-center tracking-tight">Assessment Saved!</h2>
          <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400 text-center mt-2 leading-relaxed">
            Assessment saved and session started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#E8E9F1] dark:bg-slate-950 font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto flex flex-col overflow-x-hidden">
      {/* Header — Design based on user image with Doctor Gradient */}
      <div className={`px-6 shrink-0 transition-all duration-300 ${isHeaderExpanded ? 'pt-5 pb-5 rounded-b-[2rem]' : 'py-3.5 rounded-b-2xl'} bg-gradient-to-br from-[#262842] to-[#3B3E66] dark:from-slate-900 dark:to-slate-800 shadow-xl shadow-indigo-950/20 z-10 relative overflow-hidden`}>
        {/* Abstract background shapes for premium feel */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-40 h-40 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className={`flex items-center justify-between relative z-10 ${isHeaderExpanded ? 'mb-4' : ''}`}>
          <div className="flex items-center gap-4">
            <button 
              onClick={()=>{setSubmitError(null);step>0?setStep(step-1):navigate(`/${currentRole}`);}} 
              className="flex items-center justify-center rounded-full w-9.5 h-9.5 bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md border border-white/20 active:scale-90"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div>
              <h1 className="text-[17px] font-black text-white tracking-tight">Assessment Form</h1>
              <p className="text-[11px] font-bold text-white/70 mt-0.5">Step {step+1} of {totalSteps} — {stepsList[step]?.label}</p>
            </div>
          </div>
          <button 
            onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
            className="flex items-center justify-center rounded-full w-9.5 h-9.5 bg-white/10 hover:bg-white/20 transition-all backdrop-blur-md border border-white/20 text-white active:scale-90"
            title={isHeaderExpanded ? "Minimize progress details" : "Show progress details"}
          >
            {isHeaderExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>

        {isHeaderExpanded && (
          /* Progress Bar */
          <div className="max-w-3xl mx-auto px-2 relative z-10">
            <div className="rounded-full h-1.5 bg-white/10 dark:bg-white/10 overflow-hidden mb-3">
              <div 
                className="h-full bg-white transition-all duration-700 ease-out rounded-full shadow-[0_0_10px_rgba(255,255,255,0.3)]" 
                style={{width:`${((step+1)/totalSteps)*100}%`}} 
              />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-center gap-2">
              {stepsList.map((_, i) => (
                <div 
                  key={i} 
                  className={`rounded-full transition-all duration-500 h-1.5 ${
                    i === step ? 'w-6 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 
                    i < step ? 'w-1.5 bg-white/60' : 
                    'w-1.5 bg-white/20'
                  }`} 
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Phone Lookup — Match layout from image */}
      <div className="px-6 pt-6 pb-2 shrink-0 z-0">
        <div className="max-w-3xl mx-auto flex gap-3 items-center bg-white dark:bg-slate-900 p-2.5 rounded-[24px] shadow-lg shadow-indigo-900/5 border border-slate-100 dark:border-slate-800">
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
            placeholder="Patient mobile number..."
            className="flex-1"
          />
          <button 
            onClick={handlePhoneLookup} 
            disabled={phoneInput.trim().length<7} 
            className="px-5 md:px-7 py-3.5 rounded-2xl text-white text-[14px] font-black disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-indigo-500/20 bg-[#262842] hover:bg-[#3B3E66] flex items-center justify-center shrink-0"
          >
            <Search className="w-5 h-5 md:hidden" />
            <span className="hidden md:inline">Lookup</span>
          </button>
        </div>

        {/* Lookup States */}
        <div className="max-w-3xl mx-auto">
          {lookupDone&&lookingUp&&<div className="flex items-center gap-2 mt-4 px-4 py-2 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800"><Loader2 size={16} className="animate-spin text-[#262842] dark:text-indigo-400" /><span className="text-[13px] font-bold text-slate-500 dark:text-slate-400">Searching directory…</span></div>}
          {lookupDone&&!lookingUp&&foundPatient&&!resolvedPatientId&&(
            <div className="mt-4 p-5 rounded-[22px] bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
              <div><p className="text-[15px] font-black text-[#262842] dark:text-indigo-100">{foundPatient.name}</p><p className="text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">{foundPatient.phone} · {foundPatient.gender} · Age {foundPatient.age}</p></div>
              <button onClick={handleUseFoundPatient} className="px-5 py-3 rounded-xl text-[13px] font-black text-white bg-[#262842] hover:bg-[#3B3E66] shadow-sm transition-transform active:scale-95">Use Record</button>
            </div>
          )}
          {lookupDone&&!lookingUp&&foundPatient&&resolvedPatientId&&<div className="mt-4 px-5 py-3.5 flex items-center gap-3 bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100 dark:border-slate-800 shadow-sm animate-in fade-in"><div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center"><Check size={16} className="text-indigo-600 dark:text-indigo-400" /></div><span className="text-[14px] font-extrabold text-[#262842] dark:text-indigo-400">{foundPatient.name} · {foundPatient.phone}</span></div>}
          {lookupDone&&!lookingUp&&foundPatient===null&&!showNewPatientForm&&(
            <div className="mt-4 p-5 rounded-[22px] bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/50 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center"><AlertTriangle size={20} className="text-amber-600 dark:text-amber-400" /></div><span className="text-[14px] font-extrabold text-amber-800 dark:text-amber-400">Unregistered patient</span></div>
              <button onClick={()=>setShowNewPatientForm(true)} className="px-5 py-3 rounded-xl text-[13px] font-black text-white bg-[#262842] hover:bg-[#3B3E66] shadow-sm transition-transform active:scale-95">Register</button>
            </div>
          )}
          {showNewPatientForm&&(
            <div className="mt-4 p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex flex-col gap-5 shadow-xl animate-in zoom-in-95 duration-200">
              <p className="text-[16px] font-black text-slate-800 dark:text-white">New Patient Registration — <span className="text-indigo-600 dark:text-indigo-400">{phoneInput}</span></p>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="Full Name *" value={newPatient.name} onChange={e=>setNewPatient(p=>({...p,name:e.target.value}))} className="col-span-2 px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[15px] font-medium outline-none focus:border-[#262842] focus:ring-1 focus:ring-[#262842] transition-colors" />
                <input placeholder="Age *" type="number" value={newPatient.age} onChange={e=>setNewPatient(p=>({...p,age:e.target.value}))} className="px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[15px] font-medium outline-none focus:border-[#262842] focus:ring-1 focus:ring-[#262842] transition-colors" />
                <select value={newPatient.gender} onChange={e=>setNewPatient(p=>({...p,gender:e.target.value as any}))} className="px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[15px] font-medium outline-none focus:border-[#262842] transition-colors"><option>Male</option><option>Female</option><option>Other</option></select>
              </div>
              <div className="flex gap-4 mt-2">
                <button onClick={()=>setShowNewPatientForm(false)} className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-[14px] font-black text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                <button onClick={handleCreateNewPatient} disabled={createPatientMutation.isPending||!newPatient.name||!newPatient.age} className="flex-1 py-3.5 rounded-2xl text-white text-[14px] font-black disabled:opacity-60 bg-[#262842] hover:bg-[#3B3E66] shadow-lg shadow-indigo-500/20 transition-transform active:scale-95">{createPatientMutation.isPending?'Creating…':'Save & Continue'}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form content */}
      <div className="flex-1 px-6 py-6 max-w-2xl mx-auto w-full pb-12">
        <div className="transition-all duration-300">
          {step===0&&<StepPatient patientInfo={patientInfo} setPatientInfo={setPatientInfo} intakePhotoUrl={intakePhotoUrl} handlePhotoChange={handlePhotoChange} handlePhotoRemove={handlePhotoRemove} photoInputKey={photoInputKey} isDoctorRole={isDoctorRole} selectedTherapistId={selectedTherapistId} setSelectedTherapistId={setSelectedTherapistId} therapistsList={therapistsList} updatePatientMutation={updatePatientMutation} resolvedPatientId={resolvedPatientId} user={user} />}
          {step===1&&<StepVitals vitals={vitals} setVitals={setVitals} isDoctorRole={isDoctorRole} />}
          {step===2&&<StepHistory selectedMedicalHistory={selectedMedicalHistory} setSelectedMedicalHistory={setSelectedMedicalHistory} otherMedicalHistory={otherMedicalHistory} setOtherMedicalHistory={setOtherMedicalHistory} showOtherMedicalHistory={showOtherMedicalHistory} setShowOtherMedicalHistory={setShowOtherMedicalHistory} isDoctorRole={isDoctorRole} medicalHistoryList={medicalHistoryList} />}
          {step===3&&<StepComplaints chiefComplaints={chiefComplaints} setChiefComplaints={setChiefComplaints} associatedSymptoms={associatedSymptoms} setAssociatedSymptoms={setAssociatedSymptoms} complaintsText={complaintsText} setComplaintsText={setComplaintsText} specificProblems={specificProblems} setSpecificProblems={setSpecificProblems} isDoctorRole={isDoctorRole} chiefComplaintsList={chiefComplaintsList} associatedSymptomsList={associatedSymptomsList} />}
          {step===4&&<StepPainScale painLevel={painLevel} setPainLevel={setPainLevel} isDoctorRole={isDoctorRole} />}
          {step===5&&<StepExamination examination={examinationNotes} setExamination={setExaminationNotes} isDoctorRole={isDoctorRole} chiefComplaints={chiefComplaints} clinicalExamData={clinicalExamData} onClinicalExamChange={setClinicalExamData} testMap={testMap} romData={romData} setRomData={setRomData} />}
          {hasNeuro && step===6&&<StepNeuroExam data={neuroData} onChange={setNeuroData} isDoctorRole={isDoctorRole} page={1} />}
          {hasNeuro && step===7&&<StepNeuroExam data={neuroData} onChange={setNeuroData} isDoctorRole={isDoctorRole} page={2} />}
          {hasNeuro && step===8&&<StepNeuroExam data={neuroData} onChange={setNeuroData} isDoctorRole={isDoctorRole} page={3} />}
          {hasNeuro && step===9&&<StepNeuroExam data={neuroData} onChange={setNeuroData} isDoctorRole={isDoctorRole} page={4} />}
          {step===(hasNeuro ? 10 : 6)&&<StepDiagnosis diagnosis={diagnosisNotes} setDiagnosis={setDiagnosisNotes} isDoctorRole={isDoctorRole} selectedDiagnoses={selectedDiagnoses} setSelectedDiagnoses={setSelectedDiagnoses} chiefComplaints={chiefComplaints} diagnosisList={diagnosisList} relevanceMap={relevanceMap} />}
          {step===(hasNeuro ? 11 : 7)&&<StepTreatment treatment={treatmentNotes} setTreatment={setTreatmentNotes} isDoctorRole={isDoctorRole} treatmentPlan={treatmentPlanData} setTreatmentPlan={setTreatmentPlanData} treatmentsList={treatments} />}

          {/* Step 8: Review & Payment */}
          {step===(hasNeuro ? 12 : 8)&&(
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-6 duration-500">
              <SectionCard icon={<Save size={20} className="text-indigo-600 dark:text-indigo-400" />} title="Final Review" accent="doctor">
                <FormField label="Visit Type">
                  <div className="grid grid-cols-2 gap-3">{['Clinic','Home Visit','IP','Day Care'].map(v=><button key={v} onClick={()=>setVisitType(v as any)} className={`py-4 rounded-[18px] text-[14px] font-black border-2 transition-all active:scale-95 ${visitType===v?'border-[#262842] bg-indigo-50 dark:bg-indigo-900/20 text-[#262842] dark:text-indigo-300':'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400'}`}>{v}</button>)}</div>
                </FormField>
                <div className="flex flex-col gap-0 mt-3 bg-slate-50 dark:bg-slate-800/50 rounded-[20px] p-2 border border-slate-100 dark:border-slate-800">{[
                  {l:'Patient',v:patientInfo.name||'—'},{l:'Age',v:patientInfo.age||'—'},{l:'BP',v:vitals.bp_sys&&vitals.bp_dia?`${vitals.bp_sys}/${vitals.bp_dia}`:'—'},
                  {l:'Pain',v:`${painLevel}/10`},{l:'Complaints',v:chiefComplaints.length>0?`${chiefComplaints.length} selected`:'—'},
                  {l:'Clinical Tests',v:(() => { const count = Object.values(clinicalExamData.tests).filter(t => t.result !== 'Not Tested').length; return count > 0 ? `${count} recorded` : '—'; })()},
                  {l:'Diagnosis',v:selectedDiagnoses.length > 0 ? `${selectedDiagnoses.length} selected` : (diagnosisNotes ? (diagnosisNotes.length > 20 ? diagnosisNotes.substring(0, 20) + '...' : diagnosisNotes) : '—')},
                  {l:'Treatment',v:getTreatmentSelectionCount(treatmentPlanData) > 0 ? `${getTreatmentSelectionCount(treatmentPlanData)} items` : '—'},
                ].map(r=><div key={r.l} className="flex items-center justify-between py-4 px-4 border-b border-slate-100 dark:border-slate-800/50 last:border-0"><span className="text-[14px] text-slate-500 dark:text-slate-400 font-bold">{r.l}</span><span className="text-[14px] text-slate-900 dark:text-white font-extrabold">{r.v}</span></div>)}</div>
              </SectionCard>
              <SectionCard icon={<CreditCard size={20} className="text-amber-600 dark:text-amber-400" />} title="Payment Details" subtitle="Required to submit" accent="amber">
                
                {/* Auto-calculated total */}
                {matchedTreatments.length > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 border border-teal-200 dark:border-teal-800">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">Auto-calculated Total</span>
                      <span className="text-[18px] font-black text-teal-800 dark:text-teal-300">₹{formatRupees(billTotal)}</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {matchedTreatments.map((t) => (
                        <span key={t.id} className="text-[10px] font-bold text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40 px-1.5 py-0.5 rounded">
                          {t.treatmentName} · ₹{t.charge}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <FormField label="Mode of Payment">
                  <div className="flex gap-3">{['Cash','UPI'].map(m=><button key={m} onClick={()=>{setPaymentMode(m as any);setSubmitError(null);}} className={`flex-1 py-4 rounded-[18px] text-[14px] font-black border-2 transition-transform active:scale-95 ${paymentMode===m?'border-amber-600 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300':'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400'}`}>{m}</button>)}</div>
                </FormField>
                
                <FormField label="Bill Amount">
                  <div className="flex items-center gap-4 px-5 py-4 rounded-[18px] border border-[#262842] dark:border-indigo-700 bg-white dark:bg-slate-900 focus-within:ring-2 focus-within:ring-indigo-500 transition-shadow">
                    <span className="text-[18px] font-black text-slate-500 dark:text-slate-400">₹</span>
                    <input 
                      type="text"
                      inputMode="numeric"
                      value={billAmount !== null ? billAmountInput : (billTotal > 0 ? formatRupees(billTotal) : '')}
                      onChange={(e) => handleBillAmountChange(e.target.value)}
                      className="flex-1 bg-transparent text-[18px] font-extrabold text-slate-900 dark:text-white outline-none"
                      placeholder="0"
                    />
                  </div>
                  <p className="text-[12px] text-[#262842] dark:text-indigo-400 font-semibold mt-1.5">
                    {billAmount !== null ? 'Manually edited.' : (billTotal > 0 ? 'Auto-calculated from selected treatments in Step 7. You can edit this amount.' : 'Select treatments in Step 7 to auto-fill or enter manually.')}
                  </p>
                </FormField>
              </SectionCard>
              <button onClick={handleSave} disabled={createEvaluation.isPending} className="w-full mt-2 py-5 rounded-[22px] flex items-center justify-center gap-3 text-white text-[16px] font-black shadow-xl shadow-indigo-600/30 disabled:opacity-60 bg-[#262842] hover:bg-[#3B3E66] transition-all active:scale-[0.98]">
                {createEvaluation.isPending?<><Loader2 size={22} className="animate-spin" /> Submitting…</>:<><Save size={22} /> Finalize & Start Session</>}
              </button>
            </div>
          )}
        </div>
      </div>
      </div>

      {/* Navigation Buttons (Fixed Bottom) */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)] relative z-20">
        <div className="max-w-2xl mx-auto w-full flex flex-col gap-4">
          {submitError && (
            <div className="p-4 rounded-[18px] bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 text-[14px] text-red-700 dark:text-red-400 font-bold flex items-center gap-3 shadow-sm animate-in fade-in slide-in-from-left-2">
              <AlertTriangle size={18} className="shrink-0" />
              {submitError}
            </div>
          )}
          <div className="flex gap-4">
            {step > 0 && (
              <button
                onClick={() => { setSubmitError(null); setStep(step - 1); }}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-[20px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[15px] font-black shadow-lg shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700 transition-all active:scale-95"
              >
                <ChevronLeft size={20} strokeWidth={3} />
                Back
              </button>
            )}
            {step < totalSteps - 1 && (
              <button
                onClick={() => { 
                  if (step === 0 && !resolvedPatientId) {
                    setSubmitError('Please resolve a patient before continuing.');
                    return;
                  }
                  setSubmitError(null); 
                  setStep(step + 1); 
                }}
                className="flex-1 flex items-center justify-center gap-2 py-4 rounded-[20px] text-white text-[15px] font-black shadow-xl shadow-indigo-900/10 bg-[#262842] hover:bg-[#3B3E66] transition-all active:scale-[0.98]"
              >
                Next Step
                <ChevronRight size={20} strokeWidth={3} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="md:hidden"><BottomNav role={currentRole} /></div>
    </div>
  );
}
