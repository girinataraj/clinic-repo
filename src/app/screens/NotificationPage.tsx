import { Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

const themeConfig = {
  doctor: {
    headerBg: 'linear-gradient(135deg, #2B7A78 0%, #3AAFA9 100%)',
    pageBg: '#DEF2F1',
    headerShadow: '0 4px 24px rgba(43, 122, 120, 0.15)',
    accentColor: 'text-teal-600',
    iconBg: 'bg-teal-50',
    textColor: '#FEFFFF'
  },
  nurse: {
    headerBg: 'linear-gradient(135deg, #0d2b27 0%, #0f766e 100%)',
    pageBg: '#f8fafc',
    headerShadow: '0 4px 24px rgba(15, 118, 110, 0.15)',
    accentColor: 'text-teal-600',
    iconBg: 'bg-teal-50',
    textColor: '#ffffff'
  },
  patient: {
    headerBg: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
    pageBg: '#f8fafc',
    headerShadow: '0 4px 24px rgba(37, 99, 235, 0.15)',
    accentColor: 'text-blue-600',
    iconBg: 'bg-blue-50',
    textColor: '#ffffff'
  },
  admin: {
    headerBg: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    pageBg: '#f8fafc',
    headerShadow: '0 4px 24px rgba(0, 0, 0, 0.1)',
    accentColor: 'text-slate-600',
    iconBg: 'bg-slate-50',
    textColor: '#ffffff'
  }
};

export function NotificationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || 'doctor';
  const theme = themeConfig[role as keyof typeof themeConfig] || themeConfig.doctor;

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: theme.pageBg }}>
      <div className="flex-1 overflow-y-auto">
        <div
          className="px-6 pb-8 relative overflow-hidden rounded-b-3xl"
          style={{
            background: theme.headerBg,
            paddingTop: '32px',
            boxShadow: theme.headerShadow,
          }}
        >
          <div className="absolute -right-16 -top-16 rounded-full opacity-10 pointer-events-none"
            style={{ width: '200px', height: '200px', background: '#FEFFFF' }} />
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <ArrowLeft size={24} color={theme.textColor} />
              </button>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: theme.textColor, letterSpacing: '-0.5px' }}>
                Notifications
              </h1>
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 max-w-4xl mx-auto w-full mt-6 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-start">
            <div className={`w-10 h-10 rounded-full ${theme.iconBg} flex items-center justify-center shrink-0`}>
              <Bell size={20} className={theme.accentColor} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">New patient assigned</p>
              <p className="text-xs text-slate-500 mt-1">2 mins ago</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-start">
            <div className={`w-10 h-10 rounded-full ${theme.iconBg} flex items-center justify-center shrink-0`}>
              <Bell size={20} className={theme.accentColor} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">System maintenance at midnight</p>
              <p className="text-xs text-slate-500 mt-1">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

