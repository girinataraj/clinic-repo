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
  ChevronRight, LogOut, Bell, Shield, HelpCircle, Edit3, Heart, 
  Droplets, Ruler, Scale, Phone, AlertTriangle, FileText, 
  Calendar, Star, ChevronLeft, User
} from 'lucide-react';

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
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans relative">
      <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
        
        {/* ── Mobile-First Header ── */}
        <div className="px-5 pt-10 pb-12 relative bg-gradient-to-br from-blue-700 to-indigo-600 dark:from-slate-900 dark:to-slate-800 rounded-b-[2rem] shadow-md z-30">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <User size={140} className="text-white transform rotate-12" />
          </div>
          
          <div className="flex items-center justify-between relative z-50 mb-6">
            <button
              onClick={() => navigate('/patient')}
              className="flex items-center justify-center rounded-xl w-11 h-11 bg-white/20 hover:bg-white/30 backdrop-blur-md transition-colors border border-white/20 shadow-sm"
            >
              <ChevronLeft size={22} className="text-white" />
            </button>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <button
                onClick={handleEditToggle}
                className={`flex items-center justify-center rounded-xl w-11 h-11 transition-colors backdrop-blur-md border border-white/20 shadow-sm ${editMode ? 'bg-amber-400/80' : 'bg-white/20 hover:bg-white/30'}`}
              >
                <Edit3 size={18} className={editMode ? 'text-amber-900' : 'text-white'} />
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center text-center relative z-10 pb-4">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 shadow-lg border border-white/20">
              <span className="text-[28px] font-black text-white">
                {user?.name?.charAt(0) || 'P'}
              </span>
            </div>
            <h2 className="text-[24px] font-black text-white tracking-tight leading-tight">{user?.name || 'Patient'}</h2>
            {user?.displayId && (
              <p className="text-[14px] text-blue-100 font-semibold mt-1">
                {user.displayId}
              </p>
            )}
            <div className="flex items-center justify-center gap-2 mt-3">
              <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-[11px] font-extrabold text-white uppercase tracking-wider">
                {user?.role ?? 'Patient'}
              </span>
            </div>
          </div>
          
          {editMode && (
            <div className="flex flex-col items-center pb-2 gap-3 relative z-10 w-full max-w-sm mx-auto animate-in fade-in slide-in-from-top-2">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-3 rounded-[16px] text-center text-[14px] font-bold outline-none bg-white/20 backdrop-blur-md text-white border border-white/30 placeholder:text-white/50 focus:border-white focus:bg-white/30 transition-all"
                placeholder="Name"
              />
              <input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-[16px] text-center text-[14px] font-bold outline-none bg-white/20 backdrop-blur-md text-white border border-white/30 placeholder:text-white/50 focus:border-white focus:bg-white/30 transition-all"
                placeholder="Email"
              />
              <button
                onClick={handleSaveProfile}
                disabled={updateProfile.isPending}
                className="w-full py-3.5 mt-1 rounded-[16px] text-[14px] font-black disabled:opacity-50 bg-white text-blue-700 hover:bg-blue-50 transition-transform active:scale-95 shadow-lg"
              >
                {updateProfile.isPending ? 'Saving…' : 'Save Changes'}
              </button>
              {updateProfile.isError && (
                <p className="text-[12px] font-bold text-red-300 bg-red-900/30 px-3 py-1.5 rounded-full mt-1">Failed to save profile</p>
              )}
            </div>
          )}
        </div>

        {/* ── Main Content Area ── */}
        <div className="px-5 -mt-12 relative z-40 flex flex-col gap-5">
          
          {/* Stats bar */}
          <div className="bg-white dark:bg-slate-900 rounded-[28px] p-2.5 flex gap-2.5 shadow-xl shadow-blue-900/5 border border-slate-100 dark:border-slate-800">
            {[
              { label: 'Sessions', value: completedSessions },
              { label: 'Reports', value: totalReports },
              { label: 'Exercises', value: exerciseCount },
            ].map((s) => (
              <div key={s.label} className="flex-1 flex flex-col items-center justify-center py-5 rounded-[22px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100/50 dark:border-slate-700/50">
                <span className="text-[22px] font-black text-slate-900 dark:text-white leading-none mb-1.5">{s.value}</span>
                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{s.label}</span>
              </div>
            ))}
          </div>

          {/* Next Appointment */}
          {nextAppt ? (
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-700 dark:to-emerald-600 rounded-[22px] p-5 shadow-sm shadow-emerald-500/20 relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
              <div className="flex items-start gap-4 relative z-10">
                <div className="flex items-center justify-center rounded-[16px] w-12 h-12 bg-white/20 backdrop-blur-sm shrink-0 shadow-sm border border-white/20">
                  <Calendar size={20} className="text-white" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <p className="text-[11px] font-black text-emerald-100 mb-1 uppercase tracking-wider">Next Appointment</p>
                  <p className="text-[16px] font-black text-white truncate">{nextAppt.doctorName ?? 'Consultation'}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg border border-white/20">
                      {new Date(nextAppt.datetime).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </span>
                    <span className="px-2.5 py-1 bg-white/20 backdrop-blur-sm text-white text-[11px] font-bold rounded-lg border border-white/20">
                      {new Date(nextAppt.datetime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[22px] p-5 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="flex items-center justify-center rounded-[16px] w-12 h-12 bg-white dark:bg-slate-800 shrink-0 shadow-sm border border-slate-100 dark:border-slate-700">
                  <Calendar size={20} className="text-slate-400 dark:text-slate-500" />
                </div>
                <div className="flex-1 pt-0.5">
                  <p className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 mb-0.5">No Upcoming Visits</p>
                  <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400">Schedule a session from the dashboard.</p>
                </div>
              </div>
            </div>
          )}

          {/* Health Info Section */}
          {healthInfo.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white mb-4">Health Overview</h3>
              <div className="grid grid-cols-2 gap-3">
                {healthInfo.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-center gap-3 p-3.5 rounded-[18px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-center rounded-2xl shrink-0 w-10 h-10 shadow-sm border border-white/50 dark:border-slate-700" style={{ background: item.bg }}>
                        <Icon size={18} color={item.color} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">{item.label}</p>
                        <p className="text-[14px] font-black text-slate-900 dark:text-white truncate">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conditions Section */}
          {conditions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-[22px] border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
              <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white mb-3">Diagnoses & Conditions</h3>
              <div className="flex flex-col gap-2.5">
                {conditions.map((c) => (
                  <div key={c.label} className="flex items-center justify-between p-3.5 rounded-[16px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full shrink-0 w-2.5 h-2.5 shadow-sm" style={{ background: c.color }} />
                      <span className="text-[13px] font-extrabold text-slate-800 dark:text-slate-200">{c.label}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-[11px] font-black shadow-sm" style={{ background: c.bg, color: c.color }}>
                      {c.severity}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          <div className="bg-red-50 dark:bg-red-900/10 rounded-[22px] border border-red-100 dark:border-red-900/30 p-5">
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center rounded-[16px] w-12 h-12 bg-red-100 dark:bg-red-900/40 shrink-0">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1 pt-0.5">
                <p className="text-[11px] font-black text-red-600 dark:text-red-500 mb-1 uppercase tracking-wider">Emergency Contact</p>
                <p className="text-[15px] font-extrabold text-red-900 dark:text-red-100">Sundar Sharma (Father)</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Phone size={12} className="text-red-600 dark:text-red-400" />
                  <span className="text-[13px] font-bold text-red-700 dark:text-red-400">+91 98765 43210</span>
                </div>
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-[18px] bg-white dark:bg-slate-900 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 text-[14px] font-black transition-transform active:scale-[0.98] shadow-sm hover:bg-red-50 dark:hover:bg-red-900/10"
          >
            <LogOut size={18} strokeWidth={2.5} />
            Sign Out
          </button>

          <p className="text-center text-[11px] font-bold text-slate-400 dark:text-slate-500 mt-2 mb-4 uppercase tracking-widest">
            SAAI Physiotherapy
          </p>
        </div>
      </div>

      {/* Logout Confirm Modal */}
      {showLogoutConfirm && (
        <div className="absolute inset-0 flex items-end justify-center bg-slate-900/60 backdrop-blur-md z-50 animate-in fade-in" onClick={() => setShowLogoutConfirm(false)}>
          <div className="w-full px-5 pt-8 pb-10 bg-white dark:bg-slate-900 rounded-t-[32px] border-t border-slate-100 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-center mb-5">
              <div className="flex items-center justify-center rounded-[24px] w-16 h-16 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30">
                <LogOut size={28} className="text-red-600 dark:text-red-500" />
              </div>
            </div>
            <p className="text-center text-[20px] font-black text-slate-900 dark:text-white mb-2">Sign Out?</p>
            <p className="text-center text-[14px] font-medium text-slate-500 dark:text-slate-400 mb-8 max-w-xs mx-auto leading-relaxed">
              You will need to log back in to access your health records and appointments.
            </p>
            <div className="flex gap-3 max-w-sm mx-auto w-full">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 rounded-[18px] bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[14px] font-black transition-transform active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-4 rounded-[18px] bg-red-600 hover:bg-red-700 text-white text-[14px] font-black shadow-lg shadow-red-600/20 transition-transform active:scale-95"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav role="patient" />
      </div>
    </div>
  );
}