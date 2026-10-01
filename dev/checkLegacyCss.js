/* eslint-disable no-console */
// Scans built CSS for constructs that Safari/iOS 15 (iPhone 6s/7) silently drops.
// Usage: node dev/checkLegacyCss.js [distDir]
import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const dir = join(process.argv[2] || 'dist', 'assets');
const CHECKS = [
  ['media range syntax (Safari 16.4+)', /@media[^{]*\((?:width|height)\s*[<>]=?/g],
  ['CSS nesting (Safari 16.5+)', /[{;]\s*&/g],
  ['@container (Safari 16+)', /@container\b/g],
  ['overflow:clip without hidden fallback (Safari 16+)', /(?<!overflow(?:-[xy])?:hidden;)overflow(?:-[xy])?:clip/g],
];

let failed = 0;
readdirSync(dir).filter((f) => f.endsWith('.css')).forEach((file) => {
  const css = readFileSync(join(dir, file), 'utf8');
  CHECKS.forEach(([name, re]) => {
    const count = (css.match(re) || []).length;
    if (count) {
      failed += count;
      console.error(`${file}: ${name} x${count}`);
    }
  });
});

console.log(failed ? `FAIL: ${failed} legacy-incompatible constructs` : 'OK: no Safari 15 blockers found');
process.exit(failed ? 1 : 0);
