import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import {
  Eye, EyeOff, Mail, Lock, Activity, Phone,
  ChevronRight, UserCheck, HeartPulse, Stethoscope,
  Sparkles, CheckCircle, Shield, Users, Star, AlertCircle,
} from 'lucide-react';

interface RoleOption {
  value: UserRole;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  color: string;
  bg: string;
  border: string;
  gradient: string;
}

const roles: RoleOption[] = [
  {
    value: 'patient',
    label: 'Patient',
    sublabel: 'Book & track',
    icon: UserCheck,
    color: '#2563eb',
    bg: '#eff6ff',
    border: '#bfdbfe',
    gradient: 'linear-gradient(135deg, #2563eb, #38bdf8)',
  },
  {
    value: 'nurse',
    label: 'Nurse',
    sublabel: 'Intake & care',
    icon: HeartPulse,
    color: '#0f766e',
    bg: '#f0fdfa',
    border: '#99f6e4',
    gradient: 'linear-gradient(135deg, #0f766e, #14b8a6)',
  },
  {
    value: 'doctor',
    label: 'Doctor',
    sublabel: 'Consult & prescribe',
    icon: Stethoscope,
    color: '#4338ca',
    bg: '#eef2ff',
    border: '#c7d2fe',
    gradient: 'linear-gradient(135deg, #4338ca, #6366f1)',
  },
];

const features = [
  { icon: CheckCircle, text: 'NABH Accredited Clinic', color: '#10b981' },
  { icon: Shield, text: 'HIPAA Compliant & Secure', color: '#3b82f6' },
  { icon: Users, text: 'Trusted by 10,000+ Patients', color: '#8b5cf6' },
  { icon: Star, text: '4.9★ Rated by Patients', color: '#f59e0b' },
];

