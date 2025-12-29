# Firebase Integration Checklist

Use this checklist to track your Firebase setup progress.

---

## ☁️ Firebase Console Setup

### Project Creation
- [ ] Create Firebase project at https://console.firebase.google.com/
  - Project name: `SIT Logistics` (or your choice)
  - Enable Google Analytics: Recommended
  
### App Registration
- [ ] Register iOS app
  - Bundle ID: `com.sitlogistics.app`
  - Download `GoogleService-Info.plist`
  - Save to project root
  
- [ ] Register Android app
  - Package name: `com.sitlogistics.app`
  - Download `google-services.json`
  - Save to project root

### Enable Services
- [ ] Enable Firestore Database
  - Mode: Test mode initially
  - Region: Choose closest to users (e.g., `us-east1`)
  
- [ ] Enable Authentication
  - Provider: Email/Password
  - Allow sign-ups: Yes
  
- [ ] Get Web API credentials
  - Settings → Project settings → Your apps → Web
  - Copy `firebaseConfig` object

---

## 💻 Local Development Setup

### Environment Configuration
- [ ] Update `firebaseConfig.ts` with your credentials
  - Replace `apiKey`, `projectId`, etc.
  - Verify all 7 fields are updated
  
- [ ] Create `.env` file (optional)
  - Copy from `.env.example`
  - Add Firebase credentials
  - Add Google Maps API keys

### Firebase CLI
- [ ] Install Firebase CLI globally
  ```bash
  npm install -g firebase-tools
  ```
  
- [ ] Login to Firebase
  ```bash
  firebase login
  ```
  
- [ ] Initialize Firebase in project
  ```bash
  firebase init
  ```
  - Select: Firestore
  - Use existing project: Your Firebase project
  - Accept default file names

### Deploy Configuration
- [ ] Deploy Firestore security rules
  ```bash
  firebase deploy --only firestore:rules
  ```
  - Check for success message
  - Verify in Console → Firestore → Rules
  
- [ ] Deploy Firestore indexes
  ```bash
  firebase deploy --only firestore:indexes
  ```
  - Wait 5-10 minutes for indexes to build
  - Check status: Console → Firestore → Indexes
  - All indexes should show "Enabled" status

---

## 🌱 Database Initialization

### Seed Test Data
- [ ] Run seed script
  ```bash
  npx ts-node scripts/seedFirestore.ts
  ```
  
- [ ] Copy generated IDs from output
  - Organization ID: `____________________`
  - Fleet Manager ID: `____________________`
  - Driver ID (1st): `____________________`
  - Vehicle ID (1st): `____________________`
  - Trip ID (1st): `____________________`
  
- [ ] Verify data in Firebase Console
  - Go to Firestore → Data
  - Check `organizations` collection exists
  - Check `users` collection has 4 documents
  - Check `vehicles` collection has 3 documents
  - Check `trips` collection has 3 documents

### Create Test Users
- [ ] Set passwords for test accounts
  - Go to Authentication → Users
  - Click each user → Set password
  - Suggested password: `Test123!` (for development only)
  
- [ ] Test accounts created:
  - [ ] `manager@sitlogistics.com` (Fleet Manager)
  - [ ] `mike.j@sitlogistics.com` (Driver 1)
  - [ ] `emma.d@sitlogistics.com` (Driver 2)
  - [ ] `carlos.r@sitlogistics.com` (Driver 3)

---

## 🧪 Testing

### Basic Queries
- [ ] Test Firebase connection
  - Create test file with `fetchTrips()` call
  - Run: `npx ts-node test.ts`
  - Verify trips are returned
  
- [ ] Test authentication
  - Try logging in with test account
  - Check for auth token
  - Verify user profile fetched

### Real-Time Features
- [ ] Test vehicle tracking
  - Open app → Fleet → Live Map
  - Manually update vehicle location in Console
  - Verify map updates within 2 seconds
  
- [ ] Test notifications
  - Create notification in Console
  - Check it appears in app Inbox
  - Mark as read, verify in Console

### Security Rules
- [ ] Test unauthorized access
  - Try fetching another org's data
  - Should get "insufficient permissions" error
  
- [ ] Test driver permissions
  - Driver should only see assigned trips
  - Driver cannot delete trips
  - Driver can update trip status

---

## 🔄 Migration to Firebase

### Update Screen Components
- [ ] Driver Home screen
  - Replace `mockApi.fetchTrips()` with `fetchTrips(orgId)`
  - Test: Assigned trips appear
  
- [ ] Driver Trips screen
  - Use `fetchTrips(orgId, undefined, driverId)`
  - Test: Only driver's trips shown
  
- [ ] Driver Tracking screen
  - Implement `subscribeToVehicles()` real-time listener
  - Test: Vehicle position updates live
  
- [ ] Fleet Dashboard screen
  - Use `fetchTrips(orgId)`, `fetchVehicles(orgId)`
  - Calculate KPIs from real data
  
- [ ] Fleet Live Map screen
  - Implement `subscribeToVehicles(orgId, callback)`
  - Test: All vehicles appear and update
  
- [ ] Fleet Trips screen
  - Use `fetchTrips(orgId)` with filtering
  - Test: Search and filters work
  
