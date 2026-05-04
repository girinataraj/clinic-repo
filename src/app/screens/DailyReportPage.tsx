import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { useAllEvaluations } from '../../hooks/useEvaluations';
import { useStaffUsers } from '../../hooks/useStaff';
import { usePatients } from '../../hooks/usePatients';
import {
  ArrowLeft, Calendar, Download, Users, IndianRupee,
  Activity, Loader2, ChevronLeft, ChevronRight, UserCog,
} from 'lucide-react';

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

type ReportTab = 'revenue' | 'patients';

export function DailyReportPage() {
  const navigate = useNavigate();
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string>(
    formatDateParam(today.getFullYear(), today.getMonth(), today.getDate())
  );
  const [reportTab, setReportTab] = useState<ReportTab>('revenue');

  const calendarDays = getCalendarDays(viewYear, viewMonth);

  // ── Data fetching ────────────────────────────────────────────────────────
  const { data: therapists = [], isLoading: therapistsLoading } = useStaffUsers({ role: 'nurse' });
  const { data: evaluationsData, isLoading: evalsLoading } = useAllEvaluations({
    limit: 500,
  });
  const { data: patientsData } = usePatients({ limit: 500 });

  const allEvaluations = evaluationsData?.data ?? [];
  const allPatients = patientsData?.data ?? [];

  // ── Filter evaluations for selected date ─────────────────────────────────
  const dailyEvals = useMemo(() => {
    return allEvaluations.filter((e) => {
      const evalDate = new Date(e.createdAt).toISOString().slice(0, 10);
      return evalDate === selectedDate;
    });
  }, [allEvaluations, selectedDate]);

  // ── Revenue by therapist ─────────────────────────────────────────────────
  const revenueByTherapist = useMemo(() => {
    const map: Record<string, { name: string; revenue: number; count: number }> = {};
    therapists.forEach((t) => {
      map[t.id] = { name: t.name, revenue: 0, count: 0 };
    });

    dailyEvals.forEach((ev) => {
      // Find the patient to get therapistId
      const patient = allPatients.find((p) => p.id === ev.patientId);
      const therapistId = patient?.therapistId;
      if (therapistId && map[therapistId]) {
        map[therapistId].revenue += ev.billAmount ?? 0;
        map[therapistId].count += 1;
      } else {
        // Unassigned
        if (!map['unassigned']) map['unassigned'] = { name: 'Unassigned', revenue: 0, count: 0 };
        map['unassigned'].revenue += ev.billAmount ?? 0;
        map['unassigned'].count += 1;
      }
    });

    return Object.entries(map)
      .map(([id, data]) => ({ id, ...data }))
      .filter((r) => r.count > 0 || r.revenue > 0)
      .sort((a, b) => b.revenue - a.revenue);
  }, [dailyEvals, therapists, allPatients]);

  const totalRevenue = revenueByTherapist.reduce((sum, r) => sum + r.revenue, 0);
  const totalPatientsSeen = revenueByTherapist.reduce((sum, r) => sum + r.count, 0);

  const isLoading = therapistsLoading || evalsLoading;
  const selectedDateObj = new Date(selectedDate + 'T00:00:00');
  const selectedLabel = selectedDateObj.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const isToday = selectedDate === formatDateParam(today.getFullYear(), today.getMonth(), today.getDate());

  // ── CSV download ─────────────────────────────────────────────────────────
  const handleDownloadCSV = () => {
    const header = reportTab === 'revenue'
      ? 'Therapist,Revenue (₹),Patients Seen'
      : 'Therapist,Patients Seen,Revenue (₹)';
    const rows = revenueByTherapist.map((r) =>
      reportTab === 'revenue'
        ? `${r.name},${r.revenue},${r.count}`
        : `${r.name},${r.count},${r.revenue}`
    );
    const csv = [header, ...rows, '', `Total,${totalRevenue},${totalPatientsSeen}`].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `daily-report-${selectedDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(viewYear - 1); }
    else setViewMonth(viewMonth - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(viewYear + 1); }
    else setViewMonth(viewMonth + 1);
  };

  return (
    <div className="flex flex-col h-full" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#E8E9F1' }}>
      {/* Header */}
      <div
        className="px-5 pb-5 shrink-0 relative overflow-hidden rounded-b-3xl"
        style={{ background: 'linear-gradient(135deg, #262842 0%, #3B3E66 100%)', paddingTop: '28px', boxShadow: '0 4px 24px rgba(38, 40, 66, 0.15)' }}
      >
        <div className="absolute -right-16 -top-16 rounded-full opacity-10" style={{ width: '200px', height: '200px', background: '#FEFFFF' }} />
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <button onClick={() => navigate('/doctor')} className="flex items-center justify-center rounded-xl w-9 h-9" style={{ background: 'rgba(254,255,255,0.15)' }}>
            <ArrowLeft size={18} color="#FEFFFF" />
          </button>
          <div className="flex-1">
            <h1 style={{ fontSize: '19px', fontWeight: 800, color: '#FEFFFF', letterSpacing: '-0.5px' }}>Daily Reports</h1>
            <p style={{ fontSize: '11px', color: 'rgba(254,255,255,0.7)' }}>Revenue & patient stats by therapist</p>
          </div>
          <button
            onClick={handleDownloadCSV}
            disabled={revenueByTherapist.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
            style={{ background: 'rgba(254,255,255,0.2)', color: '#FEFFFF', border: '1px solid rgba(254,255,255,0.3)' }}
          >
            <Download size={14} /> CSV
          </button>
        </div>

        {/* Summary cards */}
        <div className="flex gap-2.5 relative z-10">
          {[
            { label: 'Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee },
            { label: 'Patients', value: totalPatientsSeen, icon: Users },
            { label: 'Therapists', value: revenueByTherapist.filter(r => r.id !== 'unassigned').length, icon: UserCog },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex-1 flex flex-col items-center gap-0.5 py-2.5 rounded-xl" style={{ background: 'rgba(254,255,255,0.15)', border: '1px solid rgba(254,255,255,0.2)' }}>
                <Icon size={14} color="#FEFFFF" />
                <span style={{ fontSize: '17px', fontWeight: 800, color: '#FEFFFF' }}>{s.value}</span>
                <span style={{ fontSize: '9px', color: 'rgba(254,255,255,0.7)', fontWeight: 600 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Calendar */}
        <div className="rounded-2xl p-4 mb-4" style={{ background: '#FEFFFF', border: '1px solid #E8E9F1', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between mb-3">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronLeft size={16} color="#262842" /></button>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#17252A' }}>{MONTHS[viewMonth]} {viewYear}</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-100"><ChevronRight size={16} color="#262842" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS.map((d) => (
              <span key={d} className="text-center text-[10px] font-bold text-slate-400 py-1">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`empty-${i}`} />;
              const dateStr = formatDateParam(viewYear, viewMonth, day);
              const isSelected = dateStr === selectedDate;
              const isTodayDate = dateStr === formatDateParam(today.getFullYear(), today.getMonth(), today.getDate());
              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`py-2 rounded-lg text-[12px] font-bold transition-all ${
                    isSelected
                      ? 'text-white shadow-md'
                      : isTodayDate
                        ? 'text-indigo-950 bg-indigo-50 border border-teal-200'
                        : 'text-slate-600 hover:bg-slate-50'
                  }`}
                  style={isSelected ? { background: 'linear-gradient(135deg, #262842, #3B3E66)' } : {}}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected date label */}
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={14} color="#262842" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#17252A' }}>
            {selectedLabel} {isToday && <span className="ml-1 text-[10px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-full">Today</span>}
          </span>
        </div>

        {/* Report tabs */}
        <div className="flex gap-2 mb-4">
          {([
            { key: 'revenue' as ReportTab, label: 'Revenue by Therapist', icon: IndianRupee },
            { key: 'patients' as ReportTab, label: 'Patients by Therapist', icon: Users },
          ]).map((tab) => {
            const Icon = tab.icon;
            const isActive = reportTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setReportTab(tab.key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all"
                style={{
                  background: isActive ? 'linear-gradient(135deg, #262842, #3B3E66)' : '#FEFFFF',
                  color: isActive ? '#FEFFFF' : '#262842',
                  border: `1px solid ${isActive ? '#3B3E66' : '#E8E9F1'}`,
                }}
              >
                <Icon size={13} /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center py-12">
            <Loader2 size={28} className="animate-spin mb-3" color="#3B3E66" />
            <p style={{ fontSize: '13px', color: '#262842', fontWeight: 600 }}>Loading report data…</p>
          </div>
        )}

        {/* Empty */}
        {!isLoading && revenueByTherapist.length === 0 && (
          <div className="rounded-2xl p-8 text-center" style={{ background: '#FEFFFF', border: '1px solid #E8E9F1' }}>
            <Activity size={36} color="#E8E9F1" className="mx-auto mb-3" />
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>No data for this date</p>
            <p style={{ fontSize: '12px', color: '#262842', marginTop: '4px' }}>No evaluations were submitted on {selectedLabel}.</p>
          </div>
        )}

        {/* Report data */}
        {!isLoading && revenueByTherapist.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {revenueByTherapist.map((row, i) => {
              const maxVal = reportTab === 'revenue'
                ? Math.max(...revenueByTherapist.map((r) => r.revenue), 1)
                : Math.max(...revenueByTherapist.map((r) => r.count), 1);
              const barWidth = reportTab === 'revenue'
                ? (row.revenue / maxVal) * 100
                : (row.count / maxVal) * 100;

              return (
                <div key={row.id} className="rounded-2xl p-4" style={{ background: '#FEFFFF', border: '1px solid #E8E9F1' }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-xl flex items-center justify-center shrink-0" style={{ width: '34px', height: '34px', background: row.id === 'unassigned' ? '#fef3c7' : '#E8E9F1' }}>
                      <UserCog size={15} color={row.id === 'unassigned' ? '#d97706' : '#262842'} />
                    </div>
                    <div className="flex-1">
                      <p style={{ fontSize: '13px', fontWeight: 700, color: '#17252A' }}>{row.name}</p>
                      <p style={{ fontSize: '10px', color: '#262842' }}>
                        {row.count} patient{row.count !== 1 ? 's' : ''} · ₹{row.revenue.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <span style={{
                      fontSize: '16px',
                      fontWeight: 800,
                      color: '#3B3E66',
                    }}>
                      {reportTab === 'revenue' ? `₹${row.revenue.toLocaleString('en-IN')}` : row.count}
                    </span>
                  </div>
                  {/* Bar */}
                  <div className="h-2 rounded-full bg-slate-100" style={{ overflow: 'hidden' }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${barWidth}%`,
                        background: row.id === 'unassigned' ? '#fbbf24' : 'linear-gradient(90deg, #262842, #3B3E66)',
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Total row */}
            <div className="rounded-2xl p-4 mt-1" style={{ background: 'linear-gradient(135deg, #262842, #3B3E66)', boxShadow: '0 4px 16px rgba(43,122,120,0.12)' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(254,255,255,0.7)' }}>TOTAL</p>
                  <p style={{ fontSize: '18px', fontWeight: 800, color: '#FEFFFF' }}>
                    {reportTab === 'revenue'
                      ? `₹${totalRevenue.toLocaleString('en-IN')}`
                      : `${totalPatientsSeen} patient${totalPatientsSeen !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className="text-right">
                  <p style={{ fontSize: '10px', color: 'rgba(254,255,255,0.6)' }}>
                    {reportTab === 'revenue'
                      ? `${totalPatientsSeen} patients seen`
                      : `₹${totalRevenue.toLocaleString('en-IN')} revenue`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="md:hidden" style={{ borderTop: '1px solid #E8E9F1', background: '#FEFFFF' }}>
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}
