import React, { useState } from 'react';
import { Dumbbell, Plus, ChevronDown, ChevronUp, AlertCircle, BookOpen, Search, X, Check } from 'lucide-react';
import { useExercises } from '../../hooks/useExercises';
import type { PatientExercise } from '../../hooks/useExercises';
import { useExerciseTemplates } from '../../hooks/useExerciseLibrary';
import type { ExerciseTemplate } from '../../hooks/useExerciseLibrary';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseModal } from './ExerciseModal';

interface ExerciseSectionProps {
  patientId: string | null;
  assessmentId?: string | null;
  readOnly?: boolean;
}

export const ExerciseSection: React.FC<ExerciseSectionProps> = ({
  patientId,
  assessmentId,
  readOnly = false,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState<PatientExercise | null>(null);

  const {
    exercises,
    isLoading,
    createExercise,
    updateExercise,
    deleteExercise,
    duplicateExercise,
    reorderExercises,
    isSaving,
  } = useExercises(patientId, assessmentId);

  const { data: templates } = useExerciseTemplates({ search: librarySearch.trim() || undefined });

  const MAX_EXERCISES = 15;
  const WARNING_THRESHOLD = 10;

  const handleAddClick = () => {
    setSelectedExercise(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (ex: PatientExercise) => {
    setSelectedExercise(ex);
    setIsModalOpen(true);
  };

  const handleSaveModal = async (payload: Partial<PatientExercise>) => {
    if (selectedExercise) {
      await updateExercise({ exerciseId: selectedExercise.id, payload });
    } else {
      await createExercise(payload);
    }
  };

  const handleImportTemplate = async (tmpl: ExerciseTemplate) => {
    await createExercise({
      exercise_name: tmpl.name,
      exerciseName: tmpl.name,
      body_part: tmpl.category || 'General',
      bodyPart: tmpl.category || 'General',
      sets: tmpl.sets || 3,
      reps: tmpl.reps ? String(tmpl.reps) : (tmpl.duration ? String(tmpl.duration) : '10-15'),
      frequency: '2x daily',
      difficulty_level: (tmpl.difficulty === 'Medium' ? 'Moderate' : tmpl.difficulty) as any,
      difficultyLevel: (tmpl.difficulty === 'Medium' ? 'Moderate' : tmpl.difficulty) as any,
      description: tmpl.instructions || '',
      video_url: tmpl.videoUrl || '',
    });
  };

  const handleDuplicateClick = async (ex: PatientExercise) => {
    await duplicateExercise(ex.id);
  };

  const handleDeleteClick = async (exerciseId: string) => {
    await deleteExercise(exerciseId);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newItems = [...exercises];
    const temp = newItems[index];
    newItems[index] = newItems[index - 1];
    newItems[index - 1] = temp;

    const reorderedPayload = newItems.map((item, idx) => ({
      id: item.id,
      order_sequence: idx + 1,
    }));

    await reorderExercises(reorderedPayload);
  };

  const handleMoveDown = async (index: number) => {
    if (index === exercises.length - 1) return;
    const newItems = [...exercises];
    const temp = newItems[index];
    newItems[index] = newItems[index + 1];
    newItems[index + 1] = temp;

    const reorderedPayload = newItems.map((item, idx) => ({
      id: item.id,
      order_sequence: idx + 1,
    }));

    await reorderExercises(reorderedPayload);
  };

  if (!patientId) {
    return null;
  }

  const existingNames = new Set(exercises.map(e => (e.exerciseName || e.exercise_name || '').toLowerCase()));

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 font-sans">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-3 cursor-pointer select-none group"
        >
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-105 transition-transform">
            <Dumbbell className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Home Exercise Programme (Optional)
              </h3>
              {exercises.length > 0 && (
                <span className="px-2.5 py-0.5 text-xs font-bold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 rounded-full">
                  {exercises.length}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Prescribe home exercise routine for patient rehabilitation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && (
            <>
              <button
                onClick={() => setIsLibraryOpen(true)}
                disabled={exercises.length >= MAX_EXERCISES}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 border border-slate-200 dark:border-slate-700"
              >
                <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Import from Library
              </button>
              <button
                onClick={handleAddClick}
                disabled={exercises.length >= MAX_EXERCISES}
                className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Custom Exercise
              </button>
            </>
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Warnings & Counter Badges */}
      {!isCollapsed && exercises.length >= WARNING_THRESHOLD && (
        <div className="text-xs bg-amber-500/10 text-amber-800 dark:text-amber-300 p-3 rounded-2xl border border-amber-500/20 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            {exercises.length >= MAX_EXERCISES
              ? `Maximum limit of ${MAX_EXERCISES} exercises reached per assessment.`
              : `You have added ${exercises.length} exercises (Max ${MAX_EXERCISES}). Consider keeping home routines focused.`}
          </span>
        </div>
      )}

      {/* Main Content Area */}
      {!isCollapsed && (
        <div>
          {isLoading ? (
            <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
              Loading prescribed home exercises...
            </div>
          ) : exercises.length === 0 ? (
            <div className="py-10 text-center bg-slate-50 dark:bg-slate-950/50 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <Dumbbell className="w-8 h-8 text-slate-400 mx-auto stroke-[1.5]" />
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                No exercises added yet. Click "Import from Library" or "Custom Exercise" to add.
              </p>
              {!readOnly && (
                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    onClick={() => setIsLibraryOpen(true)}
                    className="px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded-xl shadow-sm hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Import from Library
                  </button>
                  <button
                    onClick={handleAddClick}
                    className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Custom Exercise
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {exercises.map((ex, idx) => (
                <ExerciseCard
                  key={ex.id}
                  exercise={ex}
                  index={idx}
                  total={exercises.length}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                  onDuplicate={handleDuplicateClick}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  readOnly={readOnly}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Custom Add / Edit Modal */}
      <ExerciseModal
        isOpen={isModalOpen}
        exercise={selectedExercise}
        onSave={handleSaveModal}
        onClose={() => setIsModalOpen(false)}
        isSaving={isSaving}
      />

      {/* Import from Master Library Modal */}
      {isLibraryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Import from Exercise Library
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select exercises from clinic template library to add to home programme
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsLibraryOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={librarySearch}
                onChange={(e) => setLibrarySearch(e.target.value)}
                placeholder="Search templates by exercise name or category..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
              />
            </div>

            {/* Template List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {templates && templates.length > 0 ? (
                templates.map((tmpl) => {
                  const isAdded = existingNames.has(tmpl.name.toLowerCase());
                  return (
                    <div
                      key={tmpl.id}
                      className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between gap-3 hover:border-teal-500/30 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {tmpl.name}
                          </span>
                          <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                            {tmpl.category}
                          </span>
                        </div>
                        {tmpl.instructions && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                            {tmpl.instructions}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => handleImportTemplate(tmpl)}
                        disabled={isAdded}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 shrink-0 ${
                          isAdded
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 cursor-default'
                            : 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" /> Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" /> Import
                          </>
                        )}
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  No exercise templates found in library.
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setIsLibraryOpen(false)}
                className="px-5 py-2 text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
