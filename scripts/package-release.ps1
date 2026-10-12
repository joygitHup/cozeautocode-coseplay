# 打包可独立部署的 release 到项目根目录 dist-release/
# 用法: powershell -ExecutionPolicy Bypass -File scripts/package-release.ps1

$ErrorActionPreference = 'Stop'
$root = $PWD.Path
$release = Join-Path $root 'dist-release'
Write-Host "root=$root release=$release"

Write-Host "[1/5] Clean old dist-release"
if (Test-Path $release) {
  # 用 cmd rmdir /s /q 绕过 PowerShell 长路径限制
  cmd /c "rmdir /s /q `"$release`"" 2>&1 | Out-Null
  if (Test-Path $release) {
    # 兜底：用 robocopy 空目录镜像清空
    $emptyDirPath = "$root\.empty-tmp"
    New-Item -ItemType Directory -Path $emptyDirPath -Force | Out-Null
    robocopy $emptyDirPath $release /MIR /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null
    cmd /c "rmdir /s /q `"$emptyDirPath`"" 2>&1 | Out-Null
    cmd /c "rmdir /s /q `"$release`"" 2>&1 | Out-Null
  }
}
New-Item -ItemType Directory -Path $release -Force | Out-Null

Write-Host "[2/5] Copy standalone (含精简 node_modules + server.js + package.json)"
# 用 robocopy 绕过 Windows 260 字符路径长度限制
$src = (Resolve-Path .next/standalone).Path
$dst = Join-Path $release 'standalone'
robocopy $src $dst /E /NFL /NDL /NJH /NJS /NC /NS /NP /MIR | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy standalone failed: $LASTEXITCODE" }

Write-Host "[3/5] Copy static assets (.next/static) for CDN or local serving"
$staticDst = Join-Path $release '.next/static'
New-Item -ItemType Directory -Path $staticDst -Force | Out-Null
$staticSrc = (Resolve-Path '.next/static').Path
robocopy $staticSrc $staticDst /E /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null
if ($LASTEXITCODE -ge 8) { throw "robocopy static failed: $LASTEXITCODE" }

Write-Host "[4/5] Copy public/ and dist/server.js (fallback for custom server)"
if (Test-Path public) {
  $pubSrc = (Resolve-Path 'public').Path
  robocopy $pubSrc (Join-Path $release 'public') /E /NFL /NDL /NJH /NJS /NC /NS /NP | Out-Null
  if ($LASTEXITCODE -ge 8) { throw "robocopy public failed: $LASTEXITCODE" }
}
if (Test-Path dist/server.js) {
  $distDir = Join-Path $release 'dist'
  New-Item -ItemType Directory -Path $distDir -Force | Out-Null
  Copy-Item -Path dist/server.js -Destination $distDir -Force
}

Write-Host "[5/5] Write run scripts"
@'
#!/bin/bash
set -Eeuo pipefail
PORT="${PORT:-5000}"
cd "$(dirname "$0")"
echo "Starting standalone server on port $PORT..."
PORT=$PORT HOSTNAME=0.0.0.0 node standalone/server.js
'@ | Set-Content -Path (Join-Path $release 'start.sh') -Encoding UTF8

@'
@echo off
setlocal
set PORT=%1
if "%PORT%"=="" set PORT=5000
cd /d "%~dp0"
echo Starting standalone server on port %PORT%...
set PORT=%PORT%
set HOSTNAME=0.0.0.0
node standalone\server.js
'@ | Set-Content -Path (Join-Path $release 'start.bat') -Encoding UTF8

# Write README
$readme = @'
# Release Package

Built from commit (run `git rev-parse --short HEAD` for current hash).

## Run

### Linux / macOS
```bash
PORT=5000 bash start.sh
```

### Windows
```cmd
start.bat
:: or: start.bat 5000
```

Server listens on `$PORT` (default 5000).

## Contents

- `standalone/` — Next.js standalone output (server.js + minimal node_modules + package.json)
- `.next/static/` — static assets (JS/CSS/images)
- `public/` — static public files (if any)
- `start.sh` / `start.bat` — launch scripts
- `README.md`

## Required env (.env.local or environment variables)

- `PAYMENT_MODE` (`mock` or `wechat_direct`)
- `WECHAT_MCHID/APPID/API_V3_KEY/PRIVATE_KEY_PATH/CERT_SERIAL_NO`（wechat_direct 时）
- `NEXT_PUBLIC_SITE_URL`（生产公网 https 域名）
- `ADMIN_PASSWORD`
- `ESTIMATED_COST_CNY_PER_GENERATION`
- `FIRST_PURCHASE_DISCOUNT_ENABLED/FEN`

## Notes

- standalone mode bypasses need for `node_modules` install in deploy target
- Static files in `.next/static` are served from same origin (no CDN) by default
'@
Set-Content -Path (Join-Path $release 'README.md') -Value $readme -Encoding UTF8

Write-Host ""
Write-Host "=== Package complete ==="
$size = (Get-ChildItem $release -Recurse -File | Measure-Object Length -Sum).Sum / 1MB
Write-Host ("dist-release size: {0:N1} MB" -f $size)
Write-Host "Location: $release"
Write-Host ""
Write-Host "Top-level contents:"
Get-ChildItem $release | Select-Object Name, Mode | Format-Table
