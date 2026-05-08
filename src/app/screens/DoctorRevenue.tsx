import { useState, useMemo } from 'react';
import { BottomNav } from '../components/BottomNav';
import {
  IndianRupee, TrendingUp, Filter, Calendar, User,
  ChevronDown, Users,
} from 'lucide-react';
import { useRevenueVisits } from '../../hooks/useRevenue';

type FilterKey = 'today' | 'week' | 'month' | '6months' | 'all';

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'today',   label: 'Today'          },
  { key: 'week',    label: 'Last 7 Days'    },
  { key: 'month',   label: 'Last 30 Days'   },
  { key: '6months', label: 'Last 6 Months'  },
  { key: 'all',     label: 'All Time'       },
];

function getFilterDate(key: FilterKey): Date | null {
  const now = new Date();
  switch (key) {
    case 'today':   return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week':    { const d = new Date(now); d.setDate(d.getDate() - 7);    return d; }
    case 'month':   { const d = new Date(now); d.setDate(d.getDate() - 30);   return d; }
    case '6months': { const d = new Date(now); d.setMonth(d.getMonth() - 6);  return d; }
    case 'all':     return null;
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
  const [activeFilter, setActiveFilter] = useState<FilterKey>('today');
  const [showDropdown, setShowDropdown] = useState(false);

  const cutoff = useMemo(() => getFilterDate(activeFilter), [activeFilter]);
  const { data: visits = [], isLoading, isError } = useRevenueVisits({
    from: cutoff?.toISOString(),
    limit: 500,
  });

  const filteredVisits = useMemo(() => {
    if (!cutoff) return visits;
    return visits.filter(v => new Date(v.date) >= cutoff);
  }, [cutoff, visits]);

  const totalRevenue = useMemo(
    () => filteredVisits.reduce((s, v) => s + v.amount, 0),
    [filteredVisits]
  );
  const totalVisits = filteredVisits.length;

  const therapistTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filteredVisits.forEach(v => {
      map[v.therapistName] = (map[v.therapistName] || 0) + v.amount;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredVisits]);

  const activeLabel = FILTER_OPTIONS.find(f => f.key === activeFilter)?.label ?? 'Today';

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
                      onClick={() => { setActiveFilter(opt.key); setShowDropdown(false); }}
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
                {therapistTotals.map(([name, amount]) => {
                  const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                  return (
                    <div key={name}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="w-8 h-8 rounded-full bg-[#E8E9F1] dark:bg-slate-800 flex items-center justify-center shrink-0">
                            <span className="text-[11px] font-bold text-[#262842] dark:text-slate-300">{getInitials(name)}</span>
                          </div>
                          <span className="text-[13px] font-semibold text-[#17252A] dark:text-white">{name}</span>
                        </div>
                        <span className="text-[13px] font-bold text-[#262842] dark:text-slate-200">
                          ₹{amount.toLocaleString('en-IN')}
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
                      <Calendar size={11} color="#3B3E66" />
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
    </div>
  );
}
