import { useState, useMemo } from 'react';
import { BottomNav } from '../components/BottomNav';
import {
  IndianRupee, TrendingUp, Filter, Calendar, User,
  ChevronDown, ArrowUpRight, Users,
} from 'lucide-react';

// ── Static data ───────────────────────────────────────────────────────────────
const STATIC_VISITS = [
  { id: '1',  patientName: 'Rahul Verma',      therapistName: 'Kavya Reddy', amount: 1500, date: '2026-05-02T10:30:00', mode: 'UPI'  },
  { id: '2',  patientName: 'Priya Sharma',     therapistName: 'Kavya Reddy', amount: 2000, date: '2026-05-02T09:00:00', mode: 'Cash' },
  { id: '3',  patientName: 'Arun Kumar',       therapistName: 'Divya Nair',  amount: 1800, date: '2026-05-01T14:00:00', mode: 'Card' },
  { id: '4',  patientName: 'Sneha Patel',      therapistName: 'Kavya Reddy', amount: 1500, date: '2026-05-01T11:30:00', mode: 'UPI'  },
  { id: '5',  patientName: 'Vikram Singh',     therapistName: 'Divya Nair',  amount: 2500, date: '2026-04-30T16:00:00', mode: 'Cash' },
  { id: '6',  patientName: 'Meera Iyer',       therapistName: 'Kavya Reddy', amount: 1200, date: '2026-04-29T10:00:00', mode: 'UPI'  },
  { id: '7',  patientName: 'Karthik Rajan',    therapistName: 'Divya Nair',  amount: 1800, date: '2026-04-28T13:00:00', mode: 'Card' },
  { id: '8',  patientName: 'Lakshmi Devi',     therapistName: 'Kavya Reddy', amount: 2000, date: '2026-04-25T09:30:00', mode: 'Cash' },
  { id: '9',  patientName: 'Rajesh Menon',     therapistName: 'Divya Nair',  amount: 1500, date: '2026-04-20T15:00:00', mode: 'UPI'  },
  { id: '10', patientName: 'Ananya Rao',       therapistName: 'Kavya Reddy', amount: 3000, date: '2026-04-15T11:00:00', mode: 'Card' },
  { id: '11', patientName: 'Suresh Babu',      therapistName: 'Divya Nair',  amount: 1800, date: '2026-04-10T10:00:00', mode: 'Cash' },
  { id: '12', patientName: 'Deepa Krishnan',   therapistName: 'Kavya Reddy', amount: 2200, date: '2026-03-28T14:30:00', mode: 'UPI'  },
  { id: '13', patientName: 'Gopal Nath',       therapistName: 'Divya Nair',  amount: 1500, date: '2026-03-15T09:00:00', mode: 'Cash' },
  { id: '14', patientName: 'Revathi S',        therapistName: 'Kavya Reddy', amount: 2000, date: '2026-02-20T16:00:00', mode: 'Card' },
  { id: '15', patientName: 'Manoj Kumar',      therapistName: 'Divya Nair',  amount: 1800, date: '2026-01-10T11:00:00', mode: 'UPI'  },
];

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

  const filteredVisits = useMemo(() => {
    const cutoff = getFilterDate(activeFilter);
    if (!cutoff) return STATIC_VISITS;
    return STATIC_VISITS.filter(v => new Date(v.date) >= cutoff);
  }, [activeFilter]);

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
      className="flex flex-col h-full"
      style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#f0fafa' }}
    >
      {/* ── Top Header Bar ─────────────────────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2B7A78 0%, #3AAFA9 100%)',
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
                  style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: '180px', background: '#fff', borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    border: '1px solid #e2e8f0', overflow: 'hidden', zIndex: 999,
                  }}
                >
                  {FILTER_OPTIONS.map(opt => (
                    <button
                      key={opt.key}
                      onClick={() => { setActiveFilter(opt.key); setShowDropdown(false); }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '11px 16px', border: 'none', cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: activeFilter === opt.key ? 700 : 500,
                        color: activeFilter === opt.key ? '#2B7A78' : '#334155',
                        background: activeFilter === opt.key ? '#DEF2F1' : '#fff',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={e => {
                        if (activeFilter !== opt.key)
                          (e.currentTarget as HTMLButtonElement).style.background = '#f8fafc';
                      }}
                      onMouseLeave={e => {
                        if (activeFilter !== opt.key)
                          (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                      }}
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
                background: 'linear-gradient(135deg, #2B7A78, #3AAFA9)',
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
                <ArrowUpRight size={13} color="#86EFAC" />
                <span style={{ fontSize: '11px', color: '#86EFAC', fontWeight: 600 }}>+12.5% from previous period</span>
              </div>
            </div>

            {/* Total Visits */}
            <div style={{ borderRadius: '14px', padding: '20px', background: '#fff', border: '1px solid #DEF2F1', boxShadow: '0 2px 12px rgba(23,37,42,0.06)', minWidth: 0 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#DEF2F1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <Users size={18} color="#3AAFA9" />
              </div>
              <p style={{ fontSize: '26px', fontWeight: 700, color: '#17252A', lineHeight: 1 }}>{totalVisits}</p>
              <p style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 500, marginTop: '6px' }}>Total Visits</p>
            </div>

            {/* Avg / Visit */}
            <div style={{ borderRadius: '14px', padding: '20px', background: '#fff', border: '1px solid #DEF2F1', boxShadow: '0 2px 12px rgba(23,37,42,0.06)', minWidth: 0 }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#DEF2F1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <TrendingUp size={18} color="#3AAFA9" />
              </div>
              <p style={{ fontSize: '26px', fontWeight: 700, color: '#17252A', lineHeight: 1 }}>
                ₹{totalVisits > 0 ? Math.round(totalRevenue / totalVisits).toLocaleString('en-IN') : 0}
              </p>
              <p style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 500, marginTop: '6px' }}>Avg / Visit</p>
            </div>
          </div>

          {/* ── Therapist Breakdown ────────────────────────────────────── */}
          {therapistTotals.length > 0 && (
            <div
              style={{
                borderRadius: '14px', padding: '20px', marginBottom: '24px',
                background: '#fff', border: '1px solid #DEF2F1',
                boxShadow: '0 2px 12px rgba(23,37,42,0.06)',
              }}
            >
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#17252A', marginBottom: '16px' }}>
                Therapist Breakdown
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {therapistTotals.map(([name, amount]) => {
                  const pct = totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0;
                  return (
                    <div key={name}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#DEF2F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: '#2B7A78' }}>{getInitials(name)}</span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#17252A' }}>{name}</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#2B7A78' }}>
                          ₹{amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div style={{ width: '100%', height: '6px', borderRadius: '99px', background: '#DEF2F1', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: '99px', width: `${pct}%`, background: 'linear-gradient(90deg, #2B7A78, #3AAFA9)', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Transactions ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#17252A' }}>Transactions</h3>
            <span style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 600, background: '#fff', border: '1px solid #DEF2F1', borderRadius: '99px', padding: '3px 12px' }}>
              {filteredVisits.length} records
            </span>
          </div>

          {filteredVisits.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '14px', background: '#fff', border: '1px solid #DEF2F1' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#DEF2F1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <IndianRupee size={28} color="#3AAFA9" />
              </div>
              <p style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>No transactions found</p>
              <p style={{ fontSize: '13px', color: '#2B7A78', marginTop: '4px' }}>Try selecting a different time period</p>
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
                    style={{
                      borderRadius: '14px', padding: '16px',
                      background: '#fff', border: '1px solid #DEF2F1',
                      boxShadow: '0 2px 8px rgba(23,37,42,0.04)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
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
                      <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#DEF2F1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#2B7A78' }}>{getInitials(visit.patientName)}</span>
                      </div>

                      {/* Patient + Therapist */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: '#17252A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {visit.patientName}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px' }}>
                          <User size={11} color="#2B7A78" />
                          <span style={{ fontSize: '12px', color: '#2B7A78', fontWeight: 500 }}>{visit.therapistName}</span>
                        </div>
                      </div>

                      {/* Amount + mode */}
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: '15px', fontWeight: 800, color: '#2B7A78' }}>
                          ₹{visit.amount.toLocaleString('en-IN')}
                        </p>
                        <span style={{ fontSize: '10px', fontWeight: 700, background: mc.bg, color: mc.text, borderRadius: '99px', padding: '2px 8px', marginTop: '4px', display: 'inline-block' }}>
                          {visit.mode}
                        </span>
                      </div>
                    </div>

                    {/* Date row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f0fafa' }}>
                      <Calendar size={11} color="#3AAFA9" />
                      <span style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 500 }}>
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
      <div className="md:hidden" style={{ borderTop: '1px solid #DEF2F1', background: '#fff', flexShrink: 0 }}>
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}
