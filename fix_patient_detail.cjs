const fs = require('fs');
let p = 'src/app/screens/PatientDetailPage.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(/style={{ fontFamily: "'Inter', 'Poppins', sans-serif", backgroundColor: '#E8E9F1' }}/g, 
  'className="font-sans bg-[#E8E9F1] dark:bg-slate-950"');

c = c.replace(/style={{[\s]*background: 'linear-gradient\(135deg, #262842 0%, #3B3E66 100%\)',[\s]*paddingTop: '32px',[\s]*boxShadow: '0 4px 24px rgba\(38, 40, 66, 0.15\)',[\s]*}}/g, 
  'className="pt-8 shadow-[0_4px_24px_rgba(38,40,66,0.15)] dark:shadow-none bg-gradient-to-br from-[#262842] to-[#3B3E66] dark:from-slate-900 dark:to-slate-800"');

c = c.replace(/style={{ width: '200px', height: '200px', background: '#FEFFFF' }}/g, 
  'className="w-[200px] h-[200px] bg-white opacity-10"');

c = c.replace(/style={{ width: '40px', height: '40px', background: 'rgba\(254,255,255,0.15\)' }}/g, 
  'className="w-10 h-10 bg-white/15"');

c = c.replace(/style={{ width: '40px', height: '40px', background: editMode \? 'rgba\(251,191,36,0.3\)' : 'rgba\(254,255,255,0.15\)' }}/g, 
  'className={`w-10 h-10 ${editMode ? "bg-amber-400/30" : "bg-white/15"}`}');

c = c.replace(/style={{ fontSize: '18px', fontWeight: 700, color: '#FEFFFF' }}/g, 
  'className="text-[18px] font-bold text-white"');

c = c.replace(/style={{ background: 'rgba\(254,255,255,0.15\)', border: '1px solid rgba\(254,255,255,0.2\)' }}/g, 
  'className="bg-white/15 border border-white/20"');

c = c.replace(/style={{ width: '56px', height: '56px', background: 'rgba\(254,255,255,0.2\)', fontSize: '24px' }}/g, 
  'className="w-14 h-14 bg-white/20 text-[24px]"');

c = c.replace(/style={{ fontSize: '13px', color: 'rgba\(254,255,255,0.8\)', marginTop: '2px' }}/g, 
  'className="text-[13px] text-white/80 mt-[2px]"');

c = c.replace(/style={{ background: '#E8E9F1', color: '#3B3E66', fontSize: '11px', fontWeight: 700 }}/g, 
  'className="bg-[#E8E9F1] dark:bg-slate-800 text-[#3B3E66] dark:text-slate-200 text-[11px] font-bold"');

c = c.replace(/style={{ background: '#3B3E66', color: '#FEFFFF', fontSize: '11px', fontWeight: 700 }}/g, 
  'className="bg-[#3B3E66] dark:bg-teal-600 text-white text-[11px] font-bold"');

c = c.replace(/style={{ background: '#FEFFFF', borderBottom: '1px solid #E8E9F1', boxShadow: '0 2px 8px rgba\(23,37,42,0.02\)' }}/g, 
  'className="bg-white dark:bg-slate-900 border-b border-[#E8E9F1] dark:border-slate-800 shadow-[0_2px_8px_rgba(23,37,42,0.02)] dark:shadow-none"');

c = c.replace(/style={{[\s]*fontSize: '13px', fontWeight: 600,[\s]*color: activeTab === tab \? '#3B3E66' : '#262842',[\s]*borderBottom: `2px solid \${activeTab === tab \? '#3B3E66' : 'transparent'}`,[\s]*}}/g, 
  'className={`text-[13px] font-semibold border-b-2 ${activeTab === tab ? "text-[#3B3E66] dark:text-teal-400 border-[#3B3E66] dark:border-teal-400" : "text-[#262842] dark:text-slate-400 border-transparent hover:text-slate-600 dark:hover:text-slate-300"}`}');

c = c.replace(/style={{ background: '#FEFFFF', border: '1px solid #E8E9F1' }}/g, 
  'className="bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800"');

