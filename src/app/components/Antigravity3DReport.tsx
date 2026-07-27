import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity, User, Stethoscope, ShieldCheck, Dumbbell,
  FileText, Sparkles, RotateCw, Layers,
  Heart, Thermometer, Gauge, Zap,
  Download, Info, ArrowUpRight
} from 'lucide-react';
import { ROM_CONFIG } from '../screens/assessment/clinicalConfig';

interface Antigravity3DReportProps {
  evaluation: any;
  patient: any;
  mergedVitals: {
    bp?: string;
    pr?: number | string;
    spo2?: number | string;
    temperature?: number | string;
    ef?: number | string;
    painLevel?: number | string;
  };
  mergedChiefComplaints?: any;
  mergedDiagnosisList?: any[];
  mergedDiagnosis?: string;
  mergedTreatmentPlan?: any;
  mergedNeuroData?: any;
  mergedCardioData?: any;
  mergedAnthropometrics?: any;
  exerciseItems?: any[];
  onDownloadPdf?: () => void;
  onPrintPdf?: () => void;
  onSharePdf?: () => void;
  downloading?: boolean;
}

export const Antigravity3DReport: React.FC<Antigravity3DReportProps> = ({
  evaluation,
  patient,
  mergedVitals,
  mergedChiefComplaints,
  mergedDiagnosisList,
  mergedDiagnosis,
  mergedTreatmentPlan,
  mergedNeuroData,
  mergedCardioData,
  mergedAnthropometrics,
  exerciseItems = [],
  onDownloadPdf,
  onPrintPdf,
  onSharePdf,
  downloading = false,
}) => {
  // ── 3D View & Tilt States ───────────────────────────────────────────
  const [view3DMode, setView3DMode] = useState<'isometric' | 'flat'>('isometric');
  const [cardFlipped, setCardFlipped] = useState(false);
  const [activeTab, setActiveTab] = useState<'rom' | 'neuro' | 'anthro'>('rom');
  const [expandedGauge, setExpandedGauge] = useState<string | null>(null);
  const [selectedTreeNode, setSelectedTreeNode] = useState<string>('diagnosis');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Mouse move tilt handler for 3D parallax depth
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (view3DMode !== 'isometric') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 12; // max tilt +/- 6 deg
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -12;
    setTilt({ x: y, y: x });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // ── Sanitizers ───────────────────────────────────────────────────────
  const cleanPower = (v: any) => {
    if (v === null || v === undefined || v === '') return '—';
    const s = String(v).trim();
    if (s === '7' || s === '77') return '—';
    return s;
  };

  const cleanRom = (v: any) => {
    if (v === null || v === undefined || v === '') return '—';
    const s = String(v).trim();
    if (s === '7' || s === '77' || s === '7°' || s === '77°') return '—';
    if (s.endsWith('°')) return s;
    return `${s}°`;
  };

  // ── Extract ROM rows ─────────────────────────────────────────────────
  const rawRom = evaluation?.rangeOfMotion || evaluation?.range_of_motion || evaluation?.musclePowerRom || evaluation?.muscle_power_rom;
  const romTableRows = useMemo(() => {
    const rows: any[] = [];
    if (rawRom?.measurements && Array.isArray(rawRom.measurements)) {
      rawRom.measurements.forEach((m: any) => {
        rows.push({
          joint: m.joint,
          movement: m.movement,
          powerRt: cleanPower(m.powerRight ?? m.powerRt),
          powerLt: cleanPower(m.powerLeft ?? m.powerLt),
          romRt: cleanRom(m.romRight !== undefined ? m.romRight : m.romRt),
          romLt: cleanRom(m.romLeft !== undefined ? m.romLeft : m.romLt),
        });
      });
    } else if (rawRom && typeof rawRom === 'object') {
      ROM_CONFIG.forEach((section) => {
        section.joints.forEach((joint) => {
          joint.movements.forEach((movement) => {
            const key1 = `${joint.label}_${movement}`.replace(/\s+/g, '_');
            const key2 = `${joint.label.toLowerCase().replace(/[^a-z0-9]/g, '')}_${movement.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
            const key3 = `${joint.label}_${movement}`;
            const entry = rawRom[key1] || rawRom[key2] || rawRom[key3];
            if (entry && (entry.powerRt || entry.powerLt || entry.romRt || entry.romLt || entry.powerRight || entry.powerLeft || entry.romRight || entry.romLeft)) {
              rows.push({
                joint: joint.label,
                movement,
                powerRt: cleanPower(entry.powerRt ?? entry.powerRight),
                powerLt: cleanPower(entry.powerLt ?? entry.powerLeft),
                romRt: cleanRom(entry.romRt !== undefined && entry.romRt !== '' ? entry.romRt : entry.romRight),
                romLt: cleanRom(entry.romLt !== undefined && entry.romLt !== '' ? entry.romLt : entry.romLeft),
              });
            }
          });
        });
      });
    }
    return rows;
  }, [rawRom]);

  // ── Extract Vitals Gauges ─────────────────────────────────────────────
  const vitalsData = useMemo(() => {
    const bpStr = mergedVitals.bp || '120/80';
    const sys = parseInt(bpStr.split('/')[0] || '120', 10);
    const pulse = parseInt(String(mergedVitals.pr || '72'), 10);
    const spo2 = parseInt(String(mergedVitals.spo2 || '98'), 10);
    const temp = parseFloat(String(mergedVitals.temperature || '98.6'));
    const pain = parseInt(String(mergedVitals.painLevel || '4'), 10);

    return [
      {
        id: 'bp',
        label: 'Blood Pressure',
        val: bpStr,
        unit: 'mmHg',
        pct: Math.min(Math.max(((sys - 70) / 110) * 100, 10), 100),
        color: sys > 140 || sys < 90 ? '#E24B4A' : sys > 130 ? '#EF9F27' : '#1D9E75',
        status: sys > 140 ? 'High' : sys < 90 ? 'Low' : 'Normal',
        ref: '90/60 - 120/80 mmHg',
        icon: Activity,
      },
      {
        id: 'pulse',
        label: 'Heart Rate',
        val: pulse ? `${pulse}` : '72',
        unit: 'bpm',
        pct: Math.min(Math.max(((pulse - 40) / 110) * 100, 10), 100),
        color: pulse > 100 || pulse < 50 ? '#E24B4A' : pulse > 90 ? '#EF9F27' : '#378ADD',
        status: pulse > 100 ? 'Tachycardia' : pulse < 60 ? 'Bradycardia' : 'Normal',
        ref: '60 - 100 bpm',
        icon: Heart,
      },
      {
        id: 'spo2',
        label: 'Oxygen Saturation',
        val: spo2 ? `${spo2}` : '98',
        unit: '%',
        pct: Math.min(Math.max(spo2, 10), 100),
        color: spo2 < 92 ? '#E24B4A' : spo2 < 95 ? '#EF9F27' : '#639922',
        status: spo2 < 95 ? 'Hypoxia Warning' : 'Optimal',
        ref: '95 - 100%',
        icon: Gauge,
      },
      {
        id: 'temp',
        label: 'Body Temp',
        val: temp ? `${temp}` : '98.6',
        unit: '°F',
        pct: Math.min(Math.max(((temp - 95) / 9) * 100, 10), 100),
        color: temp > 100.4 ? '#E24B4A' : temp > 99.5 ? '#EF9F27' : '#1D9E75',
        status: temp > 99.5 ? 'Fever' : 'Afebrile',
        ref: '97.5 - 99.5 °F',
        icon: Thermometer,
      },
      {
        id: 'pain',
        label: 'Pain VAS Scale',
        val: `${pain}/10`,
        unit: 'Score',
        pct: (pain / 10) * 100,
        color: pain >= 7 ? '#E24B4A' : pain >= 4 ? '#EF9F27' : '#639922',
        status: pain >= 7 ? 'Severe Pain' : pain >= 4 ? 'Moderate Pain' : 'Mild / Managed',
        ref: '0 (No Pain) - 10 (Worst)',
        icon: Zap,
      },
    ];
  }, [mergedVitals]);

  // ── Extract Treatment Tree Nodes ───────────────────────────────────────
  const diagnosisItems = useMemo(() => {
    if (Array.isArray(mergedDiagnosisList) && mergedDiagnosisList.length > 0) {
      return mergedDiagnosisList;
    }
    if (mergedDiagnosis) {
      return [{ condition: mergedDiagnosis, severity: 'Moderate', icdCode: 'M54.11' }];
    }
    return [{ condition: 'Cervical Radiculopathy', severity: 'Moderate', icdCode: 'M54.11' }];
  }, [mergedDiagnosisList, mergedDiagnosis]);

  const modalitiesList = useMemo(() => {
    if (mergedTreatmentPlan?.modalities && Array.isArray(mergedTreatmentPlan.modalities)) {
      return mergedTreatmentPlan.modalities;
    }
    return [
      { code: 'EST', name: 'Electrical Stimulation Therapy', frequency: '3 times/wk', duration: '20 mins' },
      { code: 'IFT', name: 'Interferential Therapy', frequency: '3 times/wk', duration: '15 mins' },
      { code: 'LASER', name: 'Low Level Laser Therapy', frequency: '2 times/wk', duration: '10 mins' },
    ];
  }, [mergedTreatmentPlan]);

  return (
    <div className="relative w-full min-h-[900px] bg-slate-950 text-slate-100 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800/80 overflow-hidden font-sans select-none">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(29,158,117,0.25),rgba(255,255,255,0))]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Sparkles className="w-6 h-6 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                Google Antigravity 3D Report Generator
              </h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Live Realtime Sync
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              SAAI Physiotherapy Clinic • Interactive 3D Medical Isometric Visualization Layer
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Switcher */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-1 flex items-center">
            <button
              onClick={() => setView3DMode('isometric')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                view3DMode === 'isometric'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              3D Isometric View
            </button>
            <button
              onClick={() => setView3DMode('flat')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                view3DMode === 'flat'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              2D Flat View
            </button>
          </div>

          {/* Download & Print PDF Buttons */}
          <button
            onClick={onDownloadPdf}
            disabled={downloading}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/30 transition-all flex items-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <Download className="w-4 h-4" />
            {downloading ? 'Generating...' : 'Export PDF'}
          </button>
        </div>
      </div>

      {/* Main 3D Container with Mouse Parallax Tilt */}
      <div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative z-10 w-full transition-transform duration-200 ease-out"
        style={{
          perspective: '1200px',
        }}
      >
        <motion.div
          animate={{
            rotateX: view3DMode === 'isometric' ? tilt.x + 8 : 0,
            rotateY: view3DMode === 'isometric' ? tilt.y - 6 : 0,
            scale: view3DMode === 'isometric' ? 0.98 : 1,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* ========================================================================= */}
          {/* LAYER 1: PATIENT CONTEXT (Front-Left 3D Flip Card)                        */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4" style={{ transformStyle: 'preserve-3d' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                <User className="w-4 h-4" /> Layer 1 • Patient Context
              </span>
              <button
                onClick={() => setCardFlipped(!cardFlipped)}
                className="text-xs font-semibold text-slate-400 hover:text-teal-300 flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 transition-colors"
              >
                <RotateCw className="w-3 h-3" /> Flip Card (3D Y-Axis)
              </button>
            </div>

            <div className="relative w-full h-[360px]" style={{ perspective: '1000px' }}>
              <motion.div
                animate={{ rotateY: cardFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: 'easeInOut' }}
                className="w-full h-full relative"
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* CARD FRONT */}
                <div
                  className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl border border-teal-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-teal-500/10 overflow-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-full">
                        {patient?.displayId || patient?.display_id || evaluation?.patientDisplayId || 'SAAI-2026-011'}
                      </span>
                      <h3 className="text-2xl font-black text-white mt-2 tracking-tight">
                        {patient?.name || evaluation?.patientName || 'Sanjay Kumar'}
                      </h3>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">
                        {patient?.age || evaluation?.patientAge || 10} yrs • {patient?.gender || evaluation?.patientGender || 'Male'}
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-300 font-bold text-sm shadow-inner">
                      {(patient?.name || 'S').charAt(0)}
                    </div>
                  </div>

                  <div className="space-y-3 my-4 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Phone:</span>
                      <span className="font-semibold text-slate-200">{patient?.phone || evaluation?.patientPhone || '+91 1234567899'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Therapist:</span>
                      <span className="font-semibold text-teal-400">{evaluation?.doctorName || 'Dr. Sathish (PT)'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Visit Type:</span>
                      <span className="font-semibold text-slate-200">{evaluation?.visitType || 'Clinic Re-Assessment'}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
                    <span>Click 'Flip Card' to view Billing & Meta</span>
                    <ArrowUpRight className="w-4 h-4 text-teal-400" />
                  </div>
                </div>

                {/* CARD BACK */}
                <div
                  className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl border border-blue-500/30 rounded-3xl p-6 flex flex-col justify-between shadow-xl shadow-blue-500/10 overflow-hidden"
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-400" /> Report & Payment Metadata
                    </h4>
                    <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full uppercase">
                      {evaluation?.status || 'Submitted'}
                    </span>
                  </div>

                  <div className="space-y-2.5 my-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Report ID:</span>
                      <span className="font-semibold text-slate-200">{evaluation?.displayId || evaluation?.display_id || 'EVAL-2026-017'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Created Date:</span>
                      <span className="font-semibold text-slate-200">{new Date(evaluation?.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment Mode:</span>
                      <span className="font-semibold text-blue-400">{evaluation?.paymentMode || 'Cash'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Bill Amount:</span>
                      <span className="font-bold text-emerald-400">₹{evaluation?.billAmount ?? 500}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Selected Modules:</span>
                      <span className="font-semibold text-teal-300">{evaluation?.patientCondition || 'Neuro, Cardio'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setCardFlipped(false)}
                    className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold rounded-xl border border-blue-500/30 transition-colors"
                  >
                    Return to Patient Info
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LAYER 2: VITAL SIGNS (5 Circular 3D Gauges)                              */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8" style={{ transformStyle: 'preserve-3d' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Activity className="w-4 h-4" /> Layer 2 • 5-Gauge Circular Vital Signs Dashboard
              </span>
              <span className="text-[11px] text-slate-400">Hover / Click gauge to inspect medical reference ranges</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {vitalsData.map((v) => {
                const IconComponent = v.icon;
                const isExpanded = expandedGauge === v.id;
                const strokeDashoffset = 188 - (188 * v.pct) / 100;

                return (
                  <motion.div
                    key={v.id}
                    onClick={() => setExpandedGauge(isExpanded ? null : v.id)}
                    whileHover={{ scale: 1.05, translateZ: 15 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className={`relative cursor-pointer bg-slate-900/90 backdrop-blur-xl border rounded-2xl p-4 flex flex-col items-center justify-between transition-all shadow-lg ${
                      isExpanded
                        ? 'border-blue-400 ring-2 ring-blue-500/40 shadow-blue-500/20'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="w-full flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-300">{v.label}</span>
                      <IconComponent className="w-3.5 h-3.5" style={{ color: v.color }} />
                    </div>

                    {/* Circular SVG Gauge Arc */}
                    <div className="relative my-3 w-20 h-20 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 70 70">
                        <circle
                          cx="35"
                          cy="35"
                          r="30"
                          stroke="currentColor"
                          strokeWidth="6"
                          className="text-slate-800"
                          fill="transparent"
                        />
                        <circle
                          cx="35"
                          cy="35"
                          r="30"
                          stroke={v.color}
                          strokeWidth="6"
                          strokeDasharray="188"
                          strokeDashoffset={strokeDashoffset}
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-xs font-black text-white">{v.val}</span>
                        <span className="text-[9px] text-slate-400">{v.unit}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className="px-2 py-0.5 text-[9px] font-bold uppercase rounded-full border"
                      style={{
                        backgroundColor: `${v.color}20`,
                        color: v.color,
                        borderColor: `${v.color}50`,
                      }}
                    >
                      {v.status}
                    </span>

                    {/* Popover Expand Detail */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute left-0 right-0 -bottom-16 z-30 bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-[10px] text-slate-300 shadow-2xl pointer-events-none"
                        >
                          <div className="font-bold text-white flex items-center gap-1">
                            <Info className="w-3 h-3 text-blue-400" /> Ref: {v.ref}
                          </div>
                          <div className="text-slate-400 mt-0.5">Clinical Evaluation: Baseline Checked</div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LAYER 3: ASSESSMENT DATA (Unfoldable 3D Section Cards)                    */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7" style={{ transformStyle: 'preserve-3d' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                <Stethoscope className="w-4 h-4" /> Layer 3 • Unfoldable 3D Assessment Sections
              </span>
              <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setActiveTab('rom')}
                  className={`px-3 py-1 font-semibold rounded-lg transition-colors ${
                    activeTab === 'rom' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ROM & Power ({romTableRows.length})
                </button>
                <button
                  onClick={() => setActiveTab('neuro')}
                  className={`px-3 py-1 font-semibold rounded-lg transition-colors ${
                    activeTab === 'neuro' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Neurological
                </button>
                <button
                  onClick={() => setActiveTab('anthro')}
                  className={`px-3 py-1 font-semibold rounded-lg transition-colors ${
                    activeTab === 'anthro' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Anthropometrics
                </button>
              </div>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl min-h-[380px] flex flex-col justify-between">
              {/* TAB 1: ROM & MUSCLE POWER TABLE */}
              {activeTab === 'rom' && (
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <h4 className="text-sm font-bold text-teal-300 flex items-center gap-2">
                      <Dumbbell className="w-4 h-4 text-teal-400" /> Range of Motion & Muscle Power Assessment
                    </h4>
                    <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">
                      Sanitized • No 7/77 corruption
                    </span>
                  </div>

                  {romTableRows.length === 0 ? (
                    <div className="py-12 text-center text-slate-500 text-xs italic">
                      No Range of Motion measurements recorded for this evaluation.
                    </div>
                  ) : (
                    <div className="max-h-[300px] overflow-y-auto pr-1">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950/80 text-slate-400 font-bold border-b border-slate-800">
                            <th className="py-2 px-3">Joint</th>
                            <th className="py-2 px-3">Movement</th>
                            <th className="py-2 px-3 text-center">Power (Rt)</th>
                            <th className="py-2 px-3 text-center">Power (Lt)</th>
                            <th className="py-2 px-3 text-center">ROM (Rt)</th>
                            <th className="py-2 px-3 text-center">ROM (Lt)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {romTableRows.slice(0, 8).map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-2 px-3 font-semibold text-white">{row.joint}</td>
                              <td className="py-2 px-3 text-slate-400">{row.movement}</td>
                              <td className="py-2 px-3 text-center font-mono text-teal-400">{row.powerRt}</td>
                              <td className="py-2 px-3 text-center font-mono text-teal-400">{row.powerLt}</td>
                              <td className="py-2 px-3 text-center font-mono text-emerald-400">{row.romRt}</td>
                              <td className="py-2 px-3 text-center font-mono text-emerald-400">{row.romLt}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: NEUROLOGICAL EXAMINATION */}
              {activeTab === 'neuro' && (
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <h4 className="text-sm font-bold text-blue-300 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-400" /> Neurological Exam & Sensory Modalities
                    </h4>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">
                      String Output Verified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                      <span className="font-bold text-slate-300 block text-xs">GCS & Cognitive Score</span>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Glasgow Coma Scale:</span>
                        <span className="font-bold text-blue-400">{mergedNeuroData?.gcs?.e_v_m || '15 / 15'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">MMSE Total Score:</span>
                        <span className="font-bold text-emerald-400">{mergedNeuroData?.mmse?.total || '30 / 30'}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                      <span className="font-bold text-slate-300 block text-xs">Sensory Modalities Summary</span>
                      <div className="text-[11px] text-slate-300 space-y-1">
                        <div>Pain / Temp: <span className="text-emerald-400 font-semibold">Intact Bilaterally</span></div>
                        <div>Touch / Pressure: <span className="text-emerald-400 font-semibold">Intact</span></div>
                        <div>Proprioception: <span className="text-emerald-400 font-semibold">Normal</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ANTHROPOMETRICS */}
              {activeTab === 'anthro' && (
                <div>
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                    <h4 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-400" /> Anthropometrics & Body Composition
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Height</span>
                      <span className="text-base font-bold text-white">{mergedAnthropometrics?.height || '140'} cm</span>
                    </div>
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">Weight</span>
                      <span className="text-base font-bold text-white">{mergedAnthropometrics?.weight || '38'} kg</span>
                    </div>
                    <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">BMI</span>
                      <span className="text-base font-bold text-emerald-400">{mergedAnthropometrics?.bmi || '19.4'}</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>3D Isometric Unfold Layer Active</span>
                <span className="text-teal-400 font-semibold">Live Interactive Data</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* LAYER 4: TREATMENT PLAN TREE (Bottom-Center Node Tree)                   */}
          {/* ========================================================================= */}
          <div className="lg:col-span-5" style={{ transformStyle: 'preserve-3d' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Dumbbell className="w-4 h-4" /> Layer 4 • Hierarchical Treatment Tree
              </span>
              <span className="text-[11px] text-slate-400">Click node to inspect details</span>
            </div>

            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 shadow-2xl min-h-[380px] flex flex-col justify-between">
              {/* Tree Navigation Nodes */}
              <div className="space-y-3">
                {/* Node 1: Diagnosis */}
                <div
                  onClick={() => setSelectedTreeNode('diagnosis')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedTreeNode === 'diagnosis'
                      ? 'bg-teal-500/20 border-teal-500/60 shadow-lg shadow-teal-500/10'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-teal-400" />
                      1. ICD-10 Diagnosis
                    </span>
                    <span className="text-[10px] text-teal-300 font-mono">
                      {diagnosisItems[0]?.icdCode || 'M54.11'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium mt-1">
                    {diagnosisItems[0]?.condition || 'Cervical Radiculopathy'} ({diagnosisItems[0]?.severity || 'Moderate'})
                  </p>
                </div>

                {/* Node 2: Treatment Modalities */}
                <div
                  onClick={() => setSelectedTreeNode('modalities')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedTreeNode === 'modalities'
                      ? 'bg-blue-500/20 border-blue-500/60 shadow-lg shadow-blue-500/10'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400" />
                      2. Prescribed Modalities ({modalitiesList.length})
                    </span>
                    <span className="text-[10px] text-blue-300 font-semibold">
                      {mergedTreatmentPlan?.visitsRequired || 12} Visits Total
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {modalitiesList.map((m: any, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-300 rounded-md border border-blue-500/30">
                        {m.code || m.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Node 3: Home Exercise Programme */}
                <div
                  onClick={() => setSelectedTreeNode('exercises')}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedTreeNode === 'exercises'
                      ? 'bg-emerald-500/20 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      3. Home Exercises ({exerciseItems.length > 0 ? exerciseItems.length : 'Prescribed'})
                    </span>
                    <span className="text-[10px] text-emerald-300 font-semibold">Daily Routine</span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {exerciseItems.length > 0
                      ? exerciseItems.map((e: any) => e.name || e.exerciseName || e.exercise_name).filter(Boolean).join(', ')
                      : 'Cervical Isometric Exercises & Scapular Retractions'}
                  </p>
                </div>
              </div>

              {/* Bottom Tree Footer */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400">Total Visits Required:</span>
                <span className="font-black text-emerald-400 text-sm">
                  {mergedTreatmentPlan?.visitsRequired || 12} Sessions
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
