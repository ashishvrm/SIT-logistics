/**
 * Firebase Connection Test
 * Tests that Firebase is properly configured and accessible
 */

import { collection, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

async function testFirebaseConnection() {
  console.log('🔥 Testing Firebase connection...\n');

  try {
    // Test 1: Write a test document
    console.log('📝 Test 1: Writing test document...');
    const testRef = await addDoc(collection(db, 'test'), {
      message: 'Hello from SIT Logistics',
      timestamp: new Date(),
      test: true
    });
    console.log('✅ Write successful! Doc ID:', testRef.id);

    // Test 2: Read the document back
    console.log('\n📖 Test 2: Reading documents...');
    const snapshot = await getDocs(collection(db, 'test'));
    console.log('✅ Read successful! Found', snapshot.size, 'document(s)');

    // Test 3: Clean up test document
    console.log('\n🗑️  Test 3: Cleaning up...');
    await deleteDoc(doc(db, 'test', testRef.id));
    console.log('✅ Cleanup successful!');

    console.log('\n🎉 All tests passed! Firebase is connected and working.\n');
    console.log('Next steps:');
    console.log('1. Run: npx ts-node scripts/seedFirestore.ts');
    console.log('2. This will populate your database with test data\n');

    return true;
  } catch (error: any) {
    console.error('\n❌ Firebase connection failed!');
    console.error('Error:', error.message);
    console.error('\nPossible issues:');
    console.error('1. Check that firebaseConfig.ts has correct credentials');
    console.error('2. Ensure Firestore is enabled in Firebase Console');
    console.error('3. Check internet connection');
    console.error('4. Verify Firebase project exists\n');
    return false;
  }
}

testFirebaseConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
  });
