import { Outlet } from 'react-router';
import { Signal, Wifi, Battery } from 'lucide-react';

export function MobileFrame() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #060b18 0%, #0d1f4e 35%, #0c3a33 70%, #050e20 100%)' }}
    >
      {/* Background ambient blobs */}
      <div
        className="absolute rounded-full opacity-20"
        style={{
          width: '400px', height: '400px',
          top: '-100px', right: '-80px',
          background: 'radial-gradient(circle at center, #3b82f6, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute rounded-full opacity-15"
        style={{
          width: '350px', height: '350px',
          bottom: '-80px', left: '-60px',
          background: 'radial-gradient(circle at center, #10b981, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute rounded-full opacity-10"
        style={{
          width: '200px', height: '200px',
          top: '40%', left: '15%',
          background: 'radial-gradient(circle at center, #8b5cf6, transparent 70%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* App label top */}
      <div
        className="absolute top-6 left-1/2 flex items-center gap-2"
        style={{ transform: 'translateX(-50%)' }}
      >
        <div className="rounded-full" style={{ width: '6px', height: '6px', background: '#10b981' }} />
        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 600, letterSpacing: '1.5px' }}>
          SAAI PHYSIOTHERAPY · LIVE PREVIEW
        </span>
      </div>

      {/* Phone frame */}
      <div
        className="relative flex flex-col"
        style={{
          width: '390px',
          height: '812px',
          borderRadius: '52px',
          padding: '10px',
          background: 'linear-gradient(145deg, #1e2432, #111520)',
          boxShadow: `
            0 60px 120px rgba(0,0,0,0.7),
            0 0 0 1px rgba(255,255,255,0.08),
            inset 0 1px 0 rgba(255,255,255,0.1),
            inset 0 -1px 0 rgba(0,0,0,0.3)
          `,
        }}
      >
        {/* Side buttons */}
        <div className="absolute bg-slate-600 rounded-r" style={{ left: '-3px', top: '110px', width: '3px', height: '30px', opacity: 0.8 }} />
        <div className="absolute bg-slate-600 rounded-r" style={{ left: '-3px', top: '155px', width: '3px', height: '60px', opacity: 0.8 }} />
        <div className="absolute bg-slate-600 rounded-r" style={{ left: '-3px', top: '228px', width: '3px', height: '60px', opacity: 0.8 }} />
        <div className="absolute bg-slate-600 rounded-l" style={{ right: '-3px', top: '155px', width: '3px', height: '80px', opacity: 0.8 }} />

        {/* Reflection highlight */}
        <div
          className="absolute inset-0 rounded-[52px] pointer-events-none"
          style={{
            background: 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, transparent 40%)',
          }}
        />

        {/* Screen area */}
        <div
          className="flex flex-col overflow-hidden"
          style={{ borderRadius: '42px', flex: 1, position: 'relative', background: 'white' }}
        >
          {/* Status bar — absolute overlay, always on top */}
          <div
            className="absolute top-0 left-0 right-0 flex items-center justify-between px-7 pointer-events-none"
            style={{ height: '50px', zIndex: 30 }}
          >
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'white', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>9:41</span>
            <div className="flex items-center gap-1.5" style={{ color: 'white' }}>
              <Signal size={13} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
              <Wifi size={13} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
              <Battery size={16} strokeWidth={2.5} style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
            </div>
          </div>

          {/* App content — full height, scrolls underneath status bar */}
          <div className="flex-1 overflow-hidden" style={{ minHeight: 0, height: '100%' }}>
            <div style={{ height: '100%' }}>
              <Outlet />
            </div>
          </div>
        </div>
      </div>

      {/* Label below phone */}
      <div
        className="absolute bottom-5 flex flex-col items-center gap-1"
        style={{ left: '50%', transform: 'translateX(-50%)' }}
      >
        <div className="flex items-center gap-3">
          {['Patient', 'Nurse', 'Doctor'].map((role) => (
            <span key={role} style={{ fontSize: '10px', color: 'rgba(255,255,255,0.25)', fontWeight: 600, letterSpacing: '0.5px' }}>
              {role}
            </span>
          ))}
        </div>
        <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.15)', letterSpacing: '0.5px' }}>
          © {new Date().getFullYear()} SAAI Physiotherapy Clinic
        </span>
      </div>
    </div>
  );
}
