# Architecture Diagrams

Visual reference for SIT Logistics system architecture.

---

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     React Native App                        │
│                    (Expo SDK 51)                            │
├──────────────────┬──────────────────┬──────────────────────┤
│   Driver App     │   Fleet App      │   Shared Services    │
│   - Home         │   - Dashboard    │   - Auth             │
│   - Trips        │   - Live Map     │   - Inbox            │
│   - Tracking     │   - Trips        │   - Profile          │
│   - Earnings     │   - Fleet        │   - Offline Queue    │
│                  │   - Billing      │                      │
└──────────────────┴──────────────────┴──────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│                  (firebaseService.ts)                       │
│   - Organizations  - Vehicles      - Invoices               │
│   - Users          - Trips         - Notifications          │
│   - Branches       - Events        - Offline Queue          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Backend                         │
├─────────────────────┬─────────────────────┬─────────────────┤
│   Firestore DB      │   Authentication    │   Storage       │
│   (Real-time)       │   (Email/Password)  │   (Future)      │
│   7 collections     │   RBAC roles        │   POD photos    │
└─────────────────────┴─────────────────────┴─────────────────┘
```

---

## Data Flow

### Read Operation (Fetch Trips)

```
┌──────────────┐
│ Screen       │  1. User opens Trips screen
│ (Trips.tsx)  │
└──────┬───────┘
       │
       │ 2. Call fetchTrips(orgId)
       ▼
┌──────────────┐
│ TanStack     │  3. Check cache
│ Query        │  4. If stale/missing, fetch
└──────┬───────┘
       │
       │ 5. firebaseService.fetchTrips()
       ▼
┌──────────────┐
│ Firebase     │  6. Query Firestore
│ Service      │     collection('trips')
└──────┬───────┘     .where('orgId', '==', orgId)
       │
       │ 7. Return documents
       ▼
┌──────────────┐
│ Firestore    │  8. Apply security rules
│ Database     │  9. Check user permissions
└──────┬───────┘  10. Execute query with indexes
       │
       │ 11. Return results
       ▼
┌──────────────┐
│ Screen       │  12. Display trips in UI
│ (Trips.tsx)  │  13. Cache result in TanStack Query
└──────────────┘
```

### Write Operation (Update Trip Status)

```
┌──────────────┐
│ Driver       │  1. Driver taps "Mark as Delivered"
│ (Tracking)   │
└──────┬───────┘
       │
       │ 2. Call updateTripStatus(tripId, 'Delivered')
       ▼
┌──────────────┐
│ Firebase     │  3. Update trip document
│ Service      │  4. Add event to subcollection
└──────┬───────┘
       │
       │ 5. Check security rules
       ▼
┌──────────────┐
│ Firestore    │  6. Verify driverId matches auth.uid
│ Rules        │  7. Allow if driver owns trip
└──────┬───────┘
       │
       │ 8. Write to database
       ▼
┌──────────────┐
│ Firestore    │  9. Update trip status
│ Database     │ 10. Create event document
└──────┬───────┘ 11. Trigger real-time listeners
       │
       │ 12. Push update to subscribers
       ▼
┌──────────────┐
│ Fleet        │ 13. Trip status updates in real-time
│ Dashboard    │ 14. Dashboard stats recalculate
└──────────────┘
```

### Real-Time Subscription (Vehicle Tracking)

```
┌──────────────┐
│ Fleet        │  1. Open Live Map screen
│ Live Map     │  2. Call subscribeToVehicles(orgId, callback)
└──────┬───────┘
       │
       │ 3. Set up onSnapshot listener
       ▼
┌──────────────┐
│ Firebase     │  4. Create WebSocket connection
│ Service      │  5. Listen to vehicles collection
└──────┬───────┘
       │
       │ 6. Maintain persistent connection
       ▼
┌──────────────┐
│ Firestore    │  7. Push updates on any change
│ Database     │  ← Vehicle location updates every 2.5s
└──────┬───────┘
       │
       │ 8. New data pushed to client
       ▼
