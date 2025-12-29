# Firebase Firestore Database Structure

## Overview
This database follows best practices for Firestore:
- Denormalization for read performance
- Hierarchical subcollections for related data
- Composite indexes for complex queries
- Real-time listeners for live updates
- GeoPoint for location-based queries

---

## Collections

### 1. `organizations` (Root Collection)
Multi-tenant structure for logistics companies.

```
organizations/{orgId}
  ├── name: string
  ├── type: "Fleet" | "Shipper"
  ├── email: string
  ├── phone: string
  ├── address: string
  ├── subscription: "Basic" | "Pro" | "Enterprise"
  ├── createdAt: Timestamp
  ├── updatedAt: Timestamp
  └── settings: {
        currency: string,
        timezone: string,
        logo: string
      }
```

**Subcollections:**
- `branches/{branchId}` - Regional offices/depots
  ```
  ├── name: string
  ├── address: string
  ├── location: GeoPoint
  ├── manager: string
  ├── phone: string
  ```

**Indexes Required:**
- None (direct queries by orgId)

---

### 2. `users` (Root Collection)
All users (drivers, fleet managers, admins).

```
users/{userId}
  ├── email: string (indexed)
  ├── name: string
  ├── phone: string
  ├── role: "Driver" | "FleetManager" | "Admin"
  ├── orgId: string (indexed)
  ├── branchId: string
  ├── avatar: string
  ├── licenseNumber: string (for drivers)
  ├── licenseExpiry: Timestamp
  ├── status: "Active" | "Inactive" | "Suspended"
  ├── createdAt: Timestamp
  ├── updatedAt: Timestamp
  └── preferences: {
        notifications: boolean,
        language: string,
        theme: "light" | "dark"
      }
```

**Indexes Required:**
- Composite: `orgId` ASC, `role` ASC
- Single: `email` ASC (for authentication)

---

### 3. `vehicles` (Root Collection)
Fleet vehicles with real-time location tracking.

```
vehicles/{vehicleId}
  ├── orgId: string (indexed)
  ├── branchId: string
  ├── registration: string
  ├── make: string
  ├── model: string
  ├── year: number
  ├── type: "Truck" | "Van" | "Cargo"
  ├── capacity: number (kg)
  ├── status: "Available" | "InUse" | "Maintenance"
  ├── driverId: string (current driver)
  ├── lat: number (current position)
  ├── lng: number (current position)
  ├── speed: number
  ├── heading: number
  ├── lastSeen: Timestamp
  ├── fuelLevel: number
  ├── odometer: number
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

**Subcollections:**
- `locationHistory/{locationId}` - GPS trail
  ```
  ├── position: GeoPoint
  ├── speed: number
  ├── heading: number
  ├── timestamp: Timestamp
  ├── accuracy: number
  ```
  *Note: Use TTL or Cloud Functions to auto-delete entries older than 7 days*

- `maintenance/{maintenanceId}` - Service records
  ```
  ├── type: "Service" | "Repair" | "Inspection"
  ├── date: Timestamp
  ├── cost: number
  ├── description: string
  ├── nextServiceDue: Timestamp
  ```

**Indexes Required:**
- Composite: `orgId` ASC, `status` ASC
- Composite: `driverId` ASC, `status` ASC
- GeoPoint: `lat`, `lng` (for proximity queries)

---

### 4. `trips` (Root Collection)
Cargo delivery trips.

```
trips/{tripId}
  ├── orgId: string (indexed)
  ├── branchId: string
  ├── driverId: string (indexed)
  ├── vehicleId: string (indexed)
  ├── status: "Pending" | "PickedUp" | "InTransit" | "Delivered" | "Cancelled"
  ├── cargo: {
        type: string,
        weight: number,
        description: string,
        quantity: number,
        specialHandling: string[]
      }
  ├── origin: {
        address: string,
        location: GeoPoint,
        contact: { name: string, phone: string }
      }
  ├── destination: {
        address: string,
        location: GeoPoint,
        contact: { name: string, phone: string }
      }
  ├── route: GeoPoint[] (polyline coordinates)
  ├── distance: number (km)
  ├── duration: number (minutes)
  ├── price: number
  ├── startTime: Timestamp (indexed)
  ├── eta: Timestamp
  ├── completedAt: Timestamp
  ├── createdAt: Timestamp
  ├── updatedAt: Timestamp
  └── metadata: {
        temperature: number (for refrigerated),
        priority: "Low" | "Normal" | "High" | "Urgent",
        pod: string (proof of delivery URL)
      }
