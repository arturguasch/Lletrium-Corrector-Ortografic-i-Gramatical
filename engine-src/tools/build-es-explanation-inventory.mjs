/* SPDX-FileCopyrightText: 2026 Artur Guasch
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const candidatePath = path.join(root, 'analysis/reference-oracle/outputs/spanish-pattern-rule-candidates.json');
const oracleDir = path.join(root, 'analysis/reference-oracle/outputs');
const outputPath = path.join(root, 'engine-src/resources/es-ES/es-explanation-inventory.json');

function decodeEntities(value) {
  return value
    .replaceAll('&amp;', '&').replaceAll('&lt;', '<').replaceAll('&gt;', '>')
    .replaceAll('&quot;', '"').replaceAll('&apos;', "'").replaceAll('&#39;', "'").replaceAll('&nbsp;', ' ');
}

function canonicalize(message) {
  let value = String(message || '').replace(/<suggestion>([\s\S]*?)<\/suggestion>/giu, (_tag, content) => {
    return `__SUGGESTION_${(canonicalize.suggestionIndex = (canonicalize.suggestionIndex || 0) + 1)}__`;
  });
  canonicalize.suggestionIndex = 0;
  value = decodeEntities(value.replace(/<[^>]*>/gu, ''));
  return value.replace(/\s+/gu, ' ').trim();
}

const entries = new Map();
function add(message, source, id = '') {
  if (typeof message !== 'string' || !message.trim()) return;
  const key = canonicalize(message);
  if (!key) return;
  const item = entries.get(key) || { source: key, sources: new Set(), ruleIds: new Set(), observedMessages: new Set() };
  item.sources.add(source);
  if (id) item.ruleIds.add(id);
  item.observedMessages.add(message);
  entries.set(key, item);
}

const candidates = JSON.parse(fs.readFileSync(candidatePath, 'utf8'));
for (const rule of candidates.rules || []) add(rule.message, 'pattern-rule-candidate', rule.fullId || rule.id);

function collect(value, file, seen) {
  if (!value || typeof value !== 'object' || seen.has(value)) return;
  seen.add(value);
  if (typeof value.message === 'string') add(value.message, path.basename(file), value.ruleId || value.baseRuleId || '');
  for (const child of Object.values(value)) collect(child, file, seen);
}

for (const name of fs.readdirSync(oracleDir).filter((entry) => /^spanish.*oracle.*\.json$/u.test(entry))) {
  const file = path.join(oracleDir, name);
  try { collect(JSON.parse(fs.readFileSync(file, 'utf8')), file, new WeakSet()); } catch { /* Ignore non-JSON or stale partial outputs. */ }
}

const output = {
  schemaVersion: 1,
  language: 'es-ES',
  sourceDescription: 'Unique visible Spanish issue-message templates from all 1,591 active PatternRule candidates plus retained Spanish oracle outputs; suggestion markup is represented by numbered placeholders.',
  counts: { templates: entries.size, patternRules: candidates.rules?.length || 0 },
  entries: [...entries.values()].map((item) => ({
    source: item.source,
    sources: [...item.sources].sort(),
    ruleIds: [...item.ruleIds].sort(),
    observedMessages: [...item.observedMessages].sort(),
    translations: { ca: '', en: '' }
  })).sort((a, b) => a.source.localeCompare(b.source, 'es'))
};

fs.writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${output.counts.templates} Spanish explanation templates from ${output.counts.patternRules} PatternRule candidates to ${path.relative(root, outputPath)}`);
