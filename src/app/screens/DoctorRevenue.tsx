import { useState, useMemo } from 'react';
import { BottomNav } from '../components/BottomNav';
import {
  IndianRupee, TrendingUp, Filter, Calendar as CalendarIcon, User,
  ChevronDown, Users, CreditCard, QrCode, ChevronLeft, ChevronRight, UserCog,
} from 'lucide-react';
import { useRevenueVisits } from '../../hooks/useRevenue';
import { useStaffUsers } from '../../hooks/useStaff';

type FilterKey = 'today' | 'week' | 'month' | '6months' | 'all' | 'custom_date';

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'today',       label: 'Today'          },
  { key: 'week',        label: 'Last 7 Days'    },
  { key: 'month',       label: 'Last 30 Days'   },
  { key: '6months',     label: 'Last 6 Months'  },
  { key: 'all',         label: 'All Time'       },
  { key: 'custom_date', label: 'Specific Date'  },
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

function formatDateParam(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getFilterDate(key: FilterKey): Date | null {
  const now = new Date();
  switch (key) {
    case 'today':   return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':    { const d = new Date(now); d.setDate(d.getDate() - 7);    return d; }
    case 'month':   { const d = new Date(now); d.setDate(d.getDate() - 30);   return d; }
    case '6months': { const d = new Date(now); d.setMonth(d.getMonth() - 6);  return d; }
    case 'all':     return null;
    default:        return null;
  }
}

const getInitials = (name: string) =>
  name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();

const modeColors: Record<string, { bg: string; text: string }> = {
  UPI:  { bg: '#E0F2FE', text: '#0369A1' },
  Cash: { bg: '#DCFCE7', text: '#15803D' },
  Card: { bg: '#FEF3C7', text: '#B45309' },
};

export function DoctorRevenue() {
  const today = new Date();
  const [activeFilter, setActiveFilter] = useState<FilterKey>('today');
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('all');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  // Calendar State
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateParam(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const { data: staffTherapists = [] } = useStaffUsers({ role: 'nurse' });

  const cutoff = useMemo(() => getFilterDate(activeFilter), [activeFilter]);
  const { data: visits = [], isLoading, isError } = useRevenueVisits({
    from: activeFilter === 'custom_date' ? `${selectedDate}T00:00:00.000Z` : cutoff?.toISOString(),
    limit: 500,
  });

  const filteredVisits = useMemo(() => {
    let result = visits;

    if (activeFilter === 'custom_date') {
      result = result.filter(v => v.date.startsWith(selectedDate));
    } else if (cutoff) {
      result = result.filter(v => new Date(v.date) >= cutoff);
    }

    if (selectedTherapistId !== 'all') {
      const selectedStaff = staffTherapists.find(t => t.id === selectedTherapistId);
      if (selectedStaff) {
        result = result.filter(v => v.therapistName.toLowerCase().includes(selectedStaff.name.toLowerCase()));
      }
    }

    return result;
  }, [cutoff, visits, activeFilter, selectedDate, selectedTherapistId, staffTherapists]);

  const totalRevenue = useMemo(
    () => filteredVisits.reduce((s, v) => s + v.amount, 0),
    [filteredVisits]
  );
  const totalVisits = filteredVisits.length;

  const cashRevenue = useMemo(
    () => filteredVisits.filter(v => v.mode === 'Cash').reduce((s, v) => s + v.amount, 0),
    [filteredVisits]
  );

  const upiRevenue = useMemo(
    () => filteredVisits.filter(v => v.mode === 'UPI').reduce((s, v) => s + v.amount, 0),
    [filteredVisits]
  );

  // Dynamic therapist list combining registered therapists and any unassigned/other therapist transactions
  const therapistTotals = useMemo(() => {
    const map: Record<string, { amount: number; count: number }> = {};
    
    // Initialize with all registered therapists from manage staff
    staffTherapists.forEach(t => {
      map[t.name] = { amount: 0, count: 0 };
    });

    // Populate from visits
    filteredVisits.forEach(v => {
      const tName = v.therapistName || 'Unassigned';
      if (!map[tName]) {
        map[tName] = { amount: 0, count: 0 };
      }
      map[tName].amount += v.amount;
      map[tName].count += 1;
    });

    return Object.entries(map).sort((a, b) => b[1].amount - a[1].amount);
  }, [filteredVisits, staffTherapists]);

  const activeLabel = activeFilter === 'custom_date' 
    ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : FILTER_OPTIONS.find(f => f.key === activeFilter)?.label ?? 'Today';

  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <div
      className="flex flex-col h-full font-sans bg-[#f0fafa] dark:bg-slate-950"
    >
      {/* ── Top Header Bar ─────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #262842 0%, #3B3E66 100%)',
          padding: '24px 24px 24px 24px',
          flexShrink: 0,
        }}
      >
        <div
          className="max-w-4xl mx-auto flex items-center justify-between"
          style={{ gap: '12px' }}
        >
          {/* Title */}
          <div>
            <p style={{ fontSize: '11px', color: 'rgba(254,255,255,0.7)', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Revenue Overview
            </p>
            <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#FEFFFF', marginTop: '2px', letterSpacing: '-0.3px' }}>
              Clinic Revenue
            </h1>
          </div>

          {/* Controls Header */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Therapist Filter */}
            <select
              value={selectedTherapistId}
              onChange={(e) => setSelectedTherapistId(e.target.value)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-white/20 border border-white/30 text-white outline-none cursor-pointer"
            >
              <option value="all" className="text-slate-900">All Therapists</option>
              {staffTherapists.map(t => (
                <option key={t.id} value={t.id} className="text-slate-900">{t.name}</option>
              ))}
            </select>

            {/* Filter Dropdown */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                onClick={() => setShowDropdown(prev => !prev)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '8px 16px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  color: '#FEFFFF', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                <Filter size={13} />
                {activeLabel}
                <ChevronDown
                  size={13}
                  style={{ transition: 'transform 0.2s', transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)' }}
                />
              </button>

              {showDropdown && (
                <>
                  {/* Backdrop */}
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 998 }}
                    onClick={() => setShowDropdown(false)}
                  />
                  <div
                    className="absolute right-0 top-[calc(100%+8px)] w-[180px] bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden z-[999]"
                  >
                    {FILTER_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => {
                          setShowDropdown(false);
                          if (opt.key === 'custom_date') {
                            setShowCalendarModal(true);
                          } else {
                            setActiveFilter(opt.key);
                          }
                        }}
                        className={`block w-full text-left px-4 py-3 text-[13px] transition-colors
                          ${activeFilter === opt.key 
                            ? 'font-bold bg-slate-100 dark:bg-slate-700 text-[#262842] dark:text-white' 
                            : 'font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Scrollable Content ─────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div
          className="max-w-4xl mx-auto w-full"
          style={{ padding: '24px 20px 32px' }}
        >

          {/* ── Summary Cards ──────────────────────────────────────────── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {/* Total Revenue */}
            <div
              style={{
                gridColumn: 'span 2',
                borderRadius: '14px',
                padding: '20px',
                background: 'linear-gradient(135deg, #262842, #3B3E66)',
                boxShadow: '0 4px 20px rgba(43,122,120,0.2)',
                minWidth: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <IndianRupee size={20} color="#FEFFFF" />
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(254,255,255,0.8)', fontWeight: 600 }}>Total Revenue</p>
              </div>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#FEFFFF', letterSpacing: '-1px', lineHeight: 1 }}>
                ₹{totalRevenue.toLocaleString('en-IN')}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                  {activeLabel} · {filteredVisits.length} visit{filteredVisits.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Cash Revenue */}
            <div className="rounded-[14px] p-5 bg-white dark:bg-slate-900 border border-emerald-200/60 dark:border-emerald-900/30 shadow-sm min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div className="w-[38px] h-[38px] rounded-[10px] bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center">
                  <IndianRupee size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  Cash Mode
                </span>
              </div>
              <p className="text-[24px] font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
                ₹{cashRevenue.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] font-bold text-slate-400 mt-2">
                {filteredVisits.filter(v => v.mode === 'Cash').length} Cash Payment(s)
              </p>
            </div>

            {/* UPI Revenue */}
            <div className="rounded-[14px] p-5 bg-white dark:bg-slate-900 border border-blue-200/60 dark:border-blue-900/30 shadow-sm min-w-0">
              <div className="flex items-center justify-between mb-3">
                <div className="w-[38px] h-[38px] rounded-[10px] bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center">
                  <QrCode size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300">
                  UPI Mode
                </span>
              </div>
              <p className="text-[24px] font-extrabold text-blue-600 dark:text-blue-400 leading-none">
                ₹{upiRevenue.toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] font-bold text-slate-400 mt-2">
                {filteredVisits.filter(v => v.mode === 'UPI').length} UPI Payment(s)
              </p>
            </div>

            {/* Total Visits */}
            <div className="rounded-[14px] p-5 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-sm min-w-0">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-[#E8E9F1] dark:bg-slate-800 flex items-center justify-center mb-3">
                <Users size={18} className="text-[#3B3E66] dark:text-teal-400" />
              </div>
              <p className="text-[26px] font-bold text-[#17252A] dark:text-white leading-none">{totalVisits}</p>
              <p className="text-[12px] font-medium text-[#262842] dark:text-slate-400 mt-[6px]">Total Visits</p>
            </div>

            {/* Avg / Visit */}
            <div className="rounded-[14px] p-5 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-sm min-w-0">
              <div className="w-[38px] h-[38px] rounded-[10px] bg-[#E8E9F1] dark:bg-slate-800 flex items-center justify-center mb-3">
                <TrendingUp size={18} className="text-[#3B3E66] dark:text-teal-400" />
              </div>
              <p className="text-[26px] font-bold text-[#17252A] dark:text-white leading-none">
                ₹{totalVisits > 0 ? Math.round(totalRevenue / totalVisits).toLocaleString('en-IN') : 0}
              </p>
              <p className="text-[12px] font-medium text-[#262842] dark:text-slate-400 mt-[6px]">Avg / Visit</p>
            </div>
          </div>

          {/* ── Therapist Breakdown ────────────────────────────────────── */}
          {therapistTotals.length > 0 && (
            <div
              className="rounded-[14px] p-5 mb-6 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-sm"
            >
              <h3 className="text-[15px] font-bold text-[#17252A] dark:text-white mb-4">
                Therapist Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {therapistTotals.map(([name, stat]) => {
                  const pct = totalRevenue > 0 ? Math.round((stat.amount / totalRevenue) * 100) : 0;
                  return (
                    <div key={name}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="w-8 h-8 rounded-full bg-[#E8E9F1] dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-[#262842] dark:text-slate-300">{getInitials(name)}</span>
                          </div>
                          <div>
                            <span className="text-[13px] font-bold text-[#17252A] dark:text-white block">{name}</span>
                            <span className="text-[10px] text-slate-400 font-semibold">{stat.count} patient(s) treated</span>
                          </div>
                        </div>
                        <span className="text-[14px] font-extrabold text-[#262842] dark:text-slate-200">
                          ₹{stat.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#E8E9F1] dark:bg-slate-800 overflow-hidden">
                        <div style={{ height: '100%', borderRadius: '99px', width: `${pct}%`, background: 'linear-gradient(90deg, #262842, #3B3E66)', transition: 'width 0.6s ease' }} className="dark:from-teal-600 dark:to-teal-400" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Transactions ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 className="text-[16px] font-bold text-[#17252A] dark:text-white">Transactions</h3>
            <span className="text-[12px] font-semibold text-[#262842] dark:text-slate-300 bg-white dark:bg-slate-800 border border-[#E8E9F1] dark:border-slate-700 rounded-full px-3 py-[3px]">
              {isLoading ? 'Loading' : `${filteredVisits.length} records`}
            </span>
          </div>

          {isError ? (
            <div className="text-center py-16 px-5 rounded-[14px] bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800">
              <p className="text-[15px] font-bold text-[#17252A] dark:text-white">Unable to load revenue</p>
              <p className="text-[13px] text-[#262842] dark:text-slate-400 mt-1">Please try again shortly</p>
            </div>
          ) : filteredVisits.length === 0 ? (
            <div className="text-center py-16 px-5 rounded-[14px] bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800">
              <div className="w-16 h-16 rounded-full bg-[#E8E9F1] dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                <IndianRupee size={28} color="#3B3E66" />
              </div>
              <p className="text-[15px] font-bold text-[#17252A] dark:text-white">No transactions found</p>
              <p className="text-[13px] text-[#262842] dark:text-slate-400 mt-1">Try selecting a different time period</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredVisits.map(visit => {
                const dt = new Date(visit.date);
                const dateStr = dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                const timeStr = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                const mc = modeColors[visit.mode] ?? modeColors.Cash;
                return (
                  <div
                    key={visit.id}
                    className="rounded-[14px] p-4 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-sm transition-all duration-200 hover:-translate-y-[2px] hover:shadow-md"
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(43,122,120,0.1)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 8px rgba(23,37,42,0.04)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      {/* Avatar */}
                      <div className="w-11 h-11 rounded-xl bg-[#E8E9F1] dark:bg-slate-800 flex items-center justify-center shrink-0">
                        <span className="text-[14px] font-bold text-[#262842] dark:text-slate-300">{getInitials(visit.patientName)}</span>
                      </div>

                      {/* Patient + Therapist */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p className="text-[14px] font-bold text-[#17252A] dark:text-white truncate">
                          {visit.patientName}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                          <User size={11} color="#262842" />
                          <span className="text-[12px] font-medium text-[#262842] dark:text-slate-400">{visit.therapistName}</span>
                        </div>
                      </div>

                      {/* Amount + mode */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p className="text-[15px] font-extrabold text-[#262842] dark:text-white">
                          ₹{visit.amount.toLocaleString('en-IN')}
                        </p>
                        <span 
                          className={`text-[10px] font-bold rounded-full px-2 py-0.5 mt-1 inline-block
                            ${visit.mode === 'UPI' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' : 
                              visit.mode === 'Cash' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 
                              'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'}`}
                        >
                          {visit.mode}
                        </span>
                      </div>
                    </div>

                    {/* Date row */}
                    <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-[#f0fafa] dark:border-slate-800">
                      <CalendarIcon size={11} color="#3B3E66" />
                      <span className="text-[11px] font-medium text-[#262842] dark:text-slate-400">
                        {dateStr} · {timeStr}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile Bottom Nav ──────────────────────────────────────────── */}
      <div className="md:hidden border-t border-[#E8E9F1] dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <BottomNav role="doctor" />
      </div>

      {/* ── Calendar Selection Modal ────────────────────────────────────────── */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarIcon size={16} className="text-teal-600 dark:text-teal-400" />
                Select Specific Date
              </h3>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-3">
              <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronLeft size={16} className="text-slate-700 dark:text-slate-300" />
              </button>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {MONTHS[viewMonth]} {viewYear}
              </span>
              <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                <ChevronRight size={16} className="text-slate-700 dark:text-slate-300" />
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {DAYS.map((d) => (
                <span key={d} className="text-center text-[10px] font-extrabold text-slate-400 py-1 uppercase">{d}</span>
              ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} />;
                const dateStr = formatDateParam(viewYear, viewMonth, day);
                const isSelected = dateStr === selectedDate;
                const isTodayDate = dateStr === formatDateParam(today.getFullYear(), today.getMonth(), today.getDate());
                return (
                  <button
                    key={dateStr}
                    onClick={() => {
                      setSelectedDate(dateStr);
                      setActiveFilter('custom_date');
                      setShowCalendarModal(false);
                    }}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/30'
                        : isTodayDate
                          ? 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200 dark:border-teal-800'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