```

**Subcollections:**
- `events/{eventId}` - Trip activity log
  ```
  ├── type: "status_change" | "location_update" | "note" | "issue"
  ├── status: TripStatus (if status_change)
  ├── description: string
  ├── timestamp: Timestamp
  ├── userId: string (who triggered it)
  ├── location: GeoPoint
  └── attachments: string[] (image URLs)
  ```

**Indexes Required:**
- Composite: `orgId` ASC, `startTime` DESC
- Composite: `driverId` ASC, `status` ASC, `startTime` DESC
- Composite: `vehicleId` ASC, `status` ASC
- Single: `status` ASC

---

### 5. `invoices` (Root Collection)
Billing and payment tracking.

```
invoices/{invoiceId}
  ├── orgId: string (indexed)
  ├── tripId: string (indexed)
  ├── invoiceNumber: string (unique)
  ├── customerId: string
  ├── customerName: string
  ├── customerEmail: string
  ├── items: [
        {
          description: string,
          quantity: number,
          unitPrice: number,
          total: number
        }
      ]
  ├── subtotal: number
  ├── tax: number
  ├── discount: number
  ├── total: number
  ├── currency: string
  ├── status: "Draft" | "Sent" | "Paid" | "Overdue" | "Cancelled"
  ├── issueDate: Timestamp
  ├── dueDate: Timestamp
  ├── paidAt: Timestamp
  ├── paymentMethod: string
  ├── notes: string
  ├── createdAt: Timestamp
  └── updatedAt: Timestamp
```

**Indexes Required:**
- Composite: `orgId` ASC, `status` ASC, `issueDate` DESC
- Single: `tripId` ASC
- Single: `invoiceNumber` ASC

---

### 6. `notifications` (Root Collection)
In-app notifications for users.

```
notifications/{notificationId}
  ├── userId: string (indexed)
  ├── orgId: string
  ├── type: "trip_update" | "payment" | "alert" | "message"
  ├── title: string
  ├── body: string
  ├── read: boolean
  ├── actionType: string
  ├── actionId: string (tripId, invoiceId, etc.)
  ├── priority: "low" | "medium" | "high"
  ├── createdAt: Timestamp (indexed)
  └── readAt: Timestamp
```

**Indexes Required:**
- Composite: `userId` ASC, `createdAt` DESC
- Composite: `userId` ASC, `read` ASC, `createdAt` DESC

---

### 7. `offlineQueue` (Root Collection)
Stores user actions taken offline for sync when online.

```
offlineQueue/{userId}
  └── actions/{actionId}
        ├── type: string (e.g., "update_trip_status", "create_trip")
        ├── data: any (the action payload)
        ├── processed: boolean
        ├── createdAt: Timestamp
        └── processedAt: Timestamp
