import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import {
  ArrowLeft,
  Plus,
  Dumbbell,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  Save,
  Clock,
  Repeat,
  Info,
} from 'lucide-react';

interface Exercise {
  id: number;
  name: string;
  sets: string;
  reps: string;
  duration: string;
  instructions: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

const initialExercises: Exercise[] = [
  { id: 1, name: 'Quad Sets', sets: '3', reps: '15', duration: '10 sec hold', instructions: 'Lie flat. Tighten quadriceps. Hold for 10 seconds and release slowly.', category: 'Strengthening', difficulty: 'Easy' },
  { id: 2, name: 'Straight Leg Raise', sets: '3', reps: '12', duration: '30 min session', instructions: 'Lie on back. Raise leg 45°. Hold 3 sec. Lower slowly. Keep knee straight.', category: 'Strengthening', difficulty: 'Easy' },
  { id: 3, name: 'Terminal Knee Extension', sets: '2', reps: '20', duration: '20 min session', instructions: 'Use resistance band. Stand with band behind knee. Fully extend knee. Return slowly.', category: 'Strengthening', difficulty: 'Medium' },
  { id: 4, name: 'Hip Bridges', sets: '3', reps: '15', duration: '15 min session', instructions: 'Lie on back, knees bent. Lift hips to form straight line. Hold 2 sec. Lower slowly.', category: 'Core', difficulty: 'Medium' },
];

const categories = ['Strengthening', 'Flexibility', 'Balance', 'Core', 'Cardio'];
const difficulties = ['Easy', 'Medium', 'Hard'] as const;

const difficultyColors = {
  Easy: { bg: '#DEF2F1', color: '#2B7A78', border: '#DEF2F1' },
  Medium: { bg: '#FEFFFF', color: '#3AAFA9', border: '#DEF2F1' },
  Hard: { bg: '#17252A', color: '#FEFFFF', border: '#17252A' },
};

const categoryColors: Record<string, string> = {
  Strengthening: '#3AAFA9',
  Flexibility: '#2B7A78',
  Balance: '#17252A',
  Core: '#3AAFA9',
  Cardio: '#2B7A78',
};

export function ExercisePrescription() {
  const navigate = useNavigate();
  const location = useLocation();
  const isPatientView = location.pathname.startsWith('/patient');
  const navRole = isPatientView ? 'patient' : 'doctor';
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);
  const [newExercise, setNewExercise] = useState<Omit<Exercise, 'id'>>({
    name: '', sets: '', reps: '', duration: '', instructions: '', category: 'Strengthening', difficulty: 'Easy',
  });

  const handleAdd = () => {
    if (!newExercise.name) return;
    setExercises([...exercises, { ...newExercise, id: Date.now() }]);
    setNewExercise({ name: '', sets: '', reps: '', duration: '', instructions: '', category: 'Strengthening', difficulty: 'Easy' });
    setShowAddForm(false);
  };

