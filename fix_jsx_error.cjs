const fs = require('fs');
let p = 'src/app/screens/DoctorPatients.tsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  /className="([^"]+)"([\s\n]*)style={{ animationDelay: `\$\{index \* 70\}ms` }} className="([^"]+)"/g,
  'className="$1 $3"$2style={{ animationDelay: `${index * 70}ms` }}'
);

fs.writeFileSync(p, c);
console.log('Fixed JSX syntax error in DoctorPatients.tsx');
