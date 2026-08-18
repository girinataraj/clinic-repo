import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { BottomNav } from '../components/BottomNav';
import { useAppConfigScope } from '../../hooks/useAppConfig';
import { useCreateAppointment, useSlotAvailability } from '../../hooks/useAppointments';
import { usePatient } from '../../hooks/usePatients';
import type { SlotInfo } from '../../hooks/useAppointments';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Clock,
  MessageSquare,
  AlertTriangle,
  Loader2,
  UserX,
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

/** Background + text colors for slot status */
function getSlotColors(status: string, isSelected: boolean, isDark: boolean) {
  if (isSelected) return { bg: '#2563eb', text: 'white', border: '#2563eb' };
  switch (status) {
    case 'green':
      return { 
        bg: isDark ? '#064e3b' : '#dcfce7', 
        text: isDark ? '#34d399' : '#166534', 
        border: isDark ? '#065f46' : '#86efac' 
      };
    case 'orange':
      return { 
        bg: isDark ? '#78350f' : '#fff7ed', 
        text: isDark ? '#fbbf24' : '#9a3412', 
        border: isDark ? '#92400e' : '#fdba74' 
      };
    case 'red':
      return { 
        bg: isDark ? '#7f1d1d' : '#fef2f2', 
        text: isDark ? '#f87171' : '#991b1b', 
        border: isDark ? '#991b1b' : '#fca5a5' 
      };
    default:
      return { 
        bg: isDark ? '#1e293b' : 'white', 
        text: isDark ? '#94a3b8' : '#475569', 
        border: isDark ? '#334155' : '#e2e8f0' 
      };
  }
}

function getSlotLabel(status: string) {
  switch (status) {
    case 'green': return 'Available';
    case 'orange': return '1 booked';
    case 'red': return 'Full';
    default: return '';
  }
}

