import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { usePatients, usePatient } from '../../hooks/usePatients';
import { useLatestEvaluation, useCreateEvaluation } from '../../hooks/useEvaluations';
import { useTreatments } from '../../hooks/useTreatments';
import {
  Search,
  User,
  Calendar,
  Clock,
  CheckCircle,
  Save,
  Loader2,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
  FileText,
  DollarSign,
  CreditCard,
  ClipboardList,
} from 'lucide-react';

export function FollowUpPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentRole = user?.role === 'doctor' ? 'doctor' : 'nurse';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Search patients
  const { data: patientsData, isLoading: searchingPatients } = usePatients({
    search: searchQuery.trim() || undefined,
    limit: 15,
  });
  const patientsList = patientsData?.data ?? [];

  // Selected Patient Details
  const { data: patient, isLoading: loadingPatient } = usePatient(selectedPatientId);
  const { data: latestEval } = useLatestEvaluation(selectedPatientId);
  const { data: treatmentsList = [] } = useTreatments();
  const createEvaluation = useCreateEvaluation();

  // Follow Up Form State
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [followUpNotes, setFollowUpNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | ''>('');
  const [billAmount, setBillAmount] = useState<number | null>(null);
  const [billAmountInput, setBillAmountInput] = useState('');
  const [isManualBillEdit, setIsManualBillEdit] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Auto calculate bill total based on selected treatments
  const autoBillTotal = useMemo(() => {
    const matched = treatmentsList.filter((t: any) => selectedTreatments.includes(t.treatmentName));
    return matched.reduce((sum: number, t: any) => sum + (t.charge || 0), 0);
  }, [treatmentsList, selectedTreatments]);

  // Auto fill date/time string
  const currentDateTime = useMemo(() => {
    return new Date().toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }, []);

  // Extract previous treatment plan items
  const previousPlanItems = useMemo(() => {
    if (!latestEval?.treatmentPlan) return [];
    const tp = latestEval.treatmentPlan as any;
    const items: string[] = [];
    if (Array.isArray(tp.modalities)) items.push(...tp.modalities);
    if (Array.isArray(tp.manualTherapy)) items.push(...tp.manualTherapy);
    if (Array.isArray(tp.rehabilitation)) items.push(...tp.rehabilitation);
    return items;
  }, [latestEval]);

  // Handle patient selection
  const handleSelectPatient = (pId: string) => {
    setSelectedPatientId(pId);
    setSelectedTreatments([]);
    setFollowUpNotes('');
    setPaymentMode('');
    setBillAmount(null);
    setBillAmountInput('');
    setIsManualBillEdit(false);
    setSubmitError(null);
    setSavedSuccess(false);
  };

  const toggleTreatment = (tName: string) => {
    setSelectedTreatments(prev =>
      prev.includes(tName) ? prev.filter(x => x !== tName) : [...prev, tName]
    );
  };

  const handleBillAmountChange = (v: string) => {
    setSubmitError(null);
    setIsManualBillEdit(true);
    const d = v.replace(/[^\d]/g, '');
    if (!d) {
      setBillAmount(0);
      setBillAmountInput('');
      return;
    }
    const n = Number(d);
    setBillAmount(n);
    setBillAmountInput(String(n));
  };

  const resetBillToAuto = () => {
    setIsManualBillEdit(false);
    setBillAmount(null);
    setBillAmountInput('');
  };

  const handleSubmitFollowUp = async () => {
    setSubmitError(null);
    if (!selectedPatientId) {
      setSubmitError('Please select a patient.');
      return;
    }
    if (!paymentMode) {
      setSubmitError('Please select a payment mode.');
      return;
    }

    const finalBillAmount = isManualBillEdit
      ? (billAmount !== null ? billAmount : 0)
      : (billAmount !== null ? billAmount : autoBillTotal);

    setSubmitting(true);
    try {
      await createEvaluation.mutateAsync({
        patientId: selectedPatientId,
        status: 'submitted',
        paymentMode,
        billAmount: finalBillAmount,
        visitType: 'Clinic',
        plan: followUpNotes.trim() || undefined,
        treatmentPlan: {
          modalities: selectedTreatments,
          followUpNotes: followUpNotes.trim() || undefined,
          dateRecorded: new Date().toISOString(),
        },
        followUpPlan: followUpNotes.trim() || 'Regular Follow Up Treatment Session',
      } as any);

      setSavedSuccess(true);
      setSubmitting(false);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || 'Failed to record follow up.');
      setSubmitting(false);
    }
  };

  const accentColor = currentRole === 'doctor' ? 'text-[#262842]' : 'text-teal-700';
  const accentBg = currentRole === 'doctor' ? 'bg-[#262842]/10' : 'bg-teal-50 dark:bg-teal-950/20';

  if (savedSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
        <div className="bg-white dark:bg-slate-900 rounded-[28px] border border-slate-200 dark:border-slate-800 p-8 max-w-md w-full text-center shadow-xl flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
            <CheckCircle size={36} />
          </div>
          <h2 className="text-xl font-black text-slate-850 dark:text-white mb-2">
            Follow Up Recorded!
          </h2>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Follow-up treatment session, date/time, and notes have been successfully added to patient details and history.
          </p>
          <button
            onClick={() => {
              setSelectedPatientId(null);
              setSavedSuccess(false);
            }}
            className="w-full py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-[0.98]"
          >
            Record Another Follow Up
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto font-sans">
      {/* Top Header */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {selectedPatientId && (
            <button
              onClick={() => setSelectedPatientId(null)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft size={16} className="text-slate-600 dark:text-slate-350" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-black text-slate-850 dark:text-white leading-none mb-1 flex items-center gap-2">
              <RefreshCw size={18} className="text-teal-600" /> Follow Ups & Regular Treatment
            </h1>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {selectedPatientId ? 'Record follow-up treatment plan, autofilled date & notes' : 'Lookup patient file by Display ID, Phone, or Name'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="flex-1 p-6 max-w-4xl w-full mx-auto flex flex-col gap-6">
        {!selectedPatientId ? (
          /* SEARCH PANEL */
          <div className="flex flex-col gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-150 dark:border-slate-800 p-6 shadow-sm">
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-[18px] border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-inner">
                <Search size={18} className="text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Lookup patient by Display ID (e.g. SAAI-2026-001), Phone, or Name..."
                  className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Patient Search Results */}
            {searchingPatients ? (
              <div className="flex flex-col items-center py-12">
                <Loader2 size={28} className="animate-spin text-teal-600 mb-2" />
                <p className="text-sm font-semibold text-slate-500">Searching records...</p>
              </div>
            ) : searchQuery.trim() === '' ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-150 dark:border-slate-800 p-6 text-slate-400">
                <Search size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">Search for a patient to record follow up treatment</p>
              </div>
            ) : patientsList.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-150 dark:border-slate-800 p-6 text-slate-400">
                <User size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">No patient found matching "{searchQuery}"</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {patientsList.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPatient(p.id)}
                    className="p-4 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-150 dark:border-slate-800 hover:border-teal-500 transition-all text-left flex items-center justify-between group shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-2xl ${accentBg} flex items-center justify-center`}>
                        <User size={20} className={accentColor} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-extrabold text-slate-850 dark:text-white group-hover:text-teal-600 transition-colors">
                            {p.name}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350">
                            {p.displayId}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-400">
                          {p.age} yrs · {p.gender} · {p.phone}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* FOLLOW UP FORM */
          <div className="flex flex-col gap-6">
            {/* Patient Header Card */}
            {loadingPatient ? (
              <div className="h-28 bg-white dark:bg-slate-900 rounded-[24px] animate-pulse"></div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-150 dark:border-slate-800 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-[16px] ${accentBg} flex items-center justify-center`}>
                    <User size={22} className={accentColor} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h2 className="text-lg font-black text-slate-850 dark:text-white">{patient?.name}</h2>
                      <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350">
                        {patient?.displayId}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-400">
                      {patient?.age} yrs · {patient?.gender} · {patient?.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border border-teal-100 dark:border-teal-900/40 text-xs font-bold">
                  <Clock size={14} />
                  <span>Session Date/Time: <strong>{currentDateTime}</strong></span>
                </div>
              </div>
            )}

            {/* Main Form Section */}
            <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-150 dark:border-slate-800 p-6 shadow-sm flex flex-col gap-6">
              {submitError && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  {submitError}
                </div>
              )}

              {/* 1. Date Time Autofilled Display */}
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Autofilled Date & Time
                </label>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 font-bold text-sm">
                  <Calendar size={16} className="text-teal-600" />
                  <span>{currentDateTime}</span>
                </div>
              </div>

              {/* 2. Previous Treatment Plan Quick Select */}
              {previousPlanItems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      Repeat Previous Treatment Modalities
                    </label>
                    <button
                      type="button"
                      onClick={() => setSelectedTreatments(previousPlanItems)}
                      className="text-[11px] font-bold text-teal-600 hover:underline"
                    >
                      Select All Previous
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {previousPlanItems.map(item => {
                      const isSelected = selectedTreatments.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleTreatment(item)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500'
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. Treatment Selection */}
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-2">
                  Select Treatments / Modalities Done
                </label>
                <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  {treatmentsList.map((t: any) => {
                    const tName = t.treatmentName;
                    const isSelected = selectedTreatments.includes(tName);
                    return (
                      <button
                        key={t.id || tName}
                        type="button"
                        onClick={() => toggleTreatment(tName)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                          isSelected
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-teal-500'
                        }`}
                      >
                        {tName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Follow Up Notes Input */}
              <div>
                <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1.5">
                  Follow Up Notes & Progress Remarks *
                </label>
                <textarea
                  value={followUpNotes}
                  onChange={e => setFollowUpNotes(e.target.value)}
                  placeholder="Enter follow-up observations, progress notes, pain changes, or specific treatment details..."
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-medium text-slate-800 dark:text-white outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 h-28 resize-none shadow-inner"
                />
              </div>

              {/* 5. Payment Details */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex flex-col gap-4">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <CreditCard size={14} className="text-amber-500" /> Payment & Billing Details
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1.5">
                      Mode of Payment *
                    </label>
                    <div className="flex gap-2">
                      {['Cash', 'UPI'].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => { setPaymentMode(m as any); setSubmitError(null); }}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-colors ${
                            paymentMode === m
                              ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-[10px] font-bold uppercase text-slate-400">
                        Bill Amount (₹)
                      </label>
                      {isManualBillEdit && (
                        <button
                          type="button"
                          onClick={resetBillToAuto}
                          className="text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
                        >
                          Reset to auto
                        </button>
                      )}
                    </div>
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus-within:border-teal-500">
                      <span className="text-xs font-extrabold text-slate-400">₹</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={isManualBillEdit ? billAmountInput : (autoBillTotal > 0 ? String(autoBillTotal) : '0')}
                        onChange={e => handleBillAmountChange(e.target.value)}
                        placeholder="0"
                        className="flex-1 bg-transparent text-sm font-extrabold text-slate-900 dark:text-white outline-none"
                      />
                    </div>
                    <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold mt-1">
                      {isManualBillEdit
                        ? (billAmount === 0 ? 'Amount manually set to ₹0.' : 'Manually edited amount.')
                        : (autoBillTotal > 0 ? `Auto-calculated from ${selectedTreatments.length} selected treatment(s). You can edit manually.` : 'Select treatments above to auto-fill amount, or enter manually.')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmitFollowUp}
                disabled={submitting}
                className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-black text-sm shadow-lg shadow-teal-600/20 disabled:opacity-60 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                {submitting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" /> Saving Follow Up...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Update Patient History with Follow Up
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
