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
  Clock,
  Users,
  ClipboardList,
  ChevronLeft,
  MapPin,
  Phone,
  CheckCircle,
  Star,
  Calendar,
} from 'lucide-react';

const NURSE_PHOTO = 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80';

const certifications = [
  { name: 'Registered Nurse (RN)', year: '2018', verified: true },
  { name: 'BLS & CPR Certified', year: '2023', verified: true },
  { name: 'Physiotherapy Asst.', year: '2021', verified: true },
  { name: 'Wound Care Specialist', year: '2022', verified: false },
];

const shiftInfo = {
  shift: 'Morning Shift',
  time: '07:00 AM – 03:00 PM',
  ward: 'Physiotherapy Unit B',
  supervisor: 'Dr. Rajesh Kumar',
};

const settingsItems = [
  { icon: Bell, label: 'Shift Notifications', sublabel: 'Alerts & duty reminders', color: '#0f766e', bg: '#f0fdfa' },
  { icon: Calendar, label: 'Schedule & Roster', sublabel: 'View your monthly roster', color: '#2563eb', bg: '#eff6ff' },
  { icon: Shield, label: 'Privacy & Security', sublabel: 'Data access controls', color: '#7c3aed', bg: '#f5f3ff' },
  { icon: HelpCircle, label: 'Help & Support', sublabel: 'Contact hospital IT desk', color: '#f97316', bg: '#fff7ed' },
  { icon: Settings, label: 'App Settings', sublabel: 'Language & preferences', color: '#64748b', bg: '#f8fafc' },
];

export function NurseProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#f0fdf9', position: 'relative' }}>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #134e4a 0%, #0f766e 55%, #14b8a6 100%)' }}
        >
          <div className="absolute -right-10 -top-10 rounded-full opacity-20"
            style={{ width: '120px', height: '120px', background: 'white' }} />
          <div className="absolute right-16 top-12 rounded-full opacity-10"
            style={{ width: '70px', height: '70px', background: 'white' }} />

          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pb-2" style={{ paddingTop: '20px' }}>
            <button
              onClick={() => navigate('/nurse')}
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
                  👩‍⚕️
                </div>
              ) : (
                <img
                  src={NURSE_PHOTO}
                  alt="Kavya Reddy"
                  onError={() => setImgError(true)}
                  style={{
                    width: '88px', height: '88px',
                    borderRadius: '28px',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    border: '3px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  }}
                />
              )}
              <div
                className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full"
                style={{ width: '26px', height: '26px', background: '#14b8a6', border: '2px solid white' }}
              >
                <Star size={12} color="white" fill="white" />
              </div>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>{user?.name || 'Kavya Reddy'}</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>
              Senior Nurse · EMP-2018-KR04
            </p>
            <div className="flex items-center gap-2 mt-3">
              {[{ text: '6 yrs Exp' }, { text: 'RN Certified' }, { text: 'Physio Unit' }].map((tag) => (
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
          style={{ background: 'white', boxShadow: '0 8px 32px rgba(15,118,110,0.12)', border: '1px solid #ccfbf1' }}>
          {[
            { label: "Today's Pts", value: '5', icon: Users, color: '#0f766e' },
            { label: 'Intakes', value: '3', icon: ClipboardList, color: '#2563eb' },
            { label: 'Hours', value: '6.5', icon: Clock, color: '#f59e0b' },
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
          {/* Today's Shift */}
          <div
            className="p-4 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #f0fdfa, #ccfbf1)', border: '1px solid #99f6e4' }}
          >
            <p style={{ fontSize: '12px', color: '#0f766e', fontWeight: 700, marginBottom: '10px' }}>TODAY'S SHIFT</p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-xl shrink-0"
                  style={{ width: '36px', height: '36px', background: '#0f766e' }}>
                  <Clock size={17} color="white" />
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 800, color: '#064e3b' }}>{shiftInfo.shift}</p>
                  <p style={{ fontSize: '12px', color: '#0f766e' }}>{shiftInfo.time}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center rounded-xl shrink-0"
                  style={{ width: '36px', height: '36px', background: '#ecfdf5' }}>
                  <MapPin size={17} color="#059669" />
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 800, color: '#064e3b' }}>{shiftInfo.ward}</p>
                  <p style={{ fontSize: '12px', color: '#0f766e' }}>Supervisor: {shiftInfo.supervisor}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Certifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Certifications</p>
              <button style={{ fontSize: '12px', fontWeight: 600, color: '#0f766e' }}>View All</button>
            </div>
            <div className="flex flex-col gap-2 rounded-2xl overflow-hidden"
              style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}>
              {certifications.map((cert, i) => (
                <div
                  key={cert.name}
                  className="flex items-center gap-3 px-4 py-3"
                  style={{ borderBottom: i < certifications.length - 1 ? '1px solid #f8fafc' : 'none' }}
                >
                  <div className="flex items-center justify-center rounded-xl shrink-0"
                    style={{ width: '38px', height: '38px', background: cert.verified ? '#ecfdf5' : '#fef3c7' }}>
                    <Award size={17} color={cert.verified ? '#10b981' : '#f59e0b'} />
                  </div>
                  <div className="flex-1">
                    <p style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{cert.name}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8' }}>Since {cert.year}</p>
                  </div>
                  {cert.verified ? (
                    <CheckCircle size={16} color="#10b981" />
                  ) : (
                    <span className="px-2 py-0.5 rounded-full" style={{ background: '#fef3c7', color: '#d97706', fontSize: '10px', fontWeight: 700 }}>
                      Pending
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}
          >
            <div className="flex items-center justify-center rounded-2xl shrink-0"
              style={{ width: '44px', height: '44px', background: '#eff6ff' }}>
              <Phone size={20} color="#2563eb" />
            </div>
            <div className="flex-1">
              <p style={{ fontSize: '12px', color: '#64748b', fontWeight: 700 }}>HOSPITAL EXTENSION</p>
              <p style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>+91 044-4567 8901</p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>Extn: 204 · Ward B Station</p>
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
              Your session will end and you'll need to log in again.
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
        <BottomNav role="nurse" />
      </div>
    </div>
  );
}