@echo off
echo ========================================
echo 📱 Build APK - Chat App Native
echo ========================================
echo.

cd /d "C:\Users\mehau\Documents\Mehau\Code\chat-app\chat-db-mobile"

echo 🔧 Verification EAS CLI...
call npm list -g eas-cli >nul 2>&1
if errorlevel 1 (
    echo ⚙️ Installation EAS CLI...
    call npm install -g eas-cli
)

echo.
echo 🏗️ Lancement du build APK...
echo.
echo Options disponibles :
echo 1. Build Preview APK (recommande - installation directe)
echo 2. Build Production AAB (Google Play Store)
echo 3. Build Development (avec hot reload)
echo.

set /p choice="Choisir une option (1/2/3) : "

if "%choice%"=="1" (
    echo.
    echo 📦 Build Preview APK en cours...
    call eas build --platform android --profile preview
) else if "%choice%"=="2" (
    echo.
    echo 📦 Build Production AAB en cours...
    call eas build --platform android --profile production
) else if "%choice%"=="3" (
    echo.
    echo 📦 Build Development en cours...
    call eas build --platform android --profile development
) else (
    echo Choix invalide !
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ Build termine !
echo ========================================
echo.
echo 📧 Verifie ton email pour le lien de telechargement
echo 📲 Telecharge l'APK sur ton telephone
echo ⚙️ Autorise les sources inconnues
echo 🎉 Installe et profite de ton app !
echo.
pause
