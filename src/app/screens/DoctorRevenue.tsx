import { useState, useMemo } from 'react';
import { BottomNav } from '../components/BottomNav';
import {
  IndianRupee, TrendingUp, Filter, Calendar, User, ChevronDown,
  ArrowUpRight, ArrowDownRight, Users, CreditCard
} from 'lucide-react';

// ── Static data ──────────────────────────────────────────────────────────────
const STATIC_VISITS = [
  { id: '1', patientName: 'Rahul Verma', therapistName: 'Kavya Reddy', amount: 1500, date: '2026-05-02T10:30:00', mode: 'UPI' },
  { id: '2', patientName: 'Priya Sharma', therapistName: 'Kavya Reddy', amount: 2000, date: '2026-05-02T09:00:00', mode: 'Cash' },
  { id: '3', patientName: 'Arun Kumar', therapistName: 'Divya Nair', amount: 1800, date: '2026-05-01T14:00:00', mode: 'Card' },
  { id: '4', patientName: 'Sneha Patel', therapistName: 'Kavya Reddy', amount: 1500, date: '2026-05-01T11:30:00', mode: 'UPI' },
  { id: '5', patientName: 'Vikram Singh', therapistName: 'Divya Nair', amount: 2500, date: '2026-04-30T16:00:00', mode: 'Cash' },
  { id: '6', patientName: 'Meera Iyer', therapistName: 'Kavya Reddy', amount: 1200, date: '2026-04-29T10:00:00', mode: 'UPI' },
  { id: '7', patientName: 'Karthik Rajan', therapistName: 'Divya Nair', amount: 1800, date: '2026-04-28T13:00:00', mode: 'Card' },
  { id: '8', patientName: 'Lakshmi Devi', therapistName: 'Kavya Reddy', amount: 2000, date: '2026-04-25T09:30:00', mode: 'Cash' },
  { id: '9', patientName: 'Rajesh Menon', therapistName: 'Divya Nair', amount: 1500, date: '2026-04-20T15:00:00', mode: 'UPI' },
  { id: '10', patientName: 'Ananya Rao', therapistName: 'Kavya Reddy', amount: 3000, date: '2026-04-15T11:00:00', mode: 'Card' },
  { id: '11', patientName: 'Suresh Babu', therapistName: 'Divya Nair', amount: 1800, date: '2026-04-10T10:00:00', mode: 'Cash' },
  { id: '12', patientName: 'Deepa Krishnan', therapistName: 'Kavya Reddy', amount: 2200, date: '2026-03-28T14:30:00', mode: 'UPI' },
  { id: '13', patientName: 'Gopal Nath', therapistName: 'Divya Nair', amount: 1500, date: '2026-03-15T09:00:00', mode: 'Cash' },
  { id: '14', patientName: 'Revathi S', therapistName: 'Kavya Reddy', amount: 2000, date: '2026-02-20T16:00:00', mode: 'Card' },
  { id: '15', patientName: 'Manoj Kumar', therapistName: 'Divya Nair', amount: 1800, date: '2026-01-10T11:00:00', mode: 'UPI' },
];

type FilterKey = 'today' | 'week' | 'month' | '6months' | 'all';

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: 'today', label: 'Today' },
  { key: 'week', label: 'Last 7 Days' },
  { key: 'month', label: 'Last 30 Days' },
  { key: '6months', label: 'Last 6 Months' },
  { key: 'all', label: 'All Time' },
];

function getFilterDate(key: FilterKey): Date | null {
  const now = new Date();
  switch (key) {
    case 'today': return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case 'week': { const d = new Date(now); d.setDate(d.getDate() - 7); return d; }
    case 'month': { const d = new Date(now); d.setDate(d.getDate() - 30); return d; }
    case '6months': { const d = new Date(now); d.setMonth(d.getMonth() - 6); return d; }
    case 'all': return null;
  }
}

const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('').slice(0, 2);

const modeColors: Record<string, { bg: string; text: string }> = {
  UPI: { bg: '#E0F2FE', text: '#0369A1' },
  Cash: { bg: '#DCFCE7', text: '#15803D' },
  Card: { bg: '#FEF3C7', text: '#B45309' },
};

