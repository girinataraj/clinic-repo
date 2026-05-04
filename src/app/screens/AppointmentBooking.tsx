import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { useAppConfigScope } from '../../hooks/useAppConfig';
import { useCreateAppointment } from '../../hooks/useAppointments';
import { useStaffUsers } from '../../hooks/useStaff';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  MessageSquare,
  AlertTriangle,
  UserCog,
  User,
} from 'lucide-react';

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function buildAppointmentDate(year: number, month: number, day: number, slot: string) {
  const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return new Date(year, month, day).toISOString();
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return new Date(year, month, day, hours, minutes).toISOString();
}

/**
 * Parse a "9:00 AM" style slot string into 24h hours.
 * Returns the hour number (0-23).
 */
function slotTo24Hour(slot: string): number {
  const match = slot.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return -1;
  let hours = Number(match[1]);
  const meridiem = match[3].toUpperCase();
  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return hours;
}

/**
 * Calculate the next full hour from now.
 * e.g. 12:01 → 13, 12:59 → 13, 13:00 → 14
 */
function getNextFullHour(): number {
  const now = new Date();
  return now.getHours() + 1; // always round up to next hour
}

export function AppointmentBooking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: appointmentConfig } = useAppConfigScope('appointment');
  const { data: doctors = [], isLoading: doctorsLoading } = useStaffUsers({ role: 'doctor' });
  const { data: therapists = [], isLoading: therapistsLoading } = useStaffUsers({ role: 'nurse' });
  const createAppointment = useCreateAppointment();
  const today = new Date();
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const timeSlots = appointmentConfig?.timeSlots ?? [];
  const reasons = appointmentConfig?.reasons ?? [];
  const dayLabels = appointmentConfig?.calendar?.dayLabels ?? [];
  const monthNames = appointmentConfig?.calendar?.monthNames ?? [];

  // ── Date validation helpers ──────────────────────────────────────────────
  const isMonthInPast = (year: number, month: number) => {
    if (year < today.getFullYear()) return true;
    if (year === today.getFullYear() && month < today.getMonth()) return true;
    return false;
  };

  const isDayPast = (day: number) => {
    if (currentYear < today.getFullYear()) return true;
    if (currentYear === today.getFullYear() && currentMonth < today.getMonth()) return true;
    if (currentYear === today.getFullYear() && currentMonth === today.getMonth() && day < today.getDate()) return true;
    return false;
  };

  const isSelectedToday =
    selectedDate !== null &&
    currentYear === today.getFullYear() &&
    currentMonth === today.getMonth() &&
    selectedDate === today.getDate();

  // ── Time slot validation ─────────────────────────────────────────────────
  // If the selected date is today, disable all slots before the next full hour
  const nextValidHour = getNextFullHour();

  const isSlotDisabled = useMemo(() => {
    return (slot: string): boolean => {
      if (!isSelectedToday) return false;
      const slotHour = slotTo24Hour(slot);
      if (slotHour < 0) return false;
      return slotHour < nextValidHour;
    };
  }, [isSelectedToday, nextValidHour]);

  // Count how many slots are available (for UI feedback)
  const availableSlotCount = useMemo(() => {
    return timeSlots.filter((s) => !isSlotDisabled(s)).length;
  }, [timeSlots, isSlotDisabled]);

  // ── Month navigation guards ──────────────────────────────────────────────
  const handlePrevMonth = () => {
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth < 0) { prevMonth = 11; prevYear -= 1; }
    // Block navigating to past months
    if (isMonthInPast(prevYear, prevMonth)) return;
    setCurrentMonth(prevMonth);
    setCurrentYear(prevYear);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  const handleNextMonth = () => {
    let nextMonth = currentMonth + 1;
    let nextYear = currentYear;
    if (nextMonth > 11) { nextMonth = 0; nextYear += 1; }
    setCurrentMonth(nextMonth);
    setCurrentYear(nextYear);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  // Can't go back past the current month
  const canGoPrevMonth = !isMonthInPast(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1
  );

  // ── Clear invalid slot when switching date ───────────────────────────────
  const handleDateSelect = (day: number) => {
    if (isDayPast(day)) return;
    setSelectedDate(day);
    // Always clear selected slot when date changes — forces user to pick a valid slot
    // for the new date. Prevents stale slot from a different day being submitted.
    setSelectedSlot(null);
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot || !selectedStaffId) return;
    const patientId = (user as any)?.patient_id ?? user?.id;
    if (!patientId) {
      setSubmitError('Patient record is missing for this account.');
      return;
    }

    // Frontend guard: double-check time is valid
    if (isSlotDisabled(selectedSlot)) {
      setSubmitError('You can only book future time slots.');
      return;
    }

    try {
      setSubmitError(null);
      await createAppointment.mutateAsync({
        patientId,
        doctorId: selectedStaffId,
        datetime: buildAppointmentDate(currentYear, currentMonth, selectedDate, selectedSlot),
        reason: selectedReason || reason || undefined,
        notes: reason || undefined,
      });
      setConfirmed(true);
      setTimeout(() => navigate('/patient'), 2000);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message ?? 'Failed to book appointment.');
    }
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
        
        {/* Staff Selection */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            <User size={14} style={{ display: 'inline', marginRight: '6px', color: '#64748b' }} />
            Select Professional
          </h3>
          <div className="flex flex-col gap-2">
            {/* Doctors */}
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Doctors</p>
              <div className="grid grid-cols-1 gap-2">
                {doctors.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedStaffId(d.id)}
                    className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                    style={{
                      background: selectedStaffId === d.id ? '#eff6ff' : 'white',
                      border: `2px solid ${selectedStaffId === d.id ? '#2563eb' : 'transparent'}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                      <User size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-slate-900">{d.name}</p>
                      <p className="text-[11px] text-slate-500">Physiotherapy Specialist</p>
                    </div>
                    {selectedStaffId === d.id && <CheckCircle size={18} className="text-blue-600" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Therapists */}
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Therapists</p>
              <div className="grid grid-cols-1 gap-2">
                {therapists.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedStaffId(t.id)}
                    className="flex items-center gap-3 p-3 rounded-2xl text-left transition-all"
                    style={{
                      background: selectedStaffId === t.id ? '#f0fdfa' : 'white',
                      border: `2px solid ${selectedStaffId === t.id ? '#0d9488' : 'transparent'}`,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700">
                      <UserCog size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-bold text-slate-900">{t.name}</p>
                      <p className="text-[11px] text-slate-500">Therapist · SAAI Clinic</p>
                    </div>
                    {selectedStaffId === t.id && <CheckCircle size={18} className="text-teal-600" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* Calendar */}
        <div
          className="p-4 rounded-2xl mb-4"
          style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMonth}
              disabled={!canGoPrevMonth}
              className="rounded-xl flex items-center justify-center"
              style={{
                width: '32px', height: '32px',
                background: canGoPrevMonth ? '#f1f5f9' : '#f8fafc',
                opacity: canGoPrevMonth ? 1 : 0.4,
                cursor: canGoPrevMonth ? 'pointer' : 'not-allowed',
              }}
            >
              <ChevronLeft size={16} color="#475569" />
            </button>
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              {monthNames[currentMonth] ?? ''} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="rounded-xl flex items-center justify-center"
              style={{ width: '32px', height: '32px', background: '#f1f5f9' }}
            >
              <ChevronRight size={16} color="#475569" />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 mb-2">
            {dayLabels.map((d) => (
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
              const isPast = isDayPast(day);
              const isToday = currentMonth === today.getMonth() && currentYear === today.getFullYear() && day === today.getDate();
              const isSelected = selectedDate === day;
              return (
                <button
                  key={day}
                  disabled={isPast}
                  onClick={() => handleDateSelect(day)}
                  className="flex items-center justify-center rounded-xl mx-auto"
                  style={{
                    width: '34px', height: '34px', fontSize: '13px', fontWeight: isSelected || isToday ? 700 : 500,
                    background: isSelected ? '#2563eb' : isToday ? '#eff6ff' : 'transparent',
                    color: isSelected ? 'white' : isToday ? '#2563eb' : isPast ? '#cbd5e1' : '#1e293b',
                    border: isToday && !isSelected ? '1.5px solid #2563eb' : 'none',
                    cursor: isPast ? 'not-allowed' : 'pointer',
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

            {/* Warning if today and some slots disabled */}
            {isSelectedToday && availableSlotCount > 0 && availableSlotCount < timeSlots.length && (
              <div
                className="flex items-center gap-2 mb-3 p-3 rounded-xl"
                style={{ background: '#fef3c7', border: '1px solid #fcd34d' }}
              >
                <AlertTriangle size={14} color="#d97706" />
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#92400e' }}>
                  You can only book future time slots. Past slots for today are disabled.
                </span>
              </div>
            )}

            {/* No slots available — either all expired today, or config has no slots */}
            {(availableSlotCount === 0 || timeSlots.length === 0) && (
              <div
                className="p-5 rounded-2xl text-center"
                style={{ background: '#fef2f2', border: '1.5px solid #fecaca' }}
              >
                <Clock size={28} color="#f87171" className="mx-auto mb-2" />
                <p style={{ fontSize: '14px', fontWeight: 700, color: '#b91c1c' }}>
                  Available time slot is not available now.
                </p>
                <p style={{ fontSize: '12px', color: '#dc2626', marginTop: '6px' }}>
                  Please select a different date to see available slots.
                </p>
              </div>
            )}

            {/* Only render the grid if there are available slots */}
            {availableSlotCount > 0 && (
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => {
                  const disabled = isSlotDisabled(slot);
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      disabled={disabled}
                      onClick={() => !disabled && setSelectedSlot(slot)}
                      className="py-2.5 rounded-xl transition-opacity"
                      style={{
                        fontSize: '12px', fontWeight: 700,
                        background: disabled ? '#f1f5f9' : isSelected ? '#2563eb' : 'white',
                        color: disabled ? '#94a3b8' : isSelected ? 'white' : '#475569',
                        border: `1.5px solid ${disabled ? '#e2e8f0' : isSelected ? '#2563eb' : '#e2e8f0'}`,
                        boxShadow: disabled ? 'none' : '0 1px 4px rgba(0,0,0,0.05)',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.5 : 1,
                        textDecoration: disabled ? 'line-through' : 'none',
                      }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
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
          disabled={!selectedDate || !selectedSlot || !selectedStaffId || createAppointment.isPending}
          className="w-full py-4 rounded-2xl"
          style={{
            background: selectedDate && selectedSlot && selectedStaffId
              ? 'linear-gradient(135deg, #1d4ed8, #2563eb)'
              : '#e2e8f0',
            color: selectedDate && selectedSlot && selectedStaffId ? 'white' : '#94a3b8',
            fontSize: '16px', fontWeight: 700,
            boxShadow: selectedDate && selectedSlot && selectedStaffId ? '0 8px 24px rgba(37,99,235,0.3)' : 'none',
            marginBottom: '8px',
          }}
        >
          {createAppointment.isPending ? 'Booking...' : 'Confirm Appointment'}
        </button>
        {submitError && (
          <div
            className="flex items-center gap-2 p-3 rounded-xl mb-2"
            style={{ background: '#fef2f2', border: '1px solid #fecaca' }}
          >
            <AlertTriangle size={14} color="#dc2626" />
            <p style={{ fontSize: '13px', fontWeight: 600, color: '#b91c1c' }}>{submitError}</p>
          </div>
        )}
      </div>

      <div className="md:hidden">
        <BottomNav role="patient" />
      </div>
    </div>
  );
}
