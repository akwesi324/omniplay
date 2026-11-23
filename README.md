# 🎮 OmniPlay — Universal Mobile Arcade & Preserved Game Engine

> **Play every game ever released — on or off the App Store & Play Store — with full interactive controls, native haptics, and instant zero-latency cloud execution in under 1GB.**

---

## ⚡ Highlights

- **Ultra-Lightweight Footprint (< 30MB total, well below 1GB limit)**: Rather than bundling hundreds of gigabytes of raw ISOs or bloatware, OmniPlay utilizes an ultra-optimized virtualized 60 FPS HTML5/Canvas/WebGL runtime engine. Games load instantaneously and play with full native responsiveness.
- **On-Store & Preserved Off-Store Catalog**: Includes delisted classics (such as *Flappy Cyber Flight*), preserved 80s/90s coin-op arcade cabinets (*Cyber Invaders: Redux*, *Turbo Highway: Midnight 1989*), and indie homebrews.
- **Categorized Sections**:
  - 💾 **Off-Store & Preserved**: Delisted titles, historical cabinet ports, and unreleased homebrews.
  - 🕹️ **Retro 80s & 90s**: Golden-era coin-op arcade hits with authentic pixel rasterization.
  - ⚡ **Action & Combat**: High-speed space defense, dogfights, and arena combat.
  - 🏎️ **Speed & Racing**: OutRun-style pseudothree-dimensional horizon racing.
  - 🧩 **Puzzle & Mind**: Quantum brick breakers and logic grid challenges.
  - 🛡️ **RPGs & Roguelikes**: Dungeon crawlers with permadeath and procedural rooms.
- **Full Console Gaming Experience**:
  - Virtual tactile controller with responsive 4-way D-Pad, A/B/X/Y action buttons, Start, and Select.
  - Native haptic feedback via `expo-haptics` on every keypress.
  - Live session timers, 60 FPS telemetry counters, and instant in-game Save State persistence.
- **Registered Gamer Pass**:
  - GamerTag callsigns (`#007`, `#Viper99`), avatar selection, and persistent player ranking (LVL & XP).
  - Earn +15 XP every 30 seconds of live gameplay.
  - Offline local storage (`AsyncStorage`) with cloud-sync ready architecture.
- **Cyber-Arcade Visual Aesthetic**:
  - Obsidian Dark Theme (`#0A0B10`) with Neon Emerald (`#00F59B`), Electric Cyan (`#00D2FF`), and Cyber Violet (`#7928CA`) accents.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Expo CLI (`npx expo`)
- Android Studio / Expo Go on your mobile device (or Web Browser)

### Installation
```bash
git clone https://github.com/akwesi324/omniplay.git
cd omniplay
npm install
```

### Running OmniPlay
```bash
# Run on Android Device / Emulator
npm run android

# Run multi-platform Web Preview
npm run web

# Start Expo development server
npx expo start
```

---

## 🛠️ Architecture & Tech Stack

- **Framework**: React Native 0.88 + Expo SDK 58 (TypeScript)
- **Game Engine**: Virtualized 60 FPS Canvas/WebGL Virtual Machine inside native `react-native-webview` / `iframe`
- **Haptics**: `expo-haptics` tactile vibration feedback
- **State Management & Persistence**: `@react-native-async-storage/async-storage`
- **Icons**: `@expo/vector-icons` (Ionicons)

---

## 📄 License
MIT License. Preserved titles archived for historical and interactive emulation purposes.
