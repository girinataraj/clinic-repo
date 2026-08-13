import React, { useState } from 'react';
import { Dumbbell, Plus, ChevronDown, ChevronUp, AlertCircle, BookOpen, Search, X, Check, Filter, CheckSquare, Square, Loader2 } from 'lucide-react';
import { useExercises } from '../../hooks/useExercises';
import type { PatientExercise } from '../../hooks/useExercises';
import { useExerciseTemplates } from '../../hooks/useExerciseLibrary';
import type { ExerciseTemplate } from '../../hooks/useExerciseLibrary';
import { ExerciseCard } from './ExerciseCard';
import { ExerciseModal } from './ExerciseModal';
import { getExerciseImages } from '../../utils/exerciseImageMapper';

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
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<PatientExercise | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const {
    exercises,
    isLoading,
    createExercise,
    importBatchExercises,
    updateExercise,
    deleteExercise,
    duplicateExercise,
    reorderExercises,
    isSaving,
  } = useExercises(patientId, assessmentId);

  const { data: templates, isLoading: isTemplatesLoading } = useExerciseTemplates({ search: librarySearch.trim() || undefined });

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

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
    try {
      if (selectedExercise) {
        await updateExercise({ exerciseId: selectedExercise.id, payload });
        showToast('Exercise Updated Successfully', 'success');
      } else {
        const resolvedImages = getExerciseImages(payload.category || payload.bodyPart, payload.exerciseName || payload.exercise_name);
        await createExercise({
          ...payload,
          images: payload.images && payload.images.length > 0 ? payload.images : resolvedImages,
        });
        showToast('Exercise Added Successfully', 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err?.message || 'Unable to Save Exercise', 'error');
    }
  };

  const handleSingleImport = async (tmpl: ExerciseTemplate) => {
    try {
      const resolvedImages = getExerciseImages(tmpl.category, tmpl.name);
      await createExercise({
        exercise_name: tmpl.name,
        exerciseName: tmpl.name,
        category: tmpl.category || 'General',
        body_part: tmpl.category || 'General',
        bodyPart: tmpl.category || 'General',
        sets: tmpl.sets || 3,
        repetitions: tmpl.reps ? String(tmpl.reps) : '10-15',
        reps: tmpl.reps ? String(tmpl.reps) : '10-15',
        frequency: 'Once daily',
        difficulty_level: (tmpl.difficulty === 'Medium' ? 'Moderate' : tmpl.difficulty) as any,
        difficultyLevel: (tmpl.difficulty === 'Medium' ? 'Moderate' : tmpl.difficulty) as any,
        description: tmpl.instructions || '',
        video_url: tmpl.videoUrl || '',
        images: resolvedImages,
      });
      showToast('Exercise Imported Successfully', 'success');
    } catch (err: any) {
      showToast('Import Failed', 'error');
    }
  };

  const handleBatchImport = async () => {
    if (selectedTemplateIds.length === 0 || !templates) return;
    const selectedTemplates = templates.filter(t => selectedTemplateIds.includes(t.id));
    try {
      const payloadItems = selectedTemplates.map(tmpl => {
        const resolvedImages = getExerciseImages(tmpl.category, tmpl.name);
        return {
          exercise_name: tmpl.name,
          exerciseName: tmpl.name,
          category: tmpl.category || 'General',
          body_part: tmpl.category || 'General',
          bodyPart: tmpl.category || 'General',
          sets: tmpl.sets || 3,
          repetitions: tmpl.reps ? String(tmpl.reps) : '10-15',
          reps: tmpl.reps ? String(tmpl.reps) : '10-15',
          frequency: 'Once daily',
          difficulty_level: (tmpl.difficulty === 'Medium' ? 'Moderate' : tmpl.difficulty) as any,
          difficultyLevel: (tmpl.difficulty === 'Medium' ? 'Moderate' : tmpl.difficulty) as any,
          description: tmpl.instructions || '',
          video_url: tmpl.videoUrl || '',
          images: resolvedImages,
        };
      });
      await importBatchExercises(payloadItems);
      setSelectedTemplateIds([]);
      setIsLibraryOpen(false);
      showToast(`${payloadItems.length} Exercise(s) Imported Successfully`, 'success');
    } catch (err: any) {
      showToast('Import Failed', 'error');
    }
  };

  const toggleTemplateSelection = (tmplId: string) => {
    setSelectedTemplateIds(prev =>
      prev.includes(tmplId) ? prev.filter(id => id !== tmplId) : [...prev, tmplId]
    );
  };

  const handleDuplicateClick = async (ex: PatientExercise) => {
    try {
      await duplicateExercise(ex.id);
      showToast('Exercise Duplicated Successfully', 'success');
    } catch (err: any) {
      showToast('Unable to Duplicate Exercise', 'error');
    }
  };

  const handleDeleteClick = async (exerciseId: string) => {
    try {
      await deleteExercise(exerciseId);
      showToast('Exercise Deleted Successfully', 'success');
    } catch (err: any) {
      showToast('Unable to Delete Exercise', 'error');
    }
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



  const existingNames = new Set(exercises.map(e => (e.exerciseName || e.exercise_name || '').toLowerCase()));

  // Filter templates
  const filteredTemplates = (templates || []).filter(tmpl => {
    if (categoryFilter !== 'All' && tmpl.category !== categoryFilter) return false;
    if (difficultyFilter !== 'All' && tmpl.difficulty !== difficultyFilter) return false;
    return true;
  });

  const categoriesList = ['All', ...Array.from(new Set((templates || []).map(t => t.category).filter(Boolean)))];
  const difficultiesList = ['All', 'Easy', 'Moderate', 'Hard'];

  return (
    <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4 font-sans">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-between animate-in fade-in slide-in-from-top-2 ${
          toastMessage.type === 'error'
            ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 dark:text-rose-400'
            : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-300'
        }`}>
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

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
                type="button"
                onClick={() => setIsLibraryOpen(true)}
                disabled={exercises.length >= MAX_EXERCISES}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50 border border-slate-200 dark:border-slate-700"
              >
                <BookOpen className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Import from Library
              </button>
              <button
                type="button"
                onClick={handleAddClick}
                disabled={exercises.length >= MAX_EXERCISES}
                className="px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                <Plus className="w-4 h-4" /> Custom Exercise
              </button>
            </>
          )}

          <button
            type="button"
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
            <div className="py-8 text-center text-xs text-slate-400 animate-pulse flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-teal-500" /> Loading prescribed home exercises...
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
                    type="button"
                    onClick={() => setIsLibraryOpen(true)}
                    className="px-4 py-2 text-xs font-semibold bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-300 border border-teal-500/30 rounded-xl shadow-sm hover:bg-teal-50 dark:hover:bg-teal-950/40 transition-colors flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Import from Library
                  </button>
                  <button
                    type="button"
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
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
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
                    Search, filter, and import exercises to patient home programme
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsLibraryOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter Controls */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={librarySearch}
                  onChange={(e) => setLibrarySearch(e.target.value)}
                  placeholder="Search templates by exercise name or instructions..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              <div className="flex items-center gap-2 text-xs flex-wrap">
                <div className="flex items-center gap-1 text-slate-400 font-semibold">
                  <Filter className="w-3.5 h-3.5" /> Filters:
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-medium"
                >
                  {categoriesList.map(cat => <option key={cat} value={cat}>Category: {cat}</option>)}
                </select>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-medium"
                >
                  {difficultiesList.map(d => <option key={d} value={d}>Difficulty: {d}</option>)}
                </select>
              </div>
            </div>

            {/* Template List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {isTemplatesLoading ? (
                <div className="py-8 text-center text-xs text-slate-400 animate-pulse flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-teal-500" /> Loading library exercises...
                </div>
              ) : filteredTemplates && filteredTemplates.length > 0 ? (
                filteredTemplates.map((tmpl) => {
                  const isAdded = existingNames.has(tmpl.name.toLowerCase());
                  const isSelected = selectedTemplateIds.includes(tmpl.id);
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => !isAdded && toggleTemplateSelection(tmpl.id)}
                      className={`p-3.5 rounded-2xl border transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'bg-teal-500/10 border-teal-500/50'
                          : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 hover:border-teal-500/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {!isAdded && (
                          <div className="text-teal-600 dark:text-teal-400">
                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-400" />}
                          </div>
                        )}
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
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isAdded) handleSingleImport(tmpl);
                        }}
                        disabled={isAdded}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 shrink-0 ${
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
                  No exercise templates found matching search criteria.
                </div>
              )}
            </div>

            {/* Footer with Batch Import Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {selectedTemplateIds.length} exercise(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsLibraryOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                {selectedTemplateIds.length > 0 && (
                  <button
                    type="button"
                    onClick={handleBatchImport}
                    disabled={isSaving}
                    className="px-5 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white rounded-xl shadow-md shadow-teal-600/30 transition-all flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Import Selected ({selectedTemplateIds.length})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
