import { mkdir, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = resolve(root, 'build/releases');
const destination = resolve(outputDir, 'Corrector-Catala-1.0.0-source.zip');
const sourceEntries = [
  'README.md',
  'index.html',
  'build/extension/manifest.json',
  'build/extension/_locales',
  'build/extension/README.md',
  'build/extension/package.json',
  'build/extension/config',
  'build/extension/PRIVACY.md',
  'build/extension/SOURCE-CONTENTS.md',
  'build/extension/licenses',
  'build/extension/src',
  'build/extension/build/resources',
  'build/extension/build/engine-build.json',
  'engine-src',
  'references/upstream.lock.json',
  'references/languagetool-ca-central',
  'references/languagetool-audit',
  'references/softcatala-dict-tools/LICENSE',
  'references/softcatala-dict-tools/README.md',
  'references/softcatala-dict-tools/resultats/lt/diccionari.txt',
  'references/softcatala-audit/LICENSE',
  'references/softcatala-audit/build-morfologik-lt.sh',
  'references/softcatala-audit/morfologik-lt',
  'references/softcatala-audit/resultats/java-lt/LICENSE',
  'references/softcatala-audit/resultats/java-lt/pom.xml',
  'references/softcatala-audit/resultats/java-lt/README.md',
  'analysis/reference-oracle/artifacts/catalan-pos-dict-3.3/catalan-pos-dict-3.3.jar',
  'analysis/reference-oracle/artifacts/catalan-pos-dict-3.3/catalan-pos-dict-3.3.pom',
  'analysis/reference-oracle/artifacts/catalan-pos-dict-3.3/entries.json',
  'analysis/reference-oracle/artifacts/catalan-pos-dict-3.3/extracted/org/languagetool/resource/ca/ca-ES_spelling.info',
  'analysis/reference-oracle/artifacts/catalan-pos-dict-3.3/extracted/org/languagetool/resource/ca/ca-ES_spelling_multitoken.dict',
  'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/spanish-pos-dict-2.5.jar',
  'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/spanish-pos-dict-2.5.pom',
  'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/LGPL-2.1.txt',
  'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/source.json',
  'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/es-ES-graph.bin',
  'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/es-ES-graph-metadata.json',
  'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/es-ES-synth-graph.bin',
  'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/es-ES-synth-graph-metadata.json',
  'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/extracted/org/languagetool/resource/es/es-ES.dict',
  'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/extracted/org/languagetool/resource/es/es-ES.info',
  'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/extracted/org/languagetool/resource/es/es-ES_tags.txt',
  'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/extracted/org/languagetool/resource/es/es-ES_synth.dict',
  'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/extracted/org/languagetool/resource/es/es-ES_synth.info',
  'analysis/reference-oracle/artifacts/english-pos-dict-0.6',
  'analysis/reference-oracle/artifacts/opennlp-tokenize-models-1.5.jar',
  'analysis/reference-oracle/artifacts/opennlp-tokenize-models-1.5.pom',
  'analysis/reference-oracle/artifacts/opennlp-postag-models-1.5.jar',
  'analysis/reference-oracle/artifacts/opennlp-postag-models-1.5.pom',
  'analysis/reference-oracle/artifacts/opennlp-chunk-models-1.5.jar',
  'analysis/reference-oracle/artifacts/opennlp-chunk-models-1.5.pom',
  'analysis/reference-oracle/artifacts/opennlp-tools-1.9.5.jar',
  'analysis/reference-oracle/artifacts/opennlp-tools-1.9.5.pom',
  'analysis/reference-oracle/outputs/ca-disambiguation-inventory.json',
  'analysis/reference-oracle/outputs/ca-pattern-rule-candidates.json',
  'analysis/reference-oracle/outputs/ca-pattern-rules-valencia.json.gz',
  'analysis/reference-oracle/outputs/ca-pattern-rules-balear.json.gz',
  'analysis/reference-oracle/corpus/en-US-phase5-independent-prose.txt',
  'analysis/reference-oracle/compare-en-US-phase5-independent-prose.mjs',
  'analysis/reference-oracle/benchmark-en-US-phase5.mjs',
  'analysis/reference-oracle/outputs/en-US-phase5-independent-prose-oracle-default.json',
  'analysis/reference-oracle/outputs/en-US-phase5-independent-prose-oracle-picky.json',
  'analysis/reference-oracle/outputs/en-US-phase5-independent-prose-comparison.json',
  'analysis/reference-oracle/outputs/en-US-phase5-performance.json',
  'analysis/reference-oracle/outputs/en-US-integrated-examples-index.json',
  'analysis/reference-oracle/outputs/en-US-integrated-examples-oracle-default.json',
  'analysis/reference-oracle/outputs/en-US-integrated-examples-oracle-picky.json',
  'analysis/reference-oracle/outputs/en-US-integrated-examples-default-local.json',
  'analysis/reference-oracle/outputs/en-US-integrated-examples-picky-local.json',
  'analysis/reference-oracle/select-dialect-profile-overrides.mjs',
  'analysis/reference-oracle/src/Speller.java',
  'analysis/reference-oracle/src/HMatrix.java',
];
const selectedLanguageToolSources = [
  ['analysis/reference-oracle/languagetool/languagetool-master/COPYING.txt', 'references/languagetool-es-ES/COPYING.txt'],
  ['analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/es/pom.xml', 'references/languagetool-es-ES/languagetool-language-modules/es/pom.xml'],
  ['analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/es/src/main', 'references/languagetool-es-ES/languagetool-language-modules/es/src/main'],
  ['analysis/reference-oracle/languagetool/languagetool-master/languagetool-core/src/main/resources/org/languagetool/resource/segment.srx', 'references/languagetool-es-ES/languagetool-core/src/main/resources/org/languagetool/resource/segment.srx'],
  ['analysis/reference-oracle/languagetool/languagetool-master/COPYING.txt', 'references/languagetool-en-US/COPYING.txt'],
  ['analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/en/pom.xml', 'references/languagetool-en-US/languagetool-language-modules/en/pom.xml'],
  ['analysis/reference-oracle/languagetool/languagetool-master/languagetool-language-modules/en/src/main', 'references/languagetool-en-US/languagetool-language-modules/en/src/main'],
];

function inside(parent, child) {
  const rel = relative(parent, child);
  return rel === '' || (!rel.startsWith(`..${sep}`) && rel !== '..' && !resolve(rel).startsWith(sep));
}

if (!inside(root, outputDir) || !inside(outputDir, destination)) {
  throw new Error('Resolved source-package paths escape the project release folder.');
}
await mkdir(outputDir, { recursive: true });

const powershell = String.raw`
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$root = '${root.replaceAll("'", "''")}'
$destination = '${destination.replaceAll("'", "''")}'
$entries = @(${sourceEntries.map((item) => `'${item.replaceAll("'", "''")}'`).join(', ')})
$selectedLanguageToolSources = @(${selectedLanguageToolSources.map(([source, entry]) => `@{ Source = '${source.replaceAll("'", "''")}'; Entry = '${entry.replaceAll("'", "''")}' }`).join(', ')})
if (Test-Path -LiteralPath $destination) { Remove-Item -LiteralPath $destination -Force }
$archive = [System.IO.Compression.ZipFile]::Open($destination, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($relative in $entries) {
    $path = Join-Path $root $relative
    if (-not (Test-Path -LiteralPath $path)) { throw "Source input missing: $relative" }
    if (Test-Path -LiteralPath $path -PathType Container) {
      $files = Get-ChildItem -LiteralPath $path -File -Recurse | Where-Object {
        ($_.FullName -notmatch '[\\/](target|node_modules|\.git|\.codex)[\\/]') -and
        -not ($_.DirectoryName -eq (Join-Path $root 'build/extension') -and $_.Name -match '^CHANGELOG-9\.6\.')
      }
    } else { $files = @(Get-Item -LiteralPath $path) }
    foreach ($file in $files) {
      $entryName = $file.FullName.Substring($root.Length + 1).Replace('\', '/')
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  }
  foreach ($mapping in $selectedLanguageToolSources) {
    $path = Join-Path $root $mapping.Source
    if (-not (Test-Path -LiteralPath $path)) { throw "Selected LanguageTool source missing: $($mapping.Source)" }
    if (Test-Path -LiteralPath $path -PathType Container) {
      $files = Get-ChildItem -LiteralPath $path -File -Recurse | Where-Object { $_.FullName -notmatch '[\\/](target|node_modules|\.git|\.codex)[\\/]' }
      foreach ($file in $files) {
        $childPath = $file.FullName.Substring($path.Length + 1).Replace('\', '/')
        $entryName = $mapping.Entry.TrimEnd('/') + '/' + $childPath
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
      }
    } else {
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $path, $mapping.Entry, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  }
} finally { $archive.Dispose() }
$archive = [System.IO.Compression.ZipFile]::OpenRead($destination)
try {
  $names = @($archive.Entries | ForEach-Object { $_.FullName.Replace('\', '/') })
  $duplicates = @($names | Group-Object | Where-Object { $_.Count -gt 1 })
  if ($duplicates.Count -gt 0) { throw "Duplicate source ZIP entries found: $($duplicates.Name -join ', ')" }
  foreach ($required in @('build/extension/manifest.json', 'build/extension/_locales/ca/messages.json', 'build/extension/_locales/es/messages.json', 'build/extension/_locales/en/messages.json', 'build/extension/PRIVACY.md', 'build/extension/SOURCE-CONTENTS.md', 'build/extension/licenses/THIRD_PARTY_NOTICES.md', 'build/extension/licenses/morfologik/COPYING.txt', 'build/extension/src/language-engine.js', 'build/extension/src/ui-localization.js', 'build/extension/src/es-explanation-translations.js', 'build/extension/src/lt-pattern-runtime.js', 'build/extension/build/resources/ca-dialect-profile-overrides.json', 'build/extension/build/resources/central/ca-central.bin.gz', 'engine-src/build.mjs', 'engine-src/package-extension.mjs', 'engine-src/modules/ca-morfologik-speller.js', 'engine-src/resources/ca-dialect-profile-overrides.json', 'engine-src/resources/central/manifest.json', 'references/languagetool-ca-central/src/main/resources/org/languagetool/rules/ca/grammar.xml', 'references/languagetool-audit/languagetool-core/src/main/resources/org/languagetool/resource/spelling_global.txt', 'references/softcatala-dict-tools/LICENSE', 'references/softcatala-dict-tools/resultats/lt/diccionari.txt', 'analysis/reference-oracle/artifacts/catalan-pos-dict-3.3/catalan-pos-dict-3.3.jar', 'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/spanish-pos-dict-2.5.jar', 'analysis/reference-oracle/artifacts/spanish-pos-dict-2.5/LGPL-2.1.txt', 'analysis/reference-oracle/artifacts/english-pos-dict-0.6/org/languagetool/resource/en/english.dict', 'references/languagetool-es-ES/languagetool-language-modules/es/src/main/resources/org/languagetool/resource/es/disambiguation.xml', 'analysis/reference-oracle/outputs/ca-disambiguation-inventory.json', 'analysis/reference-oracle/outputs/ca-pattern-rule-candidates.json', 'analysis/reference-oracle/outputs/ca-pattern-rules-valencia.json.gz', 'analysis/reference-oracle/outputs/ca-pattern-rules-balear.json.gz', 'analysis/reference-oracle/select-dialect-profile-overrides.mjs', 'analysis/reference-oracle/src/Speller.java', 'analysis/reference-oracle/src/HMatrix.java')) {
    if ($names -notcontains $required) { throw "Required source entry missing: $required" }
  }
  foreach ($required in @('build/extension/licenses/opennlp/Apache-2.0.txt', 'build/extension/licenses/opennlp/NOTICE.txt', 'build/extension/licenses/languagetool-runtime/english-pos-readme.txt', 'build/extension/build/resources/en-US/manifest.json', 'engine-src/resources/en-US/manifest.json', 'analysis/reference-oracle/corpus/en-US-phase5-independent-prose.txt', 'analysis/reference-oracle/compare-en-US-phase5-independent-prose.mjs', 'analysis/reference-oracle/outputs/en-US-phase5-independent-prose-comparison.json', 'analysis/reference-oracle/outputs/en-US-phase5-performance.json', 'analysis/reference-oracle/artifacts/english-pos-dict-0.6/english-pos-dict-0.6.jar', 'analysis/reference-oracle/artifacts/english-pos-dict-0.6/english-pos-dict-0.6.pom', 'analysis/reference-oracle/artifacts/opennlp-tokenize-models-1.5.jar', 'analysis/reference-oracle/artifacts/opennlp-tokenize-models-1.5.pom', 'analysis/reference-oracle/artifacts/opennlp-postag-models-1.5.jar', 'analysis/reference-oracle/artifacts/opennlp-postag-models-1.5.pom', 'analysis/reference-oracle/artifacts/opennlp-chunk-models-1.5.jar', 'analysis/reference-oracle/artifacts/opennlp-chunk-models-1.5.pom', 'analysis/reference-oracle/artifacts/opennlp-tools-1.9.5.jar', 'analysis/reference-oracle/artifacts/opennlp-tools-1.9.5.pom', 'references/languagetool-en-US/COPYING.txt', 'references/languagetool-en-US/languagetool-language-modules/en/pom.xml', 'references/languagetool-en-US/languagetool-language-modules/en/src/main/resources/org/languagetool/rules/en/en-US/grammar.xml', 'references/languagetool-en-US/languagetool-language-modules/en/src/main/resources/org/languagetool/resource/en/pos-readme.txt')) {
    if ($names -notcontains $required) { throw "Required English source entry missing: $required" }
  }
  if ($names | Where-Object { $_ -match '(^|/)analysis/extension-9\.6\.93/' -or $_ -match 'analysis/reference-oracle/languagetool/languagetool-master/' -or $_ -match '^build/extension/CHANGELOG-9\.6\.' }) { throw 'Historical product baseline, full multi-language snapshot, or release changelog must not be part of the 1.0.0 source package.' }
} finally { $archive.Dispose() }
Write-Output "Created and inspected focused source supplement $destination"
`;

const scriptPath = resolve(outputDir, '.package-source-1.0.0.ps1');
await writeFile(scriptPath, powershell, 'utf8');
try {
  execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', scriptPath], { stdio: 'inherit' });
} finally {
  await rm(scriptPath, { force: true });
}
const info = await stat(destination);
console.log(`Version 1.0.0 source supplement; ${Math.round(info.size / 1024 / 1024)} MiB; unrelated LanguageTool languages and historical extension baseline excluded.`);
