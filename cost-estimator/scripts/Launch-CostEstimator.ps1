$ErrorActionPreference = "Stop"

$appPath = Split-Path -Parent $PSScriptRoot
$port = 3002
$startupUrl = "http://localhost:$port/fr"
$buildMarkerPath = Join-Path $appPath ".next\BUILD_ID"
$logDir = Join-Path $appPath ".launcher"
$stdoutLog = Join-Path $logDir "server.out.log"
$stderrLog = Join-Path $logDir "server.err.log"
$devStdoutLog = Join-Path $logDir "server-dev.out.log"
$devStderrLog = Join-Path $logDir "server-dev.err.log"

function Test-AppPort {
  param([int]$CheckPort)

  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $asyncResult = $client.BeginConnect("127.0.0.1", $CheckPort, $null, $null)
    $connected = $asyncResult.AsyncWaitHandle.WaitOne(1000, $false)
    if (-not $connected) {
      return $false
    }

    $client.EndConnect($asyncResult)
    return $true
  } catch {
    return $false
  } finally {
    $client.Dispose()
  }
}

function Wait-ForApp {
  param(
    [int]$CheckPort,
    [int]$TimeoutSeconds
  )

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-AppPort -CheckPort $CheckPort) {
      return $true
    }

    Start-Sleep -Seconds 1
  }

  return $false
}

function Get-NpmCommand {
  $npmCommand = Get-Command npm.cmd -ErrorAction SilentlyContinue
  if ($npmCommand) {
    return $npmCommand.Source
  }

  $npmCommand = Get-Command npm -ErrorAction SilentlyContinue
  if ($npmCommand) {
    return $npmCommand.Source
  }

  throw "npm bulunamadi. Node.js/NPM kurulumunu kontrol edin."
}

function Get-SourceLastWriteTimeUtc {
  $trackedPaths = @(
    "app",
    "components",
    "lib",
    "messages",
    "prisma",
    "public",
    "auth.ts",
    "i18n.ts",
    "next.config.ts",
    "package.json",
    "proxy.ts"
  )

  $latestWriteTime = [datetime]::MinValue

  foreach ($trackedPath in $trackedPaths) {
    $fullPath = Join-Path $appPath $trackedPath
    if (-not (Test-Path $fullPath)) {
      continue
    }

    $item = Get-Item $fullPath
    if ($item.PSIsContainer) {
      $latestItem = Get-ChildItem $fullPath -Recurse -File | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1
      if ($latestItem -and $latestItem.LastWriteTimeUtc -gt $latestWriteTime) {
        $latestWriteTime = $latestItem.LastWriteTimeUtc
      }
      continue
    }

    if ($item.LastWriteTimeUtc -gt $latestWriteTime) {
      $latestWriteTime = $item.LastWriteTimeUtc
    }
  }

  return $latestWriteTime
}

function Test-BuildRequired {
  if (-not (Test-Path $buildMarkerPath)) {
    return $true
  }

  $buildWriteTime = (Get-Item $buildMarkerPath).LastWriteTimeUtc
  return (Get-SourceLastWriteTimeUtc) -gt $buildWriteTime
}

function Invoke-Npm {
  param(
    [string]$NpmExecutable,
    [string[]]$Arguments
  )

  Push-Location $appPath
  try {
    & $NpmExecutable @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "npm $($Arguments -join ' ') komutu hata ile sonlandi."
    }
  } finally {
    Pop-Location
  }
}

function Start-ServerProcess {
  param(
    [string]$NpmExecutable,
    [string[]]$Arguments,
    [string]$OutLog,
    [string]$ErrLog
  )

  if (Test-Path $OutLog) {
    Remove-Item $OutLog -Force
  }

  if (Test-Path $ErrLog) {
    Remove-Item $ErrLog -Force
  }

  return Start-Process -FilePath $NpmExecutable `
    -ArgumentList $Arguments `
    -WorkingDirectory $appPath `
    -WindowStyle Hidden `
    -RedirectStandardOutput $OutLog `
    -RedirectStandardError $ErrLog `
    -PassThru
}

try {
  New-Item -ItemType Directory -Path $logDir -Force | Out-Null

  if (Test-AppPort -CheckPort $port) {
    Start-Process $startupUrl | Out-Null
    exit 0
  }

  $npmExecutable = Get-NpmCommand

  if (Test-BuildRequired) {
    Invoke-Npm -NpmExecutable $npmExecutable -Arguments @("run", "build")
  }

  $serverProcess = Start-ServerProcess -NpmExecutable $npmExecutable -Arguments @("run", "start") -OutLog $stdoutLog -ErrLog $stderrLog
  if (-not (Wait-ForApp -CheckPort $port -TimeoutSeconds 45)) {
    if ($serverProcess -and -not $serverProcess.HasExited) {
      Stop-Process -Id $serverProcess.Id -Force
    }

    $serverProcess = Start-ServerProcess -NpmExecutable $npmExecutable -Arguments @("run", "dev") -OutLog $devStdoutLog -ErrLog $devStderrLog
    if (-not (Wait-ForApp -CheckPort $port -TimeoutSeconds 60)) {
      if ($serverProcess -and -not $serverProcess.HasExited) {
        Stop-Process -Id $serverProcess.Id -Force
      }

      throw "Uygulama baslatilamadi. Loglari kontrol edin: $logDir"
    }
  }

  Start-Process $startupUrl | Out-Null
  exit 0
} catch {
  Write-Error $_
  exit 1
}