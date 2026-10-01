import React, { useState } from 'react';
import {
  Edit2, Copy, Trash2, Video, ArrowUp, ArrowDown,
  Info, ExternalLink, Image as ImageIcon
} from 'lucide-react';
import type { PatientExercise } from '../../hooks/useExercises';
import { ExerciseImageGallery } from './ExerciseImageGallery';

interface ExerciseCardProps {
  exercise: PatientExercise;
  index: number;
  total: number;
  onEdit: (exercise: PatientExercise) => void;
  onDelete: (exerciseId: string) => void;
  onDuplicate: (exercise: PatientExercise) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
  readOnly?: boolean;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  index,
  total,
  onEdit,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  readOnly = false,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const name = exercise.exerciseName || exercise.exercise_name || 'Exercise';
  const bodyPart = exercise.bodyPart || exercise.body_part;
  const difficulty = exercise.difficultyLevel || exercise.difficulty_level || 'Moderate';
  const videoUrl = exercise.videoUrl || exercise.video_url;
  const images = exercise.images || [];

  const getDifficultyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'easy':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'hard':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      case 'moderate':
      default:
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
    }
  };

  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-base text-slate-900 dark:text-white tracking-tight">
              {index + 1}. {name}
            </span>
            {bodyPart && (
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 rounded-full">
                {bodyPart}
              </span>
            )}
          </div>
          <span
            className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${getDifficultyColor(
              difficulty
            )}`}
          >
            {difficulty}
          </span>
        </div>

        {/* Sets, Reps & Frequency Pills */}
        <div className="flex flex-wrap gap-2 my-3">
          <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
            <span className="text-teal-600 dark:text-teal-400 font-bold">{exercise.sets}</span> Sets ×{' '}
            <span className="text-teal-600 dark:text-teal-400 font-bold">{exercise.reps}</span> Reps
          </div>
          <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold text-teal-700 dark:text-teal-300">
            Freq: {exercise.frequency}
          </div>
        </div>

        {/* Description / Instructions */}
        {exercise.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 italic">
            "{exercise.description}"
          </p>
        )}

        {/* Additional Notes */}
        {exercise.notes && (
          <div className="text-[11px] text-amber-700 dark:text-amber-300 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 flex items-center gap-1.5 mb-3">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{exercise.notes}</span>
          </div>
        )}

        {/* Media Attachments */}
        <div className="flex flex-col gap-3 text-xs mb-3">
          {videoUrl && (
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-teal-600 dark:text-teal-400 hover:underline font-semibold text-[11px]"
            >
              <Video className="w-3.5 h-3.5" /> Video Demo <ExternalLink className="w-3 h-3" />
            </a>
          )}
          
          <div className="mt-1">
            <ExerciseImageGallery category={bodyPart} exerciseName={name} />
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {!readOnly && (
        <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-1.5">
          {/* Reorder Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onMoveUp?.(index)}
              disabled={index === 0}
              title="Move Up"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onMoveDown?.(index)}
              disabled={index === total - 1}
              title="Move Down"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 shrink-0 ml-auto">
            <button
              onClick={() => onDuplicate(exercise)}
              className="px-2 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
              title="Copy / Duplicate Exercise"
            >
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
            <button
              onClick={() => onEdit(exercise)}
              className="px-2 py-1 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/50 rounded-lg transition-colors flex items-center gap-1"
              title="Edit Exercise"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="p-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
              title="Delete Exercise"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">Delete Exercise?</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Are you sure you want to remove <span className="font-semibold text-slate-800 dark:text-slate-200">"{name}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowConfirmDelete(false);
                  onDelete(exercise.id);
                }}
                className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-md shadow-rose-600/20 transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
