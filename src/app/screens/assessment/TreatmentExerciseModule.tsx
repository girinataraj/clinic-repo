import React, { useState, useRef } from 'react';
import { SectionCard } from './FormComponents';
import {
  Dumbbell,
  Plus,
  Trash2,
  Edit2,
  FileText,
  Film,
  Paperclip,
  X,
  UploadCloud,
  Check,
  Eye,
  Sparkles,
} from 'lucide-react';
import type {
  TreatmentPlanData,
  TreatmentPlanExerciseItem,
  TreatmentPlanExerciseAttachment,
} from './clinicalConfig';

interface TreatmentExerciseModuleProps {
  treatmentPlan: TreatmentPlanData;
  setTreatmentPlan: (plan: TreatmentPlanData) => void;
  isDoctorRole?: boolean;
}

const COMMON_EXERCISES_BY_CATEGORY: Record<string, string[]> = {
  Shoulder: ['Shoulder Flexion Wall Slides', 'Pendulum Exercises', 'Scapular Retraction', 'External Rotation with Band'],
  Elbow: ['Biceps Stretch', 'Wrist Extension Stretch', 'Forearm Supination/Pronation'],
  Wrist: ['Wrist Flexion/Extension', 'Radial/Ulnar Deviation', 'Grip Strengthening'],
  Hip: ['Clamshells', 'Glute Bridges', 'Hip Abduction Straight Leg Raise'],
  Knee: ['Quad Sets', 'Short Arc Quads', 'Terminal Knee Extension (TKE)', 'Hamstring Curl'],
  Ankle: ['Ankle Alphabet', 'Ankle Pumps', 'Calf Stretch', 'Towel Scrunches'],
  Neck: ['Chin Tucks', 'Neck Lateral Flexion Stretch', 'Isometric Neck Press'],
  Back: ['Cat-Cow Stretch', 'McKenzie Extension', 'Bird-Dog', 'Pelvic Tilts'],
};