export function LoginScreen() {
  const [role, setRole] = useState<UserRole>('patient');
  const [identifier, setIdentifier] = useState(''); // phone for patient, email for staff
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, loginError } = useAuth();
  const navigate = useNavigate();

  const selectedRole = roles.find((r) => r.value === role)!;
  const isPatient = role === 'patient';

  const handleRoleChange = (r: UserRole) => {
    setRole(r);
    setIdentifier(''); // clear field when switching role type
  };

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) return;
    try {
      await login(identifier.trim(), password, role);
      navigate(`/${role}`);
    } catch {
      // loginError is set in AuthContext
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#f8faff' }}>

      {/* ── LEFT BRANDING PANEL — desktop only ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] xl:w-[520px] shrink-0 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
        }}
      >
        {/* Ambient blobs */}
        <div className="absolute -right-20 -top-20 rounded-full opacity-10"
          style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
        <div className="absolute -left-16 bottom-1/4 rounded-full opacity-10"
          style={{ width: '250px', height: '250px', background: 'radial-gradient(circle, #10b981, transparent)' }} />
        <div className="absolute right-8 bottom-16 rounded-full opacity-10"
          style={{ width: '180px', height: '180px', background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

        {/* Top logo */}
        <div className="px-10 pt-12">
          <div className="flex items-center gap-4 mb-10">
            <div
              className="flex items-center justify-center relative"
              style={{
                width: '56px', height: '56px',
                borderRadius: '18px',
                background: 'white',
                boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
              }}
            >
              <Activity size={28} color="#2563eb" strokeWidth={2.5} />
              <div
                className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center rounded-full"
                style={{ width: '20px', height: '20px', background: '#10b981', border: '2px solid white' }}
              >
                <Sparkles size={10} color="white" />
              </div>
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                SAAI Physiotherapy
              </h1>
              <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                Advanced Rehabilitation Centre
              </p>
            </div>
          </div>

          <h2 style={{ fontSize: '36px', fontWeight: 900, color: 'white', lineHeight: 1.2, letterSpacing: '-1px', marginBottom: '16px' }}>
            Your Recovery,<br />
            <span style={{ background: 'linear-gradient(90deg, #38bdf8, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Our Commitment
            </span>
          </h2>
          <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, marginBottom: '36px' }}>
            India's most trusted physiotherapy platform connecting patients, nurses, and doctors for seamless care delivery.
          </p>

          {/* Features */}
          <div className="flex flex-col gap-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-xl shrink-0"
                    style={{ width: '36px', height: '36px', background: `${f.color}20` }}>
                    <Icon size={17} color={f.color} />
                  </div>
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="px-10 pb-10">
          <div
            className="p-5 rounded-2xl"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            <div className="flex mb-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} size={14} color="#fbbf24" fill="#fbbf24" />
              ))}
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.7, marginBottom: '12px' }}>
              "SAAI Physiotherapy completely transformed my post-surgery recovery. The digital tracking and exercise plans are exceptional."
            </p>
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center rounded-full"
                style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', fontSize: '16px' }}>
                🏃
              </div>
              <div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: 'white' }}>Arjun Mehta</p>
                <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>Recovered from ACL Tear · 2025</p>
              </div>
            </div>
          </div>
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: 'rgba(255,255,255,0.25)' }}>
            © 2025 SAAI Physiotherapy Clinic · All rights reserved
          </p>
        </div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto">

        {/* Mobile header */}
        <div
          className="lg:hidden w-full flex flex-col items-center pb-12 px-6 relative overflow-hidden"
          style={{
            background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
            paddingTop: '56px',
          }}
        >
          <div className="absolute -right-12 -top-12 rounded-full opacity-10"
            style={{ width: '140px', height: '140px', background: 'white' }} />
          <div
            className="flex items-center justify-center mb-4 relative"
            style={{
              width: '72px', height: '72px', background: 'white',
              borderRadius: '22px', boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
            }}
          >
            <Activity size={36} color="#2563eb" strokeWidth={2.5} />
            <div
              className="absolute -bottom-1.5 -right-1.5 flex items-center justify-center rounded-full"
              style={{ width: '22px', height: '22px', background: '#10b981', border: '2px solid white' }}
            >
              <Sparkles size={11} color="white" />
            </div>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'white', textAlign: 'center', letterSpacing: '-0.5px' }}>
            SAAI Physiotherapy
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginTop: '4px', textAlign: 'center' }}>
            Your Recovery, Our Commitment
          </p>
          <div
            className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <div className="rounded-full" style={{ width: '6px', height: '6px', background: '#10b981' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>
              Trusted by 10,000+ patients · NABH Accredited
            </span>
          </div>
        </div>

        {/* Form card */}
        <div
          className="w-full max-w-md mx-auto px-6 py-8 lg:px-8"
          style={{
            background: 'white',
            borderRadius: '28px 28px 0 0',
            marginTop: '-22px',
            boxShadow: '0 -4px 32px rgba(0,0,0,0.08)',
          }}
        >
          {/* Desktop-only heading */}
          <div className="hidden lg:block mb-6">
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.7px' }}>
              Welcome back 👋
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
              Sign in to your SAAI Physiotherapy account
            </p>
          </div>

          {/* Mobile heading */}
          <div className="lg:hidden mb-6">
            <h2 style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>
              Welcome back 👋
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              Sign in to continue your care journey
            </p>
          </div>

          {/* Role selection */}
          <div style={{ marginBottom: '22px' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '10px' }}>
              I am a
            </p>
            <div className="flex gap-2">
              {roles.map((r) => {
                const { icon: Icon } = r;
                const isSelected = role === r.value;
                return (
                  <button
                    key={r.value}
                    onClick={() => handleRoleChange(r.value)}
                    className="flex-1 flex flex-col items-center pt-3 pb-2.5 rounded-2xl"
                    style={{
                      border: `2px solid ${isSelected ? r.color : '#f1f5f9'}`,
                      background: isSelected ? r.bg : '#f8fafc',
                      transform: isSelected ? 'translateY(-1px)' : 'none',
                      boxShadow: isSelected ? `0 4px 16px ${r.color}25` : 'none',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div
                      className="flex items-center justify-center mb-1.5 rounded-xl"
                      style={{
                        width: '42px', height: '42px',
                        background: isSelected ? r.gradient : '#e2e8f0',
                      }}
                    >
                      <Icon size={20} color={isSelected ? 'white' : '#94a3b8'} strokeWidth={2} />
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 800, color: isSelected ? r.color : '#94a3b8' }}>
                      {r.label}
                    </span>
                    <span style={{ fontSize: '10px', color: isSelected ? r.color : '#cbd5e1', fontWeight: 500 }}>
                      {r.sublabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Identifier: phone for patients, email for staff */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              {isPatient ? 'Mobile Number' : 'Email Address'}
            </label>
            <div
              className="flex items-center gap-3 px-4"
              style={{
                border: `1.5px solid ${identifier ? selectedRole.border : '#e2e8f0'}`,
                borderRadius: '16px',
                background: '#f8fafc',
                transition: 'border-color 0.2s',
              }}
            >
              {isPatient
                ? <Phone size={17} color={identifier ? selectedRole.color : '#94a3b8'} />
                : <Mail size={17} color={identifier ? selectedRole.color : '#94a3b8'} />}
              <input
                id="identifier-input"
                type={isPatient ? 'tel' : 'email'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isPatient ? '9876543210' : 'your@email.com'}
                className="flex-1 outline-none bg-transparent"
                style={{ padding: '14px 0', fontSize: '14px', color: '#1e293b' }}
                inputMode={isPatient ? 'numeric' : 'email'}
                autoComplete={isPatient ? 'tel' : 'email'}
              />
            </div>
            {isPatient && identifier && !/^[0-9+\s-]{7,15}$/.test(identifier) && (
              <p style={{ fontSize: '11px', color: '#ef4444', marginTop: '4px', fontWeight: 600 }}>
                Enter a valid mobile number
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: '10px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <div
              className="flex items-center gap-3 px-4"
              style={{
                border: `1.5px solid ${password ? selectedRole.border : '#e2e8f0'}`,
                borderRadius: '16px',
                background: '#f8fafc',
                transition: 'border-color 0.2s',
              }}
            >
              <Lock size={17} color={password ? selectedRole.color : '#94a3b8'} />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your password"
                className="flex-1 outline-none bg-transparent"
                style={{ padding: '14px 0', fontSize: '14px', color: '#1e293b' }}
                autoComplete="current-password"
              />
              <button onClick={() => setShowPassword(!showPassword)} style={{ padding: '4px' }}>
                {showPassword ? <EyeOff size={17} color="#94a3b8" /> : <Eye size={17} color="#94a3b8" />}
              </button>
            </div>
          </div>

          <div className="text-right" style={{ marginBottom: '24px' }}>
            <button style={{ fontSize: '13px', fontWeight: 700, color: selectedRole.color }}>
              Forgot Password?
            </button>
          </div>

          {/* Error message */}
          {loginError && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', marginBottom: '16px' }}
            >
              <AlertCircle size={15} color="#ef4444" />
              <p style={{ fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>{loginError}</p>
            </div>
          )}

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5"
            style={{
              padding: '17px',
              borderRadius: '18px',
              background: isLoading ? '#93c5fd' : selectedRole.gradient,
              color: 'white',
              fontSize: '16px',
              fontWeight: 800,
              letterSpacing: '-0.2px',
              boxShadow: isLoading ? 'none' : `0 8px 28px ${selectedRole.color}40`,
              transition: 'all 0.2s',
            }}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full border-2 border-white border-t-transparent"
                  style={{ width: '18px', height: '18px' }} />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ChevronRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>

          <div style={{ marginTop: '18px', padding: '14px', background: '#f0f9ff', borderRadius: '16px', border: '1px solid #bae6fd' }}>
            <div className="flex items-center gap-1.5 justify-center" style={{ marginBottom: '8px' }}>
              <div className="rounded-full" style={{ width: '6px', height: '6px', background: '#0ea5e9' }} />
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#0369a1', textAlign: 'center' }}>
                SEED CREDENTIALS — TAP TO AUTOFILL
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setRole('patient'); setIdentifier('9876543210'); setPassword('Password@123'); }}
                style={{ flex: 1, padding: '7px 4px', borderRadius: '12px', background: '#eff6ff', border: '1.5px solid #bfdbfe', fontSize: '11px', fontWeight: 700, color: '#2563eb' }}
              >
                Patient
              </button>
              <button
                onClick={() => { setRole('nurse'); setIdentifier('nurse@saai.com'); setPassword('Password@123'); }}
                style={{ flex: 1, padding: '7px 4px', borderRadius: '12px', background: '#f0fdfa', border: '1.5px solid #99f6e4', fontSize: '11px', fontWeight: 700, color: '#0f766e' }}
              >
                Nurse
              </button>
              <button
                onClick={() => { setRole('doctor'); setIdentifier('doctor@saai.com'); setPassword('Password@123'); }}
                style={{ flex: 1, padding: '7px 4px', borderRadius: '12px', background: '#eef2ff', border: '1.5px solid #c7d2fe', fontSize: '11px', fontWeight: 700, color: '#4338ca' }}
              >
                Doctor
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#cbd5e1' }}>
            © 2025 SAAI Physiotherapy Clinic · v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
