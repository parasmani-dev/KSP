while ($true) {
    $date = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Output "[$date] Checking for updates from upstream/main..."
    git pull upstream main
    Start-Sleep -Seconds 60
}
