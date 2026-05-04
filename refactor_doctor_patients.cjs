const fs = require('fs');

let p = 'src/app/screens/DoctorPatients.tsx';
let c = fs.readFileSync(p, 'utf8');

// Replace page bg
c = c.replace(/className="flex flex-col h-full saai-page" style={{ backgroundColor: '#E8E9F1' }}/, 
              'className="flex flex-col h-full saai-page bg-[#E8E9F1] dark:bg-slate-950 font-sans"');

// filter buttons
c = c.replace(/style={{([\s\n]*)background: statusFilter === item\.key \? '#3B3E66' : '#FEFFFF',([\s\n]*)color: statusFilter === item\.key \? '#FEFFFF' : '#262842',([\s\n]*)border: `1px solid \${statusFilter === item\.key \? '#3B3E66' : '#E8E9F1'}`([\s\n]*)}}/g, 
              'className={`text-[12px] font-semibold transition-colors ${statusFilter === item.key ? "bg-[#3B3E66] dark:bg-teal-600 text-white border-[#3B3E66] dark:border-teal-600" : "bg-white dark:bg-slate-900 text-[#262842] dark:text-slate-300 border-[#E8E9F1] dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"}` }');

// Replace search bar container
c = c.replace(/style={{ background: '#FEFFFF', border: '1px solid #E8E9F1' }}/g, 
              'className="bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800"');

// Replace buttons and inputs
c = c.replace(/className="flex-1 outline-none bg-transparent"([\s\n]*)style={{ padding: '10px 0', fontSize: '13px', color: '#17252A' }}/g, 
              'className="flex-1 outline-none bg-transparent py-2.5 text-[13px] text-[#17252A] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"');

// text colors
c = c.replace(/className="display-font"([\s\n]*)style={{ fontSize: '18px', fontWeight: 700, color: '#17252A' }}/g, 
              'className="display-font text-[18px] font-bold text-[#17252A] dark:text-white"');
              
c = c.replace(/style={{ fontSize: '12px', color: '#262842', fontWeight: 600 }}/g, 
              'className="text-[12px] font-semibold text-[#262842] dark:text-slate-400"');

c = c.replace(/className="saai-panel rounded-2xl p-4 animate-pulse"([\s\n]*)style={{ background: '#FEFFFF', border: '1px solid #E8E9F1' }}/g, 
              'className="saai-panel rounded-2xl p-4 animate-pulse bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800"');
              
c = c.replace(/className="col-span-2 rounded-2xl p-6 text-center"([\s\n]*)style={{ background: '#fff5f5', border: '1px solid #fed7d7' }}/g, 
              'className="col-span-2 rounded-2xl p-6 text-center bg-[#fff5f5] dark:bg-red-900/20 border border-[#fed7d7] dark:border-red-900/50"');

// Replace patient card text colors
c = c.replace(/className="display-font"([\s\n]*)style={{ fontSize: '15px', fontWeight: 700, color: '#17252A' }}/g, 
              'className="display-font text-[15px] font-bold text-[#17252A] dark:text-white"');
c = c.replace(/style={{ fontSize: '12px', color: '#262842', marginTop: '2px' }}/g, 
              'className="text-[12px] text-[#262842] dark:text-slate-400 mt-[2px]"');

c = c.replace(/className="rounded-lg px-2 py-1"([\s\n]*)style={{ background: '#E8E9F1', color: '#17252A', fontSize: '11px', fontWeight: 700 }}/g, 
              'className="rounded-lg px-2 py-1 bg-[#E8E9F1] dark:bg-slate-800 text-[#17252A] dark:text-slate-200 text-[11px] font-bold"');
c = c.replace(/className="rounded-lg px-2 py-1"([\s\n]*)style={{ background: '#E8E9F1', color: '#262842', fontSize: '11px', fontWeight: 600 }}/g, 
              'className="rounded-lg px-2 py-1 bg-[#E8E9F1] dark:bg-slate-800 text-[#262842] dark:text-slate-300 text-[11px] font-semibold"');

