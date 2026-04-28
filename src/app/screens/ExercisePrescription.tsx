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
  Easy: { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' },
  Medium: { bg: '#fff7ed', color: '#ea580c', border: '#fed7aa' },
  Hard: { bg: '#fff1f2', color: '#e11d48', border: '#fecdd3' },
};

const categoryColors: Record<string, string> = {
  Strengthening: '#4338ca',
  Flexibility: '#0f766e',
  Balance: '#d97706',
  Core: '#7c3aed',
  Cardio: '#e11d48',
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
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 pb-5 shrink-0"
        style={{
          background: 'linear-gradient(135deg, #3b0764 0%, #7c3aed 70%, #8b5cf6 100%)',
          paddingTop: '20px',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-xl"
            style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={18} color="white" />
          </button>
          <div className="text-center">
            <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'white' }}>Exercise Prescription</h1>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Active Recovery Plan · Rahul Verma</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center justify-center rounded-xl"
            style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)' }}>
            <Plus size={18} color="white" />
          </button>
        </div>

        {/* Stats */}
        <div className="flex gap-3">
          {[
            { label: 'Exercises', value: exercises.length },
            { label: 'Sets Total', value: exercises.reduce((a, e) => a + parseInt(e.sets || '0'), 0) },
            { label: 'Duration', value: '45 min' },
          ].map((s) => (
            <div key={s.label} className="flex-1 text-center py-2 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.15)' }}>
              <p style={{ fontSize: '18px', fontWeight: 900, color: 'white' }}>{s.value}</p>
              <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-4xl mx-auto w-full" style={{ background: '#f5f3ff' }}>

        {/* Add Exercise Form */}
        {showAddForm && (
          <div className="p-4 rounded-2xl mb-4" style={{ background: 'white', boxShadow: '0 4px 16px rgba(124,58,237,0.15)', border: '1.5px solid #e9d5ff' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="rounded-xl flex items-center justify-center" style={{ width: '32px', height: '32px', background: '#f5f3ff' }}>
                <Plus size={16} color="#7c3aed" />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Add New Exercise</h3>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Exercise Name *</label>
              <input
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                placeholder="e.g. Quad Stretch"
                className="w-full outline-none"
                style={{ padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '14px' }}
              />
            </div>

            <div className="flex gap-2 mb-3">
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Sets</label>
                <input
                  type="number"
                  value={newExercise.sets}
                  onChange={(e) => setNewExercise({ ...newExercise, sets: e.target.value })}
                  placeholder="3"
                  className="w-full outline-none text-center"
                  style={{ padding: '11px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '14px' }}
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Reps</label>
                <input
                  type="number"
                  value={newExercise.reps}
                  onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                  placeholder="15"
                  className="w-full outline-none text-center"
                  style={{ padding: '11px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '14px' }}
                />
              </div>
              <div style={{ flex: 1.5 }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Duration</label>
                <input
                  value={newExercise.duration}
                  onChange={(e) => setNewExercise({ ...newExercise, duration: e.target.value })}
                  placeholder="e.g. 10 sec"
                  className="w-full outline-none"
                  style={{ padding: '11px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Category */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Category</label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNewExercise({ ...newExercise, category: cat })}
                    className="px-3 py-1 rounded-xl"
                    style={{
                      fontSize: '12px', fontWeight: 700,
                      background: newExercise.category === cat ? categoryColors[cat] : '#f1f5f9',
                      color: newExercise.category === cat ? 'white' : '#64748b',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Difficulty</label>
              <div className="flex gap-2">
                {difficulties.map((d) => {
                  const colors = difficultyColors[d];
                  return (
                    <button
                      key={d}
                      onClick={() => setNewExercise({ ...newExercise, difficulty: d })}
                      className="flex-1 py-2 rounded-xl"
                      style={{
                        fontSize: '12px', fontWeight: 700,
                        background: newExercise.difficulty === d ? colors.bg : '#f8fafc',
                        color: newExercise.difficulty === d ? colors.color : '#94a3b8',
                        border: `1.5px solid ${newExercise.difficulty === d ? colors.border : 'transparent'}`,
                      }}
                    >
                      {d}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Instructions */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>Instructions</label>
              <textarea
                value={newExercise.instructions}
                onChange={(e) => setNewExercise({ ...newExercise, instructions: e.target.value })}
                placeholder="Step-by-step instructions for patient..."
                className="w-full outline-none resize-none"
                style={{ padding: '11px 14px', borderRadius: '12px', border: '1.5px solid #e2e8f0', background: '#f8fafc', fontSize: '13px', minHeight: '70px' }}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 rounded-xl"
                style={{ background: '#f1f5f9', color: '#64748b', fontSize: '14px', fontWeight: 700 }}
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-3 rounded-xl flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #8b5cf6)', color: 'white', fontSize: '14px', fontWeight: 700 }}
              >
                <Plus size={16} />
                Add Exercise
              </button>
            </div>
          </div>
        )}

        {/* Exercise List */}
        <div className="flex flex-col gap-3">
          {exercises.map((exercise) => {
            const isExpanded = expandedId === exercise.id;
            const diffColors = difficultyColors[exercise.difficulty];
            const catColor = categoryColors[exercise.category] || '#4338ca';
            return (
              <div key={exercise.id} className="rounded-2xl overflow-hidden"
                style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                {/* Exercise header */}
                <div className="flex items-center gap-3 p-4">
                  <div className="flex items-center justify-center rounded-2xl shrink-0"
                    style={{ width: '44px', height: '44px', background: `${catColor}15` }}>
                    <Dumbbell size={20} color={catColor} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{exercise.name}</p>
                      <span className="px-1.5 py-0.5 rounded-lg"
                        style={{ background: diffColors.bg, color: diffColors.color, fontSize: '10px', fontWeight: 700, border: `1px solid ${diffColors.border}` }}>
                        {exercise.difficulty}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1">
                        <Repeat size={11} color="#94a3b8" />
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#475569' }}>
                          {exercise.sets} × {exercise.reps} reps
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={11} color="#94a3b8" />
                        <span style={{ fontSize: '11px', color: '#94a3b8' }}>{exercise.duration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!isPatientView && (
                      <button onClick={() => handleDelete(exercise.id)}
                        className="flex items-center justify-center rounded-xl"
                        style={{ width: '30px', height: '30px', background: '#fff1f2' }}>
                        <Trash2 size={14} color="#e11d48" />
                      </button>
                    )}
                    <button onClick={() => setExpandedId(isExpanded ? null : exercise.id)}
                      className="flex items-center justify-center rounded-xl"
                      style={{ width: '30px', height: '30px', background: '#f5f3ff' }}>
                      {isExpanded ? <ChevronUp size={14} color="#7c3aed" /> : <ChevronDown size={14} color="#7c3aed" />}
                    </button>
                  </div>
                </div>

                {/* Expanded instructions */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t"
                    style={{ borderColor: '#f1f5f9' }}>
                    <div className="mt-3 flex items-start gap-2 p-3 rounded-xl"
                      style={{ background: '#f5f3ff' }}>
                      <Info size={14} color="#7c3aed" style={{ marginTop: '1px', flexShrink: 0 }} />
                      <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                        {exercise.instructions}
                      </p>
                    </div>
                    <div className="mt-2">
                      <span className="px-2 py-1 rounded-lg"
                        style={{ background: `${catColor}15`, color: catColor, fontSize: '11px', fontWeight: 700 }}>
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
            className="mt-4 w-full py-4 rounded-2xl flex items-center justify-center gap-2"
            style={{
              background: saved
                ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #7c3aed, #8b5cf6)',
              color: 'white', fontSize: '16px', fontWeight: 700,
              boxShadow: '0 8px 24px rgba(124,58,237,0.3)',
              marginBottom: '8px',
            }}
          >
            {saved ? <><Check size={18} />Plan Saved!</> : <><Save size={18} />Save Exercise Plan</>}
          </button>
        )}
      </div>

      <div className="md:hidden">
        <BottomNav role={navRole} />
      </div>
    </div>
  );
}