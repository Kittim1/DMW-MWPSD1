# DMW Queue Management System - Deployment Script
# Builds the frontend, copies it to backend public, and OPTIONALLY starts the Laravel
# server bound to 0.0.0.0 so other devices on the LAN can connect (not just localhost).

Write-Host "--- Starting Deployment Process ---"

# Stop any stale Laravel process currently bound to port 8000
Write-Host "Stopping any existing server on port 8000..."
$stale = netstat -ano | Select-String ":8000\s" | Select-String "LISTENING"
if ($stale) {
    foreach ($line in $stale) {
        if ($line -match 'LISTENING\s+(\d+)') {
            $procId = $Matches[1]
            try { Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue } catch {}
        }
    }
    Start-Sleep -Seconds 1
}

# 1. Build Frontend
Write-Host "Step 1: Building Frontend..."
Set-Location -Path "frontend"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Frontend build failed!"
    Set-Location -Path ".."
    exit $LASTEXITCODE
}
Set-Location -Path ".."

# 2. Clean Backend Public Folder
Write-Host "Step 2: Cleaning Backend Public folder..."
$publicPath = Join-Path (Get-Location) "backend/public"
if (Test-Path $publicPath) {
    Get-ChildItem -Path $publicPath -Exclude "index.php", ".htaccess", "dmw.png", "robots.txt" | Remove-Item -Recurse -Force
}

# 3. Copy Build Files to Backend
Write-Host "Step 3: Copying build files to Backend..."
$distPath = Join-Path (Get-Location) "frontend/dist"
if (Test-Path $distPath) {
    Copy-Item -Path "$distPath/*" -Destination $publicPath -Recurse -Force
    Write-Host "Success: Deployment files copied!"
} else {
    Write-Host "Error: dist folder not found at $distPath"
    exit 1
}

# 4. Auto-detect this machine's real LAN IPv4 address (the one other devices should use)
Write-Host ""
Write-Host "Detecting your LAN IP address..."
$lanIp = $null
try {
    $lanIp = (Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
              Where-Object { $_.IPAddress -notlike "127.*" -and
                             $_.IPAddress -notlike "169.254.*" -and
                             $_.PrefixOrigin -eq "Dhcp" -or
                             $_.IPAddress -like "192.168.*" -or
                             $_.IPAddress -like "10.*" -or
                             $_.IPAddress -like "172.16.*" } |
              Sort-Object InterfaceMetric |
              Select-Object -First 1 -ExpandProperty IPAddress)
} catch {}

if (-not $lanIp) { $lanIp = "127.0.0.1" }
Write-Host "Detected LAN IP: $lanIp"

# 5. (Optional) Ensure Windows Firewall allows inbound traffic on 8000 and 3000
Write-Host ""
Write-Host "Checking / adding Windows Firewall rules for ports 3000 and 8000..."
$firewallNeeded = $false
try {
    $rule8000 = Get-NetFirewallRule -DisplayName "DMW Laravel 8000" -ErrorAction SilentlyContinue
    if (-not $rule8000) {
        $Error.Clear()
        New-NetFirewallRule -DisplayName "DMW Laravel 8000" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow -ErrorAction Stop | Out-Null
        if ($Error.Count -eq 0) {
            Write-Host "  + Added firewall rule: DMW Laravel 8000"
        } else {
            Write-Host "  ! FAILED to add firewall rule: DMW Laravel 8000 (run as Administrator)"
            $firewallNeeded = $true
        }
    } else {
        Write-Host "  = Firewall rule already exists: DMW Laravel 8000"
    }

    $rule3000 = Get-NetFirewallRule -DisplayName "DMW Vite 3000" -ErrorAction SilentlyContinue
    if (-not $rule3000) {
        $Error.Clear()
        New-NetFirewallRule -DisplayName "DMW Vite 3000" -Direction Inbound -Protocol TCP -LocalPort 3000 -Action Allow -ErrorAction Stop | Out-Null
        if ($Error.Count -eq 0) {
            Write-Host "  + Added firewall rule: DMW Vite 3000"
        } else {
            Write-Host "  ! FAILED to add firewall rule: DMW Vite 3000 (run as Administrator)"
            $firewallNeeded = $true
        }
    } else {
        Write-Host "  = Firewall rule already exists: DMW Vite 3000"
    }
} catch {
    Write-Host "  ! Could not auto-create firewall rules. Run PowerShell as Administrator if needed."
    $firewallNeeded = $true
}
if ($firewallNeeded) {
    Write-Host ""
    Write-Host "  >> Firewall rules are missing. Other LAN devices may not be able to connect."
    Write-Host "  >> To fix: Right-click PowerShell -> Run as Administrator, then run deploy.ps1 again."
}

Write-Host ""
Write-Host "===================================================="
Write-Host " Deployment complete! "
Write-Host "===================================================="
Write-Host ""
Write-Host " Option A - LAN-visible production build (recommended for other devices):"
Write-Host "   cd backend"
Write-Host "   php artisan serve --host=0.0.0.0 --port=8000"
Write-Host ""
Write-Host "   Other devices open:  http://${lanIp}:8000/landing"
Write-Host "   This PC localhost:   http://127.0.0.1:8000/landing"
Write-Host ""
Write-Host " Option B - Frontend dev server + API proxy (local development):"
Write-Host "   Terminal 1: cd backend ; php artisan serve --host=0.0.0.0 --port=8000"
Write-Host "   Terminal 2: cd frontend ; npm run dev -- --host 0.0.0.0"
Write-Host ""
Write-Host "   Other devices open:  http://${lanIp}:3000/landing"
Write-Host "   This PC localhost:   http://127.0.0.1:3000/landing"
Write-Host ""
Write-Host " NOTE: If other devices still cannot connect, temporarily disable"
Write-Host "       any 3rd-party antivirus firewall or run this script as Admin."
Write-Host "===================================================="
