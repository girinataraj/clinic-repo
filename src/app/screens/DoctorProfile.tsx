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

const DOCTOR_PHOTO = 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80';

const specializations = [
  'Sports Physiotherapy',
  'Orthopedic Rehab',
  'Post-Surgical Recovery',
  'Dry Needling',
  'Manual Therapy',
];

const education = [
  { degree: 'BPT (Bachelor of Physiotherapy)', institution: 'Madras Medical College', year: '2008' },
  { degree: 'MPT – Orthopedics', institution: 'NIMHANS, Bengaluru', year: '2011' },
  { degree: 'Fellowship in Sports PT', institution: 'IOC Sports Medicine', year: '2013' },
];

const todaySchedule = [
  { time: '09:00 AM', patient: 'Rahul Verma', type: 'ACL Rehab', status: 'in-session' },
  { time: '09:30 AM', patient: 'Anita Patel', type: 'Shoulder Assessment', status: 'waiting' },
  { time: '10:00 AM', patient: 'Suresh Kumar', type: 'Stroke Follow-up', status: 'waiting' },
];

const statusConfig: Record<string, { color: string; bg: string; label: string }> = {
  'in-session': { color: '#2563eb', bg: '#eff6ff', label: 'Active' },
  'waiting': { color: '#f59e0b', bg: '#fefce8', label: 'Waiting' },
  'completed': { color: '#10b981', bg: '#ecfdf5', label: 'Done' },
};

