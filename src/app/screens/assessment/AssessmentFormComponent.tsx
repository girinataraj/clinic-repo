import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import api from '../../../services/api';
import { StepNeuroExam, getEmptyNeuroData } from './StepNeuroExam';
import { StepCardioExam } from './StepCardioExam';
import { type CardioExamData, getEmptyCardioExam, type Anthropometrics } from './clinicalConfig';
import { 
  User, Heart, ClipboardList, Stethoscope, Activity, CreditCard, 
  Save, Download, Check, AlertCircle, FileText, ChevronLeft, ChevronRight,
  Database, RefreshCw, Eye
} from 'lucide-react';
import { VitalSignsTable, SymptomChecklist, ClinicalExaminationTable } from './AssessmentTableDisplay';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

const SYMPTOM_LABELS: Record<string, string> = {
  hang_arm: 'Difficulty hanging arm',
  pain_over: 'Pain over joint/area',
  glass_water: 'Difficulty holding a glass of water',
  numbness_over: 'Numbness over joint/area',
  pain_increased: 'Pain increased during movement',
  pain_radiating: 'Pain radiating down limb',
  weakness_sense: 'Sense of weakness in muscles'
};

const SYMPTOM_KEYS = Object.keys(SYMPTOM_LABELS);

interface FormData {
  basicInfo: {
    fullName: string;
    age: number | '';
    gender: string;
    assignedTherapist: string;
    condition: string[];
  };
  vitalSigns: {
    bloodPressure: string;
    pulseRate: number | '';
    spo2: number | '';
    temperature: number | '';
    ejectionFraction: number | '';
  };
  medicalHistory: {
    chronicConditions: string[];
    medications: string[];
    allergies: string[];
    surgicalHistory: string[];
  };
  chiefComplaint: {
    primary: string;
    symptoms: Record<string, { value: boolean; notes: string }>;
    painScale: number;
    symptomDuration: string;
  };
  clinicalExamination: {
    musclePower: {
      rightUpper: number;
      leftUpper: number;
      rightLower: number;
      leftLower: number;
    };
    rom: {
      cervical: { flexion: number | ''; extension: number | '' };
      lumbar: { flexion: number | ''; extension: number | '' };
      shoulder: { abduction: number | ''; rotation: number | '' };
    };
    specialTests: string[];
    findings: string;
  };
  diagnosis: {
    primary: string;
    secondary: string[];
    icdCode: string;
  };
  treatmentPlan: {
    therapies: string[];
    frequency: string;
    duration: string;
    modalities: string[];
    xrayFindings: string;
    mriFindings: string;
    pftFindings: string;
  };
  finalReview: {
    progressNotes: string;
    nextSession: string;
    recommendations: string[];
  };
  payment: {
    sessionFee: number | '';
    totalSessions: number | '';
    paidSessions: number | '';
    balance: number | '';
    paymentStatus: string;
  };
  neuroData: any;
  cardioData: CardioExamData;
  anthropometrics: Anthropometrics;
}

const initialFormData = (): FormData => ({
  basicInfo: { fullName: '', age: '', gender: 'Male', assignedTherapist: '', condition: [] },
  vitalSigns: { bloodPressure: '', pulseRate: '', spo2: '', temperature: '', ejectionFraction: '' },
  medicalHistory: { chronicConditions: [], medications: [], allergies: [], surgicalHistory: [] },
  chiefComplaint: {
    primary: '',
    symptoms: SYMPTOM_KEYS.reduce((acc, key) => {
      acc[key] = { value: false, notes: '' };
      return acc;
    }, {} as Record<string, { value: boolean; notes: string }>),
    painScale: 0,
    symptomDuration: ''
  },
  clinicalExamination: {
    musclePower: { rightUpper: 5, leftUpper: 5, rightLower: 5, leftLower: 5 },
    rom: {
      cervical: { flexion: '', extension: '' },
      romJointSelected: 'cervical', // helper for local selection
      lumbar: { flexion: '', extension: '' },
      shoulder: { abduction: '', rotation: '' }
    } as any,
    specialTests: [],
    findings: ''
  },
  diagnosis: { primary: '', secondary: [], icdCode: '' },
  treatmentPlan: { therapies: [], frequency: '', duration: '', modalities: [], xrayFindings: '', mriFindings: '', pftFindings: '' },
  finalReview: { progressNotes: '', nextSession: '', recommendations: [] },
  payment: { sessionFee: '', totalSessions: '', paidSessions: '', balance: '', paymentStatus: 'Pending' },
  neuroData: getEmptyNeuroData(),
  cardioData: getEmptyCardioExam(),
  anthropometrics: { height: '', weight: '', bmi: '', excessWeight: '', excessCalorie: '', duration: '', waist: '', hip: '', whRatio: '' }
});

