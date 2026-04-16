@echo off
cd /d "%~dp0"
set "NPM=%ProgramFiles%\nodejs\npm.cmd"
if not exist "%NPM%" (
  echo [오류] npm.cmd 을 찾을 수 없습니다. Node.js LTS 를 설치하세요.
  echo https://nodejs.org/
  pause
  exit /b 1
)
call "%NPM%" run dev
