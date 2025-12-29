# Quick Start: Firebase Backend

**5-minute guide to get Firebase running locally**

---

## Prerequisites

- Node.js 18+ installed
- Firebase account (free tier OK)
- Expo Go app on phone (optional)

---

## Step 1: Firebase Console (3 minutes)

1. Go to https://console.firebase.google.com/
2. Click **"Add project"** → Name it `SIT Logistics` → Create
3. Click **Firestore Database** → **Create database** → **Test mode** → Select region → Enable
4. Click **Authentication** → **Get started** → Enable **Email/Password** → Save
5. Click **Settings (gear)** → **Project settings** → Scroll to **"Your apps"** → Click **Web icon**
6. Register app → Copy the `firebaseConfig` object

---

## Step 2: Update Local Config (1 minute)

Edit `firebaseConfig.ts`:

```typescript
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
```

Save the file.

---

## Step 3: Deploy Rules & Indexes (1 minute)

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
cd /Users/opr1004/Desktop/Dev/SIT-Logistics
firebase init

# Select: Firestore
# Use existing project: Select "SIT Logistics"
# Use default files: firestore.rules, firestore.indexes.json

# Deploy
firebase deploy --only firestore:rules,firestore:indexes
```

**Wait 2-3 minutes for indexes to build** (check Firebase Console → Firestore → Indexes tab)

---

## Step 4: Seed Database (30 seconds)

```bash
# From project root
npx ts-node scripts/seedFirestore.ts
```

**Copy the printed Organization ID** - you'll need it!

Example output:
```
Organization ID: abc123xyz
Driver ID: driver789
Vehicle ID: vehicle456
```

---

## Step 5: Test It! (30 seconds)

Create `test.ts`:

```typescript
import { fetchTrips, fetchVehicles } from './src/services/firebaseService';

async function test() {
  const orgId = 'YOUR_ORG_ID_HERE'; // From Step 4
  
  console.log('Fetching trips...');
  const trips = await fetchTrips(orgId);
  console.log(`✅ Found ${trips.length} trips`);
  
  console.log('Fetching vehicles...');
  const vehicles = await fetchVehicles(orgId);
  console.log(`✅ Found ${vehicles.length} vehicles`);
}

test();
```

Run:
```bash
npx ts-node test.ts
```

Expected output:
```
✅ Found 3 trips
✅ Found 3 vehicles
```

---

## ✅ You're Done!

Firebase is now connected and working. 

### Next Steps:

1. **Update a screen** to use Firebase:
   ```typescript
   // Before
   import { mockApi } from '../services/mockApi';
   
   // After
   import { fetchTrips } from '../services/firebaseService';
   ```

2. **Run the app**:
   ```bash
   npm start
   ```

3. **See real data** instead of mock data!

---

## 🔥 Hot Tips

### Real-Time Updates
Use subscriptions for live data:
```typescript
import { subscribeToVehicles } from '../services/firebaseService';

useEffect(() => {
  const unsubscribe = subscribeToVehicles(orgId, (vehicles) => {
    console.log('Vehicles updated!', vehicles);
  });
  return () => unsubscribe();
}, [orgId]);
```

### Add More Data
Modify `scripts/seedFirestore.ts` to add more:
- Vehicles
- Drivers  
- Trips
- Invoices

Then re-run: `npx ts-node scripts/seedFirestore.ts`

### View Data in Console
Firebase Console → Firestore Database → Browse collections

---

## 🐛 Troubleshooting

**"Missing or insufficient permissions"**
→ Run: `firebase deploy --only firestore:rules`

**"Index not ready"**
→ Wait 5-10 minutes, check Firebase Console → Indexes

**"Firebase: Error (auth/network-request-failed)"**
→ Check internet connection, verify project ID in `firebaseConfig.ts`

**No data returned**
→ Verify orgId from seed script output
→ Check Firebase Console to see if data exists

---

## 📚 More Info

- **Full setup**: `docs/FIREBASE_SETUP.md`
- **Database structure**: `docs/DATABASE_STRUCTURE.md`
- **Migration guide**: `docs/MIGRATION_GUIDE.md`
- **Summary**: `docs/FIREBASE_INTEGRATION_SUMMARY.md`

---

## 🎉 That's It!

You now have:
- ✅ Firebase project configured
- ✅ Database with test data
- ✅ Security rules deployed
- ✅ Indexes built
- ✅ Service layer ready to use

Start building! 🚀
