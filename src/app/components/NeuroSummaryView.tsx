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

interface NeuroSummaryViewProps {
  neuroData: any;
}

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

  return (
    <div className="flex flex-col gap-4 text-xs">
      {/* Mental / GCS / MMSE */}
      {(neuroData.gcs?.e || neuroData.gcs?.v || neuroData.gcs?.m || neuroData.gcs?.e_v_m || neuroData.gcs?.total || neuroData.mmse?.total || (neuroData.mental && Object.values(neuroData.mental).some(Boolean))) && (
        <div className="flex flex-wrap gap-3">
          {(neuroData.gcs?.e || neuroData.gcs?.v || neuroData.gcs?.m || neuroData.gcs?.e_v_m || neuroData.gcs?.total) && (
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">GCS Score:</span>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">
                {neuroData.gcs?.e || neuroData.gcs?.v || neuroData.gcs?.m
                  ? `E:${neuroData.gcs.e || '-'} V:${neuroData.gcs.v || '-'} M:${neuroData.gcs.m || '-'} (${neuroData.gcs.total || '0'}/15)`
                  : `EVM = ${neuroData.gcs?.e_v_m || neuroData.gcs?.total} / 15`}
              </span>
            </div>
          )}
          {neuroData.mmse?.total && (
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">MMSE Total:</span>
              <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{neuroData.mmse.total} / 30</span>
            </div>
          )}
          {neuroData.mental && Object.values(neuroData.mental).some(Boolean) && (
            <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center gap-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Mental:</span>
              {Object.entries(neuroData.mental).map(([k, v]) => v ? (
                <span key={k} className="text-slate-700 dark:text-slate-300">
                  <strong className="capitalize">{k}:</strong> {String(v)}
                </span>
              ) : null)}
            </div>
          )}
        </div>
      )}

      {/* Cranial Nerves */}
      {cranial && Object.values(cranial).some(Boolean) && (
        <div>
          <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase block mb-1.5">Cranial Nerves</span>
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full min-w-[500px] text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
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
                    <tr key={key} className="border-b last:border-0 border-slate-100 dark:border-slate-800">
                      <td className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">{label}</td>
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
          <div className="w-full min-w-0 overflow-x-auto">
            <table className="w-full min-w-[500px] text-[11px] border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
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
                      <tr key={key} className="border-b last:border-0 border-slate-100 dark:border-slate-800">
                        <td className="p-1.5 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">{label}</td>
                        <td className="p-1.5 text-slate-800 dark:text-slate-200" colSpan={7}>{String(item)}</td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={key} className="border-b last:border-0 border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                      <td className="p-1.5 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">{label}</td>
                      <td className="p-1 text-center border-r border-slate-100 dark:border-slate-800">{item.ueRt || '—'}</td>
                      <td className="p-1 text-center border-r border-slate-100 dark:border-slate-800">{item.ueLt || '—'}</td>
                      <td className="p-1 text-center border-r border-slate-100 dark:border-slate-800">{item.leRt || '—'}</td>
                      <td className="p-1 text-center border-r border-slate-100 dark:border-slate-800">{item.leLt || '—'}</td>
                      <td className="p-1 text-center border-r border-slate-100 dark:border-slate-800">{item.tRt || '—'}</td>
                      <td className="p-1 text-center border-r border-slate-100 dark:border-slate-800">{item.tLt || '—'}</td>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0">
          {muscleGirth && Object.values(muscleGirth).some((v: any) => v && (v.rt || v.lt)) && (
            <div>
              <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase block mb-1.5">Muscle Girth (cm)</span>
              <div className="overflow-x-auto w-full">
  <table className="w-full min-w-[500px] text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
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
                      <tr key={area} className="border-b last:border-0 border-slate-100 dark:border-slate-800">
                        <td className="p-2 font-semibold capitalize border-r border-slate-100 dark:border-slate-800">{area}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800">{val.rt || '—'}</td>
                        <td className="p-2 text-center">{val.lt || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
</div>
            </div>
          )}

          {voluntaryControl && Object.values(voluntaryControl).some((v: any) => v && (v.rt || v.lt)) && (
            <div>
              <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase block mb-1.5">Voluntary Control</span>
              <div className="overflow-x-auto w-full">
  <table className="w-full min-w-[500px] text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
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
                      <tr key={key} className="border-b last:border-0 border-slate-100 dark:border-slate-800">
                        <td className="p-2 font-semibold border-r border-slate-100 dark:border-slate-800">{label}</td>
                        <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800">{val.rt || '—'}</td>
                        <td className="p-2 text-center">{val.lt || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
</div>
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
          <div className="overflow-x-auto w-full">
  <table className="w-full min-w-[500px] text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
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
                  <tr key={key} className="border-b last:border-0 border-slate-100 dark:border-slate-800">
                    <td className="p-2 font-bold uppercase text-[10px] text-slate-400 border-r border-slate-100 dark:border-slate-800">{cat}</td>
                    <td className="p-2 font-semibold text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800">{name}</td>
                    <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800">{val.lt || '—'}</td>
                    <td className="p-2 text-center">{val.rt || '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
</div>
          {reflexes.pathological && (
            <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">
              <strong>Pathological Reflexes:</strong> {reflexes.pathological}
            </p>
          )}
        </div>
      )}

      {/* Coordination */}
      {coordination && (
        Object.keys(NON_EQUILIBRIUM_LABELS).some(k => coordination[k] && (coordination[k].rt || coordination[k].lt)) ||
        Object.keys(EQUILIBRIUM_LABELS).some(k => coordination[k]) ||
        coordination.involuntaryMovements
      ) && (
        <div>
          <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-400 uppercase block mb-1.5">Coordination & Balance</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full min-w-0">
            {/* Non Equilibrium */}
            {Object.keys(NON_EQUILIBRIUM_LABELS).some(k => coordination[k] && (coordination[k].rt || coordination[k].lt)) && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Non-Equilibrium Tests</span>
                <div className="overflow-x-auto w-full">
  <table className="w-full min-w-[500px] text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-2 text-left border-b border-r border-slate-200 dark:border-slate-800">Test</th>
                      <th className="p-2 text-center border-b border-r border-slate-200 dark:border-slate-800">Right</th>
                      <th className="p-2 text-center border-b border-slate-200 dark:border-slate-800">Left</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(NON_EQUILIBRIUM_LABELS).map(([key, label]) => {
                      const val = coordination[key];
                      if (!val || (!val.rt && !val.lt)) return null;
                      return (
                        <tr key={key} className="border-b last:border-0 border-slate-100 dark:border-slate-800">
                          <td className="p-2 font-semibold border-r border-slate-100 dark:border-slate-800">{label}</td>
                          <td className="p-2 text-center border-r border-slate-100 dark:border-slate-800">{val.rt || '—'}</td>
                          <td className="p-2 text-center">{val.lt || '—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
</div>
              </div>
            )}

            {/* Equilibrium */}
            {Object.keys(EQUILIBRIUM_LABELS).some(k => coordination[k]) && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Equilibrium Tests</span>
                <div className="overflow-x-auto w-full">
  <table className="w-full min-w-[500px] text-xs border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                  <thead className="bg-slate-100 dark:bg-slate-800 font-bold text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="p-2 text-left border-b border-r border-slate-200 dark:border-slate-800">Test</th>
                      <th className="p-2 text-center border-b border-slate-200 dark:border-slate-800">Grade / Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(EQUILIBRIUM_LABELS).map(([key, label]) => {
                      const val = coordination[key];
                      if (!val) return null;
                      return (
                        <tr key={key} className="border-b last:border-0 border-slate-100 dark:border-slate-800">
                          <td className="p-2 font-semibold border-r border-slate-100 dark:border-slate-800">{label}</td>
                          <td className="p-2 text-center">{String(val)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
</div>
              </div>
            )}
          </div>

          {coordination.involuntaryMovements && (
            <p className="mt-2 text-xs text-slate-700 dark:text-slate-300">
              <strong>Involuntary Movements:</strong> {coordination.involuntaryMovements}
            </p>
          )}
        </div>
      )}

      {/* Balance / Posture / Gait / Hand Function */}
      {((balance && Object.values(balance).some(Boolean)) ||
        (posture && Object.values(posture).some((v: any) => v && (v.frontal || v.sagittal))) ||
        (gait && Object.values(gait).some(Boolean)) ||
        (handFunction && Object.values(handFunction).some(Boolean))) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          {balance && Object.values(balance).some(Boolean) && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Balance</span>
              {Object.entries(balance).map(([k, v]) => v ? (
                <p key={k} className="text-slate-700 dark:text-slate-300"><strong className="capitalize">{k.replace(/([A-Z])/g, ' $1')}:</strong> {String(v)}</p>
              ) : null)}
            </div>
          )}

          {posture && Object.values(posture).some((v: any) => v && (v.frontal || v.sagittal)) && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Posture</span>
              {Object.entries(posture).map(([k, v]: [string, any]) => v && (v.frontal || v.sagittal) ? (
                <p key={k} className="text-slate-700 dark:text-slate-300"><strong className="capitalize">{k}:</strong> F: {v.frontal || '—'}, S: {v.sagittal || '—'}</p>
              ) : null)}
            </div>
          )}

          {gait && Object.values(gait).some(Boolean) && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Gait</span>
              {Object.entries(gait).map(([k, v]) => v ? (
                <p key={k} className="text-slate-700 dark:text-slate-300"><strong className="capitalize">{k.replace(/([A-Z])/g, ' $1')}:</strong> {String(v)}</p>
              ) : null)}
            </div>
          )}

          {handFunction && Object.values(handFunction).some(Boolean) && (
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Hand Function</span>
              {Object.entries(handFunction).map(([k, v]) => v ? (
                <p key={k} className="text-slate-700 dark:text-slate-300"><strong className="capitalize">{k.replace(/([A-Z])/g, ' $1')}:</strong> {String(v)}</p>
              ) : null)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


