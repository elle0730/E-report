# E-Report Barangay Bensican - Desktop Application Launcher
$workspace = "C:\Users\eliyanah\OneDrive\Desktop\cloud app"
$serverDir = "$workspace\server"
$appUrl = "http://localhost:5001"
$healthUrl = "$appUrl/api/health"

# 1. Check if backend server is already active
$isRunning = $false
try {
    $res = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 1 -ErrorAction SilentlyContinue
    if ($res.status -eq 'ok') {
        $isRunning = $true
    }
} catch {
    $isRunning = $false
}

# 2. If not running, launch node server silently in background
if (-not $isRunning) {
    Start-Process -FilePath "cmd.exe" -ArgumentList '/c "node dist\index.js"' -WorkingDirectory $serverDir -WindowStyle Hidden

    # Poll until server is ready
    for ($i = 0; $i -lt 16; $i++) {
        Start-Sleep -Milliseconds 500
        try {
            $check = Invoke-RestMethod -Uri $healthUrl -TimeoutSec 1 -ErrorAction SilentlyContinue
            if ($check.status -eq 'ok') {
                break
            }
        } catch {}
    }
}

# 3. Open application in clean standalone app window
$edge = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$chrome = "C:\Program Files\Google\Chrome\Application\chrome.exe"

if (Test-Path $edge) {
    Start-Process -FilePath $edge -ArgumentList "--app=$appUrl"
} elseif (Test-Path $chrome) {
    Start-Process -FilePath $chrome -ArgumentList "--app=$appUrl"
} else {
    Start-Process -FilePath $appUrl
}
