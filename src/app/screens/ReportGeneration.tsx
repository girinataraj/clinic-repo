import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { useEvaluation, useLatestEvaluation, useEvaluations } from '../../hooks/useEvaluations';
import { usePatient, usePatients } from '../../hooks/usePatients';
import { useExercisePlans } from '../../hooks/useExercisePlans';
import api from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';
import {
  ArrowLeft, Printer, Share2, Download, CheckCircle,
  Activity, Phone, Mail, Dumbbell, Loader2, Search,
  Stethoscope, ClipboardList, Scale, CheckSquare
} from 'lucide-react';

export function ReportGeneration() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const evaluationId = searchParams.get('evaluationId') ?? '';
  const patientIdParam = searchParams.get('patientId') ?? '';
  const [action, setAction] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [patientSearch, setPatientSearch] = useState('');

  // ── Patient picker (when no evaluationId provided) ─────────────────────
  const { data: patientsData } = usePatients({
    search: patientSearch.trim() || undefined,
    limit: 10,
  });
  const patientsList = patientsData?.data ?? [];

  // ── Live data ─────────────────────────────────────────────────────────────
  const { data: specificEval, isLoading: specificEvalLoading } = useEvaluation(evaluationId || null);
  const { data: latestEval, isLoading: latestEvalLoading } = useLatestEvaluation(patientIdParam || null);
  
  const evaluation = specificEval || latestEval;
  const evalLoading = specificEvalLoading || latestEvalLoading;

  const { data: patient, isLoading: patientLoading } = usePatient(evaluation?.patientId ?? null);
  const { data: plansData } = useExercisePlans(evaluation?.patientId ?? null);
  
  // Fetch all evaluations to merge clinical history for the report preview
  const { data: allEvalsData } = useEvaluations(evaluation?.patientId ? { patientId: evaluation.patientId } : undefined);
  const allEvaluations = allEvalsData?.data ?? [];

  const exerciseItems = plansData?.data?.[0]?.items ?? [];
  const isLoading = evalLoading || patientLoading;
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  // ── Merged Data Logic ───────────────────────────────────────────────────
  const mergedVitals = useMemo(() => {
    const v: Record<string, any> = {
      bp: evaluation?.bp,
      pr: evaluation?.pr,
      spo2: evaluation?.spo2,
      temperature: evaluation?.temperature,
      ef: evaluation?.ef,
      painLevel: evaluation?.painLevel,
    };
    
    const metrics = ['bp', 'pr', 'spo2', 'temperature', 'ef', 'painLevel'] as const;
    for (const m of metrics) {
      if (v[m] == null || v[m] === '') {
        const found = allEvaluations.find(ev => ev[m] != null && ev[m] !== '');
        if (found) v[m] = found[m];
      }
    }
    return v;
  }, [evaluation, allEvaluations]);

  const mergedChiefComplaints = evaluation?.chiefComplaints || allEvaluations.find(ev => ev.chiefComplaints)?.chiefComplaints;
  const mergedDiagnosis = evaluation?.diagnosis || allEvaluations.find(ev => ev.diagnosis)?.diagnosis;
  const mergedDiagnosisList = evaluation?.diagnosisList || allEvaluations.find(ev => ev.diagnosisList && ev.diagnosisList.length > 0)?.diagnosisList;
  const mergedPlan = evaluation?.plan || allEvaluations.find(ev => ev.plan)?.plan;
  const mergedTreatmentPlan = (evaluation?.treatmentPlan as any) || allEvaluations.find(ev => ev.treatmentPlan && Object.keys(ev.treatmentPlan as any).length > 0)?.treatmentPlan;

  const mergedMedicalHistory = useMemo(() => {
    const history = new Set<string>();
    allEvaluations.forEach(ev => {
      if (ev.medicalHistory) ev.medicalHistory.forEach(h => history.add(h));
    });
    return Array.from(history);
  }, [allEvaluations]);

  const mergedClinicalExamination = useMemo(() => {
    const ce: Record<string, any> = { tests: {}, imaging: {}, examinationNotes: '' };
    const evTests = allEvaluations.find(e => e.clinicalExamination?.tests && Object.keys(e.clinicalExamination.tests).length > 0);
    if (evTests?.clinicalExamination?.tests) ce.tests = evTests.clinicalExamination.tests;
    
    const evImaging = allEvaluations.find(e => e.clinicalExamination?.imaging && Object.keys(e.clinicalExamination.imaging).length > 0);
    if (evImaging?.clinicalExamination?.imaging) ce.imaging = evImaging.clinicalExamination.imaging;
    
    const evNotes = allEvaluations.find(e => e.clinicalExamination?.examinationNotes);
    if (evNotes?.clinicalExamination?.examinationNotes) ce.examinationNotes = evNotes.clinicalExamination.examinationNotes;
    
    return ce;
  }, [allEvaluations]);

  const ROM_CONFIG = useMemo(() => [
    {
      label: 'Upper Limb',
      joints: [
        { label: 'Shoulder', movements: ['Flexion', 'Extension', 'Abduction', 'Adduction'] },
        { label: 'Elbow', movements: ['Flexion', 'Extension'] },
        { label: 'Forearm', movements: ['Supination', 'Pronation'] },
        { label: 'Wrist', movements: ['Flexion', 'Extension'] },
      ],
    },
    {
      label: 'Lower Limb',
      joints: [
        { label: 'Hip', movements: ['Flexion', 'Extension', 'Abduction', 'Adduction'] },
        { label: 'Knee', movements: ['Flexion', 'Extension'] },
        { label: 'Ankle', movements: ['Dorsi Flexion', 'Plantar Flexion', 'Inversion', 'Eversion', 'EHL'] },
      ],
    },
  ], []);

  const getRomKey = (joint: string, movement: string) => {
    const cleanJoint = joint.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanMovement = movement.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${cleanJoint}_${cleanMovement}`;
  };

  const mergedMusclePowerRom = useMemo(() => {
    const ev = allEvaluations.find(e => e.musclePowerRom && Object.keys(e.musclePowerRom).length > 0);
    return ev?.musclePowerRom || null;
  }, [allEvaluations]);

  const romTableRows = useMemo(() => {
    if (!mergedMusclePowerRom) return [];
    const rows: any[] = [];
    ROM_CONFIG.forEach((section) => {
      section.joints.forEach((joint) => {
        joint.movements.forEach((movement) => {
          const key = getRomKey(joint.label, movement);
          const entry = mergedMusclePowerRom[key] as any;
          if (entry && (entry.powerRt || entry.powerLt || entry.romRt || entry.romLt)) {
            rows.push({
              joint: joint.label,
              movement: movement,
              powerRt: entry.powerRt || '—',
              powerLt: entry.powerLt || '—',
              romRt: entry.romRt ? `${entry.romRt}°` : '—',
              romLt: entry.romLt ? `${entry.romLt}°` : '—',
            });
          }
        });
      });
    });
    return rows;
  }, [mergedMusclePowerRom, ROM_CONFIG]);

  const mergedAnthropometrics = useMemo(() => {
    const ev = allEvaluations.find(e => e.anthropometrics && Object.keys(e.anthropometrics).length > 0);
    return ev?.anthropometrics || null;
  }, [allEvaluations]);

  const mergedFunctionalScores = useMemo(() => {
    const ev = allEvaluations.find(e => e.functionalScores && Object.keys(e.functionalScores).length > 0);
    if (!ev?.functionalScores) return [] as Array<{ key: string; value: number }>;
    return Object.entries(ev.functionalScores)
      .map(([key, value]) => {
        const numeric = typeof value === 'number' ? value : Number(value);
        return { key, value: numeric };
      })
      .filter(entry => Number.isFinite(entry.value));
  }, [allEvaluations]);

  const mergedPatientInfo = useMemo(() => {
    return {
      referredBy: evaluation?.referredBy || allEvaluations.find(ev => ev.referredBy)?.referredBy || 'Self',
      visitType: evaluation?.visitType || allEvaluations.find(ev => ev.visitType)?.visitType || 'Clinic',
      paymentMode: evaluation?.paymentMode || allEvaluations.find(ev => ev.paymentMode)?.paymentMode || '—',
      billAmount: evaluation?.billAmount != null ? evaluation.billAmount : (allEvaluations.find(ev => ev.billAmount != null)?.billAmount ?? '—'),
    };
  }, [evaluation, allEvaluations]);

  // ── PDF download via blob ─────────────────────────────────────────────────
  const handleDownloadPdf = async () => {
    const targetEvalId = evaluation?.id;
    if (!targetEvalId) return;
    setDownloading(true);
    try {
      const response = await api.get(ENDPOINTS.REPORTS.PDF(targetEvalId), {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${targetEvalId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setPdfError(null);
      setAction('pdf');
      setTimeout(() => setAction(null), 1500);
    } catch {
      setPdfError('Failed to generate PDF. The report endpoint may not be available yet.');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrintPdf = async () => {
    const targetEvalId = evaluation?.id;
    if (!targetEvalId) return;
    setDownloading(true);
    try {
      const response = await api.get(ENDPOINTS.REPORTS.PDF(targetEvalId), {
        responseType: 'blob',
        headers: { Accept: 'application/pdf' },
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = url;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
      };
      setPdfError(null);
      setAction('print');
      setTimeout(() => setAction(null), 1500);
    } catch {
      setPdfError('Failed to generate PDF for printing.');
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    const targetEvalId = evaluation?.id;
    if (!targetEvalId) return;

    setDownloading(true);
    try {
      const response = await api.get(ENDPOINTS.REPORTS.PDF(targetEvalId), {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const filename = `Report-${patient?.name?.replace(/\s+/g, '-') ?? 'Patient'}-${targetEvalId.substring(0, 8)}.pdf`;
      const file = new File([blob], filename, { type: 'application/pdf' });

      const shareData: any = {
        files: [file],
        title: `Report – ${patient?.name ?? 'Patient'}`,
        text: `Physiotherapy Assessment Report for ${patient?.name ?? 'Patient'}`,
      };

      if (navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to link if file share not supported
        await navigator.share({
          title: shareData.title,
          text: shareData.text,
          url: window.location.href,
        });
      }
      setAction('share');
      setTimeout(() => setAction(null), 1500);
    } catch (err) {
      // Fallback to clipboard if share fails entirely
      try {
        await navigator.clipboard.writeText(window.location.href);
        setAction('share');
        setTimeout(() => setAction(null), 1500);
      } catch (e) {
        console.error('Share failed', e);
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleAction = (type: string) => {
    setAction(type);
    if (type === 'pdf') {
      handleDownloadPdf();
      return;
    }
    if (type === 'print') {
      handlePrintPdf();
      return;
    }
    if (type === 'share') {
      handleShare();
      return;
    }
    setTimeout(() => setAction(null), 1500);
  };

  // Parse vitals
  const vitals = [
    { label: 'BP', value: mergedVitals.bp ?? '—' },
    { label: 'PR', value: mergedVitals.pr ? `${mergedVitals.pr} bpm` : '—' },
    { label: 'SpO₂', value: mergedVitals.spo2 ? `${mergedVitals.spo2}%` : '—' },
    { label: 'Temp', value: mergedVitals.temperature ? `${mergedVitals.temperature}°F` : '—' },
    { label: 'EF', value: mergedVitals.ef ? `${mergedVitals.ef}%` : '—' },
    { label: 'Pain', value: mergedVitals.painLevel != null ? `${mergedVitals.painLevel}/10` : '—' },
  ];

  return (
    <div className="flex flex-col h-full saai-page font-sans bg-[#E8E9F1] dark:bg-slate-950">
      {/* Header */}
      <div className="px-6 pb-6 shrink-0 rounded-b-3xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #262842 0%, #3B3E66 100%)', paddingTop: '32px', boxShadow: '0 4px 24px rgba(38, 40, 66, 0.15)' }}>
        <div className="absolute -right-16 -top-16 rounded-full opacity-10" style={{ width: '200px', height: '200px', background: '#FEFFFF' }} />
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20" style={{ width: '40px', height: '40px', background: 'rgba(254,255,255,0.15)' }}>
            <ArrowLeft size={20} color="#FEFFFF" />
          </button>
          <div className="flex-1">
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#FEFFFF' }}>Report Generation</h1>
            <p style={{ fontSize: '13px', color: 'rgba(254,255,255,0.8)' }}>Physiotherapy Assessment Report</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 relative z-10">
          {[
            { label: 'Generate PDF', icon: Download, key: 'pdf' },
            { label: 'Print', icon: Printer, key: 'print' },
            { label: 'Share', icon: Share2, key: 'share' },
          ].map((btn) => {
            const Icon = btn.icon;
            const isActive = action === btn.key;
            return (
              <button key={btn.key} onClick={() => handleAction(btn.key)} disabled={downloading}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-colors hover:bg-white/20 disabled:opacity-50"
                style={{ background: isActive ? 'rgba(254,255,255,0.3)' : 'rgba(254,255,255,0.15)', border: '1px solid rgba(254,255,255,0.2)' }}>
                {downloading && (action === btn.key || (btn.key === 'pdf' && !action)) ? (
                  <Loader2 size={20} color="#FEFFFF" className="animate-spin" />
                ) : isActive ? (
                  <CheckCircle size={20} color="#FEFFFF" />
                ) : (
                  <Icon size={20} color="#FEFFFF" />
                )}
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#FEFFFF' }}>{isActive ? 'Done!' : btn.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report document */}
      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-3xl mx-auto w-full">

        {/* PDF download error */}
        {pdfError && (
          <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
            <span className="text-sm font-semibold text-red-700 flex-1">{pdfError}</span>
            <button onClick={() => setPdfError(null)} className="text-xs font-bold text-red-500 hover:text-red-700">Dismiss</button>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="rounded-2xl p-8 text-center animate-pulse bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800">
            <Loader2 size={32} className="animate-spin mx-auto mb-3" color="#3B3E66" />
            <p style={{ fontSize: '14px', color: '#262842' }}>Loading report data…</p>
          </div>
        )}

        {/* No evaluation selected — show patient picker */}
        {!isLoading && !evaluation && (
          <div className="flex flex-col gap-4">
            {patientIdParam && (
              <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                <span className="text-sm font-semibold text-amber-700 flex-1">No evaluations found for the selected patient. Please complete an assessment first.</span>
                <button onClick={() => setSearchParams({})} className="text-xs font-bold text-amber-600 hover:text-amber-800">Clear</button>
              </div>
            )}
            <div className="rounded-2xl p-6 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800">
              <div className="text-center mb-5">
                <Activity size={36} color="#E8E9F1" className="mx-auto mb-2" />
                <p className="text-[16px] font-bold text-[#17252A] dark:text-white">Select a patient to generate a report</p>
                <p className="text-[13px] text-[#262842] dark:text-slate-400 mt-1">Search by name and click to load their latest evaluation.</p>
              </div>

              {/* Search input */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800">
                <Search size={16} color="#262842" />
                <input
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Search patients…"
                  className="flex-1 outline-none bg-transparent text-[14px] text-[#17252A] dark:text-white"
                />
              </div>

              {/* Patient list */}
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                {patientsList.length === 0 && (
                  <p className="text-center py-6 text-[13px] text-[#262842] dark:text-slate-400">
                    {patientSearch ? 'No patients found.' : 'Type to search patients.'}
                  </p>
                )}
                {patientsList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      // Navigate to the patient report page by setting patientId param
                      setSearchParams({ patientId: p.id });
                    }}
                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-slate-50 border border-[#E8E9F1] dark:border-slate-800"
                  >
                    <div className="rounded-xl flex items-center justify-center shrink-0 w-10 h-10 bg-[#E8E9F1] dark:bg-slate-800">
                      <span className="text-[14px] font-bold text-[#262842] dark:text-slate-200">
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-semibold text-[#17252A] dark:text-white truncate">{p.name}</p>
                      <p className="text-[12px] text-[#262842] dark:text-slate-400">{p.phone} · {p.age} yrs · {p.condition ?? '—'}</p>
                    </div>
                    <span className="text-[11px] font-semibold text-[#262842] dark:text-slate-400">{p.displayId}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isLoading && evaluation && (
          <div className="rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl dark:shadow-none border border-[#E8E9F1] dark:border-slate-800">
            {/* Clinic letterhead */}
            <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, #262842, #3B3E66)' }}>
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center rounded-2xl shrink-0" style={{ width: '48px', height: '48px', background: 'rgba(254,255,255,0.2)' }}>
                  <Activity size={24} color="#FEFFFF" />
                </div>
                <div>
                  <p style={{ fontSize: '16px', fontWeight: 800, color: '#FEFFFF', letterSpacing: '-0.3px' }}>SAAI Physiotherapy Clinic</p>
                  <p style={{ fontSize: '12px', color: 'rgba(254,255,255,0.8)' }}>Advanced Sports & Orthopedic Rehabilitation</p>
                </div>
              </div>
              <div className="flex gap-4 mt-4">
                {[{ icon: Phone, text: '+91 98765 43210' }, { icon: Mail, text: 'info@saai.clinic' }].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.text} className="flex items-center gap-1.5">
                      <Icon size={12} color="rgba(254,255,255,0.8)" />
                      <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(254,255,255,0.9)' }}>{item.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Report title */}
            <div className="px-6 py-4 flex items-center justify-between bg-white dark:bg-slate-900 border-b border-[#E8E9F1] dark:border-slate-800">
              <div>
                <p className="text-[14px] font-extrabold text-[#17252A] dark:text-white tracking-wide uppercase">Physiotherapy Assessment Report</p>
                <p className="text-[12px] text-[#262842] dark:text-slate-400 mt-[2px]">Report ID: {evaluation.displayId}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-[#262842] dark:text-slate-400">Date:</p>
                <p className="text-[13px] font-bold text-[#17252A] dark:text-white">{today}</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 flex flex-col gap-5">
              {/* Patient Info */}
              <section>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b-[1.5px] border-[#3B3E66] dark:border-slate-600">
                  <span className="text-[12px] font-extrabold text-[#3B3E66] dark:text-slate-300 uppercase tracking-wide">Patient Information</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3">
                  {[
                    { label: 'Name', value: patient?.name ?? '—' },
                    { label: 'Patient ID', value: patient?.displayId ?? '—' },
                    { label: 'Age / Gender', value: patient ? `${patient.age} yrs / ${patient.gender}` : '—' },
                    { label: 'Phone', value: patient?.phone ?? '—' },
                    { label: 'Referred By', value: mergedPatientInfo.referredBy },
                    { label: 'Visit Type', value: mergedPatientInfo.visitType },
                    { label: 'Payment Mode', value: mergedPatientInfo.paymentMode },
                    { label: 'Bill Amount', value: typeof mergedPatientInfo.billAmount === 'number' ? `₹${mergedPatientInfo.billAmount.toLocaleString('en-IN')}` : mergedPatientInfo.billAmount },
                    { label: 'Status', value: evaluation.status },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-[11px] font-semibold text-[#262842] dark:text-slate-400">{item.label}</p>
                      <p className="text-[13px] font-semibold text-[#17252A] dark:text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Vitals */}
              <section>
                <div className="flex items-center gap-2 mb-3 pb-2 border-b-[1.5px] border-[#262842] dark:border-slate-600">
                  <span className="text-[12px] font-extrabold text-[#262842] dark:text-slate-300 uppercase tracking-wide">Vital Signs</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {vitals.map((v) => (
                    <div key={v.label} className="text-center p-3 rounded-xl bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800">
                      <p className="text-[11px] font-semibold text-[#262842] dark:text-slate-400">{v.label}</p>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#17252A' }}>{v.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Chief Complaints */}
              {mergedChiefComplaints && (
                <section>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-[1.5px] border-[#262842] dark:border-slate-600">
                    <span className="text-[12px] font-extrabold text-[#262842] dark:text-slate-300 uppercase tracking-wide">Chief Complaints</span>
                  </div>
                  <p className="text-[13px] text-[#17252A] dark:text-slate-200 leading-relaxed">{mergedChiefComplaints}</p>
                </section>
              )}

              {/* Medical History */}
              {mergedMedicalHistory.length > 0 && (
                <section className="bg-slate-50/30 dark:bg-slate-900/10 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <ClipboardList size={16} className="text-[#3B3E66] dark:text-slate-350" />
                    <span className="text-[12px] font-extrabold text-[#3B3E66] dark:text-slate-300 uppercase tracking-wide">Medical History</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mergedMedicalHistory.map((h) => (
                      <span key={h} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[12px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-700 shadow-sm">
                        {h}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {/* Clinical Examination */}
              {((mergedClinicalExamination.tests && Object.keys(mergedClinicalExamination.tests).length > 0) || 
                (mergedClinicalExamination.imaging && Object.keys(mergedClinicalExamination.imaging).length > 0) || 
                mergedClinicalExamination.examinationNotes) && (
                <section className="bg-slate-50/30 dark:bg-slate-900/10 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <Stethoscope size={16} className="text-[#3B3E66] dark:text-slate-350" />
                    <span className="text-[12px] font-extrabold text-[#3B3E66] dark:text-slate-300 uppercase tracking-wide">Clinical Examination</span>
                  </div>
                  <div className="flex flex-col gap-4 text-xs font-semibold">
                    {mergedClinicalExamination.tests && Object.keys(mergedClinicalExamination.tests).length > 0 && (
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold mb-2">Special Physical Tests</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {Object.entries(mergedClinicalExamination.tests).map(([key, value]: [string, any]) => {
                            const result = value?.result ?? 'Not Tested';
                            const isPositive = result === 'Positive';
                            const isNegative = result === 'Negative';
                            return (
                              <div key={key} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950/40">
                                <span className="text-slate-700 dark:text-slate-300 truncate max-w-[130px] font-bold">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span className={`px-2 py-0.5 rounded text-[10px] font-black ${isPositive ? 'bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400' : isNegative ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{result}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {mergedClinicalExamination.imaging && Object.keys(mergedClinicalExamination.imaging).length > 0 && (
                      <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold mb-2">Imaging Reports (X-Ray & MRI)</span>
                        <div className="flex flex-col gap-2">
                          {Object.entries(mergedClinicalExamination.imaging).map(([region, findings]: [string, any]) => {
                            if (!findings.xray?.trim() && !findings.mri?.trim()) return null;
                            return (
                              <div key={region} className="p-3 rounded-xl bg-amber-50/10 dark:bg-amber-955/5 border border-amber-100/30 dark:border-amber-900/10 flex flex-col gap-1.5 shadow-sm">
                                <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase">{region} Imaging</span>
                                {findings.xray?.trim() && <p className="text-slate-700 dark:text-slate-300 font-medium"><strong className="text-slate-450 uppercase text-[9px] block">X-Ray:</strong> {findings.xray}</p>}
                                {findings.mri?.trim() && <p className="text-slate-700 dark:text-slate-300 font-medium"><strong className="text-slate-450 uppercase text-[9px] block">MRI:</strong> {findings.mri}</p>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {mergedClinicalExamination.examinationNotes && (
                      <div className="mt-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase block font-bold mb-1">Additional Physical Notes</span>
                        <p className="p-3 bg-white dark:bg-slate-955/40 text-slate-750 dark:text-slate-300 rounded-xl whitespace-pre-wrap font-medium border border-slate-150 dark:border-slate-800">{mergedClinicalExamination.examinationNotes}</p>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Range of Motion & Muscle Power */}
              {romTableRows.length > 0 && (
                <section className="bg-slate-50/30 dark:bg-slate-900/10 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <Activity size={16} className="text-[#3B3E66] dark:text-slate-355" />
                    <span className="text-[12px] font-extrabold text-[#3B3E66] dark:text-slate-300 uppercase tracking-wide">Muscle Power & ROM</span>
                  </div>
                  <div className="overflow-hidden rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm">
                    <div className="overflow-x-auto max-h-96">
                      <table className="w-full border-collapse text-left text-xs font-semibold">
                        <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                          <tr className="border-b border-slate-200 dark:border-slate-800">
                            <th className="px-3 py-2 text-slate-800 dark:text-slate-200">Joint</th>
                            <th className="px-3 py-2 text-slate-800 dark:text-slate-200">Movement</th>
                            <th className="px-2 py-2 text-center text-slate-800 dark:text-slate-200">Power Rt</th>
                            <th className="px-2 py-2 text-center text-slate-800 dark:text-slate-200">Power Lt</th>
                            <th className="px-2 py-2 text-center text-slate-800 dark:text-slate-200">ROM Rt</th>
                            <th className="px-2 py-2 text-center text-slate-800 dark:text-slate-200">ROM Lt</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                          {romTableRows.map((row, index) => (
                            <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                              <td className="px-3 py-2 font-bold text-slate-800 dark:text-slate-200">{row.joint}</td>
                              <td className="px-3 py-2 text-slate-600 dark:text-slate-400 uppercase text-[9px]">{row.movement}</td>
                              <td className="px-2 py-2 text-center font-extrabold text-slate-950 dark:text-white">{row.powerRt}</td>
                              <td className="px-2 py-2 text-center font-extrabold text-slate-950 dark:text-white">{row.powerLt}</td>
                              <td className="px-2 py-2 text-center font-extrabold text-slate-950 dark:text-white">{row.romRt}</td>
                              <td className="px-2 py-2 text-center font-extrabold text-slate-950 dark:text-white">{row.romLt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              )}

              {/* Anthropometrics */}
              {mergedAnthropometrics && Object.keys(mergedAnthropometrics).length > 0 && (
                <section className="bg-slate-50/30 dark:bg-slate-900/10 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <Scale size={16} className="text-[#3B3E66] dark:text-slate-350" />
                    <span className="text-[12px] font-extrabold text-[#3B3E66] dark:text-slate-300 uppercase tracking-wide">Anthropometrics</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-semibold">
                    {mergedAnthropometrics.height && (
                      <div className="p-2.5 bg-white dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm">
                        <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Height</span>
                        <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{mergedAnthropometrics.height} cm</span>
                      </div>
                    )}
                    {mergedAnthropometrics.weight && (
                      <div className="p-2.5 bg-white dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm">
                        <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Weight</span>
                        <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{mergedAnthropometrics.weight} kg</span>
                      </div>
                    )}
                    {mergedAnthropometrics.bmi && (
                      <div className="p-2.5 bg-white dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm">
                        <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">BMI</span>
                        <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{mergedAnthropometrics.bmi}</span>
                      </div>
                    )}
                    {mergedAnthropometrics.waist && (
                      <div className="p-2.5 bg-white dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm">
                        <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Waist</span>
                        <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{mergedAnthropometrics.waist} cm</span>
                      </div>
                    )}
                    {mergedAnthropometrics.hip && (
                      <div className="p-2.5 bg-white dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800 shadow-sm">
                        <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Hip</span>
                        <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{mergedAnthropometrics.hip} cm</span>
                      </div>
                    )}
                    {mergedAnthropometrics.whRatio && (
                      <div className="p-2.5 bg-white dark:bg-slate-950/40 rounded-xl border border-slate-155 dark:border-slate-800 shadow-sm">
                        <span className="text-[10px] text-slate-400 block mb-0.5 font-bold">Waist-to-Hip Ratio</span>
                        <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{mergedAnthropometrics.whRatio}</span>
                      </div>
                    )}
                    {(mergedAnthropometrics.chestInspiration || mergedAnthropometrics.chestExpiration) && (
                      <div className="p-2.5 bg-white dark:bg-slate-950/40 rounded-xl border border-slate-150 dark:border-slate-800 col-span-2 sm:col-span-3 shadow-sm">
                        <span className="text-[10px] text-slate-400 block mb-1 font-bold">Chest Measurements</span>
                        <div className="flex gap-4">
                          <div>
                            <span className="text-[9px] text-slate-450 block uppercase font-bold">Inspiration</span>
                            <span className="text-slate-850 dark:text-slate-200 font-extrabold">{mergedAnthropometrics.chestInspiration || '—'} cm</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-450 block uppercase font-bold">Expiration</span>
                            <span className="text-slate-850 dark:text-slate-200 font-extrabold">{mergedAnthropometrics.chestExpiration || '—'} cm</span>
                          </div>
                          <div>
                            <span className="text-[9px] text-slate-455 block uppercase font-bold text-teal-650 dark:text-teal-400">Expansion</span>
                            <span className="text-teal-750 dark:text-teal-400 font-black">{mergedAnthropometrics.chestExpansion || '—'} cm</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
              )}

              {/* Functional Limitations */}
              {mergedFunctionalScores.length > 0 && (
                <section className="bg-slate-50/30 dark:bg-slate-900/10 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
                    <CheckSquare size={16} className="text-[#3B3E66] dark:text-slate-350" />
                    <span className="text-[12px] font-extrabold text-[#3B3E66] dark:text-slate-300 uppercase tracking-wide">Functional Limitations</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {mergedFunctionalScores.map(({ key, value }) => {
                      const labels: Record<number, string> = { 0: 'Normal', 1: 'Mild', 2: 'Moderate', 3: 'Severe', 4: 'Unable' };
                      const colors: Record<number, string> = { 
                        0: 'text-green-600 bg-green-50 border-green-100 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900', 
                        1: 'text-yellow-650 bg-yellow-50 border-yellow-100 dark:bg-yellow-950/20 dark:text-yellow-400 dark:border-yellow-900', 
                        2: 'text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900', 
                        3: 'text-red-500 bg-red-50 border-red-100 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900', 
                        4: 'text-red-700 bg-red-100 border-red-200 dark:bg-red-950/40 dark:text-red-305 dark:border-red-800' 
                      };
                      return (
                        <div key={key} className="flex items-center justify-between py-1.5 border-b last:border-0 border-slate-100 dark:border-slate-800 font-semibold text-xs">
                          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300 capitalize">{key === 'stairs' ? 'Climbing Stairs' : key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black border ${colors[value] || 'text-slate-600 bg-slate-50 border-slate-100'}`}>{value} - {labels[value] || 'Recorded'}</span>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Treatment Plan */}
              {(mergedPlan || mergedTreatmentPlan) && (
                <section>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-[1.5px] border-[#3B3E66] dark:border-slate-600">
                    <span className="text-[12px] font-extrabold text-[#3B3E66] dark:text-slate-300 uppercase tracking-wide">Treatment Plan</span>
                  </div>
                  {mergedPlan && <p className="text-[13px] text-[#17252A] dark:text-slate-200 leading-relaxed whitespace-pre-wrap mb-4">{mergedPlan}</p>}
                  
                  {mergedTreatmentPlan && (
                    <div className="grid grid-cols-1 gap-4">
                      {mergedTreatmentPlan.modalities?.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Modalities</p>
                          <div className="flex flex-wrap gap-2">
                            {mergedTreatmentPlan.modalities.map((m: string) => (
                              <span key={m} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[12px] font-bold text-[#3B3E66] dark:text-slate-300 border border-slate-100 dark:border-slate-700 shadow-sm">{m}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {mergedTreatmentPlan.manualTherapy?.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Manual Therapy</p>
                          <div className="flex flex-wrap gap-2">
                            {mergedTreatmentPlan.manualTherapy.map((m: string) => (
                              <span key={m} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[12px] font-bold text-[#3B3E66] dark:text-slate-300 border border-slate-100 dark:border-slate-700 shadow-sm">{m}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {mergedTreatmentPlan.rehabilitation?.length > 0 && (
                        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2">Rehabilitation</p>
                          <div className="flex flex-wrap gap-2">
                            {mergedTreatmentPlan.rehabilitation.map((m: string) => (
                              <span key={m} className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 text-[12px] font-bold text-[#3B3E66] dark:text-slate-300 border border-slate-100 dark:border-slate-700 shadow-sm">{m}</span>
                            ))}
                          </div>
                        </div>
                      )}
                      {mergedTreatmentPlan.visitsRequired && (
                        <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900/50">
                          <span className="text-[13px] font-bold text-indigo-700 dark:text-indigo-300">Total Visits Required</span>
                          <span className="text-[16px] font-black text-indigo-900 dark:text-white">{mergedTreatmentPlan.visitsRequired}</span>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              )}

              {/* Diagnosis */}
              {(mergedDiagnosis || (mergedDiagnosisList && mergedDiagnosisList.length > 0)) && (
                <section>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-[1.5px] border-[#17252A] dark:border-slate-600">
                    <span className="text-[12px] font-extrabold text-[#17252A] dark:text-slate-300 uppercase tracking-wide">Diagnosis</span>
                  </div>
                  {mergedDiagnosis && <p className="text-[14px] font-semibold text-[#17252A] dark:text-slate-200 leading-relaxed mb-2">{mergedDiagnosis}</p>}
                  {mergedDiagnosisList && mergedDiagnosisList.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {mergedDiagnosisList.map((d: string) => (
                        <span key={d} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[12px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {d}
                        </span>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* Exercise Prescription — from backend */}
              {exerciseItems.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-[1.5px] border-[#262842] dark:border-slate-600">
                    <span className="text-[12px] font-extrabold text-[#262842] dark:text-slate-300 uppercase tracking-wide">Home Exercise Programme</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {exerciseItems.map((ex, i) => (
                      <div key={ex.id} className={`flex items-center justify-between py-2 ${i < exerciseItems.length - 1 ? "border-b border-dashed border-[#E8E9F1] dark:border-slate-700" : ""}`}>
                        <div className="flex items-center gap-3">
                          <Dumbbell size={14} color="#262842" />
                          <span className="text-[13px] font-semibold text-[#17252A] dark:text-white">{ex.name}</span>
                        </div>
                        <span className="text-[12px] text-[#262842] dark:text-slate-400">
                          {ex.sets && ex.reps ? `${ex.sets} × ${ex.reps} reps` : ex.duration ?? ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Clinical Notes */}
              {evaluation.management && (
                <section>
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b-[1.5px] border-[#17252A] dark:border-slate-600">
                    <span className="text-[12px] font-extrabold text-[#17252A] dark:text-slate-300 uppercase tracking-wide">Clinical Notes</span>
                  </div>
                  <p className="text-[13px] text-[#262842] dark:text-slate-300 leading-relaxed">{evaluation.management}</p>
                </section>
              )}

              {/* Signature */}
              <section className="flex items-end justify-between pt-4 mt-2 border-t border-[#E8E9F1] dark:border-slate-800">
                <div>
                  <div className="mb-2 h-10 border-b border-[#17252A] dark:border-slate-600 w-[120px]">
                    <span className="text-[20px] italic font-bold text-[#17252A] dark:text-slate-300 font-serif">
                      {evaluation.createdBy?.name?.split(' ').map(n => n[0]).join('. ') ?? ''}
                    </span>
                  </div>
                  <p className="text-[12px] font-bold text-[#17252A] dark:text-white">{evaluation.createdBy?.name ?? '—'}</p>
                  <p style={{ fontSize: '11px', color: '#262842', marginTop: '2px' }}>SAAI Physiotherapy</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-center rounded-2xl mb-2 w-14 h-14 bg-[#E8E9F1] dark:bg-slate-800 border-2 border-[#E8E9F1] dark:border-slate-700 ml-auto">
                    <Activity size={24} color="#3B3E66" />
                  </div>
                  <p className="text-[10px] font-semibold text-[#262842] dark:text-slate-400">SAAI Clinic Stamp</p>
                </div>
              </section>

              {/* Footer */}
              <div className="pt-4 text-center mt-2 border-t border-dashed border-[#E8E9F1] dark:border-slate-700">
                <p className="text-[10px] text-[#262842] dark:text-slate-500">SAAI Physiotherapy Clinic · 42, Health Square, MG Road, Bengaluru – 560001</p>
                <p className="text-[10px] text-[#262842] dark:text-slate-500 mt-[2px]">This report is for medical purposes only. Keep it confidential.</p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons at bottom */}
        {!isLoading && evaluation && (
          <div className="flex gap-3 mt-6 mb-4">
            <button onClick={() => handleAction('pdf')} disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-transform hover:-translate-y-1 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #262842, #3B3E66)', color: '#FEFFFF', fontSize: '15px', fontWeight: 700, boxShadow: '0 4px 16px rgba(38, 40, 66, 0.3)' }}>
              {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {downloading ? 'Generating…' : 'Generate PDF'}
            </button>
            <button onClick={() => handleAction('share')} className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl transition-colors bg-white dark:bg-slate-800 text-[#3B3E66] dark:text-teal-400 text-[15px] font-bold border border-[#E8E9F1] dark:border-slate-700">
              <Share2 size={18} />
            </button>
            <button onClick={() => handleAction('print')} className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl transition-colors bg-white dark:bg-slate-800 text-[#262842] dark:text-white text-[15px] font-bold border border-[#E8E9F1] dark:border-slate-700">
              <Printer size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="md:hidden border-t border-[#E8E9F1] dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav role={user?.role || 'doctor'} />
      </div>
    </div>
  );
}