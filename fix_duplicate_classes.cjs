const fs = require('fs');

function fixDuplicateClasses(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // We need to match things like: className="a b c" className="x y z"
  // Note: we can use a regex loop to continually replace adjacent classNames
  let regex = /className="([^"]+)"[\s\n]*className="([^"]+)"/g;
  
  while (regex.test(content)) {
    content = content.replace(regex, 'className="$1 $2"');
  }

  // Also replace cases with single quotes or backticks if any exist, although rare in this specific string literal format
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`Fixed duplicate classNames in ${filePath}`);
  } else {
    console.log(`No duplicate classNames found in ${filePath}`);
  }
}

fixDuplicateClasses('src/app/screens/PatientDetailPage.tsx');
fixDuplicateClasses('src/app/screens/DoctorPatients.tsx');
fixDuplicateClasses('src/app/screens/DoctorRevenue.tsx');
fixDuplicateClasses('src/app/screens/ReportGeneration.tsx');
