# Truck Logistics & Live Tracking (Expo)

Premium demo for driver + fleet roles with live GPS simulation, offline queue, and mock backend.

## Setup
1. Install dependencies: `npm install`
2. Start Expo: `npm run start`
3. Choose platform: `npm run ios` or `npm run android`

## Flows
- Launch app -> walkthrough through permissions, login, OTP, org/branch selection, then pick role (Driver or Fleet Ops).
- Driver tab bar: Home, Trips, Earnings, Inbox, Profile. Open any trip to track live movement.
- Fleet tab bar: Dashboard, Live Map, Trips, Fleet, Billing.

## Offline Mode
Enable **Developer Offline Mode** in Profile to simulate offline queue behavior. Pending actions appear in Offline Queue.

## GPS Simulation
GPS simulator starts after login and moves vehicles along a polyline every ~2.5 seconds. Fleet Live Map and Driver Tracking subscribe automatically.