c = c.replace(/style={{ fontSize: '14px', color: '#262842' }}/g, 
  'className="text-[14px] text-[#262842] dark:text-slate-400"');

c = c.replace(/style={{ background: '#FEFFFF', border: '1px solid #E8E9F1', boxShadow: '0 4px 16px rgba\(23, 37, 42, 0.03\)' }}/g, 
  'className="bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-[0_4px_16px_rgba(23,37,42,0.03)] dark:shadow-none"');

c = c.replace(/style={{ background: '#E8E9F1' }}/g, 
  'className="bg-[#E8E9F1] dark:bg-slate-800"');

c = c.replace(/style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}/g, 
  'className="text-[15px] font-bold text-[#17252A] dark:text-white"');

c = c.replace(/style={{ fontSize: '15px', fontWeight: 600, color: '#3B3E66' }}/g, 
  'className="text-[15px] font-semibold text-[#3B3E66] dark:text-slate-200"');

c = c.replace(/style={{ fontSize: '13px', color: '#262842', marginTop: '4px' }}/g, 
  'className="text-[13px] text-[#262842] dark:text-slate-400 mt-1"');

c = c.replace(/style={{ fontSize: '13px', color: '#262842' }}/g, 
  'className="text-[13px] text-[#262842] dark:text-slate-400"');

c = c.replace(/style={{ background: '#E8E9F1', color: '#3B3E66', fontSize: '13px', fontWeight: 600, border: '1px solid #E8E9F1' }}/g, 
  'className="bg-[#E8E9F1] dark:bg-slate-800 text-[#3B3E66] dark:text-slate-200 text-[13px] font-semibold border border-[#E8E9F1] dark:border-slate-700"');

c = c.replace(/style={{ background: '#E8E9F1', color: '#262842', fontSize: '13px', fontWeight: 600, border: '1px solid #E8E9F1' }}/g, 
  'className="bg-[#E8E9F1] dark:bg-slate-800 text-[#262842] dark:text-slate-300 text-[13px] font-semibold border border-[#E8E9F1] dark:border-slate-700"');

c = c.replace(/style={{ fontSize: '16px', fontWeight: 700, color: '#262842' }}/g, 
  'className="text-[16px] font-bold text-[#262842] dark:text-slate-400"');

c = c.replace(/style={{ fontSize: '16px' }}/g, 
  'className="text-[16px]"');

c = c.replace(/style={{ fontSize: '20px', fontWeight: 800, color: painColors\[painLevel\] }}/g, 
  'className="text-[20px] font-extrabold" style={{ color: painColors[painLevel] }}');

c = c.replace(/style={{ height: '32px', background: c, opacity: i <= painLevel \? 1 : 0.15 }}/g, 
  'className="h-8" style={{ background: c, opacity: i <= painLevel ? 1 : 0.15 }}');

c = c.replace(/style={{ fontSize: '10px', fontWeight: 700, color: '#FEFFFF' }}/g, 
  'className="text-[10px] font-bold text-white"');

c = c.replace(/style={{ borderColor: '#E8E9F1' }}/g, 
  'className="border-b border-[#E8E9F1] dark:border-slate-800"');

c = c.replace(/style={{ fontSize: '14px', color: '#262842', fontWeight: 500, textTransform: 'capitalize' }}/g, 
  'className="text-[14px] font-medium text-[#262842] dark:text-slate-300 capitalize"');

c = c.replace(/style={{ background: `\$\{funcColors\[value\] \?\? '#3B3E66'\}15`, color: funcColors\[value\] \?\? '#3B3E66', fontSize: '12px', fontWeight: 600 }}/g, 
  'className="text-[12px] font-semibold" style={{ background: `${funcColors[value] ?? "#3B3E66"}15`, color: funcColors[value] ?? "#3B3E66" }}');

c = c.replace(/style={{ fontSize: '15px', fontWeight: 700, color: '#17252A', marginBottom: '10px' }}/g, 
  'className="text-[15px] font-bold text-[#17252A] dark:text-white mb-2.5"');

