#Requires -RunAsAdministrator
<#
.SYNOPSIS
    Removes orphaned Microsoft accounts from Windows autocomplete/suggestions.
.DESCRIPTION
    Cleans orphaned Microsoft accounts from:
    - Windows Credential Manager
    - Identity Store cache (login screen suggestions)
    - AAD/Work account registry entries
    - MicrosoftAccount token cache
    - Logon UI cached user list
    Run as Administrator. Restart after running.
#>

$ErrorActionPreference = 'SilentlyContinue'

function Write-Header($msg) {
    Write-Host "`n=== $msg ===" -ForegroundColor Cyan
}

function Write-Done($msg) {
    Write-Host "  [OK] $msg" -ForegroundColor Green
}

function Write-Removed($msg) {
    Write-Host "  [-] Removed: $msg" -ForegroundColor Yellow
}

function Write-Info($msg) {
    Write-Host "  [i] $msg" -ForegroundColor Gray
}

# ── 1. Windows Credential Manager ────────────────────────────────────────────
Write-Header "Credential Manager"

$msTargets = cmdkey /list | Select-String "MicrosoftOffice|MicrosoftAccount|microsoftaccount|live\.com|outlook\.com|hotmail\.com|onedrive|sharepoint|office365|microsoftonline" |
    ForEach-Object { ($_ -replace '.*Target:\s*', '').Trim() }

if ($msTargets) {
    foreach ($target in $msTargets) {
        cmdkey /delete:$target | Out-Null
        Write-Removed $target
    }
} else {
    Write-Info "No orphaned entries found"
}

# ── 2. Identity Store Cache (login screen / Start menu suggestions) ───────────
Write-Header "Identity Store Cache"

$idStoreKey = "HKLM:\SOFTWARE\Microsoft\IdentityStore\Cache"
if (Test-Path $idStoreKey) {
    $subkeys = Get-ChildItem $idStoreKey -Recurse -ErrorAction SilentlyContinue
    foreach ($key in $subkeys) {
        # Only remove keys that look like email/Microsoft account entries
        if ($key.Name -match '@|live\.com|outlook\.com|hotmail\.com|microsoft\.com') {
            Remove-Item -Path $key.PSPath -Recurse -Force
            Write-Removed $key.Name
        }
    }
    Write-Done "Identity store cleaned"
} else {
    Write-Info "Identity store key not found"
}

# ── 3. Logon UI cached user list ─────────────────────────────────────────────
Write-Header "Logon UI User Cache"

$logonKey = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Authentication\LogonUI"
$props = @("LastLoggedOnUser", "LastLoggedOnSAMUser", "SelectedUserSID")
foreach ($prop in $props) {
    $val = (Get-ItemProperty -Path $logonKey -Name $prop -ErrorAction SilentlyContinue).$prop
    if ($val -and $val -match '@|live\.com|outlook\.com|hotmail\.com') {
        Remove-ItemProperty -Path $logonKey -Name $prop -Force
        Write-Removed "$prop = $val"
    }
}

# Clear the full user tile cache
$tileKey = "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Authentication\LogonUI\UserSwitch"
if (Test-Path $tileKey) {
    Get-ChildItem $tileKey | ForEach-Object {
        $username = (Get-ItemProperty $_.PSPath -Name "UserName" -ErrorAction SilentlyContinue).UserName
        if ($username -match '@|live\.com|outlook\.com|hotmail\.com') {
            Remove-Item -Path $_.PSPath -Recurse -Force
            Write-Removed "Tile entry: $username"
        }
    }
}
Write-Done "Logon UI cleaned"

# ── 4. AAD / Work & School accounts ──────────────────────────────────────────
Write-Header "AAD / Work & School Accounts"

# List current AAD accounts
$dsregOutput = dsregcmd /status 2>&1
Write-Info "Current device join state:"
$dsregOutput | Select-String "AzureAdJoined|WorkplaceJoined|TenantName|UserEmail" | ForEach-Object {
    Write-Info "  $_"
}

# Remove workplace-joined accounts from registry
$aadKey = "HKLM:\SOFTWARE\Microsoft\Workplace Join\JoinInfo"
if (Test-Path $aadKey) {
    Get-ChildItem $aadKey | ForEach-Object {
        $upn = (Get-ItemProperty $_.PSPath -Name "UserEmail" -ErrorAction SilentlyContinue).UserEmail
        Write-Removed "AAD join entry: $upn"
        Remove-Item -Path $_.PSPath -Recurse -Force
    }
}

# Per-user AAD tokens
$aadUserKey = "HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\AAD"
if (Test-Path $aadUserKey) {
    Remove-Item -Path $aadUserKey -Recurse -Force
    Write-Removed "HKCU AAD token store"
}
Write-Done "AAD entries cleaned"

# ── 5. Microsoft Account token cache ─────────────────────────────────────────
Write-Header "Microsoft Account Token Cache"

$msaKey = "HKCU:\SOFTWARE\Microsoft\MicrosoftAccount"
if (Test-Path $msaKey) {
    Get-ChildItem $msaKey -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Removed $_.Name
        Remove-Item -Path $_.PSPath -Recurse -Force
    }
    Write-Done "MSA token cache cleared"
} else {
    Write-Info "No MSA token cache found"
}

# ── 6. Windows Live ID service cache ─────────────────────────────────────────
Write-Header "Windows Live ID Cache"

$wlidKey = "HKCU:\SOFTWARE\Microsoft\IdentityCRL"
if (Test-Path $wlidKey) {
    Remove-Item -Path $wlidKey -Recurse -Force
    Write-Done "Windows Live ID cache cleared"
} else {
    Write-Info "Not found"
}

# ── 7. Office MRU / account list ─────────────────────────────────────────────
Write-Header "Office Account Cache"

$officeRoots = @(
    "HKCU:\SOFTWARE\Microsoft\Office\16.0\Common\Identity",
    "HKCU:\SOFTWARE\Microsoft\Office\15.0\Common\Identity"
)
foreach ($root in $officeRoots) {
    if (Test-Path $root) {
        # Clear stored identities but leave the key itself
        $identities = Get-ChildItem "$root\Identities" -ErrorAction SilentlyContinue
        foreach ($id in $identities) {
            $email = (Get-ItemProperty $id.PSPath -Name "EmailAddress" -ErrorAction SilentlyContinue).EmailAddress
            Write-Removed "Office identity: $email ($($id.PSChildName))"
            Remove-Item -Path $id.PSPath -Recurse -Force
        }
        # Clear the ADAL token cache
        $adalCache = "$root\ADALCache"
        if (Test-Path $adalCache) {
            Remove-Item -Path $adalCache -Recurse -Force
            Write-Removed "ADAL token cache"
        }
        Write-Done "Office identity cache cleared ($root)"
    }
}

# ── 8. Cached profile list (leftover SIDs) ───────────────────────────────────
Write-Header "Orphaned Profile SIDs"

$profileList = "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\ProfileList"
Get-ChildItem $profileList | ForEach-Object {
    $profilePath = (Get-ItemProperty $_.PSPath -Name "ProfileImagePath" -ErrorAction SilentlyContinue).ProfileImagePath
    if ($profilePath -and -not (Test-Path $profilePath)) {
        Write-Removed "Orphaned SID $($_.PSChildName) -> $profilePath (folder missing)"
        Remove-Item -Path $_.PSPath -Recurse -Force
    }
}
Write-Done "Profile list cleaned"

# ── Done ──────────────────────────────────────────────────────────────────────
Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "  Done. Please RESTART your PC to apply all changes." -ForegroundColor Green
Write-Host "============================================`n" -ForegroundColor Cyan
