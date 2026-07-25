import React, { useState, useEffect } from 'react';
import { BorgScaleRadio } from './BorgScaleRadio';
import { User, Phone, Mail, Activity, Calendar, FileText, Save, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function PatientAssessmentForm({ patientId, initialData, onSaveSuccess, className = '' }) {
  const [patient, setPatient] = useState(initialData || null);
  const [borgScale, setBorgScale] = useState(initialData?.borgScale ?? null);
  const [assessmentNotes, setAssessmentNotes] = useState(initialData?.assessmentNotes || '');
  const [loading, setLoading] = useState(!initialData && !!patientId);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null); // { type: 'success'|'error', text: '' }

  // Load patient data if patientId is provided and no initialData
  useEffect(() => {
    if (!patientId) return;

    let isMounted = true;
    const fetchPatientDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const res = await fetch(`/api/patients/${patientId}`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });

        if (!res.ok) {
          throw new Error(`Failed to load patient (Status ${res.status})`);
        }

        const json = await res.json();
        const data = json.data || json;

        if (isMounted) {
          setPatient(data);
          if (data.borgScale !== undefined) setBorgScale(data.borgScale);
          if (data.assessmentNotes !== undefined) setAssessmentNotes(data.assessmentNotes);
        }
      } catch (err) {
        if (isMounted) {
          setStatusMessage({ type: 'error', text: err.message || 'Error fetching patient details' });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPatientDetails();
    return () => { isMounted = false; };
  }, [patientId]);

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!patientId && !patient?.id) {
      setStatusMessage({ type: 'error', text: 'No active patient ID' });
      return;
    }

    const targetId = patientId || patient?.id;
    setSaving(true);
    setStatusMessage(null);

    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const res = await fetch(`/api/patients/${targetId}/assessment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          borgScale: borgScale !== null ? Number(borgScale) : null,
          assessmentNotes: assessmentNotes.trim()
        })
      });

      const json = await res.json();
      if (!res.ok || json.success === false) {
        throw new Error(json.message || 'Failed to save assessment');
      }

      setStatusMessage({ type: 'success', text: 'Assessment saved successfully!' });
      if (json.data) {
        setPatient(prev => prev ? { ...prev, ...json.data, borgScale, assessmentNotes } : json.data);
      }
      if (onSaveSuccess) {
        onSaveSuccess(json.data || json);
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Error saving assessment' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
        <span className="ml-3 font-medium text-slate-600 dark:text-slate-300">Loading patient details...</span>
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-6 bg-white dark:bg-slate-850 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
      {/* Patient Details Card */}
      {patient && (
        <div className="bg-slate-50 dark:bg-slate-900/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xl shrink-0">
              {patient.name ? patient.name.charAt(0).toUpperCase() : <User size={24} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{patient.name || 'Patient'}</h3>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                  ID: {patient.displayId || patient.id || 'N/A'}
                </span>
              </div>
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                Condition: {patient.condition || 'General Evaluation'}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500 dark:text-slate-400">
                {patient.age && <span>Age: {patient.age} yrs</span>}
                {patient.phone && (
                  <span className="flex items-center gap-1">
                    <Phone size={12} /> {patient.phone}
                  </span>
                )}
                {patient.email && (
                  <span className="flex items-center gap-1">
                    <Mail size={12} /> {patient.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end text-xs text-slate-500 dark:text-slate-400 border-t md:border-t-0 pt-3 md:pt-0 border-slate-200 dark:border-slate-800">
            <span className="flex items-center gap-1 font-semibold text-slate-700 dark:text-slate-300">
              <Calendar size={14} className="text-slate-400" />
              Last Assessment
            </span>
            <span className="font-mono mt-0.5">
              {patient.lastSession || patient.lastVisitDate || patient.updatedAt
                ? new Date(patient.lastSession || patient.lastVisitDate || patient.updatedAt).toLocaleString()
                : 'No prior assessment recorded'}
            </span>
          </div>
        </div>
      )}

      {/* Status Alert */}
      {statusMessage && (
        <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Borg Scale Radio Section */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Activity size={16} className="text-blue-500" />
          Borg Perceived Exertion Scale (0 - 10)
        </label>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
          Select a single exertion level corresponding to patient perception.
        </p>
        <BorgScaleRadio value={borgScale} onChange={setBorgScale} />
      </div>

      {/* Assessment Notes Section */}
      <div className="flex flex-col gap-2">
        <label htmlFor="assessment-notes" className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <FileText size={16} className="text-blue-500" />
          Assessment Notes & Clinical Summary
        </label>
        <textarea
          id="assessment-notes"
          rows={4}
          value={assessmentNotes}
          onChange={(e) => setAssessmentNotes(e.target.value)}
          placeholder="Enter patient assessment notes, progress details, clinical observations..."
          className="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-y"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          <span>{saving ? 'Saving Assessment...' : 'Save Assessment'}</span>
        </button>
      </div>
    </div>
  );
}

export default PatientAssessmentForm;
