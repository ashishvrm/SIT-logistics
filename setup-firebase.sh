#!/bin/bash

# Firebase Setup Helper Script
# This script guides you through the Firebase setup process

echo "🔥 SIT Logistics - Firebase Setup Helper"
echo "========================================"
echo ""

# Check if Firebase rules are set
echo "📋 STEP 1: Enable Firebase Rules"
echo ""
echo "Open this URL in your browser:"
echo "👉 https://console.firebase.google.com/project/sip-logistics/firestore/rules"
echo ""
echo "Copy and paste these rules, then click 'Publish':"
echo ""
cat << 'EOF'
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
EOF
echo ""
read -p "Press ENTER after you've published the rules..."
echo ""
echo "⏳ Waiting 10 seconds for rules to deploy..."
sleep 10
echo ""

# Test connection
echo "📡 STEP 2: Testing Firebase Connection"
echo ""
npx ts-node scripts/testConnection.ts

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Connection test failed. Please:"
    echo "  1. Check that rules are published"
    echo "  2. Wait another minute and try again"
    echo "  3. Verify internet connection"
    echo ""
    exit 1
fi

echo ""
echo "✅ Connection test passed!"
echo ""

# Seed database
echo "🌱 STEP 3: Seeding Database"
echo ""
read -p "Ready to create test data? Press ENTER to continue..."
echo ""

npx ts-node scripts/seedFirestore.ts

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Seed failed. Please check errors above."
    exit 1
fi

echo ""
echo "========================================"
echo "✅ SETUP COMPLETE!"
echo "========================================"
echo ""
echo "📝 IMPORTANT: Copy the Organization ID from above!"
echo ""
echo "Next steps:"
echo "  1. Copy the Organization ID"
echo "  2. Share it with the developer"
echo "  3. The app will be connected to Firebase!"
echo ""
echo "View your data:"
echo "👉 https://console.firebase.google.com/project/sip-logistics/firestore/data"
echo ""
