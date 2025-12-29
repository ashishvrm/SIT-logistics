# SIT Logistics - Cargo Tracking & Fleet Management

Modern mobile app for logistics companies with real-time GPS tracking, Firebase backend, and offline-first architecture.

## 🚀 Quick Start

### Development Setup
```bash
# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on specific platform
npm run ios      # iOS simulator
npm run android  # Android emulator
```

### Firebase Setup (5 minutes)
See **[Quick Start Guide](docs/QUICKSTART.md)** for Firebase configuration:

```bash
# 1. Update firebaseConfig.ts with your Firebase project credentials
# 2. Deploy rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# 3. Seed test data
npx ts-node scripts/seedFirestore.ts
```

📚 **Full Documentation:**
- [Firebase Setup Guide](docs/FIREBASE_SETUP.md) - Complete Firebase configuration
- [Database Structure](docs/DATABASE_STRUCTURE.md) - Firestore schema and best practices
- [Migration Guide](docs/MIGRATION_GUIDE.md) - Migrate from mock API to Firebase
- [Integration Summary](docs/FIREBASE_INTEGRATION_SUMMARY.md) - What was built

## 📱 Features

### Driver App
- **Home**: View assigned deliveries with cargo details, pickup/dropoff locations
- **Trips**: Browse trip history with status tracking
- **Live Tracking**: Real-time GPS navigation with route visualization
- **Earnings**: Revenue dashboard with daily/weekly/monthly stats
- **Inbox**: Notifications and alerts
- **Profile**: Account settings and offline mode

### Fleet Manager App
- **Dashboard**: KPIs for active trips, fleet utilization, revenue
- **Live Map**: Real-time vehicle tracking on interactive map
- **Trips**: Manage all deliveries with filtering and search
- **Fleet**: Vehicle management with status monitoring
- **Billing**: Invoice generation and payment tracking

## 🏗️ Tech Stack

### Frontend
- **React Native** with Expo SDK 51
- **TypeScript** for type safety
- **React Navigation** for routing
- **TanStack Query** for data fetching/caching
- **Zustand** for state management
- **React Native Maps** for GPS visualization
- **React Native Paper** for UI components

### Backend
- **Firebase Firestore** - NoSQL real-time database
- **Firebase Authentication** - User management
- **Firebase Cloud Functions** (future) - Serverless automation
- **Firebase Storage** (future) - Document uploads

### Architecture
- **Offline-first**: Queue system for resilient operation
- **Real-time**: WebSocket subscriptions for live updates
- **Multi-tenant**: Organization-based data isolation
- **Role-based**: Driver, FleetManager, Admin permissions

## 🎨 Design System

