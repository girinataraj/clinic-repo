import { useState, useCallback, useEffect, type ChangeEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../../contexts/AuthContext';
import { BottomNav } from '../../components/BottomNav';
import { useCreateEvaluation, useLatestEvaluation } from '../../../hooks/useEvaluations';
import { usePatientByPhone, useCreatePatient, usePatient, useUpdatePatient } from '../../../hooks/usePatients';
import { useStaffUsers } from '../../../hooks/useStaff';
import { ArrowLeft, ChevronRight, ChevronLeft, Check, Loader2, AlertTriangle, Save, CreditCard, ClipboardList } from 'lucide-react';
import { ASSESSMENT_STEPS, type RomData, type Anthropometrics } from './clinicalConfig';
import { SectionCard, FormField, inputClass } from './FormComponents';
import { StepPatient, StepVitals, StepComplaints, StepPainFunction, StepHistory } from './StepRenderers';
import { RomMatrix } from './RomMatrix';
import { AnthropometricSection } from './AnthropometricSection';

export function AssessmentForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentRole = (user?.role === 'doctor' ? 'doctor' : 'nurse') as 'nurse' | 'doctor';
  const [searchParams] = useSearchParams();
  const isDoctorRole = currentRole === 'doctor';

  // Phone lookup
  const [phoneInput, setPhoneInput] = useState(searchParams.get('phone') ?? '');
  const [phoneToFetch, setPhoneToFetch] = useState(searchParams.get('phone') ?? '');
  const [resolvedPatientId, setResolvedPatientId] = useState(searchParams.get('patientId') ?? '');
  const [lookupDone, setLookupDone] = useState(Boolean(searchParams.get('patientId') || searchParams.get('phone')));
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatient, setNewPatient] = useState<{name:string;age:string;gender:'Male'|'Female'|'Other';condition:string}>({name:'',age:'',gender:'Male',condition:''});

  const { data: foundPatient, isLoading: lookingUp, isError: lookupError } = usePatientByPhone(phoneToFetch.trim().length >= 7 ? phoneToFetch.trim() : null);
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const { data: therapistsList = [], isLoading: therapistsLoading } = useStaffUsers({ role: 'nurse' });
  const [selectedTherapistId, setSelectedTherapistId] = useState('');
  const { data: patientById } = usePatient(resolvedPatientId && !foundPatient ? resolvedPatientId : null);

  // Form state
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const [submitError, setSubmitError] = useState<string|null>(null);
  const createEvaluation = useCreateEvaluation();

  const [patientInfo, setPatientInfo] = useState<{name:string;age:string;phone:string;gender:'Male'|'Female'|'Other';address:string}>({name:'',age:'',phone:'',gender:'Male',address:''});
  const [vitals, setVitals] = useState({bp_sys:'',bp_dia:'',pr:'',spo2:'',temp:'',ef:''});
  const [chiefComplaints, setChiefComplaints] = useState<string[]>([]);
  const [complaintsText, setComplaintsText] = useState('');
  const [associatedSymptoms, setAssociatedSymptoms] = useState<string[]>([]);
  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState<string[]>([]);
  const [otherMedicalHistory, setOtherMedicalHistory] = useState('');
  const [showOtherMedicalHistory, setShowOtherMedicalHistory] = useState(false);
  const [painLevel, setPainLevel] = useState(0);
  const [funcRatings, setFuncRatings] = useState<Record<string,number>>({});
  const [romData, setRomData] = useState<RomData>({});
  const [anthropometrics, setAnthropometrics] = useState<Anthropometrics>({height:'',weight:'',bmi:'',excessWeight:'',excessCalorie:'',duration:'',waist:'',hip:'',whRatio:''});
  const [intakePhoto, setIntakePhoto] = useState<File|null>(null);
  const [intakePhotoUrl, setIntakePhotoUrl] = useState<string|null>(null);
  const [photoInputKey, setPhotoInputKey] = useState(0);
  const [paymentMode, setPaymentMode] = useState<'Cash'|'UPI'|''>('');
  const [billAmount, setBillAmount] = useState<number|null>(null);
  const [billAmountInput, setBillAmountInput] = useState('');
  const [visitType, setVisitType] = useState<'Clinic'|'Home Visit'|'IP'|'Day Care'>('Clinic');

  // Follow-up
  const { data: previousEval, isLoading: loadingPrevEval } = useLatestEvaluation(resolvedPatientId || null);
  const isFollowUp = Boolean(previousEval);

  // Auto-fill effects
  useEffect(() => {
    if (patientById && !foundPatient && resolvedPatientId) {
      setPatientInfo({name:patientById.name??'',age:patientById.age?String(patientById.age):'',phone:patientById.phone??phoneToFetch,gender:(patientById.gender as any)??'Male',address:patientById.city??''});
      setPhoneInput(patientById.phone??phoneToFetch);
      if (patientById.therapistId) setSelectedTherapistId(patientById.therapistId);
    }
  }, [patientById, foundPatient, resolvedPatientId, phoneToFetch]);

  useEffect(() => {
    if (foundPatient && resolvedPatientId && resolvedPatientId === foundPatient.id) {
      setPatientInfo({name:foundPatient.name??'',age:foundPatient.age?String(foundPatient.age):'',phone:foundPatient.phone??phoneToFetch,gender:(foundPatient.gender as any)??'Male',address:foundPatient.city??''});
      if (foundPatient.therapistId) setSelectedTherapistId(foundPatient.therapistId);
    }
  }, [foundPatient, resolvedPatientId, phoneToFetch]);

  useEffect(() => { if (!intakePhoto) { setIntakePhotoUrl(null); return; } const u=URL.createObjectURL(intakePhoto); setIntakePhotoUrl(u); return ()=>URL.revokeObjectURL(u); }, [intakePhoto]);

  const handlePhoneLookup = useCallback(() => { if (phoneInput.trim().length<7) return; setPhoneToFetch(phoneInput.trim()); setLookupDone(true); setShowNewPatientForm(false); }, [phoneInput]);
  const handleUseFoundPatient = useCallback(() => { if (!foundPatient) return; setResolvedPatientId(foundPatient.id); setPatientInfo({name:foundPatient.name??'',age:foundPatient.age?String(foundPatient.age):'',phone:foundPatient.phone??phoneToFetch,gender:(foundPatient.gender as any)??'Male',address:foundPatient.city??''}); }, [foundPatient, phoneToFetch]);

  const handleCreateNewPatient = async () => {
    if (!newPatient.name||!newPatient.age) return;
    try {
      const created = await createPatientMutation.mutateAsync({name:newPatient.name,age:Number(newPatient.age),gender:newPatient.gender,phone:phoneInput.trim(),condition:newPatient.condition||undefined,therapistId:isDoctorRole?(selectedTherapistId||undefined):(user?.id||undefined)});
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
    if (!paymentMode||!billAmount||billAmount<=0) { setSubmitError('Payment details required.'); return; }
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
      await createEvaluation.mutateAsync({
        patientId: resolvedPatientId,
        vitals: Object.keys(vitalsPayload).length>0 ? (vitalsPayload as any) : undefined,
        painLevel,
        chiefComplaints: allComplaints || undefined,
        associatedSymptoms: associatedSymptoms.length>0 ? associatedSymptoms : undefined,
        medicalHistory: finalHistory.length>0 ? finalHistory : undefined,
        status: 'submitted',
        paymentMode, billAmount, visitType,
        associatedPains: chiefComplaints.length>0 ? chiefComplaints : undefined,
        musclePowerRom: hasRomData ? romData : undefined,
        anthropometrics: hasAnthro ? anthropometrics : undefined,
      });
      setSaved(true);
      setTimeout(() => navigate(`/${currentRole}/session/${patientId}`), 2000);
    } catch (err:any) { setSubmitError(err?.response?.data?.message??'Failed to save.'); }
  };

  const totalSteps = ASSESSMENT_STEPS.length;
  const isPhotoUploaded = Boolean(intakePhoto);

  if (saved) {
    return (
      <div className="h-full flex flex-col items-center justify-center" style={{background:'#DEF2F1'}}>
        <div className="flex flex-col items-center p-8 rounded-3xl mx-6 bg-white shadow-xl border border-slate-100">
          <div className="rounded-full flex items-center justify-center mb-4 w-20 h-20 bg-emerald-50"><Check className="w-11 h-11 text-emerald-500" /></div>
          <h2 className="text-xl font-extrabold text-slate-900 text-center">Assessment Saved!</h2>
          <p className="text-[13px] text-slate-500 text-center mt-2">Assessment saved and session started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{fontFamily:"'Inter','Poppins',sans-serif",backgroundColor:'#DEF2F1'}}>
      {/* Header */}
      <div className="px-5 pb-4 shrink-0 pt-5 rounded-b-3xl" style={{background:'linear-gradient(135deg,#2B7A78 0%,#3AAFA9 100%)',boxShadow:'0 4px 24px rgba(43,122,120,0.15)'}}>
        <div className="flex items-center gap-3 mb-3">
          <button onClick={()=>{setSubmitError(null);step>0?setStep(step-1):navigate(`/${currentRole}`);}} className="flex items-center justify-center rounded-xl w-9 h-9" style={{background:'rgba(254,255,255,0.15)'}}><ArrowLeft size={18} color="#FEFFFF" /></button>
          <div>
            <h1 style={{fontSize:'17px',fontWeight:800,color:'#FEFFFF',letterSpacing:'-0.5px'}}>Assessment Form</h1>
            <p style={{fontSize:'11px',color:'rgba(254,255,255,0.7)'}}>Step {step+1} of {totalSteps} — {ASSESSMENT_STEPS[step]?.label}</p>
          </div>
        </div>
        <div className="rounded-full h-1.5" style={{background:'rgba(254,255,255,0.2)'}}><div className="rounded-full h-full transition-all duration-300" style={{width:`${((step+1)/totalSteps)*100}%`,background:'#FEFFFF'}} /></div>
        <div className="flex justify-center gap-1.5 mt-2.5">{ASSESSMENT_STEPS.map((_,i)=>(<div key={i} className={`rounded-full transition-all h-1.5 ${i<=step?'bg-white':'bg-white/30'} ${i===step?'w-5':'w-1.5'}`} />))}</div>
      </div>

      {/* Phone Lookup */}
      <div className="px-4 pt-3 pb-1 bg-white border-b border-slate-100 shrink-0">
        <div className="flex gap-2 items-center">
          <div className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
            <input type="tel" inputMode="numeric" value={phoneInput} onChange={e=>setPhoneInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handlePhoneLookup()} placeholder="Patient mobile number" className="flex-1 bg-transparent outline-none text-[13px] text-slate-800 placeholder:text-slate-400" />
          </div>
          <button onClick={handlePhoneLookup} disabled={phoneInput.trim().length<7} className="px-3 py-2 rounded-xl text-white text-[13px] font-bold disabled:opacity-50" style={{background:'linear-gradient(135deg,#2B7A78,#3AAFA9)'}}>Lookup</button>
        </div>
        {lookupDone&&lookingUp&&<div className="flex items-center gap-2 mt-2 px-2 py-1.5"><Loader2 size={14} className="animate-spin text-teal-600" /><span className="text-[12px] text-slate-500">Looking up…</span></div>}
        {lookupDone&&!lookingUp&&foundPatient&&!resolvedPatientId&&(
          <div className="mt-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div><p className="text-[12px] font-extrabold text-emerald-800">{foundPatient.name}</p><p className="text-[11px] text-emerald-600">{foundPatient.phone} · {foundPatient.gender} · Age {foundPatient.age}</p></div>
            <button onClick={handleUseFoundPatient} className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-white" style={{background:'#059669'}}>Use Patient</button>
          </div>
        )}
        {lookupDone&&!lookingUp&&foundPatient&&resolvedPatientId&&<div className="mt-2 px-2 py-1.5 flex items-center gap-2"><Check size={13} className="text-emerald-500" /><span className="text-[12px] font-bold text-emerald-700">{foundPatient.name} · {foundPatient.phone}</span></div>}
        {lookupDone&&!lookingUp&&foundPatient===null&&!showNewPatientForm&&(
          <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2"><AlertTriangle size={14} className="text-amber-600" /><span className="text-[12px] font-bold text-amber-700">No patient found</span></div>
            <button onClick={()=>setShowNewPatientForm(true)} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-white" style={{background:'#2B7A78'}}>New Patient</button>
          </div>
        )}
        {showNewPatientForm&&(
          <div className="mt-2 p-3 rounded-xl bg-white border border-slate-200 flex flex-col gap-2">
            <p className="text-[12px] font-extrabold text-slate-700">Register New Patient — {phoneInput}</p>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Full Name *" value={newPatient.name} onChange={e=>setNewPatient(p=>({...p,name:e.target.value}))} className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-[13px] outline-none" />
              <input placeholder="Age *" type="number" value={newPatient.age} onChange={e=>setNewPatient(p=>({...p,age:e.target.value}))} className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-[13px] outline-none" />
              <select value={newPatient.gender} onChange={e=>setNewPatient(p=>({...p,gender:e.target.value as any}))} className="px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-[13px] outline-none"><option>Male</option><option>Female</option><option>Other</option></select>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>setShowNewPatientForm(false)} className="flex-1 py-2 rounded-lg border border-slate-200 text-[12px] font-bold text-slate-500">Cancel</button>
              <button onClick={handleCreateNewPatient} disabled={createPatientMutation.isPending||!newPatient.name||!newPatient.age} className="flex-1 py-2 rounded-lg text-white text-[12px] font-bold disabled:opacity-60" style={{background:'#2B7A78'}}>{createPatientMutation.isPending?'Creating…':'Create & Continue'}</button>
            </div>
          </div>
        )}
      </div>

      {/* Form content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full">
        {/* Follow-up banner */}
        {resolvedPatientId&&isFollowUp&&previousEval&&(
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
            <div className="flex items-center gap-2 mb-2"><ClipboardList size={16} className="text-blue-600" /><span className="text-[13px] font-extrabold text-blue-800">Follow-up Assessment</span><span className="ml-auto text-[10px] font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded-full">Previous: {new Date(previousEval.createdAt).toLocaleDateString()}</span></div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              {previousEval.bp&&<p className="text-slate-600"><span className="font-bold">BP:</span> {previousEval.bp}</p>}
              {previousEval.painLevel!==undefined&&<p className="text-slate-600"><span className="font-bold">Pain:</span> {previousEval.painLevel}/10</p>}
              {previousEval.chiefComplaints&&<p className="col-span-2 text-slate-600"><span className="font-bold">Complaints:</span> {previousEval.chiefComplaints}</p>}
              {previousEval.diagnosis&&<p className="col-span-2 text-slate-600"><span className="font-bold">Diagnosis:</span> {previousEval.diagnosis}</p>}
            </div>
          </div>
        )}

        {step===0&&<StepPatient patientInfo={patientInfo} setPatientInfo={setPatientInfo} intakePhotoUrl={intakePhotoUrl} handlePhotoChange={handlePhotoChange} handlePhotoRemove={handlePhotoRemove} photoInputKey={photoInputKey} isDoctorRole={isDoctorRole} selectedTherapistId={selectedTherapistId} setSelectedTherapistId={setSelectedTherapistId} therapistsList={therapistsList} therapistsLoading={therapistsLoading} updatePatientMutation={updatePatientMutation} resolvedPatientId={resolvedPatientId} user={user} />}
        {step===1&&<StepVitals vitals={vitals} setVitals={setVitals} />}
        {step===2&&<StepComplaints chiefComplaints={chiefComplaints} setChiefComplaints={setChiefComplaints} associatedSymptoms={associatedSymptoms} setAssociatedSymptoms={setAssociatedSymptoms} complaintsText={complaintsText} setComplaintsText={setComplaintsText} />}
        {step===3&&<StepPainFunction painLevel={painLevel} setPainLevel={setPainLevel} funcRatings={funcRatings} setFuncRatings={setFuncRatings} />}
        {step===4&&<RomMatrix data={romData} onChange={setRomData} />}
        {step===5&&<AnthropometricSection data={anthropometrics} onChange={setAnthropometrics} />}
        {step===6&&<StepHistory selectedMedicalHistory={selectedMedicalHistory} setSelectedMedicalHistory={setSelectedMedicalHistory} otherMedicalHistory={otherMedicalHistory} setOtherMedicalHistory={setOtherMedicalHistory} showOtherMedicalHistory={showOtherMedicalHistory} setShowOtherMedicalHistory={setShowOtherMedicalHistory} />}

        {/* Step 7: Review & Payment */}
        {step===7&&(
          <div className="flex flex-col gap-3">
            <SectionCard icon={<Save size={18} className="text-teal-700 dark:text-teal-400" />} title="Review & Save" accent="teal">
              <FormField label="Visit Type">
                <div className="grid grid-cols-2 gap-2">{['Clinic','Home Visit','IP','Day Care'].map(v=><button key={v} onClick={()=>setVisitType(v as any)} className={`py-2 rounded-xl text-[12px] font-bold border-2 transition-all ${visitType===v?'border-teal-600 bg-teal-50 text-teal-700':'border-slate-100 bg-slate-50/50 text-slate-500'}`}>{v}</button>)}</div>
              </FormField>
              <div className="flex flex-col gap-0">{[
                {l:'Patient',v:patientInfo.name||'—'},{l:'Age',v:patientInfo.age||'—'},{l:'BP',v:vitals.bp_sys&&vitals.bp_dia?`${vitals.bp_sys}/${vitals.bp_dia}`:'—'},
                {l:'Pain',v:`${painLevel}/10`},{l:'Complaints',v:chiefComplaints.length>0?`${chiefComplaints.length} selected`:'—'},{l:'Symptoms',v:associatedSymptoms.length>0?`${associatedSymptoms.length} selected`:'—'},
              ].map(r=><div key={r.l} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"><span className="text-[12px] text-slate-500 font-bold">{r.l}</span><span className="text-[12px] text-slate-900 font-extrabold">{r.v}</span></div>)}</div>
            </SectionCard>
            <SectionCard icon={<CreditCard size={18} className="text-amber-600 dark:text-amber-400" />} title="Payment Details" subtitle="Required to submit" accent="amber">
              <FormField label="Mode of Payment">
                <div className="flex gap-2">{['Cash','UPI'].map(m=><button key={m} onClick={()=>{setPaymentMode(m as any);setSubmitError(null);}} className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border-2 transition-colors ${paymentMode===m?'border-amber-600 bg-amber-50 text-amber-700':'border-slate-200 bg-slate-50 text-slate-500'}`}>{m}</button>)}</div>
              </FormField>
              <FormField label="Bill Amount">
                <div className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border bg-slate-50 ${!paymentMode&&submitError?'border-red-300':'border-slate-200'}`}>
                  <span className="text-[13px] font-bold text-slate-500">₹</span>
                  <input type="text" inputMode="numeric" value={billAmountInput} onChange={e=>handleBillAmountChange(e.target.value)} placeholder="0" className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400" />
                </div>
              </FormField>
            </SectionCard>
            <button onClick={handleSave} disabled={createEvaluation.isPending} className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 text-white text-[15px] font-extrabold shadow-lg disabled:opacity-60" style={{background:'linear-gradient(135deg,#2B7A78,#3AAFA9)'}}>
              {createEvaluation.isPending?<><Loader2 size={18} className="animate-spin" /> Submitting…</>:<><Save size={18} /> Save Assessment</>}
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-4 py-3 shrink-0 flex flex-col gap-2 bg-white border-t border-slate-100 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
        {submitError&&<div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-700 font-bold flex items-center gap-2"><AlertTriangle size={14} />{submitError}</div>}
        <div className="flex gap-3">
          {step>0&&<button onClick={()=>{setSubmitError(null);setStep(step-1);}} className="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl bg-slate-100 text-slate-600 text-sm font-extrabold"><ChevronLeft size={16} />Back</button>}
          {isPhotoUploaded&&step<totalSteps-1&&<button onClick={()=>{setSubmitError(null);setStep(totalSteps-1);}} className="px-3 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-extrabold">Skip to Payment</button>}
          {step<totalSteps-1&&<button onClick={()=>{setSubmitError(null);setStep(step+1);}} className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-xl text-white text-sm font-extrabold" style={{background:'linear-gradient(135deg,#2B7A78,#3AAFA9)'}}>Next<ChevronRight size={16} /></button>}
        </div>
      </div>
      <div className="md:hidden"><BottomNav role={currentRole} /></div>
    </div>
  );
}
