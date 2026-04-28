import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import {
  ArrowLeft,
  Printer,
  Share2,
  Download,
  CheckCircle,
  Activity,
  Phone,
  Mail,
  Dumbbell,
} from 'lucide-react';

export function ReportGeneration() {
  const navigate = useNavigate();
  const [action, setAction] = useState<string | null>(null);

  const handleAction = (type: string) => {
    setAction(type);
    setTimeout(() => setAction(null), 1500);
  };

  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="px-5 pb-5 shrink-0"
        style={{
          background: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 70%, #0ea5e9 100%)',
          paddingTop: '20px',
        }}
      >
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-xl"
            style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)' }}>
            <ArrowLeft size={18} color="white" />
          </button>
          <div className="flex-1">
            <h1 style={{ fontSize: '17px', fontWeight: 800, color: 'white' }}>Report Generation</h1>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>Physiotherapy Assessment Report</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          {[
            { label: 'Generate PDF', icon: Download, key: 'pdf' },
            { label: 'Print', icon: Printer, key: 'print' },
            { label: 'Share', icon: Share2, key: 'share' },
          ].map((btn) => {
            const Icon = btn.icon;
            const isActive = action === btn.key;
            return (
              <button
                key={btn.key}
                onClick={() => handleAction(btn.key)}
                className="flex-1 flex flex-col items-center gap-1 py-2.5 rounded-xl"
                style={{ background: isActive ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.15)' }}
              >
                {isActive ? <CheckCircle size={18} color="white" /> : <Icon size={18} color="white" />}
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'white' }}>
                  {isActive ? 'Done!' : btn.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report document */}
      <div className="flex-1 overflow-y-auto px-4 py-4 max-w-3xl mx-auto w-full" style={{ background: '#e0f2fe' }}>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: 'white', boxShadow: '0 4px 24px rgba(0,0,0,0.12)' }}
        >
          {/* Clinic letterhead */}
          <div
            className="px-5 py-4"
            style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-xl shrink-0"
                style={{ width: '44px', height: '44px', background: 'rgba(255,255,255,0.2)' }}>
                <Activity size={24} color="white" />
              </div>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 900, color: 'white', letterSpacing: '-0.3px' }}>
                  SAAI Physiotherapy Clinic
                </p>
                <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.75)' }}>
                  Advanced Sports & Orthopedic Rehabilitation
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-3">
              {[
                { icon: Phone, text: '+91 98765 43210' },
                { icon: Mail, text: 'info@saai.clinic' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-1">
                    <Icon size={11} color="rgba(255,255,255,0.7)" />
                    <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.7)' }}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Report title */}
          <div className="px-5 py-3 flex items-center justify-between"
            style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <div>
              <p style={{ fontSize: '13px', fontWeight: 900, color: '#1e293b', letterSpacing: '1px', textTransform: 'uppercase' }}>
                Physiotherapy Assessment Report
              </p>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>Report ID: SAAI-RPT-2025-0127</p>
            </div>
            <div className="text-right">
              <p style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Date:</p>
              <p style={{ fontSize: '11px', fontWeight: 800, color: '#1e293b' }}>{today}</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-4 flex flex-col gap-4">
            {/* Patient Info */}
            <section>
              <div className="flex items-center gap-2 mb-2 pb-1" style={{ borderBottom: '1.5px solid #2563eb' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Patient Information
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-1.5">
                {[
                  { label: 'Name', value: 'Rahul Verma' },
                  { label: 'Patient ID', value: 'SAAI-2025-001' },
                  { label: 'Age / Gender', value: '45 yrs / Male' },
                  { label: 'Phone', value: '98765 43210' },
                  { label: 'Referred By', value: 'Self' },
                  { label: 'Visit No.', value: '3rd Visit' },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{item.label}</p>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#1e293b' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Vitals */}
            <section>
              <div className="flex items-center gap-2 mb-2 pb-1" style={{ borderBottom: '1.5px solid #e11d48' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#e11d48', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Vital Signs
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'BP', value: '120/80' },
                  { label: 'PR', value: '72 bpm' },
                  { label: 'SpO₂', value: '98%' },
                  { label: 'Temp', value: '98.4°F' },
                  { label: 'EF', value: '60%' },
                  { label: 'Pain', value: '6/10' },
                ].map((v) => (
                  <div key={v.label} className="text-center p-2 rounded-xl"
                    style={{ background: '#f8fafc', border: '1px solid #f1f5f9' }}>
                    <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600 }}>{v.label}</p>
                    <p style={{ fontSize: '13px', fontWeight: 800, color: '#1e293b' }}>{v.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Diagnosis */}
            <section>
              <div className="flex items-center gap-2 mb-2 pb-1" style={{ borderBottom: '1.5px solid #7c3aed' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Diagnosis
                </span>
              </div>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b', lineHeight: 1.6 }}>
                Right Knee ACL Partial Tear with associated meniscal irritation following sports injury.
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {['ACL Tear', 'Meniscal Irritation', 'Sports Injury', 'Right Knee'].map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded-lg"
                    style={{ background: '#f5f3ff', color: '#7c3aed', fontSize: '10px', fontWeight: 700 }}>
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Treatment Plan */}
            <section>
              <div className="flex items-center gap-2 mb-2 pb-1" style={{ borderBottom: '1.5px solid #0f766e' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Treatment Plan
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  'RICE Therapy — Week 1 (Rest, Ice, Compression, Elevation)',
                  'Ultrasound Therapy — 3 sessions/week × 4 weeks',
                  'Quadriceps & Hamstring Strengthening — Week 2 onwards',
                  'Proprioception & Balance Training — Week 4 onwards',
                  'Sports-specific Rehabilitation — Week 6',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="rounded-full shrink-0 mt-1"
                      style={{ width: '5px', height: '5px', background: '#0f766e' }} />
                    <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.5 }}>{item}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Exercise Prescription */}
            <section>
              <div className="flex items-center gap-2 mb-2 pb-1" style={{ borderBottom: '1.5px solid #d97706' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Home Exercise Programme
                </span>
              </div>
              <div className="flex flex-col gap-1.5">
                {[
                  { name: 'Quad Sets', detail: '3 × 15 reps · 10 sec hold' },
                  { name: 'Straight Leg Raise', detail: '3 × 12 reps' },
                  { name: 'Hip Bridges', detail: '3 × 15 reps' },
                  { name: 'Terminal Knee Extension', detail: '2 × 20 reps with band' },
                ].map((ex, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5"
                    style={{ borderBottom: i < 3 ? '1px dashed #f1f5f9' : 'none' }}>
                    <div className="flex items-center gap-2">
                      <Dumbbell size={11} color="#d97706" />
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#1e293b' }}>{ex.name}</span>
                    </div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{ex.detail}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Doctor Notes */}
            <section>
              <div className="flex items-center gap-2 mb-2 pb-1" style={{ borderBottom: '1.5px solid #64748b' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Clinical Notes
                </span>
              </div>
              <p style={{ fontSize: '11px', color: '#475569', lineHeight: 1.7 }}>
                Patient shows good compliance with therapy. Progressive strengthening protocol initiated. Follow-up recommended in 2 weeks. MRI review suggested if pain persists beyond week 4.
              </p>
            </section>

            {/* Signature */}
            <section className="flex items-end justify-between pt-2"
              style={{ borderTop: '1px solid #e2e8f0', marginTop: '4px' }}>
              <div>
                <div className="mb-1" style={{ height: '30px', borderBottom: '1.5px solid #1e293b', width: '100px' }}>
                  <span style={{ fontSize: '14px', fontStyle: 'italic', color: '#1e293b', fontFamily: 'cursive', fontWeight: 700 }}>
                    R. Kumar
                  </span>
                </div>
                <p style={{ fontSize: '10px', fontWeight: 700, color: '#1e293b' }}>Dr. Rajesh Kumar</p>
                <p style={{ fontSize: '10px', color: '#64748b' }}>MPT (Sports), MIAP</p>
                <p style={{ fontSize: '10px', color: '#64748b' }}>Reg. No: PT-2014-05872</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-center rounded-xl mb-1"
                  style={{ width: '48px', height: '48px', background: '#eff6ff', border: '2px solid #bfdbfe', marginLeft: 'auto' }}>
                  <Activity size={22} color="#2563eb" />
                </div>
                <p style={{ fontSize: '9px', color: '#94a3b8' }}>SAAI Clinic Stamp</p>
              </div>
            </section>

            {/* Footer */}
            <div className="pt-2 text-center" style={{ borderTop: '1px dashed #e2e8f0' }}>
              <p style={{ fontSize: '9px', color: '#94a3b8' }}>
                SAAI Physiotherapy Clinic · 42, Health Square, MG Road, Bengaluru – 560001
              </p>
              <p style={{ fontSize: '9px', color: '#94a3b8' }}>
                This report is for medical purposes only. Keep it confidential.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons at bottom */}
        <div className="flex gap-3 mt-4 mb-2">
          <button
            onClick={() => handleAction('pdf')}
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #0369a1, #0ea5e9)',
              color: 'white', fontSize: '14px', fontWeight: 700,
              boxShadow: '0 6px 20px rgba(3,105,161,0.3)',
            }}
          >
            <Download size={17} />
            Generate PDF
          </button>
          <button
            onClick={() => handleAction('share')}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl"
            style={{ background: 'white', color: '#0369a1', fontSize: '14px', fontWeight: 700, border: '1.5px solid #bae6fd' }}
          >
            <Share2 size={17} />
          </button>
          <button
            onClick={() => handleAction('print')}
            className="flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl"
            style={{ background: 'white', color: '#64748b', fontSize: '14px', fontWeight: 700, border: '1.5px solid #e2e8f0' }}
          >
            <Printer size={17} />
          </button>
        </div>
      </div>

      <div className="md:hidden">
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}