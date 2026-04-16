# PowerShell 실행 정책 때문에 npm.ps1 이 막히면, npm.cmd 를 직접 호출합니다.
Set-Location $PSScriptRoot
$npm = Join-Path ${env:ProgramFiles} "nodejs\npm.cmd"
if (-not (Test-Path $npm)) {
  Write-Error "npm.cmd 을 찾을 수 없습니다. Node.js LTS 를 설치하세요. https://nodejs.org/"
  exit 1
}
& $npm run dev