const settingsItems = [
  { icon: Bell, label: 'Patient Notifications', sublabel: 'Alerts, reminders & updates', color: '#4338ca', bg: '#eef2ff' },
  { icon: Calendar, label: 'My Schedule', sublabel: 'Manage appointments & leave', color: '#2563eb', bg: '#eff6ff' },
  { icon: FileText, label: 'Report Templates', sublabel: 'Customize your report formats', color: '#0f766e', bg: '#f0fdfa' },
  { icon: Shield, label: 'Privacy & Compliance', sublabel: 'HIPAA & data security', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: HelpCircle, label: 'Help & Support', sublabel: 'Clinical support & FAQs', color: '#f97316', bg: '#fff7ed' },
  { icon: Settings, label: 'App Settings', sublabel: 'Language, theme & preferences', color: '#64748b', bg: '#f8fafc' },
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
    <div className="flex flex-col h-full" style={{ background: '#f5f3ff', position: 'relative' }}>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 55%, #6366f1 100%)' }}
        >
          <div className="absolute -right-10 -top-10 rounded-full opacity-20"
            style={{ width: '120px', height: '120px', background: 'white' }} />
          <div className="absolute right-16 top-12 rounded-full opacity-10"
            style={{ width: '70px', height: '70px', background: 'white' }} />

          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pb-2" style={{ paddingTop: '20px' }}>
            <button
              onClick={() => navigate('/doctor')}
              className="flex items-center justify-center rounded-xl"
              style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)' }}
            >
              <ChevronLeft size={20} color="white" />
            </button>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'white' }}>My Profile</span>
            <button
              className="flex items-center justify-center rounded-xl"
              style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)' }}
            >
              <Edit3 size={16} color="white" />
            </button>
          </div>

          {/* Profile hero */}
          <div className="flex flex-col items-center pb-6 pt-4 px-5">
            <div className="relative mb-3">
              {imgError ? (
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: '88px', height: '88px',
                    borderRadius: '28px',
                    background: 'rgba(255,255,255,0.25)',
                    border: '3px solid rgba(255,255,255,0.6)',
                    fontSize: '36px',
                  }}
                >
                  👨‍⚕️
                </div>
              ) : (
                <img
                  src={DOCTOR_PHOTO}
                  alt="Dr. Rajesh Kumar"
                  onError={() => setImgError(true)}
                  style={{
                    width: '88px', height: '88px',
                    borderRadius: '28px',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    border: '3px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  }}
                />
              )}
              <div
                className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full"
                style={{ width: '26px', height: '26px', background: '#6366f1', border: '2px solid white' }}
              >
                <Stethoscope size={12} color="white" />
              </div>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>{user?.name || 'Dr. Rajesh Kumar'}</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>
              Sports Physiotherapist · MCI: 78945-A
            </p>
            {/* Star rating */}
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star
                  key={n}
                  size={14}
                  color="#fbbf24"
                  fill={n <= 4 ? '#fbbf24' : 'none'}
                />
              ))}
              <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.85)', marginLeft: '4px', fontWeight: 700 }}>4.8</span>
              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.55)', marginLeft: '2px' }}>(246 reviews)</span>
            </div>
            <div className="flex items-center gap-2 mt-3">
              {[{ text: '12 yrs Exp' }, { text: 'MCI Verified' }, { text: 'SAAI Clinic' }].map((tag) => (
                <span
                  key={tag.text}
                  className="px-3 py-1 rounded-full"
                  style={{ background: 'rgba(255,255,255,0.2)', fontSize: '11px', fontWeight: 700, color: 'white' }}
                >
                  {tag.text}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mx-4 -mt-4 rounded-2xl p-4 flex"
          style={{ background: 'white', boxShadow: '0 8px 32px rgba(67,56,202,0.12)', border: '1px solid #e0e7ff' }}>
          {[
            { label: 'Patients', value: '1.2k', icon: Users, color: '#4338ca' },
            { label: 'Today', value: '8', icon: Clock, color: '#0f766e' },
            { label: 'Satisfaction', value: '98%', icon: TrendingUp, color: '#f59e0b' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className={`flex-1 flex flex-col items-center ${i !== 0 ? 'border-l border-slate-100' : ''}`}>
                <Icon size={16} color={s.color} style={{ marginBottom: '4px' }} />
                <span style={{ fontSize: '20px', fontWeight: 900, color: s.color, lineHeight: 1.2 }}>{s.value}</span>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="px-4 pt-4 pb-4 flex flex-col gap-4">
          {/* About */}
          <div className="p-4 rounded-2xl"
            style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>About</p>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.6 }}>
              Dr. Rajesh Kumar is a highly experienced sports physiotherapist with over 12 years of clinical practice
              specializing in ACL rehabilitation, post-surgical recovery, and elite sports performance. He has worked
              with national-level athletes and managed complex orthopedic cases.
            </p>
          </div>

          {/* Specializations */}
          <div>
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Specializations</p>
            <div className="flex flex-wrap gap-2">
              {specializations.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1.5 rounded-xl flex items-center gap-1.5"
                  style={{ background: '#eef2ff', border: '1px solid #c7d2fe', color: '#4338ca', fontSize: '12px', fontWeight: 700 }}
                >
                  <CheckCircle size={12} color="#4338ca" />
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Today's Schedule */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Today's Schedule</p>
              <button
                onClick={() => navigate('/doctor')}
                style={{ fontSize: '12px', fontWeight: 600, color: '#4338ca' }}
              >
                View All
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {todaySchedule.map((appt) => {
                const s = statusConfig[appt.status];
                return (
                  <div
                    key={appt.time}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl"
                    style={{
                      background: 'white',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      border: `1px solid ${appt.status === 'in-session' ? '#c7d2fe' : '#f1f5f9'}`,
                    }}
                  >
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 800, color: '#4338ca' }}>{appt.time}</p>
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{appt.patient}</p>
                      <p style={{ fontSize: '11px', color: '#94a3b8' }}>{appt.type}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full"
                      style={{ background: s.bg, color: s.color, fontSize: '10px', fontWeight: 700 }}>
                      {s.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Education */}
          <div>
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Education & Training</p>
            <div className="flex flex-col gap-2 rounded-2xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              {education.map((edu, i) => (
                <div
                  key={edu.degree}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < education.length - 1 ? '1px solid #f8fafc' : 'none' }}
                >
                  <div className="flex items-center justify-center rounded-xl shrink-0"
                    style={{ width: '38px', height: '38px', background: '#eef2ff' }}>
                    <GraduationCap size={17} color="#4338ca" />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{edu.degree}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>{edu.institution} · {edu.year}</p>
                  </div>
                  <Award size={16} color="#f59e0b" />
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
            <div className="flex items-center justify-center rounded-2xl shrink-0"
              style={{ width: '44px', height: '44px', background: '#eef2ff' }}>
              <Phone size={20} color="#4338ca" />
            </div>
            <div className="flex-1">
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>CLINIC CONTACT</p>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>+91 044-4567 8900</p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Extn: 101 · Consultation Room 3</p>
            </div>
          </div>

          {/* Settings */}
          <div>
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Settings</p>
            <div className="flex flex-col gap-0 rounded-2xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              {settingsItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    className="flex items-center gap-3 px-4 py-3 text-left"
                    style={{ borderBottom: i < settingsItems.length - 1 ? '1px solid #f8fafc' : 'none' }}
                  >
                    <div className="flex items-center justify-center rounded-xl shrink-0"
                      style={{ width: '38px', height: '38px', background: item.bg }}>
                      <Icon size={17} color={item.color} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{item.label}</p>
                      <p style={{ fontSize: '11px', color: '#94a3b8' }}>{item.sublabel}</p>
                    </div>
                    <ChevronRight size={16} color="#cbd5e1" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl"
            style={{
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              color: '#dc2626',
              fontSize: '14px',
              fontWeight: 700,
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>

          <p style={{ textAlign: 'center', fontSize: '11px', color: '#cbd5e1' }}>
            SAAI Physiotherapy v2.0 · Secure Health Platform
          </p>
        </div>
      </div>

      {showLogoutConfirm && (
        <div
          className="absolute inset-0 flex items-end justify-center"
          style={{ background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', zIndex: 50 }}
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="w-full px-5 pt-6 pb-8"
            style={{ background: 'white', borderRadius: '28px 28px 0 0' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="flex items-center justify-center rounded-2xl"
                style={{ width: '56px', height: '56px', background: '#fef2f2' }}>
                <LogOut size={24} color="#dc2626" />
              </div>
            </div>
            <p style={{ textAlign: 'center', fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>Sign Out?</p>
            <p style={{ textAlign: 'center', fontSize: '13px', color: '#64748b', marginBottom: '24px' }}>
              Your clinical session will end. All data is safely stored.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-4 rounded-2xl"
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', color: '#64748b', fontSize: '14px', fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 py-4 rounded-2xl"
                style={{ background: '#dc2626', color: 'white', fontSize: '14px', fontWeight: 700 }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="md:hidden">
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}