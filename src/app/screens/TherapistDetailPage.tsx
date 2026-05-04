import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { useStaffUsers } from '../../hooks/useStaff';
import { usePatients } from '../../hooks/usePatients';
import {
  ArrowLeft, UserCog, Users, User, Activity, Zap, CheckCircle,
  Phone, Clock, Eye, ClipboardList, FileText, Loader2,
} from 'lucide-react';

const statusConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  waiting:      { label: 'Waiting',    color: '#262842', bg: '#E8E9F1', dot: '#262842' },
  'in-session': { label: 'In Session', color: '#17252A', bg: '#E8E9F1', dot: '#3B3E66' },
  completed:    { label: 'Completed',  color: '#FEFFFF', bg: '#3B3E66', dot: '#FEFFFF' },
};

const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('').toUpperCase();

export function TherapistDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: therapists = [], isLoading: therapistsLoading } = useStaffUsers({ role: 'nurse' });
  const { data: patientsData, isLoading: patientsLoading } = usePatients({ limit: 200 });

  const therapist = useMemo(() => therapists.find(t => t.id === id), [therapists, id]);
  const allPatients = patientsData?.data ?? [];

  const assignedPatients = useMemo(
    () => allPatients.filter(p => p.therapistId === id),
    [allPatients, id]
  );

  const waiting = assignedPatients.filter(p => p.status === 'waiting').length;
  const inSession = assignedPatients.filter(p => p.status === 'in-session').length;
  const completed = assignedPatients.filter(p => p.status === 'completed').length;

  const isLoading = therapistsLoading || patientsLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col h-full items-center justify-center" style={{ backgroundColor: '#E8E9F1' }}>
        <Loader2 size={32} className="animate-spin mb-3" color="#3B3E66" />
        <p style={{ fontSize: '14px', color: '#262842', fontWeight: 600 }}>Loading therapist details…</p>
      </div>
    );
  }

  if (!therapist) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: '#E8E9F1' }}>
        <div className="px-5 py-6" style={{ background: 'linear-gradient(135deg, #262842 0%, #3B3E66 100%)' }}>
          <button onClick={() => navigate('/doctor/therapists')} className="flex items-center gap-2 text-white text-sm font-semibold">
            <ArrowLeft size={18} /> Back
          </button>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <UserCog size={48} color="#E8E9F1" className="mx-auto mb-3" />
            <p style={{ fontSize: '16px', fontWeight: 700, color: '#17252A' }}>Therapist not found</p>
            <p style={{ fontSize: '13px', color: '#262842', marginTop: '4px' }}>This therapist may have been removed.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#E8E9F1' }}>
      {/* Header */}
      <div
        className="px-5 pb-8 shrink-0 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #262842 0%, #3B3E66 100%)',
          paddingTop: '28px',
          boxShadow: '0 4px 24px rgba(38, 40, 66, 0.15)',
        }}
      >
        <div className="absolute -right-16 -top-16 rounded-full opacity-10" style={{ width: '200px', height: '200px', background: '#FEFFFF' }} />
        <div className="absolute right-10 top-20 rounded-full opacity-20" style={{ width: '80px', height: '80px', background: '#FEFFFF' }} />

        <div className="flex items-center gap-3 mb-6 relative z-10">
          <button
            onClick={() => navigate('/doctor/therapists')}
            className="flex items-center justify-center rounded-xl w-9 h-9"
            style={{ background: 'rgba(254,255,255,0.15)' }}
          >
            <ArrowLeft size={18} color="#FEFFFF" />
          </button>
          <div className="flex-1">
            <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#FEFFFF', letterSpacing: '-0.5px' }}>Therapist Profile</h1>
            <p style={{ fontSize: '11px', color: 'rgba(254,255,255,0.7)' }}>View details & assigned patients</p>
          </div>
        </div>

        {/* Profile card */}
        <div className="flex items-center gap-4 relative z-10">
          <div
            className="rounded-2xl flex items-center justify-center shrink-0"
            style={{ width: '64px', height: '64px', background: 'rgba(254,255,255,0.2)', border: '2px solid rgba(254,255,255,0.3)' }}
          >
            <span style={{ fontSize: '22px', fontWeight: 800, color: '#FEFFFF' }}>{getInitials(therapist.name)}</span>
          </div>
          <div className="flex-1">
            <p style={{ fontSize: '20px', fontWeight: 800, color: '#FEFFFF', letterSpacing: '-0.3px' }}>{therapist.name}</p>
            <p style={{ fontSize: '12px', color: 'rgba(254,255,255,0.7)', marginTop: '2px' }}>
              {therapist.displayId} · Therapist · SAAI Clinic
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-8" style={{ marginTop: '-16px', position: 'relative', zIndex: 10 }}>
        {/* Stats */}
        <div className="flex gap-3 mb-5">
          {[
            { label: 'Patients', value: assignedPatients.length, icon: Users, bg: '#E8E9F1', iconColor: '#3B3E66' },
            { label: 'Active', value: inSession, icon: Zap, bg: '#E8E9F1', iconColor: '#3B3E66' },
            { label: 'Waiting', value: waiting, icon: Clock, bg: '#E8E9F1', iconColor: '#3B3E66' },
            { label: 'Done', value: completed, icon: CheckCircle, bg: '#E8E9F1', iconColor: '#3B3E66' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="flex-1 rounded-2xl p-3 flex flex-col items-center justify-center"
                style={{ background: '#FEFFFF', boxShadow: '0 4px 16px rgba(23,37,42,0.06)', border: '1px solid #E8E9F1' }}
              >
                <div className="rounded-lg flex items-center justify-center mb-1.5" style={{ width: '32px', height: '32px', background: s.bg }}>
                  <Icon size={16} color={s.iconColor} />
                </div>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#17252A', lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontSize: '10px', color: '#262842', fontWeight: 600, marginTop: '4px' }}>{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Assigned patients */}
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#17252A' }}>Assigned Patients</h3>
          <span
            className="px-3 py-1 rounded-full"
            style={{ fontSize: '11px', color: '#262842', fontWeight: 600, background: '#FEFFFF', border: '1px solid #E8E9F1' }}
          >
            {assignedPatients.length} patient{assignedPatients.length !== 1 ? 's' : ''}
          </span>
        </div>

        {assignedPatients.length === 0 ? (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#FEFFFF', border: '1px solid #E8E9F1' }}>
            <Users size={36} color="#E8E9F1" className="mx-auto mb-3" />
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#17252A' }}>No patients assigned</p>
            <p style={{ fontSize: '12px', color: '#262842', marginTop: '4px' }}>
              Assign patients from the Therapist Hierarchy page.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {assignedPatients.map(patient => {
              const config = statusConfig[patient.status] ?? statusConfig['waiting'];
              return (
                <div
                  key={patient.id}
                  className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                  style={{
                    background: '#FEFFFF',
                    boxShadow: '0 2px 12px rgba(23, 37, 42, 0.04)',
                    border: `1px solid ${patient.status === 'in-session' ? '#3B3E66' : '#E8E9F1'}`,
                  }}
                >
                  {/* Patient info */}
                  <div className="flex items-center gap-3 p-4">
                    <div
                      className="rounded-xl flex items-center justify-center shrink-0"
                      style={{ width: '44px', height: '44px', background: '#E8E9F1' }}
                    >
                      <span style={{ fontSize: '15px', fontWeight: 700, color: '#262842' }}>{getInitials(patient.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p style={{ fontSize: '14px', fontWeight: 700, color: '#17252A' }} className="truncate">{patient.name}</p>
                          <p style={{ fontSize: '12px', color: '#262842', marginTop: '1px' }}>{patient.condition ?? '—'} · {patient.age} yrs</p>
                        </div>
                        <span
                          className="px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shrink-0"
                          style={{ background: config.bg, color: config.color, fontSize: '11px', fontWeight: 600 }}
                        >
                          <div className="rounded-full" style={{ width: '5px', height: '5px', background: config.dot }} />
                          {config.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info chips */}
                  <div className="flex gap-2 px-4 pb-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: '#E8E9F1' }}>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#262842' }}>🆔 {patient.displayId}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{ background: '#E8E9F1' }}>
                      <Phone size={10} color="#262842" />
                      <span style={{ fontSize: '10px', fontWeight: 600, color: '#262842' }}>{patient.phone}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex divide-x" style={{ borderTop: '1px solid #E8E9F1' }}>
                    <button
                      onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 transition-colors hover:bg-slate-50"
                      style={{ color: '#262842', fontSize: '12px', fontWeight: 600 }}
                    >
                      <Eye size={14} />
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/doctor/intake?phone=${encodeURIComponent(patient.phone)}&patientId=${patient.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 transition-colors hover:bg-slate-50"
                      style={{ color: '#3B3E66', fontSize: '12px', fontWeight: 600 }}
                    >
                      <ClipboardList size={14} />
                      Assess
                    </button>
                    <button
                      onClick={() => navigate(`/doctor/patient/${patient.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 transition-colors hover:bg-slate-50"
                      style={{ color: '#17252A', fontSize: '12px', fontWeight: 600 }}
                    >
                      <FileText size={14} />
                      Report
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="md:hidden" style={{ borderTop: '1px solid #E8E9F1', background: '#FEFFFF' }}>
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}
