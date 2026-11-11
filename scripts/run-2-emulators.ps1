param(
  [string]$Avd1 = 'Medium_Phone',
  [string]$Avd2 = 'Medium_Phone_2',
  [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$sdk = if ($env:ANDROID_HOME) { $env:ANDROID_HOME } else { "$env:LOCALAPPDATA\Android\Sdk" }
$adb = Join-Path $sdk 'platform-tools\adb.exe'
$emu = Join-Path $sdk 'emulator\emulator.exe'
$apk = Join-Path $root 'android\app\build\outputs\apk\debug\app-debug.apk'
$pkg = 'com.thuchanh_danentang'

if (!(Test-Path $adb)) { throw "Không thấy adb tại $adb. Kiểm tra ANDROID_HOME." }
if (!(Test-Path $emu)) { throw "Không thấy emulator tại $emu." }

$avds = @(& $emu -list-avds)
foreach ($a in @($Avd1, $Avd2)) {
  if ($avds -notcontains $a) {
    throw "AVD '$a' không tồn tại. Đang có: $($avds -join ', ')"
  }
}

function Get-RunningAvds {
  $map = @{}
  foreach ($line in @(& $adb devices)) {
    if ($line -match '^(emulator-\d+)\s+device') {
      $serial = $Matches[1]
      $name = @(& $adb -s $serial emu avd name 2>$null |
        Where-Object { $_ -and $_.Trim() -ne 'OK' })[0]
      if ($name) { $map[$name.Trim()] = $serial }
    }
  }
  return $map
}

Write-Host "==> Khởi động emulator..." -ForegroundColor Cyan
$running = Get-RunningAvds
foreach ($avd in @($Avd1, $Avd2)) {
  if (-not $running.ContainsKey($avd)) {
    Write-Host "    start $avd"
    Start-Process -FilePath $emu -ArgumentList @(
      '-avd', $avd, '-no-audio', '-no-boot-anim'
    )
  } else {
    Write-Host "    $avd đang chạy ($($running[$avd]))"
  }
}

$metroUp = Get-NetTCPConnection -State Listen -LocalPort 8081 -ErrorAction SilentlyContinue
if (-not $metroUp) {
  Write-Host "==> Mở Metro (npm start)..." -ForegroundColor Cyan
  Start-Process -FilePath 'cmd.exe' -ArgumentList '/k', 'npm start' -WorkingDirectory $root
} else {
  Write-Host "==> Metro đã chạy ở cổng 8081"
}

if (-not $SkipBuild) {
  Write-Host "==> Build APK (assembleDebug)..." -ForegroundColor Cyan
  Push-Location (Join-Path $root 'android')
  try {
    & .\gradlew.bat assembleDebug
    if ($LASTEXITCODE -ne 0) { throw 'Gradle build thất bại.' }
  } finally {
    Pop-Location
  }
}
if (!(Test-Path $apk)) {
  throw "Không thấy APK: $apk. Chạy không kèm -SkipBuild."
}

Write-Host "==> Đợi 2 emulator boot xong..." -ForegroundColor Cyan
$deadline = (Get-Date).AddMinutes(8)
$map = @{}
while ($true) {
  $map = Get-RunningAvds
  $ready = $map.ContainsKey($Avd1) -and $map.ContainsKey($Avd2)
  if ($ready) {
    foreach ($avd in @($Avd1, $Avd2)) {
      $serial = $map[$avd]
      $boot = @(& $adb -s $serial shell getprop sys.boot_completed 2>$null)[0]
      if ($boot -and $boot.Trim() -ne '1') { $ready = $false }
    }
  }
  if ($ready) { break }
  if ((Get-Date) -gt $deadline) {
    throw "Timeout: 2 emulator chưa boot xong. Serial hiện có: $($map.Values -join ', ')"
  }
  Start-Sleep -Seconds 3
}

Write-Host "==> Cài app + reverse Metro + mở app..." -ForegroundColor Cyan
foreach ($avd in @($Avd1, $Avd2)) {
  $serial = $map[$avd]
  Write-Host "    $avd ($serial)"
  & $adb -s $serial shell settings put global window_animation_scale 0 2>$null
  & $adb -s $serial shell settings put global transition_animation_scale 0 2>$null
  & $adb -s $serial shell settings put global animator_duration_scale 0 2>$null
  & $adb -s $serial install -r $apk | Out-Host
  & $adb -s $serial reverse tcp:8081 tcp:8081 | Out-Null
  & $adb -s $serial shell am start -n "$pkg/.MainActivity" | Out-Null
}

Write-Host ""
Write-Host "Xong. 2 emulator đã mở app:" -ForegroundColor Green
foreach ($avd in @($Avd1, $Avd2)) {
  Write-Host "  $avd -> $($map[$avd])"
}
Write-Host "Tài khoản: đăng nhập user khác nhau trên 2 máy (user thứ 3 tạo bằng cách logout/register rồi login lại)."
