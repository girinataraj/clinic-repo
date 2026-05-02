import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { BottomNav } from '../components/BottomNav';
import { usePatient, useCreatePatient, useUpdatePatient } from '../../hooks/usePatients';
import { useStaffUsers } from '../../hooks/useStaff';
import {
  ArrowLeft, Save, Loader2, CheckCircle, AlertTriangle, User, Phone, MapPin,
  FileText, Activity, ChevronDown, UserCog,
} from 'lucide-react';

export function PatientForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const isEdit = Boolean(editId);
  const role = user?.role ?? 'nurse';
  const basePath = role === 'doctor' ? '/doctor' : '/nurse';

  // ── Data hooks ───────────────────────────────────────────────────────────
  const { data: existingPatient, isLoading: loadingPatient } = usePatient(editId);
  const createPatient = useCreatePatient();
  const updatePatient = useUpdatePatient();

  // ── Form state ───────────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [condition, setCondition] = useState('');
  const [therapistId, setTherapistId] = useState('');

  // ── Therapist list for assignment (only fetched for doctor) ────────────
  const isDoctorRole = role === 'doctor';
  const { data: therapists = [], isLoading: therapistsLoading } = useStaffUsers({ role: 'nurse' });

  // For nurse/therapist: auto-set therapistId to self
  useEffect(() => {
    if (!isDoctorRole && user?.id && !therapistId) {
      setTherapistId(user.id);
    }
  }, [isDoctorRole, user?.id, therapistId]);

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Prefill on edit ──────────────────────────────────────────────────────
  useEffect(() => {
    if (isEdit && existingPatient) {
      setName(existingPatient.name || '');
      setAge(String(existingPatient.age || ''));
      setGender(existingPatient.gender || 'Male');
      setPhone(existingPatient.phone || '');
      setCity(existingPatient.city || '');
      setCondition(existingPatient.condition || '');
      setTherapistId(existingPatient.therapistId || '');
    }
  }, [isEdit, existingPatient]);

  // ── Validation ───────────────────────────────────────────────────────────
  const resolvedTherapistId = isDoctorRole ? therapistId : (user?.id ?? therapistId);
  const validate = () => {
    if (!name.trim()) return 'Patient name is required.';
    if (!age.trim() || isNaN(Number(age)) || Number(age) <= 0) return 'Valid age is required.';
    if (!phone.trim() || phone.trim().length < 7) return 'Valid phone number is required.';
    if (isDoctorRole && !resolvedTherapistId) return 'Please assign a therapist.';
    return null;
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError(null);

    try {
      if (isEdit && editId) {
        await updatePatient.mutateAsync({
          id: editId,
          name: name.trim(),
          age: Number(age),
          gender,
          phone: phone.trim(),
          city: city.trim() || undefined,
          condition: condition.trim() || undefined,
          therapistId: resolvedTherapistId || undefined,
        });
      } else {
        await createPatient.mutateAsync({
          name: name.trim(),
          age: Number(age),
          gender,
          phone: phone.trim(),
          city: city.trim() || undefined,
          condition: condition.trim() || undefined,
          therapistId: resolvedTherapistId || undefined,
        });
      }
      setSuccess(true);
      setTimeout(() => navigate(`${basePath}/patients`), 1200);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save patient. Please try again.');
    }
  };

  const isPending = createPatient.isPending || updatePatient.isPending;

  // ── Loading state for edit ────────────────────────────────────────────────
  if (isEdit && loadingPatient) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading patient data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans">
      <div className="flex-1 overflow-y-auto pb-20 md:pb-6">
        {/* Header */}
        <div
          className="px-6 pt-8 pb-10 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0d2b27 0%, #0f766e 100%)' }}
        >
          <div className="max-w-2xl mx-auto relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  {isEdit ? 'Edit Patient' : 'Add New Patient'}
                </h1>
                <p className="text-sm text-teal-100/80 mt-0.5">
                  {isEdit ? 'Update patient information' : 'Fill in the details to register a new patient'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 md:px-6 -mt-5 relative z-10 flex flex-col gap-4">
          {/* Success banner */}
          {success && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-700">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                Patient {isEdit ? 'updated' : 'created'} successfully! Redirecting…
              </p>
            </div>
          )}

          {/* Error banner */}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
              <p className="text-sm font-bold text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
                <User size={18} className="text-teal-600 dark:text-teal-400" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Patient Details</h2>
            </div>

            <div className="flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-colors">
                  <User size={16} className="text-slate-400 shrink-0" />
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rahul Verma"
                    className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Age + Gender row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Age <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Gender</label>
                  <div className="flex gap-1.5">
                    {(['Male', 'Female', 'Other'] as const).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={`flex-1 py-2.5 rounded-xl text-[12px] font-bold border-2 transition-colors ${
                          gender === g
                            ? 'border-teal-700 dark:border-teal-500 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
                            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-colors">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 9876543210"
                    className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">City</label>
                <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-colors">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Erode"
                    className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">Condition</label>
                <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-colors">
                  <Activity size={16} className="text-slate-400 shrink-0" />
                  <input
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    placeholder="e.g. Post-op Knee"
                    className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Assign Therapist — only shown for doctor role */}
              {isDoctorRole && (
                <div>
                  <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    Assign Therapist <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-colors relative">
                    <UserCog size={16} className="text-slate-400 shrink-0" />
                    <select
                      value={therapistId}
                      onChange={(e) => setTherapistId(e.target.value)}
                      className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="">Select a therapist…</option>
                      {therapistsLoading && <option disabled>Loading…</option>}
                      {therapists.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                    <ChevronDown size={14} className="text-slate-400 shrink-0 pointer-events-none" />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isPending || success}
            className="w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-white text-base font-extrabold shadow-lg shadow-teal-700/30 disabled:opacity-60 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}
          >
            {isPending ? (
              <><Loader2 size={18} className="animate-spin" /> Saving…</>
            ) : (
              <><Save size={18} /> {isEdit ? 'Update Patient' : 'Add Patient'}</>
            )}
          </button>
        </div>
      </div>

      <div className="md:hidden shrink-0 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <BottomNav role={role as 'nurse' | 'doctor'} />
      </div>
    </div>
  );
}
