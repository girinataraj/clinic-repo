import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { usePatients, useAssignTherapist, useUpdatePatient } from '../../hooks/usePatients';
import { useStaffUsers } from '../../hooks/useStaff';
import { useDebounce } from '../../hooks/useDebounce';
import type { Patient } from '../../types';
import {
  ArrowLeft, Search, UserCheck, User, CheckCircle2, UserCog,
  AlertCircle, Loader2, RefreshCw, Check
} from 'lucide-react';

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .toUpperCase();

export function AssignPatientPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTherapistId, setSelectedTherapistId] = useState<string>('');
  
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Data hooks
  const { data: patientsData, isLoading: loadingPatients } = usePatients(
    { search: debouncedSearch.trim() || undefined, limit: 100 },
    false
  );
  const { data: therapists = [], isLoading: loadingTherapists } = useStaffUsers({ role: 'nurse' });
  const assignTherapistMutation = useAssignTherapist();
  const updatePatientMutation = useUpdatePatient();

  const patients = patientsData?.data ?? [];

  const currentTherapistName = useMemo(() => {
    if (!selectedPatient?.therapistId) return 'Unassigned';
    if (selectedPatient.therapistName) return selectedPatient.therapistName;
    const match = therapists.find((t) => t.id === selectedPatient.therapistId);
    return match ? match.name : 'Unknown';
  }, [selectedPatient, therapists]);

  const handleSelectPatient = (p: Patient) => {
    setSelectedPatient(p);
    setSelectedTherapistId(p.therapistId || '');
    setError(null);
    setSuccessMessage(null);
  };

  const handleAssign = async () => {
    if (!selectedPatient) {
      setError('Please select a patient first.');
      return;
    }
    if (!selectedTherapistId) {
      setError('Please select a therapist to assign.');
      return;
    }
    setError(null);

    const targetTherapist = therapists.find((t) => t.id === selectedTherapistId);
    const targetName = selectedTherapistId === user?.id ? (user?.name || 'Doctor') : (targetTherapist?.name || 'Selected Therapist');

    try {
      await assignTherapistMutation.mutateAsync({
        patientId: selectedPatient.id,
        therapistId: selectedTherapistId,
      });
      // Also trigger patient query refetch with status waiting
      await updatePatientMutation.mutateAsync({
        id: selectedPatient.id,
        therapistId: selectedTherapistId,
        status: 'waiting',
      });

      setSuccessMessage(`${selectedPatient.name} has been assigned to ${targetName}!`);
      setSelectedPatient((prev) => (prev ? { ...prev, therapistId: selectedTherapistId, therapistName: targetName } : null));
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to assign therapist. Please try again.');
    }
  };

  const isPending = assignTherapistMutation.isPending || updatePatientMutation.isPending;

  return (
    <div className="flex flex-col h-full bg-[#E8E9F1] dark:bg-slate-950 font-sans overflow-hidden">
      {/* Header */}
      <div className="px-5 pb-6 pt-6 shrink-0 bg-gradient-to-br from-[#262842] to-[#3B3E66] dark:from-slate-900 dark:to-slate-800 shadow-[0_4px_20px_rgba(38,40,66,0.15)]">
        <div className="flex items-center gap-3 relative z-10 max-w-2xl mx-auto">
          <button
            onClick={() => navigate('/doctor')}
            className="flex items-center justify-center rounded-xl w-9 h-9 bg-white/15 hover:bg-white/25 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div>
            <h1 className="text-[19px] font-black text-white tracking-tight">Assign Patient</h1>
            <p className="text-[11px] text-white/70">Assign or reassign any patient to a therapist</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-2xl mx-auto w-full space-y-5">
        
        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="text-xs font-bold">{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0 ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 flex items-center gap-3 shadow-sm animate-in fade-in">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400 shrink-0" />
            <span className="text-xs font-bold">{error}</span>
          </div>
        )}

        {/* Step 1: Search Patient */}
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <User size={16} className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              1. Search Patient
            </h2>
          </div>

          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by phone, name, or patient ID…"
              className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition-colors"
            />
          </div>

          {/* Search suggestions/list */}
          {loadingPatients ? (
            <div className="flex items-center justify-center py-6 gap-2 text-slate-400 text-xs font-bold">
              <Loader2 size={16} className="animate-spin text-indigo-600" />
              Searching records…
            </div>
          ) : patients.length === 0 ? (
            <p className="text-center py-4 text-xs font-semibold text-slate-400">
              No patients found. Try searching by phone or name.
            </p>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800/50">
              {patients.slice(0, 10).map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPatient(p)}
                    className={`w-full text-left p-3 rounded-xl flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-white shrink-0">
                        {getInitials(p.name)}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-slate-900 dark:text-white">{p.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
                          {p.phone} · ID: {p.displayId}
                        </p>
                      </div>
                    </div>
                    {isSelected ? (
                      <Check size={16} className="text-indigo-600 dark:text-indigo-400 shrink-0" />
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        Select
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Patient Overview & Therapist Selection */}
        {selectedPatient && (
          <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <UserCheck size={16} className="text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
                  2. Select Therapist
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                Current: {currentTherapistName}
              </span>
            </div>

            {/* Patient card summary */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {selectedPatient.name}
                </h3>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedPatient.condition || 'General'} · {selectedPatient.age} yrs · {selectedPatient.phone}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                {selectedPatient.displayId}
              </span>
            </div>

            {/* Therapist selection dropdown */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                Assign To Therapist <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedTherapistId}
                onChange={(e) => setSelectedTherapistId(e.target.value)}
                className="w-full rounded-2xl px-4 py-3.5 text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 cursor-pointer"
              >
                <option value="">-- Choose Therapist --</option>
                {user?.role === 'doctor' && (
                  <option value={user.id}>Self (Doctor Sathish)</option>
                )}
                {therapists.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Action Button */}
            <button
              onClick={handleAssign}
              disabled={isPending || !selectedTherapistId}
              className="w-full py-4 rounded-2xl text-white text-xs font-black bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Assigning…
                </>
              ) : (
                <>
                  <UserCheck size={16} />
                  Assign Therapist
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="md:hidden">
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}
