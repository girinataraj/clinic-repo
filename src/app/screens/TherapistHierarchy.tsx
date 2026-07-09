import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { useStaffUsers, useCreateStaffUser, useDeleteStaffUser } from '../../hooks/useStaff';
import { usePatients, useUpdatePatient, useAssignTherapist } from '../../hooks/usePatients';
import { useDebounce } from '../../hooks/useDebounce';
import type { Patient } from '../../types';
import {
  ArrowLeft, ChevronDown, ChevronRight, Users, User, Search,
  Activity, Loader2, AlertTriangle, UserCog, RefreshCw, Plus,
  Mail, Lock, Eye, EyeOff, CheckCircle, X, ExternalLink, Trash2,
  Filter,
} from 'lucide-react';

// The limit of 2 is only for slot booking, not for assignment.
const MAX_BOOKING_CAPACITY = 2;

interface TherapistNode {
  id: string;
  name: string;
  displayId: string;
  patients: Patient[];
  activeCount: number;
  atCapacity: boolean;
}

export function TherapistHierarchy() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [expandedTherapist, setExpandedTherapist] = useState<string | null>(null);
  
  // Search state (remains inline)
  const [search, setSearch] = useState('');

  // Filter Modal states
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [therapistFilter, setTherapistFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [daysFilter, setDaysFilter] = useState<string>('all');

  // Temporary/Modal local edit states
  const [tempTherapistFilter, setTempTherapistFilter] = useState<string>('all');
  const [tempDateFilter, setTempDateFilter] = useState<string>('');
  const [tempDaysFilter, setTempDaysFilter] = useState<string>('all');

  // Reassign state
  const [reassignPatient, setReassignPatient] = useState<Patient | null>(null);
  const [reassignTarget, setReassignTarget] = useState<string | null>(null);

  // Add therapist state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);

  // Debounced search query
  const debouncedSearch = useDebounce(search, 300);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: therapists = [], isLoading: therapistsLoading, isError: therapistsError } = useStaffUsers({ role: 'nurse' });
  const { data: patientsData, isLoading: patientsLoading, isError: patientsError } = usePatients({
    search: debouncedSearch.trim() || undefined,
    therapistId: therapistFilter !== 'all' ? therapistFilter : undefined,
    date: dateFilter || undefined,
    days: daysFilter !== 'all' ? daysFilter : undefined,
    limit: 200,
  });
  const updatePatient = useUpdatePatient();
  const createStaffUser = useCreateStaffUser();

  const allPatients = patientsData?.data ?? [];

  // ── Hierarchy ─────────────────────────────────────────────────────────────
  const hierarchy: TherapistNode[] = useMemo(() => {
    return therapists.map((t) => {
      const pts = allPatients.filter((p) => p.therapistId === t.id);
      const activeCount = pts.filter((p) => p.status === 'waiting' || p.status === 'in-session').length;
      return {
        id: t.id,
        name: t.name,
        displayId: t.displayId,
        patients: pts,
        activeCount,
        atCapacity: false, // Capacity limit removed for assignment
      };
    });
  }, [therapists, allPatients]);

  const unassigned = useMemo(() => allPatients.filter((p) => !p.therapistId), [allPatients]);

  // ── Search ────────────────────────────────────────────────────────────────
  const filteredHierarchy = useMemo(() => {
    if (!search.trim()) return hierarchy;
    const q = search.toLowerCase();
    return hierarchy
      .map((node) => ({
        ...node,
        patients: node.patients.filter(
          (p) => p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.displayId.toLowerCase().includes(q)
        ),
      }))
      .filter((node) => node.name.toLowerCase().includes(q) || node.patients.length > 0);
  }, [hierarchy, search]);

  // ── Reassign ──────────────────────────────────────────────────────────────
  const assignTherapist = useAssignTherapist();
  const handleReassign = async () => {
    if (!reassignPatient || !reassignTarget) return;
    try {
      await assignTherapist.mutateAsync({ patientId: reassignPatient.id, therapistId: reassignTarget });
      setReassignPatient(null);
      setReassignTarget(null);
    } catch { /* handled by RQ */ }
  };

  // ── Add therapist ─────────────────────────────────────────────────────────
  const handleAddTherapist = async () => {
    setAddError(null);
    if (!newName.trim()) { setAddError('Name is required.'); return; }
    if (!newEmail.trim() || !newEmail.includes('@')) { setAddError('Valid email is required.'); return; }
    if (!newPassword || newPassword.length < 6) { setAddError('Password must be at least 6 characters.'); return; }
    try {
      await createStaffUser.mutateAsync({ name: newName.trim(), email: newEmail.trim(), password: newPassword, role: 'nurse' });
      setAddSuccess(true);
      setNewName(''); setNewEmail(''); setNewPassword('');
      setTimeout(() => { setShowAddForm(false); setAddSuccess(false); }, 1500);
    } catch (e: any) {
      setAddError(e?.response?.data?.message ?? 'Failed to create therapist.');
    }
  };

  const isLoading = therapistsLoading || patientsLoading;
  const isError = therapistsError || patientsError;
  const totalPatients = allPatients.length;
  const totalTherapists = therapists.length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFilterModalOpen(false);
      }
    };
    if (isFilterModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFilterModalOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsFilterModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full font-sans bg-[#E8E9F1] dark:bg-slate-950">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="px-5 pb-5 shrink-0 relative overflow-hidden pt-7 bg-gradient-to-br from-[#262842] to-[#3B3E66] dark:from-slate-900 dark:to-slate-800 shadow-[0_4px_24px_rgba(38,40,66,0.15)] dark:shadow-none"
      >
        <div className="absolute -right-16 -top-16 rounded-full opacity-10 w-[200px] h-[200px] bg-white" />
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <button onClick={() => navigate('/doctor')} className="flex items-center justify-center rounded-xl w-9 h-9 bg-white/15 hover:bg-white/20 transition-colors">
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex-1">
            <h1 className="text-[19px] font-extrabold text-white tracking-[-0.5px]">Therapist Hierarchy</h1>
            <p className="text-[11px] text-white/70">Manage therapist-patient assignments</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-white/20 text-white border border-white/30 hover:bg-white/30 transition-colors"
          >
            <Plus size={14} /> Add Therapist
          </button>
        </div>
        {/* Stats */}
        <div className="flex gap-2.5 relative z-10">
          {[
            { label: 'Therapists', value: totalTherapists, icon: UserCog },
            { label: 'Total Patients', value: totalPatients, icon: Users },
            { label: 'Unassigned', value: unassigned.length, icon: AlertTriangle },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl bg-white/15 border border-white/20">
                <Icon size={14} className="text-white" />
                <span className="text-[17px] font-extrabold text-white">{s.value}</span>
                <span className="text-[9px] text-white/70 font-semibold">{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Search & Filter */}
        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-[#E8E9F1] dark:border-slate-700 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none">
            <Search size={15} className="text-[#262842] dark:text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search therapists or patients…" className="flex-1 outline-none bg-transparent text-sm text-[#17252A] dark:text-white dark:placeholder-slate-500" />
          </div>
          <button
            onClick={() => {
              setTempTherapistFilter(therapistFilter);
              setTempDateFilter(dateFilter);
              setTempDaysFilter(daysFilter);
              setIsFilterModalOpen(true);
            }}
            className={`flex items-center justify-center p-2.5 border rounded-xl hover:bg-slate-100 dark:hover:bg-slate-750 transition-all ${
              therapistFilter !== 'all' || dateFilter !== '' || daysFilter !== 'all'
                ? 'bg-[#3B3E66]/10 border-[#3B3E66] text-[#3B3E66] dark:text-blue-400 font-bold'
                : 'bg-white dark:bg-slate-800 border-[#E8E9F1] dark:border-slate-700 text-slate-500 dark:text-slate-400 shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none'
            }`}
            title="Filter Records"
            aria-label="Filter Records"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin mb-3 text-[#3B3E66] dark:text-slate-400" />
            <p className="text-[13px] text-[#262842] dark:text-slate-300 font-semibold">Loading hierarchy…</p>
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="rounded-2xl p-5 text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50">
            <AlertTriangle size={28} className="mx-auto mb-2 text-red-600 dark:text-red-400" />
            <p className="text-[13px] font-bold text-red-700 dark:text-red-400">Failed to load data</p>
            <p className="text-[11px] text-red-600 dark:text-red-500 mt-1">Please check backend connectivity.</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && therapists.length === 0 && (
          <div className="rounded-2xl p-8 text-center bg-white dark:bg-slate-800 border border-[#E8E9F1] dark:border-slate-700">
            <UserCog size={36} className="mx-auto mb-3 text-[#E8E9F1] dark:text-slate-600" />
            <p className="text-[15px] font-bold text-[#17252A] dark:text-white">No therapists found</p>
            <p className="text-[12px] text-[#262842] dark:text-slate-400 mt-1">Click "Add Therapist" to register one.</p>
          </div>
        )}

        {/* ── Tree ────────────────────────────────────────────── */}
        {!isLoading && !isError && filteredHierarchy.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {/* Doctor root */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gradient-to-br from-[#262842] to-[#3B3E66] dark:from-slate-800 dark:to-slate-700 shadow-[0_4px_16px_rgba(38,40,66,0.12)] dark:shadow-none">
              <div className="rounded-xl flex items-center justify-center shrink-0 w-[34px] h-[34px] bg-white/20">
                <Activity size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-extrabold text-white">Doctor (You)</p>
                <p className="text-[10px] text-white/70">{totalTherapists} therapist{totalTherapists !== 1 ? 's' : ''} · {totalPatients} patient{totalPatients !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Therapist nodes */}
            {filteredHierarchy.map((node) => {
              const isExpanded = expandedTherapist === node.id;
              return (
                <div key={node.id} className="ml-3">
                  <div className="flex items-stretch">
                    <div className="w-3 flex flex-col items-center shrink-0">
                      <div className="w-[2px] h-[14px] bg-[#3B3E66] dark:bg-slate-600 opacity-35" />
                      <div className="w-[10px] h-[2px] bg-[#3B3E66] dark:bg-slate-600 opacity-35 self-end" />
                    </div>
                    <button
                      onClick={() => setExpandedTherapist(isExpanded ? null : node.id)}
                      className={`flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all bg-white dark:bg-slate-800 border ${isExpanded ? 'border-[#3B3E66] dark:border-slate-500 shadow-[0_4px_16px_rgba(43,122,120,0.1)]' : 'border-[#E8E9F1] dark:border-slate-700 shadow-[0_1px_6px_rgba(0,0,0,0.04)]'} dark:shadow-none`}
                    >
                      <div className={`rounded-xl flex items-center justify-center shrink-0 w-[34px] h-[34px] ${isExpanded ? 'bg-[#3B3E66] dark:bg-slate-600' : 'bg-[#E8E9F1] dark:bg-slate-700'}`}>
                        <UserCog size={15} className={isExpanded ? 'text-white' : 'text-[#262842] dark:text-slate-300'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-bold text-[#17252A] dark:text-white truncate">{node.name}</p>
                        <p className="text-[10px] text-[#262842] dark:text-slate-400">{node.displayId} · {node.patients.length} patient{node.patients.length !== 1 ? 's' : ''}</p>
                        <span
                          onClick={(e) => { e.stopPropagation(); navigate(`/doctor/therapist/${node.id}`); }}
                          className="inline-block mt-1 cursor-pointer hover:underline text-[11px] font-bold text-[#3B3E66] dark:text-blue-400"
                        >
                          View Profile →
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shrink-0">
                        {node.activeCount} active
                      </span>
                      {isExpanded ? <ChevronDown size={16} className="text-[#3B3E66] dark:text-slate-400 shrink-0" /> : <ChevronRight size={16} className="text-[#262842] dark:text-slate-400 shrink-0" />}
                    </button>
                  </div>


                  {/* Patient list */}
                  {isExpanded && (
                    <div className="ml-7 mt-1.5 flex flex-col gap-1.5">
                      {node.patients.length === 0 ? (
                        <div className="py-4 px-4 rounded-xl text-center bg-[#f8fffe] dark:bg-slate-800/50 border border-dashed border-[#E8E9F1] dark:border-slate-700">
                          <p className="text-[11px] text-[#262842] dark:text-slate-400 font-semibold">No patients assigned yet.</p>
                        </div>
                      ) : (
                        node.patients.map((patient) => (
                          <div key={patient.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-[#E8E9F1] dark:border-slate-700">
                            <div className="rounded-lg flex items-center justify-center shrink-0 w-[30px] h-[30px] bg-[#E8E9F1] dark:bg-slate-700">
                              <User size={13} className="text-[#262842] dark:text-slate-300" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] font-semibold text-[#17252A] dark:text-white truncate">{patient.name}</p>
                              <p className="text-[10px] text-[#262842] dark:text-slate-400">{patient.phone} · {patient.condition ?? '—'}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              patient.status === 'waiting' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400' :
                              patient.status === 'in-session' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                              'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            }`}>{patient.status}</span>
                            <button onClick={(e) => { e.stopPropagation(); setReassignPatient(patient); setReassignTarget(null); }} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" title="Reassign">
                              <RefreshCw size={11} className="text-[#262842] dark:text-slate-400" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unassigned */}
            {unassigned.length > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-2 mb-2 px-1">
                  <AlertTriangle size={13} className="text-amber-600 dark:text-amber-500" />
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-500">Unassigned ({unassigned.length})</span>
                </div>
                {unassigned.map((patient) => (
                  <div key={patient.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50">
                    <div className="rounded-lg flex items-center justify-center shrink-0 w-[30px] h-[30px] bg-amber-100 dark:bg-amber-900/40">
                      <User size={13} className="text-amber-600 dark:text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-[#17252A] dark:text-white truncate">{patient.name}</p>
                      <p className="text-[10px] text-amber-800 dark:text-amber-500">{patient.phone}</p>
                    </div>
                    <button onClick={() => { setReassignPatient(patient); setReassignTarget(null); }} className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-[#262842] dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">Assign</button>
                  </div>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

      {/* ── Reassign Modal ────────────────────────────────────── */}
      {reassignPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl p-5 bg-white dark:bg-slate-800 shadow-[0_24px_64px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[15px] font-extrabold text-[#17252A] dark:text-white">{reassignPatient.therapistId ? 'Reassign' : 'Assign'} Therapist</h3>
              <button onClick={() => { setReassignPatient(null); setReassignTarget(null); }} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X size={16} className="text-slate-500 dark:text-slate-400" /></button>
            </div>
            <p className="text-[11px] text-[#262842] dark:text-slate-300 mb-3">Patient: <strong>{reassignPatient.name}</strong> ({reassignPatient.phone})</p>

            {/* Current therapist */}
            {reassignPatient.therapistId && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 bg-[#E8E9F1] dark:bg-slate-700 border border-teal-200 dark:border-teal-900">
                <UserCog size={13} className="text-[#262842] dark:text-slate-300" />
                <span className="text-[11px] font-semibold text-[#262842] dark:text-slate-300">
                  Current: {therapists.find((t) => t.id === reassignPatient.therapistId)?.name ?? 'Unknown'}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto mb-4">
              {therapists.map((t) => {
                const isCurrent = reassignPatient.therapistId === t.id;
                const isSelected = reassignTarget === t.id;
                const node = hierarchy.find((h) => h.id === t.id);
                const isFull = false; // Never full for assignment
                const isDisabled = isCurrent;
                return (
                  <button key={t.id} onClick={() => !isDisabled && setReassignTarget(t.id)} disabled={isDisabled}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors bg-white dark:bg-slate-800 border ${isSelected ? 'border-[#3B3E66] dark:border-slate-500 bg-[#E8E9F1] dark:bg-slate-700' : 'border-[#E8E9F1] dark:border-slate-600'} ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}>
                    <div className={`rounded-lg flex items-center justify-center shrink-0 w-[30px] h-[30px] ${isSelected ? 'bg-[#3B3E66] dark:bg-slate-600' : 'bg-[#E8E9F1] dark:bg-slate-700'}`}>
                      <UserCog size={13} className={isSelected ? 'text-white' : 'text-[#262842] dark:text-slate-300'} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold text-[#17252A] dark:text-white">{t.name}</p>
                      <p className={`text-[10px] ${isFull ? 'text-red-600' : 'text-[#262842] dark:text-slate-400'}`}>
                        {isCurrent ? 'Currently assigned' : `${node?.activeCount ?? 0} active`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => { setReassignPatient(null); setReassignTarget(null); }} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#E8E9F1] dark:bg-slate-700 text-[#262842] dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">Cancel</button>
              <button onClick={handleReassign} disabled={!reassignTarget || assignTherapist.isPending} className="flex-1 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50 bg-[#262842] dark:bg-blue-600 text-white hover:bg-slate-800 dark:hover:bg-blue-700 transition-colors">
                {assignTherapist.isPending ? 'Saving…' : 'Confirm'}
              </button>
            </div>
            {assignTherapist.isError && <p className="text-[11px] font-semibold text-red-600 text-center mt-2">Failed to reassign. Try again.</p>}
          </div>
        </div>
      )}

      {/* ── Add Therapist Modal ───────────────────────────────── */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl p-5 bg-white dark:bg-slate-800 shadow-[0_24px_64px_rgba(0,0,0,0.15)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-extrabold text-[#17252A] dark:text-white">Add New Therapist</h3>
              <button onClick={() => { setShowAddForm(false); setAddError(null); setAddSuccess(false); }} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><X size={16} className="text-slate-500 dark:text-slate-400" /></button>
            </div>

            {addSuccess ? (
              <div className="flex flex-col items-center py-6">
                <CheckCircle size={40} className="text-emerald-500 mb-3" />
                <p className="text-[14px] font-bold text-emerald-800 dark:text-emerald-400">Therapist created successfully!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 dark:focus-within:border-teal-400 dark:focus-within:ring-teal-400">
                    <User size={14} className="text-slate-400 shrink-0" />
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Priya Sharma" className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400" />
                  </div>
                </div>
                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Email <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 dark:focus-within:border-teal-400 dark:focus-within:ring-teal-400">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="therapist@saai.clinic" className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400" />
                  </div>
                </div>
                {/* Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1">Password <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 dark:focus-within:border-teal-400 dark:focus-within:ring-teal-400">
                    <Lock size={14} className="text-slate-400 shrink-0" />
                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-0.5">
                      {showPassword ? <EyeOff size={14} className="text-slate-400" /> : <Eye size={14} className="text-slate-400" />}
                    </button>
                  </div>
                </div>

                {addError && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50">
                    <AlertTriangle size={13} className="text-red-600 dark:text-red-400" />
                    <p className="text-[11px] font-semibold text-red-700 dark:text-red-400">{addError}</p>
                  </div>
                )}

                <button onClick={handleAddTherapist} disabled={createStaffUser.isPending}
                  className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50 mt-1 bg-gradient-to-br from-[#262842] to-[#3B3E66] dark:from-slate-700 dark:to-slate-600 text-white shadow-[0_4px_16px_rgba(43,122,120,0.2)] dark:shadow-none hover:opacity-90 transition-opacity">
                  {createStaffUser.isPending ? 'Creating…' : 'Create Therapist'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}



      <div className="md:hidden border-t border-[#E8E9F1] dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav role="doctor" />
      </div>

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4 animate-in fade-in duration-200"
        >
          <div
            className="w-full max-w-sm rounded-[28px] p-6 bg-white dark:bg-slate-900 shadow-2xl border border-slate-150 dark:border-slate-800 animate-in zoom-in-95 duration-200 flex flex-col gap-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-[15px] font-extrabold text-[#262842] dark:text-white">Filter Records</h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close modal"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-4">
              {/* Therapist Filter (Dropdown, Optional) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Therapist
                </label>
                <select
                  value={tempTherapistFilter}
                  onChange={(e) => setTempTherapistFilter(e.target.value)}
                  className="w-full rounded-xl px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-205 outline-none focus:ring-1 focus:ring-[#3B3E66]"
                >
                  <option value="all">All Therapists</option>
                  <option value="unassigned">Unassigned Only</option>
                  {therapists.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Filter (datepicker) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Date
                </label>
                <input
                  type="date"
                  value={tempDateFilter}
                  onChange={(e) => {
                    setTempDateFilter(e.target.value);
                    if (e.target.value) {
                      setTempDaysFilter('all');
                    }
                  }}
                  className="w-full rounded-xl px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-205 outline-none focus:ring-1 focus:ring-[#3B3E66]"
                />
              </div>

              {/* Days Range Filter (Dropdown) */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                  Days Range
                </label>
                <select
                  value={tempDaysFilter}
                  onChange={(e) => {
                    setTempDaysFilter(e.target.value);
                    if (e.target.value !== 'all') {
                      setTempDateFilter('');
                    }
                  }}
                  className="w-full rounded-xl px-3 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-855 dark:text-slate-205 outline-none focus:ring-1 focus:ring-[#3B3E66]"
                >
                  <option value="all">Any Day</option>
                  <option value="1">Today</option>
                  <option value="3">Next 3 Days</option>
                  <option value="7">Next 7 Days</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
              <button
                onClick={() => {
                  setTherapistFilter('all');
                  setDateFilter('');
                  setDaysFilter('all');
                  setIsFilterModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
              >
                Clear Filter
              </button>
              <button
                onClick={() => {
                  setTherapistFilter(tempTherapistFilter);
                  setDateFilter(tempDateFilter);
                  setDaysFilter(tempDaysFilter);
                  setIsFilterModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#3B3E66] hover:bg-[#2F3152] active:scale-95 transition-all shadow-sm"
              >
                Apply Filter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

