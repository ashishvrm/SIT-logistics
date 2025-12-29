# Manual Firebase Setup - Quick Guide

## Step 1: Enable Temporary Rules (2 minutes)

Since Firebase CLI requires Node 20+, let's enable Firebase manually:

1. **Go to Firebase Console**: https://console.firebase.google.com/project/sip-logistics/firestore

2. **Click on "Rules" tab**

3. **Copy and paste these temporary rules**:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

4. **Click "Publish"** (top right)

5. **Wait 1-2 minutes** for rules to deploy

---

## Step 2: Seed Database (30 seconds)

Once rules are published, run:

```bash
cd /Users/opr1004/Desktop/Dev/SIT-Logistics
npx ts-node scripts/seedFirestore.ts
```

This creates:
- ✅ 1 Organization (SIT Logistics)
- ✅ 1 Branch (Main Depot)  
- ✅ 4 Users (1 manager + 3 drivers)
- ✅ 3 Vehicles
- ✅ 3 Trips
- ✅ 3 Invoices
- ✅ 3 Notifications

**SAVE THE ORGANIZATION ID** printed at the end!

---

## Step 3: Verify Data (1 minute)

1. Go to: https://console.firebase.google.com/project/sip-logistics/firestore/data

2. You should see collections:
   - `organizations`
   - `users`
   - `vehicles`
   - `trips`
   - `invoices`
   - `notifications`

3. Click through to verify data exists

---

## Step 4: Test Firebase Connection (30 seconds)

```bash
npx ts-node scripts/testConnection.ts
```

Should show: "🎉 All tests passed!"

---

## What Happens Next?

After confirming data is seeded, I'll:

1. ✅ Update one screen at a time to use Firebase (no breaking changes)
2. ✅ Keep mock API as fallback
3. ✅ Test each screen before moving to next
4. ✅ Enable real-time updates gradually

---

## Need Help?

If you get errors:
- **"Missing permissions"**: Rules not published yet, wait 2 minutes
- **"Network error"**: Check internet connection
- **"Project not found"**: Verify project ID is `sip-logistics`

---

Ready to proceed? Run the commands above and let me know when data is seeded!
