import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { usePatients, usePatient } from '../../hooks/usePatients';
import { ROM_CONFIG, getRomKey } from './assessment/clinicalConfig';
import { EvaluationSummaryReport } from '../components/EvaluationSummaryReport';
import { VitalSignsTable, SymptomChecklist, ClinicalExaminationTable } from './assessment/AssessmentTableDisplay';
import api from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';
import {
  Search,
  User,
  Heart,
  ChevronDown,
  ChevronUp,
  FileText,
  Activity,
  ArrowLeft,
  Calendar,
  DollarSign,
  UserCog,
  Stethoscope,
  Info,
  Scale,
  Award,
  AlertCircle,
  Clock,
  CreditCard,
  FileDown,
  Printer,
  Download,
  Loader2,
  Trash,
  FileUp,
  ClipboardList,
  Dumbbell,
} from 'lucide-react';

const SYMPTOM_LABELS: Record<string, string> = {
  hang_arm: 'Difficulty hanging arm',
  pain_over: 'Pain over joint/area',
  glass_water: 'Difficulty holding a glass of water',
  numbness_over: 'Numbness over joint/area',
  pain_increased: 'Pain increased during movement',
  pain_radiating: 'Pain radiating down limb',
  weakness_sense: 'Sense of weakness in muscles'
};

interface RomEntry {
  romRt?: string;
  romLt?: string;
  powerRt?: string;
  powerLt?: string;
}