```

**Indexes Required:**
- Composite: `processed` ASC, `createdAt` ASC

---

## Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function belongsToOrg(orgId) {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.orgId == orgId;
    }
    
    function isDriver() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "Driver";
    }
    
    function isFleetManager() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "FleetManager";
    }
    
    // Organizations
    match /organizations/{orgId} {
      allow read: if belongsToOrg(orgId);
      allow write: if isFleetManager() && belongsToOrg(orgId);
      
      match /branches/{branchId} {
        allow read: if belongsToOrg(orgId);
        allow write: if isFleetManager() && belongsToOrg(orgId);
      }
    }
    
    // Users
    match /users/{userId} {
      allow read: if isAuthenticated() && 
                     (request.auth.uid == userId || belongsToOrg(resource.data.orgId));
      allow write: if request.auth.uid == userId;
    }
    
    // Vehicles
    match /vehicles/{vehicleId} {
      allow read: if isAuthenticated() && belongsToOrg(resource.data.orgId);
      allow write: if isFleetManager() && belongsToOrg(resource.data.orgId);
      
      match /locationHistory/{locationId} {
        allow read: if isAuthenticated() && belongsToOrg(get(/databases/$(database)/documents/vehicles/$(vehicleId)).data.orgId);
        allow create: if isDriver();
      }
    }
    
    // Trips
    match /trips/{tripId} {
      allow read: if isAuthenticated() && belongsToOrg(resource.data.orgId);
      allow create: if isFleetManager();
      allow update: if isDriver() && resource.data.driverId == request.auth.uid;
      
      match /events/{eventId} {
        allow read: if isAuthenticated() && belongsToOrg(get(/databases/$(database)/documents/trips/$(tripId)).data.orgId);
        allow create: if isAuthenticated();
      }
    }
    
    // Invoices
    match /invoices/{invoiceId} {
      allow read: if isAuthenticated() && belongsToOrg(resource.data.orgId);
      allow write: if isFleetManager() && belongsToOrg(resource.data.orgId);
    }
    
    // Notifications
    match /notifications/{notificationId} {
      allow read: if isAuthenticated() && request.auth.uid == resource.data.userId;
      allow update: if isAuthenticated() && request.auth.uid == resource.data.userId;
    }
    
    // Offline Queue
    match /offlineQueue/{userId}/actions/{actionId} {
      allow read, write: if isAuthenticated() && request.auth.uid == userId;
    }
  }
}
```

---

## Firestore Indexes

Add these to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "orgId", "order": "ASCENDING" },
        { "fieldPath": "role", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "vehicles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "orgId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "trips",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "orgId", "order": "ASCENDING" },
        { "fieldPath": "startTime", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "trips",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "driverId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "startTime", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "read", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## Best Practices Implemented

1. **Multi-tenancy**: All data scoped to `orgId` for isolation
2. **Denormalization**: Common fields duplicated to avoid joins
3. **Subcollections**: Used for 1-to-many relationships (trips/events, vehicles/locationHistory)
4. **GeoPoints**: For location-based queries and map rendering
5. **Timestamps**: Consistent use of Firestore Timestamp type
6. **Composite Indexes**: Pre-defined for complex queries
7. **Security Rules**: Role-based access control (RBAC)
8. **Offline Support**: Queue pattern for offline-first experience
9. **Real-time Listeners**: For live updates (vehicle tracking, notifications)
10. **Scalability**: Can handle millions of documents per collection

---

## Migration Strategy

### Phase 1: Setup
1. Create Firestore database in Firebase Console
2. Deploy security rules
3. Create composite indexes
4. Set up Cloud Functions for triggers (optional)

### Phase 2: Seed Data
```typescript
// Example seed script
import { addDoc, collection } from 'firebase/firestore';
import { db } from './firebaseConfig';

const seedOrganization = async () => {
  const orgRef = await addDoc(collection(db, 'organizations'), {
    name: "SIT Logistics",
    type: "Fleet",
    email: "admin@sitlogistics.com",
    phone: "+1234567890",
    address: "123 Main St, City",
    subscription: "Pro",
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: {
      currency: "USD",
      timezone: "America/New_York",
      logo: ""
    }
  });
  
  console.log("Created org:", orgRef.id);
  return orgRef.id;
};
```

### Phase 3: Replace Mock API
1. Update TanStack Query hooks to use `firebaseService` instead of `mockApi`
2. Implement real-time subscriptions for live data
3. Test offline functionality
4. Add error handling and loading states

### Phase 4: Production
1. Enable backups
2. Set up monitoring alerts
3. Configure TTL policies for locationHistory
4. Implement Cloud Functions for automation (invoicing, notifications)