### Theme
- **Primary**: Orange (#FF6B35) - Action, energy, logistics
- **Background**: Dark gradient (#0F3460 → #16213E)
- **Cards**: White with 20-24px border radius
- **Shadows**: Elevated cards with subtle shadows
- **Typography**: 14-18px body, 24-32px headers

### UI Components
- Gradient headers with search bars
- Floating action buttons
- Bottom sheets for details
- Pill buttons with icons
- Progress indicators
- Status badges

## 📂 Project Structure

```
SIT-Logistics/
├── src/
│   ├── app/
│   │   └── AppNavigator.tsx          # Navigation configuration
│   ├── components/
│   │   ├── maps/                     # Map-related components
│   │   └── ui/                       # Reusable UI components
│   ├── screens/
│   │   ├── driver/                   # Driver role screens
│   │   ├── fleet/                    # Fleet manager screens
│   │   └── shared/                   # Auth, profile, inbox
│   ├── services/
│   │   ├── firebaseService.ts        # Firebase operations
│   │   ├── mockApi.ts                # Mock data (development)
│   │   ├── gpsSimulator.ts           # GPS simulation
│   │   └── types.ts                  # TypeScript interfaces
│   ├── store/
│   │   ├── session.ts                # Auth state
│   │   └── offlineQueue.ts           # Offline sync
│   ├── theme/
│   │   ├── tokens.ts                 # Design tokens
│   │   └── index.ts                  # Theme provider
│   └── utils/
│       └── formatters.ts             # Helper functions
├── docs/
│   ├── QUICKSTART.md                 # 5-min Firebase setup
│   ├── FIREBASE_SETUP.md             # Complete setup guide
│   ├── DATABASE_STRUCTURE.md         # Firestore schema
│   ├── MIGRATION_GUIDE.md            # Mock API → Firebase
│   └── FIREBASE_INTEGRATION_SUMMARY.md
├── scripts/
│   └── seedFirestore.ts              # Database seeding
├── firebaseConfig.ts                 # Firebase initialization
├── firestore.rules                   # Security rules
├── firestore.indexes.json            # Composite indexes
├── app.config.js                     # Expo configuration
└── package.json
```

## 🔐 Security

### Firestore Security Rules
- **Multi-tenant isolation**: All data scoped by `orgId`
- **Role-based access**: Drivers vs Fleet Managers
- **Field-level permissions**: Granular update control
- **Authentication required**: No anonymous access

Example rule:
```javascript
// Drivers can only update location fields on their assigned vehicle
allow update: if (
  isDriver() && 
  resource.data.driverId == request.auth.uid &&
  request.resource.data.diff(resource.data).affectedKeys()
    .hasOnly(['lat', 'lng', 'speed', 'heading', 'lastSeen'])
);
```

## 🗄️ Database Schema

### Collections
- `organizations/{orgId}` - Companies using the platform
  - `branches/{branchId}` - Regional offices
- `users/{userId}` - Drivers, fleet managers, admins
- `vehicles/{vehicleId}` - Fleet vehicles
  - `locationHistory/{locationId}` - GPS trail (7-day TTL)
  - `maintenance/{maintenanceId}` - Service records
- `trips/{tripId}` - Delivery jobs
  - `events/{eventId}` - Status change log
- `invoices/{invoiceId}` - Billing records
- `notifications/{notificationId}` - User alerts
- `offlineQueue/{userId}/actions/{actionId}` - Offline sync

See [DATABASE_STRUCTURE.md](docs/DATABASE_STRUCTURE.md) for full schema.

## 🚦 User Flows

### Driver Flow
1. Launch app → Onboarding → Login with email/password
2. Select organization → Select branch → Choose "Driver" role
3. Home screen shows assigned deliveries
4. Tap trip → View details → Start tracking
5. GPS simulator shows live movement on map
6. Update trip status: Picked Up → In Transit → Delivered
7. View earnings in Earnings tab

### Fleet Manager Flow
1. Login → Select org/branch → Choose "Fleet Ops" role
2. Dashboard shows KPIs (active trips, vehicles, revenue)
3. Live Map displays all vehicles in real-time
4. Trips tab manages all deliveries (assign, monitor, invoice)
5. Fleet tab monitors vehicle health and utilization
6. Billing tab generates invoices and tracks payments

## 🔄 Offline Mode

### How It Works
1. User goes offline (airplane mode, no network)
2. Actions (update trip status, add note) saved to local queue
3. Queue persisted in AsyncStorage
4. When online, queue automatically syncs to Firestore
5. User sees pending actions in **Offline Queue** screen

### Enable Offline Mode
Profile → Settings → Enable "Developer Offline Mode"

## 📡 Real-Time Features

### GPS Tracking
- Custom GPS simulator moves vehicles along polylines
- Updates every 2.5 seconds
- Writes to Firestore `vehicles/{vehicleId}` location fields
- Live Map subscribes with `onSnapshot` for real-time updates

### Notifications
- Real-time listener on `notifications` collection
- Automatic badge count updates
- Push notifications (future with FCM)

## 🧪 Testing

### Run Seed Script
```bash
npx ts-node scripts/seedFirestore.ts
```

Creates:
- 1 organization with 1 branch
- 4 users (1 manager, 3 drivers)
- 3 vehicles (1 in use, 2 available)
- 3 trips (various statuses)
- 3 invoices
- 3 notifications

### Test Accounts
After seeding:
- **Fleet Manager**: `manager@sitlogistics.com`
- **Driver 1**: `mike.j@sitlogistics.com`
- **Driver 2**: `emma.d@sitlogistics.com`

(Set passwords in Firebase Console → Authentication → Users)

### Test Real-Time Updates
1. Open app → Go to Fleet → Live Map
2. Open Firebase Console → Firestore → `vehicles` collection
3. Edit a vehicle's `lat` or `lng` field
4. Map updates within 1-2 seconds ✅

## 🚀 Deployment

### Build with EAS
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

### Environment Variables
Create `.env`:
```bash
FIREBASE_API_KEY=your_key
FIREBASE_PROJECT_ID=your_project
GOOGLE_MAPS_API_KEY_IOS=your_ios_key
GOOGLE_MAPS_API_KEY_ANDROID=your_android_key
```

## 📈 Roadmap

### Phase 1 (Complete) ✅
- [x] Driver and Fleet UI
- [x] GPS simulation
- [x] Firebase integration
- [x] Offline queue
- [x] Real-time tracking
- [x] Security rules

### Phase 2 (In Progress)
- [ ] Firebase Authentication integration
- [ ] Cloud Functions for automation
- [ ] Push notifications with FCM
- [ ] Document uploads (POD photos)

### Phase 3 (Future)
- [ ] Analytics dashboard
- [ ] Route optimization
- [ ] Driver performance scoring
- [ ] Customer portal
- [ ] API for third-party integrations

## 🐛 Troubleshooting

### Common Issues

**"Missing or insufficient permissions"**
```bash
firebase deploy --only firestore:rules
```

**"Index not ready"**
Wait 5-10 minutes after deploying indexes. Check status:
Firebase Console → Firestore → Indexes

**App won't start after Firebase integration**
```bash
npx expo start -c  # Clear cache
rm -rf node_modules && npm install
```

**GPS not updating**
Check `gpsSimulator.ts` is calling `updateVehicleLocation()`

**Real-time listeners not working**
Verify cleanup function returns `unsubscribe()` in `useEffect`

## 📞 Support

- **Documentation**: Check `docs/` folder
- **Firebase Issues**: https://firebase.google.com/support
- **Expo Issues**: https://docs.expo.dev/

## 📄 License

MIT License - See LICENSE file for details

---

Built with ❤️ using React Native, Expo, and Firebase
