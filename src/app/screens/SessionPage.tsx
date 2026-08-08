import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { usePatient, useCheckoutPatient } from '../../hooks/usePatients';
import { useExercisePlans } from '../../hooks/useExercisePlans';
import { useCreateEvaluation, useLatestEvaluation } from '../../hooks/useEvaluations';
import { useTreatments } from '../../hooks/useTreatments';
import { FollowUpSection } from './FollowUpSection';
import {
  type FollowUpSessionData,
  getEmptyFollowUp,
} from './assessment/clinicalConfig';
import {
  ArrowLeft,
  CheckCircle,
  ClipboardList,
  CreditCard,
  CheckSquare,
  AlertTriangle,
  Loader2
} from 'lucide-react';

export function SessionPage() {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentRole = (user?.role === 'doctor' ? 'doctor' : 'nurse') as 'nurse' | 'doctor';

  const { data: patient, isLoading: loadingPatient } = usePatient(patientId);
  const { data: plansData, isLoading: loadingPlans } = useExercisePlans(patientId);
  const { data: latestEvaluation } = useLatestEvaluation(patientId);
  const { data: treatments = [] } = useTreatments();
  const checkoutPatient = useCheckoutPatient();
  const createEvaluation = useCreateEvaluation();

  const [paymentMode, setPaymentMode] = useState<'Cash'|'UPI'|''>('');
  const [billAmount, setBillAmount] = useState<number|null>(null);
  const [billAmountInput, setBillAmountInput] = useState('');
  const [submitError, setSubmitError] = useState<string|null>(null);
  const [checkedOut, setCheckedOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followUp, setFollowUp] = useState<FollowUpSessionData>(getEmptyFollowUp());

  const formatRupees = (n: number) => new Intl.NumberFormat('en-IN').format(n);
  const handleBillAmountChange = (v: string) => {
    setSubmitError(null);
    const d = v.replace(/[^\d]/g, '');
    if (!d) {
      setBillAmount(null);
      setBillAmountInput('');
      return;
    }
    const n = Number(d);
    setBillAmount(n);
    setBillAmountInput(formatRupees(n));
  };

  const handleTakeAssessment = () => {
    if (!patientId) return;
    navigate(`/${currentRole}/intake?patientId=${patientId}`);
  };

  const handleCheckout = async () => {
    if (!patientId || isSubmitting || checkoutPatient.isPending || createEvaluation.isPending) return;
    setIsSubmitting(true);
    setSubmitError(null);

    // If payment details exist, create an evaluation record for the revenue
    if (billAmount && billAmount > 0) {
      if (!paymentMode) {
        setSubmitError('Please select a mode of payment.');
        setIsSubmitting(false);
        return;
      }
      try {
        // Build follow-up payload
        const followUpPayload = (followUp.followUpModes.length > 0 || !!followUp.notes?.trim()) ? {
          followUpModes: followUp.followUpModes,
          sameAsTodayPreview: followUp.followUpModes.includes('same_as_today') && latestEvaluation?.treatmentPlan
            ? latestEvaluation.treatmentPlan
            : undefined,
          assignedExerciseSelection: followUp.followUpModes.includes('assigned_exercise') && exercises.length > 0
            ? exercises.map((ex: any) => ex.name || ex.title)
            : undefined,
          otherTreatments: followUp.otherTreatments.length > 0 ? followUp.otherTreatments : undefined,
          notes: followUp.notes?.trim() || undefined,
        } : undefined;

        await createEvaluation.mutateAsync({
          patientId,
          status: 'submitted',
          paymentMode,
          billAmount,
          ...(followUpPayload ? { followUpSession: followUpPayload } : {}),
        } as any);
      } catch (err: any) {
        setSubmitError(err?.response?.data?.message ?? 'Failed to save payment details.');
        setIsSubmitting(false);
        return;
      }
    } else if (paymentMode && (!billAmount || billAmount <= 0)) {
       setSubmitError('Please enter a valid bill amount.');
       setIsSubmitting(false);
       return;
    }

    try {
      await checkoutPatient.mutateAsync(patientId);
      setCheckedOut(true);
      setTimeout(() => navigate(`/${currentRole}`), 2000);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? 'Failed to checkout session.');
      setIsSubmitting(false);
    }
  };

  if (checkedOut) {
    return (
      <div className="h-full flex flex-col items-center justify-center" style={{ background: '#DEF2F1' }}>
        <div className="flex flex-col items-center p-8 rounded-3xl mx-6 bg-white shadow-xl border border-slate-100">
          <div className="rounded-full flex items-center justify-center mb-4 w-20 h-20 bg-emerald-50">
            <CheckCircle className="w-11 h-11 text-emerald-500" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 text-center">Session Checked Out!</h2>
          <p className="text-[13px] text-slate-500 text-center mt-2">Patient's session is complete and count updated.</p>
        </div>
      </div>
    );
  }

  const exercises = plansData?.data?.[0]?.items ?? [];
  const previousTreatmentPlan = (latestEvaluation as any)?.treatmentPlan ?? null;

  return (
    <div className="flex flex-col h-full bg-slate-50/50 font-sans">
      {/* Header */}
      <div className="px-5 pt-5 pb-5 shrink-0 bg-gradient-to-br from-teal-700 to-teal-600">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate(`/${currentRole}`)}
            className="flex items-center justify-center rounded-xl w-9 h-9 bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <div>
            <h1 className="text-[18px] font-extrabold text-white">Active Session</h1>
            {loadingPatient ? (
              <p className="text-[12px] text-white/70 font-medium">Loading...</p>
            ) : (
              <p className="text-[12px] text-white/70 font-medium">
                {patient?.name} · {patient?.displayId}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full">
        {submitError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-[12px] text-red-700 font-bold flex items-center gap-2">
            <AlertTriangle size={14} />
            {submitError}
          </div>
        )}

        {/* Action: Take Assessment */}
        <div className="mb-4">
          <button
            onClick={handleTakeAssessment}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white border border-slate-200 shadow-sm text-teal-700 font-extrabold text-[14px] hover:bg-teal-50 hover:border-teal-200 transition-all"
          >
            <ClipboardList size={18} />
            Take Assessment
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-1.5 font-semibold">
            Assessment is optional for follow-up visits
          </p>
        </div>

        {/* Assigned Exercises */}
        <div className="mb-4 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="flex items-center gap-1.5 text-[14px] font-extrabold text-slate-900 mb-3">
            <CheckSquare size={16} className="text-slate-400" />
            Assigned Exercises
          </h3>
          {loadingPlans ? (
            <p className="text-[12px] text-slate-500">Loading exercises...</p>
          ) : exercises.length > 0 ? (
            <div className="flex flex-col gap-2">
              {exercises.map((ex: any, idx: number) => (
                <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                   <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />
                   <div>
                     <p className="text-[13px] font-bold text-slate-800">{ex.name || ex.title}</p>
                     {ex.sets && ex.reps && (
                        <p className="text-[11px] text-slate-500 font-semibold">{ex.sets} sets × {ex.reps} reps</p>
                     )}
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-slate-500 italic">No exercises assigned to this patient.</p>
          )}
        </div>

        {/* Follow-up Treatment Section */}
        <div className="mb-4">
          <FollowUpSection
            followUp={followUp}
            onChange={setFollowUp}
            previousTreatmentPlan={previousTreatmentPlan}
            exercises={exercises}
            allTreatments={treatments}
          />
        </div>

        {/* Payment Form */}
        <div className="mb-6 bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <h3 className="flex items-center gap-1.5 text-[14px] font-extrabold text-slate-900 mb-1">
            <CreditCard size={16} className="text-amber-500" />
            Payment Details
          </h3>
          <p className="text-[11px] text-slate-400 mb-4 font-semibold">Record payment if applicable for this session.</p>

          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Mode of Payment</label>
              <div className="flex gap-2">
                {['Cash', 'UPI'].map(m => (
                  <button
                    key={m}
                    onClick={() => { setPaymentMode(m as any); setSubmitError(null); }}
                    className={`flex-1 py-2.5 rounded-xl text-[13px] font-bold border-2 transition-colors ${
                      paymentMode === m ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            <div>
               <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Bill Amount</label>
               <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50">
                  <span className="text-[13px] font-bold text-slate-500">₹</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={billAmountInput}
                    onChange={e => handleBillAmountChange(e.target.value)}
                    placeholder="0"
                    className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400"
                  />
               </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleCheckout}
          disabled={isSubmitting || checkoutPatient.isPending || createEvaluation.isPending}
          className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-white text-[15px] font-extrabold shadow-lg disabled:opacity-60 transition-all"
          style={{ background: 'linear-gradient(135deg, #0f766e, #14b8a6)' }}
        >
          {checkoutPatient.isPending || createEvaluation.isPending ? (
            <><Loader2 size={18} className="animate-spin" /> Processing...</>
          ) : (
            <>Checkout</>
          )}
        </button>
      </div>

      <div className="md:hidden">
        <BottomNav role={currentRole} />
      </div>
    </div>
  );
}

