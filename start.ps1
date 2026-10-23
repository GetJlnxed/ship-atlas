$ErrorActionPreference = 'Stop'
$taskRoot = $PSScriptRoot
$taskNode = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $taskNode) { $taskNode = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' }
if (-not (Test-Path -LiteralPath $taskNode)) { throw 'Node.js не найден. Установите Node.js 22.12+.' }
try { $response = Invoke-WebRequest 'http://127.0.0.1:4173/' -TimeoutSec 3 -UseBasicParsing; $alreadyRunning = $response.Content.Contains('ATLAS') } catch { $alreadyRunning = $false }
if (-not $alreadyRunning) {
  $taskProcess = Start-Process -FilePath $taskNode -ArgumentList 'server.mjs' -WorkingDirectory $taskRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $taskRoot 'server.log') -RedirectStandardError (Join-Path $taskRoot 'server-error.log')
  $taskProcess.Id | Set-Content -LiteralPath (Join-Path $taskRoot 'server.pid')
}
Start-Process 'http://127.0.0.1:4173/'
