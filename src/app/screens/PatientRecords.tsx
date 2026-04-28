import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { FileText, Download, Activity, Calendar, ArrowLeft, Search, Filter, Heart, Sliders, CheckCircle } from 'lucide-react';

const records = [
  { id: 1, title: 'Knee Assessment Report', date: 'Jan 20, 2025', doctor: 'Dr. Rajesh Kumar', type: 'Assessment', status: 'Final', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 2, title: 'Back Pain Evaluation', date: 'Dec 15, 2024', doctor: 'Dr. Priya Nair', type: 'Evaluation', status: 'Final', color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 3, title: 'Post-op Rehab Plan', date: 'Nov 28, 2024', doctor: 'Dr. Rajesh Kumar', type: 'Treatment', status: 'Updated', color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 4, title: 'X-Ray Results - Right Knee', date: 'Nov 25, 2024', doctor: 'Dr. Amit Shah', type: 'Imaging', status: 'Final', color: 'text-indigo-600', bg: 'bg-indigo-50' },
];

const painColors = [
  '#22c55e', '#84cc16', '#a3e635', '#facc15', '#fb923c',
  '#f97316', '#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d',
];

const mockDetails = {
  vitals: { bp_sys: '120', bp_dia: '80', pr: '72', spo2: '98', temp: '98.6', ef: '55' },
  symptoms: ['Lower Back Pain', 'Stiffness', 'Fatigue'],
  painLevel: 5
};

