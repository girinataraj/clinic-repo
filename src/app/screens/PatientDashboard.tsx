import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ThemeToggle';
import { BottomNav } from '../components/BottomNav';
import { usePatientAppointments } from '../../hooks/useAppointments';
import { useEvaluations } from '../../hooks/useEvaluations';
import { useExercisePlans } from '../../hooks/useExercisePlans';

import {
  Calendar, FileText, Activity, ChevronRight,
  Clock, CheckCircle, Dumbbell, TrendingUp, User,
  Zap, Heart, ArrowRight, MapPin, Bell
} from 'lucide-react';

const quickActions = [
  { label: 'Exercises', icon: Dumbbell, path: '/patient/exercise', color: 'text-purple-600', bg: 'bg-purple-100', gradient: 'from-purple-50 to-white' },
  { label: 'Records', icon: FileText, path: '/patient/records', color: 'text-teal-600', bg: 'bg-teal-100', gradient: 'from-teal-50 to-white' },
  { label: 'Profile', icon: User, path: '/patient/profile', color: 'text-orange-600', bg: 'bg-orange-100', gradient: 'from-orange-50 to-white' },
];

function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[22px] p-5 shadow-sm animate-pulse">
      <div className="flex gap-4">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 shrink-0" />
        <div className="flex-1 space-y-2 py-1">
          <div className="h-3.5 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
          <div className="h-3 bg-slate-50 dark:bg-slate-800/50 rounded w-1/2" />
        </div>
      </div>
    </div>
  );
}

export function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const patientId = user?.patient_id ?? null;

  const { data: apptData, isLoading: apptLoading } = usePatientAppointments(patientId);
  const { data: evalData, isLoading: evalLoading } = useEvaluations({ patientId: patientId ?? undefined, limit: 10 });
  const { data: planData, isLoading: planLoading } = useExercisePlans(patientId);

  const appointments = apptData?.data ?? [];
  const evaluations = evalData?.data ?? [];
  const exercisePlans = planData?.data ?? [];

  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'pending' || a.status === 'confirmed'
  );
  const completedAppointments = appointments.filter((a) => a.status === 'completed').length;
  const totalEvaluations = evaluations.length;

  const activePlan = exercisePlans[0];
  const exerciseItems = activePlan?.items ?? [];

  const stats = [
    { label: 'Appointments', value: upcomingAppointments.length, icon: Calendar, color: 'text-blue-500 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { label: 'Reports', value: totalEvaluations, icon: FileText, color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
    { label: 'Exercises', value: exerciseItems.length, icon: Activity, color: 'text-amber-500 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/30' },
  ];

  const isLoading = apptLoading || evalLoading || planLoading;
  const firstName = user?.name?.split(' ')[0] || 'there';
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="flex-1 overflow-y-auto pb-24 md:pb-6">
        
        {/* ── Mobile-First Header ── */}
        <div className="px-5 pt-10 pb-12 relative bg-gradient-to-br from-blue-700 to-indigo-600 dark:from-slate-900 dark:to-slate-800 rounded-b-[2rem] shadow-md z-10">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Activity size={140} className="text-white transform rotate-12" />
          </div>
          
          <div className="flex items-center justify-between relative z-10 mb-6">
            <div>
              <p className="text-[12px] font-bold text-blue-200/80 mb-1 tracking-wider uppercase">My Recovery</p>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Hi, {firstName}! 👋
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md flex items-center justify-center transition-colors border border-white/20 shadow-sm"
              >
                <Bell size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <div className="px-4 -mt-8 relative z-20 flex flex-col gap-5">
          
          {/* Recovery Progress Card */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-lg shadow-blue-900/5 border border-slate-100 dark:border-slate-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                </div>
                <span className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100">Recovery Progress</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-full">
                <TrendingUp className="w-3 h-3 text-emerald-500" />
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                  {completedAppointments} session{completedAppointments !== 1 ? 's' : ''} done
                </span>
              </div>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-3">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.min((completedAppointments / Math.max(appointments.length, 1)) * 100, 100)}%` }}
              />
            </div>
            <p className="text-[12px] font-bold text-slate-400 dark:text-slate-500">
              {isLoading ? 'Loading...' : `${completedAppointments} of ${appointments.length} total sessions completed`}
            </p>
          </div>

          {/* Book Appointment CTA */}
          <button
            onClick={() => navigate('/patient/appointment')}
            className="w-full relative overflow-hidden bg-gradient-to-r from-emerald-500 to-emerald-400 dark:from-emerald-700 dark:to-emerald-600 rounded-[22px] p-5 shadow-lg shadow-emerald-500/20 flex items-center justify-between active:scale-[0.98] transition-transform"
          >
            <div className="absolute right-0 top-0 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-2xl backdrop-blur-sm flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h3 className="text-[16px] font-black text-white mb-0.5 tracking-wide">Book Visit</h3>
                <p className="text-emerald-50 text-[12px] font-semibold">Schedule next session</p>
              </div>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full backdrop-blur-sm flex items-center justify-center relative z-10">
              <ChevronRight className="w-5 h-5 text-white" strokeWidth={3} />
            </div>
          </button>

          {/* Quick Actions */}
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="flex flex-col items-center justify-center p-4 rounded-[20px] border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 active:scale-95 transition-transform"
                >
                  <div className={`p-3 rounded-2xl ${action.bg} dark:bg-slate-800 mb-2`}>
                    <Icon className={`w-5 h-5 ${action.color}`} />
                  </div>
                  <span className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300">{action.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Exercise Plan */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 mt-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white">Today's Exercises</h3>
              <button
                onClick={() => navigate('/patient/exercise')}
                className="text-[12px] font-bold text-blue-600 dark:text-blue-400"
              >
                View All
              </button>
            </div>

            {planLoading && <CardSkeleton />}

            {!planLoading && !activePlan && (
              <div className="text-center py-6">
                <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <Dumbbell className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400">No plan assigned yet</p>
              </div>
            )}

            {!planLoading && activePlan && (
              <div className="space-y-3">
                {exerciseItems.slice(0, 3).map((ex) => (
                  <div key={ex.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-[16px] border border-slate-100 dark:border-slate-800">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                      <CheckCircle className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    </div>
                    <span className="text-[14px] flex-1 text-slate-800 dark:text-slate-200 font-bold truncate">
                      {ex.name}
                    </span>
                    <span className="px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] font-black rounded-lg shadow-sm border border-slate-100 dark:border-slate-800">
                      {ex.sets && ex.reps ? `${ex.sets} × ${ex.reps}` : ex.duration ?? '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white">Upcoming Visits</h3>
            </div>
            
            <div className="space-y-3">
              {apptLoading && <CardSkeleton />}
              
              {!apptLoading && upcomingAppointments.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-[13px] font-bold text-slate-500 dark:text-slate-400">No upcoming visits</p>
                </div>
              )}

              {upcomingAppointments.slice(0, 3).map((appt) => (
                <div key={appt.id} className="flex items-start gap-4 p-4 rounded-[20px] bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-blue-100/50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-extrabold text-slate-900 dark:text-white truncate">{appt.doctorName ?? 'Consultation'}</p>
                    <p className="text-[12px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">{appt.reason ?? 'General'}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-2 py-1 rounded-md shadow-sm border border-slate-100 dark:border-slate-800">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-[10px] font-black text-slate-600 dark:text-slate-300">
                          {new Date(appt.datetime).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="md:hidden shrink-0 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav role="patient" />
      </div>
    </div>
  );
}
