import { useNavigate, useParams } from 'react-router';
import { ArrowLeft, MoreVertical } from 'lucide-react';
import { TreatmentDetailContent } from '../components/TreatmentDetailContent';
import { useAuth } from '../../auth/useAuth';

/**
 * Full-page Treatment Detail — shown on mobile when a patient card is tapped.
 * On desktop the same content is shown inside a modal instead.
 *
 * Route:
 *   /doctor/patient/:patientId/treatment
 *   /nurse/patient/:patientId/treatment
 */
export function TreatmentDetailPage() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!patientId) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Invalid patient ID.
      </div>
    );
  }

  return (
    <div
      className="flex flex-col min-h-screen"
      style={{ background: '#0f172a' }}
    >
      {/* ── Sticky top bar ── */}
      <div
        className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 pt-safe-top-3 border-b border-slate-700"
        style={{ background: '#0f172a' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-cyan-400 transition-colors"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
          <span className="text-sm font-semibold">Treatment Detail</span>
        </button>

        <button
          className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          aria-label="More options"
        >
          <MoreVertical size={18} />
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-4 py-5">
        <TreatmentDetailContent
          patientId={patientId}
          viewerRole={user?.role ?? 'nurse'}
        />
      </div>
    </div>
  );
}