c = c.replace(/style={{ fontSize: '14px', color: '#262842', lineHeight: 1.6 }}/g, 
  'className="text-[14px] text-[#262842] dark:text-slate-300 leading-relaxed"');

c = c.replace(/style={{ fontSize: '12px', color: '#262842', fontWeight: 600, marginTop: '8px' }}/g, 
  'className="text-[12px] font-semibold text-[#262842] dark:text-slate-400 mt-2"');

c = c.replace(/style={{ fontSize: '16px', fontWeight: 700, color: vital.color }}/g, 
  'className="text-[16px] font-bold" style={{ color: vital.color }}');

c = c.replace(/style={{ background: '#E8E9F1', fontSize: '11px', fontWeight: 700 }}/g, 
  'className="bg-[#E8E9F1] dark:bg-slate-800 text-[11px] font-bold"');

c = c.replace(/style={{ padding: '16px', borderRadius: '16px', border: '1px solid #E8E9F1', background: '#FEFFFF', color: '#17252A', fontSize: '14px', minHeight: '100px' }}/g, 
  'className="p-4 rounded-2xl border border-[#E8E9F1] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17252A] dark:text-white text-[14px] min-h-[100px]"');

c = c.replace(/style={{ fontSize: '15px', fontWeight: 600, color: '#3B3E66', lineHeight: 1.6 }}/g, 
  'className="text-[15px] font-semibold text-[#3B3E66] dark:text-slate-200 leading-relaxed"');

c = c.replace(/style={{ fontSize: '15px', fontWeight: 700, color: '#17252A', marginBottom: '16px' }}/g, 
  'className="text-[15px] font-bold text-[#17252A] dark:text-white mb-4"');

c = c.replace(/style={{ fontSize: '14px', color: '#262842', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}/g, 
  'className="text-[14px] text-[#262842] dark:text-slate-300 leading-relaxed whitespace-pre-wrap"');

c = c.replace(/style={{ background: 'linear-gradient\(135deg, #262842, #3B3E66\)', color: '#FEFFFF', fontSize: '15px', fontWeight: 700, boxShadow: '0 4px 16px rgba\(38, 40, 66, 0.3\)' }}/g, 
  'className="bg-gradient-to-br from-[#262842] to-[#3B3E66] text-white text-[15px] font-bold shadow-[0_4px_16px_rgba(38,40,66,0.3)] dark:shadow-none"');

c = c.replace(/style={{ padding: '16px', borderRadius: '16px', border: '1px solid #E8E9F1', background: '#FEFFFF', color: '#17252A', fontSize: '14px', minHeight: '140px' }}/g, 
  'className="p-4 rounded-2xl border border-[#E8E9F1] dark:border-slate-700 bg-white dark:bg-slate-900 text-[#17252A] dark:text-white text-[14px] min-h-[140px]"');

c = c.replace(/style={{ fontSize: '14px', color: '#262842', lineHeight: 1.7 }}/g, 
  'className="text-[14px] text-[#262842] dark:text-slate-300 leading-relaxed"');

c = c.replace(/style={{ background: '#FEFFFF' }}/g, 
  'className="bg-white dark:bg-slate-900"');

c = c.replace(/style={{ fontSize: '14px', color: '#262842', marginBottom: '16px' }}/g, 
  'className="text-[14px] text-[#262842] dark:text-slate-400 mb-4"');

c = c.replace(/style={{ background: '#3B3E66', color: '#FEFFFF', fontSize: '13px', fontWeight: 600 }}/g, 
  'className="bg-[#3B3E66] text-white text-[13px] font-semibold"');

c = c.replace(/style={{ background: '#FEFFFF', border: '1px solid #E8E9F1', boxShadow: '0 2px 12px rgba\(23,37,42,0.04\)' }}/g, 
  'className="bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800 shadow-[0_2px_12px_rgba(23,37,42,0.04)] dark:shadow-none"');

c = c.replace(/style={{ borderTop: '1px solid #E8E9F1', background: '#FEFFFF' }}/g, 
  'className="border-t border-[#E8E9F1] dark:border-slate-800 bg-white dark:bg-slate-900"');

fs.writeFileSync(p, c);
