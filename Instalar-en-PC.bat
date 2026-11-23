@echo off
title Instalador de Santa Biblia Reina-Valera 1960
echo ========================================================
echo   INSTALANDO SANTA BIBLIA REINA-VALERA 1960 EN TU PC
echo ========================================================
echo.

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $appUrl='https://generador-de-sermones.web.app'; $localIco=Join-Path '%~dp0' 'Biblia-RVR1960.ico'; $appDir=Join-Path $env:LOCALAPPDATA 'SantaBibliaRVR1960'; New-Item -ItemType Directory -Force -Path $appDir | Out-Null; $icoPath=Join-Path $appDir 'Biblia-RVR1960.ico'; if (Test-Path $localIco) { Copy-Item -Path $localIco -Destination $icoPath -Force } else { try { [Net.ServicePointManager]::SecurityProtocol=[Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri ($appUrl+'/favicon.ico') -OutFile $icoPath -UseBasicParsing } catch {} }; $b=@((Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe'),(Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe'),(Join-Path $env:LOCALAPPDATA 'Microsoft\Edge\Application\msedge.exe'),(Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe'),(Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe'),(Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe')); $exe=$b | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1; $wsh=New-Object -ComObject WScript.Shell; $folders=@([Environment]::GetFolderPath('Desktop'),[Environment]::GetFolderPath('Programs')); foreach ($f in $folders) { if ($f -and (Test-Path $f)) { $lnk=$wsh.CreateShortcut((Join-Path $f 'Santa Biblia RVR1960.lnk')); if ($exe) { $lnk.TargetPath=$exe; $lnk.Arguments='--app='+$appUrl } else { $lnk.TargetPath=$appUrl }; if (Test-Path $icoPath) { $lnk.IconLocation=$icoPath+',0' }; $lnk.Description='Santa Biblia Reina-Valera 1960'; $lnk.Save() } }"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Hubo un problema durante la instalacion.
    pause
    exit /b 1
)

echo [OK] Instalacion completada con exito!
echo Se ha creado el icono "Santa Biblia RVR1960" en tu Escritorio y Menu Inicio.
echo.
pause
