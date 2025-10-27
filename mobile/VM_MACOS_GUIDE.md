# 🖥️ Guide VM macOS pour builder iOS

## Partie 1 : Installation VM macOS

### Option A : VMware Workstation (Recommandé)

**Avantages** :
- Meilleure performance
- Support GPU
- Facile à configurer

**Étapes** :

1. **Télécharger VMware Workstation**
   - https://www.vmware.com/products/workstation-player.html
   - Version gratuite : Workstation Player

2. **Télécharger macOS Sonoma/Ventura ISO**
   - Via Techrechard : https://techrechard.com/download-macos-sonoma-iso/
   - Ou via Olarila : https://www.olarila.com/

3. **Installer VMware Tools pour macOS**
   - Télécharge : https://github.com/paolo-projects/unlocker
   - Lance `win-install.cmd` en tant qu'administrateur
   - Redémarre ton PC

4. **Créer la VM**
   ```
   - OS : macOS 14 (ou 13)
   - RAM : 16GB minimum (32GB recommandé)
   - CPU : 4 cœurs minimum (8 recommandé)
   - Disque : 100GB
   - GPU : 2GB VRAM
   ```

5. **Modifier le fichier .vmx**
   Ouvre le fichier `.vmx` de ta VM et ajoute :
   ```
   smc.version = "0"
   cpuid.0.eax = "0000:0000:0000:0000:0000:0000:0000:1011"
   cpuid.0.ebx = "0111:0101:0110:1110:0110:0101:0100:0111"
   cpuid.0.ecx = "0110:1100:0110:0101:0111:0100:0110:1110"
   cpuid.0.edx = "0100:1001:0110:0101:0110:1110:0110:1001"
   cpuid.1.eax = "0000:0000:0000:0001:0000:0110:0111:0001"
   cpuid.1.ebx = "0000:0010:0000:0001:0000:1000:0000:0000"
   cpuid.1.ecx = "1000:0010:1001:1000:0010:0010:0000:0011"
   cpuid.1.edx = "0000:0111:1000:1011:1111:1011:1111:1111"
   board-id = "Mac-27AD2F918AE68F61"
   hw.model = "MacBookPro15,1"
   serialNumber = "C02XG1FDH7JY"
   smbios.reflectHost = "TRUE"
   ```

### Option B : VirtualBox (Gratuit mais plus lent)

**Étapes** :
1. Télécharge VirtualBox : https://www.virtualbox.org/
2. Télécharge macOS ISO
3. Utilise ce script : https://github.com/myspaghetti/macos-virtualbox

---

## Partie 2 : Installation Xcode

Une fois macOS installé dans la VM :

1. **Ouvrir App Store**
2. **Chercher "Xcode"**
3. **Installer** (gratuit, ~15GB, ~1h de téléchargement)
4. **Lancer Xcode** une fois pour accepter les licences
5. **Installer Command Line Tools** :
   ```bash
   xcode-select --install
   ```

---

## Partie 3 : Build iOS localement

### 1. Installer Node.js sur macOS
```bash
# Via Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
```

### 2. Cloner ton projet
```bash
git clone https://github.com/Lychie5/chat-db.git
cd chat-db/chat-db-mobile
npm install
```

### 3. Installer CocoaPods
```bash
sudo gem install cocoapods
cd ios
pod install
```

### 4. Builder avec Expo
```bash
npx expo run:ios
```

**OU**

### 5. Builder avec EAS localement
```bash
npm install -g eas-cli
eas login
eas build --platform ios --local
```

---

## Partie 4 : Signer pour AltStore

### Option A : Via Xcode (le plus simple)

1. **Ouvrir le projet dans Xcode**
   ```bash
   cd ios
   open chat-app.xcworkspace
   ```

2. **Configurer le compte**
   - Xcode → Preferences → Accounts
   - Ajouter ton Apple ID (gratuit)
   - Sélectionner "Personal Team"

3. **Configurer la signature**
   - Sélectionner ton projet
   - Signing & Capabilities
   - Cocher "Automatically manage signing"
   - Team : Sélectionner ton Personal Team

4. **Builder**
   - Product → Archive
   - Window → Organizer
   - Distribute App → Ad Hoc → Export
   - Tu obtiens le fichier `.ipa`

### Option B : Via ligne de commande

```bash
# Builder
xcodebuild -workspace ios/chat-app.xcworkspace \
  -scheme chat-app \
  -configuration Release \
  -archivePath build/chat-app.xcarchive \
  archive

# Exporter l'IPA
xcodebuild -exportArchive \
  -archivePath build/chat-app.xcarchive \
  -exportPath build/ \
  -exportOptionsPlist ExportOptions.plist
```

---

## Partie 5 : Installer sur iPhone avec AltStore

1. **Transférer l'IPA** depuis la VM vers Windows
   - Via dossier partagé VMware
   - Via USB
   - Via cloud (Dropbox, Google Drive)

2. **Envoyer sur iPhone**
   - AirDrop (si WiFi configuré sur VM)
   - iCloud Drive
   - Email

3. **Installer avec AltStore**
   - Ouvre AltStore sur iPhone
   - My Apps → +
   - Sélectionner l'IPA
   - ✅ Installé !

---

## 🚀 Alternative plus simple : Utiliser EAS Build local

Si la VM est trop lente, utilise EAS Build en mode local :

```bash
# Sur macOS (VM)
cd chat-db-mobile
eas build --platform ios --local --profile altstore
```

Cela va :
- Builder localement sur ta VM
- Utiliser ton Apple ID gratuit
- Générer l'IPA automatiquement
- Pas besoin de manipuler Xcode manuellement

---

## 💡 Recommandations

**Configuration VM optimale** :
- RAM : 24-32GB (Windows + macOS)
- CPU : 8 cœurs physiques
- SSD : Obligatoire
- GPU : Dédié si possible

**Temps estimés** :
- Installation VM macOS : 2-3h
- Installation Xcode : 1-2h
- Premier build iOS : 20-30 min
- Builds suivants : 5-10 min

**Alternative rapide** :
Si ta machine n'est pas assez puissante, utilise :
- ✅ Expo Go (gratuit, instantané)
- ✅ Louer un Mac cloud (~$1/heure) sur MacStadium ou MacinCloud

---

## 🆘 Problèmes courants

### VM trop lente
- Augmente la RAM à 24GB+
- Désactive Hyper-V sur Windows
- Active la virtualisation dans le BIOS

### Xcode ne démarre pas
- Vérifie que tu as au moins 20GB libres
- Lance depuis le terminal : `sudo xcodebuild -license accept`

### Build échoue
- Vérifie que CocoaPods est installé
- Nettoie : `cd ios && rm -rf Pods Podfile.lock && pod install`

---

Tu veux que je t'aide avec l'installation de la VM macOS ? 🖥️
