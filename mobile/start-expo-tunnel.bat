@echo off
echo ========================================
echo 🚀 Lancer Expo avec Tunnel Permanent
echo ========================================
echo.

cd /d "C:\Users\mehau\Documents\Mehau\Code\chat-app\chat-db-mobile"

echo 📡 Demarrage du serveur Expo avec tunnel...
echo.
echo ✅ Une fois lance :
echo    1. Ouvre Expo Go sur ton iPhone
echo    2. Scan le QR code
echo    3. L'app restera dans l'historique d'Expo Go
echo    4. Tu peux la relancer sans rescanner
echo.
echo 💡 Laisse ce terminal ouvert en arriere-plan
echo    pour garder l'acces a ton app
echo.

npx expo start --tunnel

pause