// Action buttons
c = c.replace(/className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2\.5 transition-colors"([\s\n]*)style={{[\s\n]*background: '#E8E9F1',[\s\n]*color: '#262842',[\s\n]*fontSize: '13px',[\s\n]*fontWeight: 600,[\s\n]*}}/g, 
              'className="flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 transition-colors bg-[#E8E9F1] dark:bg-slate-800 text-[#262842] dark:text-slate-200 text-[13px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"');

c = c.replace(/className="md:hidden"([\s\n]*)style={{ borderTop: '1px solid #E8E9F1', background: '#FEFFFF' }}/g, 
              'className="md:hidden border-t border-[#E8E9F1] dark:border-slate-800 bg-white dark:bg-slate-900"');
              
c = c.replace(/className="w-full max-w-sm rounded-3xl p-5"([\s\n]*)style={{ background: '#FEFFFF', boxShadow: '0 24px 64px rgba\(0,0,0,0.15\)' }}/g, 
              'className="w-full max-w-sm rounded-3xl p-5 bg-white dark:bg-slate-900 shadow-2xl dark:shadow-none border dark:border-slate-800"');

c = c.replace(/className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3"([\s\n]*)style={{ background: '#E8E9F1', border: '1px solid #b2dfdb' }}/g, 
              'className="flex items-center gap-2 px-3 py-2 rounded-xl mb-3 bg-[#E8E9F1] dark:bg-teal-900/30 border border-[#b2dfdb] dark:border-teal-900/50"');

c = c.replace(/className="text-center py-4"([\s\n]*)style={{ fontSize: '11px', color: '#262842', fontWeight: 600 }}/g, 
              'className="text-center py-4 text-[11px] font-semibold text-[#262842] dark:text-slate-400"');

// Care insights
c = c.replace(/<p className="saai-kicker" style={{ color: '#262842' }}>/g, '<p className="saai-kicker text-[#262842] dark:text-slate-400">');
c = c.replace(/className="display-font"([\s\n]*)style={{ fontSize: '16px', fontWeight: 700, color: '#17252A', marginTop: '6px' }}/g, 
              'className="display-font text-[16px] font-bold text-[#17252A] dark:text-white mt-[6px]"');

c = c.replace(/className="rounded-xl px-3 py-2"([\s\n]*)style={{ background: '#FEFFFF', border: '1px solid #E8E9F1', fontSize: '12px', fontWeight: 600, color: '#17252A' }}/g, 
              'className="rounded-xl px-3 py-2 bg-white dark:bg-slate-800 border border-[#E8E9F1] dark:border-slate-700 text-[12px] font-semibold text-[#17252A] dark:text-white"');

c = c.replace(/className="flex items-center justify-between rounded-xl px-3 py-2"([\s\n]*)style={{ background: '#FEFFFF', border: '1px solid #E8E9F1' }}/g, 
              'className="flex items-center justify-between rounded-xl px-3 py-2 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800"');

c = c.replace(/<span style={{ fontSize: '12px', fontWeight: 600, color: '#17252A' }}>/g, 
              '<span className="text-[12px] font-semibold text-[#17252A] dark:text-white">');

c = c.replace(/style={{ animationDelay: `\$\{index \* 70\}ms`, background: '#FEFFFF', border: '1px solid #E8E9F1' }}/g,
              'style={{ animationDelay: `${index * 70}ms` }} className="bg-white dark:bg-slate-800 border border-[#E8E9F1] dark:border-slate-700"');

c = c.replace(/className="saai-panel rounded-2xl p-6 text-center"([\s\n]*)style={{ background: '#FEFFFF', border: '1px solid #E8E9F1' }}/g,
              'className="saai-panel rounded-2xl p-6 text-center bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800"');

c = c.replace(/className="saai-panel rounded-2xl p-4"([\s\n]*)style={{ background: '#FEFFFF', border: '1px solid #E8E9F1' }}/g,
              'className="saai-panel rounded-2xl p-4 bg-white dark:bg-slate-900 border border-[#E8E9F1] dark:border-slate-800"');

fs.writeFileSync(p, c);
