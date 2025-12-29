# Migration Guide: Mock API → Firebase

## Overview
This guide walks through migrating from `mockApi.ts` to `firebaseService.ts` for production-ready backend.

---

## Prerequisites

1. ✅ Firebase project created
2. ✅ Firestore database provisioned
3. ✅ Firebase config files added:
   - `google-services.json` (Android)
   - `GoogleService-Info.plist` (iOS)
4. ✅ Firebase packages installed:
   - `@react-native-firebase/app`
   - `@react-native-firebase/firestore`
   - `@react-native-firebase/auth`
5. ✅ `firebaseConfig.ts` created
6. ✅ `firebaseService.ts` created

---

## Migration Steps

### Step 1: Deploy Firestore Security Rules

1. Go to Firebase Console → Firestore Database → Rules
2. Copy the security rules from `docs/DATABASE_STRUCTURE.md`
3. Publish the rules

### Step 2: Create Firestore Indexes

1. Go to Firebase Console → Firestore Database → Indexes
2. Create composite indexes as documented in `DATABASE_STRUCTURE.md`:
   - `users`: (orgId, role)
   - `vehicles`: (orgId, status)
   - `trips`: (orgId, startTime DESC)
   - `trips`: (driverId, status, startTime DESC)
   - `notifications`: (userId, createdAt DESC)
   - `notifications`: (userId, read, createdAt DESC)

Or use Firebase CLI:
```bash
firebase deploy --only firestore:indexes
```

### Step 3: Seed Initial Data

Create a seed script to populate your Firestore with test data:

```typescript
// scripts/seedFirestore.ts
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';

async function seedData() {
  // 1. Create Organization
  const orgRef = await addDoc(collection(db, 'organizations'), {
    name: "SIT Logistics",
    type: "Fleet",
    email: "admin@sitlogistics.com",
    phone: "+1234567890",
    address: "123 Logistics Ave, Transport City",
    subscription: "Pro",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    settings: {
      currency: "USD",
      timezone: "America/New_York",
      logo: ""
    }
  });
  const orgId = orgRef.id;
  console.log('✅ Created organization:', orgId);

  // 2. Create Branch
  const branchRef = await addDoc(collection(db, 'organizations', orgId, 'branches'), {
    name: "Main Depot",
    address: "456 Warehouse Blvd",
    location: { latitude: 40.7128, longitude: -74.0060 },
    manager: "John Smith",
    phone: "+1234567891"
  });
  console.log('✅ Created branch:', branchRef.id);

  // 3. Create Users
  const driverRef = await addDoc(collection(db, 'users'), {
    email: "driver@sitlogistics.com",
    name: "Mike Johnson",
    phone: "+1234567892",
    role: "Driver",
    orgId: orgId,
    branchId: branchRef.id,
    avatar: "https://i.pravatar.cc/150?img=12",
    licenseNumber: "DL123456",
    licenseExpiry: Timestamp.fromDate(new Date('2025-12-31')),
    status: "Active",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    preferences: {
      notifications: true,
      language: "en",
      theme: "light"
    }
  });
  console.log('✅ Created driver:', driverRef.id);

  const managerRef = await addDoc(collection(db, 'users'), {
    email: "manager@sitlogistics.com",
    name: "Sarah Williams",
    phone: "+1234567893",
    role: "FleetManager",
    orgId: orgId,
    branchId: branchRef.id,
    avatar: "https://i.pravatar.cc/150?img=5",
    status: "Active",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    preferences: {
      notifications: true,
      language: "en",
      theme: "light"
    }
  });
  console.log('✅ Created fleet manager:', managerRef.id);

  // 4. Create Vehicle
  const vehicleRef = await addDoc(collection(db, 'vehicles'), {
    orgId: orgId,
    branchId: branchRef.id,
    registration: "XYZ-1234",
    make: "Volvo",
    model: "FH16",
    year: 2022,
    type: "Truck",
    capacity: 25000,
    status: "InUse",
    driverId: driverRef.id,
    lat: 40.7128,
    lng: -74.0060,
    speed: 60,
    heading: 90,
    lastSeen: Timestamp.now(),
    fuelLevel: 75,
    odometer: 125000,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  console.log('✅ Created vehicle:', vehicleRef.id);

  // 5. Create Trip
  const tripRef = await addDoc(collection(db, 'trips'), {
    orgId: orgId,
    branchId: branchRef.id,
    driverId: driverRef.id,
    vehicleId: vehicleRef.id,
    status: "InTransit",
    cargo: {
      type: "Electronics",
      weight: 15000,
      description: "Consumer electronics shipment",
      quantity: 500,
      specialHandling: ["Fragile", "Keep Dry"]
    },
    origin: {
      address: "123 Origin St, City A",
      location: { latitude: 40.7128, longitude: -74.0060 },
      contact: { name: "Alice Brown", phone: "+1234567894" }
    },
    destination: {
      address: "789 Destination Ave, City B",
      location: { latitude: 34.0522, longitude: -118.2437 },
      contact: { name: "Bob Green", phone: "+1234567895" }
    },
    route: [
      { latitude: 40.7128, longitude: -74.0060 },
      { latitude: 34.0522, longitude: -118.2437 }
    ],
    distance: 4500,
    duration: 2880,
    price: 3500,
    startTime: Timestamp.fromDate(new Date()),
    eta: Timestamp.fromDate(new Date(Date.now() + 2880 * 60 * 1000)),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    metadata: {
      priority: "Normal",
      pod: ""
    }
  });
  console.log('✅ Created trip:', tripRef.id);

  // 6. Create Trip Event
  await addDoc(collection(db, 'trips', tripRef.id, 'events'), {
    type: "status_change",
    status: "InTransit",
    description: "Driver picked up cargo and departed",
    timestamp: Timestamp.now(),
    userId: driverRef.id,
    location: { latitude: 40.7128, longitude: -74.0060 },
    attachments: []
  });
  console.log('✅ Created trip event');

  console.log('\n🎉 Database seeded successfully!');
  console.log(`\nOrganization ID: ${orgId}`);
  console.log(`Driver ID: ${driverRef.id}`);
  console.log(`Vehicle ID: ${vehicleRef.id}`);
  console.log(`Trip ID: ${tripRef.id}`);
}

seedData().catch(console.error);
```

