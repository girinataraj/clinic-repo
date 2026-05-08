import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { ThemeToggle } from '../components/ThemeToggle';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { useAppConfigScope } from '../../hooks/useAppConfig';
import {
  LogOut, Edit3, Award, Clock, Users,
  ClipboardList, ChevronLeft, MapPin, Phone, CheckCircle,
} from 'lucide-react';

// NOTE: certifications & shiftInfo are kept as UI structure placeholders.
// These should be fetched from a /api/users/me endpoint when available.
// Currently there is NO backend API for these — DO NOT hardcode fake values.
const certifications: { name: string; year: string; verified: boolean }[] = [];

const shiftInfo = {
  shift: '—',
  time: '—',
  ward: '—',
  supervisor: '—',
};



export function NurseProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: clinicConfig } = useAppConfigScope('clinic');

  // Build profile-driven tags from backend fields (show only when available)
  const profileTags: string[] = [];
  if (profile?.experience) profileTags.push(profile.experience);
  if (profile?.specialization) profileTags.push(profile.specialization);
  if (profile?.city) profileTags.push(profile.city);

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
    <div className="flex flex-col h-full w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 font-sans relative">
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-20 md:pb-6">
        {/* Header */}
        <div
          className="relative overflow-hidden shrink-0 bg-gradient-to-br from-[#0d2b27] to-[#0f766e] dark:from-slate-900 dark:to-teal-950 z-30"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pt-6 pb-2 max-w-5xl mx-auto relative z-50">
            <button
              onClick={() => navigate('/nurse')}
              className="flex items-center justify-center rounded-xl bg-white/20 hover:bg-white/30 transition-colors w-11 h-11"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 text-base font-extrabold text-white">My Profile</span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={handleEditToggle}
                className={`flex items-center justify-center rounded-xl transition-colors w-11 h-11 ${editMode ? 'bg-amber-400/30' : 'bg-white/20 hover:bg-white/30'}`}
              >
                <Edit3 className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Profile hero */}
          <div className="relative z-10 flex flex-col items-center text-center mt-2 pb-10 px-5">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">{profile?.name || user?.name || 'Therapist'}</h2>
            <p className="text-sm text-white/75 mt-0.5">{profile?.specialization || 'Therapist'}</p>
            {profileTags.length > 0 && (
              <div className="flex items-center flex-wrap justify-center gap-2 mt-3">
                {profileTags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-white/20 text-[11px] font-bold text-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          {editMode && (
            <div className="relative z-10 flex flex-col items-center px-5 pb-6 gap-3">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full max-w-xs px-4 py-2.5 rounded-xl text-center text-sm font-bold outline-none bg-white/20 text-white border border-white/30"
                placeholder="Name"
              />
              <input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full max-w-xs px-4 py-2.5 rounded-xl text-center text-sm font-bold outline-none bg-white/20 text-white border border-white/30"
                placeholder="Email"
              />
              <button
                onClick={handleSaveProfile}
                disabled={updateProfile.isPending}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-white text-teal-700 disabled:opacity-50"
              >
                {updateProfile.isPending ? 'Saving…' : 'Save Profile'}
              </button>
              {updateProfile.isError && (
                <p className="text-xs font-semibold text-red-300">Failed to save. Try again.</p>
              )}
            </div>
          )}
        </div>

        <div className="px-6 max-w-5xl mx-auto w-full space-y-5 mt-4 relative z-10 pb-6">
          {/* Stats bar */}
          <div className="bg-white dark:bg-slate-800 border border-teal-100 dark:border-slate-700/60 rounded-2xl p-4 flex shadow-[0_8px_32px_rgba(15,118,110,0.1)] dark:shadow-none">
            {[
              { label: "Today's Pts", value: '—', icon: Users, color: 'text-teal-600 dark:text-teal-400' },
              { label: 'Intakes', value: '—', icon: ClipboardList, color: 'text-blue-600 dark:text-blue-400' },
              { label: 'Hours', value: '—', icon: Clock, color: 'text-amber-500 dark:text-amber-400' },
            ].map((s, i) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className={`flex-1 flex flex-col items-center ${i !== 0 ? 'border-l border-slate-100 dark:border-slate-700' : ''}`}>
                  <Icon className={`w-4 h-4 mb-1 ${s.color}`} />
                  <span className={`text-[22px] font-black ${s.color} leading-none`}>{s.value}</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-0.5">{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* Today's Shift */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50/50 dark:from-teal-900/20 dark:to-emerald-900/10 rounded-2xl border border-teal-100 dark:border-teal-900/30 p-5">
            <p className="text-[10px] font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-3">Today's Shift</p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-xl w-9 h-9 bg-teal-700 dark:bg-teal-600 shrink-0">
                  <Clock className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{shiftInfo.shift}</p>
                  <p className="text-xs text-teal-700 dark:text-teal-400">{shiftInfo.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-xl w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800/30 shrink-0">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-white">{shiftInfo.ward}</p>
                  <p className="text-xs text-teal-700 dark:text-teal-400">Supervisor: {shiftInfo.supervisor}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <div className="flex items-center justify-between mb-3 px-1">
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">Certifications</p>
              {certifications.length > 0 && (
                <button className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300">View All</button>
              )}
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
              {certifications.map((cert, i) => (
                <div
                  key={cert.name}
                  className={`flex items-center gap-3 px-4 py-3 ${i < certifications.length - 1 ? 'border-b border-slate-50 dark:border-slate-700/50' : ''}`}
                >
                  <div className={`flex items-center justify-center rounded-xl shrink-0 w-10 h-10 ${cert.verified ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-amber-50 dark:bg-amber-900/30'}`}>
                    <Award className={`w-4 h-4 ${cert.verified ? 'text-emerald-500 dark:text-emerald-400' : 'text-amber-500 dark:text-amber-400'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{cert.name}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">Since {cert.year}</p>
                  </div>
                  {cert.verified ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-bold">
                      Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-center rounded-2xl w-11 h-11 bg-blue-50 dark:bg-blue-900/30 shrink-0">
              <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Contact</p>
              <p className="text-base font-extrabold text-slate-900 dark:text-white">
                {clinicConfig?.contact?.phone || profile?.phone || '—'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {clinicConfig?.contact?.email || profile?.email || 'Not provided'}
              </p>
            </div>
          </div>



          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Logout confirm modal */}
      {showLogoutConfirm && (
        <div
          className="absolute inset-0 flex items-end justify-center z-50 transition-opacity bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-full px-5 pt-6 pb-8 bg-white dark:bg-slate-900 rounded-t-[28px]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center rounded-2xl w-14 h-14 bg-red-50 dark:bg-red-900/20">
                <LogOut className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <p className="text-center text-lg font-extrabold text-slate-900 dark:text-white mb-1.5">Sign Out?</p>
            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-6">
              Your session will end and you'll need to log in again.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-4 rounded-2xl bg-red-600 dark:bg-red-600 text-white text-sm font-bold hover:bg-red-700 dark:hover:bg-red-500 transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 z-10">
        <BottomNav role="nurse" />
      </div>
    </div>
  );
}