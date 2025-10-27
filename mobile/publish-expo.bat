@echo off
echo ========================================
echo 📦 Publier l'app sur Expo
echo ========================================
echo.

cd /d "C:\Users\mehau\Documents\Mehau\Code\chat-app\chat-db-mobile"

echo 📤 Publication de l'app sur Expo...
echo.
echo ✅ Apres publication :
echo    - Ton app sera accessible 24/7
echo    - Plus besoin de serveur local
echo    - Accessible via une URL permanente
echo    - Reste dans l'historique Expo Go
echo.

call eas update --branch production --message "Publication initiale"

echo.
echo ========================================
echo ✅ App publiee !
echo ========================================
echo.
echo 📱 Pour acceder :
echo    1. Ouvre Expo Go
echo    2. L'app est dans l'historique
echo    3. OU scan le QR code affiche ci-dessus
echo.
echo 🔄 Pour mettre a jour :
echo    Relance ce script apres modifications
echo.
pause
