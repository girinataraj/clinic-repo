import { Bell, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

const themeConfig = {
  doctor: {
    headerClass: 'bg-gradient-to-br from-[#262842] to-[#3B3E66] dark:from-slate-900 dark:to-slate-800 shadow-[0_4px_24px_rgba(38,40,66,0.15)] dark:shadow-none',
    pageClass: 'bg-[#E8E9F1] dark:bg-slate-950',
    accentClass: 'text-indigo-900 dark:text-indigo-400',
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-900/30',
  },
  nurse: {
    headerClass: 'bg-gradient-to-br from-teal-900 to-teal-600 dark:from-slate-900 dark:to-slate-800 shadow-[0_4px_24px_rgba(15,118,110,0.15)] dark:shadow-none',
    pageClass: 'bg-slate-50 dark:bg-slate-950',
    accentClass: 'text-teal-700 dark:text-teal-400',
    iconBgClass: 'bg-teal-50 dark:bg-teal-900/30',
  },
  patient: {
    headerClass: 'bg-gradient-to-br from-blue-900 to-blue-600 dark:from-slate-900 dark:to-slate-800 shadow-[0_4px_24px_rgba(37,99,235,0.15)] dark:shadow-none',
    pageClass: 'bg-blue-50/50 dark:bg-slate-950',
    accentClass: 'text-blue-600 dark:text-blue-400',
    iconBgClass: 'bg-blue-50 dark:bg-blue-900/30',
  },
  admin: {
    headerClass: 'bg-gradient-to-br from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-800 shadow-[0_4px_24px_rgba(0,0,0,0.1)] dark:shadow-none',
    pageClass: 'bg-slate-50 dark:bg-slate-950',
    accentClass: 'text-slate-600 dark:text-slate-400',
    iconBgClass: 'bg-slate-100 dark:bg-slate-800',
  }
};

export function NotificationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: notifications = [], isLoading, isError } = useNotifications({ limit: 30 });
  const role = user?.role || 'doctor';
  const theme = themeConfig[role as keyof typeof themeConfig] || themeConfig.doctor;

  return (
    <div className={`flex flex-col h-full font-sans ${theme.pageClass}`}>
      <div className="flex-1 overflow-y-auto">
        <div className={`px-6 pb-8 pt-8 relative overflow-hidden rounded-b-3xl ${theme.headerClass}`}>
          <div className="absolute -right-16 -top-16 rounded-full opacity-10 pointer-events-none w-[200px] h-[200px] bg-white" />
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <ArrowLeft size={24} className="text-white" />
              </button>
              <h1 className="text-[24px] font-bold text-white tracking-tight">
                Notifications
              </h1>
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 max-w-4xl mx-auto w-full mt-6 space-y-4">
          {isError ? (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Unable to load notifications</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Please try again shortly</p>
            </div>
          ) : isLoading ? (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-800 dark:text-white">No notifications yet</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">New clinic activity will appear here</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div key={`${item.type}-${item.id}`} className={`bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border ${item.isRead ? 'border-slate-100 dark:border-slate-700 opacity-70' : 'border-blue-100 dark:border-slate-600'} flex gap-4 items-start`}>
                <div className={`w-10 h-10 rounded-full ${theme.iconBgClass} flex items-center justify-center shrink-0`}>
                  <Bell size={20} className={theme.accentClass} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">{item.body}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {new Date(item.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
