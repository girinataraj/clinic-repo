import React from 'react';

const SENSORY_LABELS: Record<string, string> = {
  pain: 'Pain',
  temp: 'Temperature',
  touch: 'Touch',
  pressure: 'Pressure',
  movement: 'Mov. Sense',
  position: 'Pos. Sense',
  vibration: 'Vibration',
  tactile: 'Tactile Localization',
  discrimination: '2 pt. Discrimination',
  stereognosis: 'Stereognosis',
  barognosis: 'Barognosis',
  graphesthesia: 'Graphesthesia',
  texture: 'Texture Recognition',
  doubleSimultaneous: 'Double Simultaneous'
};

const CRANIAL_NERVE_LABELS: Record<string, string> = {
  cn1: 'I - Olfactory',
  cn2: 'II - Optic',
  cn3: 'III - Oculomotor',
  cn4: 'IV - Trochlear',
  cn5: 'V - Trigeminal',
  cn6: 'VI - Abducent',
  cn7: 'VII - Facial',
  cn8: 'VIII - Vestibulocochlear',
  cn9: 'IX - Glossopharyngeal',
  cn10: 'X - Vagus',
  cn11: 'XI - Accessory',
  cn12: 'XII - Hypoglossal'
};

const NON_EQUILIBRIUM_LABELS: Record<string, string> = {
  fingerToNose: 'Finger to nose',
  fingerOpposition: 'Finger opposition',
  massGrasp: 'Mass Grasp',
  pronationSupination: 'Pronation/Supination',
  reboundTest: 'Rebound test',
  tappingHand: 'Tapping (Hand)',
  tappingFoot: 'Tapping (Foot)',
  heelToKnee: 'Heel to knee',
  drawingCircleHand: 'Drawing circle (Hand)',
  drawingCircleFoot: 'Drawing circle (Foot)'
};

const EQUILIBRIUM_LABELS: Record<string, string> = {
  normalPosture: 'Standing: Normal Posture',
  normalPostureVisionOccluded: 'Standing: Vision Occluded',
  feetTogether: 'Standing: Feet Together',
  onOneFoot: 'Standing: On One Foot',
  lateralTrunkFlexion: 'Standing: Lateral Trunk Flexion',
  tandemWalking: 'Tandem Walking',
  walkSideways: 'Walk: Sideways',
  walkBackward: 'Walk: Backward',
  walkInCircle: 'Walk: In Circle',
  walkOnHeels: 'Walk: On Heels',
  walkOnToes: 'Walk: On Toes'
};

const REFLEX_LABELS: Record<string, { name: string; cat: string }> = {
  abdominal: { name: 'Abdominal', cat: 'Superficial' },
  plantar: { name: 'Plantar', cat: 'Superficial' },
  biceps: { name: 'Biceps', cat: 'Deep' },
  brachioradialis: { name: 'Brachioradialis', cat: 'Deep' },
  triceps: { name: 'Triceps', cat: 'Deep' },
  knee: { name: 'Knee', cat: 'Deep' },
  ankle: { name: 'Ankle', cat: 'Deep' }
};

export interface MMSEData {
  questions?: Record<string, string | number | null> | null;
  totalScore?: string | null;
  total?: string | number | null;
}

export interface GCSData {
  eye?: string | number | null;
  verbal?: string | number | null;
  motor?: string | number | null;
  total?: string | number | null;
}

export interface CoordinationItem {
  test: string;
  result: string;
}

export interface ComponentObservationItem {
  component: string;
  observation: string;
}

export interface CanonicalNeurologicalReport {
  gcs?: GCSData | null;
  mmse?: MMSEData | string | null;
  mental?: Record<string, any> | null;
  cranialNerves?: Record<string, any> | null;
  sensory?: Record<string, any> | null;
  reflexes?: Record<string, any> | null;
  voluntaryControl?: Record<string, any> | null;
  muscleGirth?: Record<string, any> | null;
  coordination?: CoordinationItem[] | null;
  posture?: ComponentObservationItem[] | null;
  gait?: ComponentObservationItem[] | null;
  handFunction?: Record<string, any> | null;
}

export interface NeuroSummaryViewProps {
  neuroData?: CanonicalNeurologicalReport | any;
}

