import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { useEvaluation, useLatestEvaluation } from '../../hooks/useEvaluations';
import { usePatient, usePatients } from '../../hooks/usePatients';
import { useExercisePlans } from '../../hooks/useExercisePlans';
import api from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';
import {
  ArrowLeft, Printer, Share2, Download, CheckCircle,
  Activity, Phone, Mail, Dumbbell, Loader2, Search,
} from 'lucide-react';

export function ReportGeneration() {
  const navigate = useNavigate();
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

  const exerciseItems = plansData?.data?.[0]?.items ?? [];
  const isLoading = evalLoading || patientLoading;
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

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
    const shareData = {
      title: `Report – ${patient?.name ?? 'Patient'}`,
      text: `Physiotherapy Assessment Report for ${patient?.name ?? 'Patient'}`,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare?.(shareData)) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
      setAction('share');
      setTimeout(() => setAction(null), 1500);
    } catch {
      // User cancelled or share failed — ignore
    }
  };

  const handleAction = (type: string) => {
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
    setAction(type);
    setTimeout(() => setAction(null), 1500);
  };

  // Parse vitals
  const bp = evaluation?.bp?.split('/');
  const vitals = [
    { label: 'BP', value: evaluation?.bp ?? '—' },
    { label: 'PR', value: evaluation?.pr ? `${evaluation.pr} bpm` : '—' },
    { label: 'SpO₂', value: evaluation?.spo2 ? `${evaluation.spo2}%` : '—' },
    { label: 'Temp', value: evaluation?.temperature ? `${evaluation.temperature}°F` : '—' },
    { label: 'EF', value: evaluation?.ef ? `${evaluation.ef}%` : '—' },
    { label: 'Pain', value: evaluation?.painLevel != null ? `${evaluation.painLevel}/10` : '—' },
  ];

  return (
    <div className="flex flex-col h-full saai-page" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#DEF2F1' }}>
      {/* Header */}
      <div className="px-6 pb-6 shrink-0 rounded-b-3xl relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #2B7A78 0%, #3AAFA9 100%)', paddingTop: '32px', boxShadow: '0 4px 24px rgba(43, 122, 120, 0.15)' }}>
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
              <button key={btn.key} onClick={() => handleAction(btn.key)} disabled={downloading && btn.key === 'pdf'}
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-colors hover:bg-white/20"
                style={{ background: isActive ? 'rgba(254,255,255,0.3)' : 'rgba(254,255,255,0.15)', border: '1px solid rgba(254,255,255,0.2)' }}>
                {downloading && btn.key === 'pdf' ? <Loader2 size={20} color="#FEFFFF" className="animate-spin" /> : isActive ? <CheckCircle size={20} color="#FEFFFF" /> : <Icon size={20} color="#FEFFFF" />}
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
          <div className="rounded-2xl p-8 text-center animate-pulse" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
            <Loader2 size={32} className="animate-spin mx-auto mb-3" color="#3AAFA9" />
            <p style={{ fontSize: '14px', color: '#2B7A78' }}>Loading report data…</p>
          </div>
        )}

        {/* No evaluation selected — show patient picker */}
        {!isLoading && !evaluation && (
          <div className="flex flex-col gap-4">
            {patientIdParam && (
              <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-3">
                <span className="text-sm font-semibold text-amber-700 flex-1">No evaluations found for the selected patient. Please complete an intake first.</span>
                <button onClick={() => setSearchParams({})} className="text-xs font-bold text-amber-600 hover:text-amber-800">Clear</button>
              </div>
            )}
            <div className="rounded-2xl p-6" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
              <div className="text-center mb-5">
                <Activity size={36} color="#DEF2F1" className="mx-auto mb-2" />
                <p style={{ fontSize: '16px', fontWeight: 700, color: '#17252A' }}>Select a patient to generate a report</p>
                <p style={{ fontSize: '13px', color: '#2B7A78', marginTop: '4px' }}>Search by name and click to load their latest evaluation.</p>
              </div>

              {/* Search input */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl mb-4" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                <Search size={16} color="#2B7A78" />
                <input
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  placeholder="Search patients…"
                  className="flex-1 outline-none bg-transparent"
                  style={{ fontSize: '14px', color: '#17252A' }}
                />
              </div>

              {/* Patient list */}
              <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                {patientsList.length === 0 && (
                  <p className="text-center py-6" style={{ fontSize: '13px', color: '#2B7A78' }}>
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
                    className="flex items-center gap-3 p-3 rounded-xl text-left transition-colors hover:bg-slate-50"
                    style={{ border: '1px solid #DEF2F1' }}
                  >
                    <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: '40px', height: '40px', background: '#DEF2F1' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#2B7A78' }}>
                        {p.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#17252A' }} className="truncate">{p.name}</p>
                      <p style={{ fontSize: '12px', color: '#2B7A78' }}>{p.phone} · {p.age} yrs · {p.condition ?? '—'}</p>
                    </div>
                    <span style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 600 }}>{p.displayId}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!isLoading && evaluation && (
          <div className="rounded-2xl overflow-hidden" style={{ background: '#FEFFFF', boxShadow: '0 8px 32px rgba(23, 37, 42, 0.05)', border: '1px solid #DEF2F1' }}>
            {/* Clinic letterhead */}
            <div className="px-6 py-5" style={{ background: 'linear-gradient(135deg, #2B7A78, #3AAFA9)' }}>
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
            <div className="px-6 py-4 flex items-center justify-between" style={{ background: '#FEFFFF', borderBottom: '1px solid #DEF2F1' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#17252A', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Physiotherapy Assessment Report</p>
                <p style={{ fontSize: '12px', color: '#2B7A78', marginTop: '2px' }}>Report ID: {evaluation.displayId}</p>
              </div>
              <div className="text-right">
                <p style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 600 }}>Date:</p>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#17252A' }}>{today}</p>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5 flex flex-col gap-5">
              {/* Patient Info */}
              <section>
                <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1.5px solid #3AAFA9' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#3AAFA9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Patient Information</span>
                </div>
                <div className="grid grid-cols-2 gap-y-3">
                  {[
                    { label: 'Name', value: patient?.name ?? '—' },
                    { label: 'Patient ID', value: patient?.displayId ?? '—' },
                    { label: 'Age / Gender', value: patient ? `${patient.age} yrs / ${patient.gender}` : '—' },
                    { label: 'Phone', value: patient?.phone ?? '—' },
                    { label: 'Referred By', value: evaluation.referredBy ?? 'Self' },
                    { label: 'Status', value: evaluation.status },
                  ].map((item) => (
                    <div key={item.label}>
                      <p style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 600 }}>{item.label}</p>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#17252A' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Vitals */}
              <section>
                <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1.5px solid #2B7A78' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#2B7A78', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Vital Signs</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {vitals.map((v) => (
                    <div key={v.label} className="text-center p-3 rounded-xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                      <p style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 600 }}>{v.label}</p>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#17252A' }}>{v.value}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Diagnosis */}
              {evaluation.diagnosis && (
                <section>
                  <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1.5px solid #17252A' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#17252A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Diagnosis</span>
                  </div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#17252A', lineHeight: 1.6 }}>{evaluation.diagnosis}</p>
                </section>
              )}

              {/* Treatment Plan */}
              {evaluation.plan && (
                <section>
                  <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1.5px solid #3AAFA9' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#3AAFA9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Treatment Plan</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#17252A', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{evaluation.plan}</p>
                </section>
              )}

              {/* Exercise Prescription — from backend */}
              {exerciseItems.length > 0 && (
                <section>
                  <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1.5px solid #2B7A78' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#2B7A78', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Home Exercise Programme</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {exerciseItems.map((ex, i) => (
                      <div key={ex.id} className="flex items-center justify-between py-2" style={{ borderBottom: i < exerciseItems.length - 1 ? '1px dashed #DEF2F1' : 'none' }}>
                        <div className="flex items-center gap-3">
                          <Dumbbell size={14} color="#2B7A78" />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#17252A' }}>{ex.name}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#2B7A78' }}>
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
                  <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1.5px solid #17252A' }}>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: '#17252A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Clinical Notes</span>
                  </div>
                  <p style={{ fontSize: '13px', color: '#2B7A78', lineHeight: 1.7 }}>{evaluation.management}</p>
                </section>
              )}

              {/* Signature */}
              <section className="flex items-end justify-between pt-4 mt-2" style={{ borderTop: '1px solid #DEF2F1' }}>
                <div>
                  <div className="mb-2" style={{ height: '40px', borderBottom: '1px solid #17252A', width: '120px' }}>
                    <span style={{ fontSize: '20px', fontStyle: 'italic', color: '#17252A', fontFamily: 'cursive', fontWeight: 700 }}>
                      {evaluation.createdBy?.name?.split(' ').map(n => n[0]).join('. ') ?? ''}
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: '#17252A' }}>{evaluation.createdBy?.name ?? '—'}</p>
                  <p style={{ fontSize: '11px', color: '#2B7A78', marginTop: '2px' }}>SAAI Physiotherapy</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-center rounded-2xl mb-2" style={{ width: '56px', height: '56px', background: '#DEF2F1', border: '2px solid #DEF2F1', marginLeft: 'auto' }}>
                    <Activity size={24} color="#3AAFA9" />
                  </div>
                  <p style={{ fontSize: '10px', color: '#2B7A78', fontWeight: 600 }}>SAAI Clinic Stamp</p>
                </div>
              </section>

              {/* Footer */}
              <div className="pt-4 text-center mt-2" style={{ borderTop: '1px dashed #DEF2F1' }}>
                <p style={{ fontSize: '10px', color: '#2B7A78' }}>SAAI Physiotherapy Clinic · 42, Health Square, MG Road, Bengaluru – 560001</p>
                <p style={{ fontSize: '10px', color: '#2B7A78', marginTop: '2px' }}>This report is for medical purposes only. Keep it confidential.</p>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons at bottom */}
        {!isLoading && evaluation && (
          <div className="flex gap-3 mt-6 mb-4">
            <button onClick={() => handleAction('pdf')} disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-transform hover:-translate-y-1 disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #2B7A78, #3AAFA9)', color: '#FEFFFF', fontSize: '15px', fontWeight: 700, boxShadow: '0 4px 16px rgba(43, 122, 120, 0.3)' }}>
              {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {downloading ? 'Generating…' : 'Generate PDF'}
            </button>
            <button onClick={() => handleAction('share')} className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl transition-colors" style={{ background: '#FEFFFF', color: '#3AAFA9', fontSize: '15px', fontWeight: 700, border: '1px solid #DEF2F1' }}>
              <Share2 size={18} />
            </button>
            <button onClick={() => handleAction('print')} className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl transition-colors" style={{ background: '#FEFFFF', color: '#2B7A78', fontSize: '15px', fontWeight: 700, border: '1px solid #DEF2F1' }}>
              <Printer size={18} />
            </button>
          </div>
        )}
      </div>

      <div className="md:hidden" style={{ borderTop: '1px solid #DEF2F1', background: '#FEFFFF' }}>
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}