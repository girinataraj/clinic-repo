import { useMemo, useState } from 'react';
import { ROM_CONFIG } from '../screens/assessment/clinicalConfig';
import { 
  Activity, Scale, Stethoscope, CheckSquare, Dumbbell, ClipboardList,
  Heart, StickyNote, Brain, Building2, Printer, Download, Share2, ArrowLeft, ShieldCheck, Loader2, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { NeuroSummaryView } from './NeuroSummaryView';
import api from '../../services/api';
import { ENDPOINTS } from '../../services/endpoints';

interface EvaluationSummaryReportProps {
  evaluation: any;
  isDoctorRole?: boolean;
  onBack?: () => void;
}

// Safely format any string, number, array, or nested medical object without [object Object] errors
function formatDisplayValue(val: any): string {
  if (val === null || val === undefined) return '';
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    return val.map(item => typeof item === 'object' ? formatDisplayValue(item) : String(item)).filter(Boolean).join(', ');
  }
  if (typeof val === 'object') {
    if (val.systolic !== undefined && val.diastolic !== undefined) {
      return `${val.systolic}/${val.diastolic}${val.unit ? ` ${val.unit}` : ''}${val.status ? ` (${val.status})` : ''}`;
    }
    if (val.value !== undefined) {
      const parts = [`${val.value}${val.unit ? ` ${val.unit}` : ''}`];
      if (val.scale) parts.push(`/${val.scale}`);
      if (val.status && val.status !== 'normal') parts.push(`(${val.status})`);
      if (val.severity) parts.push(`- ${val.severity}`);
      return parts.join(' ');
    }
    if (val.complaint) {
      return `${val.complaint}${val.duration && val.duration !== 'Unknown' ? ` (${val.duration})` : ''}${val.severity ? ` - ${val.severity}` : ''}${val.onset ? ` [${val.onset}]` : ''}`;
    }
    if (val.name) {
      return `${val.name}${val.type ? ` (${val.type})` : ''}${val.status ? ` - ${val.status}` : ''}`;
    }
    if (val.condition) {
      return `${val.condition}${val.severity ? ` (${val.severity})` : ''}${val.icdCode ? ` [ICD-10: ${val.icdCode}]` : ''}`;
    }
    if (val.modality || val.fullName) {
      return `${val.fullName || val.modality}${val.frequency ? ` · ${val.frequency}` : ''}${val.duration ? ` · ${val.duration}` : ''}${val.purpose ? ` (${val.purpose})` : ''}`;
    }
    return Object.entries(val)
      .map(([k, v]) => `${k.replace(/([A-Z])/g, ' $1').trim()}: ${typeof v === 'object' ? formatDisplayValue(v) : v}`)
      .join(' · ');
  }
  return String(val);
}

