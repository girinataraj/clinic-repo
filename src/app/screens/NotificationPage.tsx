import { Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';

export function NotificationPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#DEF2F1' }}>
      <div className="flex-1 overflow-y-auto">
        <div
          className="px-6 pb-8 relative overflow-hidden rounded-b-3xl"
          style={{
            background: 'linear-gradient(135deg, #2B7A78 0%, #3AAFA9 100%)',
            paddingTop: '32px',
            boxShadow: '0 4px 24px rgba(43, 122, 120, 0.15)',
          }}
        >
          <div className="absolute -right-16 -top-16 rounded-full opacity-10 pointer-events-none"
            style={{ width: '200px', height: '200px', background: '#FEFFFF' }} />
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <ArrowLeft size={24} color="#FEFFFF" />
              </button>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#FEFFFF', letterSpacing: '-0.5px' }}>
                Notifications
              </h1>
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 max-w-4xl mx-auto w-full mt-6 space-y-4">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
              <Bell size={20} className="text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">New patient assigned</p>
              <p className="text-xs text-slate-500 mt-1">2 mins ago</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
              <Bell size={20} className="text-teal-600" />
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