- [ ] Fleet Fleet screen
  - Use `fetchVehicles(orgId)`
  - Add vehicle CRUD operations
  
- [ ] Fleet Billing screen
  - Use `fetchInvoices(orgId)`
  - Implement invoice creation

### Update GPS Simulator
- [ ] Integrate `updateVehicleLocation()`
  - Call in simulation loop
  - Write to Firestore on each update
  - Test: Location history created

### Update Offline Queue
- [ ] Implement `addToOfflineQueue()`
  - Queue actions when offline
  - Test: Actions saved locally
  
- [ ] Implement queue processing
  - Sync when back online
  - Mark items as processed
  - Test: Pending actions sync

---

## 🚀 Production Readiness

### Security Hardening
- [ ] Review security rules
  - No `allow read, write: if true;` rules
  - All collections protected
  - Field-level permissions correct
  
- [ ] Change Firestore mode to "Production"
  - Console → Firestore → Rules
  - Remove test mode expiration
  
- [ ] Enable App Check (optional)
  - Protects against abuse
  - See Firebase docs

### Performance Optimization
- [ ] Verify all indexes deployed
  - Check for "Index not ready" errors in logs
  - Create any missing indexes
  
- [ ] Implement pagination
  - Use `limit()` and `startAfter()` for large lists
  - Add "Load More" buttons
  
- [ ] Enable offline persistence
  - Add `enableIndexedDbPersistence(db)` to config
  - Test: App works offline

### Monitoring & Analytics
- [ ] Set up Firebase Analytics
  - Log key events (trip_created, trip_completed)
  - Track user flows
  
- [ ] Enable Performance Monitoring
  - Add Firebase Performance SDK
  - Monitor query times
  
- [ ] Set up Crashlytics (optional)
  - Catch and report crashes
  - Track app stability

---

## 📱 App Store Deployment

### Build Configuration
- [ ] Update `app.config.js`
  - Set `googleServicesFile` paths
  - Add Google Maps API keys
  - Set correct bundle IDs
  
- [ ] Configure EAS Build
  - Run `eas build:configure`
  - Set up production profile
  - Add environment variables

### Build & Submit
- [ ] Build iOS app
  ```bash
  eas build --platform ios --profile production
  ```
  
- [ ] Build Android app
  ```bash
  eas build --platform android --profile production
  ```
  
- [ ] Submit to App Store
  ```bash
  eas submit --platform ios
  ```
  
- [ ] Submit to Play Store
  ```bash
  eas submit --platform android
  ```

---

## 🔮 Optional Enhancements

### Cloud Functions
- [ ] Set up Cloud Functions project
  - `firebase init functions`
  - Choose TypeScript
  
- [ ] Create auto-invoice function
  - Trigger on trip completion
  - Generate invoice automatically
  
- [ ] Create notification function
  - Send push when trip assigned
  - Send reminder for maintenance

### Cloud Storage
- [ ] Enable Cloud Storage
  - For POD (Proof of Delivery) photos
  - Set storage rules
  
- [ ] Implement photo upload
  - Camera integration
  - Compress before upload
  - Save URL to trip metadata

### Push Notifications
- [ ] Enable Firebase Cloud Messaging
  - Get FCM server key
  - Configure Android/iOS
  
- [ ] Implement notification handler
  - Listen for FCM messages
  - Show local notifications
  - Handle notification taps

---

## ✅ Final Verification

### Pre-Launch Checklist
- [ ] All screens load without errors
- [ ] Real-time updates work consistently
- [ ] Offline mode queues and syncs properly
- [ ] Authentication flow is smooth
- [ ] Security rules prevent unauthorized access
- [ ] All indexes show "Enabled" status
- [ ] App performs well (< 2s load times)
- [ ] No console errors or warnings
- [ ] GPS tracking displays correctly
- [ ] Invoices generate and display properly

### Documentation Review
- [ ] README.md updated with Firebase info
- [ ] Team trained on Firebase console
- [ ] Runbook created for common issues
- [ ] Backup/restore procedures documented

---

## 📊 Progress Tracker

**Overall Progress:** `___/100` tasks completed

### By Category:
- Firebase Console: `___/10` ☁️
- Local Development: `___/7` 💻
- Database Init: `___/6` 🌱
- Testing: `___/8` 🧪
- Migration: `___/10` 🔄
- Production: `___/9` 🚀
- Deployment: `___/6` 📱
- Optional: `___/9` 🔮
- Final: `___/10` ✅

---

## 📅 Timeline Estimate

- **Day 1**: Firebase Console Setup + Local Config (2-3 hours)
- **Day 2**: Database Init + Basic Testing (2-3 hours)
- **Day 3-4**: Screen Migration (6-8 hours)
- **Day 5**: Testing + Bug Fixes (4-6 hours)
- **Day 6**: Production Hardening (3-4 hours)
- **Day 7**: Build & Deploy (2-3 hours)

**Total:** ~5-7 days for complete migration

---

## 🎯 Next Immediate Steps

1. [ ] Create Firebase project in console (10 min)
2. [ ] Update `firebaseConfig.ts` (5 min)
3. [ ] Deploy rules and indexes (5 min)
4. [ ] Run seed script (2 min)
5. [ ] Test basic query (5 min)

**Start here:** `docs/QUICKSTART.md` →
