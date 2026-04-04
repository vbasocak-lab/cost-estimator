const fs = require('fs');
const path = require('path');
const base = 'C:/Users/vbaso/.verdent/verdent-projects/promt-benim-markam-lan/cost-estimator';

const files = [
  'app/api/projects/[id]/route.ts',
  'app/api/projects/[id]/versions/route.ts',
  'app/api/projects/[id]/versions/[vid]/route.ts',
  'app/api/projects/[id]/versions/[vid]/calculate/route.ts',
  'app/api/price-library/route.ts',
  'app/api/reports/excel/route.ts',
  'app/[locale]/admin/price-library/page.tsx',
  'app/[locale]/projects/page.tsx',
  'app/[locale]/projects/new/page.tsx',
  'app/[locale]/projects/[id]/page.tsx',
  'app/[locale]/reports/page.tsx',
  'app/[locale]/dashboard/page.tsx',
];

for (const f of files) {
  const fp = path.join(base, f);
  if (!fs.existsSync(fp)) { console.log('SKIP:', f); continue; }

  // Normalise to LF so regex is reliable, restore CRLF at end
  let raw = fs.readFileSync(fp, 'utf8');
  const hasCRLF = raw.includes('\r\n');
  let c = raw.replace(/\r\n/g, '\n');

  // Remove duplicate auth import if script ran before
  c = c.replace(/import \{ auth \} from "@\/auth";\n/g, '');

  // Remove old next-auth v4 imports
  c = c.replace(/import \{ getServerSession \} from ['"]next-auth['"];\n/g, '');
  c = c.replace(/import \{ authOptions \} from ['"]@\/lib\/auth\/authOptions['"];\n/g, '');

  // Replace usage
  c = c.replace(/await getServerSession\(authOptions\)/g, 'await auth()');

  // Prepend new import once
  if (!c.includes('from "@/auth"') && !c.includes("from '@/auth'")) {
    c = 'import { auth } from "@/auth";\n' + c;
  } else if (!c.startsWith('import { auth }')) {
    // already somewhere in file from a client component (useSession) — skip prepend
  } else {
    c = 'import { auth } from "@/auth";\n' + c;
  }

  // Ensure single auth import at top
  const authImport = 'import { auth } from "@/auth";\n';
  c = c.replace(new RegExp('import \\{ auth \\} from "@/auth";\\n', 'g'), '');
  c = authImport + c;

  if (hasCRLF) c = c.replace(/\n/g, '\r\n');
  fs.writeFileSync(fp, c, 'utf8');
  console.log('OK:', f);
}