export function TreatmentExerciseModule({
  treatmentPlan,
  setTreatmentPlan,
  isDoctorRole,
}: TreatmentExerciseModuleProps) {
  const accent = isDoctorRole ? 'doctor' : 'emerald';
  const iconColor = isDoctorRole ? 'text-[#262842]' : 'text-emerald-600';
  const buttonBg = isDoctorRole
    ? 'bg-[#262842] hover:bg-[#343759] text-white shadow-indigo-900/20'
    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20';

  const exercises = treatmentPlan.exercises || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [exerciseName, setExerciseName] = useState('');
  const [category, setCategory] = useState('General');
  const [sets, setSets] = useState<number | string>(3);
  const [reps, setReps] = useState('10 - 12 reps');
  const [holdTime, setHoldTime] = useState('5 sec');
  const [frequency, setFrequency] = useState('2x daily');
  const [notes, setNotes] = useState('');
  const [attachments, setAttachments] = useState<TreatmentPlanExerciseAttachment[]>([]);
  const [dragActive, setDragActive] = useState(false);

  // Preview Modal State
  const [previewAttachment, setPreviewAttachment] = useState<TreatmentPlanExerciseAttachment | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const openAddModal = () => {
    setEditingId(null);
    setExerciseName('');
    setCategory('General');
    setSets(3);
    setReps('10 - 12 reps');
    setHoldTime('5 sec');
    setFrequency('2x daily');
    setNotes('');
    setAttachments([]);
    setIsModalOpen(true);
  };

  const openEditModal = (item: TreatmentPlanExerciseItem) => {
    setEditingId(item.id);
    setExerciseName(item.exerciseName);
    setCategory(item.category || 'General');
    setSets(item.sets || 3);
    setReps(item.reps || '10 - 12 reps');
    setHoldTime(item.holdTime || '5 sec');
    setFrequency(item.frequency || '2x daily');
    setNotes(item.notes || item.instructions || '');
    setAttachments(item.attachments || []);
    setIsModalOpen(true);
  };

  const deleteExercise = (id: string) => {
    const updated = exercises.filter((ex) => ex.id !== id);
    setTreatmentPlan({ ...treatmentPlan, exercises: updated });
  };

  // Convert File to Base64
  const processFiles = (fileList: FileList | File[]) => {
    const filesArray = Array.from(fileList);
    filesArray.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newAttachment: TreatmentPlanExerciseAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          type: file.type,
          size: file.size,
          dataUrl,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exerciseName.trim()) return;

    const newItem: TreatmentPlanExerciseItem = {
      id: editingId || `ex-tp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      exerciseName: exerciseName.trim(),
      category,
      sets,
      reps,
      holdTime,
      frequency,
      notes: notes.trim(),
      instructions: notes.trim(),
      attachments,
    };

    let updatedExercises: TreatmentPlanExerciseItem[];
    if (editingId) {
      updatedExercises = exercises.map((ex) => (ex.id === editingId ? newItem : ex));
    } else {
      updatedExercises = [...exercises, newItem];
    }

    setTreatmentPlan({
      ...treatmentPlan,
      exercises: updatedExercises,
    });

    setIsModalOpen(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <SectionCard
      icon={<Dumbbell size={18} className={`${iconColor} dark:text-emerald-400`} />}
      title="Exercise Prescriptions"
      subtitle="Prescribe patient exercises with custom media & multi-file attachments"
      accent={accent}
    >
      <div className="space-y-4 font-sans">
        {/* Header bar with counter & add button */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Prescribed List ({exercises.length})
            </span>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${buttonBg}`}
          >
            <Plus size={15} /> Add Exercise
          </button>
        </div>

        {/* Exercises Cards Grid */}
        {exercises.length === 0 ? (
          <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-slate-50/50 dark:bg-slate-900/30">
            <Dumbbell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No exercises added yet</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Click &quot;Add Exercise&quot; to prescribe exercises and attach single or multiple files.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {exercises.map((item) => {
              const attCount = item.attachments?.length || 0;

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1">
                          {item.category || 'General'}
                        </span>
                        <h4 className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
                          {item.exerciseName}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteExercise(item.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Meta specs */}
                    <div className="flex flex-wrap gap-2 mt-2 text-[11px] font-medium text-slate-600 dark:text-slate-350">
                      {item.sets && (
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 rounded-md font-bold">
                          {item.sets} Sets
                        </span>
                      )}
                      {item.reps && (
                        <span className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded-md font-bold">
                          {item.reps}
                        </span>
                      )}
                      {item.holdTime && (
                        <span className="px-2 py-0.5 bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 rounded-md font-bold">
                          Hold: {item.holdTime}
                        </span>
                      )}
                      {item.frequency && (
                        <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 rounded-md font-bold">
                          {item.frequency}
                        </span>
                      )}
                    </div>

                    {item.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 italic">
                        &quot;{item.notes}&quot;
                      </p>
                    )}
                  </div>

                  {/* Attachments preview row */}
                  {attCount > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Paperclip size={12} className="text-teal-500" /> {attCount} attached file
                        {attCount > 1 ? 's' : ''}
                      </span>
                      <div className="flex items-center gap-1 overflow-x-auto max-w-[150px]">
                        {item.attachments?.map((att) => (
                          <button
                            key={att.id}
                            type="button"
                            onClick={() => setPreviewAttachment(att)}
                            className="w-6 h-6 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 overflow-hidden hover:scale-105 transition-transform"
                            title={att.name}
                          >
                            {att.type.startsWith('image/') ? (
                              <img src={att.dataUrl} alt={att.name} className="w-full h-full object-cover" />
                            ) : att.type.startsWith('video/') ? (
                              <Film size={11} className="text-purple-500" />
                            ) : (
                              <FileText size={11} className="text-blue-500" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Add / Edit Exercise Modal ────────────────────────────────────── */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 my-8">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Dumbbell className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {editingId ? 'Edit Exercise Prescription' : 'Add New Prescribed Exercise'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Configure parameters and select single/multiple files from system
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSave} className="space-y-3.5 text-xs">
                {/* Category & Common Quick Suggestions */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Body Part / Joint Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  >
                    {['General', 'Shoulder', 'Elbow', 'Wrist', 'Hip', 'Knee', 'Ankle', 'Neck', 'Back', 'Rehabilitation'].map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>

                  {/* Quick exercise chips */}
                  {COMMON_EXERCISES_BY_CATEGORY[category] && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {COMMON_EXERCISES_BY_CATEGORY[category].map((exSuggestion) => (
                        <button
                          key={exSuggestion}
                          type="button"
                          onClick={() => setExerciseName(exSuggestion)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-200 dark:border-emerald-800/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors flex items-center gap-1"
                        >
                          <Sparkles size={10} /> {exSuggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Exercise Name */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Exercise Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                    placeholder="e.g., Shoulder Flexion Wall Slides, Quad Sets"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 font-semibold"
                  />
                </div>

                {/* Parameters: Sets, Reps, Hold, Frequency */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Sets</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={sets}
                      onChange={(e) => setSets(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Reps</label>
                    <input
                      type="text"
                      value={reps}
                      onChange={(e) => setReps(e.target.value)}
                      placeholder="10-12 reps"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-center font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Hold Time</label>
                    <input
                      type="text"
                      value={holdTime}
                      onChange={(e) => setHoldTime(e.target.value)}
                      placeholder="5 sec"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-center font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                    <input
                      type="text"
                      value={frequency}
                      onChange={(e) => setFrequency(e.target.value)}
                      placeholder="2x daily"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-center font-semibold"
                    />
                  </div>
                </div>

                {/* Instructions / Notes */}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Form Instructions / Clinical Precautions
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Provide step-by-step guidance for the patient..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                  />
                </div>

                {/* ── FILE ATTACHMENT SECTION (SINGLE & MULTIPLE FILES) ──────────────── */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Paperclip size={14} className="text-emerald-500" />
                      Attach Files (Single or Multiple)
                    </label>
                    <span className="text-[10px] text-slate-400">
                      Images, Videos, PDFs, Guides
                    </span>
                  </div>

                  {/* Hidden File Input with multiple attribute */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,video/*,application/pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  {/* Drag & Drop Zone */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`p-4 rounded-2xl border-2 border-dashed cursor-pointer transition-colors text-center ${
                      dragActive
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                        : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400 bg-slate-50/50 dark:bg-slate-950/50'
                    }`}
                  >
                    <UploadCloud className="w-7 h-7 text-emerald-500 mx-auto mb-1 animate-bounce" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Click to choose files or drop single/multiple files here
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      Select one or multiple files from your system (PNG, JPG, MP4, PDF)
                    </p>
                  </div>

                  {/* Attachments List */}
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Selected Files ({attachments.length}):
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[160px] overflow-y-auto p-1">
                        {attachments.map((att) => (
                          <div
                            key={att.id}
                            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-800/70 flex items-center justify-between gap-2"
                          >
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden shrink-0">
                                {att.type.startsWith('image/') ? (
                                  <img
                                    src={att.dataUrl}
                                    alt={att.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : att.type.startsWith('video/') ? (
                                  <Film size={14} className="text-purple-500" />
                                ) : (
                                  <FileText size={14} className="text-blue-500" />
                                )}
                              </div>
                              <div className="overflow-hidden">
                                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                                  {att.name}
                                </p>
                                <p className="text-[9px] text-slate-400 font-medium">
                                  {formatFileSize(att.size)}
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeAttachment(att.id);
                              }}
                              className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 ${buttonBg}`}
                  >
                    <Check size={16} /> Save Exercise
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ── File Preview Modal ─────────────────────────────────────────────── */}
        {previewAttachment && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-emerald-500" />
                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate max-w-md">
                    {previewAttachment.name}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewAttachment(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="max-h-[70vh] overflow-auto flex items-center justify-center p-2 bg-slate-950/50 rounded-2xl">
                {previewAttachment.type.startsWith('image/') ? (
                  <img
                    src={previewAttachment.dataUrl}
                    alt={previewAttachment.name}
                    className="max-h-[60vh] max-w-full object-contain rounded-xl"
                  />
                ) : previewAttachment.type.startsWith('video/') ? (
                  <video
                    src={previewAttachment.dataUrl}
                    controls
                    className="max-h-[60vh] max-w-full rounded-xl"
                  />
                ) : (
                  <div className="p-8 text-center text-white space-y-3">
                    <FileText className="w-12 h-12 mx-auto text-blue-400" />
                    <p className="text-sm font-bold">{previewAttachment.name}</p>
                    <a
                      href={previewAttachment.dataUrl}
                      download={previewAttachment.name}
                      className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs"
                    >
                      Download Document
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
