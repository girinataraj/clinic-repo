import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { usePatientAppointments } from '../../hooks/useAppointments';
import { useEvaluations } from '../../hooks/useEvaluations';
import { useExercisePlans } from '../../hooks/useExercisePlans';
import {
  Calendar, FileText, Activity, Bell, ChevronRight,
  Clock, CheckCircle, Dumbbell, TrendingUp, User,
  Zap, Heart, ArrowRight
} from 'lucide-react';

const quickActions = [
  { label: 'Exercises', icon: Dumbbell, path: '/patient/exercise', color: 'text-purple-600', bg: 'bg-purple-100', gradient: 'from-purple-50 to-white' },
  { label: 'Records', icon: FileText, path: '/patient/records', color: 'text-teal-600', bg: 'bg-teal-100', gradient: 'from-teal-50 to-white' },
  { label: 'Profile', icon: User, path: '/patient/profile', color: 'text-orange-600', bg: 'bg-orange-100', gradient: 'from-orange-50 to-white' },
];

// ── Skeleton block ─────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-pulse">
      <div className="flex gap-3">
        <div className="w-12 h-12 rounded-xl bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-100 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Patient ID — the logged-in user's ID is also their patient record ID
  const patientId = user?.id ?? null;

  // ── Live backend data ─────────────────────────────────────────────────────
  const { data: apptData, isLoading: apptLoading } = usePatientAppointments(patientId);
  const { data: evalData, isLoading: evalLoading } = useEvaluations({ patientId: patientId ?? undefined, limit: 10 });
  const { data: planData, isLoading: planLoading } = useExercisePlans(patientId);

  const appointments = apptData?.data ?? [];
  const evaluations = evalData?.data ?? [];
  const exercisePlans = planData?.data ?? [];

  // ── Derived stats ─────────────────────────────────────────────────────────
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'pending' || a.status === 'confirmed'
  );
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
  const totalEvaluations = evaluations.length;
  const totalPlans = exercisePlans.length;

  // Active plan exercises
  const activePlan = exercisePlans[0]; // Most recent plan
  const exerciseItems = activePlan?.items ?? [];

  const stats = [
    { label: 'Appointments', value: upcomingAppointments.length, icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Reports', value: totalEvaluations, icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { label: 'Exercises', value: exerciseItems.length, icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50' },
  ];

  const isLoading = apptLoading || evalLoading || planLoading;

  const firstName = user?.name?.split(' ')[0] || 'there';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      <div className="flex-1 overflow-y-auto pb-20 md:pb-6">
        {/* Header Section */}
        <div 
          className="px-6 pt-8 pb-12 relative overflow-hidden shrink-0"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}
        >
          {/* Subtle background decoration */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-blue-100/80 mb-1 uppercase tracking-wider">{today}</p>
                <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-sm">
                  Hi, {firstName}! 👋
                </h1>
                <p className="text-sm text-blue-100 mt-1 font-medium">
                  Your recovery is on track
                </p>
              </div>
              <div className="flex items-center gap-3 relative z-50">
                {/* Notification Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      if (window.innerWidth >= 768) {
                        navigate('/patient/notifications');
                      } else {
                        setShowNotifications(!showNotifications);
                        setShowProfileMenu(false);
                      }
                    }}
                    className="relative p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm">
                    <Bell className="w-5 h-5 text-white" />
                    {upcomingAppointments.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm border border-red-400 pointer-events-none">
                        {upcomingAppointments.length}
                      </span>
                    )}
                  </button>
                  
                  {/* Only show notifications dropdown on mobile */}
                  {showNotifications && (
                    <div className="md:hidden absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden text-left">
                      <div className="p-4 border-b border-slate-100 bg-slate-50">
                        <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                          <p className="text-xs font-semibold text-slate-800">Upcoming appointment tomorrow</p>
                          <p className="text-[10px] text-slate-500 mt-1">Just now</p>
                        </div>
                        <div className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer">
                          <p className="text-xs font-semibold text-slate-800">New exercise plan ready</p>
                          <p className="text-[10px] text-slate-500 mt-1">2 hours ago</p>
                        </div>
                      </div>
                      <div className="p-3 text-center border-t border-slate-100">
                        <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Mark all as read</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 max-w-5xl mx-auto w-full space-y-6 -mt-6 relative z-10">
          {/* Recovery Progress - dynamic from evaluations */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span className="text-sm font-semibold text-slate-800">Recovery Progress</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-full border border-slate-100">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-600">
                  {completedAppointments} session{completedAppointments !== 1 ? 's' : ''} completed
                </span>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((completedAppointments / Math.max(appointments.length, 1)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-xs font-medium text-slate-500">
              {isLoading ? 'Loading...' : `${completedAppointments} of ${appointments.length} total sessions completed`}
            </p>
          </div>

          {/* Quick Actions & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Stats Row */}
            <div className="flex gap-3">
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-pulse">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 mb-2 mx-auto" />
                      <div className="h-5 bg-slate-100 rounded w-1/2 mx-auto mb-1" />
                      <div className="h-3 bg-slate-50 rounded w-3/4 mx-auto" />
                    </div>
                  ))
                : stats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="flex-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className={`p-2.5 rounded-xl ${stat.bg} mb-2`}>
                          <Icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <span className="text-xl font-bold text-slate-900">{stat.value}</span>
                        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mt-1">{stat.label}</span>
                      </div>
                    );
                  })}
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className={`flex-1 flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-200 shadow-sm bg-gradient-to-br ${action.gradient} hover:shadow-md transition-shadow`}
                  >
                    <div className={`p-2.5 rounded-xl ${action.bg} mb-2`}>
                      <Icon className={`w-5 h-5 ${action.color}`} />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Book Appointment CTA */}
          <button
            onClick={() => navigate('/patient/appointment')}
            className="w-full relative overflow-hidden bg-emerald-600 hover:bg-emerald-700 transition-colors rounded-2xl p-5 shadow-lg shadow-emerald-600/20 flex items-center justify-between group"
          >
            <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-lg font-bold text-white mb-0.5">Book Appointment</h3>
                <p className="text-emerald-100 text-sm font-medium">Find & schedule a specialist</p>
              </div>
            </div>
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm group-hover:translate-x-1 transition-transform relative z-10">
              <ArrowRight className="w-5 h-5 text-white" />
            </div>
          </button>

          {/* Two-column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* LEFT COLUMN */}
            <div className="space-y-6">
              
              {/* Upcoming Appointments */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Upcoming Appointments</h3>
                  <button onClick={() => navigate('/patient/appointment')} className="text-sm font-semibold text-blue-600 hover:text-blue-700">See All</button>
                </div>
                <div className="space-y-3">
                  {apptLoading && <CardSkeleton />}
                  {!apptLoading && upcomingAppointments.length === 0 && (
                    <div className="text-center py-6">
                      <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-400">No upcoming appointments</p>
                      <p className="text-xs text-slate-400 mt-1">Book one to get started</p>
                    </div>
                  )}
                  {upcomingAppointments.slice(0, 3).map((appt) => (
                    <div key={appt.id} className={`flex items-start gap-4 p-4 rounded-xl border ${appt.status === 'confirmed' ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-100 text-blue-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{appt.doctorName ?? 'Doctor'}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{appt.reason ?? 'Appointment'}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-600">
                              {new Date(appt.datetime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-600">
                              {new Date(appt.datetime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex shrink-0 items-center gap-1 ${appt.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {appt.status === 'confirmed' ? '✓ Confirmed' : '⏳ Pending'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Evaluations (replaces fake "reports") */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Recent Reports</h3>
                  <button onClick={() => navigate('/patient/records')} className="text-sm font-semibold text-blue-600 hover:text-blue-700">See All</button>
                </div>
                <div className="space-y-3">
                  {evalLoading && <CardSkeleton />}
                  {!evalLoading && evaluations.length === 0 && (
                    <div className="text-center py-6">
                      <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-slate-400">No evaluations yet</p>
                    </div>
                  )}
                  {evaluations.slice(0, 3).map((evaluation) => {
                    const typeColors: Record<string, { bg: string; color: string }> = {
                      submitted: { bg: 'bg-blue-50', color: 'text-blue-600' },
                      reviewed: { bg: 'bg-teal-50', color: 'text-teal-600' },
                      draft: { bg: 'bg-purple-50', color: 'text-purple-600' },
                    };
                    const tc = typeColors[evaluation.status] ?? typeColors.draft;
                    return (
                      <div key={evaluation.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tc.bg}`}>
                          <FileText className={`w-5 h-5 ${tc.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {evaluation.diagnosis ?? evaluation.chiefComplaints ?? 'Evaluation'}
                          </p>
                          <p className="text-xs font-medium text-slate-500 mt-0.5">
                            {new Date(evaluation.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${tc.bg} ${tc.color} capitalize`}>
                          {evaluation.status}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              
              {/* Active Exercise Plan */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Exercise Plan</h3>
                  <button
                    onClick={() => navigate('/patient/exercise')}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View Plan
                  </button>
                </div>

                {planLoading && (
                  <div className="animate-pulse space-y-3">
                    <div className="h-16 bg-slate-100 rounded-xl" />
                    <div className="h-8 bg-slate-100 rounded-lg" />
                    <div className="h-8 bg-slate-100 rounded-lg" />
                  </div>
                )}

                {!planLoading && !activePlan && (
                  <div className="text-center py-6">
                    <Dumbbell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-slate-400">No exercise plan assigned</p>
                    <p className="text-xs text-slate-400 mt-1">Your doctor will create one for you</p>
                  </div>
                )}

                {!planLoading && activePlan && (
                  <>
                    <div className="mb-5 bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Dumbbell className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{activePlan.title}</p>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                              {activePlan.notes ?? `${exerciseItems.length} exercises`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-purple-100 shadow-sm">
                          <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-bold text-slate-700">{exerciseItems.length} items</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {exerciseItems.map((ex) => (
                        <div key={ex.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 bg-white border-slate-300">
                            <CheckCircle className="w-4 h-4 text-slate-300" />
                          </div>
                          <span className="text-sm flex-1 text-slate-700 font-semibold">
                            {ex.name}
                          </span>
                          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">
                            {ex.sets && ex.reps ? `${ex.sets} × ${ex.reps}` : ex.duration ?? '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Health Tip */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100 p-5 relative overflow-hidden">
                <div className="absolute right-0 top-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
                <div className="flex items-center gap-2 mb-3 relative z-10">
                  <div className="p-1.5 bg-blue-100 rounded-lg">
                    <Heart className="w-4 h-4 text-blue-600 fill-blue-600" />
                  </div>
                  <span className="text-xs font-bold tracking-wider text-blue-800">DAILY TIP</span>
                </div>
                <p className="text-sm font-medium text-slate-700 leading-relaxed relative z-10">
                  Stay consistent with your exercise plan. Even on low-energy days, light movement accelerates recovery significantly.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden shrink-0 border-t border-slate-200 bg-white">
        <BottomNav role="patient" />
      </div>
    </div>
  );
}
