import { access, mkdir, readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'build/extension');
const outputDir = resolve(root, 'build/releases');
const destination = resolve(outputDir, 'Instalable.zip');
const archiveFolder = 'Lletrium-Corrector-Ortografic-i-Gramatical-Chrome-extension';
const requiredFiles = [
  'manifest.json',
  '_locales',
  'README.md',
  'PRIVACY.md',
  'licenses',
  'src',
  'build/resources',
  'build/engine-build.json',
];

function inside(parent, child) {
  const rel = relative(parent, child);
  return rel === '' || (!rel.startsWith(`..${sep}`) && rel !== '..' && !resolve(rel).startsWith(sep));
}

if (!inside(root, source) || !inside(root, outputDir) || !inside(outputDir, destination)) {
  throw new Error('Resolved package paths escape the project release folders.');
}

const manifest = JSON.parse(await readFile(join(source, 'manifest.json'), 'utf8'));
const version = manifest.version;
if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error(`Invalid extension release version: ${version}`);
const packDescriptorText = await readFile(join(source, 'src/language-pack-descriptors.generated.js'), 'utf8');
const packDescriptorMatch = packDescriptorText.match(/Object\.freeze\((\[.*\])\.map\(item/s);
if (!packDescriptorMatch) throw new Error('Could not parse the generated GitHub pack descriptors.');
const packDescriptors = JSON.parse(packDescriptorMatch[1]);
const packedResourcePaths = [...new Set(packDescriptors.flatMap(pack => pack.files || []))];
const italianPack = packDescriptors.find(pack => pack.id === 'it');
const germanPack = packDescriptors.find(pack => pack.id === 'de');
const italianSourceArchive = await readFile(join(source, 'licenses/italian-data/source/italian-writing-aids-3.3.1.oxt'));
if (createHash('sha256').update(italianSourceArchive).digest('hex') !== '967280d6fc4f574f7a8a8fc0b31e2e69f68c1d53c625c80e99115993bb5cfdff') {
  throw new Error('The Italian Writing Aids source archive is missing or does not match the verified 3.3.1 OXT.');
}
if (version !== '1.0.2' || italianPack?.version !== '1.0.2'
    || italianPack.path !== 'packs/it/1.0.2/it-IT.pack'
    || germanPack?.version !== '1.0.2'
    || germanPack.path !== 'packs/de/1.0.2/de.pack'
    || JSON.stringify(germanPack.profiles) !== JSON.stringify(['de-DE', 'de-AT', 'de-CH'])) {
  throw new Error('Installable release must pin the Italian and German 1.0.2 GitHub packs and all three German profiles.');
}
const externalManager = await readFile(join(source, 'src/language-pack-external.js'), 'utf8');
if (!externalManager.includes('https://raw.githubusercontent.com/arturguasch/Lletrium-Corrector-Ortografic-i-Gramatical/language-packs/')) {
  throw new Error('Installable language packs must resolve from the GitHub language-packs branch.');
}

for (const path of requiredFiles) await access(join(source, path));
const runtimePaths = [
  manifest.background?.service_worker,
  manifest.action?.default_popup,
  manifest.options_page,
  ...(manifest.icons ? Object.values(manifest.icons) : []),
  ...(manifest.content_scripts ?? []).flatMap((script) => [...(script.js ?? []), ...(script.css ?? [])]),
];
for (const path of runtimePaths) {
  if (!path) continue;
  await access(join(source, path));
}

await mkdir(outputDir, { recursive: true });
const powershell = String.raw`
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression
$source = '${source.replaceAll("'", "''")}'
$destination = '${destination.replaceAll("'", "''")}'
$archiveFolder = '${archiveFolder}'
$packedResourcePaths = @(${packedResourcePaths.map(path => `'${path.replaceAll("'", "''")}'`).join(', ')})
$legacyExternalResources = @('build/resources/central/ca-central.bin.gz', 'build/resources/central/resource-index.json', 'build/resources/synthesis/ca-synthesis.bin.gz', 'build/resources/es-ES/es-ES-synthesis-fsa.bin.gz', 'build/resources/fr/french-pattern-rule-candidates.json', 'build/resources/fr/README.md')
$entries = @('manifest.json', '_locales', 'README.md', 'PRIVACY.md', 'licenses', 'src', 'build/resources', 'build/engine-build.json')
if (Test-Path -LiteralPath $destination) { Remove-Item -LiteralPath $destination -Force }
$archive = [System.IO.Compression.ZipFile]::Open($destination, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  $archive.CreateEntry("$archiveFolder/") | Out-Null
  foreach ($relative in $entries) {
    $path = Join-Path $source $relative
    if (Test-Path -LiteralPath $path -PathType Container) {
      $files = Get-ChildItem -LiteralPath $path -File -Recurse
      if ($relative -eq 'src') {
        $excludedDictionaries = (Join-Path $source 'src/dictionaries').TrimEnd('\') + '\'
        $keptDictionaryRoots = @('src/dictionaries/french/', 'src/dictionaries/german/')
        $files = @($files | Where-Object {
          $relativePath = $_.FullName.Substring($source.Length + 1).Replace('\', '/')
          -not $relativePath.StartsWith('src/dictionaries/', [System.StringComparison]::OrdinalIgnoreCase) -or
            ($keptDictionaryRoots | Where-Object { $relativePath.StartsWith($_, [System.StringComparison]::OrdinalIgnoreCase) }).Count -gt 0
        })
      }
      if ($relative -eq 'build/resources') {
        $files = @($files | Where-Object {
          $resourcePath = $_.FullName.Substring($source.Length + 1).Replace('\', '/')
          $resourcePath -notin $packedResourcePaths -and $resourcePath -notin $legacyExternalResources
        })
      }
    } else {
      $files = @(Get-Item -LiteralPath $path)
    }
    foreach ($file in $files) {
      $entryName = "$archiveFolder/" + $file.FullName.Substring($source.Length + 1).Replace('\', '/')
      if ($entryName -eq "$archiveFolder/manifest.json") {
        $manifestObject = Get-Content -LiteralPath $file.FullName -Raw | ConvertFrom-Json
        $manifestObject.PSObject.Properties.Remove('key') | Out-Null
        $manifestTemp = Join-Path $env:TEMP ([guid]::NewGuid().ToString() + '.json')
        try {
          [System.IO.File]::WriteAllText($manifestTemp, ($manifestObject | ConvertTo-Json -Depth 100), [System.Text.UTF8Encoding]::new($false))
          [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $manifestTemp, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        } finally { Remove-Item -LiteralPath $manifestTemp -Force -ErrorAction SilentlyContinue }
        continue
      }
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $file.FullName, $entryName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
    }
  }
} finally { $archive.Dispose() }
$archive = [System.IO.Compression.ZipFile]::OpenRead($destination)
try {
  $names = @($archive.Entries | Where-Object { -not $_.FullName.EndsWith('/') } | ForEach-Object { $_.FullName.Replace('\', '/') })
  $archivePrefix = "$archiveFolder/"
  $extensionNames = @($names | Where-Object { $_.StartsWith($archivePrefix, [System.StringComparison]::Ordinal) } | ForEach-Object { $_.Substring($archivePrefix.Length) })
  if ($extensionNames -notcontains 'manifest.json') { throw 'ZIP has no manifest.json inside the named extension folder' }
  if ($extensionNames.Count -ne $names.Count) { throw 'Installable ZIP contains files outside its named extension folder' }
  $nestedManifests = @($extensionNames | Where-Object { $_ -match '(^|/)manifest\.json$' -and $_ -ne 'manifest.json' })
  if ($nestedManifests.Count -gt 0) { throw "Chrome Web Store rejects extra manifest.json files: $($nestedManifests -join ', ')" }
  if ($extensionNames | Where-Object { $_.StartsWith('src/dictionaries/', [System.StringComparison]::OrdinalIgnoreCase) -and -not ($_.StartsWith('src/dictionaries/french/', [System.StringComparison]::OrdinalIgnoreCase) -or $_.StartsWith('src/dictionaries/german/', [System.StringComparison]::OrdinalIgnoreCase)) }) { throw 'Unused legacy dictionaries found in release ZIP' }
  foreach ($required in @('src/background.js', 'src/popup.html', 'src/popup.js', 'src/ui-localization.js', 'src/italian-pattern-pipeline.js', 'src/german-pattern-pipeline.js', 'src/german-direct-rules.js', 'src/german-pattern-filters.js', 'src/dictionaries/french/french-pattern-rule-candidates.json', 'src/dictionaries/german/german-pattern-rule-candidates.json.gz', 'src/dictionaries/german/german-direct-rule-data.json.gz', 'src/dictionaries/german/german-disambiguation-rules.json.gz', 'src/dictionaries/german/german-regex-rules.json.gz', 'src/dictionaries/german/german-srx.json', 'src/language-pack-descriptors.generated.js', 'src/en-explanation-translations.js', 'src/en-explanation-translations-extra.js', 'src/es-explanation-translations.js', '_locales/ca/messages.json', '_locales/es/messages.json', '_locales/en/messages.json', 'build/resources/ca-filter-data.json', 'build/resources/central-cfsa2/ca-synthesis-overlays.json.gz', 'build/resources/central-cfsa2/resource-index.json', 'build/resources/en-US/resource-index.json', 'build/resources/es-ES/resource-index.json', 'build/resources/synthesis/resource-index.json', 'build/engine-build.json')) {
    $required = $required.Trim()
    if ($extensionNames -notcontains $required) { throw "Required runtime entry missing from release ZIP: $required" }
  }
  foreach ($externalResource in $packedResourcePaths) {
    if ($extensionNames -contains $externalResource) { throw "GitHub language-pack resource was duplicated in the installable ZIP: $externalResource" }
  }
  foreach ($legacyResource in $legacyExternalResources) {
    if ($extensionNames -contains $legacyResource) { throw "Legacy local language resource was included in the installable ZIP: $legacyResource" }
  }
  foreach ($required in @('PRIVACY.md', 'licenses/THIRD_PARTY_NOTICES.md', 'licenses/lletrium/GPL-3.0-or-later.txt', 'licenses/morfologik/COPYING.txt', 'licenses/languagetool-runtime/COPYING.txt', 'licenses/languagetool-runtime/english-pos-readme.txt', 'licenses/opennlp/Apache-2.0.txt', 'licenses/opennlp/NOTICE.txt', 'licenses/italian-data/README.md', 'licenses/italian-data/GPL-3.0-or-later.txt', 'licenses/italian-data/LGPL-2.1.txt', 'licenses/italian-data/source/italian-writing-aids-3.3.1.oxt', 'licenses/german-data/README.md', 'licenses/german-data/german-source-provenance.json', 'licenses/german-data/apache/Apache-License.txt', 'licenses/german-data/hunspell/COPYING_GPLv2.txt', 'licenses/german-data/hunspell/COPYING_GPLv3.txt', 'licenses/german-data/languagetool/COPYING.txt')) {
    $required = $required.Trim()
    if ($extensionNames -notcontains $required) { throw "Required legal notice missing from release ZIP: $required" }
  }
  $stream = $archive.GetEntry("$archiveFolder/manifest.json").Open()
  try {
    $reader = [System.IO.StreamReader]::new($stream)
    try { $manifest = $reader.ReadToEnd() | ConvertFrom-Json } finally { $reader.Dispose() }
  } finally { $stream.Dispose() }
  if ($manifest.PSObject.Properties.Name -contains 'key') { throw 'Chrome Web Store upload package must not contain manifest key.' }
  if ($manifest.version -ne '${version}') { throw "ZIP manifest version is $($manifest.version), expected ${version}" }
  $descriptorEntry = $archive.GetEntry("$archiveFolder/src/language-pack-descriptors.generated.js")
  $descriptorStream = $descriptorEntry.Open()
  try { $descriptorText = [System.IO.StreamReader]::new($descriptorStream).ReadToEnd() } finally { $descriptorStream.Dispose() }
  if ($descriptorText -notmatch '"id":"it"[^\}]*"path":"packs/it/1\.0\.2/it-IT\.pack"' -or $descriptorText -notmatch '"id":"de"[^\}]*"path":"packs/de/1\.0\.2/de\.pack"' -or $descriptorText -notmatch '"profiles":\["de-DE","de-AT","de-CH"\]') { throw 'ZIP descriptors do not pin the Italian and German 1.0.2 packs and the three German profiles.' }
  if ($manifest.web_accessible_resources.resources | Where-Object { $_ -like 'src/dictionaries/*' }) { throw 'Manifest still exposes excluded legacy Catalan dictionaries' }
  $forbidden = @('tests/', 'reports/', 'scripts/', 'AGENTS.md', 'WORKSPACE.md', 'package.json')
  foreach ($prefix in $forbidden) {
    if ($extensionNames | Where-Object { $_ -eq $prefix -or $_.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase) }) {
      throw "Development-only content found in release ZIP: $prefix"
    }
  }
  if ($extensionNames | Where-Object { $_ -match '(^|/)CHANGELOG-9\\.6\\.' }) { throw 'Historical 9.6 changelog found in release ZIP' }
} finally { $archive.Dispose() }
Write-Output "Created and inspected $destination"
`;

const encoded = Buffer.from(powershell, 'utf16le').toString('base64');
execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], { stdio: 'inherit' });
const info = await stat(destination);
console.log(`Version ${version}; ${Math.round(info.size / 1024 / 1024)} MiB; source tree left untouched.`);
