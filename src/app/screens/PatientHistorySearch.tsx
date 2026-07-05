import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { usePatients, usePatient } from '../../hooks/usePatients';
import { useEvaluations } from '../../hooks/useEvaluations';
import { ROM_CONFIG, getRomKey } from './assessment/clinicalConfig';
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
  AlertCircle
} from 'lucide-react';

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

  // Fetch all evaluations for selected patient
  const { data: evalsData, isLoading: loadingEvals } = useEvaluations(
    selectedPatientId ? { patientId: selectedPatientId } : undefined
  );
  const evaluations = useMemo(() => {
    if (!evalsData?.data) return [];
    // Sort chronologically ascending for visit index, then reverse for display (latest first)
    const sorted = [...evalsData.data].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
    return sorted.map((ev, index) => ({
      ...ev,
      visitIndex: index + 1
    })).reverse();
  }, [evalsData]);

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    setExpandedEvalId(null);
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

  // Check if ROM/Power joint movements have data
  const hasRomData = (jointLabel: string, movements: string[], romData: Record<string, any> | null | undefined) => {
    if (!romData) return false;
    return movements.some(m => {
      const key = getRomKey(jointLabel, m);
      const entry = romData[key] as RomEntry | undefined;
      return entry && (entry.romRt || entry.romLt || entry.powerRt || entry.powerLt);
    });
  };

  // Flattened ROM config for easier rendering
  const romTableRows = useMemo(() => {
    const rows: any[] = [];
    ROM_CONFIG.forEach((section) => {
      section.joints.forEach((joint) => {
        joint.movements.forEach((movement) => {
          rows.push({
            section: section.label,
            joint: joint.label,
            movement: movement,
            romKey: getRomKey(joint.label, movement),
          });
        });
      });
    });
    return rows;
  }, []);

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
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350">
                          {p.displayId}
                        </span>
                        <h3 className="text-base font-extrabold text-slate-800 dark:text-white mt-2 group-hover:text-primary transition-colors">
                          {p.name}
                        </h3>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                        p.status === 'completed' ? 'bg-emerald-105 text-emerald-800' :
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
                      <h2 className="text-xl font-black text-slate-800 dark:text-white">{patient.name}</h2>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-350">
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
              <h3 className="text-[13px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1 mb-4 flex items-center gap-2">
                <Calendar size={13} /> Evaluation & Intake History
              </h3>

              {loadingEvals ? (
                <div className="flex flex-col items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading history records...</p>
                </div>
              ) : evaluations.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-[24px] border border-slate-150 dark:border-slate-800 p-6 text-slate-400 dark:text-slate-500">
                  <FileText size={36} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-bold">No assessments recorded yet</p>
                  <p className="text-xs mt-1">This patient has no clinical assessment forms saved in the database.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {evaluations.map((ev) => {
                    const isExpanded = expandedEvalId === ev.id;
                    const dateFormatted = new Date(ev.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    });

                    const painInfo = getPainLevelInfo(ev.painLevel);

                    return (
                      <div
                        key={ev.id}
                        className={`bg-white dark:bg-slate-900 rounded-[20px] border transition-all overflow-hidden shadow-sm ${
                          isExpanded ? 'border-primary ring-1 ring-primary/20' : 'border-slate-150 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {/* Summary Accordion Bar */}
                        <button
                          onClick={() => setExpandedEvalId(isExpanded ? null : ev.id)}
                          className="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 text-left"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                              isExpanded ? badgeColor : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                            }`}>
                              #{ev.visitIndex}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="text-[14px] font-black text-slate-800 dark:text-white">
                                  Assessment {ev.displayId}
                                </h4>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide ${
                                  ev.status === 'submitted' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-650'
                                }`}>
                                  {ev.status}
                                </span>
                              </div>
                              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                {dateFormatted} · Created by <span className="font-bold text-slate-700 dark:text-slate-300">{ev.createdBy.name} ({ev.createdBy.role})</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-4">
                            {ev.painLevel !== undefined && ev.painLevel !== null && (
                              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${painInfo.color}`}>
                                <Activity size={12} /> Pain: {ev.painLevel}/10
                              </div>
                            )}

                            {isExpanded ? (
                              <ChevronUp size={18} className="text-slate-400" />
                            ) : (
                              <ChevronDown size={18} className="text-slate-400" />
                            )}
                          </div>
                        </button>

                        {/* Collapsible Details */}
                        {isExpanded && (
                          <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 p-6 flex flex-col gap-6">
                            
                            {/* Section 1: Vitals Grid */}
                            <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 p-5 shadow-inner">
                              <h5 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                                <Heart size={14} className="text-rose-500" /> Vitals & General Details
                              </h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-semibold">
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block mb-0.5">Blood Pressure</span>
                                  <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ev.bp || '—'}</span>
                                </div>
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block mb-0.5">Pulse Rate</span>
                                  <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ev.pr ? `${ev.pr} bpm` : '—'}</span>
                                </div>
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block mb-0.5">SpO₂ Level</span>
                                  <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ev.spo2 ? `${ev.spo2} %` : '—'}</span>
                                </div>
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block mb-0.5">Temperature</span>
                                  <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ev.temperature ? `${ev.temperature} °F` : '—'}</span>
                                </div>
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block mb-0.5">Ejection Fraction</span>
                                  <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ev.ef ? `${ev.ef} %` : '—'}</span>
                                </div>
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block mb-0.5">Visit Type</span>
                                  <span className="text-slate-800 dark:text-slate-200 font-extrabold capitalize text-sm">{ev.visitType || '—'}</span>
                                </div>
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block mb-0.5">Referred By</span>
                                  <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm truncate block">{ev.referredBy || 'Self'}</span>
                                </div>
                                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <span className="text-[10px] text-slate-400 block mb-0.5">Pain Level</span>
                                  <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ev.painLevel !== undefined ? `${ev.painLevel} / 10` : '—'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Section 2: Chief Complaints */}
                            <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 p-5">
                              <h5 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                                <FileText size={14} className="text-fuchsia-500" /> Subjective Assessment
                              </h5>
                              <div className="flex flex-col gap-4 text-xs">
                                <div>
                                  <span className="text-[10px] text-slate-450 uppercase block font-bold mb-1">Chief Complaints (Regions)</span>
                                  <div className="flex flex-wrap gap-1.5 mt-1">
                                    {ev.chiefComplaints ? (
                                      ev.chiefComplaints.split(',').map((c: string) => (
                                        <span key={c} className="px-2.5 py-1 rounded-lg font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                          {c.trim()}
                                        </span>
                                      ))
                                    ) : (
                                      <span className="text-slate-400">No complaints selected</span>
                                    )}
                                  </div>
                                </div>

                                {ev.plan && (
                                  <div>
                                    <span className="text-[10px] text-slate-450 uppercase block font-bold mb-1">Chief Complaints Details</span>
                                    <p className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-slate-750 dark:text-slate-300 leading-relaxed font-medium">
                                      {ev.plan}
                                    </p>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <span className="text-[10px] text-slate-450 uppercase block font-bold mb-1.5">Associated Symptoms</span>
                                    {ev.associatedSymptoms && ev.associatedSymptoms.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {ev.associatedSymptoms.map((s: string) => (
                                          <span key={s} className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 font-extrabold text-[11px]">
                                            {s}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-slate-400 italic">None reported</p>
                                    )}
                                  </div>

                                  <div>
                                    <span className="text-[10px] text-slate-450 uppercase block font-bold mb-1.5">Medical History</span>
                                    {ev.medicalHistory && ev.medicalHistory.length > 0 ? (
                                      <div className="flex flex-wrap gap-1">
                                        {ev.medicalHistory.map((h: string) => (
                                          <span key={h} className="px-2 py-0.5 rounded bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-450 font-extrabold text-[11px]">
                                            {h}
                                          </span>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-slate-400 italic">No medical history conditions reported</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Section 3: Clinical Examination (Imaging & Special Tests) */}
                            {ev.clinicalExamination && (
                              <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 p-5">
                                <h5 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                                  <Stethoscope size={14} className="text-blue-500" /> Clinical Examination
                                </h5>

                                <div className="flex flex-col gap-4 text-xs font-semibold">
                                  {/* Special Tests & Results */}
                                  {ev.clinicalExamination.tests && Object.keys(ev.clinicalExamination.tests).length > 0 ? (
                                    <div>
                                      <span className="text-[10px] text-slate-450 uppercase block font-bold mb-2">Special Physical Tests</span>
                                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                        {Object.entries(ev.clinicalExamination.tests).map(([key, value]: [string, any]) => {
                                          const result = value?.result ?? 'Not Tested';
                                          const isPositive = result === 'Positive';
                                          const isNegative = result === 'Negative';

                                          return (
                                            <div key={key} className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
                                              <span className="text-slate-750 dark:text-slate-355 font-bold truncate max-w-[150px]">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                              <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                                isPositive ? 'bg-red-100 text-red-800' :
                                                isNegative ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                                              }`}>
                                                {result}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-slate-400 italic">No specific physical tests recorded.</p>
                                  )}

                                  {/* Imaging Findings */}
                                  {ev.clinicalExamination.imaging && Object.keys(ev.clinicalExamination.imaging).length > 0 && (
                                    <div className="mt-2 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                                      <span className="text-[10px] text-slate-450 uppercase block font-bold mb-2.5">Imaging Reports (X-Ray & MRI)</span>
                                      <div className="flex flex-col gap-3">
                                        {Object.entries(ev.clinicalExamination.imaging).map(([region, findings]: [string, any]) => {
                                          if (!findings.xray?.trim() && !findings.mri?.trim()) return null;
                                          return (
                                            <div key={region} className="p-3.5 rounded-xl bg-amber-50/20 dark:bg-amber-950/10 border border-amber-100/40 dark:border-amber-900/20 flex flex-col gap-2">
                                              <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase">{region} Imaging</span>
                                              {findings.xray?.trim() && (
                                                <p className="text-slate-700 dark:text-slate-300">
                                                  <strong className="text-slate-500 dark:text-slate-500 uppercase text-[9px] block">X-Ray:</strong> {findings.xray}
                                                </p>
                                              )}
                                              {findings.mri?.trim() && (
                                                <p className="text-slate-700 dark:text-slate-300">
                                                  <strong className="text-slate-500 dark:text-slate-500 uppercase text-[9px] block">MRI:</strong> {findings.mri}
                                                </p>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}

                                  {/* General Exam Notes */}
                                  {ev.clinicalExamination.examinationNotes && (
                                    <div className="mt-2 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                                      <span className="text-[10px] text-slate-455 uppercase block font-bold mb-1">Additional Physical Notes</span>
                                      <p className="p-3 bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 rounded-lg whitespace-pre-wrap font-medium">
                                        {ev.clinicalExamination.examinationNotes}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Section 4: Range of Motion & Muscle Power Table */}
                            {ev.musclePowerRom && (
                              <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 p-5">
                                <h5 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                                  <Activity size={14} className="text-emerald-500" /> Muscle Power & Range of Motion (ROM)
                                </h5>

                                <div className="overflow-hidden rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-inner">
                                  <div className="overflow-x-auto max-h-96">
                                    <table className="w-full border-collapse text-left text-xs">
                                      <thead className="sticky top-0 bg-slate-100 dark:bg-slate-900 z-10">
                                        <tr className="border-b border-slate-200 dark:border-slate-800">
                                          <th className="px-3 py-2 font-black text-slate-800 dark:text-slate-200">Joint</th>
                                          <th className="px-3 py-2 font-black text-slate-800 dark:text-slate-200">Movement</th>
                                          <th className="px-2 py-2 font-black text-slate-800 dark:text-slate-200 text-center bg-slate-50/50 dark:bg-slate-900/20">Power Rt</th>
                                          <th className="px-2 py-2 font-black text-slate-800 dark:text-slate-200 text-center bg-slate-50/50 dark:bg-slate-900/20">Power Lt</th>
                                          <th className="px-2 py-2 font-black text-slate-800 dark:text-slate-200 text-center bg-slate-50/50 dark:bg-slate-900/20">ROM Rt</th>
                                          <th className="px-2 py-2 font-black text-slate-800 dark:text-slate-200 text-center bg-slate-50/50 dark:bg-slate-900/20">ROM Lt</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                                        {romTableRows.map((row) => {
                                          const entry = ev.musclePowerRom?.[row.romKey] as RomEntry | undefined;
                                          if (!entry || (!entry.powerRt && !entry.powerLt && !entry.romRt && !entry.romLt)) return null;

                                          return (
                                            <tr key={row.romKey} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/10">
                                              <td className="px-3 py-2 font-extrabold text-slate-800 dark:text-slate-200">
                                                {row.joint}
                                              </td>
                                              <td className="px-3 py-2 font-medium text-slate-600 dark:text-slate-400 uppercase text-[10px]">
                                                {row.movement}
                                              </td>
                                              <td className="px-2 py-2 text-center text-slate-900 dark:text-white font-extrabold bg-slate-50/20 dark:bg-slate-900/10">
                                                {entry.powerRt || '—'}
                                              </td>
                                              <td className="px-2 py-2 text-center text-slate-900 dark:text-white font-extrabold bg-slate-50/20 dark:bg-slate-900/10">
                                                {entry.powerLt || '—'}
                                              </td>
                                              <td className="px-2 py-2 text-center text-slate-900 dark:text-white font-extrabold bg-slate-50/20 dark:bg-slate-900/10">
                                                {entry.romRt ? `${entry.romRt}°` : '—'}
                                              </td>
                                              <td className="px-2 py-2 text-center text-slate-900 dark:text-white font-extrabold bg-slate-50/20 dark:bg-slate-900/10">
                                                {entry.romLt ? `${entry.romLt}°` : '—'}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Section 5: Anthropometrics Details */}
                            {ev.anthropometrics && (
                              <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 p-5">
                                <h5 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                                  <Scale size={14} className="text-amber-500" /> Anthropometrics
                                </h5>

                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-semibold">
                                  {ev.anthropometrics.height && (
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                      <span className="text-[10px] text-slate-400 block mb-0.5">Height</span>
                                      <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ev.anthropometrics.height} cm</span>
                                    </div>
                                  )}
                                  {ev.anthropometrics.weight && (
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                      <span className="text-[10px] text-slate-400 block mb-0.5">Weight</span>
                                      <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ev.anthropometrics.weight} kg</span>
                                    </div>
                                  )}
                                  {ev.anthropometrics.bmi && (
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                      <span className="text-[10px] text-slate-400 block mb-0.5">BMI</span>
                                      <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ev.anthropometrics.bmi}</span>
                                    </div>
                                  )}
                                  {ev.anthropometrics.waist && (
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                      <span className="text-[10px] text-slate-400 block mb-0.5">Waist</span>
                                      <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ev.anthropometrics.waist} cm</span>
                                    </div>
                                  )}
                                  {ev.anthropometrics.hip && (
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                      <span className="text-[10px] text-slate-400 block mb-0.5">Hip</span>
                                      <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ev.anthropometrics.hip} cm</span>
                                    </div>
                                  )}
                                  {ev.anthropometrics.whRatio && (
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                      <span className="text-[10px] text-slate-400 block mb-0.5">Waist-to-Hip Ratio</span>
                                      <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ev.anthropometrics.whRatio}</span>
                                    </div>
                                  )}

                                  {/* Chest Expansion details */}
                                  {(ev.anthropometrics.chestInspiration || ev.anthropometrics.chestExpiration) && (
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl col-span-2 sm:col-span-3">
                                      <span className="text-[10px] text-slate-400 block mb-1">Chest Measurements</span>
                                      <div className="flex gap-4">
                                        <div>
                                          <span className="text-[9px] text-slate-450 block uppercase">Inspiration</span>
                                          <span className="text-slate-800 dark:text-slate-200 font-extrabold">{ev.anthropometrics.chestInspiration || '—'} cm</span>
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-slate-450 block uppercase">Expiration</span>
                                          <span className="text-slate-800 dark:text-slate-200 font-extrabold">{ev.anthropometrics.chestExpiration || '—'} cm</span>
                                        </div>
                                        <div>
                                          <span className="text-[9px] text-slate-450 block uppercase font-bold text-teal-600">Expansion</span>
                                          <span className="text-teal-700 dark:text-teal-400 font-black">
                                            {ev.anthropometrics.chestExpansion || '—'} cm
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Section 6: Diagnosis & Treatment Plan */}
                            <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 p-5">
                              <h5 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                                <Award size={14} className="text-indigo-500" /> Diagnosis & Treatment Plan
                              </h5>

                              <div className="flex flex-col gap-4 text-xs font-semibold">
                                {ev.diagnosisList && ev.diagnosisList.length > 0 && (
                                  <div>
                                    <span className="text-[10px] text-slate-450 uppercase block font-bold mb-1.5">Confirmed Conditions</span>
                                    <div className="flex flex-wrap gap-1">
                                      {ev.diagnosisList.map((d: string) => (
                                        <span key={d} className="px-2.5 py-1 rounded-lg bg-indigo-55 text-indigo-800 dark:bg-indigo-950/20 dark:text-indigo-400 font-black">
                                          {d}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {ev.diagnosis && (
                                  <div>
                                    <span className="text-[10px] text-slate-450 uppercase block font-bold mb-1">Diagnosis Details / Remarks</span>
                                    <p className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-350 leading-relaxed font-medium">
                                      {ev.diagnosis}
                                    </p>
                                  </div>
                                )}

                                {ev.treatmentPlan && (
                                  <div className="border-t border-slate-100 dark:border-slate-800/80 pt-4">
                                    <span className="text-[10px] text-slate-450 uppercase block font-bold mb-2.5">Prescribed Treatment Protocols</span>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                      {ev.treatmentPlan.modalities && ev.treatmentPlan.modalities.length > 0 && (
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                          <span className="text-[10px] text-slate-400 block mb-1">Modalities</span>
                                          <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 font-bold flex flex-col gap-0.5">
                                            {ev.treatmentPlan.modalities.map((m: string) => (
                                              <li key={m}>{m}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {ev.treatmentPlan.manualTherapy && ev.treatmentPlan.manualTherapy.length > 0 && (
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                          <span className="text-[10px] text-slate-400 block mb-1">Manual Therapy</span>
                                          <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 font-bold flex flex-col gap-0.5">
                                            {ev.treatmentPlan.manualTherapy.map((m: string) => (
                                              <li key={m}>{m}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      {ev.treatmentPlan.rehabilitation && ev.treatmentPlan.rehabilitation.length > 0 && (
                                        <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                                          <span className="text-[10px] text-slate-400 block mb-1">Rehabilitation Exercises</span>
                                          <ul className="list-disc list-inside text-slate-700 dark:text-slate-300 font-bold flex flex-col gap-0.5">
                                            {ev.treatmentPlan.rehabilitation.map((r: string) => (
                                              <li key={r}>{r}</li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}
                                      
                                      <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl flex flex-col gap-2">
                                        <div>
                                          <span className="text-[10px] text-slate-400 block mb-0.5">Visits Needed</span>
                                          <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ev.treatmentPlan.visitsRequired || '—'}</span>
                                        </div>
                                        <div>
                                          <span className="text-[10px] text-slate-400 block mb-0.5">Frequency (Gap Days)</span>
                                          <span className="text-slate-800 dark:text-slate-200 font-extrabold text-sm">{ev.treatmentPlan.gapDays || '—'}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {ev.management && (
                                  <div className="mt-2 border-t border-slate-100 dark:border-slate-800/80 pt-4">
                                    <span className="text-[10px] text-slate-450 uppercase block font-bold mb-1">Clinical Management Notes</span>
                                    <p className="p-3 bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 rounded-lg whitespace-pre-wrap font-medium">
                                      {ev.management}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Section 7: Payment Details */}
                            {(ev.billAmount !== null || ev.paymentMode) && (
                              <div className="bg-white dark:bg-slate-900 rounded-[18px] border border-slate-200 dark:border-slate-800 p-5">
                                <h5 className="text-[11px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-wider mb-4 flex items-center gap-2">
                                  <DollarSign size={14} className="text-emerald-500" /> Billing Details
                                </h5>
                                <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                                  {ev.billAmount !== null && (
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
                                        ₹
                                      </div>
                                      <div>
                                        <span className="text-[10px] text-slate-400 block mb-0.5">Total Bill</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-black text-sm">₹ {ev.billAmount}</span>
                                      </div>
                                    </div>
                                  )}
                                  {ev.paymentMode && (
                                    <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                                        💳
                                      </div>
                                      <div>
                                        <span className="text-[10px] text-slate-400 block mb-0.5">Payment Mode</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-extrabold capitalize text-sm">{ev.paymentMode}</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                          </div>
                        )}
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
