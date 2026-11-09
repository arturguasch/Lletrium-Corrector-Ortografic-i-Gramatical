import { mkdir, stat, writeFile, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = resolve(root, 'build/releases');
const destination = resolve(outputDir, 'Source.zip');
const sourceEntries = [
  'README.md', 'index.html', 'LICENSE', 'LICENSING.md', 'THIRD_PARTY_NOTICES.md',
  'build/extension/manifest.json', 'build/extension/_locales', 'build/extension/README.md',
  'build/extension/PRIVACY.md',
  'build/extension/SOURCE-CONTENTS.md', 'build/extension/licenses', 'build/extension/src',
  'build/extension/build/resources', 'build/extension/build/engine-build.json',
  'engine-src', 'references/upstream.lock.json', 'references/README.md',
  'references/languagetool-fr', 'references/languagetool-ca-central',
  'references/languagetool-audit', 'references/languagetool-en-US',
  'references/languagetool-es-ES', 'references/softcatala-dict-tools/LICENSE',
  'references/softcatala-dict-tools/README.md',
  'references/softcatala-dict-tools/resultats/lt/diccionari.txt',
  'references/softcatala-audit/LICENSE', 'references/softcatala-audit/build-morfologik-lt.sh',
  'references/softcatala-audit/morfologik-lt', 'references/softcatala-audit/resultats/java-lt/LICENSE',
  'references/softcatala-audit/resultats/java-lt/pom.xml',
  'references/softcatala-audit/resultats/java-lt/README.md'
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
if (Test-Path -LiteralPath $destination) { Remove-Item -LiteralPath $destination -Force }
$archive = [System.IO.Compression.ZipFile]::Open($destination, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($relative in $entries) {
    $path = Join-Path $root $relative
    if (-not (Test-Path -LiteralPath $path)) { throw "Source input missing: $relative" }
    if (Test-Path -LiteralPath $path -PathType Container) {
      $files = Get-ChildItem -LiteralPath $path -File -Recurse | Where-Object {
        ($_.FullName -notmatch '[\\/](target|node_modules|\.git|\.codex|analysis)[\\/]') -and
        -not ($_.DirectoryName -eq (Join-Path $root 'build/extension') -and $_.Name -match '^CHANGELOG-9\.6\.') -and
        -not ($_.FullName.EndsWith('\build\extension\build\resources\central\ca-central.bin.gz')) -and
        -not ($_.FullName.EndsWith('\build\extension\build\resources\synthesis\ca-synthesis.bin.gz')) -and
        -not ($_.FullName.EndsWith('\build\extension\build\resources\es-ES\es-ES-synthesis-fsa.bin.gz'))
      }
    } else { $files = @(Get-Item -LiteralPath $path) }
    foreach ($file in $files) {
      $entryName = $file.FullName.Substring($root.Length + 1).Replace('\', '/')
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  }
} finally { $archive.Dispose() }
$archive = [System.IO.Compression.ZipFile]::OpenRead($destination)
try {
  $names = @($archive.Entries | ForEach-Object { $_.FullName.Replace('\', '/') })
  $duplicates = @($names | Group-Object | Where-Object { $_.Count -gt 1 })
  if ($duplicates.Count -gt 0) { throw "Duplicate source ZIP entries found: $($duplicates.Name -join ', ')" }
  foreach ($required in @(
    'build/extension/manifest.json', 'build/extension/SOURCE-CONTENTS.md',
    'build/extension/src/language-engine.js', 'engine-src/build.mjs',
    'engine-src/tools/build-english-srx.mjs', 'engine-src/build-inputs/reference-oracle/outputs/ca-disambiguation-inventory.json',
    'engine-src/build-inputs/reference-oracle/outputs/ca-pattern-rule-candidates.json',
    'engine-src/build-inputs/reference-oracle/outputs/spanish-pattern-rule-candidates.json',
    'engine-src/build-inputs/reference-oracle/outputs/spanish-repeated-pattern-inventory.json.gz',
    'engine-src/build-inputs/reference-oracle/outputs/en-US-disambiguation.json',
    'engine-src/build-inputs/reference-oracle/outputs/en-US-pattern-rules.json.gz',
    'engine-src/build-inputs/reference-oracle/outputs/en-US-pattern-rule-candidates.json',
    'engine-src/build-inputs/reference-oracle/outputs/en-US-repeated-pattern-rules.json',
    'engine-src/build-inputs/reference-oracle/outputs/en-US-regex-rules.json',
    'engine-src/modules/french/french-pattern-pipeline.js',
    'engine-src/modules/french/french-lexical-runtime.js',
    'engine-src/resources/fr/fr-srx.json',
    'engine-src/resources/fr/french-pattern-rule-candidates.json',
    'references/languagetool-fr/SOURCE-MANIFEST.json',
    'references/languagetool-en-US/languagetool-language-modules/en/src/main/resources/org/languagetool/rules/en/en-US/grammar.xml',
    'references/languagetool-es-ES/languagetool-language-modules/es/src/main/resources/org/languagetool/resource/es/disambiguation.xml',
    'references/languagetool-audit/languagetool-core/src/main/resources/org/languagetool/resource/segment.srx'
  )) {
  if ($names -notcontains $required) { throw "Required source entry missing: $required" }
  }
  if ($names | Where-Object { $_ -match '(^|/)analysis/' }) { throw 'Development analysis material must not be part of the Source ZIP.' }
} finally { $archive.Dispose() }
Write-Output "Created and inspected self-contained Source package $destination"
`;

const scriptPath = resolve(outputDir, '.package-source.ps1');
await writeFile(scriptPath, powershell, 'utf8');
try {
  execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', scriptPath], { stdio: 'inherit' });
} finally {
  await rm(scriptPath, { force: true });
}
const info = await stat(destination);
console.log(`Source package; ${Math.round(info.size / 1024 / 1024)} MiB; French reference and engine build inputs included, development analysis omitted.`);
