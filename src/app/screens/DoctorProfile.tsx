import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import {
  ChevronRight,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  Settings,
  Edit3,
  Award,
  Star,
  Users,
  Clock,
  ChevronLeft,
  Phone,
  FileText,
  Stethoscope,
  CheckCircle,
  Calendar,
  TrendingUp,
  GraduationCap,
} from 'lucide-react';

const DOCTOR_PHOTO = ''; // Use initials fallback — no default photo

// NOTE: These are UI structure placeholders.
// Should be fetched from /api/users/me when the backend exposes them.
// Currently NO backend API for these — DO NOT hardcode fake values.
const specializations: string[] = [];
const education: { degree: string; institution: string; year: string }[] = [];
const todaySchedule: { time: string; patient: string; type: string; status: string }[] = [];

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  'in-session': { color: '#3AAFA9', bg: '#DEF2F1', label: 'Active' },
  'waiting': { color: '#2B7A78', bg: '#DEF2F1', label: 'Waiting' },
  'completed': { color: '#10B981', bg: '#ECFDF5', label: 'Done' },
};

const settingsItems = [
  { icon: Bell, label: 'Patient Notifications', sublabel: 'Alerts, reminders & updates', color: '#3AAFA9', bg: '#DEF2F1' },
  { icon: Calendar, label: 'My Schedule', sublabel: 'Manage appointments & leave', color: '#2B7A78', bg: '#DEF2F1' },
  { icon: FileText, label: 'Report Templates', sublabel: 'Customize your report formats', color: '#17252A', bg: '#DEF2F1' },
  { icon: Shield, label: 'Privacy & Compliance', sublabel: 'HIPAA & data security', color: '#3AAFA9', bg: '#DEF2F1' },
  { icon: HelpCircle, label: 'Help & Support', sublabel: 'Clinical support & FAQs', color: '#2B7A78', bg: '#DEF2F1' },
  { icon: Settings, label: 'App Settings', sublabel: 'Language, theme & preferences', color: '#17252A', bg: '#DEF2F1' },
];

