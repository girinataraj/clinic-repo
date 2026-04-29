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
    <div className="flex flex-col h-full saai-page" style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#DEF2F1' }}>
      {/* Header */}
      <div
        className="px-6 pb-6 shrink-0 rounded-b-3xl relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #2B7A78 0%, #3AAFA9 100%)',
          paddingTop: '32px',
          boxShadow: '0 4px 24px rgba(43, 122, 120, 0.15)',
        }}
      >
        <div className="absolute -right-16 -top-16 rounded-full opacity-10"
          style={{ width: '200px', height: '200px', background: '#FEFFFF' }} />
          
        <div className="flex items-center gap-4 mb-6 relative z-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-2xl transition-colors hover:bg-white/20"
            style={{ width: '40px', height: '40px', background: 'rgba(254,255,255,0.15)' }}>
            <ArrowLeft size={20} color="#FEFFFF" />
          </button>
          <div className="flex-1">
            <h1 style={{ fontSize: '18px', fontWeight: 700, color: '#FEFFFF' }}>Report Generation</h1>
            <p style={{ fontSize: '13px', color: 'rgba(254,255,255,0.8)' }}>Physiotherapy Assessment Report</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 relative z-10">
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
                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-2xl transition-colors hover:bg-white/20"
                style={{ background: isActive ? 'rgba(254,255,255,0.3)' : 'rgba(254,255,255,0.15)', border: '1px solid rgba(254,255,255,0.2)' }}
              >
                {isActive ? <CheckCircle size={20} color="#FEFFFF" /> : <Icon size={20} color="#FEFFFF" />}
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#FEFFFF' }}>
                  {isActive ? 'Done!' : btn.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Report document */}
      <div className="flex-1 overflow-y-auto px-5 py-6 max-w-3xl mx-auto w-full">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: '#FEFFFF', boxShadow: '0 8px 32px rgba(23, 37, 42, 0.05)', border: '1px solid #DEF2F1' }}
        >
          {/* Clinic letterhead */}
          <div
            className="px-6 py-5"
            style={{ background: 'linear-gradient(135deg, #2B7A78, #3AAFA9)' }}
          >
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center rounded-2xl shrink-0"
                style={{ width: '48px', height: '48px', background: 'rgba(254,255,255,0.2)' }}>
                <Activity size={24} color="#FEFFFF" />
              </div>
              <div>
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#FEFFFF', letterSpacing: '-0.3px' }}>
                  SAAI Physiotherapy Clinic
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(254,255,255,0.8)' }}>
                  Advanced Sports & Orthopedic Rehabilitation
                </p>
              </div>
            </div>
            <div className="flex gap-4 mt-4">
              {[
                { icon: Phone, text: '+91 98765 43210' },
                { icon: Mail, text: 'info@saai.clinic' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="flex items-center gap-1.5">
                    <Icon size={12} color="rgba(254,255,255,0.8)" />
                    <span style={{ fontSize: '11px', fontWeight: 500, color: 'rgba(254,255,255,0.9)' }}>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Report title */}
          <div className="px-6 py-4 flex items-center justify-between"
            style={{ background: '#FEFFFF', borderBottom: '1px solid #DEF2F1' }}>
            <div>
              <p style={{ fontSize: '14px', fontWeight: 800, color: '#17252A', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Physiotherapy Assessment Report
              </p>
              <p style={{ fontSize: '12px', color: '#2B7A78', marginTop: '2px' }}>Report ID: SAAI-RPT-2025-0127</p>
            </div>
            <div className="text-right">
              <p style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 600 }}>Date:</p>
              <p style={{ fontSize: '13px', fontWeight: 700, color: '#17252A' }}>{today}</p>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5 flex flex-col gap-5">
            {/* Patient Info */}
            <section>
              <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1.5px solid #3AAFA9' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#3AAFA9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Patient Information
                </span>
              </div>
              <div className="grid grid-cols-2 gap-y-3">
                {[
                  { label: 'Name', value: 'Rahul Verma' },
                  { label: 'Patient ID', value: 'SAAI-2025-001' },
                  { label: 'Age / Gender', value: '45 yrs / Male' },
                  { label: 'Phone', value: '98765 43210' },
                  { label: 'Referred By', value: 'Self' },
                  { label: 'Visit No.', value: '3rd Visit' },
                ].map((item) => (
                  <div key={item.label}>
                    <p style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 600 }}>{item.label}</p>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#17252A' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Vitals */}
            <section>
              <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1.5px solid #2B7A78' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#2B7A78', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Vital Signs
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'BP', value: '120/80' },
                  { label: 'PR', value: '72 bpm' },
                  { label: 'SpO₂', value: '98%' },
                  { label: 'Temp', value: '98.4°F' },
                  { label: 'EF', value: '60%' },
                  { label: 'Pain', value: '6/10' },
                ].map((v) => (
                  <div key={v.label} className="text-center p-3 rounded-xl"
                    style={{ background: '#FEFFFF', border: '1px solid #DEF2F1' }}>
                    <p style={{ fontSize: '11px', color: '#2B7A78', fontWeight: 600 }}>{v.label}</p>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#17252A' }}>{v.value}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Diagnosis */}
            <section>
              <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1.5px solid #17252A' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#17252A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Diagnosis
                </span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#17252A', lineHeight: 1.6 }}>
                Right Knee ACL Partial Tear with associated meniscal irritation following sports injury.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['ACL Tear', 'Meniscal Irritation', 'Sports Injury', 'Right Knee'].map((tag) => (
                  <span key={tag} className="px-3 py-1 rounded-lg"
                    style={{ background: '#DEF2F1', color: '#17252A', fontSize: '11px', fontWeight: 600, border: '1px solid #DEF2F1' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            {/* Treatment Plan */}
            <section>
              <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1.5px solid #3AAFA9' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#3AAFA9', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Treatment Plan
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  'RICE Therapy — Week 1 (Rest, Ice, Compression, Elevation)',
                  'Ultrasound Therapy — 3 sessions/week × 4 weeks',
                  'Quadriceps & Hamstring Strengthening — Week 2 onwards',
                  'Proprioception & Balance Training — Week 4 onwards',
                  'Sports-specific Rehabilitation — Week 6',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="rounded-full shrink-0 mt-1.5"
                      style={{ width: '6px', height: '6px', background: '#3AAFA9' }} />
                    <p style={{ fontSize: '13px', color: '#17252A', lineHeight: 1.5 }}>{item}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Exercise Prescription */}
            <section>
              <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1.5px solid #2B7A78' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#2B7A78', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Home Exercise Programme
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {[
                  { name: 'Quad Sets', detail: '3 × 15 reps · 10 sec hold' },
                  { name: 'Straight Leg Raise', detail: '3 × 12 reps' },
                  { name: 'Hip Bridges', detail: '3 × 15 reps' },
                  { name: 'Terminal Knee Extension', detail: '2 × 20 reps with band' },
                ].map((ex, i) => (
                  <div key={i} className="flex items-center justify-between py-2"
                    style={{ borderBottom: i < 3 ? '1px dashed #DEF2F1' : 'none' }}>
                    <div className="flex items-center gap-3">
                      <Dumbbell size={14} color="#2B7A78" />
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#17252A' }}>{ex.name}</span>
                    </div>
                    <span style={{ fontSize: '12px', color: '#2B7A78' }}>{ex.detail}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Doctor Notes */}
            <section>
              <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1.5px solid #17252A' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#17252A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Clinical Notes
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#2B7A78', lineHeight: 1.7 }}>
                Patient shows good compliance with therapy. Progressive strengthening protocol initiated. Follow-up recommended in 2 weeks. MRI review suggested if pain persists beyond week 4.
              </p>
            </section>

            {/* Signature */}
            <section className="flex items-end justify-between pt-4 mt-2"
              style={{ borderTop: '1px solid #DEF2F1' }}>
              <div>
                <div className="mb-2" style={{ height: '40px', borderBottom: '1px solid #17252A', width: '120px' }}>
                  <span style={{ fontSize: '20px', fontStyle: 'italic', color: '#17252A', fontFamily: 'cursive', fontWeight: 700 }}>
                    R. Kumar
                  </span>
                </div>
                <p style={{ fontSize: '12px', fontWeight: 700, color: '#17252A' }}>Dr. Rajesh Kumar</p>
                <p style={{ fontSize: '11px', color: '#2B7A78', marginTop: '2px' }}>MPT (Sports), MIAP</p>
                <p style={{ fontSize: '11px', color: '#2B7A78' }}>Reg. No: PT-2014-05872</p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-center rounded-2xl mb-2"
                  style={{ width: '56px', height: '56px', background: '#DEF2F1', border: '2px solid #DEF2F1', marginLeft: 'auto' }}>
                  <Activity size={24} color="#3AAFA9" />
                </div>
                <p style={{ fontSize: '10px', color: '#2B7A78', fontWeight: 600 }}>SAAI Clinic Stamp</p>
              </div>
            </section>

            {/* Footer */}
            <div className="pt-4 text-center mt-2" style={{ borderTop: '1px dashed #DEF2F1' }}>
              <p style={{ fontSize: '10px', color: '#2B7A78' }}>
                SAAI Physiotherapy Clinic · 42, Health Square, MG Road, Bengaluru – 560001
              </p>
              <p style={{ fontSize: '10px', color: '#2B7A78', marginTop: '2px' }}>
                This report is for medical purposes only. Keep it confidential.
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons at bottom */}
        <div className="flex gap-3 mt-6 mb-4">
          <button
            onClick={() => handleAction('pdf')}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl transition-transform hover:-translate-y-1"
            style={{
              background: 'linear-gradient(135deg, #2B7A78, #3AAFA9)',
              color: '#FEFFFF', fontSize: '15px', fontWeight: 700,
              boxShadow: '0 4px 16px rgba(43, 122, 120, 0.3)',
            }}
          >
            <Download size={18} />
            Generate PDF
          </button>
          <button
            onClick={() => handleAction('share')}
            className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl transition-colors"
            style={{ background: '#FEFFFF', color: '#3AAFA9', fontSize: '15px', fontWeight: 700, border: '1px solid #DEF2F1' }}
          >
            <Share2 size={18} />
          </button>
          <button
            onClick={() => handleAction('print')}
            className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl transition-colors"
            style={{ background: '#FEFFFF', color: '#2B7A78', fontSize: '15px', fontWeight: 700, border: '1px solid #DEF2F1' }}
          >
            <Printer size={18} />
          </button>
        </div>
      </div>

      <div className="md:hidden" style={{ borderTop: '1px solid #DEF2F1', background: '#FEFFFF' }}>
        <BottomNav role="doctor" />
      </div>
    </div>
  );
}