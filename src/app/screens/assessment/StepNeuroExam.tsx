import React, { useState } from 'react';
import { SectionCard } from './FormComponents';
import { Brain, ChevronDown } from 'lucide-react';

interface NeuroSectionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function NeuroAccordionSection({ title, isOpen, onToggle, children }: NeuroSectionProps) {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
      >
        <span className="text-[13px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">{title}</span>
        <ChevronDown size={16} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50">{children}</div>}
    </div>
  );
}

export function getEmptyNeuroData() {
  return {
    gcs: { e_v_m: '', total: '' },
    mmse: {
      q1: '', q2: '', q3: '', q4: '', q5: '',
      q6: '', q7: '', q8: '', q9: '', q10: '', q11: '',
      total: ''
    },
    cranialNerves: {
      cn1: '', cn2: '', cn3: '', cn4: '', cn5: '', cn6: '',
      cn7: '', cn8: '', cn9: '', cn10: '', cn11: '', cn12: ''
    },
    sensory: {
      pain: { ueRt: '', ueLt: '', leRt: '', leLt: '', tRt: '', tLt: '', comments: '' },
      temp: { ueRt: '', ueLt: '', leRt: '', leLt: '', tRt: '', tLt: '', comments: '' },
      touch: { ueRt: '', ueLt: '', leRt: '', leLt: '', tRt: '', tLt: '', comments: '' },
      pressure: { ueRt: '', ueLt: '', leRt: '', leLt: '', tRt: '', tLt: '', comments: '' },
      movement: { ueRt: '', ueLt: '', leRt: '', leLt: '', tRt: '', tLt: '', comments: '' },
      position: { ueRt: '', ueLt: '', leRt: '', leLt: '', tRt: '', tLt: '', comments: '' },
      vibration: { ueRt: '', ueLt: '', leRt: '', leLt: '', tRt: '', tLt: '', comments: '' },
      tactile: { ueRt: '', ueLt: '', leRt: '', leLt: '', tRt: '', tLt: '', comments: '' },
      discrimination: { ueRt: '', ueLt: '', leRt: '', leLt: '', tRt: '', tLt: '', comments: '' },
      stereognosis: { ueRt: '', ueLt: '', leRt: '', leLt: '', tRt: '', tLt: '', comments: '' },
      barognosis: { ueRt: '', ueLt: '', leRt: '', leLt: '', tRt: '', tLt: '', comments: '' },
      graphesthesia: { ueRt: '', ueLt: '', leRt: '', leLt: '', tRt: '', tLt: '', comments: '' },
      texture: { ueRt: '', ueLt: '', leRt: '', leLt: '', tRt: '', tLt: '', comments: '' },
      doubleSimultaneous: { ueRt: '', ueLt: '', leRt: '', leLt: '', tRt: '', tLt: '', comments: '' },
      dermatomes: '',
      myotomes: ''
    },
    muscleGirth: {
      arm: { rt: '', lt: '' },
      forearm: { rt: '', lt: '' },
      thigh: { rt: '', lt: '' },
      calf: { rt: '', lt: '' }
    },
    voluntaryControl: {
      upperLimb: { rt: '', lt: '' },
      lowerLimb: { rt: '', lt: '' }
    },
    reflexes: {
      abdominal: { rt: '', lt: '' },
      plantar: { rt: '', lt: '' },
      biceps: { rt: '', lt: '' },
      brachioradialis: { rt: '', lt: '' },
      triceps: { rt: '', lt: '' },
      knee: { rt: '', lt: '' },
      ankle: { rt: '', lt: '' },
      pathological: ''
    },
    coordination: {
      fingerToNose: { rt: '', lt: '' },
      fingerOpposition: { rt: '', lt: '' },
      massGrasp: { rt: '', lt: '' },
      pronationSupination: { rt: '', lt: '' },
      reboundTest: { rt: '', lt: '' },
      tappingHand: { rt: '', lt: '' },
      tappingFoot: { rt: '', lt: '' },
      heelToKnee: { rt: '', lt: '' },
      drawingCircleHand: { rt: '', lt: '' },
      drawingCircleFoot: { rt: '', lt: '' },
      normalPosture: '',
      normalPostureVisionOccluded: '',
      feetTogether: '',
      onOneFoot: '',
      lateralTrunkFlexion: '',
      tandemWalking: '',
      walkSideways: '',
      walkBackward: '',
      walkInCircle: '',
      walkOnHeels: '',
      walkOnToes: '',
      involuntaryMovements: ''
    },
    balance: {
      sitting: '', standing: '', tandemStanding: '',
      reachingActivities: '', pertubation: ''
    },
    posture: {
      standing: { frontal: '', sagittal: '' },
      sitting: { frontal: '', sagittal: '' },
      lying: { frontal: '', sagittal: '' }
    },
    gait: {
      stancePhase: '', swingPhase: '', stepLength: '', strideLength: '',
      baseWidth: '', cadence: '', other: ''
    },
    handFunction: {
      reaching: '', grasping: '', releasing: '', assistiveDevices: ''
    }
  };
}

