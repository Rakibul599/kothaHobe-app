# 💬 KothaHobe! Application Ecosystem

KothaHobe! is a full-stack real-time communication platform built with Node.js, Express, MongoDB, Socket.io, React (Vite Web), and React Native (Expo Mobile).

---

## 📁 Repository Structure

```
kothaHobe-app/
├── back-end/      # Node.js, Express, MongoDB API Server & Socket.io
├── front-end/     # React (Vite) + TailwindCSS Web Client
└── mobile-app/    # React Native (Expo) Android/iOS Mobile App
```

---

## 🚀 Mobile App Build & Run Instructions

### Run Mobile App (Expo Go)
```bash
cd mobile-app
npm start
```
*Scan the generated QR code using the Expo Go app on your phone.*

### Build Standalone Android APK
```bash
cd mobile-app
npm run build:apk
```
*Creates a downloadable `.apk` file using Expo Cloud Build.*

For complete mobile app details, see [mobile-app/README.md](./mobile-app/README.md).
