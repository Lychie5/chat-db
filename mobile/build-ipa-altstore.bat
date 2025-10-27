@echo off
echo ========================================
echo 🍎 Build IPA pour AltStore
echo ========================================
echo.

cd /d "C:\Users\mehau\Documents\Mehau\Code\chat-app\chat-db-mobile"

echo ⚡ Build IPA en cours (avec Apple ID gratuit)...
echo.
echo 📝 Tu devras fournir :
echo    - Ton Apple ID (mehau5lucas@gmail.com)
echo    - Ton mot de passe
echo    - Selectionner "Personal Team" (gratuit)
echo.
pause

call eas build --platform ios --profile altstore

echo.
echo ========================================
echo ✅ Build termine !
echo ========================================
echo.
echo 📥 Telecharge ton IPA sur :
echo    https://expo.dev/accounts/mehau/projects/chat-app/builds
echo.
echo 📲 Pour installer avec AltStore :
echo    1. Envoie le .ipa sur ton iPhone (AirDrop/iCloud)
echo    2. Ouvre AltStore
echo    3. My Apps -^> +
echo    4. Selectionne le fichier .ipa
echo    5. 🎉 App installee !
echo.
echo 💡 L'app doit etre re-signee tous les 7 jours avec AltStore
echo.
pause
