import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import {
  Eye, EyeOff, Mail, Lock,
  ChevronRight,
  CheckCircle, Shield, Users, Star, AlertCircle,
  Sparkles, Loader2,
} from 'lucide-react';

const features = [
  { icon: CheckCircle, text: 'Dr. SV. Sathish Kumar (Consultant Physiotherapist)', color: '#10b981' },
  { icon: Shield, text: 'Qualifications: MPT (Cardio-Resp), PGDFM, DYT, CDNT', color: '#3b82f6' },
  { icon: Users, text: '20A/10, Sakthi Nagar, Sengodapalayam, Thindal, Erode', color: '#8b5cf6' },
  { icon: Star, text: 'Phone: 94864 05778 | Email: saaiphysioclinicerode@gmail.com', color: '#f59e0b' },
];

export function LoginScreen() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, loginError, user, isInitializing } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitializing && user) {
      console.log('[Auth] AUTH_RESTORE_SUCCESS - redirecting to dashboard');
      const role = user.role;
      if (role === 'doctor' || role === 'admin') {
        navigate('/doctor', { replace: true });
      } else if (role === 'nurse') {
        navigate('/nurse', { replace: true });
      } else if (role === 'patient') {
        navigate('/patient', { replace: true });
      }
    }
  }, [user, isInitializing, navigate]);

  const handleLogin = async () => {
    if (!identifier.trim() || !password.trim()) return;
    try {
      const authenticatedUser = await login(identifier.trim(), password);
      const role = authenticatedUser?.role;
      if (role === 'doctor' || role === 'admin') {
        navigate('/doctor');
      } else if (role === 'nurse') {
        navigate('/nurse');
      } else if (role === 'patient') {
        navigate('/patient');
      } else {
        navigate('/doctor');
      }
    } catch {
      // loginError is handled in AuthContext
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  const handleAutofill = (email: string, pass: string) => {
    setIdentifier(email);
    setPassword(pass);
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8faff] dark:bg-slate-900">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Checking session...</p>
        </div>
      </div>
    );
  }

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
        <div
          className="absolute -right-20 -top-20 rounded-full opacity-10 animate-pulse-glow"
          style={{ width: '300px', height: '300px', background: 'radial-gradient(circle, #38bdf8, transparent)' }}
        />
        <div
          className="absolute -left-16 bottom-1/4 rounded-full opacity-10 animate-pulse-glow"
          style={{ width: '250px', height: '250px', background: 'radial-gradient(circle, #10b981, transparent)', animationDelay: '2s' }}
        />
        <div
          className="absolute right-8 bottom-16 rounded-full opacity-10 animate-pulse-glow"
          style={{ width: '180px', height: '180px', background: 'radial-gradient(circle, #8b5cf6, transparent)', animationDelay: '4s' }}
        />

        {/* Top logo */}
        <div className="px-10 pt-12 animate-fade-in-up">
          <div className="flex items-center gap-4 mb-10">
            <div
              className="overflow-hidden shrink-0"
              style={{
                width: '60px',
                height: '60px',
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
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.text} className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center rounded-xl shrink-0"
                    style={{ width: '38px', height: '38px', background: `${f.color}20` }}
                  >
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
            <p style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
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
      <div className="flex-1 flex flex-col items-center justify-center overflow-y-auto p-4 sm:p-6 lg:p-12">

        {/* Mobile header */}
        <div
          className="lg:hidden w-full flex flex-col items-center pb-10 px-6 relative overflow-hidden rounded-3xl mb-4"
          style={{
            background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 50%, #2563eb 100%)',
            paddingTop: '40px',
          }}
        >
          <div
            className="absolute -right-12 -top-12 rounded-full opacity-10"
            style={{ width: '140px', height: '140px', background: 'white' }}
          />
          <div
            className="overflow-hidden mb-4"
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '20px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
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
          <p style={{ fontSize: '12px', color: '#38bdf8', marginTop: '4px', textAlign: 'center', fontWeight: 700 }}>
            Dr. SV. Sathish Kumar · Consultant Physiotherapist
          </p>
        </div>

        {/* Form card */}
        <div
          className="w-full max-w-md mx-auto px-6 py-8 sm:px-8 sm:py-10 animate-scale-in"
          style={{
            background: 'white',
            borderRadius: '28px',
            boxShadow: '0 10px 40px rgba(15, 23, 42, 0.06), 0 1px 3px rgba(15, 23, 42, 0.04)',
            border: '1px solid #f1f5f9',
          }}
        >
          {/* Heading */}
          <div className="mb-7">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>
                <Sparkles size={12} />
                Clinic Portal
              </span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.7px' }}>
              Sign In
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
              Enter your credentials to access your account
            </p>
          </div>

          {/* Identifier: Email or Phone */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Email or Mobile Number
            </label>
            <div
              className="flex items-center gap-3 px-4"
              style={{
                border: `1.5px solid ${identifier ? '#3b82f6' : '#e2e8f0'}`,
                borderRadius: '16px',
                background: '#ffffff',
                transition: 'border-color 0.2s',
              }}
            >
              <Mail size={18} color={identifier ? '#2563eb' : '#94a3b8'} />
              <input
                id="identifier-input"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. your@email.com or mobile"
                className="flex-1 outline-none bg-transparent"
                style={{ padding: '14px 0', fontSize: '14px', color: '#1e293b' }}
                autoComplete="off"
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', letterSpacing: '0.6px', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <div
              className="flex items-center gap-3 px-4"
              style={{
                border: `1.5px solid ${password ? '#3b82f6' : '#e2e8f0'}`,
                borderRadius: '16px',
                background: '#ffffff',
                transition: 'border-color 0.2s',
              }}
            >
              <Lock size={18} color={password ? '#2563eb' : '#94a3b8'} />
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your password"
                className="flex-1 outline-none bg-transparent"
                style={{ padding: '14px 0', fontSize: '14px', color: '#1e293b' }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}
              >
                {showPassword ? <EyeOff size={18} color="#94a3b8" /> : <Eye size={18} color="#94a3b8" />}
              </button>
            </div>
          </div>

          <div className="text-right" style={{ marginBottom: '24px' }}>
            <button
              type="button"
              style={{ fontSize: '13px', fontWeight: 700, color: '#2563eb', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Error message */}
          {loginError && (
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-xl"
              style={{ background: '#fef2f2', border: '1px solid #fecaca', marginBottom: '18px' }}
            >
              <AlertCircle size={16} color="#ef4444" className="shrink-0" />
              <p style={{ fontSize: '13px', color: '#dc2626', fontWeight: 600 }}>{loginError}</p>
            </div>
          )}

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5"
            style={{
              padding: '16px',
              borderRadius: '18px',
              background: isLoading ? '#93c5fd' : 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
              color: 'white',
              fontSize: '16px',
              fontWeight: 800,
              letterSpacing: '-0.2px',
              boxShadow: isLoading ? 'none' : '0 8px 24px rgba(37, 99, 235, 0.35)',
              transition: 'all 0.2s',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? (
              <>
                <div
                  className="animate-spin rounded-full border-2 border-white border-t-transparent"
                  style={{ width: '18px', height: '18px' }}
                />
                Signing in...
              </>
            ) : (
              <>
                Sign In
                <ChevronRight size={18} strokeWidth={2.5} />
              </>
            )}
          </button>

          {/* Quick presets */}
          <div style={{ marginTop: '22px', padding: '14px', background: '#f8fafc', borderRadius: '18px', border: '1px solid #e2e8f0' }}>
            <div className="flex items-center gap-1.5 justify-center" style={{ marginBottom: '10px' }}>
              <div className="rounded-full" style={{ width: '6px', height: '6px', background: '#2563eb' }} />
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textAlign: 'center', letterSpacing: '0.4px' }}>
                QUICK ACCESS ACCOUNTS (AUTOFILL)
              </p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleAutofill('sathish@saai.com', 'spcerd@611')}
                style={{
                  padding: '9px 4px',
                  borderRadius: '12px',
                  background: '#eef2ff',
                  border: '1.5px solid #c7d2fe',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#4338ca',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Doctor (Sathish)
              </button>
              <button
                type="button"
                onClick={() => handleAutofill('raghul@saai.com', '@TN36bt5522')}
                style={{
                  padding: '9px 4px',
                  borderRadius: '12px',
                  background: '#f0fdfa',
                  border: '1.5px solid #99f6e4',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#0f766e',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Therapist (Raghul)
              </button>
              <button
                type="button"
                onClick={() => handleAutofill('yokesh@saai.com', 'YOKESHPT@2503')}
                style={{
                  padding: '9px 4px',
                  borderRadius: '12px',
                  background: '#f0fdfa',
                  border: '1.5px solid #99f6e4',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#0f766e',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Therapist (Yokesh)
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '18px', fontSize: '11px', color: '#94a3b8' }}>
            © 2025 Saai Physiotherapy Clinic · v2.0
          </p>
        </div>
      </div>
    </div>
  );
}
