# Firebase Index Setup Instructions

## The Error
The app is showing: "The query requires an index, you can create it here."

This happens because Firestore queries that combine `where()` filters with `orderBy()` clauses require composite indexes.

## Quick Fix - Use the Error Link

When you see the index error in the app, **click the link** in the error message. Firebase will:
1. Open the Firebase Console
2. Pre-populate the index configuration
3. Let you click "Create Index" button
4. Build the index (takes 1-2 minutes)

## Manual Setup via Firebase Console

If the link doesn't work, create the index manually:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `sip-logistics`
3. Click **Firestore Database** in the left menu
4. Click the **Indexes** tab
5. Click **Create Index**
6. Configure:
   - Collection ID: `trips`
   - Fields to index:
     - `orgId` - Ascending
     - `startTime` - Descending
7. Click **Create**

## Verify Index Status

After creation:
- Status will show "Building" (takes 1-2 minutes)
- Once "Enabled", refresh your app
- The trips should load successfully

## Alternative: Deploy via CLI (Requires Node 20+)

If you upgrade Node.js to version 20+:

```bash
# Deploy all indexes defined in firestore.indexes.json
firebase deploy --only firestore:indexes
```

The indexes are already defined in `firestore.indexes.json` and ready to deploy.

## Troubleshooting

If trips still don't load after index creation:
1. Check Firebase Console > Firestore > Indexes - ensure status is "Enabled"
2. Check app logs for any new errors
3. Verify your org ID matches: `nZJx0kyyapZDo5P3XxCk`
