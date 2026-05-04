import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { useStaffUsers, useCreateStaffUser } from '../../hooks/useStaff';
import { usePatients, useUpdatePatient } from '../../hooks/usePatients';
import type { Patient } from '../../types';
import {
  ArrowLeft, ChevronDown, ChevronRight, Users, User, Search,
  Activity, Loader2, AlertTriangle, UserCog, RefreshCw, Plus,
  Mail, Lock, Eye, EyeOff, CheckCircle, X,
} from 'lucide-react';

const MAX_ACTIVE_PATIENTS = 2;

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
  const [expandedTherapist, setExpandedTherapist] = useState<string | null>(null);
  const [search, setSearch] = useState('');

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

  // ── Data fetching ─────────────────────────────────────────────────────────
  const { data: therapists = [], isLoading: therapistsLoading, isError: therapistsError } = useStaffUsers({ role: 'nurse' });
  const { data: patientsData, isLoading: patientsLoading, isError: patientsError } = usePatients({ limit: 200 });
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
        atCapacity: activeCount >= MAX_ACTIVE_PATIENTS,
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
  const handleReassign = async () => {
    if (!reassignPatient || !reassignTarget) return;
    try {
      await updatePatient.mutateAsync({ id: reassignPatient.id, therapistId: reassignTarget });
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

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#E8E9F1' }}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div
        className="px-5 pb-5 shrink-0 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #262842 0%, #3B3E66 100%)', paddingTop: '28px', boxShadow: '0 4px 24px rgba(38, 40, 66, 0.15)' }}
      >
        <div className="absolute -right-16 -top-16 rounded-full opacity-10" style={{ width: '200px', height: '200px', background: '#FEFFFF' }} />
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <button onClick={() => navigate('/doctor')} className="flex items-center justify-center rounded-xl w-9 h-9" style={{ background: 'rgba(254,255,255,0.15)' }}>
            <ArrowLeft size={18} color="#FEFFFF" />
          </button>
          <div className="flex-1">
            <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#FEFFFF', letterSpacing: '-0.5px' }}>Therapist Hierarchy</h1>
            <p style={{ fontSize: '11px', color: 'rgba(254,255,255,0.7)' }}>Manage therapist-patient assignments</p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(254,255,255,0.2)', color: '#FEFFFF', border: '1px solid rgba(254,255,255,0.3)' }}
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
              <div key={s.label} className="flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl" style={{ background: 'rgba(254,255,255,0.15)', border: '1px solid rgba(254,255,255,0.2)' }}>
                <Icon size={14} color="#FEFFFF" />
                <span style={{ fontSize: '17px', fontWeight: 800, color: '#FEFFFF' }}>{s.value}</span>
                <span style={{ fontSize: '9px', color: 'rgba(254,255,255,0.7)', fontWeight: 600 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Search */}
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl mb-4" style={{ background: '#FEFFFF', border: '1px solid #E8E9F1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          <Search size={15} color="#262842" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search therapists or patients…" className="flex-1 outline-none bg-transparent text-sm" style={{ color: '#17252A' }} />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={28} className="animate-spin mb-3" color="#3B3E66" />
            <p style={{ fontSize: '13px', color: '#262842', fontWeight: 600 }}>Loading hierarchy…</p>
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="rounded-2xl p-5 text-center" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <AlertTriangle size={28} color="#dc2626" className="mx-auto mb-2" />
            <p style={{ fontSize: '13px', fontWeight: 700, color: '#b91c1c' }}>Failed to load data</p>
            <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>Please check backend connectivity.</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && therapists.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#FEFFFF', border: '1px solid #E8E9F1' }}>
            <UserCog size={36} color="#E8E9F1" className="mx-auto mb-3" />
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>No therapists found</p>
            <p style={{ fontSize: '12px', color: '#262842', marginTop: '4px' }}>Click "Add Therapist" to register one.</p>
          </div>
        )}

        {/* ── Tree ────────────────────────────────────────────── */}
        {!isLoading && !isError && filteredHierarchy.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {/* Doctor root */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl" style={{ background: 'linear-gradient(135deg, #262842, #3B3E66)', boxShadow: '0 4px 16px rgba(38, 40, 66, 0.12)' }}>
              <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: '34px', height: '34px', background: 'rgba(254,255,255,0.2)' }}>
                <Activity size={16} color="#FEFFFF" />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: '13px', fontWeight: 800, color: '#FEFFFF' }}>Doctor (You)</p>
                <p style={{ fontSize: '10px', color: 'rgba(254,255,255,0.7)' }}>{totalTherapists} therapist{totalTherapists !== 1 ? 's' : ''} · {totalPatients} patient{totalPatients !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {/* Therapist nodes */}
            {filteredHierarchy.map((node) => {
              const isExpanded = expandedTherapist === node.id;
              return (
                <div key={node.id} className="ml-3">
                  <div className="flex items-stretch">
                    <div className="w-3 flex flex-col items-center shrink-0">
                      <div style={{ width: '2px', height: '14px', background: '#3B3E66', opacity: 0.35 }} />
                      <div style={{ width: '10px', height: '2px', background: '#3B3E66', opacity: 0.35, alignSelf: 'flex-end' }} />
                    </div>
                    <button
                      onClick={() => setExpandedTherapist(isExpanded ? null : node.id)}
                      className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                      style={{
                        background: '#FEFFFF',
                        border: isExpanded ? '2px solid #3B3E66' : '1px solid #E8E9F1',
                        boxShadow: isExpanded ? '0 4px 16px rgba(43,122,120,0.1)' : '0 1px 6px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: '34px', height: '34px', background: isExpanded ? '#3B3E66' : '#E8E9F1' }}>
                        <UserCog size={15} color={isExpanded ? '#FEFFFF' : '#262842'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '13px', fontWeight: 700, color: '#17252A' }} className="truncate">{node.name}</p>
                        <p style={{ fontSize: '10px', color: '#262842' }}>{node.displayId} · {node.patients.length} patient{node.patients.length !== 1 ? 's' : ''}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${node.atCapacity ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {node.activeCount}/{MAX_ACTIVE_PATIENTS}
                      </span>
                      {isExpanded ? <ChevronDown size={16} color="#3B3E66" /> : <ChevronRight size={16} color="#262842" />}
                    </button>
                  </div>

                  {/* Patient list */}
                  {isExpanded && (
                    <div className="ml-7 mt-1.5 flex flex-col gap-1.5">
                      {node.patients.length === 0 ? (
                        <div className="py-4 px-4 rounded-xl text-center" style={{ background: '#f8fffe', border: '1px dashed #E8E9F1' }}>
                          <p style={{ fontSize: '11px', color: '#262842', fontWeight: 600 }}>No patients assigned yet.</p>
                        </div>
                      ) : (
                        node.patients.map((patient) => (
                          <div key={patient.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: '#FEFFFF', border: '1px solid #E8E9F1' }}>
                            <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: '30px', height: '30px', background: '#E8E9F1' }}>
                              <User size={13} color="#262842" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p style={{ fontSize: '12px', fontWeight: 600, color: '#17252A' }} className="truncate">{patient.name}</p>
                              <p style={{ fontSize: '10px', color: '#262842' }}>{patient.phone} · {patient.condition ?? '—'}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold" style={{
                              background: patient.status === 'waiting' ? '#fef3c7' : patient.status === 'in-session' ? '#dbeafe' : '#dcfce7',
                              color: patient.status === 'waiting' ? '#92400e' : patient.status === 'in-session' ? '#1e40af' : '#166534',
                            }}>{patient.status}</span>
                            <button onClick={(e) => { e.stopPropagation(); setReassignPatient(patient); setReassignTarget(null); }} className="p-1 rounded-lg hover:bg-slate-100 transition-colors" title="Reassign">
                              <RefreshCw size={11} color="#262842" />
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
                  <AlertTriangle size={13} color="#d97706" />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400e' }}>Unassigned ({unassigned.length})</span>
                </div>
                {unassigned.map((patient) => (
                  <div key={patient.id} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1.5" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
                    <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: '30px', height: '30px', background: '#fef3c7' }}>
                      <User size={13} color="#d97706" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#17252A' }} className="truncate">{patient.name}</p>
                      <p style={{ fontSize: '10px', color: '#92400e' }}>{patient.phone}</p>
                    </div>
                    <button onClick={() => { setReassignPatient(patient); setReassignTarget(null); }} className="px-2.5 py-1 rounded-lg text-[10px] font-bold" style={{ background: '#262842', color: '#FEFFFF' }}>Assign</button>
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
          <div className="w-full max-w-sm rounded-3xl p-5" style={{ background: '#FEFFFF', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#17252A' }}>{reassignPatient.therapistId ? 'Reassign' : 'Assign'} Therapist</h3>
              <button onClick={() => { setReassignPatient(null); setReassignTarget(null); }} className="p-1 rounded-lg hover:bg-slate-100"><X size={16} color="#64748b" /></button>
            </div>
            <p style={{ fontSize: '11px', color: '#262842', marginBottom: '12px' }}>Patient: <strong>{reassignPatient.name}</strong> ({reassignPatient.phone})</p>

            {/* Current therapist */}
            {reassignPatient.therapistId && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3" style={{ background: '#E8E9F1', border: '1px solid #b2dfdb' }}>
                <UserCog size={13} color="#262842" />
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#262842' }}>
                  Current: {therapists.find((t) => t.id === reassignPatient.therapistId)?.name ?? 'Unknown'}
                </span>
              </div>
            )}

            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto mb-4">
              {therapists.map((t) => {
                const isCurrent = reassignPatient.therapistId === t.id;
                const isSelected = reassignTarget === t.id;
                const node = hierarchy.find((h) => h.id === t.id);
                const isFull = node?.atCapacity && !isCurrent;
                const isDisabled = isCurrent || isFull;
                return (
                  <button key={t.id} onClick={() => !isDisabled && setReassignTarget(t.id)} disabled={isDisabled}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors"
                    style={{ background: isSelected ? '#E8E9F1' : '#FEFFFF', border: isSelected ? '2px solid #3B3E66' : '1px solid #E8E9F1', opacity: isDisabled ? 0.4 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer' }}>
                    <div className="rounded-lg flex items-center justify-center shrink-0" style={{ width: '30px', height: '30px', background: isSelected ? '#3B3E66' : '#E8E9F1' }}>
                      <UserCog size={13} color={isSelected ? '#FEFFFF' : '#262842'} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#17252A' }}>{t.name}</p>
                      <p style={{ fontSize: '10px', color: isFull ? '#dc2626' : '#262842' }}>
                        {isCurrent ? 'Currently assigned' : isFull ? `Full (${node?.activeCount}/${MAX_ACTIVE_PATIENTS})` : `${node?.activeCount ?? 0}/${MAX_ACTIVE_PATIENTS} active`}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2.5">
              <button onClick={() => { setReassignPatient(null); setReassignTarget(null); }} className="flex-1 py-2.5 rounded-xl text-xs font-bold" style={{ background: '#E8E9F1', color: '#262842' }}>Cancel</button>
              <button onClick={handleReassign} disabled={!reassignTarget || updatePatient.isPending} className="flex-1 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50" style={{ background: '#262842', color: '#FEFFFF' }}>
                {updatePatient.isPending ? 'Saving…' : 'Confirm'}
              </button>
            </div>
            {updatePatient.isError && <p className="text-[11px] font-semibold text-red-600 text-center mt-2">Failed to reassign. Try again.</p>}
          </div>
        </div>
      )}

      {/* ── Add Therapist Modal ───────────────────────────────── */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-3xl p-5" style={{ background: '#FEFFFF', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#17252A' }}>Add New Therapist</h3>
              <button onClick={() => { setShowAddForm(false); setAddError(null); setAddSuccess(false); }} className="p-1 rounded-lg hover:bg-slate-100"><X size={16} color="#64748b" /></button>
            </div>

            {addSuccess ? (
              <div className="flex flex-col items-center py-6">
                <CheckCircle size={40} color="#10b981" className="mb-3" />
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#166534' }}>Therapist created successfully!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Name */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
                    <User size={14} className="text-slate-400 shrink-0" />
                    <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Priya Sharma" className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400" />
                  </div>
                </div>
                {/* Email */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Email <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="therapist@saai.clinic" className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400" />
                  </div>
                </div>
                {/* Password */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">Password <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500">
                    <Lock size={14} className="text-slate-400 shrink-0" />
                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="flex-1 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-400" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-0.5">
                      {showPassword ? <EyeOff size={14} className="text-slate-400" /> : <Eye size={14} className="text-slate-400" />}
                    </button>
                  </div>
                </div>

                {addError && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 border border-red-200">
                    <AlertTriangle size={13} color="#dc2626" />
                    <p className="text-[11px] font-semibold text-red-700">{addError}</p>
                  </div>
                )}

                <button onClick={handleAddTherapist} disabled={createStaffUser.isPending}
                  className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-50 mt-1"
                  style={{ background: 'linear-gradient(135deg, #262842, #3B3E66)', color: '#FEFFFF', boxShadow: '0 4px 16px rgba(43,122,120,0.2)' }}>
                  {createStaffUser.isPending ? 'Creating…' : 'Create Therapist'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="md:hidden" style={{ borderTop: '1px solid #E8E9F1', background: '#FEFFFF' }}>
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}