export function DoctorRevenue() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('today');
  const [showDropdown, setShowDropdown] = useState(false);

  const filteredVisits = useMemo(() => {
    const cutoff = getFilterDate(activeFilter);
    if (!cutoff) return STATIC_VISITS;
    return STATIC_VISITS.filter(v => new Date(v.date) >= cutoff);
  }, [activeFilter]);

  const totalRevenue = useMemo(() => filteredVisits.reduce((s, v) => s + v.amount, 0), [filteredVisits]);
  const totalVisits = filteredVisits.length;

  const therapistTotals = useMemo(() => {
    const map: Record<string, number> = {};
    filteredVisits.forEach(v => { map[v.therapistName] = (map[v.therapistName] || 0) + v.amount; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [filteredVisits]);

  const activeLabel = FILTER_OPTIONS.find(f => f.key === activeFilter)?.label ?? 'Today';

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#DEF2F1' }}>
      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div
          className="px-6 pb-14 relative rounded-b-3xl"
          style={{ background: 'linear-gradient(135deg, #2B7A78 0%, #3AAFA9 100%)', paddingTop: '32px', boxShadow: '0 4px 24px rgba(43, 122, 120, 0.15)', zIndex: 20, position: 'relative' }}
        >
          <div className="absolute -right-16 -top-16 rounded-full opacity-10 pointer-events-none" style={{ width: '200px', height: '200px', background: '#FEFFFF' }} />
          <div className="absolute right-10 top-20 rounded-full opacity-20 pointer-events-none" style={{ width: '80px', height: '80px', background: '#FEFFFF' }} />

          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p style={{ fontSize: '13px', color: 'rgba(254,255,255,0.8)', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Revenue Overview
                </p>
                <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#FEFFFF', marginTop: '4px', letterSpacing: '-0.5px' }}>
                  Clinic Revenue
                </h1>
              </div>
              {/* Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all"
                  style={{ background: 'rgba(254,255,255,0.15)', border: '1px solid rgba(254,255,255,0.25)', color: '#FEFFFF', fontSize: '13px', fontWeight: 600 }}
                >
                  <Filter size={14} />
                  {activeLabel}
                  <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden" style={{ zIndex: 9999 }}>
                    {FILTER_OPTIONS.map(opt => (
                      <button
                        key={opt.key}
                        onClick={() => { setActiveFilter(opt.key); setShowDropdown(false); }}
                        className="w-full text-left px-4 py-3 transition-colors hover:bg-slate-50"
                        style={{
                          fontSize: '13px', fontWeight: activeFilter === opt.key ? 700 : 500,
                          color: activeFilter === opt.key ? '#2B7A78' : '#334155',
                          background: activeFilter === opt.key ? '#DEF2F1' : undefined,
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="px-5 pb-8 max-w-4xl mx-auto w-full" style={{ marginTop: '-48px', position: 'relative', zIndex: 5 }}>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {/* Total Revenue */}
            <div className="col-span-2 rounded-2xl p-5 transition-transform hover:-translate-y-1 duration-300"
              style={{ background: 'linear-gradient(135deg, #2B7A78, #3AAFA9)', boxShadow: '0 8px 32px rgba(43,122,120,0.25)' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="rounded-xl flex items-center justify-center" style={{ width: '44px', height: '44px', background: 'rgba(254,255,255,0.2)' }}>
                  <IndianRupee size={22} color="#FEFFFF" />
                </div>
                <p style={{ fontSize: '13px', color: 'rgba(254,255,255,0.8)', fontWeight: 600 }}>Total Revenue</p>
              </div>
              <p style={{ fontSize: '32px', fontWeight: 800, color: '#FEFFFF', letterSpacing: '-1px' }}>
                ₹{totalRevenue.toLocaleString('en-IN')}
              </p>
              <div className="flex items-center gap-1 mt-2">
                <ArrowUpRight size={14} color="#86EFAC" />
                <span style={{ fontSize: '12px', color: '#86EFAC', fontWeight: 600 }}>+12.5% from previous period</span>
              </div>
            </div>
            {/* Total Visits */}
            <div className="rounded-2xl p-5 transition-transform hover:-translate-y-1 duration-300"
              style={{ background: '#FEFFFF', boxShadow: '0 8px 24px rgba(23,37,42,0.08)', border: '1px solid #DEF2F1' }}>
              <div className="rounded-xl flex items-center justify-center mb-3" style={{ width: '40px', height: '40px', background: '#DEF2F1' }}>
                <Users size={20} color="#3AAFA9" />
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#17252A' }}>{totalVisits}</p>
              <p style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 500, marginTop: '4px' }}>Total Visits</p>
            </div>
            {/* Avg / Visit */}
            <div className="rounded-2xl p-5 transition-transform hover:-translate-y-1 duration-300"
              style={{ background: '#FEFFFF', boxShadow: '0 8px 24px rgba(23,37,42,0.08)', border: '1px solid #DEF2F1' }}>
              <div className="rounded-xl flex items-center justify-center mb-3" style={{ width: '40px', height: '40px', background: '#DEF2F1' }}>
                <TrendingUp size={20} color="#3AAFA9" />
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: '#17252A' }}>
                ₹{totalVisits > 0 ? Math.round(totalRevenue / totalVisits).toLocaleString('en-IN') : 0}
              </p>
              <p style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 500, marginTop: '4px' }}>Avg / Visit</p>
            </div>
          </div>

          {/* Therapist Breakdown */}
          {therapistTotals.length > 0 && (
            <div className="rounded-2xl p-5 mb-6" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23,37,42,0.04)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#17252A', marginBottom: '16px' }}>Therapist Breakdown</h3>
              <div className="space-y-3">
                {therapistTotals.map(([name, amount]) => {
                  const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                  return (
                    <div key={name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#2B7A78' }}>{getInitials(name)}</span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#17252A' }}>{name}</span>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#2B7A78' }}>₹{amount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="w-full rounded-full overflow-hidden" style={{ height: '6px', background: '#DEF2F1' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #2B7A78, #3AAFA9)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transaction List */}
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#17252A' }}>Transactions</h3>
            <span className="px-3 py-1 rounded-full" style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 600, background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
              {filteredVisits.length} records
            </span>
          </div>

          {filteredVisits.length === 0 ? (
            <div className="text-center py-16 rounded-2xl" style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
              <div className="flex items-center justify-center rounded-full mx-auto mb-4" style={{ width: '72px', height: '72px', background: '#DEF2F1' }}>
                <IndianRupee size={32} color="#3AAFA9" />
              </div>
              <p style={{ fontSize: '16px', fontWeight: 700, color: '#17252A' }}>No transactions found</p>
              <p style={{ fontSize: '13px', color: '#2B7A78', marginTop: '6px' }}>Try selecting a different time period</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredVisits.map(visit => {
                const dt = new Date(visit.date);
                const dateStr = dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                const timeStr = dt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                const mc = modeColors[visit.mode] ?? modeColors.Cash;
                return (
                  <div
                    key={visit.id}
                    className="rounded-2xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                    style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 2px 12px rgba(23,37,42,0.04)' }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-2xl flex items-center justify-center shrink-0" style={{ width: '48px', height: '48px', background: '#DEF2F1' }}>
                        <span style={{ fontSize: '15px', fontWeight: 700, color: '#2B7A78' }}>{getInitials(visit.patientName)}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#17252A' }}>{visit.patientName}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <User size={12} color="#2B7A78" />
                          <span style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 500 }}>{visit.therapistName}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p style={{ fontSize: '16px', fontWeight: 800, color: '#2B7A78' }}>₹{visit.amount.toLocaleString('en-IN')}</p>
                        <div className="flex items-center gap-2 justify-end mt-1">
                          <span className="px-2 py-0.5 rounded-full" style={{ fontSize: '10px', fontWeight: 700, background: mc.bg, color: mc.text }}>{visit.mode}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-3 pt-3" style={{ borderTop: '1px solid #DEF2F1' }}>
                      <Calendar size={12} color="#3AAFA9" />
                      <span style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 500 }}>{dateStr} · {timeStr}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="md:hidden" style={{ borderTop: '1px solid #DEF2F1', background: '#FEFFFF' }}>
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}
