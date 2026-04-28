import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle,
  Clock,
  MessageSquare,
} from 'lucide-react';

const doctors = [
  { id: 1, name: 'Dr. Rajesh Kumar', spec: 'Sports Physio', rating: 4.8, exp: '12 yrs', avatar: '👨‍⚕️', available: true },
  { id: 2, name: 'Dr. Priya Nair', spec: 'Ortho Rehab', rating: 4.9, exp: '9 yrs', avatar: '👩‍⚕️', available: true },
  { id: 3, name: 'Dr. Amit Shah', spec: 'Neuro PT', rating: 4.7, exp: '15 yrs', avatar: '👨‍⚕️', available: false },
];

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
  '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

const reasons = [
  'Back Pain', 'Knee Injury', 'Shoulder Pain', 'Post-Surgery', 'Sports Injury', 'Other',
];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export function AppointmentBooking() {
  const navigate = useNavigate();
  const today = new Date();
  const [selectedDoctor, setSelectedDoctor] = useState(1);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const handleConfirm = () => {
    setConfirmed(true);
    setTimeout(() => navigate('/patient'), 2000);
  };

  if (confirmed) {
    return (
      <div className="h-full flex flex-col items-center justify-center" style={{ background: '#eff6ff' }}>
        <div
          className="flex flex-col items-center p-8 rounded-3xl mx-6"
          style={{ background: 'white', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}
        >
          <div className="rounded-full flex items-center justify-center mb-4"
            style={{ width: '80px', height: '80px', background: '#ecfdf5' }}>
            <CheckCircle size={44} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', textAlign: 'center' }}>
            Appointment Confirmed!
          </h2>
          <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', marginTop: '8px' }}>
            You'll receive a confirmation shortly. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 pb-5 shrink-0"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
          paddingTop: '20px',
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate('/patient')}
            className="flex items-center justify-center rounded-xl"
            style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)' }}
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: 'white' }}>Book Appointment</h1>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Schedule your next visit</p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full" style={{ background: '#f0f4ff' }}>

        {/* Doctor Selection */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            Select Doctor
          </h3>
          <div className="flex flex-col gap-2">
            {doctors.map((doc) => (
              <button
                key={doc.id}
                onClick={() => doc.available && setSelectedDoctor(doc.id)}
                className="flex items-center gap-3 p-3 rounded-2xl text-left"
                style={{
                  background: 'white',
                  border: `2px solid ${selectedDoctor === doc.id ? '#2563eb' : 'transparent'}`,
                  opacity: doc.available ? 1 : 0.5,
                  boxShadow: selectedDoctor === doc.id ? '0 4px 16px rgba(37,99,235,0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <div className="rounded-2xl flex items-center justify-center shrink-0"
                  style={{ width: '48px', height: '48px', background: '#eff6ff', fontSize: '24px' }}>
                  {doc.avatar}
                </div>
                <div className="flex-1">
                  <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{doc.name}</p>
                  <p style={{ fontSize: '11px', color: '#64748b' }}>{doc.spec} · {doc.exp} exp</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star size={11} color="#f59e0b" fill="#f59e0b" />
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b' }}>{doc.rating}</span>
                  </div>
                </div>
                {selectedDoctor === doc.id && (
                  <CheckCircle size={20} color="#2563eb" />
                )}
                {!doc.available && (
                  <span style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700 }}>Unavailable</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar */}
        <div
          className="p-4 rounded-2xl mb-4"
          style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
                else setCurrentMonth(m => m - 1);
              }}
              className="rounded-xl flex items-center justify-center"
              style={{ width: '32px', height: '32px', background: '#f1f5f9' }}
            >
              <ChevronLeft size={16} color="#475569" />
            </button>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={() => {
                if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
                else setCurrentMonth(m => m + 1);
              }}
              className="rounded-xl flex items-center justify-center"
              style={{ width: '32px', height: '32px', background: '#f1f5f9' }}
            >
              <ChevronRight size={16} color="#475569" />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-center" style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', padding: '4px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isPast = currentMonth === today.getMonth() && currentYear === today.getFullYear() && day < today.getDate();
              const isToday = currentMonth === today.getMonth() && currentYear === today.getFullYear() && day === today.getDate();
              const isSelected = selectedDate === day;
              return (
                <button
                  key={day}
                  disabled={isPast}
                  onClick={() => !isPast && setSelectedDate(day)}
                  className="flex items-center justify-center rounded-xl mx-auto"
                  style={{
                    width: '34px', height: '34px', fontSize: '13px', fontWeight: isSelected || isToday ? 700 : 500,
                    background: isSelected ? '#2563eb' : isToday ? '#eff6ff' : 'transparent',
                    color: isSelected ? 'white' : isToday ? '#2563eb' : isPast ? '#cbd5e1' : '#1e293b',
                    border: isToday && !isSelected ? '1.5px solid #2563eb' : 'none',
                  }}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slots */}
        {selectedDate && (
          <div style={{ marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
              <Clock size={14} style={{ display: 'inline', marginRight: '6px', color: '#64748b' }} />
              Available Time Slots
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedSlot(slot)}
                  className="py-2.5 rounded-xl"
                  style={{
                    fontSize: '12px', fontWeight: 700,
                    background: selectedSlot === slot ? '#2563eb' : 'white',
                    color: selectedSlot === slot ? 'white' : '#475569',
                    border: `1.5px solid ${selectedSlot === slot ? '#2563eb' : '#e2e8f0'}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Reason for Visit */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            Reason for Visit
          </h3>
          <div className="flex flex-wrap gap-2 mb-3">
            {reasons.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedReason(r)}
                className="px-3 py-1.5 rounded-xl"
                style={{
                  fontSize: '12px', fontWeight: 600,
                  background: selectedReason === r ? '#eff6ff' : 'white',
                  color: selectedReason === r ? '#2563eb' : '#64748b',
                  border: `1.5px solid ${selectedReason === r ? '#2563eb' : '#e2e8f0'}`,
                }}
              >
                {r}
              </button>
            ))}
          </div>
          <div
            className="flex items-start gap-3 p-3 rounded-xl"
            style={{ background: 'white', border: '1.5px solid #e2e8f0' }}
          >
            <MessageSquare size={16} color="#94a3b8" style={{ marginTop: '2px', flexShrink: 0 }} />
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Add additional notes about your condition..."
              className="flex-1 outline-none resize-none bg-transparent"
              style={{ fontSize: '13px', color: '#1e293b', minHeight: '60px' }}
            />
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedSlot}
          className="w-full py-4 rounded-2xl"
          style={{
            background: selectedDate && selectedSlot
              ? 'linear-gradient(135deg, #1d4ed8, #2563eb)'
              : '#e2e8f0',
            color: selectedDate && selectedSlot ? 'white' : '#94a3b8',
            fontSize: '16px', fontWeight: 700,
            boxShadow: selectedDate && selectedSlot ? '0 8px 24px rgba(37,99,235,0.3)' : 'none',
            marginBottom: '8px',
          }}
        >
          Confirm Appointment
        </button>
      </div>

      <div className="md:hidden">
        <BottomNav role="patient" />
      </div>
    </div>
  );
}