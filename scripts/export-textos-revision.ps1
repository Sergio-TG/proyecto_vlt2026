# Alternativa PowerShell (rutas con [id] requieren -LiteralPath).
# Recomendado: npm run export-textos

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

$out = Join-Path $root "textos_revision_ps.txt"
if (Test-Path $out) { Remove-Item $out }

function Add-Section($text) {
    Add-Content -Path $out -Value "`n========================================`n$text`n========================================`n" -Encoding UTF8
}

# i18n (donde está la mayoría del contenido)
$i18nFiles = @(
    "src\i18n\pagesCopy.ts",
    "src\i18n\siteCopy.ts"
)
Add-Section "ARCHIVOS i18n (textos principales)"
foreach ($rel in $i18nFiles) {
    $full = Join-Path $root $rel
    Add-Content -Path $out -Value "`n--- $rel ---`n" -Encoding UTF8
    Get-Content -LiteralPath $full -Encoding UTF8 |
        Where-Object {
            $_ -notmatch '^\s*import ' -and
            $_ -notmatch '^\s*export (type|function)' -and
            $_ -notmatch 'className=' -and
            $_ -notmatch '^\s*//'
        } |
        Add-Content -Path $out -Encoding UTF8
}

# Páginas (LiteralPath evita error con [slug] y [id])
Add-Section "page.tsx / index.tsx (texto inline)"
Get-ChildItem -Path (Join-Path $root "src") -Recurse -File |
    Where-Object { $_.Name -eq "page.tsx" -or $_.Name -eq "index.tsx" } |
    Sort-Object FullName |
    ForEach-Object {
        $rel = $_.FullName.Substring($root.Length)
        Add-Content -Path $out -Value "`n--- $rel ---`n" -Encoding UTF8
        Get-Content -LiteralPath $_.FullName -Encoding UTF8 |
            Where-Object {
                $_ -notmatch '^\s*import ' -and
                $_ -notmatch '^\s*export ' -and
                $_ -notmatch 'className='
            } |
            Add-Content -Path $out -Encoding UTF8
    }

Write-Host "Generado: $out"
