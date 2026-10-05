@echo off
setlocal
set NODE_OPTIONS=--use-system-ca
title VetConnect v2.0 - Entorno de Desarrollo

echo ======================================================================
echo    VetConnect v2.0 - Plataforma de Telemedicina Veterinaria
echo ======================================================================
echo.

REM 1. Verificar si Node.js esta instalado
where node >nul 2>&1
if errorlevel 1 goto error_node

REM 2. Verificar si npm esta instalado
where npm >nul 2>&1
if errorlevel 1 goto error_npm

REM 3. Configurar variables de entorno (.env) si faltan
echo [1/3] Verificando archivos de configuracion .env...
if not exist "backend\.env" (
    echo       Creando backend\.env desde plantilla .env.example...
    copy ".env.example" "backend\.env" >nul
)
if not exist "web\.env" (
    echo       Creando web\.env desde plantilla...
    if exist "web\.env.example" (
        copy "web\.env.example" "web\.env" >nul
    ) else (
        copy ".env.example" "web\.env" >nul
    )
)
if not exist "mobile\.env" (
    echo       Creando mobile\.env desde plantilla...
    if exist "mobile\.env.example" (
        copy "mobile\.env.example" "mobile\.env" >nul
    )
)
echo       Configuracion de entorno verificada.
echo.

REM 4. Verificar dependencias (node_modules)
echo [2/3] Verificando dependencias de Node.js...
if not exist "node_modules" goto instalar_deps
echo       Dependencias principales encontradas.
echo.
goto check_prisma

:instalar_deps
echo       Primera ejecucion detectada en este equipo.
echo       Instalando todas las dependencias del monorepo (backend, web, mobile)...
echo       Esto puede tomar 1 o 2 minutos. Por favor espera...
echo.
call npm install
if errorlevel 1 goto error_install
echo.
echo       Dependencias instaladas con exito.
echo.

:check_prisma
REM 5. Generar Prisma Client
echo [3/3] Generando cliente ORM Prisma para PostgreSQL...
call npm run prisma:generate
if errorlevel 1 goto error_prisma
echo       Prisma Client listo.
echo.

:menu_inicio
REM 6. Menu de Inicio
echo ======================================================================
echo  Selecciona el servicio que deseas encender:
echo ======================================================================
echo  1. Backend (API :3001) + Web (:5173) [PREDETERMINADO]
echo  2. Backend + Web + Mobile (Expo en ventana separada)
echo  3. Solo Backend (puerto 3001)
echo  4. Solo Frontend Web (puerto 5173)
echo  5. Solo Mobile App (Expo Metro)
echo  6. Salir
echo ======================================================================
echo.
echo Iniciando opcion 1 en 5 segundos si no se presiona ninguna tecla...

choice /c 123456 /d 1 /t 5 /m "Elige una opcion (1-6)"
set opt=%errorlevel%

if "%opt%"=="1" goto run_both
if "%opt%"=="2" goto run_all
if "%opt%"=="3" goto run_backend
if "%opt%"=="4" goto run_web
if "%opt%"=="5" goto run_mobile
if "%opt%"=="6" goto salir

:run_both
echo.
echo Iniciando Backend y Web concurrentemente...
call npm run dev
goto fin

:run_all
echo.
echo Lanzando Mobile App (Expo) en ventana independiente...
start "VetConnect Mobile (Expo)" cmd /k "call npm run dev:mobile"
echo Iniciando Backend y Web en esta consola...
call npm run dev
goto fin

:run_backend
echo.
echo Iniciando solo Backend en puerto 3001...
call npm run dev:backend
goto fin

:run_web
echo.
echo Iniciando solo Frontend Web en puerto 5173...
call npm run dev:web
goto fin

:run_mobile
echo.
echo Iniciando solo Mobile App (Expo)...
call npm run dev:mobile
goto fin

:error_node
echo.
echo [ERROR CRITICO] Node.js no esta instalado o no se encuentra en el PATH.
echo Por favor descarga e instala Node.js LTS (version 20 o superior):
echo https://nodejs.org/
echo.
pause
exit /b 1

:error_npm
echo.
echo [ERROR CRITICO] npm no esta disponible en el PATH.
echo Reinstala Node.js marcando la opcion de agregar al PATH.
echo.
pause
exit /b 1

:error_install
echo.
echo [ERROR CRITICO] Ocurrio un error al ejecutar 'npm install'.
echo Revisa tu conexion a Internet y los permisos de la carpeta.
echo.
pause
exit /b 1

:error_prisma
echo.
echo [AVISO] Fallo la generacion en la raiz. Reintentando dentro de backend/...
cd backend
call npx prisma generate
cd ..
if errorlevel 1 (
    echo [ERROR] No se pudo generar Prisma Client. Verifica backend\prisma\schema.prisma
    pause
    exit /b 1
)
echo Prisma Client generado correctamente.
goto menu_inicio

:salir
echo.
echo Operacion finalizada.
exit /b 0

:fin
pause
