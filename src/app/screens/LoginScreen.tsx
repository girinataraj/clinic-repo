import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../contexts/AuthContext';
import {
  Eye, EyeOff, Mail, Lock, Phone,
  ChevronRight, HeartPulse, Stethoscope,
  CheckCircle, Shield, Users, Star, AlertCircle,
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
    value: 'nurse',
    label: 'Therapist',
    sublabel: 'Therapy & care',
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
  { icon: CheckCircle, text: 'Dr. SV. Sathish Kumar (Consultant Physiotherapist)', color: '#10b981' },
  { icon: Shield, text: 'Qualifications: MPT (Cardio-Resp), PGDFM, DYT, CDNT', color: '#3b82f6' },
  { icon: Users, text: '20A/10, Sakthi Nagar, Sengodapalayam, Thindal, Erode', color: '#8b5cf6' },
  { icon: Star, text: 'Phone: 94864 05778 | Email: saaiphysioclinicerode@gmail.com', color: '#f59e0b' },
];

export function LoginScreen() {
  const [role, setRole] = useState<UserRole>('nurse');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, loginError } = useAuth();
  const navigate = useNavigate();

  const selectedRole = roles.find((r) => r.value === role)!;
  const isPatient = role === 'patient';

  const handleRoleChange = (r: UserRole) => {
    setRole(r);
    setIdentifier('');
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
      <style>{`
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 1000px #ffffff inset !important;
          -webkit-text-fill-color: inherit !important;
        }
        input {
          background-color: #ffffff !important;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes pulseGlow {
          0%, 100% {
            transform: scale(1);
            opacity: 0.08;
          }
          50% {
            transform: scale(1.15) translate(15px, -15px);
            opacity: 0.14;
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-scale-in {
          animation: scaleIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .animate-pulse-glow {
          animation: pulseGlow 8s ease-in-out infinite;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
      `}</style>

      {/* ── LEFT BRANDING PANEL — desktop only ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[480px] xl:w-[520px] shrink-0 relative overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
        }}
      >
        {/* Ambient blobs */}
        <div className="absolute -right-20 -top-20 rounded-full opacity-10 animate-pulse-glow"
          style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, #38bdf8, transparent)' }} />
        <div className="absolute -left-16 bottom-1/4 rounded-full opacity-10 animate-pulse-glow"
          style={{ width: '250px', height: '250px', background: 'radial-gradient(circle, #10b981, transparent)', animationDelay: '2s' }} />
        <div className="absolute right-8 bottom-16 rounded-full opacity-10 animate-pulse-glow"
          style={{ width: '180px', height: '180px', background: 'radial-gradient(circle, #8b5cf6, transparent)', animationDelay: '4s' }} />

        {/* Top logo */}
        <div className="px-10 pt-12 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-10">
            <div
              className="overflow-hidden shrink-0"
              style={{
                width: '60px', height: '60px',
                borderRadius: '18px',
                boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
              }}
            >
              <img
                src="/SAAI-logo.png"
                alt="SAAI Physiotherapy Clinic"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
                Saai Physiotherapy Clinic
              </h1>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>
                "Getting better every day"
              </p>
            </div>
          </div>

          {/* Doctor Name Section */}
          <div className="animate-fade-in-up delay-200">
            <h2 style={{ fontSize: '38px', fontWeight: 900, color: 'white', lineHeight: 1.15, letterSpacing: '-1px', marginBottom: '10px' }}>
              Dr. SV. Sathish Kumar
            </h2>
          </div>

          {/* Title Section */}
          <div className="animate-fade-in-up delay-300">
            <p style={{ fontSize: '16px', color: '#38bdf8', fontWeight: 700, marginBottom: '6px' }}>
              Consultant Physiotherapist
            </p>
          </div>

          {/* Qualifications Section */}
          <div className="animate-fade-in-up delay-400">
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.85)', fontWeight: 600, marginBottom: '28px' }}>
              MPT (Cardio-Resp), PGDFM, DYT, CDNT
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-3.5 animate-fade-in-up delay-500">
            {features.map((f, index) => {
              const Icon = f.icon;
              return (
                <div key={f.text} className="flex items-center gap-3">
                  <div className="flex items-center justify-center rounded-xl shrink-0"
                    style={{ width: '38px', height: '38px', background: `${f.color}20` }}>
                    <Icon size={18} color={f.color} />
                  </div>
                  <span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', fontWeight: 600 }}>{f.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom testimonial */}
        <div className="px-10 pb-10 animate-fade-in-up delay-500" style={{ animationDelay: '600ms' }}>
          <div
            className="p-5 rounded-2xl animate-fade-in-up delay-500"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', animationDelay: '700ms' }}
          >
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', tracking: '0.5px', marginBottom: '6px' }}>
              Patient Testimonials
            </p>
            <p style={{ fontSize: '14px', fontWeight: 700, color: '#fbbf24', lineHeight: 1.6 }}>
              Need to get info from client
            </p>
          </div>
          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.3)' }}>
            © 2025 Saai Physiotherapy Clinic · All rights reserved
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
            className="overflow-hidden mb-4"
            style={{
              width: '72px', height: '72px',
              borderRadius: '22px', boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
            }}
          >
            <img
              src="/SAAI-logo.png"
              alt="SAAI Physiotherapy Clinic"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 900, color: 'white', textAlign: 'center', letterSpacing: '-0.5px' }}>
            Saai Physiotherapy Clinic
          </h1>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', textAlign: 'center' }}>
            "Getting better every day"
          </p>
          <p style={{ fontSize: '11px', color: '#38bdf8', marginTop: '4px', textAlign: 'center', fontWeight: 700 }}>
            Dr. SV. Sathish Kumar · Consultant Physiotherapist
          </p>
          <div
            className="flex items-center gap-2 mt-4 px-4 py-2 rounded-full"
            style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <div className="rounded-full" style={{ width: '6px', height: '6px', background: '#10b981' }} />
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
              20A/10, Sakthi Nagar, Sengodapalayam, Thindal, Erode
            </span>
          </div>
        </div>

        {/* Form card */}
        <div
          className="w-full max-w-md mx-auto px-6 py-8 lg:px-8 animate-scale-in"
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
                    <span style={{ fontSize: '10px', color: isSelected ? r.color : '#cbd5e1', font500: 'true' }}>
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
                background: '#ffffff',
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
                background: '#ffffff',
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
                onClick={() => { setRole('nurse'); setIdentifier('nurse@saai.com'); setPassword('Password@123'); }}
                style={{ flex: 1, padding: '7px 4px', borderRadius: '12px', background: '#f0fdfa', border: '1.5px solid #99f6e4', fontSize: '11px', fontWeight: 700, color: '#0f766e' }}
              >
                Therapist
              </button>
              <button
                onClick={() => { setRole('doctor'); setIdentifier('sathish@saai.com'); setPassword('spcerd@611'); }}
                style={{ flex: 1, padding: '7px 4px', borderRadius: '12px', background: '#eef2ff', border: '1.5px solid #c7d2fe', fontSize: '11px', fontWeight: 700, color: '#4338ca' }}
              >
                Doctor
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '11px', color: '#cbd5e1' }}>
            © 2025 Saai Physiotherapy Clinic · v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
