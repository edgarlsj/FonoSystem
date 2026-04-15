@REM Maven Wrapper para Windows
@REM Executa o Maven instalado pelo wrapper

@echo off
setlocal
set MAVEN_VERSION=3.9.6
set WRAPPER_JAR="%~dp0.mvn\wrapper\maven-wrapper.jar"
set WRAPPER_PROPERTIES="%~dp0.mvn\wrapper\maven-wrapper.properties"

for /f "usebackq tokens=1,2 delims==" %%a in (%WRAPPER_PROPERTIES%) do (
    if "%%a"=="distributionUrl" set DISTRIBUTION_URL=%%b
)

"%JAVA_HOME%\bin\java.exe" -jar %WRAPPER_JAR% %*
if "%JAVA_HOME%"=="" (
    java -jar %WRAPPER_JAR% %*
)
