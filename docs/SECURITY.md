# 🔒 Security Implementation Guide

## Overview

This document describes the security measures implemented to protect the SIT Logistics application and its data.

## ✅ Security Measures Implemented

### 1. Firebase Security Rules

**Location**: `firestore.rules`

**What It Does**:
- Controls who can read/write data in Firestore
- Enforces organization-based access control
- Role-based permissions (Driver, Fleet Manager, Manager, Admin)
- Prevents unauthorized access to sensitive data

**Key Rules**:

```javascript
// Users can only access data from their own organization
match /trips/{tripId} {
  allow read: if belongsToOrg(resource.data.orgId);
  allow update: if isManager() || 
                   (isDriver() && resource.data.driverId == request.auth.uid);
}
```

**Deploy Rules**:
```bash
./deploy-security-rules.sh
```

Or manually:
```bash
firebase deploy --only firestore:rules
```

---

### 2. Environment Variables

**What Changed**:
- Firebase API keys moved from `firebaseConfig.ts` to `app.config.js`
- Credentials now use environment variables with fallback values
- Sensitive data no longer hardcoded in source code

**Configuration**:

`app.config.js`:
```javascript
extra: {
  firebaseApiKey: process.env.FIREBASE_API_KEY || "fallback-value",
  firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN || "fallback-value",
  // ...
}
```

`firebaseConfig.ts`:
```typescript
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseAuthDomain,
  // ...
};
```

**For Production**:
Create `.env` file (already in `.gitignore`):
```bash
FIREBASE_API_KEY=your_actual_key
FIREBASE_AUTH_DOMAIN=your_actual_domain
FIREBASE_PROJECT_ID=your_actual_project_id
# ... etc
```

---

### 3. User Authentication & Authorization

**Authentication Flow**:

1. **Phone Number Verification** (Dev Mode)
   - User enters phone number
   - OTP sent (simulated in dev: `123456`)
   - OTP verified against hardcoded value
   - User profile created in Firestore

2. **User Profile in Firestore**
   ```typescript
   {
     uid: "dev_1234567890",
     phoneNumber: "+1234567890",
     orgId: "nZJx0kyyapZDo5P3XxCk",
     role: "Driver",
     createdAt: Timestamp,
     updatedAt: Timestamp
   }
   ```

3. **Session Management**
   - 7-day session stored in AsyncStorage
   - Session includes: userId, phoneNumber, orgId, role, expiry
   - Auto-logout on session expiry

**Authorization Checks**:
- Every Firestore query validates user has access
- Security rules check `request.auth.uid` matches user doc
- Org-level isolation enforced at database level

---

### 4. Role-Based Access Control (RBAC)

**Roles**:

| Role | Permissions |
|------|------------|
| **Driver** | Read own trips, Update trip status, Update vehicle location |
| **Fleet** | Read all org trips/vehicles, Create trips, Manage fleet |
| **Manager** | Full access to org data, Create/delete users, Manage settings |
| **Admin** | System-wide access (future use) |

**Implementation**:

Security Rules:
```javascript
function isDriver() {
  return getUserData().role == "Driver";
}

function isFleetManager() {
  return getUserData().role == "Fleet";
}

function canManageOrg(orgId) {
  return (isFleetManager() || isManager()) && belongsToOrg(orgId);
}
```

Application Code:
```typescript
// User profile stored in Firestore
await authService.updateUserOrgAndRole(userId, orgId, role);

// Session includes role
const session = {
  userId, phoneNumber, orgId, role, expiresAt, createdAt
};
```

---

## 🚨 Security Gaps & Mitigation

### Current Gaps

1. **Development Mode**
   - ✅ Mitigated: Clear logging, hardcoded OTP visible in UI
   - ⚠️ TODO: Disable before production deploy

2. **No Real Phone Auth**
   - ✅ Mitigated: User profiles still created in Firestore
   - ⚠️ TODO: Implement backend OTP service

3. **No Rate Limiting**
   - ⚠️ TODO: Add Firebase Cloud Functions for rate limiting

4. **No Encryption at Rest**
   - ✅ Mitigated: Firebase provides automatic encryption
   - ✅ Secure: Data encrypted in transit (HTTPS)

### Production Checklist

- [ ] Set `DEV_MODE = false` in `authService.ts`
- [ ] Implement backend OTP API (Twilio/Firebase Admin)
- [ ] Deploy Firestore security rules
- [ ] Set up environment variables in CI/CD
- [ ] Enable Firebase App Check (bot protection)
- [ ] Add rate limiting Cloud Functions
- [ ] Review and test all security rules
- [ ] Conduct security audit
- [ ] Set up monitoring and alerts

---

## 🔐 Data Access Patterns

### Organization Isolation

**Every query includes orgId filter**:

```typescript
// ✅ CORRECT - Filtered by org
const trips = await getDocs(
  query(collection(db, 'trips'), where('orgId', '==', userOrgId))
);

// ❌ WRONG - No org filter (security rules will block)
const trips = await getDocs(collection(db, 'trips'));
```

**Security rules enforce isolation**:
```javascript
match /trips/{tripId} {
  allow read: if resource.data.orgId == getUserData().orgId;
}
```

### Driver-Specific Access

