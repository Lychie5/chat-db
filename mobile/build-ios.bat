@echo off
echo ========================================
echo 🍎 Build iOS - Chat App Native
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
echo ⚠️ IMPORTANT - Prerequis pour iOS :
echo 1. Compte Apple ID (gratuit sur https://appleid.apple.com)
echo 2. Pas besoin de Mac, EAS build dans le cloud !
echo 3. Pas besoin de $99/an pour un build de test
echo.
pause

echo.
echo 🏗️ Lancement du build iOS...
echo.
echo Options disponibles :
echo 1. Build Simulator (pour Mac uniquement)
echo 2. Build Preview (installation via TestFlight)
echo 3. Build Development (avec hot reload)
echo.

set /p choice="Choisir une option (1/2/3) : "

if "%choice%"=="1" (
    echo.
    echo 📦 Build Simulator en cours...
    call eas build --platform ios --profile preview --simulator
) else if "%choice%"=="2" (
    echo.
    echo 📦 Build Preview pour TestFlight...
    echo.
    echo 📝 Tu devras fournir :
    echo    - Ton Apple ID
    echo    - EAS creera automatiquement les certificats
    echo.
    call eas build --platform ios --profile preview
) else if "%choice%"=="3" (
    echo.
    echo 📦 Build Development en cours...
    call eas build --platform ios --profile development
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
echo 📲 Installe TestFlight sur ton iPhone
echo 🔗 Clique sur le lien recu par email
echo 🎉 Installe l'app via TestFlight !
echo.
echo 💡 Alternative : Utilise Expo Go pour tester rapidement
echo    sans attendre le build (scanner QR code)
echo.
pause
