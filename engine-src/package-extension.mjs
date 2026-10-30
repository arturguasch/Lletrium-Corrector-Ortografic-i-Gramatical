import { access, mkdir, readFile, stat } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'build/extension');
const outputDir = resolve(root, 'build/releases');
const version = '1.0.0';
const destination = resolve(outputDir, `Corrector-Catala-${version}.zip`);
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
const packageMetadata = JSON.parse(await readFile(join(source, 'package.json'), 'utf8'));
if (manifest.version !== version || packageMetadata.version !== version) {
  throw new Error(`Release versions must both be ${version}; manifest=${manifest.version}, package=${packageMetadata.version}`);
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
$entries = @('manifest.json', '_locales', 'README.md', 'PRIVACY.md', 'licenses', 'src', 'build/resources', 'build/engine-build.json')
if (Test-Path -LiteralPath $destination) { Remove-Item -LiteralPath $destination -Force }
$archive = [System.IO.Compression.ZipFile]::Open($destination, [System.IO.Compression.ZipArchiveMode]::Create)
try {
  foreach ($relative in $entries) {
    $path = Join-Path $source $relative
    if (Test-Path -LiteralPath $path -PathType Container) {
      $files = Get-ChildItem -LiteralPath $path -File -Recurse
      if ($relative -eq 'src') {
        $excludedDictionaries = (Join-Path $source 'src/dictionaries').TrimEnd('\') + '\'
        $files = @($files | Where-Object { -not $_.FullName.StartsWith($excludedDictionaries, [System.StringComparison]::OrdinalIgnoreCase) })
      }
    } else {
      $files = @(Get-Item -LiteralPath $path)
    }
    foreach ($file in $files) {
      $entryName = $file.FullName.Substring($source.Length + 1).Replace('\', '/')
      if ($entryName -eq 'manifest.json') {
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
  $names = @($archive.Entries | ForEach-Object { $_.FullName.Replace('\', '/') })
  if ($names -notcontains 'manifest.json') { throw 'ZIP has no root manifest.json' }
  $nestedManifests = @($names | Where-Object { $_ -match '(^|/)manifest\.json$' -and $_ -ne 'manifest.json' })
  if ($nestedManifests.Count -gt 0) { throw "Chrome Web Store rejects extra manifest.json files: $($nestedManifests -join ', ')" }
  if ($names | Where-Object { $_.StartsWith('src/dictionaries/', [System.StringComparison]::OrdinalIgnoreCase) }) { throw 'Unused legacy Catalan dictionaries found in release ZIP' }
  foreach ($required in @('src/background.js', 'src/popup.html', 'src/popup.js', 'src/ui-localization.js', 'src/en-explanation-translations.js', 'src/en-explanation-translations-extra.js', 'src/es-explanation-translations.js', '_locales/ca/messages.json', '_locales/es/messages.json', '_locales/en/messages.json', 'build/resources/ca-filter-data.json', 'build/resources/central/ca-central.bin.gz', 'build/resources/central/resource-index.json', 'build/resources/en-US/resource-index.json', 'build/resources/es-ES/resource-index.json', 'build/resources/synthesis/resource-index.json', 'build/engine-build.json')) {
    if ($names -notcontains $required) { throw "Required runtime entry missing from release ZIP: $required" }
  }
  foreach ($required in @('PRIVACY.md', 'licenses/THIRD_PARTY_NOTICES.md', 'licenses/morfologik/COPYING.txt', 'licenses/languagetool-runtime/COPYING.txt', 'licenses/languagetool-runtime/english-pos-readme.txt', 'licenses/opennlp/Apache-2.0.txt', 'licenses/opennlp/NOTICE.txt')) {
    if ($names -notcontains $required) { throw "Required legal notice missing from release ZIP: $required" }
  }
  $stream = $archive.GetEntry('manifest.json').Open()
  try {
    $reader = [System.IO.StreamReader]::new($stream)
    try { $manifest = $reader.ReadToEnd() | ConvertFrom-Json } finally { $reader.Dispose() }
  } finally { $stream.Dispose() }
  if ($manifest.PSObject.Properties.Name -contains 'key') { throw 'Chrome Web Store upload package must not contain manifest key.' }
  if ($manifest.version -ne '${version}') { throw "ZIP manifest version is $($manifest.version), expected ${version}" }
  if ($manifest.web_accessible_resources.resources | Where-Object { $_ -like 'src/dictionaries/*' }) { throw 'Manifest still exposes excluded legacy Catalan dictionaries' }
  $forbidden = @('tests/', 'reports/', 'scripts/', 'AGENTS.md', 'WORKSPACE.md', 'package.json')
  foreach ($prefix in $forbidden) {
    if ($names | Where-Object { $_ -eq $prefix -or $_.StartsWith($prefix, [System.StringComparison]::OrdinalIgnoreCase) }) {
      throw "Development-only content found in release ZIP: $prefix"
    }
  }
  if ($names | Where-Object { $_ -match '(^|/)CHANGELOG-9\\.6\\.' }) { throw 'Historical 9.6 changelog found in release ZIP' }
} finally { $archive.Dispose() }
Write-Output "Created and inspected $destination"
`;

const encoded = Buffer.from(powershell, 'utf16le').toString('base64');
execFileSync('powershell.exe', ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded], { stdio: 'inherit' });
const info = await stat(destination);
console.log(`Version ${version}; ${Math.round(info.size / 1024 / 1024)} MiB; source tree left untouched.`);