export function PatientHistorySearch() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isDoctorRole = user?.role === 'doctor';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [expandedEvalId, setExpandedEvalId] = useState<string | null>(null);

  // Timeline Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timelineSearch, setTimelineSearch] = useState('');
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [timelineError, setTimelineError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedPatientId) {
      setTimelineLoading(true);
      setTimelineError(null);
      api.get(`/patients/${selectedPatientId}/timeline`)
        .then(res => {
          setTimelineData(res.data.data);
          setTimelineLoading(false);
        })
        .catch(err => {
          setTimelineError(err?.response?.data?.message || 'Failed to load timeline.');
          setTimelineLoading(false);
        });
    }
  }, [selectedPatientId]);

  const filteredTimeline = useMemo(() => {
    let result = [...timelineData];

    // Date range filter
    if (startDate) {
      const startMs = new Date(startDate).getTime();
      result = result.filter(item => new Date(item.date).getTime() >= startMs);
    }
    if (endDate) {
      const endMs = new Date(endDate + 'T23:59:59').getTime();
      result = result.filter(item => new Date(item.date).getTime() <= endMs);
    }

    // Text search query filter
    if (timelineSearch.trim()) {
      const query = timelineSearch.toLowerCase();
      result = result.filter(item => {
        const textToMatch = [
          item.type,
          item.status,
          item.displayId,
          item.therapistName,
          item.reason,
          item.notes,
          item.diagnosis,
          item.chiefComplaints,
          item.fileName,
        ].filter(Boolean).join(' ').toLowerCase();
        
        return textToMatch.includes(query);
      });
    }

    return result;
  }, [timelineData, startDate, endDate, timelineSearch]);

  const handleDownloadAssessmentPdf = async (evId: string, displayId: string) => {
    try {
      const response = await api.get(ENDPOINTS.REPORTS.PDF(evId), {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Assessment_${displayId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert('Failed to download assessment PDF.');
    }
  };

  const handleDownloadAssessmentModulePdf = async (patId: string, assId: string) => {
    try {
      const response = await api.get(`/assessments/${patId}/download`, {
        params: { assessmentId: assId },
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Assessment_Report_${assId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert('Failed to download assessment PDF.');
    }
  };


  // Accent colors based on roles
  const accentColor = isDoctorRole ? 'text-[#262842]' : 'text-teal-700';
  const accentBg = isDoctorRole ? 'bg-[#262842]/10' : 'bg-teal-50 dark:bg-teal-950/20';
  const accentBorder = isDoctorRole ? 'border-[#262842]/20' : 'border-teal-100 dark:border-teal-900/40';
  const badgeColor = isDoctorRole ? 'bg-[#262842] text-white' : 'bg-teal-700 text-white';

  // Search patients
  const { data: patientsData, isLoading: searchingPatients } = usePatients({
    search: searchQuery.trim() || undefined,
    limit: 15,
  });
  const patientsList = patientsData?.data ?? [];

  // Fetch full details of selected patient
  const { data: patient, isLoading: loadingPatient } = usePatient(selectedPatientId);

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    setExpandedEvalId(null);
    setStartDate('');
    setEndDate('');
    setTimelineSearch('');
  };

  const handleBackToSearch = () => {
    setSelectedPatientId(null);
    setExpandedEvalId(null);
  };

  // Helper to get pain level details
  const getPainLevelInfo = (level: number | undefined) => {
    if (level === undefined || level === null) return { text: 'N/A', color: 'text-slate-400 bg-slate-100' };
    if (level <= 3) return { text: 'Mild', color: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40' };
    if (level <= 6) return { text: 'Moderate', color: 'text-amber-700 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40' };
    return { text: 'Severe', color: 'text-rose-700 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40' };
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="shrink-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {selectedPatientId && (
            <button
              onClick={handleBackToSearch}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <ArrowLeft size={16} className="text-slate-600 dark:text-slate-350" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-black text-slate-850 dark:text-white leading-none mb-1">
              Patient History Search
            </h1>
            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {selectedPatientId ? 'Intake Records & Previous Examinations' : 'Lookup patient file by Display ID, Phone, or Name'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 flex flex-col gap-6 max-w-5xl w-full mx-auto">
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
                  placeholder="Enter Display ID (e.g. SAAI-2026-001), Phone number, or Name..."
                  className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* SEARCH RESULTS */}
            {searchingPatients ? (
              <div className="flex flex-col items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Searching records...</p>
              </div>
            ) : searchQuery.trim() === '' ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-150 dark:border-slate-800 p-6 text-slate-400 dark:text-slate-500">
                <Search size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">Type to start searching patient database</p>
                <p className="text-xs mt-1">Search results will match display ID, name, phone, or condition.</p>
              </div>
            ) : patientsList.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-150 dark:border-slate-800 p-6 text-slate-400 dark:text-slate-500">
                <Info size={36} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-bold">No patients found</p>
                <p className="text-xs mt-1">Double check spelling or format of Display ID / Phone.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {patientsList.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPatient(p.id)}
                    className="flex flex-col text-left p-5 bg-white dark:bg-slate-900 rounded-[20px] border border-slate-150 dark:border-slate-800 hover:border-primary dark:hover:border-primary hover:shadow-md transition-all active:scale-[0.99] group"
                  >
                    <div className="flex items-start justify-between w-full mb-3">
                      <div>
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350">
                          {p.displayId}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-800 dark:text-white mt-2 group-hover:text-primary transition-colors">
                          {p.name}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                        p.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                        p.status === 'in-session' ? 'bg-blue-105 text-blue-800' : 'bg-amber-105 text-amber-800'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs font-semibold text-slate-500 dark:text-slate-400 mt-auto border-t border-slate-100 dark:border-slate-800/60 pt-3">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide block mb-0.5">Phone</span>
                        <span className="text-slate-700 dark:text-slate-300 font-extrabold">{p.phone}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide block mb-0.5">Age / Gender</span>
                        <span className="text-slate-700 dark:text-slate-300 font-extrabold">{p.age} yrs / {p.gender}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wide block mb-0.5">Condition</span>
                        <span className="text-slate-700 dark:text-slate-300 font-extrabold truncate block">{p.condition || '—'}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* PATIENT FILE RETRIEVED */
          <div className="flex flex-col gap-6">
            {/* Patient Header Card */}
            {loadingPatient ? (
              <div className="animate-pulse bg-white dark:bg-slate-900 h-32 rounded-[24px] border border-slate-200 dark:border-slate-850"></div>
            ) : !patient ? (
              <div className="p-6 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-[24px] flex items-center gap-3">
                <AlertCircle size={20} />
                <p className="font-bold">Failed to load patient record details.</p>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-150 dark:border-slate-800 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-[18px] ${accentBg} flex items-center justify-center`}>
                    <User size={24} className={accentColor} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-black text-slate-850 dark:text-white">{patient.name}</h2>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-355">
                        {patient.displayId}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                      {patient.age} yrs · {patient.gender} · {patient.city || 'Erode'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-850 pt-4 md:pt-0 md:pl-6 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Phone</span>
                    <span className="text-slate-800 dark:text-slate-200 font-extrabold">{patient.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Visit Count</span>
                    <span className="text-slate-800 dark:text-slate-200 font-extrabold">{patient.sessionCount ?? 0} sessions</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Assigned Therapist</span>
                    <span className="text-slate-800 dark:text-slate-200 font-extrabold truncate max-w-[120px] block">
                      {patient.therapistName || 'None'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Longitudinal Timeline Section */}
            <div>
              {/* Date Filters & Search Input */}
              <div className="bg-white dark:bg-slate-900 p-4 rounded-[22px] border border-slate-150 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between mb-6 animate-in fade-in">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-500 uppercase">From</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={e => setStartDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-xs text-slate-800 dark:text-white font-bold"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-500 uppercase">To</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={e => setEndDate(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 outline-none text-xs text-slate-800 dark:text-white font-bold"
                    />
                  </div>
                  {(startDate || endDate) && (
                    <button
                      onClick={() => { setStartDate(''); setEndDate(''); }}
                      className="text-xs font-black text-rose-600 hover:text-rose-700 active:scale-95 transition-all flex items-center gap-1"
                    >
                      Clear Dates
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-primary w-full md:w-64 transition-all">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    type="text"
                    value={timelineSearch}
                    onChange={e => setTimelineSearch(e.target.value)}
                    placeholder="Search logs..."
                    className="bg-transparent outline-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400 w-full font-medium"
                  />
                  {timelineSearch && (
                    <button onClick={() => setTimelineSearch('')} className="text-[10px] font-black text-slate-450 uppercase">Clear</button>
                  )}
                </div>
              </div>

              <h3 className="text-[13px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 mb-4 flex items-center gap-2">
                <Calendar size={13} /> Longitudinal Patient Timeline History
              </h3>

              {timelineLoading ? (
                <div className="flex flex-col items-center py-12">
                  <Loader2 size={32} className="animate-spin text-primary mb-3" />
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-405">Compiling longitudinal timeline logs...</p>
                </div>
              ) : timelineError ? (
                <div className="p-6 text-center bg-rose-50 dark:bg-rose-950/20 rounded-[24px] border border-rose-200 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 font-bold flex items-center justify-center gap-3">
                  <AlertCircle size={20} />
                  {timelineError}
                </div>
              ) : filteredTimeline.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-150 dark:border-slate-800 p-6 text-slate-400 dark:text-slate-500 animate-in fade-in">
                  <FileText size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold">No timeline logs found matching filters</p>
                  <p className="text-xs mt-1">Try resetting the date range or search query string filters.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 relative pl-4 border-l-2 border-slate-200 dark:border-slate-850 ml-3 py-1">
                  {filteredTimeline.map((item) => {
                    const dateFormatted = new Date(item.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    // ───── CASE 1: ASSESSMENT EVENT ─────
                    if (item.type === 'assessment') {
                      const isExpanded = expandedEvalId === item.id;
                      const painInfo = getPainLevelInfo(item.painLevel);

                      return (
                        <div
                          key={item.id}
                          className={`bg-white dark:bg-slate-900 rounded-[20px] border transition-all overflow-hidden shadow-sm relative ${
                            isExpanded ? 'border-primary ring-1 ring-primary/20' : 'border-slate-150 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                          }`}
                        >
                          {/* Timeline dot */}
                          <div className="absolute -left-[21px] top-6 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 bg-blue-600 shadow-sm" />

                          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 text-left">
                            <button
                              onClick={() => setExpandedEvalId(isExpanded ? null : item.id)}
                              className="flex items-start gap-3 flex-1 text-left"
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                                isExpanded ? badgeColor : 'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400'
                              }`}>
                                v{item.version || 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="text-[14px] font-black text-slate-800 dark:text-white">
                                    Assessment {item.displayId}
                                  </h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                                    item.status === 'submitted' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600 dark:text-slate-350 dark:bg-slate-800'
                                  }`}>
                                    {item.status}
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  {dateFormatted} · Clinician: <span className="font-bold text-slate-700 dark:text-slate-300">{item.therapistName || '—'}</span>
                                </p>
                              </div>
                            </button>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              {item.painLevel !== undefined && item.painLevel !== null && (
                                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${painInfo.color}`}>
                                  <Activity size={12} /> Pain: {item.painLevel}/10
                                </div>
                              )}
                              <button
                                onClick={() => handleDownloadAssessmentPdf(item.id, item.displayId)}
                                className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-350 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
                                title="Download Report PDF"
                              >
                                <Download size={14} />
                              </button>
                              <button
                                onClick={() => setExpandedEvalId(isExpanded ? null : item.id)}
                                className="p-2 text-slate-400"
                              >
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </button>
                            </div>
                          </div>

                          {/* Collapsible Details */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-6 flex flex-col gap-6">
                              {/* 1. Registration & General Information */}
                              <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 p-5 shadow-inner">
                                <h5 className="text-[11px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                                  <User size={14} className="text-slate-500" /> Patient Demographics & Intake Information
                                </h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Patient Full Name</span>
                                    <span className="text-slate-850 dark:text-slate-200 font-extrabold text-sm">{patient?.name || '—'}</span>
                                  </div>
                                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Age & Gender</span>
                                    <span className="text-slate-850 dark:text-slate-200 font-extrabold text-sm">{patient?.age} Yrs / {patient?.gender}</span>
                                  </div>
                                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Assigned Therapist</span>
                                    <span className="text-slate-850 dark:text-slate-200 font-extrabold text-sm">{item.therapistName || 'None Assigned'}</span>
                                  </div>
                                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Visit Details</span>
                                    <span className="text-slate-850 dark:text-slate-200 font-extrabold text-sm">
                                      {item.visitType || 'Clinic'} {item.referredBy ? `(Ref: ${item.referredBy})` : ''}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Reusable Clinical Report Blocks */}
                              <EvaluationSummaryReport evaluation={item} isDoctorRole={item.doctor_role === 'doctor'} />


                              {/* 8. Billing & Payment logs */}
                              {item.billAmount !== null && (
                                <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 p-5 shadow-inner">
                                  <h5 className="text-[11px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider mb-3 flex items-center gap-2">
                                    <DollarSign size={14} className="text-emerald-500" /> Billing Log & Financial Information
                                  </h5>
                                  <div className="flex flex-wrap gap-6 text-xs font-semibold">
                                    <div>
                                      <span className="text-[10px] text-slate-400 block mb-0.5">Bill Amount Issued</span>
                                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">₹ {item.billAmount}</span>
                                    </div>
                                    {item.paymentMode && (
                                      <div>
                                        <span className="text-[10px] text-slate-400 block mb-0.5">Method of Payment</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm capitalize">{item.paymentMode}</span>
                                      </div>
                                    )}
                                    {item.visitType && (
                                      <div>
                                        <span className="text-[10px] text-slate-400 block mb-0.5">Type of Visit</span>
                                        <span className="text-slate-850 dark:text-slate-200 font-extrabold text-sm">{item.visitType}</span>
                                      </div>
                                    )}
                                    <div>
                                      <span className="text-[10px] text-slate-400 block mb-0.5">Invoice State</span>
                                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-100 dark:border-emerald-900/30">Paid</span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // ───── CASE 1.5: NEW ASSESSMENT MODULE EVENT ─────
                    if (item.type === 'assessment_module') {
                      const isExpanded = expandedEvalId === item.id;
                      
                      const mapFlatSymptomsToNested = () => {
                        const sObj: any = {};
                        Object.keys(SYMPTOM_LABELS).forEach(k => {
                          sObj[k] = {
                            value: !!(item.symptoms?.[k]?.value ?? item.symptoms?.[k]),
                            notes: item.symptoms?.[k]?.notes || ''
                          };
                        });
                        return sObj;
                      };

                      return (
                        <div
                          key={item.id}
                          className={`bg-white dark:bg-slate-900 rounded-[20px] border transition-all overflow-hidden shadow-sm relative ${
                            isExpanded ? 'border-indigo-600 ring-1 ring-indigo-650/20' : 'border-slate-150 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700'
                          }`}
                        >
                          {/* Timeline dot */}
                          <div className="absolute -left-[21px] top-6 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 bg-indigo-600 shadow-sm" />

                          <div className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 text-left">
                            <button
                              onClick={() => setExpandedEvalId(isExpanded ? null : item.id)}
                              className="flex items-start gap-3 flex-1 text-left"
                            >
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                                isExpanded ? 'bg-indigo-655 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-655 dark:text-slate-400'
                              }`}>
                                v{item.version || 1}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="text-[14px] font-black text-slate-800 dark:text-white">
                                    Patient Assessment
                                  </h4>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                                    item.paymentStatus === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                  }`}>
                                    {item.paymentStatus || 'Pending'}
                                  </span>
                                </div>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                  {dateFormatted} · Therapist: <span className="font-bold text-slate-700 dark:text-slate-300">{item.therapistName || '—'}</span>
                                </p>
                              </div>
                            </button>

                            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                              {item.painScale !== undefined && item.painScale !== null && (
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-700 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/35">
                                  <Activity size={12} /> Pain: {item.painScale}/10
                                </div>
                              )}
                              <button
                                onClick={() => handleDownloadAssessmentModulePdf(selectedPatientId || '', item.id)}
                                className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-650 dark:text-slate-350 rounded-xl hover:bg-slate-100 active:scale-95 transition-all"
                                title="Download Report PDF"
                              >
                                <Download size={14} />
                              </button>
                              <button
                                onClick={() => setExpandedEvalId(isExpanded ? null : item.id)}
                                className="p-2 text-slate-400"
                              >
                                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                              </button>
                            </div>
                          </div>

                          {/* Collapsible Details */}
                          {isExpanded && (
                            <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-6 flex flex-col gap-6">
                              {/* 1. Basic Info */}
                              <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 p-5 shadow-inner">
                                <h5 className="text-[11px] font-black uppercase text-slate-450 dark:text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                                  <User size={14} className="text-slate-500" /> Patient Demographics & Therapist Intake
                                </h5>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Patient Full Name</span>
                                    <span className="text-slate-850 dark:text-slate-200 font-extrabold text-sm">{item.fullName || '—'}</span>
                                  </div>
                                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-150 dark:border-slate-800">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Age & Gender</span>
                                    <span className="text-slate-850 dark:text-slate-200 font-extrabold text-sm">{item.age} Yrs / {item.gender}</span>
                                  </div>
                                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-150 dark:border-slate-800">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Assigned Therapist</span>
                                    <span className="text-slate-850 dark:text-slate-200 font-extrabold text-sm">{item.therapistName || 'None Assigned'}</span>
                                  </div>
                                  <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-150 dark:border-slate-800">
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Symptom Duration</span>
                                    <span className="text-slate-850 dark:text-slate-200 font-extrabold text-sm">{item.symptomDuration || '—'}</span>
                                  </div>
                                </div>
                              </div>

                              {/* 2. Vitals */}
                              <div className="flex flex-col gap-2">
                                <span className="text-[11px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider flex items-center gap-2">
                                  <Heart size={14} className="text-rose-500" /> Vital Signs Parameters
                                </span>
                                <VitalSignsTable vitals={{
                                  bloodPressure: item.bp,
                                  pulseRate: item.pr,
                                  spo2: item.spo2,
                                  temperature: item.temperature,
                                  ejectionFraction: item.ef
                                }} />
                              </div>

                              {/* 3. Medical History */}
                              <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 p-5 shadow-inner">
                                <h5 className="text-[11px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                                  <ClipboardList size={14} className="text-amber-500" /> Medical & Surgical Log History
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
                                  <div>
                                    <span className="text-[10px] text-slate-400 block mb-1">Chronic Conditions</span>
                                    <p className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150 dark:border-slate-800">{item.chronicConditions?.join(', ') || 'None'}</p>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 block mb-1">Active Medications</span>
                                    <p className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150 dark:border-slate-800">{item.medications?.join(', ') || 'None'}</p>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 block mb-1">Allergies</span>
                                    <p className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150 dark:border-slate-800 text-rose-700 dark:text-rose-400 font-bold">{item.allergies?.join(', ') || 'None'}</p>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 block mb-1">Surgical History</span>
                                    <p className="p-2.5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-150 dark:border-slate-800">{item.surgicalHistory?.join(', ') || 'None'}</p>
                                  </div>
                                </div>
                              </div>

                              {/* 4. Symptoms checklist */}
                              <div className="flex flex-col gap-2">
                                <span className="text-[11px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider flex items-center gap-2">
                                  <FileText size={14} className="text-purple-500" /> Specific Symptoms Checklist
                                </span>
                                <SymptomChecklist symptoms={mapFlatSymptomsToNested()} />
                              </div>

                              {/* 5. Clinical Examination */}
                              <div className="flex flex-col gap-2">
                                <span className="text-[11px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider flex items-center gap-2">
                                  <Stethoscope size={14} className="text-emerald-500" /> Objective clinical examination findings
                                </span>
                                <ClinicalExaminationTable exam={{
                                  musclePower: item.musclePower,
                                  rom: item.rom,
                                  specialTests: item.specialTests,
                                  findings: item.findings
                                }} />
                              </div>

                              {/* 6. Diagnosis & Plan */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 p-5 shadow-inner flex flex-col gap-3 text-xs">
                                  <h5 className="text-[11px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider mb-1 flex items-center gap-2">
                                    <Activity size={14} className="text-indigo-500" /> Diagnosis pathology
                                  </h5>
                                  <div>
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Primary Diagnosis</span>
                                    <span className="font-extrabold">{item.diagnosisPrimary || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 block mb-0.5">ICD-10 Pathology Code</span>
                                    <span className="font-extrabold uppercase">{item.icdCode || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Secondary Conditions</span>
                                    <span className="font-extrabold">{item.diagnosisSecondary?.join(', ') || '—'}</span>
                                  </div>
                                  <div>
                                    <span className="text-[10px] text-slate-400 block mb-0.5">Prescribed Therapies & exercises</span>
                                    <span className="font-extrabold">{item.treatmentTherapies?.join(', ') || '—'}</span>
                                  </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 p-5 shadow-inner flex flex-col gap-3 text-xs">
                                  <h5 className="text-[11px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider mb-1 flex items-center gap-2">
                                    <CreditCard size={14} className="text-indigo-500" /> Billing receipt logs
                                  </h5>
                                  <div className="flex flex-col gap-2">
                                    <div className="flex justify-between">
                                      <span className="text-slate-550">Session Rate:</span>
                                      <span className="font-extrabold">₹ {item.sessionFee || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-550">Total Sessions:</span>
                                      <span className="font-extrabold">{item.totalSessions || '—'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-550">Paid Sessions:</span>
                                      <span className="font-extrabold">{item.paidSessions || '—'}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-100 dark:border-slate-800 pt-2 font-bold text-slate-900 dark:text-white">
                                      <span>Balance Due:</span>
                                      <span className="text-emerald-600 dark:text-emerald-400">₹ {item.balance || '—'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Treatment & Rehabilitation Plan Details */}
                              {(item.treatmentModalities?.length > 0 || item.treatmentFrequency || item.treatmentDuration) && (
                                <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 p-5 shadow-inner flex flex-col gap-3 text-xs">
                                  <h5 className="text-[11px] font-black uppercase text-slate-455 dark:text-slate-500 tracking-wider mb-1 flex items-center gap-2">
                                    <Dumbbell size={14} className="text-emerald-500" /> Prescribed Rehabilitation & Modalities Plan
                                  </h5>
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {item.treatmentModalities?.length > 0 && (
                                      <div>
                                        <span className="text-[10px] text-slate-400 block mb-1">Modalities Prescribed</span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {item.treatmentModalities.map((m: string) => (
                                            <span key={m} className="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-150 dark:border-slate-700">{m}</span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                    {item.treatmentFrequency && (
                                      <div>
                                        <span className="text-[10px] text-slate-400 block mb-0.5">Session Frequency</span>
                                        <span className="font-extrabold">{item.treatmentFrequency}</span>
                                      </div>
                                    )}
                                    {item.treatmentDuration && (
                                      <div>
                                        <span className="text-[10px] text-slate-400 block mb-0.5">Plan Duration</span>
                                        <span className="font-extrabold">{item.treatmentDuration}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                            </div>
                          )}
                        </div>
                      );
                    }

                    // ───── CASE 2: APPOINTMENT EVENT ─────
                    if (item.type === 'appointment') {
                      let statusBg = 'bg-amber-100 text-amber-850';
                      if (item.status === 'completed') statusBg = 'bg-emerald-100 text-emerald-800';
                      if (item.status === 'cancelled') statusBg = 'bg-rose-100 text-rose-800';

                      return (
                        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-150 dark:border-slate-800 p-5 shadow-sm relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                          {/* Timeline dot */}
                          <div className="absolute -left-[21px] top-6 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 bg-teal-600 shadow-sm" />
                          
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold shrink-0">
                              <Clock size={18} />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-black text-slate-850 dark:text-white flex items-center gap-2">
                                Therapy Session Booking
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide ${statusBg}`}>
                                  {item.status}
                                </span>
                              </h4>
                              <p className="text-xs font-semibold text-slate-500 mt-1">
                                Scheduled Time: <span className="text-slate-700 dark:text-slate-300 font-bold">{dateFormatted}</span>
                              </p>
                              <p className="text-xs text-slate-550 mt-1 font-bold">
                                Therapist Assigned: <span className="text-slate-800 dark:text-slate-200">{item.therapistName || '—'}</span>
                              </p>
                              {item.reason && (
                                <p className="text-[11.5px] text-slate-555 mt-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg border border-slate-100 dark:border-slate-800 italic">
                                  Notes: "{item.reason}"
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // ───── CASE 3: BILLING RECEIPT EVENT ─────
                    if (item.type === 'billing') {
                      return (
                        <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-150 dark:border-slate-800 p-5 shadow-sm relative flex justify-between items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                          {/* Timeline dot */}
                          <div className="absolute -left-[21px] top-6 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 bg-emerald-600 shadow-sm" />

                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                              <CreditCard size={18} />
                            </div>
                            <div>
                              <h4 className="text-[14px] font-black text-slate-850 dark:text-white">
                                Payment Invoice Issued
                              </h4>
                              <p className="text-xs font-semibold text-slate-500 mt-1">
                                Payment Date: <span className="text-slate-700 dark:text-slate-300 font-bold">{dateFormatted}</span>
                              </p>
                              <p className="text-xs text-slate-655 mt-1 font-bold">
                                Paid Amount: <span className="text-emerald-700 dark:text-emerald-400 font-black">₹ {item.billAmount}</span> · Method: <span className="capitalize">{item.paymentMode || 'Cash'}</span>
                              </p>
                              <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-wider">
                                Linked Assessment Display ID: {item.displayId}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // ───── CASE 4: DOCUMENT UPLOAD EVENT ─────
                    return (
                      <div key={item.id} className="bg-white dark:bg-slate-900 rounded-[20px] border border-slate-150 dark:border-slate-800 p-5 shadow-sm relative flex justify-between items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                        {/* Timeline dot */}
                        <div className="absolute -left-[21px] top-6 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-950 bg-amber-600 shadow-sm" />

                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 flex items-center justify-center font-bold shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[14px] font-black text-slate-850 dark:text-white truncate">
                              Uploaded Patient Document
                            </h4>
                            <p className="text-xs font-semibold text-slate-500 mt-1">
                              Uploaded: <span className="text-slate-700 dark:text-slate-300 font-bold">{dateFormatted}</span>
                            </p>
                            <p className="text-xs text-slate-600 mt-1 font-bold truncate">
                              Filename: <span className="font-extrabold text-slate-800 dark:text-slate-200">{item.fileName}</span>
                            </p>
                            {item.fileSize && (
                              <p className="text-[11px] text-slate-450 mt-0.5">
                                Size: {(item.fileSize / 1024).toFixed(1)} KB
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => window.open((api.defaults.baseURL || '') + item.fileUrl, '_blank')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 rounded-lg text-xs font-bold hover:bg-amber-100/50 shrink-0 shadow-sm transition-transform active:scale-95"
                        >
                          <Download size={12} />
                          View
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
