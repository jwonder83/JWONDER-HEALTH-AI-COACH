# 3000 포트를 쓰는 프로세스 종료 (Windows)
$ErrorActionPreference = "SilentlyContinue"
Get-NetTCPConnection -LocalPort 3000 | ForEach-Object {
  Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}
Write-Host "Port 3000 cleared."