export function formatNeuroValue(value: unknown): string {
  if (value === null || value === undefined || value === '') {
    return '—';
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  return '—';
}

export const getMMSEDisplayTotal = (mmse: any): string | null => {
  if (!mmse) return null;
  if (typeof mmse === 'string' || typeof mmse === 'number') {
    const s = String(mmse).trim();
    if (!s) return null;
    return s.includes('/') ? s : `${s}/30`;
  }
  if (typeof mmse === 'object') {
    const total = mmse.totalScore ?? mmse.total ?? mmse.score ?? null;
    if (total !== null && total !== undefined && total !== '' && typeof total !== 'object') {
      const s = String(total).trim();
      return s.includes('/') ? s : `${s}/30`;
    }
  }
  return null;
};

export const getMMSEQuestions = (mmse: any): Record<string, string | number> | null => {
  if (!mmse || typeof mmse !== 'object') return null;
  const questionsObj = (mmse.questions && typeof mmse.questions === 'object') ? mmse.questions : mmse;
  const result: Record<string, string | number> = {};
  let found = false;
  Object.entries(questionsObj).forEach(([k, v]) => {
    if (k.startsWith('q') && v !== null && v !== undefined && v !== '' && typeof v !== 'object') {
      result[k] = v as string | number;
      found = true;
    }
  });
  return found ? result : null;
};

export function NeuroSummaryView({ neuroData }: NeuroSummaryViewProps) {
  if (!neuroData || typeof neuroData !== 'object') return null;

  const cranial = neuroData.cranialNerves || neuroData.cranial;
  const sensory = neuroData.sensory;
  const muscleGirth = neuroData.muscleGirth;
  const voluntaryControl = neuroData.voluntaryControl;
  const reflexes = neuroData.reflexes;
  const coordination = neuroData.coordination;
  const balance = neuroData.balance;
  const posture = neuroData.posture;
  const gait = neuroData.gait;
  const handFunction = neuroData.handFunction;

  const mmseTotal = getMMSEDisplayTotal(neuroData.mmse);
  const mmseQuestions = getMMSEQuestions(neuroData.mmse);

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Mental / GCS / MMSE */}
      {(neuroData.gcs || mmseTotal || mmseQuestions || (neuroData.mental && Object.values(neuroData.mental).some(Boolean))) && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            {neuroData.gcs && (
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">GCS Score:</span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                  E:{formatNeuroValue(neuroData.gcs.eye)} V:{formatNeuroValue(neuroData.gcs.verbal)} M:{formatNeuroValue(neuroData.gcs.motor)} ({formatNeuroValue(neuroData.gcs.total)}/15)
                </span>
              </div>
            )}
            {mmseTotal && (
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">MMSE Score:</span>
                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{mmseTotal}</span>
              </div>
            )}
            {neuroData.mental && Object.values(neuroData.mental).some(Boolean) && (
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Mental:</span>
                {Object.entries(neuroData.mental).map(([k, v]) => v && typeof v !== 'object' ? (
                  <span key={k} className="text-slate-700 dark:text-slate-300">
                    <strong className="capitalize">{k}:</strong> {formatNeuroValue(v)}
                  </span>
                ) : null)}
              </div>
            )}
          </div>

          {/* MMSE Question Breakdown if available */}
          {mmseQuestions && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">MMSE Question Breakdown:</span>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-11 gap-1.5">
                {Object.entries(mmseQuestions).map(([qKey, val]) => (
                  <div key={qKey} className="p-1.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-150 dark:border-slate-700/60 rounded-lg text-center">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">{qKey}</div>
                    <div className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{formatNeuroValue(val)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Cranial Nerves */}
      {cranial && Object.values(cranial).some(Boolean) && (
        <div>
          <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase block mb-1.5">Cranial Nerves</span>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="p-2 text-left border-b border-r border-slate-200 dark:border-slate-800">Nerve</th>
                  <th className="p-2 text-left border-b border-slate-200 dark:border-slate-800">Status / Notes</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(CRANIAL_NERVE_LABELS).map(([key, label]) => {
                  const val = cranial[key];
                  if (!val) return null;
                  return (
                    <tr key={key} className="border-b last:border-0 border-slate-150 dark:border-slate-800">
                      <td className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-150 dark:border-slate-800">{label}</td>
                      <td className="p-2 text-slate-800 dark:text-slate-200">{String(val)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sensory Assessment */}
      {sensory && (
        Object.keys(SENSORY_LABELS).some(k => sensory[k] && Object.values(sensory[k]).some(Boolean)) ||
        sensory.dermatomes || sensory.myotomes
      ) && (
        <div>
          <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase block mb-1.5">Sensory Assessment</span>
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
              <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                <tr>
                  <th className="p-2 text-left border-b border-r border-slate-200 dark:border-slate-800" rowSpan={2}>Sensation</th>
                  <th className="p-1 text-center border-b border-r border-slate-200 dark:border-slate-800" colSpan={2}>Upper Extremity</th>
                  <th className="p-1 text-center border-b border-r border-slate-200 dark:border-slate-800" colSpan={2}>Lower Extremity</th>
                  <th className="p-1 text-center border-b border-r border-slate-200 dark:border-slate-800" colSpan={2}>Trunk</th>
                  <th className="p-2 text-left border-b border-slate-200 dark:border-slate-800" rowSpan={2}>Comments</th>
                </tr>
                <tr>
                  <th className="p-1 text-center border-b border-r border-slate-200 dark:border-slate-800">Rt</th>
                  <th className="p-1 text-center border-b border-r border-slate-200 dark:border-slate-800">Lt</th>
                  <th className="p-1 text-center border-b border-r border-slate-200 dark:border-slate-800">Rt</th>
                  <th className="p-1 text-center border-b border-r border-slate-200 dark:border-slate-800">Lt</th>
                  <th className="p-1 text-center border-b border-r border-slate-200 dark:border-slate-800">Rt</th>
                  <th className="p-1 text-center border-b border-r border-slate-200 dark:border-slate-800">Lt</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(SENSORY_LABELS).map(([key, label]) => {
                  const item = sensory[key];
                  if (!item || (typeof item === 'object' && !Object.values(item).some(Boolean))) return null;

                  if (typeof item !== 'object') {
                    return (
                      <tr key={key} className="border-b last:border-0 border-slate-150 dark:border-slate-800">
                        <td className="p-1.5 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-150 dark:border-slate-800">{label}</td>
                        <td className="p-1.5 text-slate-800 dark:text-slate-200" colSpan={7}>{String(item)}</td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={key} className="border-b last:border-0 border-slate-150 dark:border-slate-800 hover:bg-slate-50/50">
                      <td className="p-1.5 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-150 dark:border-slate-800">{label}</td>
                      <td className="p-1 text-center border-r border-slate-150 dark:border-slate-800">{item.ueRt || '—'}</td>
                      <td className="p-1 text-center border-r border-slate-150 dark:border-slate-800">{item.ueLt || '—'}</td>
                      <td className="p-1 text-center border-r border-slate-150 dark:border-slate-800">{item.leRt || '—'}</td>
                      <td className="p-1 text-center border-r border-slate-150 dark:border-slate-800">{item.leLt || '—'}</td>
                      <td className="p-1 text-center border-r border-slate-150 dark:border-slate-800">{item.tRt || '—'}</td>
                      <td className="p-1 text-center border-r border-slate-150 dark:border-slate-800">{item.tLt || '—'}</td>
                      <td className="p-1.5 text-slate-800 dark:text-slate-200">{item.comments || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {(sensory.dermatomes || sensory.myotomes) && (
            <div className="mt-2 text-xs flex flex-wrap gap-4 text-slate-700 dark:text-slate-300">
              {sensory.dermatomes && <p><strong>Dermatomes:</strong> {sensory.dermatomes}</p>}
              {sensory.myotomes && <p><strong>Myotomes:</strong> {sensory.myotomes}</p>}
            </div>
          )}
        </div>
      )}

      {/* Muscle Girth & Voluntary Control */}
      {((muscleGirth && Object.values(muscleGirth).some((v: any) => v && (v.rt || v.lt))) ||
        (voluntaryControl && Object.values(voluntaryControl).some((v: any) => v && (v.rt || v.lt)))) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {muscleGirth && Object.values(muscleGirth).some((v: any) => v && (v.rt || v.lt)) && (
            <div>
              <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase block mb-1.5">Muscle Girth (cm)</span>
              <table className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-2 text-left border-b border-r border-slate-200 dark:border-slate-800">Area</th>
                    <th className="p-2 text-center border-b border-r border-slate-200 dark:border-slate-800">Right</th>
                    <th className="p-2 text-center border-b border-slate-200 dark:border-slate-800">Left</th>
                  </tr>
                </thead>
                <tbody>
                  {['arm', 'forearm', 'thigh', 'calf'].map((area) => {
                    const val = muscleGirth[area];
                    if (!val || (!val.rt && !val.lt)) return null;
                    return (
                      <tr key={area} className="border-b last:border-0 border-slate-150 dark:border-slate-800">
                        <td className="p-2 font-semibold capitalize border-r border-slate-150 dark:border-slate-800">{area}</td>
                        <td className="p-2 text-center border-r border-slate-150 dark:border-slate-800">{val.rt || '—'}</td>
                        <td className="p-2 text-center">{val.lt || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {voluntaryControl && Object.values(voluntaryControl).some((v: any) => v && (v.rt || v.lt)) && (
            <div>
              <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase block mb-1.5">Voluntary Control</span>
              <table className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                  <tr>
                    <th className="p-2 text-left border-b border-r border-slate-200 dark:border-slate-800">Side</th>
                    <th className="p-2 text-center border-b border-r border-slate-200 dark:border-slate-800">Right</th>
                    <th className="p-2 text-center border-b border-slate-200 dark:border-slate-800">Left</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { key: 'upperLimb', label: 'Upper Limb' },
                    { key: 'lowerLimb', label: 'Lower Limb' }
                  ].map(({ key, label }) => {
                    const val = voluntaryControl[key];
                    if (!val || (!val.rt && !val.lt)) return null;
                    return (
                      <tr key={key} className="border-b last:border-0 border-slate-150 dark:border-slate-800">
                        <td className="p-2 font-semibold border-r border-slate-150 dark:border-slate-800">{label}</td>
                        <td className="p-2 text-center border-r border-slate-150 dark:border-slate-800">{val.rt || '—'}</td>
                        <td className="p-2 text-center">{val.lt || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Reflexes Table */}
      {reflexes && (
        Object.keys(REFLEX_LABELS).some(k => reflexes[k] && (reflexes[k].rt || reflexes[k].lt)) ||
        reflexes.pathological
      ) && (
        <div>
          <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase block mb-1.5">Reflexes</span>
          <table className="w-full text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
              <tr>
                <th className="p-2 text-left border-b border-r border-slate-200 dark:border-slate-800">Category</th>
                <th className="p-2 text-left border-b border-r border-slate-200 dark:border-slate-800">Reflex</th>
                <th className="p-2 text-center border-b border-r border-slate-200 dark:border-slate-800">Left</th>
                <th className="p-2 text-center border-b border-slate-200 dark:border-slate-800">Right</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(REFLEX_LABELS).map(([key, { name, cat }]) => {
                const val = reflexes[key];
                if (!val || (!val.rt && !val.lt)) return null;
                return (
                  <tr key={key} className="border-b last:border-0 border-slate-150 dark:border-slate-800">
                    <td className="p-2 font-bold uppercase text-[10px] text-slate-400 border-r border-slate-150 dark:border-slate-800">{cat}</td>
                    <td className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-150 dark:border-slate-800">{name}</td>
                    <td className="p-2 text-center border-r border-slate-150 dark:border-slate-800">{val.lt || '—'}</td>
                    <td className="p-2 text-center">{val.rt || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {reflexes.pathological && (
            <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">
              <strong>Pathological Reflexes:</strong> {reflexes.pathological}
            </p>
          )}
        </div>
      )}

      {/* Coordination */}
      {coordination && Array.isArray(coordination) && coordination.length > 0 && (
        <div>
          <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase block mb-1.5">Coordination & Balance</span>
          <div className="flex flex-col gap-2">
            {coordination.map((c: any, i: number) => {
              if (!c) return null;
              const testLabel = typeof c.test === 'string' ? c.test.replace(/([A-Z])/g, ' $1').trim() : 'Test';
              const displayRes = typeof c.result === 'string' ? c.result : (c.right || c.left ? `Right: ${c.right || '—'}, Left: ${c.left || '—'}` : '—');
              return (
                <div key={i} className="px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between gap-2 text-xs">
                  <span className="font-bold text-slate-600 dark:text-slate-400 capitalize">{testLabel}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{displayRes}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Balance / Posture / Gait / Hand Function */}
      {((balance && Object.values(balance).some(Boolean)) ||
        (posture && Array.isArray(posture) && posture.length > 0) ||
        (gait && Array.isArray(gait) && gait.length > 0) ||
        (handFunction && Object.values(handFunction).some(Boolean))) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {balance && Object.values(balance).some(Boolean) && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Balance</span>
              {Object.entries(balance).map(([k, v]) => v && typeof v !== 'object' ? (
                <p key={k} className="text-slate-700 dark:text-slate-300"><strong className="capitalize">{k.replace(/([A-Z])/g, ' $1')}:</strong> {String(v)}</p>
              ) : null)}
            </div>
          )}

          {posture && Array.isArray(posture) && posture.length > 0 && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Posture</span>
              {posture.map((p: any, i: number) => (
                <p key={i} className="text-slate-700 dark:text-slate-300">
                  <strong className="capitalize">{typeof p.component === 'string' ? p.component : 'Posture'}:</strong> {typeof p.observation === 'string' ? p.observation : '—'}
                </p>
              ))}
            </div>
          )}

          {gait && Array.isArray(gait) && gait.length > 0 && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Gait</span>
              {gait.map((g: any, i: number) => (
                <p key={i} className="text-slate-700 dark:text-slate-300">
                  <strong className="capitalize">{typeof g.component === 'string' ? g.component : 'Gait'}:</strong> {typeof g.observation === 'string' ? g.observation : '—'}
                </p>
              ))}
            </div>
          )}

          {handFunction && Object.values(handFunction).some(Boolean) && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hand Function</span>
              {Object.entries(handFunction).map(([k, v]) => v && typeof v !== 'object' ? (
                <p key={k} className="text-slate-700 dark:text-slate-300"><strong className="capitalize">{k.replace(/([A-Z])/g, ' $1')}:</strong> {String(v)}</p>
              ) : null)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