┌──────────────┐
│ Fleet        │  9. Callback fired with new data
│ Live Map     │ 10. Map markers update smoothly
└──────────────┘ 11. <1 second latency
```

---

## Security Layer

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Request                       │
│   User: driver@example.com (authenticated)                  │
│   Action: Fetch trips for orgId: "abc123"                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Authentication                   │
│   ✓ User logged in                                          │
│   ✓ Auth token valid                                        │
│   ✓ User ID: "driver-xyz-789"                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firestore Security Rules                  │
│   1. Check: request.auth != null → ✓ Pass                   │
│   2. Check: getUserData().orgId == "abc123" → ✓ Pass        │
│   3. Check: getUserData().role == "Driver" → ✓ Pass         │
│   4. Apply rule: allow read if belongsToOrg(orgId)          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Query Execution                           │
│   Filter: orgId == "abc123" AND driverId == "driver-xyz-789"│
│   Index: (orgId ASC, driverId ASC, startTime DESC)          │
│   Result: 3 trips returned                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                        Response                              │
│   [                                                          │
│     { id: "trip1", status: "InTransit", ... },              │
│     { id: "trip2", status: "Pending", ... },                │
│     { id: "trip3", status: "Delivered", ... }               │
│   ]                                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema Visualization

```
┌───────────────────────────────────────────────────────────────┐
│ organizations (Root Collection)                               │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Organization Document                                     │ │
│ │ id: "org123"                                              │ │
│ │ name: "SIT Logistics"                                     │ │
│ │ type: "Fleet"                                             │ │
│ │ subscription: "Pro"                                       │ │
│ │                                                           │ │
│ │   └── branches (Subcollection)                           │ │
│ │       ├── branch1 { name, address, location }            │ │
│ │       └── branch2 { name, address, location }            │ │
│ └───────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ users (Root Collection)                                       │
│ ├── user1 { email, role: "Driver", orgId: "org123" }         │
│ ├── user2 { email, role: "FleetManager", orgId: "org123" }   │
│ └── user3 { email, role: "Driver", orgId: "org123" }         │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ vehicles (Root Collection)                                    │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Vehicle Document                                          │ │
│ │ id: "vehicle456"                                          │ │
│ │ registration: "XYZ-1234"                                  │ │
│ │ status: "InUse"                                           │ │
│ │ lat: 40.7128, lng: -74.0060                               │ │
│ │ driverId: "user1"                                         │ │
│ │ orgId: "org123"                                           │ │
│ │                                                           │ │
│ │   ├── locationHistory (Subcollection)                    │ │
│ │   │   ├── loc1 { position, timestamp, speed }            │ │
│ │   │   ├── loc2 { position, timestamp, speed }            │ │
│ │   │   └── loc3 { position, timestamp, speed }            │ │
│ │   │                                                       │ │
│ │   └── maintenance (Subcollection)                        │ │
│ │       ├── maint1 { type, date, cost }                    │ │
│ │       └── maint2 { type, date, cost }                    │ │
│ └───────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ trips (Root Collection)                                       │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ Trip Document                                             │ │
│ │ id: "trip789"                                             │ │
│ │ status: "InTransit"                                       │ │
│ │ driverId: "user1"                                         │ │
│ │ vehicleId: "vehicle456"                                   │ │
│ │ orgId: "org123"                                           │ │
│ │ cargo: { type, weight, description }                     │ │
│ │ origin: { address, location, contact }                   │ │
│ │ destination: { address, location, contact }              │ │
│ │                                                           │ │
│ │   └── events (Subcollection)                             │ │
│ │       ├── event1 { type: "status_change", timestamp }    │ │
│ │       ├── event2 { type: "location_update", timestamp }  │ │
│ │       └── event3 { type: "note", description }           │ │
│ └───────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ invoices (Root Collection)                                    │
│ ├── inv1 { tripId, total, status: "Paid", orgId }            │
│ ├── inv2 { tripId, total, status: "Sent", orgId }            │
│ └── inv3 { tripId, total, status: "Overdue", orgId }         │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ notifications (Root Collection)                               │
│ ├── notif1 { userId, type, title, body, read: false }        │
│ ├── notif2 { userId, type, title, body, read: true }         │
│ └── notif3 { userId, type, title, body, read: false }        │
└───────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────┐
│ offlineQueue (Root Collection)                                │
│ ┌───────────────────────────────────────────────────────────┐ │
│ │ User Queue Document                                       │ │
│ │ id: "user1"                                               │ │
│ │                                                           │ │
│ │   └── actions (Subcollection)                            │ │
│ │       ├── action1 { type, data, processed: false }       │ │
│ │       ├── action2 { type, data, processed: false }       │ │
│ │       └── action3 { type, data, processed: true }        │ │
│ └───────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

