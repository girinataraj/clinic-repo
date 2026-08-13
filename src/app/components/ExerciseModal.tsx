import React, { useState, useEffect } from 'react';
import { X, Dumbbell, AlertCircle, Save } from 'lucide-react';
import type { PatientExercise } from '../../hooks/useExercises';
import { getExerciseImages } from '../../utils/exerciseImageMapper';

interface ExerciseModalProps {
  isOpen: boolean;
  exercise: PatientExercise | null;
  onSave: (data: Partial<PatientExercise>) => Promise<void>;
  onClose: () => void;
  isSaving?: boolean;
}

const CATEGORIES = [
  'General',
  'Shoulder',
  'Elbow',
  'Wrist',
  'Hip',
  'Knee',
  'Ankle',
  'Neck',
  'Upper Back',
  'Lower Back',
  'Core',
  'Cardio',
  'Rehabilitation',
];

const FREQUENCIES = [
  'Once daily',
  '2x daily',
  '3x daily',
  'Once every 2 days',
  '3x per week',
  '5x per week',
  'Daily',
  'As needed',
];

const STATUS_OPTIONS = ['Active', 'Completed', 'Discontinued'];

export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  isOpen,
  exercise,
  onSave,
  onClose,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState({
    exercise_name: '',
    category: 'General',
    description: '',
    frequency: 'Once daily',
    sets: 3,
    repetitions: '10-15',
    hold_time: '',
    duration: '',
    notes: '',
    status: 'Active',
    video_url: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (exercise) {
      setFormData({
        exercise_name: exercise.exerciseName || exercise.exercise_name || '',
        category: exercise.category || exercise.bodyPart || exercise.body_part || 'General',
        description: exercise.description || '',
        frequency: exercise.frequency || 'Once daily',
        sets: exercise.sets || 3,
        repetitions: exercise.repetitions || exercise.reps || '10-15',
        hold_time: exercise.holdTime || exercise.hold_time || '',
        duration: exercise.duration || '',
        notes: exercise.notes || '',
        status: exercise.status || 'Active',
        video_url: exercise.videoUrl || exercise.video_url || '',
      });
    } else {
      setFormData({
        exercise_name: '',
        category: 'General',
        description: '',
        frequency: 'Once daily',
        sets: 3,
        repetitions: '10-15',
        hold_time: '',
        duration: '',
        notes: '',
        status: 'Active',
        video_url: '',
      });
    }
    setErrors({});
  }, [exercise, isOpen]);

  if (!isOpen) return null;

  const isFormValid =
    formData.exercise_name.trim().length >= 2 &&
    formData.frequency.trim().length > 0 &&
    formData.sets >= 1 &&
    formData.repetitions.trim().length > 0;

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.exercise_name || formData.exercise_name.trim().length < 2) {
      errs.exercise_name = 'Exercise name is required (min 2 characters)';
    }
    if (formData.sets < 1 || formData.sets > 10) {
      errs.sets = 'Sets must be between 1 and 10';
    }
    if (!formData.repetitions || formData.repetitions.trim().length === 0) {
      errs.repetitions = 'Repetitions or duration is required';
    }
    if (!formData.frequency) {
      errs.frequency = 'Frequency is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const autoImgs = getExerciseImages(formData.category, formData.exercise_name);
      await onSave({
        exercise_name: formData.exercise_name.trim(),
        exerciseName: formData.exercise_name.trim(),
        category: formData.category,
        body_part: formData.category,
        bodyPart: formData.category,
        description: formData.description.trim(),
        frequency: formData.frequency,
        sets: Number(formData.sets),
        repetitions: formData.repetitions.trim(),
        reps: formData.repetitions.trim(),
        hold_time: formData.hold_time.trim(),
        holdTime: formData.hold_time.trim(),
        duration: formData.duration.trim(),
        notes: formData.notes.trim(),
        status: formData.status,
        video_url: formData.video_url.trim(),
        videoUrl: formData.video_url.trim(),
        images: exercise?.images && exercise.images.length > 0 ? exercise.images : autoImgs,
      });
      onClose();
    } catch (err: any) {
      console.error('Failed to save exercise:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto font-sans">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Dumbbell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {exercise ? 'Edit Prescribed Exercise' : 'Add Custom Exercise'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prescribe exercise details for patient home programme
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Exercise Name */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Exercise Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.exercise_name}
              onChange={(e) => {
                setFormData({ ...formData, exercise_name: e.target.value });
                if (errors.exercise_name) setErrors({ ...errors, exercise_name: '' });
              }}
              placeholder="e.g., Shoulder Flexion, Quad Sets, Wall Slides"
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 ${
                errors.exercise_name
                  ? 'border-rose-500 ring-rose-500/20'
                  : 'border-slate-200 dark:border-slate-800 focus:ring-teal-500/30'
              }`}
            />
            {errors.exercise_name && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3" /> {errors.exercise_name}
              </p>
            )}
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Category / Body Part
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Frequency, Sets & Repetitions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Frequency <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.frequency}
                onChange={(e) => {
                  setFormData({ ...formData, frequency: e.target.value });
                  if (errors.frequency) setErrors({ ...errors, frequency: '' });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              >
                {FREQUENCIES.map((freq) => (
                  <option key={freq} value={freq}>
                    {freq}
                  </option>
                ))}
              </select>
              {errors.frequency && <p className="text-[11px] text-rose-500 mt-1">{errors.frequency}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Sets (1 - 10) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.sets}
                onChange={(e) => {
                  setFormData({ ...formData, sets: parseInt(e.target.value, 10) || 1 });
                  if (errors.sets) setErrors({ ...errors, sets: '' });
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
              {errors.sets && <p className="text-[11px] text-rose-500 mt-1">{errors.sets}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Repetitions <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.repetitions}
                onChange={(e) => {
                  setFormData({ ...formData, repetitions: e.target.value });
                  if (errors.repetitions) setErrors({ ...errors, repetitions: '' });
                }}
                placeholder="e.g. 10-15 reps"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
              {errors.repetitions && <p className="text-[11px] text-rose-500 mt-1">{errors.repetitions}</p>}
            </div>
          </div>

          {/* Hold Time & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hold Time (Optional)
              </label>
              <input
                type="text"
                value={formData.hold_time}
                onChange={(e) => setFormData({ ...formData, hold_time: e.target.value })}
                placeholder="e.g. 5 seconds"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total Duration (Optional)
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g. 10 minutes"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>
          </div>

          {/* Description & Instructions */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Form Instructions
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Step-by-step instructions for performing the exercise correctly..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30 resize-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Precautions / Notes
            </label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Stop if sharp pain occurs; keep elbow tucked"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !isFormValid}
              className="px-6 py-2.5 font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-lg shadow-teal-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Exercise'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
