import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { BottomNav } from '../components/BottomNav';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { usePatientAppointments } from '../../hooks/useAppointments';
import { useEvaluations } from '../../hooks/useEvaluations';
import { useExercisePlans } from '../../hooks/useExercisePlans';
import {
  ChevronRight,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  Edit3,
  Heart,
  Droplets,
  Ruler,
  Scale,
  Phone,
  AlertTriangle,
  FileText,
  Calendar,
  Star,
  ChevronLeft,
} from 'lucide-react';



// NOTE: healthInfo and conditions should be fetched from /api/users/me
// or a patient-specific profile endpoint when available.
// Currently NO backend API for these — DO NOT hardcode fake values.
const healthInfo: { label: string; value: string; icon: any; color: string; bg: string }[] = [];
const conditions: { label: string; severity: string; color: string; bg: string }[] = [];



export function PatientProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const patientId = user?.patient_id ?? null;
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: apptData } = usePatientAppointments(patientId);
  const { data: evalData } = useEvaluations({ patientId: patientId ?? undefined, limit: 100 });
  const { data: planData } = useExercisePlans(patientId);

  const appointments = apptData?.data ?? [];
  const completedSessions = appointments.filter((a) => a.status === 'completed').length;
  const totalReports = evalData?.data?.length ?? 0;
  const exerciseCount = (planData?.data?.[0]?.items ?? []).length;

  // Next upcoming appointment
  const nextAppt = appointments.find((a) => a.status === 'pending' || a.status === 'confirmed');

  const handleEditToggle = () => {
    if (!editMode && profile) {
      setEditName(profile.name);
      setEditEmail(profile.email);
    }
    setEditMode(!editMode);
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile.mutateAsync({ name: editName, email: editEmail });
      setEditMode(false);
    } catch { /* handled by RQ */ }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-blue-50/50 dark:bg-slate-950 font-sans relative">
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div
          className="relative bg-gradient-to-br from-blue-900 via-blue-600 to-sky-400 dark:from-slate-900 dark:via-slate-800 dark:to-slate-800"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Decorative circles */}
            <div className="absolute -right-10 -top-10 rounded-full opacity-20 bg-white w-[120px] h-[120px]" />
            <div className="absolute right-16 top-12 rounded-full opacity-10 bg-white w-[70px] h-[70px]" />
          </div>

          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pb-2 pt-5 relative z-30">
            <button
              onClick={() => navigate('/patient')}
              className="flex items-center justify-center rounded-xl w-9 h-9 bg-white/20 hover:bg-white/30 transition-colors"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <span className="text-[16px] font-extrabold text-white">My Profile</span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={handleEditToggle}
                className={`flex items-center justify-center rounded-xl w-9 h-9 transition-colors ${editMode ? 'bg-amber-400/35' : 'bg-white/20 hover:bg-white/30'}`}
              >
                <Edit3 size={16} className="text-white" />
              </button>
            </div>
          </div>

          {/* Profile hero */}
          <div className="flex flex-col items-center pb-8 pt-2 px-5 text-center relative z-30">
            <h2 className="text-[32px] font-extrabold text-white leading-tight">{user?.name || 'Patient'}</h2>
            {user?.displayId && (
              <p className="text-[15px] text-white/85 mt-1 font-medium">
                {user.displayId}
              </p>
            )}
            <div className="flex items-center justify-center gap-2 mt-4">
              {[{ text: user?.role ?? 'Patient' }].map((tag) => (
                <span
                  key={tag.text}
                  className="px-3 py-1 rounded-full bg-white/25 text-[12px] font-bold text-white capitalize"
                >
                  {tag.text}
                </span>
              ))}
            </div>
          </div>
          {editMode && (
            <div className="flex flex-col items-center px-5 pb-6 gap-3 relative z-30">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full max-w-xs px-4 py-2.5 rounded-xl text-center text-sm font-bold outline-none bg-white/20 text-white border border-white/30 placeholder:text-white/50"
                placeholder="Name"
              />
              <input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full max-w-xs px-4 py-2.5 rounded-xl text-center text-sm font-bold outline-none bg-white/20 text-white border border-white/30 placeholder:text-white/50"
                placeholder="Email"
              />
              <button
                onClick={handleSaveProfile}
                disabled={updateProfile.isPending}
                className="px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 bg-white text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {updateProfile.isPending ? 'Saving…' : 'Save Profile'}
              </button>
              {updateProfile.isError && (
                <p className="text-xs font-semibold text-red-300">Failed to save.</p>
              )}
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="mx-4 -mt-4 rounded-2xl p-4 flex gap-0 relative z-20 bg-white dark:bg-slate-800 border border-indigo-50 dark:border-slate-700 shadow-[0_8px_32px_rgba(37,99,235,0.12)] dark:shadow-none">
          {[
            { label: 'Sessions', value: completedSessions, color: '#2563eb' },
            { label: 'Reports', value: totalReports, color: '#7c3aed' },
            { label: 'Exercises', value: exerciseCount, color: '#10b981' },
          ].map((s, i) => (
            <div key={s.label} className={`flex-1 flex flex-col items-center ${i !== 0 ? 'border-l border-slate-100 dark:border-slate-700' : ''}`}>
              <span className="text-[22px] font-black" style={{ color: s.color }}>{s.value}</span>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="px-4 pt-4 pb-4 flex flex-col gap-4">
          {/* Next Appointment */}
          {nextAppt ? (
            <div
              className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50"
            >
              <div className="flex items-center justify-center rounded-2xl shrink-0 w-12 h-12 bg-emerald-500">
                <Calendar size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold text-emerald-600 dark:text-emerald-500">NEXT APPOINTMENT</p>
                <p className="text-[14px] font-extrabold text-emerald-900 dark:text-emerald-100">{nextAppt.doctorName ?? 'Doctor'}</p>
                <p className="text-[12px] text-emerald-600 dark:text-emerald-500 mt-0.5">
                  {new Date(nextAppt.datetime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · {new Date(nextAppt.datetime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <ChevronRight size={18} color="#059669" />
            </div>
          ) : (
            <div
              className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
            >
              <div className="flex items-center justify-center rounded-2xl shrink-0 w-12 h-12 bg-slate-200 dark:bg-slate-700">
                <Calendar size={22} className="text-slate-400 dark:text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500">NO UPCOMING APPOINTMENTS</p>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">Book your next session with your doctor</p>
              </div>
            </div>
          )}

          {/* Health Info */}
          <div>
            <p className="text-[14px] font-extrabold text-slate-900 dark:text-white mb-3">Health Overview</p>
            <div className="grid grid-cols-2 gap-3">
              {healthInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm"
                  >
                    <div className="flex items-center justify-center rounded-xl shrink-0 w-10 h-10"
                      style={{ background: item.bg }}>
                      <Icon size={18} color={item.color} />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">{item.label}</p>
                      <p className="text-[15px] font-extrabold text-slate-900 dark:text-white">{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Conditions */}
          <div>
            <p className="text-[14px] font-extrabold text-slate-900 dark:text-white mb-3">Diagnoses & Conditions</p>
            <div className="flex flex-col gap-2">
              {conditions.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full shrink-0 w-2 h-2" style={{ background: c.color }} />
                    <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{c.label}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ background: c.bg, color: c.color }}>
                    {c.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50"
          >
            <div className="flex items-center justify-center rounded-2xl shrink-0 w-11 h-11 bg-red-500">
              <AlertTriangle size={20} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-bold text-red-600 dark:text-red-500">EMERGENCY CONTACT</p>
              <p className="text-[14px] font-extrabold text-red-900 dark:text-red-100">Sundar Sharma (Father)</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Phone size={11} className="text-red-500" />
                <span className="text-[12px] font-semibold text-red-600 dark:text-red-500">+91 98765 43210</span>
              </div>
            </div>
            <ChevronRight size={16} className="text-red-500" />
          </div>



          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 dark:bg-transparent border-[1.5px] border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-500 text-[14px] font-bold transition-colors hover:bg-red-100 dark:hover:bg-red-900/20"
          >
            <LogOut size={18} />
            Sign Out
          </button>

          <p className="text-center text-[11px] text-slate-300 dark:text-slate-600">
            SAAI Physiotherapy v2.0 · Secure Health Platform
          </p>
        </div>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div
          className="absolute inset-0 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm z-50"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-full px-5 pt-6 pb-8 bg-white dark:bg-slate-900 rounded-t-[28px] border-t border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center rounded-2xl w-14 h-14 bg-red-50 dark:bg-red-900/20">
                <LogOut size={24} className="text-red-600 dark:text-red-500" />
              </div>
            </div>
            <p className="text-center text-[18px] font-extrabold text-slate-900 dark:text-white mb-1.5">Sign Out?</p>
            <p className="text-center text-[13px] text-slate-500 dark:text-slate-400 mb-6">
              You'll need to log back in to access your health records.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border-[1.5px] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[14px] font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white text-[14px] font-bold"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden">
        <BottomNav role="patient" />
      </div>
    </div>
  );
}