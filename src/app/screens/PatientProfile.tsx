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

const PATIENT_PHOTO = ''; // Use initials fallback — no default photo

// NOTE: healthInfo and conditions should be fetched from /api/users/me
// or a patient-specific profile endpoint when available.
// Currently NO backend API for these — DO NOT hardcode fake values.
const healthInfo: { label: string; value: string; icon: any; color: string; bg: string }[] = [];
const conditions: { label: string; severity: string; color: string; bg: string }[] = [];



export function PatientProfile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#f0f4ff', position: 'relative' }}>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #38bdf8 100%)' }}
        >
          {/* Decorative circles */}
          <div className="absolute -right-10 -top-10 rounded-full opacity-20"
            style={{ width: '120px', height: '120px', background: 'white' }} />
          <div className="absolute right-16 top-12 rounded-full opacity-10"
            style={{ width: '70px', height: '70px', background: 'white' }} />

          {/* Top bar */}
          <div className="flex items-center justify-between px-5 pb-2" style={{ paddingTop: '20px' }}>
            <button
              onClick={() => navigate('/patient')}
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
                  👩
                </div>
              ) : (
                <img
                  src={PATIENT_PHOTO}
                  alt={user?.name ?? 'Patient'}
                  onError={() => setImgError(true)}
                  style={{
                    width: '88px', height: '88px',
                    borderRadius: '28px',
                    objectFit: 'cover',
                    border: '3px solid rgba(255,255,255,0.6)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  }}
                />
              )}
              <div
                className="absolute -bottom-1 -right-1 flex items-center justify-center rounded-full"
                style={{ width: '26px', height: '26px', background: '#10b981', border: '2px solid white' }}
              >
                <Star size={12} color="white" fill="white" />
              </div>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'white' }}>{user?.name || 'Patient'}</h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', marginTop: '2px' }}>
              Patient · {user?.displayId ?? '—'}
            </p>
            <div className="flex items-center gap-2 mt-3">
              {[{ text: user?.role ?? 'Patient' }].map((tag) => (
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
        <div className="mx-4 -mt-4 rounded-2xl p-4 flex gap-0"
          style={{ background: 'white', boxShadow: '0 8px 32px rgba(37,99,235,0.12)', border: '1px solid #e0e7ff' }}>
          {[
            { label: 'Sessions', value: '12', color: '#2563eb' },
            { label: 'Reports', value: '5', color: '#7c3aed' },
            { label: 'Exercises', value: '24', color: '#10b981' },
          ].map((s, i) => (
            <div key={s.label} className={`flex-1 flex flex-col items-center ${i !== 0 ? 'border-l border-slate-100' : ''}`}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: s.color }}>{s.value}</span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="px-4 pt-4 pb-4 flex flex-col gap-4">
          {/* Next Appointment */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #a7f3d0' }}
          >
            <div className="flex items-center justify-center rounded-2xl shrink-0"
              style={{ width: '48px', height: '48px', background: '#10b981' }}>
              <Calendar size={22} color="white" />
            </div>
            <div className="flex-1">
              <p style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>NEXT APPOINTMENT</p>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#064e3b' }}>Dr. SV. Sathish Kumar</p>
              <p style={{ fontSize: '12px', color: '#059669', marginTop: '1px' }}>Tomorrow · 10:00 AM · Sports Physio</p>
            </div>
            <ChevronRight size={18} color="#059669" />
          </div>

          {/* Health Info */}
          <div>
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Health Overview</p>
            <div className="grid gap-3" style={{ gridTemplateColumns: '1fr 1fr' }}>
              {healthInfo.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f1f5f9' }}
                  >
                    <div className="flex items-center justify-center rounded-xl shrink-0"
                      style={{ width: '40px', height: '40px', background: item.bg }}>
                      <Icon size={18} color={item.color} />
                    </div>
                    <div>
                      <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>{item.label}</p>
                      <p style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Conditions */}
          <div>
            <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>Diagnoses & Conditions</p>
            <div className="flex flex-col gap-2">
              {conditions.map((c) => (
                <div
                  key={c.label}
                  className="flex items-center justify-between px-4 py-3 rounded-2xl"
                  style={{ background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9' }}
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded-full" style={{ width: '8px', height: '8px', background: c.color, flexShrink: 0 }} />
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>{c.label}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.color, fontSize: '11px', fontWeight: 700 }}>
                    {c.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          <div
            className="flex items-center gap-3 p-4 rounded-2xl"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
          >
            <div className="flex items-center justify-center rounded-2xl shrink-0"
              style={{ width: '44px', height: '44px', background: '#ef4444' }}>
              <AlertTriangle size={20} color="white" />
            </div>
            <div className="flex-1">
              <p style={{ fontSize: '12px', color: '#dc2626', fontWeight: 700 }}>EMERGENCY CONTACT</p>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#7f1d1d' }}>Sundar Sharma (Father)</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Phone size={11} color="#ef4444" />
                <span style={{ fontSize: '12px', color: '#dc2626', fontWeight: 600 }}>+91 98765 43210</span>
              </div>
            </div>
            <ChevronRight size={16} color="#ef4444" />
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

      {/* Logout Confirm Modal */}
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
              You'll need to log back in to access your health records.
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
        <BottomNav role="patient" />
      </div>
    </div>
  );
}