export function AssessmentFormComponent() {
  const { id: patientId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(initialFormData());
  const [patientName, setPatientName] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);
  const [romJointSelection, setRomJointSelection] = useState<'cervical' | 'lumbar' | 'shoulder'>('cervical');
  const [assessmentCreated, setAssessmentCreated] = useState(false);

  // Load patient metadata and populate basic info
  useEffect(() => {
    if (patientId) {
      // Try to load from localStorage first for autosave recovery
      const saved = localStorage.getItem(`assessment_draft_${patientId}`);
      if (saved) {
        try {
          setFormData(JSON.parse(saved));
          setAutosaveStatus('Restored draft from local auto-save');
        } catch (e) {
          console.error('Failed to parse autosave draft', e);
        }
      }

      api.get(`/patients/${patientId}`)
        .then(res => {
          const patient = res.data.data;
          setPatientName(patient.name);
          const initialCondition = patient.condition
            ? patient.condition.split(',').map((x: string) => x.trim()).filter((x: string) => ['Ortho', 'Neuro', 'Cardio'].includes(x))
            : [];
          setFormData(prev => ({
            ...prev,
            basicInfo: {
              ...prev.basicInfo,
              fullName: prev.basicInfo.fullName || patient.name,
              age: prev.basicInfo.age || patient.age,
              gender: prev.basicInfo.gender || patient.gender,
              condition: prev.basicInfo.condition && prev.basicInfo.condition.length > 0 ? prev.basicInfo.condition : initialCondition,
            }
          }));
        })
        .catch(err => console.error('Failed to fetch patient details', err));
    }
  }, [patientId]);

  // Real-time autosave every 30s
  useEffect(() => {
    if (!patientId) return;
    const interval = setInterval(() => {
      localStorage.setItem(`assessment_draft_${patientId}`, JSON.stringify(formData));
      const now = new Date().toLocaleTimeString();
      setAutosaveStatus(`Draft auto-saved at ${now}`);
    }, 30000);

    return () => clearInterval(interval);
  }, [formData, patientId]);

  // Compute remaining balance
  useEffect(() => {
    const fee = Number(formData.payment.sessionFee) || 0;
    const total = Number(formData.payment.totalSessions) || 0;
    const paid = Number(formData.payment.paidSessions) || 0;
    const balance = (fee * total) - (fee * paid);

    let status = 'Pending';
    if (paid > 0 && paid < total) status = 'Partial';
    else if (paid >= total && total > 0) status = 'Paid';

    setFormData(prev => ({
      ...prev,
      payment: {
        ...prev.payment,
        balance,
        paymentStatus: status
      }
    }));
  }, [formData.payment.sessionFee, formData.payment.totalSessions, formData.payment.paidSessions]);

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (!formData.basicInfo.fullName.trim()) newErrors.fullName = 'Full Name is required';
      if (!formData.basicInfo.age) newErrors.age = 'Age is required';
    }

    if (currentStep === 1) {
      const bp = formData.vitalSigns.bloodPressure;
      if (bp && !/^\d{2,3}\/\d{2,3}$/.test(bp)) {
        newErrors.bloodPressure = 'BP must be in format like 120/80';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  const handleSave = async (submit = false) => {
    if (!validateStep(step)) return;
    setSaving(true);
    try {
      if (patientId) {
        const payload = { ...formData, patientId };
        if (assessmentCreated) {
          // Already created — save a new version
          await api.put(`/assessments/${patientId}`, payload);
        } else {
          // First save — create the assessment
          await api.post(`/assessments`, payload);
          setAssessmentCreated(true);
        }
        localStorage.removeItem(`assessment_draft_${patientId}`);
        setAutosaveStatus('Assessment saved successfully!');
        if (submit) {
          // Navigate back to patient detail page (role-agnostic path)
          navigate(-1);
        }
      }
    } catch (err: any) {
      console.error(err);
      setErrors({ api: err?.response?.data?.message || 'Failed to save assessment' });
    } finally {
      setSaving(false);
    }
  };

  // Export PDF (jsPDF + html2canvas)
  const handleExportPDF = () => {
    const input = document.getElementById('assessment-preview-container');
    if (!input) return;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`Assessment_${patientName.replace(/\s+/g, '_') || patientId}.pdf`);
    });
  };

  // Export Excel
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Demographic & Vitals
    const summary = [
      ['SAAI PHYSIOTHERAPY CLINIC - PATIENT ASSESSMENT SUMMARY'],
      [],
      ['Patient Name', formData.basicInfo.fullName],
      ['Age', formData.basicInfo.age],
      ['Gender', formData.basicInfo.gender],
      ['Assigned Therapist', formData.basicInfo.assignedTherapist],
      ['Condition', formData.basicInfo.condition?.join(', ') || ''],
      [],
      ['VITAL SIGNS'],
      ['Blood Pressure', formData.vitalSigns.bloodPressure || 'N/A'],
      ['Pulse Rate (bpm)', formData.vitalSigns.pulseRate || 'N/A'],
      ['SpO2 (%)', formData.vitalSigns.spo2 || 'N/A'],
      ['Temperature (°F)', formData.vitalSigns.temperature || 'N/A'],
      ['Ejection Fraction (%)', formData.vitalSigns.ejectionFraction || 'N/A'],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary & Vitals');

    // Sheet 2: Medical History & Complaints
    const medHistory = [
      ['Chronic Conditions', formData.medicalHistory.chronicConditions.join(', ') || 'None'],
      ['Current Medications', formData.medicalHistory.medications.join(', ') || 'None'],
      ['Allergies', formData.medicalHistory.allergies.join(', ') || 'None'],
      ['Surgical History', formData.medicalHistory.surgicalHistory.join(', ') || 'None'],
      [],
      ['Primary Complaint', formData.chiefComplaint.primary || 'N/A'],
      ['VAS Scale (0-10)', formData.chiefComplaint.painScale],
      ['Symptom Duration', formData.chiefComplaint.symptomDuration || 'N/A'],
    ];
    const wsHistory = XLSX.utils.aoa_to_sheet(medHistory);
    XLSX.utils.book_append_sheet(wb, wsHistory, 'Medical History');

    // Sheet 3: Symptoms Checklist
    const symptomsRows = Object.entries(formData.chiefComplaint.symptoms).map(([key, obj]) => ({
      Symptom: SYMPTOM_LABELS[key] || key,
      Present: obj.value ? 'Yes' : 'No',
      Notes: obj.notes || ''
    }));
    const wsSymptoms = XLSX.utils.json_to_sheet(symptomsRows);
    XLSX.utils.book_append_sheet(wb, wsSymptoms, 'Symptoms Checklist');

    // Sheet 4: Clinical Exam & Billing
    const examBilling = [
      ['CLINICAL EXAMINATION'],
      ['Muscle Power: RU', formData.clinicalExamination.musclePower.rightUpper],
      ['Muscle Power: LU', formData.clinicalExamination.musclePower.leftUpper],
      ['Muscle Power: RL', formData.clinicalExamination.musclePower.rightLower],
      ['Muscle Power: LL', formData.clinicalExamination.musclePower.leftLower],
      ['Cervical Flexion', formData.clinicalExamination.rom.cervical.flexion || 'N/A'],
      ['Cervical Extension', formData.clinicalExamination.rom.cervical.extension || 'N/A'],
      ['Lumbar Flexion', formData.clinicalExamination.rom.lumbar.flexion || 'N/A'],
      ['Lumbar Extension', formData.clinicalExamination.rom.lumbar.extension || 'N/A'],
      ['Shoulder Abduction', formData.clinicalExamination.rom.shoulder.abduction || 'N/A'],
      ['Shoulder Rotation', formData.clinicalExamination.rom.shoulder.rotation || 'N/A'],
      [],
      ['BILLING & FINANCIAL DETAILS'],
      ['Session Fee', formData.payment.sessionFee || 'N/A'],
      ['Total Sessions', formData.payment.totalSessions || 'N/A'],
      ['Paid Sessions', formData.payment.paidSessions || 'N/A'],
      ['Remaining Balance Due', formData.payment.balance || 'N/A'],
      ['Payment Status', formData.payment.paymentStatus],
    ];
    const wsExam = XLSX.utils.aoa_to_sheet(examBilling);
    XLSX.utils.book_append_sheet(wb, wsExam, 'Exam & Billing');

    XLSX.writeFile(wb, `Assessment_${patientName.replace(/\s+/g, '_') || 'Patient'}.xlsx`);
  };

  // Export raw JSON
  const handleExportJSON = () => {
    const rawData = {
      ...formData,
      patientId,
      exportedAt: new Date().toISOString()
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(rawData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Assessment_${patientName.replace(/\s+/g, '_') || 'Patient'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const hasNeuro = formData.basicInfo.condition?.includes('Neuro');
  const hasCardio = formData.basicInfo.condition?.includes('Cardio');
  const stepsList = [
    { label: 'Basic Info', icon: User, key: 'patient' },
    { label: 'Vitals', icon: Heart, key: 'vitals' },
    { label: 'History', icon: ClipboardList, key: 'history' },
    { label: 'Complaints', icon: FileText, key: 'complaints' },
    { label: 'Clinical Exam', icon: Stethoscope, key: 'examination' },
    ...(hasNeuro ? [
      { label: 'Neuro: Mental & Nerves', icon: Activity, key: 'neuro_mental' },
      { label: 'Neuro: Sensory & Motor', icon: Activity, key: 'neuro_sensory' },
      { label: 'Neuro: Coordination & Balance', icon: Activity, key: 'neuro_coordination' },
      { label: 'Neuro: Gait & Hand', icon: Activity, key: 'neuro_gait_hand' }
    ] : []),
    ...(hasCardio ? [
      { label: 'Cardio Exam: Tests', icon: Heart, key: 'cardio_exam_1' },
      { label: 'Cardio Exam: Prescription', icon: Heart, key: 'cardio_exam_2' }
    ] : []),
    { label: 'Diagnosis / Plan', icon: Activity, key: 'diagnosis' },
    { label: 'Billing & Pay', icon: CreditCard, key: 'review' }
  ];

  const currentStepKey = stepsList[step]?.key;

  const dynamicSymptomKeys = [
    ...SYMPTOM_KEYS,
    ...(hasCardio ? ['respiratory', 'dyspnea', 'weight_gain'] : [])
  ];
  const dynamicSymptomLabels: Record<string, string> = {
    ...SYMPTOM_LABELS,
    respiratory: 'Respiratory',
    dyspnea: 'Dyspnea',
    weight_gain: 'Weight Gain'
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 font-sans">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        
        {/* Back and Autosave Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 text-slate-700 dark:text-slate-200 transition-colors shadow-sm">
              <ChevronLeft size={16} />
            </button>
            <div>
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Comprehensive Patient Assessment
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Patient Queue: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{patientName || 'Loading...'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {autosaveStatus && (
              <span className="text-[11px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-250/30 flex items-center gap-1.5 animate-fade-in">
                <RefreshCw size={11} className="animate-spin text-slate-500" />
                {autosaveStatus}
              </span>
            )}
            <button
              onClick={() => setShowPreview(prev => !prev)}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-200 shadow-sm flex items-center gap-2 transition-all">
              <Eye size={14} />
              {showPreview ? 'Edit Form' : 'Preview PDF'}
            </button>
          </div>
        </div>

        {/* Steps Progress Indicator */}
        {!showPreview && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm overflow-x-auto flex items-center justify-between gap-2 min-w-max md:min-w-0">
            {stepsList.map((st, idx) => {
              const Icon = st.icon;
              const isCompleted = idx < step;
              const isActive = idx === step;
              return (
                <div key={st.label} className="flex items-center gap-2">
                  <button 
                    onClick={() => { if (idx < step) setStep(idx); }}
                    disabled={idx > step}
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold transition-all text-xs border ${
                      isCompleted ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' : 
                      isActive ? 'bg-[#262842] text-white border-[#262842] dark:bg-slate-800 dark:border-slate-700 shadow-lg' : 
                      'bg-slate-50 text-slate-400 dark:bg-slate-950 border-slate-200 dark:border-slate-850'
                    }`}>
                    {isCompleted ? <Check size={14} /> : idx + 1}
                  </button>
                  <span className={`text-xs font-bold ${isActive ? 'text-[#262842] dark:text-white font-extrabold' : 'text-slate-400'}`}>
                    {st.label}
                  </span>
                  {idx < stepsList.length - 1 && (
                    <span className="h-0.5 w-6 bg-slate-200 dark:bg-slate-800 mx-2 block shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Errors Alert Banner */}
        {errors.api && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl flex items-center gap-3 text-rose-700 dark:text-rose-450 text-xs font-bold shadow-sm">
            <AlertCircle size={16} />
            {errors.api}
          </div>
        )}

        {/* Render Preview Report directly or step contents */}
        {showPreview ? (
          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-end gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="text-xs font-bold text-slate-500 mr-auto">Download Data Formats:</span>
              <button 
                onClick={handleExportPDF}
                className="px-3.5 py-2 text-xs font-extrabold bg-[#262842] dark:bg-slate-800 text-white rounded-xl hover:bg-slate-900 border border-transparent shadow-md flex items-center gap-2 transition-all">
                <Download size={13} />
                Export PDF
              </button>
              <button 
                onClick={handleExportExcel}
                className="px-3.5 py-2 text-xs font-extrabold bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 border border-transparent shadow-md flex items-center gap-2 transition-all">
                <Database size={13} />
                Export Excel
              </button>
              <button 
                onClick={handleExportJSON}
                className="px-3.5 py-2 text-xs font-extrabold bg-slate-700 text-white rounded-xl hover:bg-slate-850 border border-transparent shadow-md flex items-center gap-2 transition-all">
                <FileText size={13} />
                Export JSON
              </button>
            </div>

            {/* Document Preview container for html2canvas */}
            <div 
              id="assessment-preview-container" 
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-md flex flex-col gap-8 text-slate-800 dark:text-slate-250">
              
              <div className="text-center border-b border-slate-100 dark:border-slate-800 pb-6">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">SAAI Physiotherapy Clinic</h2>
                <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">Patient Clinical Assessment Report</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Report Date: {new Date().toLocaleDateString('en-IN')}</p>
              </div>

              {/* 1. Basic Info */}
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 uppercase">1. Patient Demographics & Intake</h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Full Name</span>
                    <span className="font-extrabold">{formData.basicInfo.fullName || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Age</span>
                    <span className="font-extrabold">{formData.basicInfo.age ? `${formData.basicInfo.age} yrs` : '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Gender</span>
                    <span className="font-extrabold">{formData.basicInfo.gender}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Therapist</span>
                    <span className="font-extrabold">{formData.basicInfo.assignedTherapist || '—'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Condition</span>
                    <span className="font-extrabold">{formData.basicInfo.condition?.join(', ') || '—'}</span>
                  </div>
                </div>
              </div>

              {/* 2. Vitals */}
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 uppercase">2. Physiological Vitals Log</h3>
                <VitalSignsTable vitals={formData.vitalSigns as any} />
              </div>

              {/* 3. Medical History */}
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 uppercase">3. Medical History</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Chronic Conditions</span>
                    <p className="font-medium bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50 leading-relaxed">
                      {formData.medicalHistory.chronicConditions.join(', ') || 'No significant chronic conditions logged.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Active Medications</span>
                    <p className="font-medium bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50 leading-relaxed">
                      {formData.medicalHistory.medications.join(', ') || 'No active medications logged.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Known Allergies</span>
                    <p className="font-medium bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50 leading-relaxed text-rose-700 dark:text-rose-400 font-bold">
                      {formData.medicalHistory.allergies.join(', ') || 'No known allergies.'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Surgical History</span>
                    <p className="font-medium bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/50 leading-relaxed">
                      {formData.medicalHistory.surgicalHistory.join(', ') || 'No historical surgeries.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Complaints & Symptom Checklist */}
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 uppercase">4. Symptoms & Complaints</h3>
                <div className="flex flex-col gap-4 text-xs mb-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase mb-1">Primary Complaint</span>
                    <p className="font-medium bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {formData.chiefComplaint.primary || '—'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Pain Rating</span>
                      <span className="font-extrabold text-sm text-[#262842] dark:text-white">{formData.chiefComplaint.painScale} / 10</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold block uppercase mb-0.5">Symptom Duration</span>
                      <span className="font-extrabold">{formData.chiefComplaint.symptomDuration || '—'}</span>
                    </div>
                  </div>
                </div>
                <SymptomChecklist symptoms={formData.chiefComplaint.symptoms} />
              </div>

              {/* 5. Clinical Exam */}
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 uppercase">5. Clinical Physical Examination</h3>
                <ClinicalExaminationTable exam={formData.clinicalExamination} />
              </div>

              {/* 6. Diagnosis & Billing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 uppercase">6. Diagnosis & plan</h3>
                  <div className="flex flex-col gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold mb-0.5">Primary Diagnosis</span>
                      <span className="font-extrabold">{formData.diagnosis.primary || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold mb-0.5">Secondary Conditions</span>
                      <span className="font-extrabold">{formData.diagnosis.secondary.join(', ') || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold mb-0.5">ICD-10 Pathology Code</span>
                      <span className="font-extrabold uppercase">{formData.diagnosis.icdCode || '—'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold mb-0.5">Modalities & Exercises</span>
                      <span className="font-extrabold">{formData.treatmentPlan.modalities.join(', ') || '—'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 mb-4 uppercase">7. Billing & Payment</h3>
                  <div className="flex flex-col gap-3 text-xs bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Session Fee Rate</span>
                      <span className="font-black text-slate-900 dark:text-white">₹ {formData.payment.sessionFee || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Total Sessions Prescribed</span>
                      <span className="font-black text-slate-900 dark:text-white">{formData.payment.totalSessions || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-semibold">Sessions Paid</span>
                      <span className="font-black text-slate-900 dark:text-white">{formData.payment.paidSessions || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center border-t border-slate-200/50 dark:border-slate-700/50 pt-2.5 mt-1">
                      <span className="text-slate-600 font-bold">Remaining Balance Due</span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm">₹ {formData.payment.balance || '—'}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-slate-600 font-bold">Payment Status</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        formData.payment.paymentStatus === 'Paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                        formData.payment.paymentStatus === 'Partial' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {formData.payment.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Multi-step form panels */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm flex flex-col gap-6">
            
            {/* Step 0: Basic Info */}
            {step === 0 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <User className="text-indigo-500" size={18} /> Basic Patient Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Patient Full Name *</label>
                    <input 
                      type="text"
                      value={formData.basicInfo.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, fullName: e.target.value } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                    {errors.fullName && <span className="text-[10px] text-rose-600 font-bold">{errors.fullName}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Age *</label>
                    <input 
                      type="number"
                      value={formData.basicInfo.age}
                      onChange={(e) => setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, age: e.target.value ? parseInt(e.target.value, 10) : '' } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                    {errors.age && <span className="text-[10px] text-rose-600 font-bold">{errors.age}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Gender *</label>
                    <select 
                      value={formData.basicInfo.gender}
                      onChange={(e) => setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, gender: e.target.value } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Assigned Therapist ID</label>
                    <input 
                      type="text"
                      placeholder="User UUID / Name"
                      value={formData.basicInfo.assignedTherapist}
                      onChange={(e) => setFormData(prev => ({ ...prev, basicInfo: { ...prev.basicInfo, assignedTherapist: e.target.value } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Condition (Check all that apply)</label>
                    <div className="flex gap-4 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950">
                      {['Ortho', 'Neuro', 'Cardio'].map((c) => {
                        const isChecked = formData.basicInfo.condition?.includes(c) || false;
                        return (
                          <label key={c} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-350 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                const current = formData.basicInfo.condition || [];
                                const next = isChecked
                                  ? current.filter((x) => x !== c)
                                  : [...current, c];
                                setFormData(prev => ({
                                  ...prev,
                                  basicInfo: { ...prev.basicInfo, condition: next }
                                }));
                              }}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                            {c}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Vital Signs */}
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Heart className="text-rose-500" size={18} /> Vital Signs Log
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Blood Pressure (BP)</label>
                    <input 
                      type="text"
                      placeholder="e.g. 120/80"
                      value={formData.vitalSigns.bloodPressure}
                      onChange={(e) => setFormData(prev => ({ ...prev, vitalSigns: { ...prev.vitalSigns, bloodPressure: e.target.value } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                    {errors.bloodPressure && <span className="text-[10px] text-rose-600 font-bold">{errors.bloodPressure}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Pulse Rate (bpm)</label>
                    <input 
                      type="number"
                      value={formData.vitalSigns.pulseRate}
                      onChange={(e) => setFormData(prev => ({ ...prev, vitalSigns: { ...prev.vitalSigns, pulseRate: e.target.value ? parseInt(e.target.value, 10) : '' } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">SpO2 Level (%)</label>
                    <input 
                      type="number"
                      value={formData.vitalSigns.spo2}
                      onChange={(e) => setFormData(prev => ({ ...prev, vitalSigns: { ...prev.vitalSigns, spo2: e.target.value ? parseInt(e.target.value, 10) : '' } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Temperature (°F)</label>
                    <input 
                      type="number"
                      step="0.1"
                      value={formData.vitalSigns.temperature}
                      onChange={(e) => setFormData(prev => ({ ...prev, vitalSigns: { ...prev.vitalSigns, temperature: e.target.value ? parseFloat(e.target.value) : '' } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Ejection Fraction (%)</label>
                    <input 
                      type="number"
                      value={formData.vitalSigns.ejectionFraction}
                      onChange={(e) => setFormData(prev => ({ ...prev, vitalSigns: { ...prev.vitalSigns, ejectionFraction: e.target.value ? parseInt(e.target.value, 10) : '' } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Medical History */}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ClipboardList className="text-amber-500" size={18} /> Medical & Surgical History
                </h3>
                
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Chronic Conditions (comma separated)</label>
                    <textarea 
                      placeholder="e.g. Hypertension, Diabetes"
                      value={formData.medicalHistory.chronicConditions.join(', ')}
                      onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: { ...prev.medicalHistory, chronicConditions: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 h-20"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Current Medications (comma separated)</label>
                    <textarea 
                      placeholder="e.g. Metoprolol 50mg daily"
                      value={formData.medicalHistory.medications.join(', ')}
                      onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: { ...prev.medicalHistory, medications: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 h-20"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Known Allergies (comma separated)</label>
                    <textarea 
                      placeholder="e.g. Penicillin, Peanuts"
                      value={formData.medicalHistory.allergies.join(', ')}
                      onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: { ...prev.medicalHistory, allergies: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 h-20 text-rose-700 dark:text-rose-400 font-bold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Surgical History (comma separated)</label>
                    <textarea 
                      placeholder="e.g. Appendectomy 2018"
                      value={formData.medicalHistory.surgicalHistory.join(', ')}
                      onChange={(e) => setFormData(prev => ({ ...prev, medicalHistory: { ...prev.medicalHistory, surgicalHistory: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 h-20"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Chief Complaint & Symptoms */}
            {step === 3 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="text-purple-500" size={18} /> Chief Complaints & Symptom Tracker
                </h3>
                
                <div className="flex flex-col gap-4 mb-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Primary Chief Complaint *</label>
                    <textarea 
                      placeholder="Describe primary symptom complains..."
                      value={formData.chiefComplaint.primary}
                      onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: { ...prev.chiefComplaint, primary: e.target.value } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 h-24"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">VAS Scale (0 - 10)</label>
                      <div className="flex items-center gap-3">
                        <input 
                          type="range"
                          min="0"
                          max="10"
                          value={formData.chiefComplaint.painScale}
                          onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: { ...prev.chiefComplaint, painScale: parseInt(e.target.value, 10) } }))}
                          className="flex-1 accent-pink-600 cursor-pointer"
                        />
                        <span className="w-12 text-center text-sm font-black border border-slate-200 dark:border-slate-800 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-white">
                          {formData.chiefComplaint.painScale}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase">Symptom Duration</label>
                      <input 
                        type="text"
                        placeholder="e.g. 3 weeks, 2 months"
                        value={formData.chiefComplaint.symptomDuration}
                        onChange={(e) => setFormData(prev => ({ ...prev, chiefComplaint: { ...prev.chiefComplaint, symptomDuration: e.target.value } }))}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                  <span className="text-xs font-extrabold text-[#262842] dark:text-white block mb-3 uppercase">Specific Critical Symptoms Checklist</span>
                  <div className="flex flex-col gap-3">
                    {dynamicSymptomKeys.map((key) => {
                      const item = formData.chiefComplaint.symptoms[key] || { value: false, notes: '' };
                      return (
                        <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-850/30 rounded-2xl border border-slate-150/40 dark:border-slate-850">
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox"
                              checked={item.value}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setFormData(prev => {
                                  const symptoms = { ...prev.chiefComplaint.symptoms };
                                  symptoms[key] = { ...symptoms[key], value: checked };
                                  return { ...prev, chiefComplaint: { ...prev.chiefComplaint, symptoms } };
                                });
                              }}
                              className="w-4.5 h-4.5 rounded accent-indigo-650"
                            />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{dynamicSymptomLabels[key] || key}</span>
                          </div>
                          {item.value && (
                            <input 
                              type="text"
                              placeholder="Describe context/severity..."
                              value={item.notes}
                              onChange={(e) => {
                                const notesVal = e.target.value;
                                setFormData(prev => {
                                  const symptoms = { ...prev.chiefComplaint.symptoms };
                                  symptoms[key] = { ...symptoms[key], notes: notesVal };
                                  return { ...prev, chiefComplaint: { ...prev.chiefComplaint, symptoms } };
                                });
                              }}
                              className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-medium rounded-lg sm:w-64 w-full focus:outline-none"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Clinical Examination */}
            {step === 4 && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Stethoscope className="text-emerald-500" size={18} /> Objective Clinical Examination
                </h3>

                {/* Muscle Power Grades */}
                <div className="mb-4">
                  <span className="text-xs font-extrabold text-slate-500 block mb-2.5 uppercase">Muscle Power Grades (0 - 5)</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
                    <div className="p-3 bg-slate-50 dark:bg-slate-850/30 rounded-2xl border border-slate-150/40 dark:border-slate-850 flex flex-col gap-1.5">
                      <span>Right Upper Limb</span>
                      <input 
                        type="number"
                        min="0"
                        max="5"
                        value={formData.clinicalExamination.musclePower.rightUpper}
                        onChange={(e) => setFormData(prev => {
                          const mp = { ...prev.clinicalExamination.musclePower, rightUpper: parseInt(e.target.value, 10) || 5 };
                          return { ...prev, clinicalExamination: { ...prev.clinicalExamination, musclePower: mp } };
                        })}
                        className="p-2 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 rounded text-center focus:outline-none"
                      />
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-850/30 rounded-2xl border border-slate-150/40 dark:border-slate-850 flex flex-col gap-1.5">
                      <span>Left Upper Limb</span>
                      <input 
                        type="number"
                        min="0"
                        max="5"
                        value={formData.clinicalExamination.musclePower.leftUpper}
                        onChange={(e) => setFormData(prev => {
                          const mp = { ...prev.clinicalExamination.musclePower, leftUpper: parseInt(e.target.value, 10) || 5 };
                          return { ...prev, clinicalExamination: { ...prev.clinicalExamination, musclePower: mp } };
                        })}
                        className="p-2 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 rounded text-center focus:outline-none"
                      />
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-850/30 rounded-2xl border border-slate-150/40 dark:border-slate-850 flex flex-col gap-1.5">
                      <span>Right Lower Limb</span>
                      <input 
                        type="number"
                        min="0"
                        max="5"
                        value={formData.clinicalExamination.musclePower.rightLower}
                        onChange={(e) => setFormData(prev => {
                          const mp = { ...prev.clinicalExamination.musclePower, rightLower: parseInt(e.target.value, 10) || 5 };
                          return { ...prev, clinicalExamination: { ...prev.clinicalExamination, musclePower: mp } };
                        })}
                        className="p-2 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 rounded text-center focus:outline-none"
                      />
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-850/30 rounded-2xl border border-slate-150/40 dark:border-slate-850 flex flex-col gap-1.5">
                      <span>Left Lower Limb</span>
                      <input 
                        type="number"
                        min="0"
                        max="5"
                        value={formData.clinicalExamination.musclePower.leftLower}
                        onChange={(e) => setFormData(prev => {
                          const mp = { ...prev.clinicalExamination.musclePower, leftLower: parseInt(e.target.value, 10) || 5 };
                          return { ...prev, clinicalExamination: { ...prev.clinicalExamination, musclePower: mp } };
                        })}
                        className="p-2 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 rounded text-center focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Range of Motion Joint Selector (Conditional Fields) */}
                <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-extrabold text-slate-500 uppercase">Range of Motion Joint Selection</span>
                    <div className="flex items-center gap-1.5">
                      {(['cervical', 'lumbar', 'shoulder'] as const).map(joint => (
                        <button
                          key={joint}
                          type="button"
                          onClick={() => setRomJointSelection(joint)}
                          className={`px-3 py-1 text-xs font-bold rounded-lg capitalize transition-colors ${
                            romJointSelection === joint 
                              ? 'bg-[#262842] text-white dark:bg-slate-800' 
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-950 hover:bg-slate-200'
                          }`}>
                          {joint}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Render ROM fields based on selector */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-850 flex flex-col gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                    {romJointSelection === 'cervical' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <span>Cervical Flexion (°)</span>
                          <input 
                            type="number"
                            value={formData.clinicalExamination.rom.cervical.flexion}
                            onChange={(e) => setFormData(prev => {
                              const cervical = { ...prev.clinicalExamination.rom.cervical, flexion: e.target.value ? parseInt(e.target.value, 10) : '' };
                              const rom = { ...prev.clinicalExamination.rom, cervical };
                              return { ...prev, clinicalExamination: { ...prev.clinicalExamination, rom } };
                            })}
                            className="p-3 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl font-medium focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span>Cervical Extension (°)</span>
                          <input 
                            type="number"
                            value={formData.clinicalExamination.rom.cervical.extension}
                            onChange={(e) => setFormData(prev => {
                              const cervical = { ...prev.clinicalExamination.rom.cervical, extension: e.target.value ? parseInt(e.target.value, 10) : '' };
                              const rom = { ...prev.clinicalExamination.rom, cervical };
                              return { ...prev, clinicalExamination: { ...prev.clinicalExamination, rom } };
                            })}
                            className="p-3 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl font-medium focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {romJointSelection === 'lumbar' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <span>Lumbar Flexion (°)</span>
                          <input 
                            type="number"
                            value={formData.clinicalExamination.rom.lumbar.flexion}
                            onChange={(e) => setFormData(prev => {
                              const lumbar = { ...prev.clinicalExamination.rom.lumbar, flexion: e.target.value ? parseInt(e.target.value, 10) : '' };
                              const rom = { ...prev.clinicalExamination.rom, lumbar };
                              return { ...prev, clinicalExamination: { ...prev.clinicalExamination, rom } };
                            })}
                            className="p-3 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl font-medium focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span>Lumbar Extension (°)</span>
                          <input 
                            type="number"
                            value={formData.clinicalExamination.rom.lumbar.extension}
                            onChange={(e) => setFormData(prev => {
                              const lumbar = { ...prev.clinicalExamination.rom.lumbar, extension: e.target.value ? parseInt(e.target.value, 10) : '' };
                              const rom = { ...prev.clinicalExamination.rom, lumbar };
                              return { ...prev, clinicalExamination: { ...prev.clinicalExamination, rom } };
                            })}
                            className="p-3 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl font-medium focus:outline-none"
                          />
                        </div>
                      </div>
                    )}

                    {romJointSelection === 'shoulder' && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1.5">
                          <span>Shoulder Abduction (°)</span>
                          <input 
                            type="number"
                            value={formData.clinicalExamination.rom.shoulder.abduction}
                            onChange={(e) => setFormData(prev => {
                              const shoulder = { ...prev.clinicalExamination.rom.shoulder, abduction: e.target.value ? parseInt(e.target.value, 10) : '' };
                              const rom = { ...prev.clinicalExamination.rom, shoulder };
                              return { ...prev, clinicalExamination: { ...prev.clinicalExamination, rom } };
                            })}
                            className="p-3 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl font-medium focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <span>Shoulder Rotation (°)</span>
                          <input 
                            type="number"
                            value={formData.clinicalExamination.rom.shoulder.rotation}
                            onChange={(e) => setFormData(prev => {
                              const shoulder = { ...prev.clinicalExamination.rom.shoulder, rotation: e.target.value ? parseInt(e.target.value, 10) : '' };
                              const rom = { ...prev.clinicalExamination.rom, shoulder };
                              return { ...prev, clinicalExamination: { ...prev.clinicalExamination, rom } };
                            })}
                            className="p-3 border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 rounded-xl font-medium focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Special Tests (comma separated)</label>
                  <input 
                    type="text"
                    placeholder="e.g. Phalen's Test, Lachman Test"
                    value={formData.clinicalExamination.specialTests.join(', ')}
                    onChange={(e) => setFormData(prev => ({ ...prev, clinicalExamination: { ...prev.clinicalExamination, specialTests: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } }))}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase">Findings & Notes</label>
                  <textarea 
                    value={formData.clinicalExamination.findings}
                    onChange={(e) => setFormData(prev => ({ ...prev, clinicalExamination: { ...prev.clinicalExamination, findings: e.target.value } }))}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 h-20"
                  />
                </div>
              </div>
            )}

            {/* Step 5, 6, 7, 8: Neuro Exam (Conditional) */}
            {/* Step 5, 6, 7, 8: Neuro Exam (Conditional) */}
            {currentStepKey === 'neuro_mental' && (
              <StepNeuroExam
                data={formData.neuroData}
                onChange={(updated: any) => setFormData(prev => ({ ...prev, neuroData: updated }))}
                isDoctorRole={false}
                page={1}
              />
            )}
            {currentStepKey === 'neuro_sensory' && (
              <StepNeuroExam
                data={formData.neuroData}
                onChange={(updated: any) => setFormData(prev => ({ ...prev, neuroData: updated }))}
                isDoctorRole={false}
                page={2}
              />
            )}
            {currentStepKey === 'neuro_coordination' && (
              <StepNeuroExam
                data={formData.neuroData}
                onChange={(updated: any) => setFormData(prev => ({ ...prev, neuroData: updated }))}
                isDoctorRole={false}
                page={3}
              />
            )}
            {currentStepKey === 'neuro_gait_hand' && (
              <StepNeuroExam
                data={formData.neuroData}
                onChange={(updated: any) => setFormData(prev => ({ ...prev, neuroData: updated }))}
                isDoctorRole={false}
                page={4}
              />
            )}

            {/* Cardio Exam (Conditional) */}
            {currentStepKey === 'cardio_exam_1' && (
              <StepCardioExam
                data={formData.cardioData}
                onChange={(updated: any) => setFormData(prev => ({ ...prev, cardioData: updated }))}
                isDoctorRole={false}
                anthropometrics={formData.anthropometrics}
                onAnthropometricsChange={(updated: any) => setFormData(prev => ({ ...prev, anthropometrics: updated }))}
                page={1}
              />
            )}
            {currentStepKey === 'cardio_exam_2' && (
              <StepCardioExam
                data={formData.cardioData}
                onChange={(updated: any) => setFormData(prev => ({ ...prev, cardioData: updated }))}
                isDoctorRole={false}
                anthropometrics={formData.anthropometrics}
                onAnthropometricsChange={(updated: any) => setFormData(prev => ({ ...prev, anthropometrics: updated }))}
                page={2}
              />
            )}

            {/* Step 5: Diagnosis & Plan */}
            {currentStepKey === 'diagnosis' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="text-[#262842]" size={18} /> Diagnosis & Treatment Plan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Primary Diagnosis *</label>
                    <input 
                      type="text"
                      value={formData.diagnosis.primary}
                      onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: { ...prev.diagnosis, primary: e.target.value } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">ICD Diagnostic Code</label>
                    <input 
                      type="text"
                      placeholder="e.g. M54.5"
                      value={formData.diagnosis.icdCode}
                      onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: { ...prev.diagnosis, icdCode: e.target.value } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Secondary Diagnoses (comma separated)</label>
                    <input 
                      type="text"
                      value={formData.diagnosis.secondary.join(', ')}
                      onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: { ...prev.diagnosis, secondary: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Prescribed Modalities (comma separated)</label>
                    <input 
                      type="text"
                      placeholder="IFT, Ultrasound, Tens"
                      value={formData.treatmentPlan.modalities.join(', ')}
                      onChange={(e) => setFormData(prev => ({ ...prev, treatmentPlan: { ...prev.treatmentPlan, modalities: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase">Session Frequency</label>
                    <input 
                      type="text"
                      placeholder="e.g. 3 times a week"
                      value={formData.treatmentPlan.frequency}
                      onChange={(e) => setFormData(prev => ({ ...prev, treatmentPlan: { ...prev.treatmentPlan, frequency: e.target.value } }))}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800/60 pt-4">
                  <span className="text-xs font-extrabold text-slate-500 block mb-2.5 uppercase font-bold">Imaging Findings</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase font-bold">X-Ray Findings</label>
                      <textarea 
                        placeholder="X-RAY findings..."
                        value={formData.treatmentPlan.xrayFindings}
                        onChange={(e) => setFormData(prev => ({ ...prev, treatmentPlan: { ...prev.treatmentPlan, xrayFindings: e.target.value } }))}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 h-20"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase font-bold">MRI Findings</label>
                      <textarea 
                        placeholder="MRI findings..."
                        value={formData.treatmentPlan.mriFindings}
                        onChange={(e) => setFormData(prev => ({ ...prev, treatmentPlan: { ...prev.treatmentPlan, mriFindings: e.target.value } }))}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 h-20"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase font-bold">PFT Findings</label>
                      <textarea 
                        placeholder="PFT findings..."
                        value={formData.treatmentPlan.pftFindings}
                        onChange={(e) => setFormData(prev => ({ ...prev, treatmentPlan: { ...prev.treatmentPlan, pftFindings: e.target.value } }))}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-600 h-20"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Payment */}
            {currentStepKey === 'review' && (
              <div className="flex flex-col gap-4">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="text-[#262842]" size={18} /> Payment & Billing Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase">Session Fee Rate (₹)</label>
                    <input 
                      type="number"
                      value={formData.payment.sessionFee}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment: { ...prev.payment, sessionFee: e.target.value ? parseInt(e.target.value, 10) : '' } }))}
                      className="p-3 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950 rounded-xl focus:outline-none text-slate-900 dark:text-white font-extrabold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase">Total Sessions Prescribed</label>
                    <input 
                      type="number"
                      value={formData.payment.totalSessions}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment: { ...prev.payment, totalSessions: e.target.value ? parseInt(e.target.value, 10) : '' } }))}
                      className="p-3 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950 rounded-xl focus:outline-none text-slate-900 dark:text-white font-extrabold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase">Sessions Paid</label>
                    <input 
                      type="number"
                      value={formData.payment.paidSessions}
                      onChange={(e) => setFormData(prev => ({ ...prev, payment: { ...prev.payment, paidSessions: e.target.value ? parseInt(e.target.value, 10) : '' } }))}
                      className="p-3 border border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950 rounded-xl focus:outline-none text-slate-900 dark:text-white font-extrabold"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase text-emerald-600 dark:text-emerald-400">Remaining Balance Due (₹)</label>
                    <input 
                      type="text"
                      disabled
                      value={`₹ ${formData.payment.balance}`}
                      className="p-3 border border-slate-200 dark:border-slate-850 bg-slate-100 dark:bg-slate-900 rounded-xl text-emerald-700 dark:text-emerald-400 font-black cursor-not-allowed"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="uppercase">Payment Status</label>
                    <input 
                      type="text"
                      disabled
                      value={formData.payment.paymentStatus}
                      className="p-3 border border-slate-200 dark:border-slate-850 bg-slate-100 dark:bg-slate-900 rounded-xl text-slate-700 dark:text-slate-300 font-extrabold cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Panel Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={handlePrev}
                disabled={step === 0}
                className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-300 shadow-sm disabled:opacity-50 transition-colors">
                Back
              </button>
              
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-slate-700 dark:text-slate-350 shadow-sm transition-colors flex items-center gap-2">
                  <Save size={13} />
                  Save Draft
                </button>

                {step < stepsList.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-5 py-2.5 text-xs font-extrabold bg-[#262842] dark:bg-slate-800 text-white hover:bg-slate-900 rounded-xl transition-all shadow-md flex items-center gap-1.5">
                    Continue
                    <ChevronRight size={14} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSave(true)}
                    disabled={saving}
                    className="px-5 py-2.5 text-xs font-extrabold bg-emerald-700 text-white hover:bg-emerald-800 rounded-xl transition-all shadow-lg flex items-center gap-1.5">
                    Complete Assessment
                  </button>
                )}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
