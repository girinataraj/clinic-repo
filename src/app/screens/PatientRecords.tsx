import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { useEvaluations } from '../../hooks/useEvaluations';
import type { Evaluation } from '../../types';
import { FileText, Download, Activity, Calendar, ArrowLeft, Search, Filter, Heart, Sliders, CheckCircle } from 'lucide-react';
import api from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';

const painColors = [
  '#22c55e', '#84cc16', '#a3e635', '#facc15', '#fb923c',
  '#f97316', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
];

const typeColorMap: Record<string, { bg: string; color: string }> = {
  submitted: { bg: 'bg-blue-50 dark:bg-blue-900/30', color: 'text-blue-600 dark:text-blue-400' },
  reviewed:  { bg: 'bg-teal-50 dark:bg-teal-900/30', color: 'text-teal-600 dark:text-teal-400' },
  draft:     { bg: 'bg-purple-50 dark:bg-purple-900/30', color: 'text-purple-600 dark:text-purple-400' },
};

export function PatientRecords() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const patientId = user?.patient_id;
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // ── Live data ─────────────────────────────────────────────────────────────
  const { data: evalData, isLoading } = useEvaluations({ patientId, limit: 20 });
  const evaluations = evalData?.data ?? [];

  const filtered = evaluations.filter((e) => {
    const matchesSearch = !search.trim() ||
      (e.diagnosis ?? '').toLowerCase().includes(search.toLowerCase()) ||
      (e.chiefComplaints ?? '').toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const [selectedRecord, setSelectedRecord] = useState<Evaluation | null>(null);

  const handleDownload = async (recordId?: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const id = recordId ?? selectedRecord?.id;
    if (!id) return;

    try {
      const response = await api.get(ENDPOINTS.REPORTS.PDF(id), {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const pName = (selectedRecord?.patient_name || 'Patient').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
      const pId = selectedRecord?.patient_display_id || selectedRecord?.patientId || 'ID';
      link.setAttribute('download', `Patient_Report_${pName}_${pId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF:', err);
    }
  };

  // ── Detail View ───────────────────────────────────────────────────────────
  if (selectedRecord) {
    const bp = selectedRecord.bp?.split('/');
    const pain = selectedRecord.painLevel ?? 0;
    const symptoms = selectedRecord.associatedSymptoms ?? [];

    return (
      <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans print:bg-white">
        {/* Detail View Header */}
        <div
          className="px-6 pt-8 pb-6 shrink-0 relative overflow-hidden print:hidden bg-gradient-to-br from-blue-900 to-blue-600 dark:from-slate-900 dark:to-slate-800"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedRecord(null)}
                className="flex items-center justify-center p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  {selectedRecord.diagnosis ?? selectedRecord.chiefComplaints ?? 'Evaluation'}
                </h1>
                <p className="text-xs text-blue-100 mt-0.5 font-medium">
                  {new Date(selectedRecord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} • {selectedRecord.createdBy?.name ?? 'Staff'}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => handleDownload(undefined, e)}
              className="flex items-center gap-2 p-2.5 px-4 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 shadow-sm transition-colors"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </div>

        {/* Print Only Header */}
        <div className="hidden print:block text-center py-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-slate-900">{selectedRecord.diagnosis ?? 'Evaluation'}</h1>
          <p className="text-slate-500 mt-1">{new Date(selectedRecord.createdAt).toLocaleDateString('en-IN')}</p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full print:px-0">
          {/* Vitals */}
          <div className="p-5 rounded-2xl print:shadow-none print:border bg-white dark:bg-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none border border-transparent dark:border-slate-700">
            <div className="flex items-center gap-2 mb-5">
              <div className="rounded-xl flex items-center justify-center print:border print:border-rose-100 bg-rose-50 dark:bg-rose-900/20 w-9 h-9">
                <Heart size={18} className="text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-[16px] font-extrabold text-slate-900 dark:text-white">Vital Signs</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {bp && (
                <div className="col-span-2 md:col-span-3 mb-1">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">Blood Pressure (mmHg)</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-200 dark:border-slate-600 text-center text-sm font-bold text-slate-800 dark:text-white">{bp[0]} <span className="text-slate-400 text-xs ml-1 font-semibold">Systolic</span></div>
                    <span className="text-slate-400 font-bold">/</span>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-200 dark:border-slate-600 text-center text-sm font-bold text-slate-800 dark:text-white">{bp[1]} <span className="text-slate-400 text-xs ml-1 font-semibold">Diastolic</span></div>
                  </div>
                </div>
              )}
              {[
                { label: 'Pulse Rate (bpm)', val: selectedRecord.pr, icon: '💓' },
                { label: 'SpO₂ (%)', val: selectedRecord.spo2, icon: '🫁' },
                { label: 'Temperature (°F)', val: selectedRecord.temperature, icon: '🌡️' },
                { label: 'Ejection Fraction (%)', val: selectedRecord.ef, icon: '❤️' },
              ].filter(v => v.val != null).map(v => (
                <div key={v.label}>
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">{v.icon} {v.label}</p>
                  <div className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl border border-slate-200 dark:border-slate-600 text-sm font-bold text-slate-800 dark:text-white">{v.val}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          {symptoms.length > 0 && (
            <div className="p-5 rounded-2xl print:shadow-none print:border bg-white dark:bg-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none border border-transparent dark:border-slate-700">
              <div className="flex items-center gap-2 mb-5">
                <div className="rounded-xl flex items-center justify-center print:border print:border-blue-100 bg-blue-50 dark:bg-blue-900/30 w-9 h-9">
                  <Activity size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-[16px] font-extrabold text-slate-900 dark:text-white">Symptoms</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{symptoms.length} items recorded</p>
                </div>
              </div>
              <div className="flex flex-col gap-2.5">
                {symptoms.map(s => (
                  <div key={s} className="flex items-center gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-xl">
                    <div className="rounded-lg w-5 h-5 flex items-center justify-center bg-blue-600 shrink-0">
                      <CheckCircle size={12} color="white" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-bold text-blue-900 dark:text-blue-100">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pain Scale */}
          <div className="p-5 rounded-2xl print:shadow-none print:border bg-white dark:bg-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none border border-transparent dark:border-slate-700">
            <div className="flex items-center gap-2 mb-6">
              <div className="rounded-xl flex items-center justify-center print:border print:border-orange-100 bg-orange-50 dark:bg-orange-900/30 w-9 h-9">
                <Sliders size={18} className="text-orange-500 dark:text-orange-400" />
              </div>
              <h2 className="text-[16px] font-extrabold text-slate-900 dark:text-white">VAS Scale</h2>
            </div>
            <div className="flex flex-col items-center">
              <div className="rounded-full flex items-center justify-center mb-3" style={{ width: '100px', height: '100px', background: `${painColors[pain]}20` }}>
                <div className="rounded-full flex items-center justify-center print:border-4" style={{ width: '80px', height: '80px', background: painColors[pain], borderColor: painColors[pain] }}>
                  <span style={{ fontSize: '32px', fontWeight: 900, color: 'white' }}>{pain}</span>
                </div>
              </div>
              <p style={{ fontSize: '18px', fontWeight: 800, color: painColors[pain] }}>
                {pain === 0 ? 'No Pain' : pain <= 3 ? 'Mild Pain' : pain <= 6 ? 'Moderate Pain' : 'Severe Pain'}
              </p>
            </div>
          </div>

          {/* Chief Complaints */}
          {selectedRecord.chiefComplaints && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none border border-transparent dark:border-slate-700">
              <h2 className="text-[16px] font-extrabold text-slate-900 dark:text-white mb-2">Chief Complaints</h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{selectedRecord.chiefComplaints}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── List View ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      {/* Header */}
      <div
        className="px-6 pt-8 pb-10 shrink-0 relative overflow-hidden bg-gradient-to-br from-blue-900 to-blue-600 dark:from-slate-900 dark:to-slate-800"
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/patient')}
              className="flex items-center justify-center p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-sm">Medical Records</h1>
              <p className="text-sm text-blue-100 mt-0.5 font-medium">View and download your reports</p>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-blue-200" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all backdrop-blur-sm"
                placeholder="Search records..."
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center justify-center p-2.5 border border-white/20 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm ${showFilters ? 'bg-white/25' : 'bg-white/10'}`}
              >
                <Filter className="h-5 w-5 text-white" />
              </button>
              {showFilters && (
                <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-50 overflow-hidden">
                  {['all', 'draft', 'submitted', 'reviewed'].map((s) => (
                    <button
                      key={s}
                      onClick={() => { setStatusFilter(s); setShowFilters(false); }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-bold capitalize transition-colors ${
                        statusFilter === s ? 'bg-blue-50 text-blue-700 dark:bg-slate-700 dark:text-blue-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {s === 'all' ? 'All Records' : s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-6">
        <div className="max-w-5xl mx-auto space-y-4">

          {/* Loading skeleton */}
          {isLoading && Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm animate-pulse">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-600 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {!isLoading && filtered.length === 0 && (
            <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
              <FileText className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No records found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Your evaluation records will appear here</p>
            </div>
          )}

          {/* Records list */}
          {!isLoading && filtered.map((record) => {
            const tc = typeColorMap[record.status] ?? typeColorMap.draft;
            return (
              <div
                key={record.id}
                onClick={() => setSelectedRecord(record)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all group cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${tc.bg}`}>
                    <FileText className={`w-6 h-6 ${tc.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-[15px] font-bold text-slate-900 dark:text-white truncate pr-4">
                        {record.diagnosis ?? record.chiefComplaints ?? 'Evaluation'}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${tc.bg} ${tc.color}`}>
                        {record.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2.5">{record.createdBy?.name ?? 'Staff'}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">
                          {new Date(record.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                        <Activity className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold capitalize">{record.status}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDownload(record.id, e)}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })}

          {!isLoading && filtered.length > 0 && (
            <div className="text-center mt-8 pb-4">
              <p className="text-xs font-semibold text-slate-400">Showing all {filtered.length} records</p>
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav role="patient" />
      </div>
    </div>
  );
}
