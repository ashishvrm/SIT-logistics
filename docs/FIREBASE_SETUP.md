# Firebase Integration Setup

Complete guide to set up Firebase backend for SIT Logistics mobile app.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Firebase Console Setup](#firebase-console-setup)
3. [Local Configuration](#local-configuration)
4. [Database Initialization](#database-initialization)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This app uses Firebase for:
- **Firestore Database**: Real-time NoSQL database for trips, vehicles, users
- **Firebase Authentication**: Secure user login/logout
- **Cloud Storage** (future): Document uploads (POD photos)
- **Cloud Functions** (future): Automated workflows

### Architecture
```
┌─────────────────┐
│  React Native   │
│   Mobile App    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ firebaseService │ ← Service Layer
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Firestore DB  │ ← Backend
│   (NoSQL)       │
└─────────────────┘
```

---

## 🔧 Firebase Console Setup

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `SIT Logistics`
4. Enable Google Analytics (recommended)
5. Click **"Create project"**

### Step 2: Add iOS App

1. In Project Overview, click **iOS icon**
2. Enter Bundle ID: `com.sitlogistics.app`
3. Download `GoogleService-Info.plist`
4. Save to project root: `/Users/opr1004/Desktop/Dev/SIT-Logistics/GoogleService-Info.plist`
5. Click "Next" through remaining steps

### Step 3: Add Android App

1. In Project Overview, click **Android icon**
2. Enter Package name: `com.sitlogistics.app`
3. Download `google-services.json`
4. Save to project root: `/Users/opr1004/Desktop/Dev/SIT-Logistics/google-services.json`
5. Click "Next" through remaining steps

### Step 4: Enable Firestore Database

1. In Firebase Console sidebar, click **"Firestore Database"**
2. Click **"Create database"**
3. Choose **"Start in test mode"** (we'll add security rules later)
4. Select region closest to your users (e.g., `us-east1`)
5. Click **"Enable"**

### Step 5: Enable Authentication

1. In Firebase Console sidebar, click **"Authentication"**
2. Click **"Get started"**
3. Enable **"Email/Password"** sign-in method
4. Click **"Save"**

### Step 6: Get Web API Configuration

1. In Project Overview, click **Settings (gear icon)** → **"Project settings"**
2. Scroll to **"Your apps"** section
3. Click **"Web"** icon to add a web app
4. Register app name: `SIT Logistics Web`
5. Copy the `firebaseConfig` object
6. Update `firebaseConfig.ts` with these values:

```typescript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

---

## 💻 Local Configuration

### Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Firebase in Project

```bash
cd /Users/opr1004/Desktop/Dev/SIT-Logistics
firebase init
```

Select:
- ✅ Firestore
- ✅ Functions (optional, for future automation)

When prompted:
- **Firestore rules file**: Accept default `firestore.rules`
- **Firestore indexes file**: Accept default `firestore.indexes.json`
- **Functions language**: TypeScript (if enabling Functions)

### Step 3: Update firebaseConfig.ts

Replace the config in `/Users/opr1004/Desktop/Dev/SIT-Logistics/firebaseConfig.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
```

### Step 4: Deploy Security Rules

The security rules are already defined in `firestore.rules`. Deploy them:

```bash
firebase deploy --only firestore:rules
```

**Expected output:**
```
✔  Deploy complete!
Firestore rules deployed successfully
```

### Step 5: Deploy Firestore Indexes

Indexes are defined in `firestore.indexes.json`. Deploy them:

```bash
firebase deploy --only firestore:indexes
```

**Note**: Index creation can take 5-10 minutes. Check status in Firebase Console → Firestore Database → Indexes tab.

---

## 🌱 Database Initialization

### Option 1: Run Seed Script (Recommended)

Populate the database with test data:

```bash
npx ts-node scripts/seedFirestore.ts
```

**What it creates:**
- 1 Organization (SIT Logistics)
- 1 Branch (Main Depot)
- 1 Fleet Manager
- 3 Drivers
- 3 Vehicles (1 in use, 2 available)
- 3 Trips (InTransit, Pending, Delivered)
- 3 Invoices
- 3 Notifications

**Save the generated IDs** printed at the end - you'll need them for testing!

### Option 2: Manual Creation via Firebase Console

1. Go to Firestore Database in Firebase Console
2. Click **"Start collection"**
3. Create collections following the structure in `docs/DATABASE_STRUCTURE.md`

---

## 🧪 Testing

### Test Authentication

```bash
# In Expo dev tools or app
# Use credentials:
Email: manager@sitlogistics.com
Password: (set in Firebase Console → Authentication → Users)
```

### Test Firestore Queries

Create a test file:

```typescript
// test/firebaseTest.ts
import { fetchTrips, fetchVehicles } from '../src/services/firebaseService';

async function testFirebase() {
  const orgId = 'YOUR_ORG_ID_FROM_SEED'; // Replace with actual ID
  
  console.log('Testing fetchTrips...');
  const trips = await fetchTrips(orgId);
  console.log('Trips:', trips.length);
  
  console.log('Testing fetchVehicles...');
  const vehicles = await fetchVehicles(orgId);
  console.log('Vehicles:', vehicles.length);
}

testFirebase();
```

Run:
```bash
npx ts-node test/firebaseTest.ts
```

### Test Real-Time Updates

1. Open the app in Expo Go
2. Navigate to Fleet → Live Map
3. In Firebase Console, manually update a vehicle's `lat` or `lng`
4. The map should update within 1-2 seconds

### Verify Security Rules

Try accessing data without authentication:

```typescript
// Should fail with "Missing or insufficient permissions"
const trips = await fetchTrips('some-org-id');
```

---

## 🚀 Deployment

### Deploy All Firebase Resources

```bash
# Deploy everything
firebase deploy

# Or deploy individually:
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only functions  # if using Cloud Functions
```

### Build Mobile App with Firebase

Update `app.config.js` with your actual Firebase config files:

```javascript
export default {
  expo: {
    // ... existing config
    ios: {
      googleServicesFile: "./GoogleService-Info.plist"
    },
    android: {
      googleServicesFile: "./google-services.json"
    }
  }
};
```

Build for production:

```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

---

## 🔍 Troubleshooting

### Issue: "Firebase: Error (auth/network-request-failed)"
**Solution**: Check internet connection, verify Firebase project is active

### Issue: "Missing or insufficient permissions"
**Solution**: 
1. Check user is authenticated: `firebase.auth().currentUser`
2. Verify security rules are deployed: `firebase deploy --only firestore:rules`
3. Ensure user's `orgId` matches document's `orgId`

### Issue: "Index not ready" error
**Solution**: 
1. Check Firebase Console → Firestore → Indexes tab
2. Wait for index status to change from "Building" to "Enabled"
3. Usually takes 5-10 minutes

### Issue: Queries are slow (> 2 seconds)
**Solution**:
1. Add composite indexes (check console for error message with index URL)
2. Implement pagination using `limit()` and `startAfter()`
3. Denormalize data to avoid multiple reads

### Issue: Real-time listeners not updating
**Solution**:
1. Check `onSnapshot` is properly set up with cleanup
2. Verify network connectivity
3. Check Firestore quota limits (free tier: 50K reads/day)

### Issue: Expo app crashes on launch after Firebase integration
**Solution**:
1. Clear Metro bundler cache: `npx expo start -c`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check for version conflicts in `package.json`

### Issue: "No Firebase App '[DEFAULT]' has been created"
**Solution**: Ensure `firebaseConfig.ts` is imported before any Firebase service:
```typescript
// App.tsx
import './firebaseConfig'; // Import this first
import { fetchTrips } from './services/firebaseService';
```

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling Best Practices](https://firebase.google.com/docs/firestore/best-practices)
- [Firebase Security Rules Guide](https://firebase.google.com/docs/rules)
- [Expo Firebase Integration](https://docs.expo.dev/guides/using-firebase/)

---

## 📞 Support

For Firebase-specific issues:
- Firebase Status: https://status.firebase.google.com/
- Stack Overflow: Tag `firebase` + `react-native`
- Firebase Community: https://firebase.google.com/community

For project-specific issues:
- Check `docs/DATABASE_STRUCTURE.md`
- Check `docs/MIGRATION_GUIDE.md`
- Review Firestore rules in `firestore.rules`

---

## ✅ Setup Checklist

- [ ] Firebase project created
- [ ] iOS app registered, `GoogleService-Info.plist` downloaded
- [ ] Android app registered, `google-services.json` downloaded
- [ ] Firestore database enabled
- [ ] Authentication enabled (Email/Password)
- [ ] `firebaseConfig.ts` updated with correct credentials
- [ ] Firebase CLI installed (`firebase --version`)
- [ ] Firebase initialized in project (`firebase init`)
- [ ] Security rules deployed (`firebase deploy --only firestore:rules`)
- [ ] Indexes deployed (`firebase deploy --only firestore:indexes`)
- [ ] Database seeded (`npx ts-node scripts/seedFirestore.ts`)
- [ ] Test queries run successfully
- [ ] Real-time listeners working
- [ ] Authentication flow tested
- [ ] Security rules verified

Once all items are checked, your Firebase backend is ready! 🎉