export function AppointmentBooking() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: appointmentConfig } = useAppConfigScope('appointment');
  const createAppointment = useCreateAppointment();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const patientId = (user as any)?.patient_id ?? user?.id;
  const { data: patient, isLoading: patientLoading } = usePatient(patientId);
  const therapistId = patient?.therapistId ?? null;
  const therapistName = patient?.therapistName ?? null;

  // Build the date string for slot-availability query
  const selectedDateStr = useMemo(() => {
    if (selectedDate === null) return null;
    const m = String(currentMonth + 1).padStart(2, '0');
    const d = String(selectedDate).padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  }, [selectedDate, currentMonth, currentYear]);

  // Fetch slot availability from backend
  const {
    data: slotAvailability,
    isLoading: slotsLoading,
    isError: slotsError,
  } = useSlotAvailability(therapistId, selectedDateStr);

  const slots: SlotInfo[] = slotAvailability?.slots ?? [];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
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
  const nextValidHour = getNextFullHour();

  const isSlotPast = (slot: string): boolean => {
    if (!isSelectedToday) return false;
    const slotHour = slotTo24Hour(slot);
    if (slotHour < 0) return false;
    return slotHour < nextValidHour;
  };

  // ── Month navigation guards ──────────────────────────────────────────────
  const handlePrevMonth = () => {
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth < 0) { prevMonth = 11; prevYear -= 1; }
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

  const canGoPrevMonth = !isMonthInPast(
    currentMonth === 0 ? currentYear - 1 : currentYear,
    currentMonth === 0 ? 11 : currentMonth - 1
  );

  // ── Clear invalid slot when switching date ───────────────────────────────
  const handleDateSelect = (day: number) => {
    if (isDayPast(day)) return;
    setSelectedDate(day);
    setSelectedSlot(null);
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!selectedDate || !selectedSlot || !therapistId) return;
    if (!patientId) {
      setSubmitError('Patient record is missing for this account.');
      return;
    }

    if (isSlotPast(selectedSlot)) {
      setSubmitError('You can only book future time slots.');
      return;
    }

    try {
      setSubmitError(null);
      await createAppointment.mutateAsync({
        patientId,
        doctorId: therapistId,
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
      <div className="h-full flex flex-col items-center justify-center bg-blue-50 dark:bg-slate-950">
        <div
          className="flex flex-col items-center p-8 rounded-3xl mx-6 bg-white dark:bg-slate-800 shadow-[0_8px_32px_rgba(0,0,0,0.1)] dark:shadow-none border border-transparent dark:border-slate-700"
        >
          <div className="rounded-full flex items-center justify-center mb-4 w-20 h-20 bg-emerald-50 dark:bg-emerald-900/30">
            <CheckCircle size={44} className="text-emerald-500 dark:text-emerald-400" />
          </div>
          <h2 className="text-[20px] font-extrabold text-slate-900 dark:text-white text-center">
            Appointment Confirmed!
          </h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 text-center mt-2">
            You'll receive a confirmation shortly. Redirecting...
          </p>
        </div>
      </div>
    );
  }

  // ── No therapist assigned state ─────────────────────────────────────────
  const noTherapist = !patientLoading && patient && !therapistId;

  return (
    <div className="flex flex-col h-full bg-blue-50/50 dark:bg-slate-950 font-sans">
      {/* Header */}
      <div
        className="px-5 pt-safe-top-4 pb-5 shrink-0 bg-gradient-to-br from-blue-900 to-blue-600 dark:from-slate-900 dark:to-slate-800"
      >
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate('/patient')}
            className="flex items-center justify-center rounded-xl w-9 h-9 bg-white/20 hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={18} color="white" />
          </button>
          <div>
            <h1 className="text-[18px] font-extrabold text-white">Book Appointment</h1>
            <p className="text-[12px] text-white/70 font-medium">
              {therapistName ? `Therapist: ${therapistName}` : 'Schedule your next visit'}
            </p>
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full bg-blue-50/30 dark:bg-slate-900/40">

        {/* Loading patient */}
        {patientLoading && (
          <div className="flex items-center justify-center p-8">
            <Loader2 size={24} className="animate-spin text-blue-500" />
            <span className="ml-2 text-[13px] text-slate-500">Loading patient info...</span>
          </div>
        )}

        {/* No therapist assigned */}
        {noTherapist && (
          <div className="p-5 rounded-2xl text-center bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 mb-4">
            <UserX size={32} className="mx-auto mb-2 text-amber-500 dark:text-amber-400" />
            <p className="text-[14px] font-bold text-amber-800 dark:text-amber-400">
              No Therapist Assigned
            </p>
            <p className="text-[12px] text-amber-700 dark:text-amber-300 mt-1.5">
              You don't have a therapist assigned yet. Please contact the clinic to get a therapist assigned before booking an appointment.
            </p>
          </div>
        )}

        {/* Calendar — only show when therapist exists */}
        {!patientLoading && therapistId && (
          <>
            <div
              className="p-4 rounded-2xl mb-4 bg-white dark:bg-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none border border-transparent dark:border-slate-700"
            >
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePrevMonth}
                  disabled={!canGoPrevMonth}
                  className={`rounded-xl flex items-center justify-center w-8 h-8 transition-colors ${canGoPrevMonth ? 'bg-slate-100 dark:bg-slate-700 cursor-pointer text-slate-600 dark:text-slate-300' : 'bg-slate-50 dark:bg-slate-800 opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600'}`}
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-[15px] font-extrabold text-slate-900 dark:text-white">
                  {monthNames[currentMonth] ?? ''} {currentYear}
                </span>
                <button
                  onClick={handleNextMonth}
                  className="rounded-xl flex items-center justify-center w-8 h-8 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Day labels */}
              <div className="grid grid-cols-7 mb-2">
                {dayLabels.map((d) => (
                  <div key={d} className="text-center text-[11px] font-bold text-slate-400 py-1">
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
                      className={`flex items-center justify-center rounded-xl mx-auto w-8 h-8 text-[13px] ${
                        isSelected ? 'bg-blue-600 text-white font-bold' :
                        isToday ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold border-2 border-blue-600 dark:border-blue-500' :
                        isPast ? 'text-slate-300 dark:text-slate-600 cursor-not-allowed font-medium' :
                        'text-slate-800 dark:text-slate-200 cursor-pointer font-medium hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Time Slots — from backend */}
            {selectedDate && (
              <div className="mb-4">
                <h3 className="text-[14px] font-extrabold text-slate-900 dark:text-white mb-2.5 flex items-center">
                  <Clock size={14} className="mr-1.5 text-slate-500 dark:text-slate-400" />
                  Available Time Slots
                </h3>

                {/* Loading slots */}
                {slotsLoading && (
                  <div className="flex items-center justify-center p-6">
                    <Loader2 size={20} className="animate-spin text-blue-500" />
                    <span className="ml-2 text-[13px] text-slate-500">Loading slots...</span>
                  </div>
                )}

                {/* Error loading slots */}
                {slotsError && (
                  <div className="p-5 rounded-2xl text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50">
                    <AlertTriangle size={28} className="mx-auto mb-2 text-red-400 dark:text-red-500" />
                    <p className="text-[14px] font-bold text-red-700 dark:text-red-400">
                      Failed to load slot availability.
                    </p>
                    <p className="text-[12px] text-red-600 dark:text-red-300 mt-1.5">
                      Please try again or select a different date.
                    </p>
                  </div>
                )}

                {/* Warning if today and some slots are past */}
                {!slotsLoading && !slotsError && isSelectedToday && slots.some(s => isSlotPast(s.time)) && slots.some(s => !isSlotPast(s.time)) && (
                  <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50">
                    <AlertTriangle size={14} className="text-amber-600 dark:text-amber-500" />
                    <span className="text-[12px] font-bold text-amber-800 dark:text-amber-400">
                      You can only book future time slots. Past slots for today are disabled.
                    </span>
                  </div>
                )}

                {/* Slots grid */}
                {!slotsLoading && !slotsError && slots.length > 0 && (
                  <>
                    {/* Legend */}
                    <div className="flex items-center gap-4 mb-3 text-[11px] font-semibold text-slate-500">
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#dcfce7', border: '1px solid #86efac' }} /> Available</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#fff7ed', border: '1px solid #fdba74' }} /> 1 Booked</span>
                      <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ background: '#fef2f2', border: '1px solid #fca5a5' }} /> Full / Occupied</span>
                    </div>

                    {slots.some(s => s.status === 'red') && (
                      <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50">
                        <AlertTriangle size={14} className="text-red-600 dark:text-red-500" />
                        <span className="text-[12px] font-bold text-red-800 dark:text-red-400">
                          All therapists are currently occupied in some slots. Please select another available time slot.
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full min-w-0">
                      {slots.map((slot) => {
                        const pastSlot = isSlotPast(slot.time);
                        const isFull = slot.status === 'red';
                        const disabled = pastSlot || isFull;
                        const isSelected = selectedSlot === slot.time;
                        const colors = getSlotColors(slot.status, isSelected, isDark);

                        return (
                          <button
                            key={slot.time}
                            disabled={disabled}
                            onClick={() => !disabled && setSelectedSlot(slot.time)}
                            className="py-2 sm:py-2.5 rounded-xl transition-all text-[11px] sm:text-[12px] font-bold relative text-center truncate px-1"
                            style={{
                              background: disabled && !isSelected
                                ? (pastSlot ? '#f1f5f9' : colors.bg)
                                : colors.bg,
                              color: disabled && !isSelected
                                ? (pastSlot ? '#94a3b8' : colors.text)
                                : colors.text,
                              border: `1.5px solid ${disabled && !isSelected ? (pastSlot ? '#e2e8f0' : colors.border) : colors.border}`,
                              opacity: pastSlot ? 0.5 : 1,
                              cursor: disabled ? 'not-allowed' : 'pointer',
                              textDecoration: pastSlot ? 'line-through' : 'none',
                              boxShadow: isSelected ? '0 4px 12px rgba(37,99,235,0.3)' : '0 1px 3px rgba(0,0,0,0.04)',
                            }}
                          >
                            {slot.time}
                            {!pastSlot && (
                              <span
                                className="block text-[10px] font-medium mt-0.5"
                                style={{ opacity: 0.8 }}
                              >
                                {getSlotLabel(slot.status)}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* No slots available */}
                {!slotsLoading && !slotsError && slots.length === 0 && (
                  <div className="p-5 rounded-2xl text-center bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50">
                    <Clock size={28} className="mx-auto mb-2 text-red-400 dark:text-red-500" />
                    <p className="text-[14px] font-bold text-red-700 dark:text-red-400">
                      No time slots configured.
                    </p>
                    <p className="text-[12px] text-red-600 dark:text-red-300 mt-1.5">
                      Please contact the clinic for assistance.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Reason for Visit */}
            <div className="mb-4">
              <h3 className="text-[14px] font-extrabold text-slate-900 dark:text-white mb-2.5">
                Reason for Visit
              </h3>
              <div className="flex flex-wrap gap-2 mb-3">
                {[...new Set(['Regular Visit', ...reasons])].map((r) => (
                  <button
                    key={r}
                    onClick={() => setSelectedReason(r)}
                    className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-colors ${
                      selectedReason === r ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div
                className="flex items-start gap-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <MessageSquare size={16} className="text-slate-400 mt-0.5 shrink-0" />
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Add additional notes about your condition..."
                  className="flex-1 outline-none resize-none bg-transparent text-[13px] text-slate-800 dark:text-white min-h-[60px] placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
            </div>

            {/* Confirm button */}
            <button
              onClick={handleConfirm}
              disabled={!selectedDate || !selectedSlot || createAppointment.isPending}
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
              {createAppointment.isPending ? 'Booking...' : 'Confirm Appointment'}
            </button>
            {submitError && (
              <div className="flex items-center gap-2 p-3 rounded-xl mb-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50">
                <AlertTriangle size={14} className="text-red-600 dark:text-red-500" />
                <p className="text-[13px] font-bold text-red-700 dark:text-red-400">{submitError}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="md:hidden shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav role="patient" />
      </div>
    </div>
  );
}