export function EvaluationSummaryReport({ evaluation, isDoctorRole = false, onBack }: EvaluationSummaryReportProps) {
  const navigate = useNavigate();
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  if (!evaluation) return null;

  // Unpack root payload if nested inside report key
  const rawData = evaluation.report ? evaluation.report : evaluation;

  // Metadata & Hospital Info
  const metadata = rawData.metadata;
  const hospitalInfo = metadata?.hospitalInfo;
  const patientInfo = rawData.patientInfo || rawData.patient || {};
  const clinician = rawData.clinician || {};
  const vitalsObj = rawData.vitals || rawData.vitalSigns || {};

  // Patient Demographic Variables
  const therapistName = clinician?.name || rawData.therapistName || rawData.doctor_name || rawData.createdBy?.name || 'Dr. SV. Sathish Kumar';
  const patientName = patientInfo.name || rawData.patientName || rawData.patient_name || rawData.name || 'Patient';
  const patientDisplayId = patientInfo.patientId || patientInfo.displayId || patientInfo.display_id || rawData.patientId || rawData.displayId || rawData.display_id || (rawData.id ? `EVAL-${String(rawData.id).substring(0, 8)}` : '—');
  const patientAge = patientInfo.age ?? rawData.age ?? '—';
  const patientGender = patientInfo.gender || rawData.gender || '—';
  const patientPhone = patientInfo.phone || rawData.patientPhone || rawData.phone || '—';
  const patientReferredBy = patientInfo.referredBy || patientInfo.referred_by || rawData.referredBy || rawData.referred_by || 'Self';
  const visitType = patientInfo.visitType || rawData.visitType || rawData.visit_type || 'Clinic';
  const billAmount = patientInfo.billAmount != null ? patientInfo.billAmount : (rawData.billAmount != null ? rawData.billAmount : (rawData.bill_amount != null ? rawData.bill_amount : '—'));

  // Vital Signs
  const rawBp = rawData.bp || rawData.bloodPressure || vitalsObj.bloodPressure || (vitalsObj.bp_sys && vitalsObj.bp_dia ? `${vitalsObj.bp_sys}/${vitalsObj.bp_dia}` : vitalsObj.bp);
  const bp = formatDisplayValue(rawBp);

  const rawPr = rawData.pr || rawData.pulseRate || rawData.pulse || vitalsObj.pulse || vitalsObj.pulse_rate || vitalsObj.pr;
  const pr = formatDisplayValue(rawPr);

  const rawSpo2 = rawData.spo2 || rawData.spO2 || vitalsObj.spO2 || vitalsObj.spo2;
  const spo2 = formatDisplayValue(rawSpo2);

  const rawTemp = rawData.temperature || rawData.temp || vitalsObj.temperature || vitalsObj.temp;
  const temp = formatDisplayValue(rawTemp);

  const rawEf = rawData.ef || rawData.ejectionFraction || vitalsObj.ejectionFraction || vitalsObj.ef;
  const ef = formatDisplayValue(rawEf);

  const rawPain = rawData.painScale ?? vitalsObj.painScale ?? rawData.painLevel ?? rawData.pain_level ?? vitalsObj.pain_scale;
  const painLevel = formatDisplayValue(rawPain);

  // Chief Complaints
  const rawComplaints = rawData.chiefComplaints || rawData.chief_complaints || rawData.complaints;
  const chiefComplaintsArray: any[] = Array.isArray(rawComplaints)
    ? rawComplaints
    : (typeof rawComplaints === 'string' && rawComplaints.trim() ? [rawComplaints.trim()] : []);

  // Medical History
  const rawMedHist = rawData.medicalHistory || rawData.medical_history;
  const medicalHistoryList: string[] = [];
  if (Array.isArray(rawMedHist)) {
    rawMedHist.forEach(item => medicalHistoryList.push(formatDisplayValue(item)));
  } else if (typeof rawMedHist === 'object' && rawMedHist !== null) {
    if (Array.isArray(rawMedHist.conditions)) {
      rawMedHist.conditions.forEach((c: any) => medicalHistoryList.push(formatDisplayValue(c)));
    }
  }

  // Associated Symptoms & Pains
  const rawAssoc = rawData.associatedSymptoms || rawData.associated_symptoms;
  let associatedSymptomsList: string[] = [];
  let painAreasList: string[] = [];

  if (Array.isArray(rawAssoc)) {
    associatedSymptomsList = rawAssoc.map(s => formatDisplayValue(s));
  } else if (typeof rawAssoc === 'object' && rawAssoc !== null) {
    if (Array.isArray(rawAssoc.symptoms)) {
      associatedSymptomsList = rawAssoc.symptoms.map((s: any) => formatDisplayValue(s));
    }
    if (Array.isArray(rawAssoc.painAreas)) {
      painAreasList = rawAssoc.painAreas.map((p: any) => formatDisplayValue(p));
    }
  }

  const rawPains = rawData.associatedPains || rawData.associated_pains;
  if (Array.isArray(rawPains)) {
    rawPains.forEach(p => painAreasList.push(formatDisplayValue(p)));
  }

  // Clinical Examination
  const clinicalExamination = rawData.clinicalExamination || rawData.clinical_examination;
  const specialPhysicalTestsList: any[] = Array.isArray(clinicalExamination?.specialPhysicalTests)
    ? clinicalExamination.specialPhysicalTests
    : [];
  const testsObj = clinicalExamination?.tests;

  // Range of Motion & Muscle Power
  const rawRom = rawData.rangeOfMotion || rawData.range_of_motion || rawData.romData || rawData.musclePowerRom || rawData.muscle_power_rom || clinicalExamination?.musclePowerRom || clinicalExamination?.muscle_power_rom;
  const legacyMusclePower = clinicalExamination?.musclePower || rawData.musclePower;

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
    } else if (Array.isArray(rawRom)) {
      rawRom.forEach((m: any) => {
        rows.push({
          joint: m.joint,
          movement: m.movement,
          powerRt: cleanPower(m.powerRt ?? m.powerRight),
          powerLt: cleanPower(m.powerLt ?? m.powerLeft),
          romRt: cleanRom(m.romRt ?? m.romRight),
          romLt: cleanRom(m.romLt ?? m.romLeft),
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
              const pRt = cleanPower(entry.powerRt ?? entry.powerRight);
              const pLt = cleanPower(entry.powerLt ?? entry.powerLeft);
              const rRt = cleanRom(entry.romRt !== undefined && entry.romRt !== '' ? entry.romRt : entry.romRight);
              const rLt = cleanRom(entry.romLt !== undefined && entry.romLt !== '' ? entry.romLt : entry.romLeft);
              rows.push({
                joint: joint.label,
                movement: movement,
                powerRt: pRt,
                powerLt: pLt,
                romRt: rRt,
                romLt: rLt,
              });
            }
          });
        });
      });
    }
    return rows;
  }, [rawRom]);

  // Neurological Examination
  const rawNeuro = rawData.neurologicalExamination || rawData.neurological_examination || rawData.neuroData || rawData.neuro_data;
  const neuroData = useMemo(() => {
    if (!rawNeuro || typeof rawNeuro !== 'object') return null;
    return {
      cranialNerves: rawNeuro.cranialNerves || rawNeuro.cranial_nerves || rawNeuro.cranial,
      sensory: rawNeuro.sensoryReflexes?.sensory || rawNeuro.sensory || rawNeuro.sensoryReflexes,
      reflexes: rawNeuro.sensoryReflexes?.reflexes || rawNeuro.reflexes,
      coordination: rawNeuro.coordinationBalance?.coordination || rawNeuro.coordination || rawNeuro.coordinationBalance,
      balance: rawNeuro.coordinationBalance?.balance || rawNeuro.balance,
      muscleGirth: rawNeuro.muscleGirth || rawNeuro.muscle_girth,
      voluntaryControl: rawNeuro.voluntaryControl || rawNeuro.voluntary_control,
      posture: rawNeuro.posture,
      gait: rawNeuro.gait,
      handFunction: rawNeuro.handFunction || rawNeuro.hand_function,
      gcs: rawNeuro.gcs,
      mmse: rawNeuro.mmse,
      mental: rawNeuro.mental,
      ...rawNeuro
    };
  }, [rawNeuro]);
  // Only show neuro section if at least one field has a meaningful value
  const hasNeuroData = useMemo(() => {
    if (!neuroData) return false;
    return Object.values(neuroData).some((v) => {
      if (v === null || v === undefined || v === '') return false;
      if (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0) return false;
      if (Array.isArray(v) && v.length === 0) return false;
      return true;
    });
  }, [neuroData]);


  // Functional Limitations
  const rawFunc = rawData.functionalLimitations || rawData.functional_limitations || rawData.functionalScores || rawData.functional_scores;
  const functionalLimitationsList: any[] = Array.isArray(rawFunc?.limitations)
    ? rawFunc.limitations
    : [];
  const functionalScoresObj = useMemo(() => {
    if (!rawFunc || typeof rawFunc !== 'object' || Array.isArray(rawFunc)) return null;
    const scores = rawFunc.scores || rawFunc;
    // Check if scores contains numeric/rating values (like stairs: 2, walking: 1)
    const hasRatings = Object.entries(scores).some(([k, v]) => {
      if (k.includes('_')) return false; // skip specific problems keys like Knee_pain
      const val = typeof v === 'object' ? (v as any)?.score ?? (v as any)?.val : v;
      return typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)) && val.trim() !== '');
    });
    return hasRatings ? scores : null;
  }, [rawFunc]);

  // Diagnoses
  const rawDiagnosis = rawData.diagnosis;
  const primaryDiagnoses: any[] = Array.isArray(rawDiagnosis?.primaryDiagnosis)
    ? rawDiagnosis.primaryDiagnosis
    : [];
  const secondaryDiagnoses: any[] = Array.isArray(rawDiagnosis?.secondaryDiagnosis)
    ? rawDiagnosis.secondaryDiagnosis
    : [];
  const diagnosisList: string[] = Array.isArray(rawData.diagnosisList || rawData.diagnosis_list)
    ? (rawData.diagnosisList || rawData.diagnosis_list)
    : (Array.isArray(rawDiagnosis) ? rawDiagnosis : []);
  const diagnosisText = typeof rawDiagnosis === 'string' 
    ? rawDiagnosis 
    : (rawDiagnosis?.notes || rawDiagnosis?.text || rawData.diagnosisNotes || rawData.diagnosis_notes || '');

  // Treatment Plan
  const rawTreatmentPlan = rawData.treatmentPlan || rawData.treatment_plan;
  const treatmentPlanModalities: any[] = Array.isArray(rawTreatmentPlan?.modalities)
    ? rawTreatmentPlan.modalities
    : [];
  const treatmentPlanManual: any[] = Array.isArray(rawTreatmentPlan?.manualTherapy)
    ? rawTreatmentPlan.manualTherapy
    : [];
  const treatmentPlanRehab: any[] = Array.isArray(rawTreatmentPlan?.rehabilitation)
    ? rawTreatmentPlan.rehabilitation
    : [];
  const treatmentPlanExercises: any[] = Array.isArray(rawTreatmentPlan?.exercises)
    ? rawTreatmentPlan.exercises
    : [];
  const visitsRequired = rawTreatmentPlan?.visitsRequired;
  const treatmentDuration = rawTreatmentPlan?.treatmentDuration;
  const expectedOutcome = rawTreatmentPlan?.expectedOutcome;
  const planText = typeof rawTreatmentPlan === 'string' ? rawTreatmentPlan : (rawData.plan || rawTreatmentPlan?.notes || '');

  // Imaging Findings (X-Ray, MRI, PFT)
  const xrayText = rawTreatmentPlan?.xrayFindings || rawData.xrayFindings || rawData.xray_findings || clinicalExamination?.imaging?.xray;
  const mriText = rawTreatmentPlan?.mriFindings || rawData.mriFindings || rawData.mri_findings || clinicalExamination?.imaging?.mri;
  const pftText = rawTreatmentPlan?.pftFindings || rawData.pftFindings || rawData.pft_findings || clinicalExamination?.imaging?.pft;

  // Assessment Notes & Clinician Remarks
  const assessmentNotes = rawData.assessmentNotes || rawData.assessment_notes;
  const clinicalFindings = rawData.clinicalFindings || rawData.clinical_findings;
  const therapyNotes = rawData.therapyNotes || rawData.therapy_notes;
  const progressNotes = rawData.progressNotes || rawData.progress_notes;
  const doctorRemarks = rawData.doctorRemarks || rawData.doctor_remarks;
  const therapistRemarks = rawData.therapistRemarks || rawData.therapist_remarks;
  const finalClinicalSummary = rawData.finalClinicalSummary || rawData.final_clinical_summary;

  // Anthropometrics
  const anthropometrics = rawData.anthropometrics || clinicalExamination?.anthropometrics;

  // Cardio Data
  const rawCardio = rawData.cardioData || rawData.cardio_data;
  const cardioData = typeof rawCardio === 'string' ? (()=>{ try { return JSON.parse(rawCardio); } catch { return null; } })() : rawCardio;

  // Specific Problems Extraction
  const rawSpecificProblems = rawData.specificProblems || rawData.specific_problems || rawData.functionalScores || rawData.functional_scores;
  const specificProblemsList: { category: string; details: string[] }[] = useMemo(() => {
    if (!rawSpecificProblems || typeof rawSpecificProblems !== 'object') return [];
    const result: { category: string; details: string[] }[] = [];
    Object.entries(rawSpecificProblems).forEach(([key, val]: [string, any]) => {
      if (!val) return;
      let category = key;
      const underscoreIdx = key.indexOf('_');
      if (underscoreIdx !== -1) {
        category = key.substring(0, underscoreIdx) + ' - ' + key.substring(underscoreIdx + 1).replace(/_/g, ' ');
      } else {
        // Skip pure functional ratings keys like 'stairs', 'walking'
        if (['stairs', 'walking', 'sitting', 'standing', 'dressing', 'lifting'].includes(key.toLowerCase()) && typeof val !== 'object') {
          return;
        }
        category = key.replace(/([A-Z])/g, ' $1').trim();
      }
      category = category.charAt(0).toUpperCase() + category.slice(1);

      let details: string[] = [];
      if (typeof val === 'object') {
        if (val.enabled === false) return;
        if (Array.isArray(val.values) && val.values.length > 0) {
          details = val.values;
        } else if (val.enabled) {
          details = ['Present'];
        }
      } else if (typeof val === 'boolean' && val) {
        details = ['Present'];
      } else if (typeof val === 'string' && val.trim()) {
        details = [val.trim()];
      }

      if (details.length > 0) {
        const existing = result.find(r => r.category === category);
        if (existing) {
          details.forEach(d => { if (!existing.details.includes(d)) existing.details.push(d); });
        } else {
          result.push({ category, details });
        }
      }
    });
    return result;
  }, [rawSpecificProblems]);

  const accentColor = isDoctorRole ? 'text-[#262842]' : 'text-teal-700';

  const handlePrint = () => {
    window.print();
  };

  const handleGeneratePdf = async () => {
    setDownloadingPdf(true);
    setPdfError(null);
    try {
      // Use evaluation id or patient id to download the backend-generated green PDF
      const evalId = rawData.id || rawData.evaluationId || rawData.evaluation_id;
      const patId = rawData.patientId || rawData.patient_id;

      if (!evalId && !patId) {
        setPdfError('Cannot generate PDF: No evaluation or patient ID found.');
        setDownloadingPdf(false);
        return;
      }

      let response;
      if (evalId) {
        response = await api.get(ENDPOINTS.REPORTS.PDF(String(evalId)), { responseType: 'blob' });
      } else if (patId) {
        response = await api.get(`/assessments/${patId}/download`, { responseType: 'blob' });
      }

      if (response && response.data) {
                  const cleanName = (patientName || 'Patient').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
          const cleanId = patientDisplayId || patId || evalId || 'ID';
          const fileName = `Patient_Report_${cleanName}_${cleanId}.pdf`;
          if (Capacitor.isNativePlatform()) {
            const reader = new FileReader();
            reader.readAsDataURL(new Blob([response.data]));
            reader.onloadend = async () => {
              const base64data = (reader.result as string).split(',')[1];
              try {
                await Filesystem.writeFile({
                  path: fileName,
                  data: base64data,
                  directory: Directory.Documents
                });
                alert('PDF saved to Documents folder.');
              } catch (e) {
                console.error('File save error', e);
                alert('Could not save PDF to device.');
              }
            }
          } else {
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
          }
      } else {
        setPdfError('No PDF data received from server. Please try again.');
      }
    } catch (err: any) {
      console.error('PDF download error:', err);
      let msg = 'Failed to download PDF.';
      if (err?.response?.data instanceof Blob) {
        try {
          const text = await err.response.data.text();
          const json = JSON.parse(text);
          msg = json.message || msg;
        } catch (_) {}
      } else if (err?.response?.data?.message) {
        msg = err.response.data.message;
      } else if (err?.message) {
        msg = err.message;
      }
      setPdfError(msg);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Physiotherapy Assessment Report - ${patientName}`,
        text: `Clinical Report for ${patientName} (${patientDisplayId})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col gap-3.5 w-full min-w-0 max-w-5xl mx-auto font-sans pb-8 px-0">
      {/* ── 1. Top Header Action Bar (Matching Original Design) ── */}
      <div className="bg-[#262842] dark:bg-slate-900 text-white rounded-3xl p-4 md:p-5 shadow-xl flex flex-col gap-4 border border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (onBack ? onBack() : navigate(-1))}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors border border-white/20"
            >
              <ArrowLeft size={18} className="text-white" />
            </button>
            <div>
              <h1 className="text-lg md:text-xl font-black text-white tracking-tight">Report Generation</h1>
              <p className="text-xs text-slate-300 font-medium mt-0.5">Physiotherapy Assessment Report</p>
            </div>
          </div>
        </div>

        {/* 3 Action Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full min-w-0">
          <button
            onClick={handleGeneratePdf}
            disabled={downloadingPdf}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl sm:rounded-2xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-md disabled:opacity-60"
          >
            {downloadingPdf ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Generate PDF</span>
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-md"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-md"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* PDF Download Error Alert */}
      {pdfError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 dark:bg-red-950/40 dark:border-red-800 flex items-center justify-between gap-3 text-red-700 dark:text-red-300 font-semibold text-xs">
          <span>⚠️ {pdfError}</span>
          <button onClick={() => setPdfError(null)} className="px-2 py-1 rounded-lg bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 font-bold text-[11px]">Dismiss</button>
        </div>
      )}

      {/* ── 2. Report Document Card (Original Section Layout) ── */}
      <div id="clinical-report-card" className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-3.5 sm:p-5 md:p-6 flex flex-col gap-3.5 text-left w-full min-w-0 overflow-hidden">
        
        {/* Hospital Banner (if present) */}
        {hospitalInfo && (
          <section className="bg-gradient-to-r from-teal-900 via-teal-800 to-indigo-900 text-white p-5 rounded-2xl shadow-md border border-teal-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-300" />
                <h3 className="text-lg font-black tracking-tight">{hospitalInfo.name}</h3>
              </div>
              {hospitalInfo.specialization && (
                <p className="text-xs text-teal-200 font-medium mt-0.5">{hospitalInfo.specialization}</p>
              )}
              {hospitalInfo.address && (
                <p className="text-[11px] text-teal-300/80 mt-1">{hospitalInfo.address} · {hospitalInfo.phone}</p>
              )}
            </div>
          </section>
        )}

        {/* Clinician & Patient Summary Header (Original Layout) */}
        <section className="bg-slate-50/70 dark:bg-slate-900/40 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full min-w-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4 text-xs font-semibold w-full min-w-0">
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide font-bold">Conducting Clinician</span>
              <span className="text-slate-900 dark:text-white font-black text-sm break-words block">{therapistName}</span>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide font-bold">Patient Ref</span>
              <span className="text-slate-900 dark:text-white font-black text-sm break-words block">{patientName}</span>
              <span className="text-[11px] font-mono text-slate-500 block font-bold">{patientDisplayId}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide font-bold">Phone / Age / Gender</span>
              <span className="text-slate-900 dark:text-white font-bold text-xs">{patientPhone}</span>
              <span className="text-[11px] text-slate-500 block font-medium">{patientAge} yrs / {patientGender}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide font-bold">Visit / Bill</span>
              <span className="text-slate-900 dark:text-white font-bold text-xs">{visitType}</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-black block text-sm">₹{billAmount}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block mb-0.5 uppercase tracking-wide font-bold">Referred By</span>
              <span className="text-slate-900 dark:text-white font-black text-sm">{patientReferredBy}</span>
            </div>
          </div>
        </section>

        {/* Vital Signs (Original Cards Layout) */}
        {(bp || pr || spo2 || temp || ef || painLevel) && (
          <section className="bg-slate-50/40 dark:bg-slate-900/20 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full min-w-0">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Heart size={16} className="text-rose-500" />
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Vital Signs</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 sm:gap-3 text-xs font-semibold w-full min-w-0">
              {bp && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">Blood Pressure</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">{bp}</span>
                </div>
              )}
              {pr && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">Pulse Rate</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">{pr}</span>
                </div>
              )}
              {spo2 && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">SpO₂</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">{spo2}</span>
                </div>
              )}
              {temp && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">Temperature</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">{temp}</span>
                </div>
              )}
              {ef && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">Ejection Fraction</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">{ef}</span>
                </div>
              )}
              {painLevel && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">Pain Rating</span>
                  <span className="text-rose-600 dark:text-rose-400 font-extrabold text-sm">{painLevel}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Chief Complaints */}
        {chiefComplaintsArray.length > 0 && (
          <section className="bg-slate-50/40 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Heart size={16} className="text-rose-500" />
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Chief Complaints</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {chiefComplaintsArray.map((c: any, i: number) => (
                <span key={i} className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                  {formatDisplayValue(c)}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Specific Problems */}
        {specificProblemsList.length > 0 && (
          <section className="bg-slate-50/40 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <ClipboardList size={16} className={accentColor} />
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Specific Problems & Details</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {specificProblemsList.map((item, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{item.category}</span>
                  <div className="flex flex-wrap gap-1.5">
                    {item.details.map((det, dIdx) => (
                      <span key={dIdx} className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 text-[11px] font-extrabold border border-indigo-100 dark:border-indigo-900/50">
                        {det}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Associated Symptoms & Pain Areas */}
        {(associatedSymptomsList.length > 0 || painAreasList.length > 0) && (
          <section className="bg-slate-50/40 dark:bg-slate-900/20 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full min-w-0">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Activity size={16} className={accentColor} />
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Associated Symptoms & Pain Areas</span>
            </div>
            <div className="flex flex-col gap-4">
              {associatedSymptomsList.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold mb-2">Symptoms</span>
                  <div className="flex flex-wrap gap-2">
                    {associatedSymptomsList.map((s: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {painAreasList.length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold mb-2">Pain Areas & Radiation</span>
                  <div className="flex flex-wrap gap-2">
                    {painAreasList.map((p: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Medical History */}
        {medicalHistoryList.length > 0 && (
          <section className="bg-slate-50/40 dark:bg-slate-900/20 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full min-w-0">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <ClipboardList size={16} className={accentColor} />
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Medical History</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {medicalHistoryList.map((h: string, i: number) => (
                <span key={i} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                  {h}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Special Physical Tests, Imaging & X-Ray */}
        {(specialPhysicalTestsList.length > 0 || (testsObj && Object.keys(testsObj).length > 0) || xrayText || mriText || pftText || clinicalExamination?.imaging || clinicalExamination?.examinationNotes) && (
          <section className="bg-slate-50/40 dark:bg-slate-900/20 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full min-w-0">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Stethoscope size={16} className={accentColor} />
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Clinical Examination & Imaging Findings</span>
            </div>
            <div className="flex flex-col gap-4 text-xs">
              {/* Special Physical Tests from Array or Object (e.g. Neck Distraction Test) */}
              {((specialPhysicalTestsList.length > 0) || (testsObj && Object.keys(testsObj).length > 0)) && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold mb-2.5">Special Physical Tests</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {specialPhysicalTestsList.map((t: any, i: number) => {
                      const testName = t.testName || t.name || `Test ${i + 1}`;
                      const result = t.result || 'Not Tested';
                      const isPositive = result === 'Positive';
                      const isNegative = result === 'Negative';
                      return (
                        <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[160px] font-bold">{testName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            isPositive ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400' : 
                            isNegative ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>{result}</span>
                        </div>
                      );
                    })}
                    {testsObj && Object.entries(testsObj).map(([testKey, testVal]: [string, any]) => {
                      const testName = testKey.replace(/([A-Z])/g, ' $1').trim();
                      const result = typeof testVal === 'string' ? testVal : (testVal?.result || 'Not Tested');
                      const isPositive = result === 'Positive';
                      const isNegative = result === 'Negative';
                      return (
                        <div key={testKey} className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                          <span className="text-slate-700 dark:text-slate-300 truncate max-w-[160px] font-bold capitalize">{testName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            isPositive ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400' : 
                            isNegative ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 
                            'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}>{result}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Imaging Findings (X-Ray, MRI, PFT) */}
              {(xrayText || mriText || pftText || (clinicalExamination?.imaging && Object.keys(clinicalExamination.imaging).length > 0)) && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold mb-2">Imaging Findings (X-Ray / MRI / PFT)</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {xrayText && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 block mb-0.5">X-Ray Findings</span>
                        <p className="text-[12px] text-slate-800 dark:text-slate-200 font-medium">{xrayText}</p>
                      </div>
                    )}
                    {mriText && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 block mb-0.5">MRI Findings</span>
                        <p className="text-[12px] text-slate-800 dark:text-slate-200 font-medium">{mriText}</p>
                      </div>
                    )}
                    {pftText && (
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 block mb-0.5">PFT Findings</span>
                        <p className="text-[12px] text-slate-800 dark:text-slate-200 font-medium">{pftText}</p>
                      </div>
                    )}
                    {clinicalExamination?.imaging && Object.entries(clinicalExamination.imaging).map(([region, findings]: [string, any]) => (
                      <div key={region} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                        <span className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 capitalize block mb-1">{region}</span>
                        {findings.xray && <p className="text-[11px] text-slate-600 dark:text-slate-400"><strong className="text-slate-700 dark:text-slate-300">X-Ray:</strong> {findings.xray}</p>}
                        {findings.mri && <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5"><strong className="text-slate-700 dark:text-slate-300">MRI:</strong> {findings.mri}</p>}
                        {findings.notes && <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5"><strong className="text-slate-700 dark:text-slate-300">Notes:</strong> {findings.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {clinicalExamination?.examinationNotes && (
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-bold mb-1">Clinical Exam Notes</span>
                  <p className="p-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
                    {clinicalExamination.examinationNotes}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Anthropometrics Section (Height, Weight, BMI, etc.) */}
        {anthropometrics && Object.keys(anthropometrics).length > 0 && (
          <section className="bg-slate-50/40 dark:bg-slate-900/20 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full min-w-0">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Scale size={16} className={accentColor} />
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Anthropometrics</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-semibold">
              {anthropometrics.height && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">Height</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">{anthropometrics.height} cm</span>
                </div>
              )}
              {anthropometrics.weight && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">Weight</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">{anthropometrics.weight} kg</span>
                </div>
              )}
              {anthropometrics.bmi && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">BMI</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">{anthropometrics.bmi}</span>
                </div>
              )}
              {anthropometrics.waist && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">Waist</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">{anthropometrics.waist} cm</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Cardiorespiratory & Borg Scale */}
        {cardioData && (cardioData.borgRating || cardioData.vo2Max || cardioData.sixMinWalk || cardioData.rockportWalk || cardioData.harvardStep) && (
          <section className="bg-slate-50/40 dark:bg-slate-900/20 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full min-w-0">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Activity size={16} className={accentColor} />
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Cardiorespiratory & Borg Scale</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold">
              {cardioData.borgRating && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">Borg Scale (Perceived Exertion)</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-extrabold text-sm">{cardioData.borgRating}</span>
                </div>
              )}
              {cardioData.vo2Max && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">VO₂ Max</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">{cardioData.vo2Max}</span>
                </div>
              )}
              {cardioData.sixMinWalk && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">6 Minute Walk Test</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">{cardioData.sixMinWalk}</span>
                </div>
              )}
              {cardioData.rockportWalk && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">Rockport Walk Test</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">{cardioData.rockportWalk}</span>
                </div>
              )}
              {cardioData.harvardStep && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1 font-bold">Harvard Step Test</span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm">{cardioData.harvardStep}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Range of Motion & Muscle Power Table */}
        {romTableRows.length > 0 && (
          <section className="bg-slate-50/40 dark:bg-slate-900/20 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full min-w-0">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Activity size={16} className={accentColor} />
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Muscle Power & Range of Motion</span>
            </div>
            <div className="w-full min-w-0 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
              <table className="w-full min-w-[480px] border-collapse text-left text-xs font-semibold">
                <thead className="bg-slate-50 dark:bg-slate-850">
                  <tr className="border-b border-slate-200 dark:border-slate-800">
                    <th className="px-3 py-2.5 text-slate-700 dark:text-slate-300">Joint</th>
                    <th className="px-3 py-2.5 text-slate-700 dark:text-slate-300">Movement</th>
                    <th className="px-2 py-2.5 text-center text-slate-700 dark:text-slate-300">Power Rt</th>
                    <th className="px-2 py-2.5 text-center text-slate-700 dark:text-slate-300">Power Lt</th>
                    <th className="px-2 py-2.5 text-center text-slate-700 dark:text-slate-300">ROM Rt</th>
                    <th className="px-2 py-2.5 text-center text-slate-700 dark:text-slate-300">ROM Lt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {romTableRows.map((row, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                      <td className="px-3 py-2.5 font-bold text-slate-850 dark:text-white">{row.joint}</td>
                      <td className="px-3 py-2.5 text-slate-600 dark:text-slate-400 uppercase text-[9px] font-extrabold">{row.movement}</td>
                      <td className="px-2 py-2.5 text-center font-extrabold text-slate-900 dark:text-white">{row.powerRt}</td>
                      <td className="px-2 py-2.5 text-center font-extrabold text-slate-900 dark:text-white">{row.powerLt}</td>
                      <td className="px-2 py-2.5 text-center font-extrabold text-slate-900 dark:text-white">{row.romRt}</td>
                      <td className="px-2 py-2.5 text-center font-extrabold text-slate-900 dark:text-white">{row.romLt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Neurological Examination */}
        {hasNeuroData && (
          <section className="bg-slate-50/40 dark:bg-slate-900/20 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full min-w-0">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Brain size={16} className={accentColor} />
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Neurological Examination</span>
            </div>
            <NeuroSummaryView neuroData={neuroData} />
          </section>
        )}

        {/* Functional Limitations */}
        {(functionalLimitationsList.length > 0 || (functionalScoresObj && Object.entries(functionalScoresObj).some(([k, v]) => !k.includes('_') && (typeof v === 'number' || (typeof v === 'string' && !isNaN(Number(v))))))) && (
          <section className="bg-slate-50/40 dark:bg-slate-900/20 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
              <CheckSquare size={16} className={accentColor} />
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Functional Limitations & Ratings</span>
            </div>
            {functionalScoresObj && (
              <div className="flex flex-col gap-2">
                {Object.entries(functionalScoresObj).map(([key, val]: [string, any]) => {
                  if (key.includes('_')) return null; // skip specific problems
                  const value = typeof val === 'object' ? val.score : Number(val);
                  if (isNaN(value)) return null;
                  const labels: Record<number, string> = { 0: 'Normal', 1: 'Mild', 2: 'Moderate', 3: 'Severe', 4: 'Unable' };
                  return (
                    <div key={key} className="flex items-center justify-between py-2 border-b last:border-0 border-slate-150 dark:border-slate-800/60 font-semibold text-xs">
                      <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300 capitalize">{key === 'stairs' ? 'Climbing Stairs' : key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <span className="px-2.5 py-0.5 rounded-lg text-[11px] font-black border border-slate-200">{value} - {labels[value] || 'Recorded'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* Diagnoses & ICD-10 Coding */}
        {(primaryDiagnoses.length > 0 || diagnosisList.length > 0 || diagnosisText) && (
          <section className="bg-slate-50/40 dark:bg-slate-900/20 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full min-w-0">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <ClipboardList size={16} className={accentColor} />
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Diagnoses & ICD-10 Coding</span>
            </div>
            {diagnosisList.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {diagnosisList.map((d: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                    {d}
                  </span>
                ))}
              </div>
            )}
            {diagnosisText && (
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                {diagnosisText}
              </p>
            )}
          </section>
        )}

        {/* Treatment Plan Details */}
        {(treatmentPlanModalities.length > 0 || treatmentPlanManual.length > 0 || treatmentPlanRehab.length > 0 || treatmentPlanExercises.length > 0 || planText) && (
          <section className="bg-slate-50/40 dark:bg-slate-900/20 p-3.5 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 w-full min-w-0">
            <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800">
              <Dumbbell size={16} className={accentColor} />
              <span className="text-[12px] font-extrabold uppercase tracking-wide text-slate-800 dark:text-slate-200">Treatment Plan Details</span>
            </div>
            {treatmentPlanModalities.length > 0 && (
              <div className="mb-3">
                <span className="text-[10px] text-slate-400 uppercase block font-bold mb-1.5">Modalities / Passive Therapy</span>
                <div className="flex flex-wrap gap-2">
                  {treatmentPlanModalities.map((m: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {treatmentPlanManual.length > 0 && (
              <div className="mb-3">
                <span className="text-[10px] text-slate-400 uppercase block font-bold mb-1.5">Manual Therapy</span>
                <div className="flex flex-wrap gap-2">
                  {treatmentPlanManual.map((m: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {treatmentPlanRehab.length > 0 && (
              <div className="mb-3">
                <span className="text-[10px] text-slate-400 uppercase block font-bold mb-1.5">Rehabilitation</span>
                <div className="flex flex-wrap gap-2">
                  {treatmentPlanRehab.map((r: string, i: number) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {treatmentPlanExercises.length > 0 && (
              <div className="mb-4">
                <span className="text-[10px] text-slate-400 uppercase block font-bold mb-2">
                  Prescribed Exercises & Home Programs ({treatmentPlanExercises.length})
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full min-w-0">
                  {treatmentPlanExercises.map((ex: any, idx: number) => {
                    const exName = ex.exerciseName || ex.name || `Exercise ${idx + 1}`;
                    const exCategory = ex.category || 'General';
                    const instructionsText = ex.instructions || ex.notes || ex.description || '';
                    return (
                      <div key={ex.id || idx} className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-2.5 w-full min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-extrabold text-sm text-slate-800 dark:text-slate-100 break-words leading-tight flex-1 min-w-0">{exName}</span>
                          <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 uppercase shrink-0">{exCategory}</span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-slate-600 dark:text-slate-400 border-y border-slate-100 dark:border-slate-800/80 py-1.5">
                          {ex.sets && <span><strong className="text-slate-800 dark:text-slate-200">Sets:</strong> {ex.sets}</span>}
                          {ex.reps && <span><strong className="text-slate-800 dark:text-slate-200">Reps:</strong> {ex.reps}</span>}
                          {ex.holdTime && <span><strong className="text-slate-800 dark:text-slate-200">Hold:</strong> {ex.holdTime}</span>}
                          {ex.frequency && <span><strong className="text-slate-800 dark:text-slate-200">Freq:</strong> {ex.frequency}</span>}
                        </div>
                        {instructionsText && (
                          <div className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-150 dark:border-slate-800 w-full min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Exercise Instructions & Guidance:</span>
                            <div className="whitespace-pre-wrap font-medium break-words leading-relaxed">{instructionsText}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {planText && (
              <p className="text-[13px] text-slate-800 dark:text-slate-250 leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 font-medium">
                {planText}
              </p>
            )}
          </section>
        )}

        {/* Clinician Remarks & Signature Block */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end flex-wrap gap-4">
          <div>
            <p className="text-base font-black italic text-slate-900 dark:text-white tracking-widest mb-1">D. S. S. K</p>
            <div className="w-32 h-0.5 bg-slate-900 dark:bg-slate-100 mb-2"></div>
            <p className="text-xs font-bold text-slate-900 dark:text-white">Dr. SV. Sathish Kumar</p>
            <p className="text-[11px] text-slate-500 font-medium">SAAI Physiotherapy</p>
          </div>
          <div className="w-24 h-24 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border-2 border-dashed border-indigo-200 dark:border-indigo-800 flex flex-col items-center justify-center text-center p-2">
            <ShieldCheck className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mb-1" />
            <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-300 uppercase tracking-tight">SAAI Clinic Stamp</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[10px] text-slate-400 font-medium">
          <p>SAAI Physiotherapy Clinic · 42, Health Square, MG Road, Bengaluru - 560001</p>
          <p className="mt-0.5">This report is for medical purposes only. Keep it confidential.</p>
        </div>
      </div>

      {/* ── 3. Bottom Action Bar ── */}
      <div className="bg-[#262842] dark:bg-slate-900 text-white rounded-3xl p-3.5 sm:p-4 shadow-lg border border-slate-700/50 w-full min-w-0">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3 w-full min-w-0">
          <button
            onClick={handleGeneratePdf}
            disabled={downloadingPdf}
            className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl sm:rounded-2xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs sm:text-sm border border-white/20 backdrop-blur-md transition-all active:scale-95 shadow-md disabled:opacity-60"
          >
            {downloadingPdf ? (
              <>
                <Loader2 size={16} className="animate-spin text-white" />
                <span>Downloading...</span>
              </>
            ) : (
              <>
                <Download size={16} />
                <span>Generate PDF</span>
              </>
            )}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-md"
          >
            <Printer size={16} />
            <span>Print</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 py-3 px-3 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm border border-white/15 backdrop-blur-md transition-all active:scale-95 shadow-md"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}

