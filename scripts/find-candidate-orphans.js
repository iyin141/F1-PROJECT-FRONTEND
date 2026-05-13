const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.next', 'dist'].includes(e.name)) continue;
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }
  return files;
}

function readFileSafe(p) {
  try {
    return fs.readFileSync(p, 'utf8');
  } catch (e) {
    return '';
  }
}

function normalizeSlashes(s) {
  return s.replace(/\\/g, '/');
}

const allFiles = walk(ROOT).filter(f => /\.(js|jsx|ts|tsx)$/.test(f));
const sources = {};
for (const f of allFiles) {
  const rel = path.relative(ROOT, f);
  sources[rel] = readFileSafe(f);
}

const candidateDirs = ['components', 'Lib/server-data', 'features'];
const candidates = [];

for (const rel of Object.keys(sources)) {
  const lower = rel.toLowerCase();
  // Only look inside candidate directories
  if (!candidateDirs.some(d => lower.startsWith(d.toLowerCase() + '/'))) continue;

  // Skip Next app special files
  const base = path.basename(rel);
  if (/^page\.(tsx|ts)$/.test(base) || /^layout\.(tsx|ts)$/.test(base) || /^route\.(ts|js)$/.test(base) || /loading\.(tsx|ts)$/.test(base) || /^template\.(tsx|ts)$/.test(base) || /^head\.(tsx|ts)$/.test(base) || /^not-found\.(tsx|ts)$/.test(base)) continue;

  // Build search patterns
  const relNoExt = normalizeSlashes(rel.replace(/\.(ts|tsx|js|jsx)$/, ''));
  const relNoExtNoPrefix = relNoExt.replace(/^src\//, '');
  const basename = path.basename(relNoExt);

  // Search other files for imports/usages
  let found = false;
  for (const [otherRel, content] of Object.entries(sources)) {
    if (otherRel === rel) continue;
    if (!content) continue;
    const c = content;
    if (c.includes(relNoExt) || c.includes('/' + relNoExt) || c.includes(relNoExtNoPrefix) || c.includes(basename) || c.includes("@/" + relNoExtNoPrefix)) {
      found = true;
      break;
    }
  }

  if (!found) {
    candidates.push(rel);
  }
}

console.log(JSON.stringify({ candidates, count: candidates.length }, null, 2));