export function PatientRecords() {
  const navigate = useNavigate();
  const [selectedRecord, setSelectedRecord] = useState<typeof records[0] | null>(null);

  const handleDownload = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    alert('Preparing PDF Download...');
    window.print();
  };

  if (selectedRecord) {
    return (
      <div className="flex flex-col h-full bg-slate-50 font-sans print:bg-white">
        {/* Detail View Header */}
        <div 
          className="px-6 pt-8 pb-6 shrink-0 relative overflow-hidden print:hidden"
          style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedRecord(null)}
                className="flex items-center justify-center p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
              >
                <ArrowLeft size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight drop-shadow-sm">{selectedRecord.title}</h1>
                <p className="text-xs text-blue-100 mt-0.5 font-medium">{selectedRecord.date} • {selectedRecord.doctor}</p>
              </div>
            </div>
            <button 
              onClick={handleDownload}
              className="flex items-center gap-2 p-2.5 px-4 rounded-xl bg-white text-blue-600 font-bold hover:bg-blue-50 shadow-sm transition-colors"
            >
              <Download size={18} />
              <span className="hidden sm:inline">Download PDF</span>
            </button>
          </div>
        </div>
        
        {/* Print Only Header */}
        <div className="hidden print:block text-center py-6 border-b border-slate-200">
           <h1 className="text-2xl font-bold text-slate-900">{selectedRecord.title}</h1>
           <p className="text-slate-500 mt-1">{selectedRecord.date} | {selectedRecord.doctor}</p>
        </div>

        {/* Form Content matching Nurse Intake styling */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-3xl mx-auto w-full print:px-0">
          
          {/* Vitals */}
          <div className="p-5 rounded-2xl print:shadow-none print:border" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="rounded-xl flex items-center justify-center print:border print:border-rose-100" style={{ width: '36px', height: '36px', background: '#fff1f2' }}>
                <Heart size={18} color="#e11d48" />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Vital Signs</h2>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="col-span-2 md:col-span-3 mb-1">
                <p className="text-[11px] font-bold text-slate-500 mb-1.5">Blood Pressure (mmHg)</p>
                <div className="flex items-center gap-3">
                   <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-sm font-bold text-slate-800">{mockDetails.vitals.bp_sys} <span className="text-slate-400 text-xs ml-1 font-semibold">Systolic</span></div>
                   <span className="text-slate-400 font-bold">/</span>
                   <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200 text-center text-sm font-bold text-slate-800">{mockDetails.vitals.bp_dia} <span className="text-slate-400 text-xs ml-1 font-semibold">Diastolic</span></div>
                </div>
              </div>
              
              {[
                { label: 'Pulse Rate (bpm)', val: mockDetails.vitals.pr, icon: '💓' },
                { label: 'SpO₂ (%)', val: mockDetails.vitals.spo2, icon: '🫁' },
                { label: 'Temperature (°F)', val: mockDetails.vitals.temp, icon: '🌡️' },
                { label: 'Ejection Fraction (%)', val: mockDetails.vitals.ef, icon: '❤️' },
              ].map(v => (
                <div key={v.label}>
                  <p className="text-[11px] font-bold text-slate-500 mb-1.5">{v.icon} {v.label}</p>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-800">
                    {v.val}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Symptoms */}
          <div className="p-5 rounded-2xl print:shadow-none print:border" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="rounded-xl flex items-center justify-center print:border print:border-blue-100" style={{ width: '36px', height: '36px', background: '#eff6ff' }}>
                <Activity size={18} color="#2563eb" />
              </div>
              <div>
                <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Symptoms</h2>
                <p style={{ fontSize: '11px', color: '#64748b' }}>{mockDetails.symptoms.length} items recorded</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-2.5">
              {mockDetails.symptoms.map(s => (
                <div key={s} className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl">
                  <div className="rounded-lg w-5 h-5 flex items-center justify-center bg-blue-600 shrink-0">
                    <CheckCircle size={12} color="white" strokeWidth={3} />
                  </div>
                  <span className="text-sm font-bold text-blue-900">{s}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pain Scale */}
          <div className="p-5 rounded-2xl print:shadow-none print:border" style={{ background: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center gap-2 mb-6">
              <div className="rounded-xl flex items-center justify-center print:border print:border-orange-100" style={{ width: '36px', height: '36px', background: '#fff7ed' }}>
                <Sliders size={18} color="#f97316" />
              </div>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>Pain Scale</h2>
            </div>
            
            <div className="flex flex-col items-center">
              <div
                className="rounded-full flex items-center justify-center mb-3"
                style={{ width: '100px', height: '100px', background: `${painColors[mockDetails.painLevel]}20` }}
              >
                <div
                  className="rounded-full flex items-center justify-center print:border-4"
                  style={{ width: '80px', height: '80px', background: painColors[mockDetails.painLevel], borderColor: painColors[mockDetails.painLevel] }}
                >
                  <span style={{ fontSize: '32px', fontWeight: 900, color: 'white', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}>{mockDetails.painLevel}</span>
                </div>
              </div>
              <p style={{ fontSize: '18px', fontWeight: 800, color: painColors[mockDetails.painLevel] }}>
                Moderate Pain
              </p>
              
              <div className="w-full mt-8 pt-6 border-t border-slate-100 relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-yellow-400 to-red-600 rounded-full opacity-30" />
                <div className="flex justify-between w-full">
                  <span className="text-xs font-bold text-green-600">0 — None</span>
                  <span className="text-xs font-bold text-orange-500">5 — Moderate</span>
                  <span className="text-xs font-bold text-red-700">10 — Severe</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 font-sans">
      {/* Header */}
      <div 
        className="px-6 pt-8 pb-10 shrink-0 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1e3a8a, #2563eb)' }}
      >
        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => navigate('/patient')}
              className="flex items-center justify-center p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors border border-white/20 backdrop-blur-sm"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight drop-shadow-sm">Medical Records</h1>
              <p className="text-sm text-blue-100 mt-0.5 font-medium">View and download your reports</p>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-blue-200" />
              </div>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-sm text-white placeholder-blue-200/70 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all backdrop-blur-sm"
                placeholder="Search records..."
              />
            </div>
            <button className="flex items-center justify-center p-2.5 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all backdrop-blur-sm">
              <Filter className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-24 md:pb-6">
        <div className="max-w-5xl mx-auto space-y-4">
          {records.map((record) => (
            <div 
              key={record.id} 
              onClick={() => setSelectedRecord(record)}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_4px_25px_rgb(0,0,0,0.06)] transition-all group cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${record.bg}`}>
                  <FileText className={`w-6 h-6 ${record.color}`} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-[15px] font-bold text-slate-900 truncate pr-4">{record.title}</h3>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0 ${record.bg} ${record.color}`}>
                      {record.type}
                    </span>
                  </div>
                  
                  <p className="text-xs font-semibold text-slate-500 mb-2.5">{record.doctor}</p>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">{record.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Activity className="w-3.5 h-3.5" />
                      <span className="text-[11px] font-bold">{record.status}</span>
                    </div>
                  </div>
                </div>

                <button 
                  onClick={handleDownload}
                  className="p-2.5 rounded-xl bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors shrink-0 opacity-100 md:opacity-0 group-hover:opacity-100"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Empty State / Bottom text */}
          <div className="text-center mt-8 pb-4">
            <p className="text-xs font-semibold text-slate-400">Showing all {records.length} records</p>
          </div>
        </div>
      </div>

      <div className="md:hidden shrink-0 border-t border-slate-200 bg-white">
        <BottomNav role="patient" />
      </div>
    </div>
  );
}
