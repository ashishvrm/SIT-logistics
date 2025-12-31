#!/bin/bash

# Firebase Security Rules Deployment Script
# This script deploys Firestore security rules to Firebase

echo "🔒 Deploying Firebase Security Rules..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "📱 Please login to Firebase..."
    firebase login
fi

# Deploy security rules
echo "🚀 Deploying firestore.rules..."
firebase deploy --only firestore:rules

echo "✅ Security rules deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Test the rules in Firebase Console"
echo "2. Verify authentication flow works"
echo "3. Check that users can only access their org's data"