export function DoctorProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full saai-page" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#DEF2F1', position: 'relative' }}>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div
          className="relative overflow-hidden rounded-b-3xl"
          style={{ 
            background: 'linear-gradient(135deg, #2B7A78 0%, #3AAFA9 100%)',
            boxShadow: '0 4px 24px rgba(43, 122, 120, 0.15)'
          }}
        >
          <div className="absolute -right-16 -top-16 rounded-full opacity-10"
            style={{ width: '200px', height: '200px', background: '#FEFFFF' }} />
          <div className="absolute left-10 bottom-10 rounded-full opacity-10"
            style={{ width: '100px', height: '100px', background: '#FEFFFF' }} />

          {/* Top bar */}
          <div className="flex items-center justify-between px-6 pb-2 relative z-10" style={{ paddingTop: '32px' }}>
            <button
              onClick={() => navigate('/doctor')}
              className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20"
              style={{ width: '40px', height: '40px', background: 'rgba(254,255,255,0.15)' }}
            >
              <ChevronLeft size={20} color="#FEFFFF" />
            </button>
            <span style={{ fontSize: '16px', fontWeight: 700, color: '#FEFFFF' }}>My Profile</span>
            <button
              className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20"
              style={{ width: '40px', height: '40px', background: 'rgba(254,255,255,0.15)' }}
            >
              <Edit3 size={18} color="#FEFFFF" />
            </button>
          </div>

          {/* Profile hero */}
          <div className="flex flex-col items-center pb-8 pt-4 px-6 relative z-10">
            <div className="relative mb-4">
              {imgError ? (
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '96px', height: '96px',
                    borderRadius: '32px',
                    background: 'rgba(254,255,255,0.2)',
                    border: '3px solid rgba(254,255,255,0.5)',
                    fontSize: '40px',
                  }}
                >
                  👨‍⚕️
                </div>
              ) : (
                <img
                  src={DOCTOR_PHOTO}
                  alt={user?.name ?? 'Doctor'}
                  onError={() => setImgError(true)}
                  style={{
                    width: '96px', height: '96px',
                    borderRadius: '32px',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    border: '3px solid rgba(254,255,255,0.8)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                  }}
                />
              )}
              <div
                className="absolute -bottom-2 -right-2 flex items-center justify-center rounded-2xl"
                style={{ width: '32px', height: '32px', background: '#2B7A78', border: '2px solid #FEFFFF' }}
              >
                <Stethoscope size={16} color="#FEFFFF" />
              </div>
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FEFFFF' }}>
              {user?.name === 'Dr. Rajesh Kumar' ? 'Dr. SV. Sathish Kumar' : (user?.name || 'Doctor')}
            </h2>
            <p style={{ fontSize: '14px', color: 'rgba(254,255,255,0.9)', marginTop: '4px' }}>
              Physiotherapist · {user?.displayId ?? '—'}
            </p>
            {/* Star rating */}
            <div className="flex items-center gap-1.5 mt-3">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={16}
                  color="#FEFFFF"
                  fill={n <= 4 ? '#FEFFFF' : 'none'}
                />
              ))}
              <span style={{ fontSize: '14px', color: '#FEFFFF', marginLeft: '4px', fontWeight: 700 }}>4.8</span>
              <span style={{ fontSize: '12px', color: 'rgba(254,255,255,0.7)', marginLeft: '2px' }}>(246 reviews)</span>
            </div>
            <div className="flex items-center gap-2 mt-4">
              {[{ text: '16 yrs Exp' }, { text: 'MPT (Cardio-Resp)' }, { text: 'SAAI Clinic' }].map((tag) => (
                <span
                  key={tag.text}
                  className="px-3 py-1.5 rounded-xl backdrop-blur-sm"
                  style={{ background: 'rgba(254,255,255,0.2)', border: '1px solid rgba(254,255,255,0.3)', fontSize: '12px', fontWeight: 600, color: '#FEFFFF' }}
                >
                  {tag.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mx-5 -mt-6 rounded-2xl p-4 flex relative z-10 bg-white/95 backdrop-blur-md"
          style={{ background: '#FEFFFF', boxShadow: '0 8px 32px rgba(43, 122, 120, 0.12)', border: '1px solid #DEF2F1' }}>
          {[
            { label: 'Patients', value: '1.2k', icon: Users, color: '#3AAFA9' },
            { label: 'Today', value: '8', icon: Clock, color: '#2B7A78' },
            { label: 'Satisfaction', value: '98%', icon: TrendingUp, color: '#17252A' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`flex-1 flex flex-col items-center ${i !== 0 ? 'border-l border-slate-100' : ''}`} style={{ borderColor: '#DEF2F1' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1" style={{ background: '#DEF2F1' }}>
                  <Icon size={16} color={s.color} />
                </div>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#17252A', lineHeight: 1.2 }}>{s.value}</span>
                <span style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 500 }}>{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="px-5 pt-6 pb-6 flex flex-col gap-5">
          {/* About */}
          <div className="p-5 rounded-2xl"
            style={{ background: '#FEFFFF', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)', border: '1px solid #DEF2F1' }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#17252A', marginBottom: '8px' }}>About</p>
            <p style={{ fontSize: '14px', color: '#2B7A78', lineHeight: 1.6, marginBottom: '12px' }}>
              <strong>Qualifications:</strong> MPT (Cardio-Resp), PGDFM, DYT, CDNT<br/>
              <strong>Consultant Physiotherapist</strong>
            </p>
            <ul style={{ fontSize: '14px', color: '#2B7A78', lineHeight: 1.6, listStyleType: 'disc', paddingLeft: '20px' }}>
              <li>16 years of clinical experience</li>
              <li>16 years as HOD at Erode Sudha Hospitals</li>
              <li>Strong professional network</li>
              <li>Author of 3 awareness books</li>
              <li>6000+ pain cases treated</li>
            </ul>
          </div>

          {/* Clinic Info */}
          <div className="p-5 rounded-2xl"
            style={{ background: '#FEFFFF', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)', border: '1px solid #DEF2F1' }}>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#17252A', marginBottom: '4px' }}>Saai Physiotherapy Clinic</p>
            <p style={{ fontSize: '13px', fontStyle: 'italic', color: '#3AAFA9', marginBottom: '12px' }}>“Getting better every day”</p>
            <p style={{ fontSize: '14px', color: '#2B7A78', lineHeight: 1.6 }}>
              20A/10, Sakthi Nagar, Sengodapalayam,<br/>
              Thindal, Erode Dt – 638012<br/>
              Tamil Nadu, India
            </p>
          </div>

          {/* Specializations */}
          <div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#17252A', marginBottom: '12px' }}>Specializations</p>
            <div className="flex flex-wrap gap-2">
              {specializations.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors"
                  style={{ background: '#DEF2F1', border: '1px solid #DEF2F1', color: '#3AAFA9', fontSize: '13px', fontWeight: 600 }}
                >
                  <CheckCircle size={14} color="#3AAFA9" />
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>Today's Schedule</p>
              <button
                onClick={() => navigate('/doctor')}
                className="transition-colors"
                style={{ fontSize: '13px', fontWeight: 600, color: '#3AAFA9' }}
              >
                View All
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {todaySchedule.map((appt) => {
                const s = statusConfig[appt.status];
                return (
                  <div
                    key={appt.time}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-transform hover:-translate-y-1"
                    style={{
                      background: '#FEFFFF',
                      boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)',
                      border: `1px solid ${appt.status === 'in-session' ? '#3AAFA9' : '#DEF2F1'}`,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#3AAFA9' }}>{appt.time}</p>
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#17252A' }}>{appt.patient}</p>
                      <p style={{ fontSize: '12px', color: '#2B7A78' }}>{appt.type}</p>
                    </div>
                    <span className="px-3 py-1 rounded-xl"
                      style={{ background: s.bg, color: s.color, fontSize: '11px', fontWeight: 700 }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Education */}
          <div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#17252A', marginBottom: '12px' }}>Education & Training</p>
            <div className="flex flex-col gap-0 rounded-2xl overflow-hidden"
              style={{ background: '#FEFFFF', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)', border: '1px solid #DEF2F1' }}>
              {education.map((edu, i) => (
                <div
                  key={edu.degree}
                  className="flex items-center gap-4 px-4 py-4"
                  style={{ borderBottom: i < education.length - 1 ? '1px solid #DEF2F1' : 'none' }}
                >
                  <div className="flex items-center justify-center rounded-2xl shrink-0"
                    style={{ width: '40px', height: '40px', background: '#DEF2F1' }}>
                    <GraduationCap size={20} color="#3AAFA9" />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: '14px', fontWeight: 600, color: '#17252A' }}>{edu.degree}</p>
                    <p style={{ fontSize: '12px', color: '#2B7A78', marginTop: '2px' }}>{edu.institution} · {edu.year}</p>
                  </div>
                  <Award size={18} color="#2B7A78" />
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-4 p-5 rounded-2xl"
            style={{ background: '#FEFFFF', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)', border: '1px solid #DEF2F1' }}>
            <div className="flex items-center justify-center rounded-2xl shrink-0"
              style={{ width: '48px', height: '48px', background: '#DEF2F1' }}>
              <Phone size={24} color="#3AAFA9" />
            </div>
            <div className="flex-1">
              <p style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 600, letterSpacing: '0.5px' }}>CLINIC CONTACT</p>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#17252A' }}>+91 044-4567 8900</p>
              <p style={{ fontSize: '13px', color: '#2B7A78' }}>Extn: 101 · Consultation Room 3</p>
            </div>
          </div>

          {/* Settings */}
          <div>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#17252A', marginBottom: '12px' }}>Settings</p>
            <div className="flex flex-col gap-0 rounded-2xl overflow-hidden"
              style={{ background: '#FEFFFF', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)', border: '1px solid #DEF2F1' }}>
              {settingsItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="flex items-center gap-4 px-4 py-4 text-left transition-colors"
                    style={{ borderBottom: i < settingsItems.length - 1 ? '1px solid #DEF2F1' : 'none' }}
                  >
                    <div className="flex items-center justify-center rounded-2xl shrink-0"
                      style={{ width: '40px', height: '40px', background: item.bg }}>
                      <Icon size={20} color={item.color} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '14px', fontWeight: 600, color: '#17252A' }}>{item.label}</p>
                      <p style={{ fontSize: '12px', color: '#2B7A78', marginTop: '2px' }}>{item.sublabel}</p>
                    </div>
                    <ChevronRight size={18} color="#2B7A78" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl transition-colors mt-2"
            style={{
              background: '#FEFFFF',
              border: '1px solid #DEF2F1',
              color: '#17252A',
              fontSize: '15px',
              fontWeight: 600,
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#2B7A78', marginTop: '8px' }}>
            SAAI Physiotherapy v2.0 · Secure Health Platform
          </p>
        </div>
      </div>

      {showLogoutConfirm && (
        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{ background: 'rgba(23,37,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 50 }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-full px-6 pt-8 pb-8"
            style={{ background: '#FEFFFF', borderRadius: '32px 32px 0 0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-5">
              <div className="flex items-center justify-center rounded-3xl"
                style={{ width: '64px', height: '64px', background: '#DEF2F1' }}>
                <LogOut size={28} color="#17252A" />
              </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '20px', fontWeight: 700, color: '#17252A', marginBottom: '8px' }}>Sign Out?</p>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#2B7A78', marginBottom: '32px' }}>
              Your clinical session will end. All data is safely stored.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 rounded-2xl transition-colors"
                style={{ background: '#DEF2F1', border: '1px solid #DEF2F1', color: '#17252A', fontSize: '15px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-4 rounded-2xl transition-colors"
                style={{ background: '#17252A', color: '#FEFFFF', fontSize: '15px', fontWeight: 600 }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden" style={{ borderTop: '1px solid #DEF2F1', background: '#FEFFFF' }}>
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}