export function StepNeuroExam({ data, onChange, isDoctorRole, page = 1 }: any) {
  // Set default open section based on which page is active
  const initialOpenSec = page === 1 ? 'gcs' : page === 2 ? 'sensory' : page === 3 ? 'coordination' : 'gait';
  const [openSec, setOpenSec] = useState<string>(initialOpenSec);
  const neuroData = data || getEmptyNeuroData();

  const MMSE_MAX_MAP: Record<string, number> = {
    q1: 5, q2: 5, q3: 3, q4: 5, q5: 3,
    q6: 2, q7: 1, q8: 3, q9: 1, q10: 1, q11: 1
  };

  const updateNested = (path: string[], val: any) => {
    const updated = JSON.parse(JSON.stringify(neuroData));
    let curr = updated;
    for (let i = 0; i < path.length - 1; i++) {
      if (!curr[path[i]]) curr[path[i]] = {};
      curr = curr[path[i]];
    }

    let finalVal = val;
    // Strict MMSE question score clamping to max score
    if (path[0] === 'mmse' && path[1] !== 'total') {
      const qKey = path[1];
      const maxScore = MMSE_MAX_MAP[qKey] ?? 5;
      if (val !== '' && val !== null && val !== undefined) {
        let num = parseInt(String(val), 10);
        if (isNaN(num) || num < 0) num = 0;
        if (num > maxScore) num = maxScore;
        finalVal = String(num);
      }
    }

    curr[path[path.length - 1]] = finalVal;

    // Auto-calculate MMSE total capped at 30
    if (path[0] === 'mmse' && path[1] !== 'total') {
      let sum = 0;
      let hasVal = false;
      for (let i = 1; i <= 11; i++) {
        const qKey = `q${i}`;
        if (updated.mmse[qKey] !== '' && updated.mmse[qKey] !== undefined && updated.mmse[qKey] !== null) {
          const itemMax = MMSE_MAX_MAP[qKey] ?? 5;
          let score = parseInt(String(updated.mmse[qKey] || '0'), 10);
          if (isNaN(score) || score < 0) score = 0;
          if (score > itemMax) score = itemMax;
          sum += score;
          hasVal = true;
        }
      }
      updated.mmse.total = hasVal ? String(Math.min(30, sum)) : '';
    }

    onChange(updated);
  };

  const tableInputClass = "w-full text-center px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500";
  const commentInputClass = "w-full px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded text-slate-900 dark:text-white placeholder:text-slate-450 focus:outline-none focus:ring-1 focus:ring-indigo-500";

  const cnerveList = [
    { key: 'cn1', label: 'I - Olfactory' },
    { key: 'cn2', label: 'II - Optic' },
    { key: 'cn3', label: 'III - Oculomotor' },
    { key: 'cn4', label: 'IV - Trochlear' },
    { key: 'cn5', label: 'V - Trigeminal' },
    { key: 'cn6', label: 'VI - Abducent' },
    { key: 'cn7', label: 'VII - Facial' },
    { key: 'cn8', label: 'VIII - Vestibulocochlear' },
    { key: 'cn9', label: 'IX - Glossopharyngeal' },
    { key: 'cn10', label: 'X - Vagus' },
    { key: 'cn11', label: 'XI - Accessory' },
    { key: 'cn12', label: 'XII - Hypoglossal' }
  ];

  const sensoryRows = [
    { key: 'pain', cat: 'superficial', name: 'Pain' },
    { key: 'temp', cat: 'superficial', name: 'Temperature' },
    { key: 'touch', cat: 'superficial', name: 'Touch' },
    { key: 'pressure', cat: 'superficial', name: 'Pressure' },
    { key: 'movement', cat: 'deep', name: 'Mov. Sense' },
    { key: 'position', cat: 'deep', name: 'Pos. Sense' },
    { key: 'vibration', cat: 'deep', name: 'Vibration' },
    { key: 'tactile', cat: 'cortical', name: 'Tactile Localization' },
    { key: 'discrimination', cat: 'cortical', name: '2 pt. discrimination' },
    { key: 'stereognosis', cat: 'cortical', name: 'Stereognosis' },
    { key: 'barognosis', cat: 'cortical', name: 'Barognosis' },
    { key: 'graphesthesia', cat: 'cortical', name: 'Graphesthesia' },
    { key: 'texture', cat: 'cortical', name: 'Texture Recognition' },
    { key: 'doubleSimultaneous', cat: 'cortical', name: 'Double Simultaneous' }
  ];

  const pageTitle = page === 1 ? "Neuro Exam: Mental & Nerves" : page === 2 ? "Neuro Exam: Sensory & Motor" : page === 3 ? "Neuro Exam: Coordination & Balance" : "Neuro Exam: Gait & Hand";

  return (
    <div className="flex flex-col gap-4">
      <SectionCard
        icon={<Brain size={18} className={isDoctorRole ? 'text-indigo-600 dark:text-indigo-400' : 'text-teal-600 dark:text-teal-400'} />}
        title={pageTitle}
        subtitle={`Page ${page} of 4 Clinical Neuro Examination`}
        accent={isDoctorRole ? 'doctor' : 'teal'}
      >
        <div className="flex flex-col gap-3">
          
          {/* PAGE 1: Mental & Cranial Nerves */}
          {page === 1 && (
            <>
              {/* Glasgow Coma Scale */}
              <NeuroAccordionSection
                title="Glasgow Coma Scale (GCS)"
                isOpen={openSec === 'gcs'}
                onToggle={() => setOpenSec(openSec === 'gcs' ? '' : 'gcs')}
              >
                <div className="flex flex-col gap-2.5">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wide">On Examination</span>
                  <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <span className="text-sm font-black text-slate-800 dark:text-slate-100">GCS :</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-350">E V M =</span>
                    <input
                      type="text"
                      value={neuroData.gcs?.e_v_m || ''}
                      placeholder="..."
                      maxLength={10}
                      onChange={(e) => {
                        const raw = e.target.value;
                        const trimmed = raw.trim();
                        if (/^\d+$/.test(trimmed)) {
                          const num = parseInt(trimmed, 10);
                          if (num > 15) {
                            updateNested(['gcs', 'e_v_m'], '15');
                            return;
                          }
                        }
                        updateNested(['gcs', 'e_v_m'], raw);
                      }}
                      className="w-32 text-center px-3 py-1.5 border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-950 rounded-lg text-sm text-slate-900 dark:text-white font-extrabold focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-black text-slate-800 dark:text-slate-200">/ 15</span>
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 ml-1">(Max score: 15)</span>
                  </div>
                </div>
              </NeuroAccordionSection>

              {/* MMSE */}
              <NeuroAccordionSection
                title="Mini-Mental State Examination (MMSE)"
                isOpen={openSec === 'mmse'}
                onToggle={() => setOpenSec(openSec === 'mmse' ? '' : 'mmse')}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 font-black border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 w-24 text-center uppercase tracking-wider">Max Score</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 w-28 text-center uppercase tracking-wider">Patient's Score</th>
                        <th className="p-3 uppercase tracking-wider">Questions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'q1', max: 5, q: 'What is the year? Season? Date? Day of the week? Month?' },
                        { key: 'q2', max: 5, q: 'Where are we now: State? County? Town/city? Hospital? Floor?' },
                        { key: 'q3', max: 3, q: "The examiner names three unrelated objects clearly and slowly, then asks the patient to name all three of them. The patient's response is used for scoring. Number of trials: _________" },
                        { key: 'q4', max: 5, q: 'I would like you to count backward from 100 by sevens. (93, 86, 79, 72, 65, ...) Stop after five answers. Alternative: "Spell WORLD backwards."' },
                        { key: 'q5', max: 3, q: 'Earlier I told you the names of three things. Can you tell me what those were?' },
                        { key: 'q6', max: 2, q: 'Show the patient two simple objects, such as a wristwatch and a pencil, and ask the patient to name them.' },
                        { key: 'q7', max: 1, q: 'Repeat the phrase: "No ifs, ands, or buts."' },
                        { key: 'q8', max: 3, q: 'Take the paper in your right hand, fold it in half, and put it on the floor. (The examiner gives the patient a piece of blank paper.)' },
                        { key: 'q9', max: 1, q: 'Please read this and do what it says. (Written instruction is "Close your eyes.")' },
                        { key: 'q10', max: 1, q: 'Make up and write a sentence about anything. (This sentence must contain a noun and a verb.)' },
                        { key: 'q11', max: 1, q: 'Please copy this picture. (The examiner gives the patient a blank piece of paper and asks him/her to draw intersecting pentagons.)' }
                      ].map((item) => (
                        <tr key={item.key} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-800 text-center font-bold">{item.max}</td>
                          <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                            <input
                              type="number"
                              min="0"
                              max={item.max}
                              value={neuroData.mmse?.[item.key] ?? ''}
                              onChange={(e) => {
                                const raw = e.target.value;
                                if (raw === '') {
                                  updateNested(['mmse', item.key], '');
                                  return;
                                }
                                let num = parseInt(raw, 10);
                                if (isNaN(num) || num < 0) num = 0;
                                if (num > item.max) num = item.max;
                                updateNested(['mmse', item.key], String(num));
                              }}
                              className={tableInputClass}
                              placeholder={`0-${item.max}`}
                            />
                          </td>
                          <td className="p-2.5 font-semibold text-slate-700 dark:text-slate-350">{item.q}</td>
                        </tr>
                      ))}
                      <tr className="bg-slate-50 dark:bg-slate-850/50 font-black border-t-2 border-slate-200 dark:border-slate-800">
                        <td className="p-3 border-r border-slate-200 dark:border-slate-800 text-center text-sm">30</td>
                        <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-center text-sm text-indigo-650 dark:text-teal-400">
                          {neuroData.mmse?.total || '0'}
                        </td>
                        <td className="p-3 text-sm uppercase tracking-wider">TOTAL</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </NeuroAccordionSection>

              {/* Cranial Nerves */}
              <NeuroAccordionSection
                title="Cranial Nerves"
                isOpen={openSec === 'nerves'}
                onToggle={() => setOpenSec(openSec === 'nerves' ? '' : 'nerves')}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 font-black border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 w-1/4 uppercase tracking-wider">Nerves</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 w-1/4 uppercase tracking-wider">Comments</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 w-1/4 uppercase tracking-wider">Nerves</th>
                        <th className="p-3 uppercase tracking-wider">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { leftKey: 'cn1', leftName: 'I - Olfactory', rightKey: 'cn7', rightName: 'VII - Facial' },
                        { leftKey: 'cn2', leftName: 'II - Optic', rightKey: 'cn8', rightName: 'VIII - Vestibulocochlear' },
                        { leftKey: 'cn3', leftName: 'III - Oculomotor', rightKey: 'cn9', rightName: 'IX - Glossopharyngeal' },
                        { leftKey: 'cn4', leftName: 'IV - Trochlear', rightKey: 'cn10', rightName: 'X - Vagus' },
                        { leftKey: 'cn5', leftName: 'V - Trigeminal', rightKey: 'cn11', rightName: 'XI - Accessory' },
                        { leftKey: 'cn6', leftName: 'VI - Abducent', rightKey: 'cn12', rightName: 'XII - Hypoglossal' }
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-200 dark:border-slate-800">
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-800 font-bold bg-slate-50/30 dark:bg-slate-900/10">{row.leftName}</td>
                          <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                            <input
                              type="text"
                              value={neuroData.cranialNerves?.[row.leftKey] || ''}
                              onChange={(e) => updateNested(['cranialNerves', row.leftKey], e.target.value)}
                              className={commentInputClass}
                              placeholder="..."
                            />
                          </td>
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-800 font-bold bg-slate-50/30 dark:bg-slate-900/10">{row.rightName}</td>
                          <td className="p-2">
                            <input
                              type="text"
                              value={neuroData.cranialNerves?.[row.rightKey] || ''}
                              onChange={(e) => updateNested(['cranialNerves', row.rightKey], e.target.value)}
                              className={commentInputClass}
                              placeholder="..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </NeuroAccordionSection>
            </>
          )}

          {/* PAGE 2: Sensory, Motor & Reflexes */}
          {page === 2 && (
            <>
              {/* Sensory Assessment */}
              <NeuroAccordionSection
                title="Sensory Assessment & Dermatomes / Myotomes"
                isOpen={openSec === 'sensory'}
                onToggle={() => setOpenSec(openSec === 'sensory' ? '' : 'sensory')}
              >
                <div className="flex flex-col gap-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-[11px] text-slate-800 dark:text-slate-200 text-left border border-slate-200 dark:border-slate-800 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-black">
                          <th className="p-2.5 border-r border-slate-200 dark:border-slate-800 uppercase text-slate-550 w-44">Sensation</th>
                          <th className="p-2.5 border-r border-slate-200 dark:border-slate-800 uppercase text-slate-550 text-center" colSpan={2}>Upper Extremity</th>
                          <th className="p-2.5 border-r border-slate-200 dark:border-slate-800 uppercase text-slate-550 text-center" colSpan={2}>Lower Extremity</th>
                          <th className="p-2.5 border-r border-slate-200 dark:border-slate-800 uppercase text-slate-550 text-center" colSpan={2}>Trunk</th>
                          <th className="p-2.5 uppercase text-slate-550">Comments</th>
                        </tr>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 font-bold">
                          <th className="p-2 border-r border-slate-200 dark:border-slate-800">Location</th>
                          <th className="p-1 border-r border-slate-200 dark:border-slate-850 text-center w-12">Rt</th>
                          <th className="p-1 border-r border-slate-200 dark:border-slate-800 text-center w-12">Lt</th>
                          <th className="p-1 border-r border-slate-200 dark:border-slate-850 text-center w-12">Rt</th>
                          <th className="p-1 border-r border-slate-200 dark:border-slate-800 text-center w-12">Lt</th>
                          <th className="p-1 border-r border-slate-200 dark:border-slate-850 text-center w-12">Rt</th>
                          <th className="p-1 border-r border-slate-200 dark:border-slate-800 text-center w-12">Lt</th>
                          <th className="p-2 font-black"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { cat: 'Superficial', rows: [
                            { key: 'pain', name: 'Pain' },
                            { key: 'temp', name: 'Temperature' },
                            { key: 'touch', name: 'Touch' },
                            { key: 'pressure', name: 'Pressure' }
                          ]},
                          { cat: 'Deep', rows: [
                            { key: 'movement', name: 'Mov. Sense' },
                            { key: 'position', name: 'Pos. Sense' },
                            { key: 'vibration', name: 'Vibration' }
                          ]},
                          { cat: 'Cortical', rows: [
                            { key: 'tactile', name: 'Tactile Localization' },
                            { key: 'discrimination', name: '2 pt. discrimination' },
                            { key: 'stereognosis', name: 'Stereognosis' },
                            { key: 'barognosis', name: 'Barognosis' },
                            { key: 'graphesthesia', name: 'Graphesthesia' },
                            { key: 'texture', name: 'Texture Recognition' },
                            { key: 'doubleSimultaneous', name: 'Double Simultaneous' }
                          ]}
                        ].map((section) => (
                          <React.Fragment key={section.cat}>
                            <tr className="bg-slate-100/60 dark:bg-slate-850/40 font-black">
                              <td className="p-2 border-r border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350" colSpan={8}>
                                {section.cat}
                              </td>
                            </tr>
                            {section.rows.map((r) => (
                              <tr key={r.key} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/30 dark:hover:bg-slate-850/5">
                                <td className="p-2 border-r border-slate-200 dark:border-slate-800 font-medium pl-4">{r.name}</td>
                                {['ueRt', 'ueLt', 'leRt', 'leLt', 'tRt', 'tLt'].map((side) => (
                                  <td key={side} className="p-1 border-r border-slate-200 dark:border-slate-850">
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      pattern="[0-9]*"
                                      maxLength={3}
                                      value={neuroData.sensory?.[r.key]?.[side] || ''}
                                      onChange={(e) => updateNested(['sensory', r.key, side], e.target.value.replace(/\D/g, '').slice(0, 3))}
                                      className={tableInputClass}
                                      placeholder="0-10"
                                    />
                                  </td>
                                ))}
                                <td className="p-1">
                                  <input
                                    type="text"
                                    value={neuroData.sensory?.[r.key]?.comments || ''}
                                    onChange={(e) => updateNested(['sensory', r.key, 'comments'], e.target.value)}
                                    className={commentInputClass}
                                    placeholder="Add notes..."
                                  />
                                </td>
                              </tr>
                            ))}
                          </React.Fragment>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col gap-3 mt-2 border-t border-slate-200 dark:border-slate-800 pt-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold w-28 text-slate-600 dark:text-slate-400">Dermatomes :</span>
                      <input
                        type="text"
                        value={neuroData.sensory?.dermatomes || ''}
                        onChange={(e) => updateNested(['sensory', 'dermatomes'], e.target.value)}
                        className={commentInputClass}
                        placeholder="Comments on dermatomes..."
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-extrabold w-28 text-slate-600 dark:text-slate-400">Myotomes :</span>
                      <input
                        type="text"
                        value={neuroData.sensory?.myotomes || ''}
                        onChange={(e) => updateNested(['sensory', 'myotomes'], e.target.value)}
                        className={commentInputClass}
                        placeholder="Comments on myotomes..."
                      />
                    </div>
                  </div>
                </div>
              </NeuroAccordionSection>

              {/* Muscle Girth & Voluntary Control */}
              <NeuroAccordionSection
                title="Muscle Girth & Voluntary Control"
                isOpen={openSec === 'motor'}
                onToggle={() => setOpenSec(openSec === 'motor' ? '' : 'motor')}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Muscle Girth */}
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-3.5 uppercase tracking-wide">Muscle Girth</h4>
                    <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-850 font-black border-b border-slate-200 dark:border-slate-800">
                          <th className="p-3 border-r border-slate-200 dark:border-slate-800 uppercase tracking-wider">Area</th>
                          <th className="p-3 border-r border-slate-200 dark:border-slate-800 w-24 text-center uppercase tracking-wider">Rt.(cm.)</th>
                          <th className="p-3 w-24 text-center uppercase tracking-wider">Lt.(cm.)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'arm', name: 'Arm' },
                          { key: 'forearm', name: 'Forearm' },
                          { key: 'thigh', name: 'Thigh' },
                          { key: 'calf', name: 'Calf' }
                        ].map((row) => (
                          <tr key={row.key} className="border-b border-slate-200 dark:border-slate-800">
                            <td className="p-2.5 border-r border-slate-200 dark:border-slate-800 font-bold bg-slate-50/20 dark:bg-slate-900/5">{row.name}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={3}
                                value={neuroData.muscleGirth?.[row.key]?.rt || ''}
                                onChange={(e) => updateNested(['muscleGirth', row.key, 'rt'], e.target.value.replace(/\D/g, '').slice(0, 3))}
                                className={tableInputClass}
                                placeholder="Rt"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={3}
                                value={neuroData.muscleGirth?.[row.key]?.lt || ''}
                                onChange={(e) => updateNested(['muscleGirth', row.key, 'lt'], e.target.value.replace(/\D/g, '').slice(0, 3))}
                                className={tableInputClass}
                                placeholder="Lt"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Voluntary Control */}
                  <div>
                    <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-3.5 uppercase tracking-wide">Voluntary Control</h4>
                    <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-850 font-black border-b border-slate-200 dark:border-slate-800">
                          <th className="p-3 border-r border-slate-200 dark:border-slate-800 uppercase tracking-wider">Side</th>
                          <th className="p-3 border-r border-slate-200 dark:border-slate-800 w-28 text-center uppercase tracking-wider">Rt.</th>
                          <th className="p-3 w-28 text-center uppercase tracking-wider">Lt.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: 'upperLimb', name: 'Upper Limb' },
                          { key: 'lowerLimb', name: 'Lower Limb' }
                        ].map((row) => (
                          <tr key={row.key} className="border-b border-slate-200 dark:border-slate-800">
                            <td className="p-2.5 border-r border-slate-200 dark:border-slate-800 font-bold bg-slate-50/20 dark:bg-slate-900/5">{row.name}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={3}
                                value={neuroData.voluntaryControl?.[row.key]?.rt || ''}
                                onChange={(e) => updateNested(['voluntaryControl', row.key, 'rt'], e.target.value.replace(/\D/g, '').slice(0, 3))}
                                className={tableInputClass}
                                placeholder="Rt Control"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                inputMode="numeric"
                                pattern="[0-9]*"
                                maxLength={3}
                                value={neuroData.voluntaryControl?.[row.key]?.lt || ''}
                                onChange={(e) => updateNested(['voluntaryControl', row.key, 'lt'], e.target.value.replace(/\D/g, '').slice(0, 3))}
                                className={tableInputClass}
                                placeholder="Lt Control"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </NeuroAccordionSection>

              {/* Reflexes */}
              <NeuroAccordionSection
                title="Reflexes"
                isOpen={openSec === 'reflexes'}
                onToggle={() => setOpenSec(openSec === 'reflexes' ? '' : 'reflexes')}
              >
                <div className="flex flex-col gap-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-850 font-black border-b border-slate-200 dark:border-slate-800">
                          <th className="p-3 border-r border-slate-200 dark:border-slate-800 w-40 uppercase tracking-wider">Category</th>
                          <th className="p-3 border-r border-slate-200 dark:border-slate-800 w-48 uppercase tracking-wider">Reflex</th>
                          <th className="p-3 border-r border-slate-200 dark:border-slate-800 text-center w-28 uppercase tracking-wider">Left</th>
                          <th className="p-3 text-center w-28 uppercase tracking-wider">Right</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { cat: 'SUPERFICIAL', isFirst: true, rowSpan: 2, key: 'abdominal', name: 'Abdominal' },
                          { cat: 'SUPERFICIAL', isFirst: false, key: 'plantar', name: 'Plantar' },
                          { cat: 'DEEP', isFirst: true, rowSpan: 5, key: 'biceps', name: 'Biceps' },
                          { cat: 'DEEP', isFirst: false, key: 'brachioradialis', name: 'Brachioradialis' },
                          { cat: 'DEEP', isFirst: false, key: 'triceps', name: 'Triceps' },
                          { cat: 'DEEP', isFirst: false, key: 'knee', name: 'Knee' },
                          { cat: 'DEEP', isFirst: false, key: 'ankle', name: 'Ankle' }
                        ].map((row, idx) => (
                          <tr key={idx} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/30 dark:hover:bg-slate-850/5">
                            {row.isFirst && (
                              <td
                                className="p-3 border-r border-slate-200 dark:border-slate-800 font-black bg-slate-50/40 dark:bg-slate-900/10 uppercase tracking-wider text-slate-500"
                                rowSpan={row.rowSpan}
                              >
                                {row.cat}
                              </td>
                            )}
                            <td className="p-2.5 border-r border-slate-200 dark:border-slate-800 font-bold">{row.name}</td>
                            <td className="p-2 border-r border-slate-200 dark:border-slate-800">
                              <input
                                type="text"
                                maxLength={3}
                                value={neuroData.reflexes?.[row.key]?.lt || ''}
                                onChange={(e) => updateNested(['reflexes', row.key, 'lt'], e.target.value.replace(/[^0-9\+\-]/g, '').slice(0, 3))}
                                className={tableInputClass}
                                placeholder="Left score"
                              />
                            </td>
                            <td className="p-2">
                              <input
                                type="text"
                                maxLength={3}
                                value={neuroData.reflexes?.[row.key]?.rt || ''}
                                onChange={(e) => updateNested(['reflexes', row.key, 'rt'], e.target.value.replace(/[^0-9\+\-]/g, '').slice(0, 3))}
                                className={tableInputClass}
                                placeholder="Right score"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-extrabold w-28 text-slate-650 dark:text-slate-400 uppercase tracking-wider">Pathological :</span>
                    <input
                      type="text"
                      value={neuroData.reflexes?.pathological || ''}
                      onChange={(e) => updateNested(['reflexes', 'pathological'], e.target.value)}
                      className={commentInputClass}
                      placeholder="Comments on pathological reflexes..."
                    />
                  </div>
                </div>
              </NeuroAccordionSection>
            </>
          )}

          {/* PAGE 3: Coordination, Balance, Posture, Gait & Hand */}
          {page === 3 && (
            <>
              {/* Coordination */}
              <NeuroAccordionSection
                title="Coordination & Involuntary Movements"
                isOpen={openSec === 'coordination'}
                onToggle={() => setOpenSec(openSec === 'coordination' ? '' : 'coordination')}
              >
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Non Equilibrium Tests */}
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-3.5 uppercase tracking-wide">Non Equilibrium Tests</h4>
                      <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-850 font-black border-b border-slate-200 dark:border-slate-800">
                            <th className="p-3 border-r border-slate-200 dark:border-slate-800 uppercase tracking-wider">Non Equilibrium Tests</th>
                            <th className="p-3 border-r border-slate-200 dark:border-slate-800 w-24 text-center uppercase tracking-wider">Rt.</th>
                            <th className="p-3 w-24 text-center uppercase tracking-wider">Lt.</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: 'fingerToNose', name: 'Finger to nose' },
                            { key: 'fingerOpposition', name: 'Finger opposition' },
                            { key: 'massGrasp', name: 'Mass Grasp' },
                            { key: 'pronationSupination', name: 'Pronation/Supination' },
                            { key: 'reboundTest', name: 'Rebound test' },
                            { key: 'tappingHand', name: 'Tapping (Hand)' },
                            { key: 'tappingFoot', name: 'Tapping (Foot)' },
                            { key: 'heelToKnee', name: 'Heel to knee' },
                            { key: 'drawingCircleHand', name: 'Drawing a circle(Hand)' },
                            { key: 'drawingCircleFoot', name: 'Drawing a circle(Foot)' }
                          ].map((row) => (
                            <tr key={row.key} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/20">
                              <td className="p-2 border-r border-slate-200 dark:border-slate-800 font-bold bg-slate-50/10 dark:bg-slate-900/5">{row.name}</td>
                              <td className="p-1 border-r border-slate-200 dark:border-slate-800">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={3}
                                  value={neuroData.coordination?.[row.key]?.rt || ''}
                                  onChange={(e) => updateNested(['coordination', row.key, 'rt'], e.target.value.replace(/\D/g, '').slice(0, 3))}
                                  className={tableInputClass}
                                  placeholder="Rt"
                                />
                              </td>
                              <td className="p-1">
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  maxLength={3}
                                  value={neuroData.coordination?.[row.key]?.lt || ''}
                                  onChange={(e) => updateNested(['coordination', row.key, 'lt'], e.target.value.replace(/\D/g, '').slice(0, 3))}
                                  className={tableInputClass}
                                  placeholder="Lt"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Equilibrium Tests */}
                    <div>
                      <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 mb-3.5 uppercase tracking-wide">Equilibrium tests</h4>
                      <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 border-collapse">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-850 font-black border-b border-slate-200 dark:border-slate-800">
                            <th className="p-3 border-r border-slate-200 dark:border-slate-800 uppercase tracking-wider">Equilibrium tests</th>
                            <th className="p-3 w-40 text-center uppercase tracking-wider">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: 'normalPosture', name: 'Standing: Normal Posture' },
                            { key: 'normalPostureVisionOccluded', name: 'Standing: Normal Posture with vision occluded' },
                            { key: 'feetTogether', name: 'Standing: Feet together' },
                            { key: 'onOneFoot', name: 'Standing: on one foot' },
                            { key: 'lateralTrunkFlexion', name: 'Standing: Lateral trunk flexion' },
                            { key: 'tandemWalking', name: 'Tandem walking' },
                            { key: 'walkSideways', name: 'Walk: Sideways' },
                            { key: 'walkBackward', name: 'Walk: Backward' },
                            { key: 'walkInCircle', name: 'Walk in a circle' },
                            { key: 'walkOnHeels', name: 'Walk on heels' },
                            { key: 'walkOnToes', name: 'Walk on toes' }
                          ].map((row) => (
                            <tr key={row.key} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/20">
                              <td className="p-2 border-r border-slate-200 dark:border-slate-800 font-bold bg-slate-50/10 dark:bg-slate-900/5">{row.name}</td>
                              <td className="p-1">
                                <input
                                  type="text"
                                  value={neuroData.coordination?.[row.key] || ''}
                                  onChange={(e) => updateNested(['coordination', row.key], e.target.value)}
                                  className={tableInputClass}
                                  placeholder="Grade/Comments"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs mt-2 border-t border-slate-200 dark:border-slate-800 pt-3">
                    <span className="font-extrabold w-44 text-slate-650 dark:text-slate-400 uppercase tracking-wider">Involuntary Movements :</span>
                    <input
                      type="text"
                      value={neuroData.coordination?.involuntaryMovements || ''}
                      onChange={(e) => updateNested(['coordination', 'involuntaryMovements'], e.target.value)}
                      className={commentInputClass}
                      placeholder="Describe tremors, chorea, etc..."
                    />
                  </div>
                </div>
              </NeuroAccordionSection>

              {/* Balance */}
              <NeuroAccordionSection
                title="Balance"
                isOpen={openSec === 'balance'}
                onToggle={() => setOpenSec(openSec === 'balance' ? '' : 'balance')}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 font-black border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 w-36 uppercase tracking-wider">Category</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 w-1/2 uppercase tracking-wider">Test</th>
                        <th className="p-3 uppercase tracking-wider">Comments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { cat: 'Static', isFirst: true, rowSpan: 3, key: 'sitting', name: 'Sitting (With eyes open & closed)' },
                        { cat: 'Static', isFirst: false, key: 'standing', name: 'Standing (With eyes open & closed)' },
                        { cat: 'Static', isFirst: false, key: 'tandemStanding', name: 'Tandem Standing (With eyes open & closed)' },
                        { cat: 'Dynamic', isFirst: true, rowSpan: 2, key: 'reachingActivities', name: 'Reaching Activities' },
                        { cat: 'Dynamic', isFirst: false, key: 'pertubation', name: 'Pertubation' }
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/20">
                          {row.isFirst && (
                            <td
                              className="p-3 border-r border-slate-200 dark:border-slate-800 font-black bg-slate-50/40 dark:bg-slate-900/10 uppercase tracking-wider text-slate-550"
                              rowSpan={row.rowSpan}
                            >
                              {row.cat}
                            </td>
                          )}
                          <td className="p-2.5 border-r border-slate-200 dark:border-slate-800 font-bold">{row.name}</td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={neuroData.balance?.[row.key] || ''}
                              onChange={(e) => updateNested(['balance', row.key], e.target.value)}
                              className={commentInputClass}
                              placeholder="Grade / comment"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </NeuroAccordionSection>

              {/* Posture */}
              <NeuroAccordionSection
                title="Posture"
                isOpen={openSec === 'posture'}
                onToggle={() => setOpenSec(openSec === 'posture' ? '' : 'posture')}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 font-black border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 uppercase tracking-wider">Position</th>
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 w-5/12 uppercase tracking-wider">Frontal View</th>
                        <th className="p-3 w-5/12 uppercase tracking-wider">Sagittal View</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'standing', name: 'Standing' },
                        { key: 'sitting', name: 'Sitting' },
                        { key: 'lying', name: 'Lying' }
                      ].map((row) => (
                        <tr key={row.key} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/20">
                          <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-black bg-slate-50/10 dark:bg-slate-900/5">{row.name}</td>
                          <td className="p-1.5 border-r border-slate-200 dark:border-slate-800">
                            <input
                              type="text"
                              value={neuroData.posture?.[row.key]?.frontal || ''}
                              onChange={(e) => updateNested(['posture', row.key, 'frontal'], e.target.value)}
                              className={commentInputClass}
                              placeholder="Frontal view comments"
                            />
                          </td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={neuroData.posture?.[row.key]?.sagittal || ''}
                              onChange={(e) => updateNested(['posture', row.key, 'sagittal'], e.target.value)}
                              className={commentInputClass}
                              placeholder="Sagittal view comments"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </NeuroAccordionSection>
            </>
          )}

          {/* PAGE 4: Gait & Hand */}
          {page === 4 && (
            <>
              {/* Gait Analysis */}
              <NeuroAccordionSection
                title="Gait Analysis"
                isOpen={openSec === 'gait'}
                onToggle={() => setOpenSec(openSec === 'gait' ? '' : 'gait')}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 border-collapse">
                    <tbody>
                      {[
                        { leftLabel: 'Stance Phase:', leftKey: 'stancePhase', rightLabel: 'Base Width:', rightKey: 'baseWidth' },
                        { leftLabel: 'Swing Phase:', leftKey: 'swingPhase', rightLabel: 'Cadence:', rightKey: 'cadence' },
                        { leftLabel: 'Step Length:', leftKey: 'stepLength', rightLabel: 'Other:', rightKey: 'other' },
                        { leftLabel: 'Stride Length:', leftKey: 'strideLength', rightLabel: '', rightKey: '' }
                      ].map((row, idx) => (
                        <tr key={idx} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/10">
                          <td className="p-2.5 font-bold bg-slate-50/20 dark:bg-slate-900/5 w-32">{row.leftLabel}</td>
                          <td className="p-1.5 border-r border-slate-200 dark:border-slate-800">
                            <input
                              type="text"
                              value={neuroData.gait?.[row.leftKey] || ''}
                              onChange={(e) => updateNested(['gait', row.leftKey], e.target.value)}
                              className={commentInputClass}
                              placeholder="..."
                            />
                          </td>
                          <td className="p-2.5 font-bold bg-slate-50/20 dark:bg-slate-900/5 w-32">
                            {row.rightLabel}
                          </td>
                          <td className="p-1.5">
                            {row.rightKey && (
                              <input
                                type="text"
                                value={neuroData.gait?.[row.rightKey] || ''}
                                onChange={(e) => updateNested(['gait', row.rightKey], e.target.value)}
                                className={commentInputClass}
                                placeholder="..."
                              />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </NeuroAccordionSection>

              {/* Hand Function */}
              <NeuroAccordionSection
                title="Hand Function"
                isOpen={openSec === 'hand'}
                onToggle={() => setOpenSec(openSec === 'hand' ? '' : 'hand')}
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left border border-slate-200 dark:border-slate-800 border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-850 font-black border-b border-slate-200 dark:border-slate-800">
                        <th className="p-3 border-r border-slate-200 dark:border-slate-800 w-44 uppercase tracking-wider">Hand Function</th>
                        <th className="p-3 uppercase tracking-wider">Comments / Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { key: 'reaching', name: 'Reaching' },
                        { key: 'grasping', name: 'Grasping' },
                        { key: 'releasing', name: 'Releasing' },
                        { key: 'assistiveDevices', name: 'Assistive Devices' }
                      ].map((row) => (
                        <tr key={row.key} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50/20">
                          <td className="p-3 border-r border-slate-200 dark:border-slate-800 font-bold bg-slate-50/10 dark:bg-slate-900/5">{row.name}</td>
                          <td className="p-1.5">
                            <input
                              type="text"
                              value={neuroData.handFunction?.[row.key] || ''}
                              onChange={(e) => updateNested(['handFunction', row.key], e.target.value)}
                              className={commentInputClass}
                              placeholder="..."
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </NeuroAccordionSection>
            </>
          )}

        </div>
      </SectionCard>
    </div>
  );
}