---

## Offline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Device                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐        ┌─────────────────┐           │
│  │  React Native   │        │  AsyncStorage   │           │
│  │    App (UI)     │◄──────►│  (Local Cache)  │           │
│  └────────┬────────┘        └─────────────────┘           │
│           │                                                 │
│           │ Online                                         │
│           ▼                                                 │
│  ┌─────────────────┐                                       │
│  │ TanStack Query  │  ◄── Cached queries                  │
│  │  (Data Cache)   │                                       │
│  └────────┬────────┘                                       │
│           │                                                 │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────┐                                       │
│  │ Network State   │  ◄── NetInfo listener                │
│  │   Detector      │                                       │
│  └────────┬────────┘                                       │
│           │                                                 │
│  ┌────────▼────────┐                                       │
│  │                 │                                       │
│  │  Online?        │                                       │
│  │                 │                                       │
│  └────┬──────┬─────┘                                       │
│       │      │                                             │
│   Yes │      │ No                                          │
│       │      │                                             │
│       │      └──────► ┌─────────────────┐                 │
│       │               │ Offline Queue   │                 │
│       │               │ (Local Storage) │                 │
│       │               └────────┬────────┘                 │
│       │                        │                           │
│       │                        │ When online               │
│       │                        │                           │
│       └────────────────────────┘                           │
│                │                                            │
└────────────────┼────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Firestore                        │
│   - Read/Write operations                                   │
│   - Real-time listeners                                     │
│   - Batch sync from queue                                   │
└─────────────────────────────────────────────────────────────┘
```

### Offline Flow Example

```
User Action: Update trip status to "Delivered"
Network Status: Offline

1. User taps "Mark Delivered" button
2. App detects offline state
3. Action stored in offline queue:
   {
     type: "update_trip_status",
     tripId: "trip789",
     status: "Delivered",
     timestamp: "2024-01-15T10:30:00Z"
   }
4. UI shows "✓ Saved (will sync when online)"
5. Queue persisted to AsyncStorage

─── User goes back online ───

6. NetInfo detects network connection
7. Queue processor starts
8. Actions sent to Firebase one by one:
   → updateTripStatus("trip789", "Delivered")
9. On success, mark action as processed
10. Remove from queue
11. UI shows "✓ Synced"
```

---

## GPS Tracking Flow

```
┌──────────────┐
│ GPS          │  1. GPS Simulator starts
│ Simulator    │  2. Generate position along route
└──────┬───────┘  3. Calculate speed, heading
       │
       │ Every 2.5 seconds
       ▼
┌──────────────┐
│ Firebase     │  4. Call updateVehicleLocation()
│ Service      │     - Update vehicle document
└──────┬───────┘     - Add to locationHistory subcollection
       │
       │
       ▼
┌──────────────┐
│ Firestore    │  5. Write to database
│ Database     │     vehicles/{vehicleId}
└──────┬───────┘       lat: 40.7128
       │                lng: -74.0060
       │                speed: 65
       │                heading: 90
       │                lastSeen: [timestamp]
       │
       │ 6. Real-time update pushed
       ▼
┌──────────────────────────────────────┐
│ Subscribed Clients                   │
├──────────────┬───────────────────────┤
│ Fleet        │ Driver                │
│ Live Map     │ Tracking Screen       │
│              │                       │
│ • Update     │ • Update map center   │
│   marker     │ • Recalculate ETA     │
│   position   │ • Show speed          │
│ • Animate    │                       │
│   movement   │                       │
└──────────────┴───────────────────────┘

