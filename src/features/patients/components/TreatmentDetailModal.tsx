import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { TreatmentDetailContent } from './TreatmentDetailContent';
import type { UserRole } from '../../../types';

interface TreatmentDetailModalProps {
  patientId: string;
  viewerRole: UserRole;
  onClose: () => void;
}

export function TreatmentDetailModal({
  patientId,
  viewerRole,
  onClose,
}: TreatmentDetailModalProps) {
  // Lock body scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Treatment Detail"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl shadow-slate-950/60 overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 bg-slate-900/95 backdrop-blur shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">Treatment Detail</h2>
            <p className="text-slate-400 text-xs mt-0.5">Full clinical record</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <TreatmentDetailContent
            patientId={patientId}
            viewerRole={viewerRole}
            onClose={onClose}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}