Run the seed script:
```bash
npx ts-node scripts/seedFirestore.ts
```

### Step 4: Update TanStack Query Hooks

Replace `mockApi` imports with `firebaseService` in your query hooks.

**Before (using mockApi):**
```typescript
// Example from a screen
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../services/mockApi';

const { data: trips } = useQuery({
  queryKey: ['trips'],
  queryFn: mockApi.fetchTrips
});
```

**After (using firebaseService):**
```typescript
import { useQuery } from '@tanstack/react-query';
import { fetchTrips } from '../services/firebaseService';

// Pass orgId from session store
const { orgId } = useSessionStore();

const { data: trips } = useQuery({
  queryKey: ['trips', orgId],
  queryFn: () => fetchTrips(orgId)
});
```

### Step 5: Implement Real-Time Subscriptions

For live data (vehicles, notifications), use real-time listeners:

**Example: Live Vehicle Tracking**
```typescript
import { useEffect, useState } from 'react';
import { subscribeToVehicles } from '../services/firebaseService';
import { Vehicle } from '../services/types';

export function useVehiclesRealtime(orgId: string) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  
  useEffect(() => {
    const unsubscribe = subscribeToVehicles(orgId, (updatedVehicles) => {
      setVehicles(updatedVehicles);
    });
    
    return () => unsubscribe(); // Cleanup
  }, [orgId]);
  
  return vehicles;
}
```

