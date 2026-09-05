import { Stethoscope, ChevronDown } from 'lucide-react';
import { useStaffUsers } from '../../hooks/useStaff';

interface OwningDoctorSelectProps {
  value: string;
  onChange: (owningDoctorId: string) => void;
  /** Focus ring classes from the host screen's theme, so this matches its fields. */
  focusBorder?: string;
}

/**
 * Owning-doctor picker, shown to administrators only.
 *
 * Every patient belongs to exactly one doctor. A doctor owns what they create
 * and a therapist inherits their supervising doctor, so neither is ever asked.
 * An administrator has no hierarchy to inherit from, so the backend requires
 * them to name the owner (400 OWNING_DOCTOR_REQUIRED otherwise) and this is the
 * only place that value is chosen.
 *
 * The caller decides whether to render this at all — it does not read the role
 * itself, so the two screens that admins can reach stay explicit about it.
 *
 * This is a convenience, not a control: ownership is resolved and enforced
 * server-side in resolveOwningDoctorForCreation(), which ignores this value for
 * doctors and therapists entirely.
 */
export function OwningDoctorSelect({ value, onChange, focusBorder = '' }: OwningDoctorSelectProps) {
  // role='doctor' bypasses the therapist directory and hits the staff
  // directory, which returns active doctors only.
  const { data: doctors = [], isLoading, isError } = useStaffUsers({ role: 'doctor' });

  const hasNoDoctors = !isLoading && !isError && doctors.length === 0;

  return (
    <div>
      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
        Owning Doctor <span className="text-red-500">*</span>
      </label>

      <div
        className={`flex items-center gap-2 px-3.5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 ${focusBorder} transition-colors relative`}
      >
        <Stethoscope size={16} className="text-slate-400 shrink-0" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isLoading || isError || hasNoDoctors}
          aria-label="Owning doctor"
          className="flex-1 bg-transparent outline-none text-sm text-slate-900 dark:text-white appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">
            {isLoading ? 'Loading doctors…' : 'Select the owning doctor…'}
          </option>
          {doctors.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="text-slate-400 shrink-0 pointer-events-none" />
      </div>

      {isError && (
        <p className="mt-1.5 text-xs text-red-500">
          Could not load the doctor list. Please retry in a moment.
        </p>
      )}
      {hasNoDoctors && (
        <p className="mt-1.5 text-xs text-red-500">
          No active doctors found. A doctor account is required before an
          administrator can register a patient.
        </p>
      )}
      {!isLoading && !isError && !hasNoDoctors && (
        <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
          The patient will belong to this doctor. This cannot be changed later.
        </p>
      )}
    </div>
  );
}
