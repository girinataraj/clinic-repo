import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import {
  Calendar, FileText, Activity, Bell, ChevronRight,
  Clock, CheckCircle, Dumbbell, TrendingUp, User,
  Zap, Heart, ArrowRight
} from 'lucide-react';

const upcomingAppointments = [
  {
    id: 1, doctor: 'Dr. Rajesh Kumar', specialization: 'Sports Physiotherapy',
    date: 'Tomorrow', time: '10:00 AM', status: 'confirmed',
    initials: 'RK', color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200'
  },
  {
    id: 2, doctor: 'Dr. Priya Nair', specialization: 'Orthopedic Rehab',
    date: 'May 3', time: '2:30 PM', status: 'pending',
    initials: 'PN', color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-200'
  },
];

const reports = [
  { id: 1, title: 'Knee Assessment Report', date: 'Jan 20, 2025', type: 'Assessment', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 2, title: 'Back Pain Evaluation', date: 'Dec 15, 2024', type: 'Evaluation', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 3, title: 'Post-op Rehab Plan', date: 'Nov 28, 2024', type: 'Treatment', color: 'text-teal-600', bg: 'bg-teal-50' },
];

const initialExercises = [
  { id: 1, name: 'Quad Stretch', reps: '3 × 15', done: true },
  { id: 2, name: 'Hip Bridges', reps: '3 × 12', done: true },
  { id: 3, name: 'Calf Raises', reps: '2 × 20', done: false },
];

const quickActions = [
  { label: 'Exercises', icon: Dumbbell, path: '/patient/exercise', color: 'text-purple-600', bg: 'bg-purple-100', gradient: 'from-purple-50 to-white' },
  { label: 'Records', icon: FileText, path: '/patient/records', color: 'text-teal-600', bg: 'bg-teal-100', gradient: 'from-teal-50 to-white' },
  { label: 'Profile', icon: User, path: '/patient/profile', color: 'text-orange-600', bg: 'bg-orange-100', gradient: 'from-orange-50 to-white' },
];

const stats = [
  { label: 'Appointments', value: '2', icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-50' },
  { label: 'Reports', value: '5', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { label: 'Exercises', value: '3', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-50' },
];

export function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const currentDay = 5;
  const totalDays = 7;
  const [selectedDay, setSelectedDay] = useState(currentDay);

  const [exercisesByDay, setExercisesByDay] = useState<Record<number, typeof initialExercises>>(() => {
    const state: Record<number, typeof initialExercises> = {};
    for (let i = 1; i <= totalDays; i++) {
      if (i < currentDay) {
        state[i] = initialExercises.map(ex => ({ ...ex, done: true }));
      } else if (i === currentDay) {
        state[i] = initialExercises.map(ex => ({ ...ex }));
      } else {
        state[i] = initialExercises.map(ex => ({ ...ex, done: false }));
      }
    }
    return state;
  });

  const exercises = exercisesByDay[selectedDay];

  const toggleExercise = (id: number) => {
    if (selectedDay !== currentDay) return;
    setExercisesByDay(prev => ({
      ...prev,
      [selectedDay]: prev[selectedDay].map(ex => 
        ex.id === id ? { ...ex, done: !ex.done } : ex
      )
    }));
  };

  const completedExercises = exercises.filter(ex => ex.done).length;
  const totalExercises = exercises.length;
  const exerciseProgress = Math.round((completedExercises / totalExercises) * 100);

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
              <div className="flex items-center gap-3">
                <button className="relative p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm">
                  <Bell className="w-5 h-5 text-white" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white shadow-sm border border-red-400">
                    3
                  </span>
                </button>
                <button
                  onClick={() => navigate('/patient/profile')}
                  className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm shadow-sm"
                >
                  <User className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 max-w-5xl mx-auto w-full space-y-6 -mt-6 relative z-10">
          {/* Recovery Progress */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span className="text-sm font-semibold text-slate-800">Recovery Progress</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-full border border-slate-100">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs font-bold text-emerald-600">Week 6 of 12</span>
              </div>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-3">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-1/2" />
            </div>
            <p className="text-xs font-medium text-slate-500">50% · Steady improvement noted by Dr. Rajesh</p>
          </div>

          {/* Quick Actions & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Stats Row */}
            <div className="flex gap-3">
              {stats.map((stat) => {
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
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">See All</button>
                </div>
                <div className="space-y-3">
                  {upcomingAppointments.map((appt) => (
                    <div key={appt.id} className={`flex items-start gap-4 p-4 rounded-xl border ${appt.status === 'confirmed' ? 'border-emerald-100 bg-emerald-50/30' : 'border-slate-100 bg-slate-50/50'}`}>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${appt.bg} ${appt.color}`}>
                        <span className="text-sm font-bold">{appt.initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{appt.doctor}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{appt.specialization}</p>
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-600">{appt.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-200 shadow-sm">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-600">{appt.time}</span>
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

              {/* Recent Reports */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Recent Reports</h3>
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700">See All</button>
                </div>
                <div className="space-y-3">
                  {reports.map((report) => (
                    <div key={report.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${report.bg}`}>
                        <FileText className={`w-5 h-5 ${report.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{report.title}</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">{report.date}</p>
                      </div>
                      <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${report.bg} ${report.color}`}>
                        {report.type}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-6">
              
              {/* Today's Exercises */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">
                    {selectedDay === currentDay ? "Today's Exercises" : `Day ${selectedDay} Exercises`}
                  </h3>
                  <button
                    onClick={() => navigate('/patient/exercise')}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    View Plan
                  </button>
                </div>

                {/* Day Selector */}
                <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                  {Array.from({ length: totalDays }, (_, i) => i + 1).map(day => (
                    <button
                      key={day}
                      onClick={() => setSelectedDay(day)}
                      className={`shrink-0 w-11 h-12 flex flex-col items-center justify-center rounded-xl border-2 transition-all ${
                        selectedDay === day 
                          ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                          : day === currentDay 
                            ? 'border-blue-200 bg-blue-50 text-blue-700'
                            : 'border-slate-100 bg-slate-50 text-slate-500 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-[9px] font-bold uppercase tracking-wider opacity-80 mb-0.5">Day</span>
                      <span className="text-sm font-bold leading-none">{day}</span>
                    </button>
                  ))}
                </div>
                
                <div className="mb-5 bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Dumbbell className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">Active Recovery Plan</p>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">Knee rehabilitation · Week 6</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full border border-purple-100 shadow-sm">
                      <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold text-slate-700">{completedExercises}/{totalExercises}</span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-purple-200/50 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full transition-all duration-500 ease-out" style={{ width: `${exerciseProgress}%` }} />
                  </div>
                </div>

                <div className="space-y-3">
                  {exercises.map((ex) => {
                    const isEditable = selectedDay === currentDay;
                    return (
                      <div key={ex.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <button 
                          onClick={() => toggleExercise(ex.id)}
                          disabled={!isEditable}
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                            ex.done 
                              ? `bg-emerald-50 border-emerald-500 ${!isEditable ? 'opacity-60' : ''}` 
                              : `bg-white border-slate-300 ${isEditable ? 'hover:border-emerald-400' : 'opacity-60 cursor-not-allowed'}`
                          }`}
                        >
                          {ex.done && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                        </button>
                        <span className={`text-sm flex-1 ${ex.done ? 'text-slate-400 font-medium line-through' : 'text-slate-700 font-semibold'}`}>
                          {ex.name}
                        </span>
                        <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md">
                          {ex.reps}
                        </span>
                      </div>
                    );
                  })}
                </div>
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
