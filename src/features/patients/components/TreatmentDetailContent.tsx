import React, { useState } from 'react';
import {
  Pencil, Check, X, Phone, MapPin, User, FileText,
  Calendar, Stethoscope, CreditCard, Printer, ExternalLink,
  Loader2, AlertCircle,
} from 'lucide-react';
import { usePatient } from '../../../hooks/usePatients';
import { useLatestEvaluation, useUpdateEvaluation } from '../../../hooks/useEvaluations';
import { usePatientAppointments } from '../../../hooks/useAppointments';
import { useAuth } from '../../auth/useAuth';
import type { Evaluation, UserRole } from '../../../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDate(iso: string | null | undefined): string {
  if (!iso) return '–';
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

// ─── Sub-components ───────────────────────────────────────────────────────────
interface FieldRowProps {
  label: string;
  value?: string | null;
  editable?: boolean;
  onSave?: (val: string) => Promise<void>;
}

function FieldRow({ label, value, editable = false, onSave }: FieldRowProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!onSave) return;
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(value ?? '');
    setEditing(false);
  };

  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-700/50 last:border-0">
      <span className="w-40 shrink-0 text-sm text-slate-400 font-medium">{label}</span>
      <span className="text-slate-300 text-xs mr-2">:</span>
      <div className="flex-1 flex items-start gap-2">
        {editing ? (
          <div className="flex-1 flex flex-col gap-2">
            <textarea
              autoFocus
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full bg-slate-700 border border-slate-500 rounded-lg px-3 py-2 text-sm text-white resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                Save
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-600 hover:bg-slate-500 text-white text-xs font-semibold transition-colors"
              >
                <X size={12} /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className="flex-1 text-sm text-white leading-relaxed">
              {value || <span className="text-slate-500 italic">–</span>}
            </span>
            {editable && (
              <button
                onClick={() => setEditing(true)}
                className="shrink-0 p-1.5 rounded-md hover:bg-slate-600 text-slate-400 hover:text-cyan-400 transition-colors"
                title="Edit"
              >
                <Pencil size={13} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

function SectionCard({ title, badge, icon, children }: SectionCardProps) {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-800/60 overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-700 bg-slate-800">
        {icon && <span className="text-cyan-400">{icon}</span>}
        <h3 className="text-cyan-400 font-semibold text-sm tracking-wide">{title}</h3>
        {badge && <div className="ml-auto">{badge}</div>}
      </div>
      <div className="px-4 py-2">{children}</div>
    </div>
  );
}

function StatusBadge({ label, variant }: { label: string; variant: 'filled' | 'outlined' }) {
  if (variant === 'filled') {
    return (
      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
        {label}
      </span>
    );
  }
  return (
    <span className="px-3 py-1 rounded-full text-xs font-bold text-slate-300 border border-slate-500">
      {label}
    </span>
  );
}

// ─── Payment Table ─────────────────────────────────────────────────────────────
function PaymentTable({ visits }: { visits: [] }) {
  if (!visits || visits.length === 0) {
    return (
      <p className="text-slate-500 text-sm italic text-center py-6">
        No payment records available yet.
      </p>
    );
  }

  const columns = [
    'Visit No', 'Visit Date', 'Total Amount', 'Discount',
    'Paid Amount', 'Mode', 'Entry By', 'Remarks', 'Paid At',
  ];

  return (
    <div className="overflow-x-auto -mx-4">
      <table className="min-w-full text-xs">
        <thead>
          <tr className="border-b border-slate-700">
            {columns.map((col) => (
              <th key={col} className="px-3 py-2 text-left font-semibold text-slate-400 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Rows rendered when backend data arrives */}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export interface TreatmentDetailContentProps {
  patientId: string;
  onClose?: () => void;
  /** The role of the currently logged-in user, used to gate edit buttons. */
  viewerRole: UserRole;
}

export function TreatmentDetailContent({
  patientId,
  onClose,
  viewerRole,
}: TreatmentDetailContentProps) {
  const canEdit = viewerRole === 'doctor';

  // ── Data fetching ─────────────────────────────────────────────────────────
  const {
    data: patient,
    isLoading: patientLoading,
    error: patientError,
  } = usePatient(patientId);

  const {
    data: evaluation,
    isLoading: evalLoading,
    error: evalError,
  } = useLatestEvaluation(patientId);

  const { data: appointmentsData } = usePatientAppointments(patientId);

  const updateEval = useUpdateEvaluation(evaluation?.id ?? '');

  // Derive first / last visit from appointments list
  const appointments = appointmentsData?.data ?? [];
  const firstVisit = appointments[0]?.datetime ?? null;
  const lastVisit = appointments[appointments.length - 1]?.datetime ?? null;

  // ── Loading state ─────────────────────────────────────────────────────────
  if (patientLoading || evalLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-64 text-slate-400">
        <Loader2 size={32} className="animate-spin text-cyan-500" />
        <p className="text-sm">Loading treatment detail…</p>
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (patientError || !patient) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 h-64 text-slate-400">
        <AlertCircle size={32} className="text-red-400" />
        <p className="text-sm">Failed to load patient data. Please try again.</p>
      </div>
    );
  }

  // ── Helpers for inline save ───────────────────────────────────────────────
  const saveDiagnosis = async (val: string) => {
    await updateEval.mutateAsync({ diagnosis: val });
  };
  const savePlan = async (val: string) => {
    await updateEval.mutateAsync({ plan: val });
  };
  const saveManagement = async (val: string) => {
    await updateEval.mutateAsync({ management: val });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-5">

      {/* ── Top summary banner ── */}
      <div className="text-center pb-4 border-b border-slate-700">
        <h2 className="text-xl font-bold text-white">{patient.name}</h2>
        <p className="text-slate-400 text-sm mt-1">
          Treatment No:{' '}
          <span className="text-cyan-400 font-semibold">
            {evaluation?.displayId ?? '–'}
          </span>
        </p>
        <p className="text-slate-500 text-xs mt-0.5">
          Created At: {formatDate(evaluation?.createdAt)}
        </p>
      </div>

      {/* ── A. Patient Details ── */}
      <SectionCard
        title="Patient Details"
        icon={<User size={15} />}
        badge={
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold hover:bg-emerald-600/30 transition-colors">
              <CreditCard size={12} /> 0
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-semibold hover:bg-amber-500/30 transition-colors">
              <FileText size={12} /> Files
            </button>
          </div>
        }
      >
        <div className="flex items-start gap-3 py-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {getInitials(patient.name)}
          </div>
          {/* Info grid */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6">
            <div>
              <p className="text-white font-semibold text-sm">{patient.name}</p>
              <p className="text-slate-400 text-xs">{patient.fileNumber ?? patient.displayId}</p>
            </div>
            <InfoPill icon={<Phone size={11} />} label={patient.phone} />
            <InfoPill icon={<MapPin size={11} />} label={patient.city ?? '–'} />
            <InfoPill icon={<User size={11} />} label={`${patient.age}y · ${patient.gender}`} />
          </div>
        </div>
      </SectionCard>

      {/* ── B. Treatment Details ── */}
      <SectionCard
        title="Treatment Details"
        icon={<Stethoscope size={15} />}
        badge={<StatusBadge label="Active" variant="filled" />}
      >
        {evalError || !evaluation ? (
          <p className="text-slate-500 text-sm italic py-4">
            No evaluation record found for this patient.
          </p>
        ) : (
          <>
            <FieldRow label="Treatment No" value={evaluation.displayId} />
            <FieldRow
              label="Doctor Name (Assigned By)"
              value={evaluation.updatedBy?.name ?? evaluation.createdBy?.name ?? '–'}
            />
            <FieldRow
              label="Diagnosis"
              value={evaluation.diagnosis}
              editable={canEdit}
              onSave={saveDiagnosis}
            />
            <FieldRow
              label="Treatment Detail"
              value={evaluation.plan}
              editable={canEdit}
              onSave={savePlan}
            />
            {evaluation.treatmentPlan?.exercises && evaluation.treatmentPlan.exercises.length > 0 && (
              <div className="py-2.5 border-b border-slate-700/50">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Prescribed Exercises & Attachments</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {evaluation.treatmentPlan.exercises.map((ex: any, idx: number) => (
                    <div key={ex.id || idx} className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white">{ex.exerciseName || ex.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 uppercase">{ex.category || 'General'}</span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {ex.sets ? `${ex.sets} sets` : ''} {ex.reps ? `• ${ex.reps}` : ''} {ex.holdTime ? `• Hold: ${ex.holdTime}` : ''} {ex.frequency ? `• ${ex.frequency}` : ''}
                      </p>
                      {ex.attachments?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {ex.attachments.map((att: any) => (
                            <a key={att.id} href={att.dataUrl} download={att.name} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-950/60 text-[9px] font-bold text-teal-300 border border-teal-800">
                              📎 {att.name}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <FieldRow
              label="Medical History"
              value={evaluation.medicalHistory?.join(', ')}
            />
            <FieldRow label="Referred By" value={evaluation.referredBy} />
            <FieldRow
              label="Remarks"
              value={evaluation.management}
              editable={canEdit}
              onSave={saveManagement}
            />
            <FieldRow label="First Visit" value={formatDate(firstVisit)} />
            <FieldRow label="Last Visit" value={formatDate(lastVisit)} />
          </>
        )}
      </SectionCard>

      {/* ── C. Package Details (UI only — backend pending) ── */}
      <SectionCard
        title="Package Details"
        icon={<Calendar size={15} />}
        badge={<StatusBadge label="Regular" variant="outlined" />}
      >
        <div className="py-3">
          <p className="text-slate-400 text-sm mb-3">
            Service Type:{' '}
            <span className="text-white font-medium">Clinic</span>
          </p>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: 'Total Visits', value: null },
              { label: 'Visited', value: null },
              { label: 'Remaining Visits', value: null },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-lg bg-slate-700/50 p-3 text-center border border-slate-600/40">
                <p className="text-slate-400 text-xs mb-1">{label}</p>
                <p className="text-white font-bold text-base">
                  {value ?? <span className="text-slate-500">–</span>}
                </p>
              </div>
            ))}
          </div>
          <PackageLabelRow label="Per Session Charges" value={null} />
          <PackageLabelRow label="Package Valid Upto" value={null} />
        </div>
      </SectionCard>

      {/* ── D. Payment Details (UI only — backend pending) ── */}
      <SectionCard title="Payment Details" icon={<CreditCard size={15} />}>
        <div className="py-3">
          {/* Summary */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex flex-col gap-2">
              <PaymentSummaryRow label="Total Amount" value={null} />
              <PaymentSummaryRow label="Discount" value={null} />
              <PaymentSummaryRow label="Paid" value={null} />
              <PaymentSummaryRow label="Remaining Amount" value={null} />
            </div>
            <button
              className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Print"
            >
              <Printer size={16} />
            </button>
          </div>

          {/* Billing section link */}
          <button className="flex items-center gap-2 text-cyan-400 text-sm font-semibold hover:text-cyan-300 transition-colors mb-4">
            Manage Payments in Billing Section
            <ExternalLink size={13} />
          </button>

          {/* Visit-wise table */}
          <PaymentTable visits={[]} />
        </div>
      </SectionCard>

      {/* ── E. Action Buttons ── */}
      <div className="flex flex-col sm:flex-row gap-3 pb-2">
        <button className="flex-1 py-3 rounded-xl border border-cyan-500/50 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/10 transition-colors">
          View All Treatment Record
        </button>
        <button className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-semibold hover:from-violet-500 hover:to-purple-600 transition-all shadow-lg shadow-violet-900/30">
          Treatment Entry
        </button>
      </div>
    </div>
  );
}

// ─── Small helpers ─────────────────────────────────────────────────────────────
function InfoPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 text-slate-300 text-xs">
      <span className="text-slate-500">{icon}</span>
      {label}
    </div>
  );
}

function PackageLabelRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between py-2 border-t border-slate-700/50">
      <span className="text-slate-400 text-sm">{label}</span>
      <span className="text-white text-sm font-medium">
        {value ?? <span className="text-slate-500">–</span>}
      </span>
    </div>
  );
}

function PaymentSummaryRow({ label, value }: { label: string; value: number | null }) {
  return (
    <div className="flex items-center gap-8">
      <span className="text-slate-400 text-sm w-36">{label}</span>
      <span className="text-slate-300 text-xs mr-2">:</span>
      <span className="text-white text-sm font-medium">
        {value !== null ? value : <span className="text-slate-500">–</span>}
      </span>
    </div>
  );
}
