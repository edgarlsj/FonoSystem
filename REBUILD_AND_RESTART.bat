@echo off
REM Script para recompilar e reiniciar o FonoSystem no Windows

echo ================================
echo 🔄 Reconstruindo FonoSystem
echo ================================
echo.

REM Verificar se estamos no diretório correto
if not exist "docker-compose.yml" (
    echo ❌ ERRO: docker-compose.yml nao encontrado!
    echo Execute este script na pasta raiz do FonoSystem
    pause
    exit /b 1
)

echo 📁 Diretório: %cd%
echo.

REM Parar containers
echo 🛑 Parando containers antigos...
docker-compose down
echo ✅ Containers parados
echo.

REM Entrar no diretório backend
cd backend

REM Recompilar backend
echo 🔨 Recompilando backend...

REM Tentar com Maven wrapper
if exist "mvnw.cmd" (
    echo 📦 Usando Maven Wrapper...
    call mvnw.cmd clean install -DskipTests
    if errorlevel 1 (
        echo ❌ Compilacao falhou!
        pause
        exit /b 1
    )
) else (
    where mvn >nul 2>nul
    if errorlevel 1 (
        echo ❌ Maven nao encontrado!
        echo Instale Maven e tente novamente
        pause
        exit /b 1
    )
    echo 📦 Usando Maven global...
    mvn clean install -DskipTests
    if errorlevel 1 (
        echo ❌ Compilacao falhou!
        pause
        exit /b 1
    )
)

echo ✅ Backend compilado com sucesso!
cd ..
echo.

REM Iniciar containers
echo 🚀 Iniciando FonoSystem...
docker-compose up -d

echo.
echo ================================
echo ✅ FonoSystem reiniciado!
echo ================================
echo.
echo Aguarde 30-60 segundos para o backend inicializar
echo Depois acesse: http://localhost:3000
echo.
echo Para ver os logs:
echo   docker-compose logs -f backend
echo.
pause
