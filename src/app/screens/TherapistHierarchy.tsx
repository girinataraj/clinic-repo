import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { useStaffUsers } from '../../hooks/useStaff';
import { usePatients } from '../../hooks/usePatients';
import { useUpdatePatient } from '../../hooks/usePatients';
import type { Patient } from '../../types';
import {
  ArrowLeft, ChevronDown, ChevronRight, Users, User, Search,
  Activity, Loader2, AlertTriangle, UserCog, RefreshCw,
} from 'lucide-react';

interface TherapistNode {
  id: string;
  name: string;
  displayId: string;
  patients: Patient[];
}

export function TherapistHierarchy() {
  const navigate = useNavigate();
  const [expandedTherapist, setExpandedTherapist] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [reassignPatient, setReassignPatient] = useState<Patient | null>(null);
  const [reassignTarget, setReassignTarget] = useState<string | null>(null);

  // ── Data fetching (real API hooks) ────────────────────────────────────────
  const { data: therapists = [], isLoading: therapistsLoading, isError: therapistsError } = useStaffUsers({ role: 'nurse' });
  const { data: patientsData, isLoading: patientsLoading, isError: patientsError } = usePatients({ limit: 200 });
  const updatePatient = useUpdatePatient();

  const allPatients = patientsData?.data ?? [];

  // ── Build hierarchy: group patients by therapistId ────────────────────────
  const hierarchy: TherapistNode[] = useMemo(() => {
    return therapists.map((t) => ({
      id: t.id,
      name: t.name,
      displayId: t.displayId,
      patients: allPatients.filter((p) => p.therapistId === t.id),
    }));
  }, [therapists, allPatients]);

  // Unassigned patients (no therapistId set)
  const unassigned = useMemo(() => {
    return allPatients.filter((p) => !p.therapistId);
  }, [allPatients]);

  // ── Search filter ─────────────────────────────────────────────────────────
  const filteredHierarchy = useMemo(() => {
    if (!search.trim()) return hierarchy;
    const q = search.toLowerCase();
    return hierarchy
      .map((node) => ({
        ...node,
        patients: node.patients.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.phone.includes(q) ||
            p.displayId.toLowerCase().includes(q)
        ),
      }))
      .filter(
        (node) =>
          node.name.toLowerCase().includes(q) || node.patients.length > 0
      );
  }, [hierarchy, search]);

  // ── Reassign handler ──────────────────────────────────────────────────────
  const handleReassign = async () => {
    if (!reassignPatient || !reassignTarget) return;
    try {
      await updatePatient.mutateAsync({
        id: reassignPatient.id,
        therapistId: reassignTarget,
      });
      setReassignPatient(null);
      setReassignTarget(null);
    } catch {
      // Error is handled by React Query
    }
  };

  const isLoading = therapistsLoading || patientsLoading;
  const isError = therapistsError || patientsError;

  const totalPatients = allPatients.length;
  const totalTherapists = therapists.length;

  return (
    <div className="flex flex-col h-full saai-page" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#DEF2F1' }}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div
        className="px-6 pb-6 shrink-0 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2B7A78 0%, #3AAFA9 100%)',
          paddingTop: '32px',
          boxShadow: '0 4px 24px rgba(43, 122, 120, 0.15)',
        }}
      >
        <div className="absolute -right-16 -top-16 rounded-full opacity-10"
          style={{ width: '200px', height: '200px', background: '#FEFFFF' }} />
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <button
            onClick={() => navigate('/doctor')}
            className="flex items-center justify-center rounded-xl w-10 h-10 transition-colors hover:bg-white/20"
            style={{ background: 'rgba(254,255,255,0.15)' }}
          >
            <ArrowLeft size={20} color="#FEFFFF" />
          </button>
          <div className="flex-1">
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#FEFFFF', letterSpacing: '-0.5px' }}>
              Therapist Hierarchy
            </h1>
            <p style={{ fontSize: '12px', color: 'rgba(254,255,255,0.7)' }}>
              View and manage therapist-patient assignments
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex gap-3 relative z-10">
          {[
            { label: 'Therapists', value: totalTherapists, icon: UserCog },
            { label: 'Total Patients', value: totalPatients, icon: Users },
            { label: 'Unassigned', value: unassigned.length, icon: AlertTriangle },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl"
                style={{ background: 'rgba(254,255,255,0.15)', border: '1px solid rgba(254,255,255,0.2)' }}
              >
                <Icon size={16} color="#FEFFFF" />
                <span style={{ fontSize: '18px', fontWeight: 800, color: '#FEFFFF' }}>{stat.value}</span>
                <span style={{ fontSize: '10px', color: 'rgba(254,255,255,0.7)', fontWeight: 600 }}>{stat.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-2xl mb-4"
          style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
        >
          <Search size={16} color="#2B7A78" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search therapists or patients…"
            className="flex-1 outline-none bg-transparent"
            style={{ fontSize: '14px', color: '#17252A' }}
          />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin mb-3" color="#3AAFA9" />
            <p style={{ fontSize: '14px', color: '#2B7A78', fontWeight: 600 }}>Loading hierarchy…</p>
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="rounded-2xl p-6 text-center" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
            <AlertTriangle size={32} color="#dc2626" className="mx-auto mb-2" />
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#b91c1c' }}>Failed to load data</p>
            <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '4px' }}>Please check backend connectivity.</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && therapists.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
            <UserCog size={40} color="#DEF2F1" className="mx-auto mb-3" />
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#17252A' }}>No therapists found</p>
            <p style={{ fontSize: '13px', color: '#2B7A78', marginTop: '4px' }}>
              Therapists will appear here once registered in the system.
            </p>
          </div>
        )}

        {/* ── Hierarchy Tree ─────────────────────────────────────────── */}
        {!isLoading && !isError && filteredHierarchy.length > 0 && (
          <div className="flex flex-col gap-3">
            {/* Doctor node (always shown) */}
            <div
              className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #2B7A78, #3AAFA9)', boxShadow: '0 4px 16px rgba(43, 122, 120, 0.15)' }}
            >
              <div className="rounded-xl flex items-center justify-center shrink-0"
                style={{ width: '36px', height: '36px', background: 'rgba(254,255,255,0.2)' }}>
                <Activity size={18} color="#FEFFFF" />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: '14px', fontWeight: 800, color: '#FEFFFF' }}>Doctor (You)</p>
                <p style={{ fontSize: '11px', color: 'rgba(254,255,255,0.7)' }}>
                  {totalTherapists} therapist{totalTherapists !== 1 ? 's' : ''} · {totalPatients} patient{totalPatients !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Therapist nodes */}
            {filteredHierarchy.map((node) => {
              const isExpanded = expandedTherapist === node.id;
              return (
                <div key={node.id} className="ml-4">
                  {/* Connector line */}
                  <div className="flex items-stretch">
                    <div className="w-4 flex flex-col items-center shrink-0">
                      <div style={{ width: '2px', height: '16px', background: '#3AAFA9', opacity: 0.4 }} />
                      <div style={{ width: '12px', height: '2px', background: '#3AAFA9', opacity: 0.4, alignSelf: 'flex-end' }} />
                    </div>
                    <button
                      onClick={() => setExpandedTherapist(isExpanded ? null : node.id)}
                      className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-all"
                      style={{
                        background: isExpanded ? '#FEFFFF' : '#FEFFFF',
                        border: isExpanded ? '2px solid #3AAFA9' : '1px solid #DEF2F1',
                        boxShadow: isExpanded ? '0 4px 16px rgba(43, 122, 120, 0.1)' : '0 2px 8px rgba(0,0,0,0.04)',
                      }}
                    >
                      <div className="rounded-xl flex items-center justify-center shrink-0"
                        style={{ width: '36px', height: '36px', background: isExpanded ? '#3AAFA9' : '#DEF2F1' }}>
                        <UserCog size={16} color={isExpanded ? '#FEFFFF' : '#2B7A78'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#17252A' }} className="truncate">
                          {node.name}
                        </p>
                        <p style={{ fontSize: '11px', color: '#2B7A78' }}>
                          {node.displayId} · {node.patients.length} patient{node.patients.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      {isExpanded
                        ? <ChevronDown size={18} color="#3AAFA9" />
                        : <ChevronRight size={18} color="#2B7A78" />
                      }
                    </button>
                  </div>

                  {/* Expanded patient list */}
                  {isExpanded && (
                    <div className="ml-8 mt-2 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                      {node.patients.length === 0 ? (
                        <div className="py-4 px-4 rounded-xl text-center" style={{ background: '#f8fffe', border: '1px dashed #DEF2F1' }}>
                          <p style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 600 }}>No patients assigned yet.</p>
                        </div>
                      ) : (
                        node.patients.map((patient) => (
                          <div
                            key={patient.id}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl"
                            style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}
                          >
                            <div className="w-3 flex flex-col items-center shrink-0">
                              <div style={{ width: '2px', height: '100%', background: '#DEF2F1' }} />
                            </div>
                            <div className="rounded-lg flex items-center justify-center shrink-0"
                              style={{ width: '32px', height: '32px', background: '#DEF2F1' }}>
                              <User size={14} color="#2B7A78" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p style={{ fontSize: '13px', fontWeight: 600, color: '#17252A' }} className="truncate">{patient.name}</p>
                              <p style={{ fontSize: '11px', color: '#2B7A78' }}>
                                {patient.phone} · {patient.condition ?? '—'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{
                                  background: patient.status === 'waiting' ? '#fef3c7' : patient.status === 'in-session' ? '#dbeafe' : '#dcfce7',
                                  color: patient.status === 'waiting' ? '#92400e' : patient.status === 'in-session' ? '#1e40af' : '#166534',
                                }}
                              >
                                {patient.status}
                              </span>
                              <button
                                onClick={(e) => { e.stopPropagation(); setReassignPatient(patient); }}
                                className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Reassign therapist"
                              >
                                <RefreshCw size={12} color="#2B7A78" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unassigned patients section */}
            {unassigned.length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <AlertTriangle size={14} color="#d97706" />
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#92400e' }}>
                    Unassigned Patients ({unassigned.length})
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {unassigned.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl"
                      style={{ background: '#fffbeb', border: '1px solid #fde68a' }}
                    >
                      <div className="rounded-lg flex items-center justify-center shrink-0"
                        style={{ width: '32px', height: '32px', background: '#fef3c7' }}>
                        <User size={14} color="#d97706" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#17252A' }} className="truncate">{patient.name}</p>
                        <p style={{ fontSize: '11px', color: '#92400e' }}>
                          {patient.phone} · No therapist assigned
                        </p>
                      </div>
                      <button
                        onClick={() => setReassignPatient(patient)}
                        className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors"
                        style={{ background: '#2B7A78', color: '#FEFFFF' }}
                      >
                        Assign
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Reassign Modal ───────────────────────────────────────────── */}
      {reassignPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div
            className="w-full max-w-sm rounded-3xl p-6"
            style={{ background: '#FEFFFF', boxShadow: '0 24px 64px rgba(0,0,0,0.15)' }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#17252A', marginBottom: '4px' }}>
              {reassignPatient.therapistId ? 'Reassign' : 'Assign'} Therapist
            </h3>
            <p style={{ fontSize: '12px', color: '#2B7A78', marginBottom: '16px' }}>
              Patient: <strong>{reassignPatient.name}</strong> ({reassignPatient.phone})
            </p>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto mb-4">
              {therapists.map((t) => {
                const isCurrent = reassignPatient.therapistId === t.id;
                const isSelected = reassignTarget === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setReassignTarget(t.id)}
                    disabled={isCurrent}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors"
                    style={{
                      background: isSelected ? '#DEF2F1' : isCurrent ? '#f8fafc' : '#FEFFFF',
                      border: isSelected ? '2px solid #3AAFA9' : '1px solid #DEF2F1',
                      opacity: isCurrent ? 0.5 : 1,
                      cursor: isCurrent ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div className="rounded-lg flex items-center justify-center shrink-0"
                      style={{ width: '32px', height: '32px', background: isSelected ? '#3AAFA9' : '#DEF2F1' }}>
                      <UserCog size={14} color={isSelected ? '#FEFFFF' : '#2B7A78'} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#17252A' }}>{t.name}</p>
                      <p style={{ fontSize: '11px', color: '#2B7A78' }}>
                        {isCurrent ? 'Currently assigned' : t.displayId}
                      </p>
                    </div>
                    {isSelected && <ChevronRight size={16} color="#3AAFA9" />}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setReassignPatient(null); setReassignTarget(null); }}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-colors"
                style={{ background: '#DEF2F1', color: '#2B7A78' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReassign}
                disabled={!reassignTarget || updatePatient.isPending}
                className="flex-1 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                style={{ background: '#2B7A78', color: '#FEFFFF' }}
              >
                {updatePatient.isPending ? 'Saving…' : 'Confirm'}
              </button>
            </div>

            {updatePatient.isError && (
              <p className="text-xs font-semibold text-red-600 text-center mt-3">
                Failed to reassign. Please try again.
              </p>
            )}
          </div>
        </div>
      )}

      <div className="md:hidden" style={{ borderTop: '1px solid #DEF2F1', background: '#FEFFFF' }}>
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}
