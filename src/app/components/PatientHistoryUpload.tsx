import { useState, useRef, useCallback } from 'react';
import { useUploadPatientHistory, usePatientHistory } from '../../hooks/usePatients';
import {
  Upload, X, ImagePlus, Loader2, CheckCircle, AlertTriangle, Trash2, Eye,
} from 'lucide-react';

interface PatientHistoryUploadProps {
  patientId: string;
  patientName?: string;
  onClose?: () => void;
}

export function PatientHistoryUpload({ patientId, patientName, onClose }: PatientHistoryUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useUploadPatientHistory();
  const { data: existingHistory = [], isLoading: historyLoading } = usePatientHistory(patientId);

  const handleFilesSelected = useCallback((files: FileList | null) => {
    if (!files) return;
    setUploadError(null);
    setUploadSuccess(false);

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        setUploadError('Only image files are allowed (JPG, PNG, HEIC).');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Each file must be under 10MB.');
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setPreviews((prev) => [...prev, ...newPreviews]);
  }, []);

  const removeFile = useCallback((index: number) => {
    URL.revokeObjectURL(previews[index]);
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }, [previews]);

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setUploadError('Please select at least one image.');
      return;
    }
    setUploadError(null);
    try {
      await uploadMutation.mutateAsync({ patientId, files: selectedFiles });
      setUploadSuccess(true);
      // Cleanup previews
      previews.forEach((url) => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviews([]);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err: any) {
      setUploadError(err?.response?.data?.message ?? 'Upload failed. Please try again.');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-extrabold text-slate-900 dark:text-white">Upload History</h3>
          {patientName && (
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Patient: <strong>{patientName}</strong>
            </p>
          )}
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
            <X size={16} className="text-slate-400" />
          </button>
        )}
      </div>

      {/* Drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); handleFilesSelected(e.dataTransfer.files); }}
        className="flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors"
      >
        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center">
          <ImagePlus size={22} className="text-teal-600 dark:text-teal-400" />
        </div>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Tap or drag to add photos</p>
        <p className="text-[10px] text-slate-400 font-semibold">JPG, PNG, HEIC — max 10MB each</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFilesSelected(e.target.files)}
        className="hidden"
      />

      {/* Selected previews */}
      {selectedFiles.length > 0 && (
        <div>
          <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-2">
            {selectedFiles.length} file{selectedFiles.length !== 1 ? 's' : ''} selected
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full min-w-0">
            {previews.map((url, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={url} alt={`Preview ${i + 1}`} className="w-full h-24 object-cover" />
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                  className="absolute top-1 right-1 p-1 rounded-lg bg-red-500/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
                <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] font-semibold px-1.5 py-0.5 truncate">
                  {selectedFiles[i]?.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {uploadError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertTriangle size={13} className="text-red-500 shrink-0" />
          <p className="text-[11px] font-semibold text-red-700 dark:text-red-400">{uploadError}</p>
        </div>
      )}

      {/* Success */}
      {uploadSuccess && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle size={13} className="text-emerald-500 shrink-0" />
          <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Files uploaded successfully!</p>
        </div>
      )}

      {/* Upload button */}
      {selectedFiles.length > 0 && (
        <button
          onClick={handleUpload}
          disabled={uploadMutation.isPending}
          className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50 transition-opacity"
          style={{ background: 'linear-gradient(135deg, #0f766e, #0d9488)' }}
        >
          {uploadMutation.isPending ? (
            <><Loader2 size={16} className="animate-spin" /> Uploading…</>
          ) : (
            <><Upload size={16} /> Upload {selectedFiles.length} Photo{selectedFiles.length !== 1 ? 's' : ''}</>
          )}
        </button>
      )}

      {/* Existing history */}
      <div>
        <h4 className="text-[13px] font-extrabold text-slate-900 dark:text-white mb-2">Uploaded History</h4>
        {historyLoading && (
          <div className="flex items-center gap-2 py-4">
            <Loader2 size={14} className="animate-spin text-teal-600" />
            <span className="text-[11px] text-slate-500">Loading history…</span>
          </div>
        )}
        {!historyLoading && existingHistory.length === 0 && (
          <div className="text-center py-6 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <ImagePlus size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-[11px] text-slate-400 font-semibold">No history files uploaded yet</p>
          </div>
        )}
        {!historyLoading && existingHistory.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full min-w-0">
            {existingHistory.map((item) => (
              <div
                key={item.id}
                onClick={() => item.url && setViewImage(item.url)}
                className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 cursor-pointer group"
              >
                <img src={item.url} alt={item.filename} className="w-full h-24 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <Eye size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[8px] font-semibold px-1.5 py-0.5 truncate">
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {viewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setViewImage(null)}>
          <button className="absolute top-4 right-4 p-2 rounded-full bg-white/20 text-white hover:bg-white/30">
            <X size={20} />
          </button>
          <img src={viewImage} alt="History" className="max-w-full max-h-[85vh] rounded-2xl object-contain" />
        </div>
      )}
    </div>
  );
}