**Example: Live Notifications**
```typescript
import { useEffect } from 'react';
import { subscribeToNotifications } from '../services/firebaseService';
import { useQueryClient } from '@tanstack/react-query';

export function useNotificationsRealtime(userId: string) {
  const queryClient = useQueryClient();
  
  useEffect(() => {
    const unsubscribe = subscribeToNotifications(userId, (notifications) => {
      // Update TanStack Query cache
      queryClient.setQueryData(['notifications', userId], notifications);
    });
    
    return () => unsubscribe();
  }, [userId, queryClient]);
}
```

### Step 6: Update GPS Simulator Integration

Modify `gpsSimulator.ts` to write to Firestore:

```typescript
// In gpsSimulator.ts, update the simulation loop
import { updateVehicleLocation } from './firebaseService';

// Inside startSimulation()
this.simulationInterval = setInterval(async () => {
  // ... existing position calculation ...
  
  // Write to Firestore
  await updateVehicleLocation(this.vehicleId, {
    lat: this.currentPosition.lat,
    lng: this.currentPosition.lng,
    speed: this.speed,
    heading: this.heading
  });
  
  // Also emit locally for immediate UI update
  this.emit('locationUpdate', this.currentPosition);
}, this.updateInterval);
```

### Step 7: Implement Offline Queue Processing

Update the offline queue store to use Firebase:

```typescript
// src/store/offlineQueue.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { addToOfflineQueue, fetchOfflineQueue, markQueueItemProcessed } from '../services/firebaseService';

interface OfflineAction {
  id: string;
  type: string;
  data: any;
  timestamp: string;
}

interface OfflineQueueStore {
  queue: OfflineAction[];
  isOnline: boolean;
  addAction: (action: Omit<OfflineAction, 'id' | 'timestamp'>) => void;
  processQueue: (userId: string) => Promise<void>;
}

export const useOfflineQueue = create<OfflineQueueStore>()(
  persist(
    (set, get) => ({
      queue: [],
      isOnline: true,
      
      addAction: async (action) => {
        const newAction = {
          ...action,
          id: Date.now().toString(),
          timestamp: new Date().toISOString()
        };
        
        set((state) => ({ queue: [...state.queue, newAction] }));
        
        // Try to sync immediately if online
        if (get().isOnline) {
          const userId = 'current-user-id'; // Get from session
          await get().processQueue(userId);
        }
      },
      
      processQueue: async (userId: string) => {
        const { queue } = get();
        
        for (const action of queue) {
          try {
            // Add to Firebase offline queue
            await addToOfflineQueue(userId, {
              type: action.type,
              data: action.data
            });
            
            // Remove from local queue
            set((state) => ({
              queue: state.queue.filter(a => a.id !== action.id)
            }));
          } catch (error) {
            console.error('Failed to sync action:', error);
            break; // Stop processing if any fails
          }
        }
      }
    }),
    {
      name: 'offline-queue-storage',
      storage: AsyncStorage
    }
  )
);

// Listen for network changes
NetInfo.addEventListener(state => {
  useOfflineQueue.setState({ isOnline: state.isConnected ?? false });
  
  if (state.isConnected) {
    const userId = 'current-user-id'; // Get from session
    useOfflineQueue.getState().processQueue(userId);
  }
});
```

### Step 8: Update Authentication Flow

Replace mock login with Firebase Auth:

```typescript
// src/screens/shared/AuthFlow.tsx
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebaseConfig';
import { fetchUser } from '../../services/firebaseService';

const handleLogin = async (email: string, password: string) => {
  try {
    // Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    
    // Fetch user profile from Firestore
    const userProfile = await fetchUser(userId);
    
    if (userProfile) {
      // Update session store
      setSession({
        token: await userCredential.user.getIdToken(),
        userId: userId,
        role: userProfile.role,
        orgId: userProfile.orgId
      });
      
      navigation.replace('MainApp');
    }
  } catch (error) {
    Alert.alert('Login Failed', error.message);
  }
};
```

---

## Testing Checklist

### Before Migration
- [ ] All screens working with mockApi
- [ ] GPS simulation functional
- [ ] Offline queue storing actions locally
- [ ] UI matches design specifications