  const handleDelete = (id: number) => {
    setExercises(exercises.filter((e) => e.id !== id));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-col h-full saai-page" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#DEF2F1' }}>
      {/* Header */}
      <div
        className="px-6 pb-6 shrink-0 rounded-b-3xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2B7A78 0%, #3AAFA9 100%)',
          paddingTop: '32px',
          boxShadow: '0 4px 24px rgba(43, 122, 120, 0.15)',
        }}
      >
        <div className="absolute -right-16 -top-16 rounded-full opacity-10"
          style={{ width: '200px', height: '200px', background: '#FEFFFF' }} />
          
        <div className="flex items-center justify-between mb-6 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20"
            style={{ width: '40px', height: '40px', background: 'rgba(254,255,255,0.15)' }}>
            <ArrowLeft size={20} color="#FEFFFF" />
          </button>
          <div className="text-center">
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#FEFFFF' }}>Exercise Prescription</h1>
            <p style={{ fontSize: '13px', color: 'rgba(254,255,255,0.8)' }}>Active Recovery Plan · Rahul Verma</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20"
            style={{ width: '40px', height: '40px', background: 'rgba(254,255,255,0.15)' }}>
            <Plus size={20} color="#FEFFFF" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-3 relative z-10">
          {[
            { label: 'Exercises', value: exercises.length },
            { label: 'Sets Total', value: exercises.reduce((a, e) => a + parseInt(e.sets || '0'), 0) },
            { label: 'Duration', value: '45 min' },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center py-3 rounded-2xl backdrop-blur-sm"
              style={{ background: 'rgba(254,255,255,0.15)', border: '1px solid rgba(254,255,255,0.2)' }}>
              <p style={{ fontSize: '20px', fontWeight: 800, color: '#FEFFFF' }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: 'rgba(254,255,255,0.8)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-4xl mx-auto w-full">

        {/* Add Exercise Form */}
        {showAddForm && (
          <div className="p-5 rounded-2xl mb-5" style={{ background: '#FEFFFF', boxShadow: '0 4px 20px rgba(23, 37, 42, 0.08)', border: '1px solid #DEF2F1' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#DEF2F1' }}>
                <Plus size={16} color="#3AAFA9" />
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#17252A' }}>Add New Exercise</h3>
            </div>

            <div className="mb-4">
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#2B7A78', display: 'block', marginBottom: '8px' }}>Exercise Name *</label>
              <input
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                placeholder="e.g. Quad Stretch"
                className="w-full outline-none"
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #DEF2F1', background: '#FEFFFF', color: '#17252A', fontSize: '14px' }}
              />
            </div>

            <div className="flex gap-3 mb-4">
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#2B7A78', display: 'block', marginBottom: '8px' }}>Sets</label>
                <input
                  type="number"
                  value={newExercise.sets}
                  onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })}
                  placeholder="3"
                  className="w-full outline-none text-center"
                  style={{ padding: '12px', borderRadius: '12px', border: '1px solid #DEF2F1', background: '#FEFFFF', color: '#17252A', fontSize: '14px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#2B7A78', display: 'block', marginBottom: '8px' }}>Reps</label>
                <input
                  type="number"
                  value={newExercise.reps}
                  onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                  placeholder="15"
                  className="w-full outline-none text-center"
                  style={{ padding: '12px', borderRadius: '12px', border: '1px solid #DEF2F1', background: '#FEFFFF', color: '#17252A', fontSize: '14px' }}
                />
              </div>
              <div style={{ flex: 1.5 }}>
                <label style={{ fontSize: '13px', fontWeight: 600, color: '#2B7A78', display: 'block', marginBottom: '8px' }}>Duration</label>
                <input
                  value={newExercise.duration}
                  onChange={(e) => setNewExercise({ ...newExercise, duration: e.target.value })}
                  placeholder="e.g. 10 sec"
                  className="w-full outline-none"
                  style={{ padding: '12px', borderRadius: '12px', border: '1px solid #DEF2F1', background: '#FEFFFF', color: '#17252A', fontSize: '14px' }}
                />
              </div>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#2B7A78', display: 'block', marginBottom: '8px' }}>Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewExercise({ ...newExercise, category: cat })}
                    className="px-4 py-1.5 rounded-xl transition-all"
                    style={{
                      fontSize: '13px', fontWeight: 600,
                      background: newExercise.category === cat ? categoryColors[cat] : '#DEF2F1',
                      color: newExercise.category === cat ? '#FEFFFF' : '#2B7A78',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div className="mb-4">
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#2B7A78', display: 'block', marginBottom: '8px' }}>Difficulty</label>
              <div className="flex gap-3">
                {difficulties.map((d) => {
                  const colors = difficultyColors[d];
                  return (
                    <button
                      key={d}
                      onClick={() => setNewExercise({ ...newExercise, difficulty: d })}
                      className="flex-1 py-2.5 rounded-xl transition-all"
                      style={{
                        fontSize: '13px', fontWeight: 600,
                        background: newExercise.difficulty === d ? colors.bg : '#FEFFFF',
                        color: newExercise.difficulty === d ? colors.color : '#2B7A78',
                        border: `1px solid ${newExercise.difficulty === d ? colors.border : '#DEF2F1'}`,
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instructions */}
            <div className="mb-5">
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#2B7A78', display: 'block', marginBottom: '8px' }}>Instructions</label>
              <textarea
                value={newExercise.instructions}
                onChange={(e) => setNewExercise({ ...newExercise, instructions: e.target.value })}
                placeholder="Step-by-step instructions for patient..."
                className="w-full outline-none resize-none"
                style={{ padding: '12px 16px', borderRadius: '12px', border: '1px solid #DEF2F1', background: '#FEFFFF', color: '#17252A', fontSize: '14px', minHeight: '80px' }}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3.5 rounded-2xl transition-colors hover:bg-slate-200"
                style={{ background: '#DEF2F1', color: '#2B7A78', fontSize: '14px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-transform hover:-translate-y-1"
                style={{ background: 'linear-gradient(135deg, #2B7A78, #3AAFA9)', color: '#FEFFFF', fontSize: '14px', fontWeight: 600, boxShadow: '0 4px 16px rgba(43, 122, 120, 0.3)' }}
              >
                <Plus size={18} />
                Add Exercise
              </button>
            </div>
          </div>
        )}

        {/* Exercise List */}
        <div className="flex flex-col gap-4">
          {exercises.map((exercise) => {
            const isExpanded = expandedId === exercise.id;
            const diffColors = difficultyColors[exercise.difficulty];
            const catColor = categoryColors[exercise.category] || '#3AAFA9';
            return (
              <div key={exercise.id} className="rounded-2xl overflow-hidden"
                style={{ background: '#FEFFFF', border: '1px solid #DEF2F1', boxShadow: '0 4px 16px rgba(23, 37, 42, 0.03)' }}>
                {/* Exercise header */}
                <div className="flex items-center gap-4 p-4">
                  <div className="flex items-center justify-center rounded-2xl shrink-0"
                    style={{ width: '48px', height: '48px', background: `${catColor}15` }}>
                    <Dumbbell size={20} color={catColor} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}>{exercise.name}</p>
                      <span className="px-2 py-0.5 rounded-md"
                        style={{ background: diffColors.bg, color: diffColors.color, fontSize: '10px', fontWeight: 700, border: `1px solid ${diffColors.border}` }}>
                        {exercise.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <div className="flex items-center gap-1.5">
                        <Repeat size={12} color="#2B7A78" />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#2B7A78' }}>
                          {exercise.sets} × {exercise.reps} reps
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock size={12} color="#2B7A78" />
                        <span style={{ fontSize: '12px', color: '#2B7A78' }}>{exercise.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!isPatientView && (
                      <button onClick={() => handleDelete(exercise.id)}
                        className="flex items-center justify-center rounded-xl transition-colors hover:bg-rose-100"
                        style={{ width: '36px', height: '36px', background: '#FFF1F2' }}>
                        <Trash2 size={16} color="#E11D48" />
                      </button>
                    )}
                    <button onClick={() => setExpandedId(isExpanded ? null : exercise.id)}
                      className="flex items-center justify-center rounded-xl transition-colors hover:bg-sky-100"
                      style={{ width: '36px', height: '36px', background: '#DEF2F1' }}>
                      {isExpanded ? <ChevronUp size={16} color="#2B7A78" /> : <ChevronDown size={16} color="#2B7A78" />}
                    </button>
                  </div>
                </div>

                {/* Expanded instructions */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t"
                    style={{ borderColor: '#DEF2F1' }}>
                    <div className="mt-4 flex items-start gap-3 p-4 rounded-xl"
                      style={{ background: '#DEF2F1', border: '1px solid #DEF2F1' }}>
                      <Info size={16} color="#2B7A78" style={{ marginTop: '2px', flexShrink: 0 }} />
                      <p style={{ fontSize: '13px', color: '#17252A', lineHeight: 1.6 }}>
                        {exercise.instructions}
                      </p>
                    </div>
                    <div className="mt-3">
                      <span className="px-3 py-1.5 rounded-lg"
                        style={{ background: `${catColor}15`, color: catColor, fontSize: '12px', fontWeight: 600 }}>
                        {exercise.category}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Save button */}
        {!isPatientView && (
          <button
            onClick={handleSave}
            className="mt-6 w-full py-4 rounded-2xl flex items-center justify-center gap-2 transition-transform hover:-translate-y-1"
            style={{
              background: saved
                ? 'linear-gradient(135deg, #10B981, #059669)'
                : 'linear-gradient(135deg, #2B7A78, #3AAFA9)',
              color: '#FEFFFF', fontSize: '16px', fontWeight: 700,
              boxShadow: saved ? '0 8px 24px rgba(16, 185, 129, 0.3)' : '0 8px 24px rgba(43, 122, 120, 0.3)',
              marginBottom: '16px',
            }}
          >
            {saved ? <><Check size={20} />Plan Saved!</> : <><Save size={20} />Save Exercise Plan</>}
          </button>
        )}
      </div>

      <div className="md:hidden" style={{ borderTop: '1px solid #DEF2F1', background: '#FEFFFF' }}>
        <BottomNav role={navRole} />
      </div>
    </div>
  );
}