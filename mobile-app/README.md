# 📱 KothaHobe! Mobile App (React Native & Expo)

KothaHobe! is a high-performance cross-platform mobile chat application built using **Expo (React Native)**, **TypeScript**, **Axios**, and **Socket.io**.

---

## 🚀 Quick Start (Development & Testing)

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **Expo Go App** installed on your Android/iOS phone (downloadable from Google Play Store / Apple App Store)

### 2. Install Dependencies
Navigate into the `mobile-app` directory and install packages:
```bash
cd mobile-app
npm install
```

### 3. Run Development Server
Start the Metro Bundler dev server:
```bash
npm start
```
- A QR code will appear in your terminal.
- Open **Expo Go** on your Android device and scan the QR code to run the app live on your physical device.

---

## ⚙️ Backend API Configuration

The app backend URL is managed inside `mobile-app/src/config.ts`:

```typescript
// Live Production Backend (Default)
export const API_URL = 'https://kothahobe-app.onrender.com';

// For testing with Local PC Backend on LAN:
// export const API_URL = 'http://<YOUR_LOCAL_IP>:5000';
```

---

## 📦 Building Standalone APK (Android)

You can build a downloadable `.apk` file using **EAS Cloud Build** (Expo Application Services) without straining your local computer hardware.

### 1. Run Cloud Build Command
```bash
cd mobile-app
npm run build:apk
```
*(Or directly: `npx eas-cli build --platform android --profile preview`)*

### 2. Expo Login / Account Setup
- If prompted, log in to your free Expo account (or create one at [expo.dev](https://expo.dev)).
- The Expo cloud servers will compile the APK for free.
- Once finished, a **direct download URL** for your `.apk` file will be printed in the terminal.

---

## ✨ Features Included

- 🔐 **Authentication**: User Login, Registration, and OTP Email Verification.
- 🔑 **OTP Debug Mode**: Exposes verification code directly in UI when enabled in backend.
- 🖼️ **Full Avatar Upload**: Register with profile pictures stored on Cloudinary.
- 💬 **Real-time Live Chat**: Powered by Socket.io for instant messaging.
- 📷 **Image Attachments**: Pick and send images in chat powered by Cloudinary.
- 📱 **Keyboard Avoidance & Responsive Design**: Smooth scrolling & input field visibility when the soft keyboard pops up.