Result: <1 second latency from simulator to UI
```

---

## Performance Optimization Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      Query Optimization                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Composite Indexes                                       │
│     ├── (orgId, status, startTime DESC)                    │
│     ├── (driverId, status, startTime DESC)                 │
│     └── Result: Query time <100ms for 10K+ documents       │
│                                                             │
│  2. Denormalization                                         │
│     ├── Store driverName in trip (avoid join)              │
│     ├── Store vehicleReg in trip (avoid join)              │
│     └── Result: 1 read instead of 3                        │
│                                                             │
│  3. Pagination                                              │
│     ├── Limit to 20 results per query                      │
│     ├── Use startAfter() for next page                     │
│     └── Result: Consistent performance regardless of size  │
│                                                             │
│  4. Real-Time Subscriptions                                │
│     ├── Only for frequently changing data (vehicles)       │
│     ├── One listener per screen (cleanup on unmount)       │
│     └── Result: Live updates without polling               │
│                                                             │
│  5. Client-Side Caching                                     │
│     ├── TanStack Query cache (5 min stale time)           │
│     ├── AsyncStorage for offline persistence               │
│     └── Result: Instant UI, reduced Firestore reads        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Scalability Model

```
┌─────────────────────────────────────────────────────────────┐
│                    Scalability Characteristics               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Organizations: 1 → 1,000+ ✓                                │
│  ├── Each org isolated by orgId                            │
│  ├── No cross-org queries                                  │
│  └── Can shard by orgId if needed                          │
│                                                             │
│  Users per Org: 1 → 10,000+ ✓                              │
│  ├── Indexed by (orgId, role)                              │
│  ├── Paginated queries                                     │
│  └── Cached user profiles                                  │
│                                                             │
│  Vehicles per Org: 1 → 50,000+ ✓                           │
│  ├── Real-time only for active vehicles                    │
│  ├── Location history auto-cleanup (7 days)                │
│  └── Geospatial queries with GeoPoints                     │
│                                                             │
│  Trips per Org: 1 → 1,000,000+ ✓                           │
│  ├── Archived after completion                             │
│  ├── Composite indexes for fast filtering                  │
│  └── Can split to archive collection after 90 days         │
│                                                             │
│  Firestore Limits:                                          │
│  ├── Max document size: 1 MB ✓ (trips ~10 KB)             │
│  ├── Max writes/second: 10,000 ✓ (we're under 1K)         │
│  ├── Max concurrent connections: Unlimited ✓               │
│  └── Storage: Unlimited (pay per GB)                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Cost Estimation (Firebase Spark Free Tier)

```
┌─────────────────────────────────────────────────────────────┐
│                     Free Tier Limits                         │
├─────────────────────────────────────────────────────────────┤
│  Firestore Reads:       50,000/day                          │
│  Firestore Writes:      20,000/day                          │
│  Firestore Deletes:     20,000/day                          │
│  Storage:               1 GB                                │
│  Bandwidth:             10 GB/month                         │
│  Authentication:        Unlimited                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│             Typical Usage (10 active drivers)                │
├─────────────────────────────────────────────────────────────┤
│  Reads/day:                                                 │
│    - Trip fetches: 10 drivers × 10 trips × 5 refreshes     │
│      = 500 reads                                            │
│    - Vehicle updates (real-time): included in socket        │
│    - Dashboard: 20 KPI fetches × 5 refreshes = 100 reads   │
│  Total: ~600 reads/day (1.2% of free tier)                 │
│                                                             │
│  Writes/day:                                                │
│    - Location updates: 10 vehicles × 3600 sec/hr ÷ 2.5s    │
│      × 8 hrs = 115,200 BUT batched every 30s               │
│      = 10 × 960 = 9,600 writes                             │
│    - Trip updates: 10 × 5 = 50 writes                      │
│  Total: ~9,650 writes/day (48% of free tier)               │
│                                                             │
│  Result: Free tier sufficient for up to 20 active vehicles  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│         Blaze Plan (Pay as you go) - After free tier        │
├─────────────────────────────────────────────────────────────┤
│  Reads:  $0.06 per 100K documents                           │
│  Writes: $0.18 per 100K documents                           │
│  Deletes: $0.02 per 100K documents                          │
│  Storage: $0.18 per GB/month                                │
│                                                             │
│  Example: 100 vehicles, 1M reads, 300K writes/month        │
│    Reads: $6                                                │
│    Writes: $54                                              │
│    Storage (10 GB): $1.80                                   │
│  Total: ~$62/month for 100-vehicle fleet                    │
└─────────────────────────────────────────────────────────────┘
```

---

These diagrams should be referenced when:
- Onboarding new developers
- Explaining architecture to stakeholders
- Planning scalability upgrades
- Troubleshooting data flow issues
- Optimizing performance