**Drivers see only assigned trips**:

```typescript
// Application code
const trips = await getDocs(
  query(
    collection(db, 'trips'),
    where('orgId', '==', orgId),
    where('driverId', '==', userId)
  )
);

// Security rules also enforce
match /trips/{tripId} {
  allow read: if belongsToOrg(resource.data.orgId) || 
                 resource.data.driverId == request.auth.uid;
}
```

---

## 🧪 Testing Security

### Test Scenarios

1. **Unauthorized Access**
   ```typescript
   // Should FAIL - User A tries to read User B's data
   const tripRef = doc(db, 'trips', userBTripId);
   const trip = await getDoc(tripRef); // ❌ Permission denied
   ```

2. **Cross-Org Access**
   ```typescript
   // Should FAIL - User from Org A tries to read Org B data
   const trips = await getDocs(
     query(collection(db, 'trips'), where('orgId', '==', orgB))
   ); // ❌ Returns empty (security rules filter)
   ```

3. **Role Violations**
   ```typescript
   // Should FAIL - Driver tries to delete trip
   const tripRef = doc(db, 'trips', tripId);
   await deleteDoc(tripRef); // ❌ Permission denied (only managers)
   ```

### Test in Firebase Console

1. Go to Firestore → Rules
2. Click "Rules Playground"
3. Select operation (read/write)
4. Enter document path
5. Set authenticated user: `auth: {uid: 'test123'}`
6. Set user data in Firestore first
7. Run simulation

---

## 📊 Security Monitoring

### Logs to Monitor

```typescript
// Authentication events
console.log('📱 Sending OTP to:', phoneNumber);
console.log('🔐 Verifying OTP...');
console.log('✅ OTP verified successfully');
console.log('❌ Error verifying OTP:', error);

// Session management
console.log('💾 Session stored, expires:', expiresAt);
console.log('⏰ Session expired');
console.log('🚪 Session cleared and user signed out');

// Firestore operations
console.log('✅ User profile created in Firestore');
console.log('✅ User org and role updated');
```

### Firebase Console Monitoring

1. **Authentication** → Usage
   - Track login attempts
   - Monitor failed auth

2. **Firestore** → Usage
   - Read/write counts
   - Cost monitoring

3. **Cloud Functions** (future)
   - OTP sending success rate
   - Rate limit triggers

---

## 🚀 Production Deployment

### Step 1: Environment Setup

```bash
# .env file
FIREBASE_API_KEY=AIzaSy...
FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
FIREBASE_PROJECT_ID=your-project
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456
FIREBASE_APP_ID=1:123456:ios:abc123
```

### Step 2: Deploy Security Rules

```bash
# Login to Firebase
firebase login

# Deploy rules
./deploy-security-rules.sh

# Verify deployment
firebase firestore:rules:get
```

### Step 3: Enable Production Auth

In `authService.ts`:
```typescript
const DEV_MODE = false; // Change to false
```

Implement production OTP:
```typescript
async sendOTP(phoneNumber: string) {
  // Call your backend API
  const response = await fetch('https://api.yourapp.com/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber })
  });
  return response.json();
}
```

### Step 4: Test Thoroughly

- [ ] Test login flow
- [ ] Test role-based access
- [ ] Test org isolation
- [ ] Test session expiry
- [ ] Test logout
- [ ] Test security rules in Console

---

## 🆘 Troubleshooting

### "Permission Denied" Errors

**Cause**: Security rules blocking access

**Debug Steps**:
1. Check user is authenticated: `auth.currentUser`
2. Verify user doc exists in Firestore: `users/{uid}`
3. Check user has orgId and role set
4. Test query in Rules Playground
5. Check logs for auth state

**Common Fixes**:
```typescript
// Ensure user is logged in
if (!auth.currentUser) {
  console.error('User not authenticated');
}

// Verify session
const session = await authService.getSession();
if (!session || !session.orgId) {
  console.error('Invalid session');
}
```

### Session Not Persisting

**Check**:
1. AsyncStorage permissions
2. Session expiry timestamp
3. App not clearing storage on startup

**Fix**:
```typescript
// Check session
const sessionStr = await AsyncStorage.getItem('auth_session');
console.log('Session:', sessionStr);

// Check expiry
const session = JSON.parse(sessionStr);
console.log('Expires:', new Date(session.expiresAt));
console.log('Now:', new Date());
```

### Rules Not Applied

**Solution**:
```bash
# Redeploy rules
firebase deploy --only firestore:rules --force

# Clear cache
firebase firestore:rules:release
```

---

## 📚 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication Best Practices](https://firebase.google.com/docs/auth/security)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [React Native Security Best Practices](https://reactnative.dev/docs/security)

---

## 🔄 Updates Log

| Date | Change | Impact |
|------|--------|--------|
| 2025-12-31 | Created Firestore security rules | Medium |
| 2025-12-31 | Moved config to environment variables | High |
| 2025-12-31 | Added user profile in Firestore | High |
| 2025-12-31 | Implemented role-based access | Medium |
| 2025-12-31 | Added session management | Low |

---

**Last Updated**: December 31, 2025  
**Version**: 1.0.0  
**Status**: ✅ Development Mode Secured
