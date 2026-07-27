import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const threshold = Number(process.env.STALE_DAYS ?? 90);
if (!Number.isFinite(threshold) || threshold < 1) {
  console.error('STALE_DAYS must be a positive number.');
  process.exit(1);
}

const dir = path.join(process.cwd(), 'src/data/assets');
const now = new Date();
const rows = [];
for (const name of (await readdir(dir)).filter((file) => file.endsWith('.json')).sort()) {
  const data = JSON.parse(await readFile(path.join(dir, name), 'utf8'));
  const checked = new Date(`${data.lastVerifiedAt}T00:00:00Z`);
  const ageDays = Math.floor((now.getTime() - checked.getTime()) / 86_400_000);
  if (ageDays > threshold) rows.push({ slug: name.replace(/\.json$/, ''), company: data.company, asset: data.asset, lastVerifiedAt: data.lastVerifiedAt, ageDays });
}

if (!rows.length) {
  console.log(`Staleness advisory: no records older than ${threshold} days.`);
} else {
  console.log(`Staleness advisory: ${rows.length} record(s) older than ${threshold} days:`);
  for (const row of rows.sort((a, b) => b.ageDays - a.ageDays)) {
    console.log(`- ${row.slug}: ${row.company} / ${row.asset} — ${row.lastVerifiedAt} (${row.ageDays} days)`);
  }
}
