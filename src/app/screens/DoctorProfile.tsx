import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { BottomNav } from '../components/BottomNav';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { usePatients } from '../../hooks/usePatients';
import { useAllEvaluations } from '../../hooks/useEvaluations';
import { useAppConfigScope } from '../../hooks/useAppConfig';
import {
  LogOut,
  Edit3,
  Award,
  Users,
  Clock,
  ChevronLeft,
  Phone,
  Stethoscope,
  CheckCircle,
  TrendingUp,
  GraduationCap,
  MapPin,
} from 'lucide-react';

const doctorDetails = {
  name: 'Dr. SV. Sathish Kumar',
  qualifications: 'MPT (Cardio-Resp), PGDFM, DYT, CDNT',
  role: 'Consultant Physiotherapist',
  clinicName: 'Saai Physiotherapy Clinic',
  tagline: '"Getting better every day"',
  about: [
    '16 years of clinical experience',
    '16 years as HOD at Erode Sudha Hospitals',
    'Strong professional network',
    'Author of 3 awareness books',
    '6000+ pain cases treated',
  ],
  contact: {
    address: '20A/10, Sakthi Nagar, Sengodapalayam, Thindal, Erode Dt – 638012, Tamil Nadu, India',
    email: 'saaiphysioclinicerode@gmail.com',
    phone: '94864 05778',
    timings: '9:00 AM – 2:00 PM | 3:00 PM – 8:00 PM',
    sunday: 'By Appointment',
    services: 'OPD, IPD, Day Care, Home Visit, VIP Care',
  },
};

const specializations: string[] = [
  'Pain Rehabilitation',
  'Orthopaedic Rehabilitation',
  'Neurological Rehabilitation',
  'Cardio & Respiratory Rehabilitation',
  'Specialized Services',
];

const scopeOfServices = [
  {
    category: 'Pain Rehabilitation',
    items: ['Joint Pain', 'Fibromyalgia', 'Chronic Pain Disorders'],
  },
  {
    category: 'Orthopaedic Rehabilitation',
    items: ['Post-operative Stiffness', 'Post-surgical Conditions', 'TKR & THR', 'Poly Trauma'],
  },
  {
    category: 'Neurological Rehabilitation',
    items: ['Bells Palsy', 'Stroke', 'Parkinsonism', 'GBS', 'Spinal Cord Injury'],
  },
  {
    category: 'Cardio & Respiratory Rehabilitation',
    items: ['Post PTCA', 'Pre & Post CABG', 'Valvular Heart Surgery Care', 'COPD', 'Ventilator & BiPAP Care'],
  },
  {
    category: 'Specialized Services',
    items: ['Geriatric', 'Gynaecological', 'Paediatric', 'Sports', 'Tracheostomy'],
  },
];

