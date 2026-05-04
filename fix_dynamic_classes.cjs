const fs = require('fs');

function fixDynamicClasses(filePath) {
  let c = fs.readFileSync(filePath, 'utf8');
  let original = c;

  // Handle: className="..." className={`...`}
  let regex1 = /className="([^"]+)"[\s\n]*className=\{`([^`]+)`\}/g;
  while (regex1.test(c)) {
    c = c.replace(regex1, 'className={`$1 $2`}');
  }

  // Handle: className="..." className={...}
  let regex2 = /className="([^"]+)"[\s\n]*className=\{([^}]+)\}/g;
  while (regex2.test(c)) {
    c = c.replace(regex2, 'className={`$1 ${$2}`}');
  }

  if (c !== original) {
    fs.writeFileSync(filePath, c);
    console.log(`Fixed dynamic classNames in ${filePath}`);
  }
}

fixDynamicClasses('src/app/screens/PatientDetailPage.tsx');
fixDynamicClasses('src/app/screens/DoctorPatients.tsx');
fixDynamicClasses('src/app/screens/DoctorRevenue.tsx');
fixDynamicClasses('src/app/screens/ReportGeneration.tsx');