### After Migration
- [ ] Firestore security rules deployed
- [ ] Composite indexes created
- [ ] Test data seeded successfully
- [ ] Authentication flow works
- [ ] Driver screens fetch real trips
- [ ] Fleet screens display real vehicles
- [ ] Real-time vehicle tracking updates
- [ ] Notifications appear in real-time
- [ ] Offline actions sync when back online
- [ ] GPS updates write to Firestore
- [ ] No console errors
- [ ] App performs well (< 1s query times)

---

## Performance Optimization

### 1. Enable Persistence (Offline Cache)
```typescript
// In firebaseConfig.ts
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence only enabled in one tab');
  } else if (err.code === 'unimplemented') {
    console.warn('Browser doesn\'t support persistence');
  }
});
```

### 2. Limit Location History Storage
Set up Cloud Function to auto-delete old location data:

```javascript
// Firebase Cloud Function
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.cleanupLocationHistory = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async (context) => {
    const db = admin.firestore();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const snapshot = await db.collectionGroup('locationHistory')
      .where('timestamp', '<', sevenDaysAgo)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    console.log(`Deleted ${snapshot.size} old location records`);
  });
```

### 3. Use Query Cursors for Pagination
```typescript
// For large trip lists
import { query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';

let lastVisible = null;

const fetchMoreTrips = async () => {
  const tripsRef = collection(db, 'trips');
  let q = query(
    tripsRef,
    where('orgId', '==', orgId),
    orderBy('startTime', 'desc'),
    limit(20)
  );
  
  if (lastVisible) {
    q = query(q, startAfter(lastVisible));
  }
  
  const snapshot = await getDocs(q);
  lastVisible = snapshot.docs[snapshot.docs.length - 1];
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

---

## Rollback Plan

If issues arise, quickly revert to mockApi:

1. Comment out Firebase imports in screens
2. Restore mockApi imports
3. Disable Firebase in `firebaseConfig.ts`:
```typescript
export const FIREBASE_ENABLED = false; // Toggle
```
4. Add conditional logic in service layer:
```typescript
export const fetchTrips = FIREBASE_ENABLED 
  ? firebaseService.fetchTrips 
  : mockApi.fetchTrips;
```

---

## Production Deployment

### 1. Environment Variables
Create `.env.production`:
```bash
FIREBASE_API_KEY=your_production_key
FIREBASE_PROJECT_ID=your_production_project
# ... other production values
```

### 2. EAS Build Configuration
```json
// eas.json
{
  "build": {
    "production": {
      "env": {
        "FIREBASE_API_KEY": "...",
        "GOOGLE_MAPS_API_KEY_IOS": "...",
        "GOOGLE_MAPS_API_KEY_ANDROID": "..."
      }
    }
  }
}
```

### 3. Build & Submit
```bash
eas build --platform ios --profile production
eas build --platform android --profile production
eas submit --platform ios
eas submit --platform android
```

---

## Support & Troubleshooting

### Common Issues

**Issue**: "Missing or insufficient permissions"
- **Fix**: Check Firestore security rules, ensure user is authenticated

**Issue**: "Index not found" error
- **Fix**: Create the composite index suggested in error message

**Issue**: Real-time listeners not updating
- **Fix**: Check network connectivity, verify `onSnapshot` cleanup

**Issue**: Slow query performance
- **Fix**: Add indexes, implement pagination, denormalize data

**Issue**: GPS updates not appearing
- **Fix**: Check `updateVehicleLocation` is being called, verify Firestore rules allow writes

---

## Next Steps

1. ✅ Complete this migration guide
2. ⏭️ Implement Firebase Authentication
3. ⏭️ Set up Cloud Functions for automation
4. ⏭️ Add Firebase Cloud Messaging for push notifications
5. ⏭️ Implement Firebase Storage for document uploads (POD photos)
6. ⏭️ Add Analytics and Crashlytics
7. ⏭️ Performance monitoring with Firebase Performance