const education = [
  { degree: 'MPT (Cardio-Resp)' },
  { degree: 'PGDFM' },
  { degree: 'DYT' },
  { degree: 'CDNT' },
];

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  'in-session': { color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-900/30', label: 'Active' },
  'waiting': { color: 'text-slate-800 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800', label: 'Waiting' },
  'completed': { color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30', label: 'Done' },
};



export function DoctorProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();
  const { data: patientsData } = usePatients({ limit: 200 }, true);
  const { data: evaluationsData } = useAllEvaluations({ limit: 200 });
  const { data: clinicConfig } = useAppConfigScope('clinic');

  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = evaluationsData?.data?.filter(e => e.createdAt?.startsWith(todayStr))?.length ?? 0;

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
    <div className="flex flex-col h-full font-sans bg-[#E8E9F1] dark:bg-slate-950 relative">
      <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
        {/* Header */}
        <div
          className="relative rounded-b-3xl bg-gradient-to-br from-[#262842] to-[#3B3E66] dark:from-slate-900 dark:to-slate-800 shadow-[0_4px_24px_rgba(38,40,66,0.15)] dark:shadow-none"
        >
          <div className="absolute inset-0 overflow-hidden rounded-b-3xl pointer-events-none">
            <div className="absolute -right-16 -top-16 rounded-full opacity-10 bg-white w-[200px] h-[200px]" />
            <div className="absolute left-10 bottom-10 rounded-full opacity-10 bg-white w-[100px] h-[100px]" />
          </div>

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pb-2 pt-8 relative z-50">
            <button
              onClick={() => navigate('/doctor')}
              className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20 w-11 h-11 bg-white/15"
            >
              <ChevronLeft size={20} className="text-white" />
            </button>
            <span className="absolute left-1/2 -translate-x-1/2 text-[16px] font-bold text-white">My Profile</span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                onClick={handleEditToggle}
                className={`flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20 w-11 h-11 ${editMode ? 'bg-amber-400/30' : 'bg-white/15'}`}
              >
                <Edit3 size={18} color={editMode ? '#fbbf24' : '#FEFFFF'} />
              </button>
            </div>
          </div>

          {/* Profile hero */}
          <div className="relative z-30 flex flex-col items-center text-center mt-4 pb-12 px-6">
            <h2 className="text-[28px] md:text-[32px] font-extrabold text-white tracking-tight leading-tight">
              {doctorDetails.name}
            </h2>
            <p className="text-[14px] text-teal-200 font-semibold mt-1">
              {doctorDetails.qualifications}
            </p>
            <p className="text-[13px] text-white/90 font-medium mt-0.5">
              {doctorDetails.role} · {doctorDetails.clinicName}
            </p>
            <p className="text-[12px] italic text-teal-100/80 mt-1">
              {doctorDetails.tagline}
            </p>
          </div>
          {editMode && (
            <div className="relative z-30 flex flex-col items-center px-6 pb-6 gap-3">
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
                className="px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50 bg-white text-slate-900"
              >
                {updateProfile.isPending ? 'Saving…' : 'Save Profile'}
              </button>
              {updateProfile.isError && (
                <p className="text-xs font-semibold text-red-300">Failed to save. Try again.</p>
              )}
            </div>
          )}
        </div>

        {/* Stats bar */}
        <div className="mx-5 mt-4 rounded-2xl p-4 flex relative z-10 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md shadow-[0_8px_32px_rgba(38,40,66,0.12)] dark:shadow-none border border-slate-100 dark:border-slate-700">
          {[
            { label: 'Patients', value: patientsData?.total ?? 0, icon: Users, color: '#3B3E66' },
            { label: 'Today', value: todayCount, icon: Clock, color: '#262842' },
            { label: 'Experience', value: '16+ Yrs', icon: TrendingUp, color: '#17252A' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`flex-1 flex flex-col items-center ${i !== 0 ? 'border-l border-slate-100 dark:border-slate-700' : ''}`}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1 bg-slate-100 dark:bg-slate-700">
                  <Icon size={16} className="text-slate-700 dark:text-slate-300" />
                </div>
                <span className="text-[20px] font-extrabold text-slate-900 dark:text-white leading-tight">{s.value}</span>
                <span className="text-[12px] font-medium text-slate-600 dark:text-slate-400">{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="px-5 pt-6 pb-6 flex flex-col gap-5">
          {/* About the Doctor */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
            <p className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">About the Doctor</p>
            <ul className="flex flex-col gap-2">
              {doctorDetails.about.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-[13px] text-slate-700 dark:text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 mt-1.5 shrink-0" />
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Clinic Location & Details */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center gap-2 mb-3">
              <MapPin size={18} className="text-teal-600 dark:text-teal-400" />
              <p className="text-[15px] font-bold text-slate-900 dark:text-white">Clinic Location & Details</p>
            </div>
            <div className="flex flex-col gap-2 text-[13px] text-slate-700 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-white text-[14px]">{doctorDetails.clinicName}</p>
              <p>{doctorDetails.contact.address}</p>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex flex-col gap-1 text-[12px]">
                <p><strong>Timings:</strong> {doctorDetails.contact.timings}</p>
                <p><strong>Sunday:</strong> {doctorDetails.contact.sunday}</p>
                <p><strong>Services:</strong> {doctorDetails.contact.services}</p>
              </div>
            </div>
          </div>

          {/* Scope of Services */}
          <div>
            <p className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Scope of Services</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {scopeOfServices.map((cat) => (
                <div key={cat.category} className="p-4 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
                  <p className="text-[13px] font-bold text-teal-700 dark:text-teal-400 mb-2">{cat.category}</p>
                  <ul className="flex flex-col gap-1 text-[12px] text-slate-600 dark:text-slate-300">
                    {cat.items.map((item) => (
                      <li key={item} className="flex items-center gap-1.5">
                        <CheckCircle size={12} className="text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Specializations */}
          <div>
            <p className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Core Specializations</p>
            <div className="flex flex-wrap gap-2">
              {specializations.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors bg-slate-100 dark:bg-slate-700 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[13px] font-semibold"
                >
                  <CheckCircle size={14} className="text-teal-600 dark:text-teal-400" />
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[15px] font-bold text-slate-900 dark:text-white">Today's Schedule</p>
              <button
                onClick={() => navigate('/doctor')}
                className="transition-colors text-[13px] font-semibold text-indigo-600 dark:text-indigo-400"
              >
                View All
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {(patientsData?.data?.slice(0, 3) || []).map((patient) => {
                const s = statusConfig[patient.status] || statusConfig['waiting'];
                return (
                  <div
                    key={patient.id}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-transform hover:-translate-y-1 bg-white dark:bg-slate-800 shadow-sm border ${patient.status === 'in-session' ? 'border-indigo-600 dark:border-indigo-500' : 'border-slate-100 dark:border-slate-700'}`}
                  >
                    <div>
                      <p className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400">Today</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-semibold text-slate-900 dark:text-white">{patient.name}</p>
                      <p className="text-[12px] text-slate-600 dark:text-slate-400">{patient.condition || 'Consultation'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-xl text-[11px] font-bold ${s.bg} ${s.color}`}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
              {(!patientsData?.data || patientsData.data.length === 0) && (
                <div className="text-center py-4 text-[13px] font-medium text-slate-600 dark:text-slate-400">
                  No patients in queue today.
                </div>
              )}
            </div>
          </div>

          {/* Education */}
          <div>
            <p className="text-[15px] font-bold text-slate-900 dark:text-white mb-3">Education & Qualifications</p>
            <div className="flex flex-col gap-0 rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
              {education.map((edu, i) => (
                <div
                  key={edu.degree}
                  className={`flex items-center gap-4 px-4 py-4 ${i < education.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}
                >
                  <div className="flex items-center justify-center rounded-2xl shrink-0 w-10 h-10 bg-slate-100 dark:bg-slate-700">
                    <GraduationCap size={20} className="text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-semibold text-slate-900 dark:text-white">{edu.degree}</p>
                    <p className="text-[12px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">Need to get info from client</p>
                  </div>
                  <Award size={18} className="text-slate-600 dark:text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-center rounded-2xl shrink-0 w-12 h-12 bg-slate-100 dark:bg-slate-700">
              <Phone size={24} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="flex-1">
              <p className="text-[12px] text-slate-600 dark:text-slate-400 font-semibold tracking-wide">CLINIC CONTACT</p>
              <p className="text-[18px] font-bold text-slate-900 dark:text-white">
                {doctorDetails.contact.phone}
              </p>
              <p className="text-[13px] text-slate-600 dark:text-slate-400">
                {doctorDetails.contact.email}
              </p>
            </div>
          </div>



          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl transition-colors mt-2 bg-red-50 dark:bg-transparent border-[1.5px] border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-500 text-[15px] font-bold hover:bg-red-100 dark:hover:bg-red-900/20"
          >
            <LogOut size={18} />
            Sign Out
          </button>

          <p className="text-center text-[12px] text-slate-600 dark:text-slate-400 mt-2">
            SAAI Physiotherapy v2.0 · Secure Health Platform
          </p>
        </div>
      </div>

      {showLogoutConfirm && (
        <div
          className="absolute inset-0 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm z-50"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-full px-6 pt-8 pb-8 bg-white dark:bg-slate-900 rounded-t-[32px] border-t border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-5">
              <div className="flex items-center justify-center rounded-3xl w-16 h-16 bg-red-50 dark:bg-red-900/20">
                <LogOut size={28} className="text-red-600 dark:text-red-500" />
              </div>
            </div>
            <p className="text-center text-[20px] font-bold text-slate-900 dark:text-white mb-2">Sign Out?</p>
            <p className="text-center text-[14px] text-slate-600 dark:text-slate-400 mb-8">
              Your clinical session will end. All data is safely stored.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-[15px] font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-4 rounded-2xl bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white text-[15px] font-semibold transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}