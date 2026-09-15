import fs from 'node:fs';

const jobs = [
  ['src/lib/data/costumes.ts', 'costume'],
  ['src/lib/data/jewelry.ts', 'jewelry'],
  ['src/lib/data/headwear.ts', 'headwear'],
  ['src/lib/data/makeup.ts', 'makeup'],
];

for (const [file, folder] of jobs) {
  let s = fs.readFileSync(file, 'utf8');
  s = s.replace(/id:\s*'([^']+)'([\s\S]*?)image:\s*'[^']+'/g, (m, id) =>
    m.replace(/image:\s*'[^']+'/, `image: '/${folder}/${id}.jpg'`),
  );
  fs.writeFileSync(file, s);
  console.log('updated', file);
}
