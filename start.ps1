Write-Host "===================================================" -ForegroundColor Cyan
Write-Host " VetConnect v2.0 - Mobile Dev Environment" -ForegroundColor Cyan
Write-Host " Configurando ADB Reverse USB para Android..." -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan

# Comprobar si ADB esta disponible en PATH
if (Get-Command adb -ErrorAction SilentlyContinue) {
    Write-Host "[ADB] Verificando dispositivos Android conectados..." -ForegroundColor Yellow
    $devices = adb devices | Select-String -Pattern "device$"
    if ($devices) {
        Write-Host "[ADB] Dispositivo detectado. Redirigiendo puerto 3001 por USB..." -ForegroundColor Green
        adb reverse tcp:3001 tcp:3001
        adb reverse tcp:8081 tcp:8081
        Write-Host "[ADB] Puertos 3001 y 8081 ruteados con exito por USB." -ForegroundColor Green
    } else {
        Write-Host "[ADB] No se detecto dispositivo Android por USB (asegurate de tener 'Depuracion USB' activa)." -ForegroundColor Yellow
        Write-Host "[ADB] Continuando con el arranque de Metro bundler..." -ForegroundColor Yellow
    }
} else {
    Write-Host "[ADVERTENCIA] 'adb' no encontrado en el PATH del sistema." -ForegroundColor Yellow
    Write-Host "[ADVERTENCIA] Si pruebas en emulador o dispositivo fisico por USB, instala Android Platform Tools." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[EXPO] Iniciando Mobile App (npm run dev:mobile)..." -ForegroundColor Cyan
npm run dev:mobile
