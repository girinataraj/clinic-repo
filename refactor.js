const fs = require('fs');
const filePath = 'src/app/screens/DoctorDashboard.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// 1. ThemeToggle positioning
// Currently it is before Notification Dropdown. We'll leave it but change the relative classes.

// 2. Refactor styles to Tailwind
content = content.replace(/style=\{\{\s*fontFamily: ['"]Inter['"], ['"]Poppins['"], sans-serif['"], backgroundColor: ['"]#E8E9F1['"]\s*\}\}/g, '');
content = content.replace(/<div className="flex flex-col h-full"/g, '<div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 font-sans"');

content = content.replace(/className="px-6 pb-12 relative overflow-hidden rounded-b-3xl"[\s\S]*?style=\{\{.*?boxShadow: '0 4px 24px rgba\(38, 40, 66, 0\.15\)',?\s*\}\}/g, 
  'className="px-6 pb-12 pt-8 relative overflow-hidden rounded-b-3xl bg-gradient-to-br from-[#262842] to-[#3B3E66] shadow-lg shadow-slate-900/10"');

content = content.replace(/style=\{\{ width: '200px', height: '200px', background: '#FEFFFF' \}\}/g, 
  'style={{ width: \\'200px\\', height: \\'200px\\' }} className="bg-white/10"');
content = content.replace(/style=\{\{ width: '80px', height: '80px', background: '#FEFFFF' \}\}/g, 
  'style={{ width: \\'80px\\', height: \\'80px\\' }} className="bg-white/20"');

// Header Text Colors
content = content.replace(/color: '#FEFFFF'/g, "color: 'white'");
content = content.replace(/color: 'rgba\(254, 255, 255, 0\.8\)'/g, "color: 'rgba(255,255,255,0.8)'");

// Cards background and border
content = content.replace(/style=\{\{\s*background: '#FEFFFF',\s*boxShadow: '0 8px 24px rgba\(23, 37, 42, 0\.08\)',\s*border: '1px solid #E8E9F1'\s*\}\}/g, 
  'className="bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700"');
content = content.replace(/style=\{\{\s*background: '#E8E9F1'\s*\}\}/g, 
  'className="bg-slate-100 dark:bg-slate-700"');
content = content.replace(/style=\{\{\s*background: '#FEFFFF',\s*border: '1px solid #E8E9F1'\s*\}\}/g, 
  'className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"');
content = content.replace(/style=\{\{\s*background: '#FEFFFF',\s*border: '1px solid #E8E9F1',\s*boxShadow: '0 2px 8px rgba\(23,37,42,0\.02\)'\s*\}\}/g, 
  'className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm"');
content = content.replace(/style=\{\{\s*background: '#FEFFFF',\s*boxShadow: '0 4px 20px rgba\(23, 37, 42, 0\.04\)',\s*border: `1px solid \$\{patient\.status === 'in-session' \? '#3B3E66' : '#E8E9F1'\}`,\s*\}\}/g, 
  'className={`bg-white dark:bg-slate-800 shadow-sm border ${patient.status === \\'in-session\\' ? \\'border-indigo-500 dark:border-indigo-400\\' : \\'border-slate-200 dark:border-slate-700\\'}`}');

// Other card inline styles that are harder to regex reliably: we'll just remove them or add className to the span
content = content.replace(/style=\{\{\s*fontSize: '24px',\s*fontWeight: 700,\s*color: '#17252A',\s*lineHeight: 1\s*\}\}/g, 
  'className="text-2xl font-bold text-slate-900 dark:text-white leading-none"');
content = content.replace(/style=\{\{\s*fontSize: '12px',\s*color: '#262842',\s*fontWeight: 500,\s*marginTop: '6px',\s*textAlign: 'center'\s*\}\}/g, 
  'className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-1.5 text-center"');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Replaced styles successfully");
