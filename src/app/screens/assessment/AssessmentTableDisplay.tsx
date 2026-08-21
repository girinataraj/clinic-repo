import React from 'react';
import { Heart, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

interface VitalSigns {
  bloodPressure?: string;
  pulseRate?: number | null;
  spo2?: number | null;
  temperature?: number | null;
  ejectionFraction?: number | null;
}

interface SymptomItem {
  value: boolean;
  notes: string;
}

interface Symptoms {
  [key: string]: SymptomItem;
}

type NumericField = number | '';

interface ClinicalExamination {
  specialTests?: string[];
  findings?: string;
  musclePower?: {
    rightUpper?: number;
    leftUpper?: number;
    rightLower?: number;
    leftLower?: number;
  };
  // Controlled numeric inputs hold '' while empty, so the stored ROM values are
  // number | '' — not just number.
  rom?: {
    cervical?: { flexion?: NumericField; extension?: NumericField };
    lumbar?: { flexion?: NumericField; extension?: NumericField };
    shoulder?: { abduction?: NumericField; rotation?: NumericField };
  };
}

const SYMPTOM_LABELS: Record<string, string> = {
  hang_arm: 'Difficulty hanging arm',
  pain_over: 'Pain over joint/area',
  glass_water: 'Difficulty holding a glass of water',
  numbness_over: 'Numbness over joint/area',
  pain_increased: 'Pain increased during movement',
  pain_radiating: 'Pain radiating down limb',
  weakness_sense: 'Sense of weakness in muscles'
};

// ── 1. Vital Signs Table ───────────────────────────────────────────────────
export function VitalSignsTable({ vitals }: { vitals: VitalSigns | undefined }) {
  if (!vitals) return <div className="text-sm text-slate-400">No Vitals recorded</div>;

  const parseBP = (bpStr?: string) => {
    if (!bpStr) return { status: 'Normal', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    const parts = bpStr.split('/');
    if (parts.length !== 2) return { status: 'Unknown', color: 'bg-slate-100 text-slate-650' };
    const sys = parseInt(parts[0], 10);
    const dia = parseInt(parts[1], 10);
    if (sys >= 140 || dia >= 90) {
      return { status: 'High', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    }
    if (sys < 90 || dia < 60) {
      return { status: 'Low', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    return { status: 'Normal', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const getPulseStatus = (pr?: number | null) => {
    if (pr === null || pr === undefined) return { status: 'Unknown', color: 'bg-slate-100 text-slate-650' };
    if (pr < 60) return { status: 'Bradycardia (Low)', color: 'bg-amber-100 text-amber-850 border-amber-200' };
    if (pr > 100) return { status: 'Tachycardia (High)', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    return { status: 'Normal', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const getSpO2Status = (spo2?: number | null) => {
    if (spo2 === null || spo2 === undefined) return { status: 'Unknown', color: 'bg-slate-100 text-slate-650' };
    if (spo2 < 95) return { status: 'Hypoxia (Low)', color: 'bg-rose-100 text-rose-850 border-rose-250 animate-pulse' };
    return { status: 'Normal', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const getTempStatus = (temp?: number | null) => {
    if (temp === null || temp === undefined) return { status: 'Unknown', color: 'bg-slate-100 text-slate-650' };
    if (temp > 99.5) return { status: 'Fever (High)', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    if (temp < 96.5) return { status: 'Hypothermia (Low)', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { status: 'Normal', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const getEFStatus = (ef?: number | null) => {
    if (ef === null || ef === undefined) return { status: 'Unknown', color: 'bg-slate-100 text-slate-650' };
    if (ef < 50) return { status: 'Low (Reduced)', color: 'bg-rose-100 text-rose-800 border-rose-200' };
    return { status: 'Normal', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  const rows = [
    { name: 'Blood Pressure', val: vitals.bloodPressure || '—', unit: 'mmHg', range: '90/60 - 139/89', ...parseBP(vitals.bloodPressure) },
    { name: 'Pulse Rate', val: vitals.pulseRate ?? '—', unit: 'bpm', range: '60 - 100', ...getPulseStatus(vitals.pulseRate) },
    { name: 'SpO2 Level', val: vitals.spo2 ? `${vitals.spo2}%` : '—', unit: '%', range: '95 - 100', ...getSpO2Status(vitals.spo2) },
    { name: 'Body Temperature', val: vitals.temperature ? `${vitals.temperature} °F` : '—', unit: '°F', range: '97.0 - 99.5', ...getTempStatus(vitals.temperature) },
    { name: 'Ejection Fraction', val: vitals.ejectionFraction ? `${vitals.ejectionFraction}%` : '—', unit: '%', range: '50 - 70', ...getEFStatus(vitals.ejectionFraction) }
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-55 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <th className="px-4 py-3">Parameter</th>
            <th className="px-4 py-3">Value</th>
            <th className="px-4 py-3">Unit</th>
            <th className="px-4 py-3">Normal Range</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
          {rows.map((row) => (
            <tr key={row.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{row.name}</td>
              <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">{row.val}</td>
              <td className="px-4 py-3 text-slate-500 font-medium">{row.unit}</td>
              <td className="px-4 py-3 text-slate-500 font-medium">{row.range}</td>
              <td className="px-4 py-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${row.color}`}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 2. Symptom Checklist ──────────────────────────────────────────────────
export function SymptomChecklist({ symptoms }: { symptoms: Symptoms | undefined }) {
  if (!symptoms) return <div className="text-sm text-slate-400">No Symptoms recorded</div>;

  const list = Object.entries(SYMPTOM_LABELS).map(([key, label]) => {
    const item = symptoms[key] || { value: false, notes: '' };
    return {
      key,
      label,
      present: item.value,
      notes: item.notes
    };
  });

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-55 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <th className="px-4 py-3">Symptom Description</th>
            <th className="px-4 py-3 text-center">Present</th>
            <th className="px-4 py-3">Clinical Notes / Context</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
          {list.map((row) => (
            <tr key={row.key} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{row.label}</td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                  row.present 
                    ? 'bg-rose-100 text-rose-800 border-rose-200' 
                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                }`}>
                  {row.present ? <AlertTriangle size={10} /> : <ShieldCheck size={10} />}
                  {row.present ? 'Yes' : 'No'}
                </span>
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400 font-medium italic">
                {row.notes?.trim() ? row.notes : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 3. Clinical Examination Table ─────────────────────────────────────────
export function ClinicalExaminationTable({ exam }: { exam: ClinicalExamination | undefined }) {
  if (!exam) return <div className="text-sm text-slate-400">No Clinical Examination recorded</div>;

  const mp = exam.musclePower || {};
  const rom = exam.rom || {};

  const rows = [
    { test: 'Muscle Power: Right Upper Limb', val: mp.rightUpper ?? '—', range: '0 - 5', interpret: (mp.rightUpper ?? 0) === 5 ? 'Normal Power' : 'Reduced Power' },
    { test: 'Muscle Power: Left Upper Limb', val: mp.leftUpper ?? '—', range: '0 - 5', interpret: (mp.leftUpper ?? 0) === 5 ? 'Normal Power' : 'Reduced Power' },
    { test: 'Muscle Power: Right Lower Limb', val: mp.rightLower ?? '—', range: '0 - 5', interpret: (mp.rightLower ?? 0) === 5 ? 'Normal Power' : 'Reduced Power' },
    { test: 'Muscle Power: Left Lower Limb', val: mp.leftLower ?? '—', range: '0 - 5', interpret: (mp.leftLower ?? 0) === 5 ? 'Normal Power' : 'Reduced Power' },
    { test: 'Cervical ROM (Flexion / Extension)', val: `${rom.cervical?.flexion ?? '—'}° / ${rom.cervical?.extension ?? '—'}°`, range: '0-45° / 0-45°', interpret: 'Flexion/Extension capacity' },
    { test: 'Lumbar ROM (Flexion / Extension)', val: `${rom.lumbar?.flexion ?? '—'}° / ${rom.lumbar?.extension ?? '—'}°`, range: '0-60° / 0-25°', interpret: 'Flexion/Extension capacity' },
    { test: 'Shoulder ROM (Abduction / Rotation)', val: `${rom.shoulder?.abduction ?? '—'}° / ${rom.shoulder?.rotation ?? '—'}°`, range: '0-180° / 0-90°', interpret: 'Abduction/Rotation capacity' },
    { test: 'Special Diagnostic Tests', val: exam.specialTests?.length ? exam.specialTests.join(', ') : 'None', range: 'Custom', interpret: 'Pathology verification' },
    { test: 'Clinical Findings & Remarks', val: exam.findings || 'No notes', range: 'Text', interpret: 'Diagnostic conclusion' }
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-55 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            <th className="px-4 py-3">Examination Segment</th>
            <th className="px-4 py-3">Result / Grade</th>
            <th className="px-4 py-3">Normal Values</th>
            <th className="px-4 py-3">Clinical Assessment</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
          {rows.map((row) => (
            <tr key={row.test} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
              <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">{row.test}</td>
              <td className="px-4 py-3 font-extrabold text-slate-900 dark:text-white">{row.val}</td>
              <td className="px-4 py-3 text-slate-500 font-medium">{row.range}</td>
              <td className="px-4 py-3 text-slate-655 dark:text-slate-400 font-semibold">{row.interpret}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
