/**
 * Firestore Database Seed Script
 * 
 * Usage:
 * 1. Ensure firebaseConfig.ts has correct credentials
 * 2. Run: npx ts-node scripts/seedFirestore.ts
 * 3. Copy the generated IDs for testing
 */

import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  Timestamp,
  GeoPoint 
} from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBe-ai0yoY-wHyBqe5DN6IHoEMV-ankLIc",
  authDomain: "sip-logistics.firebaseapp.com",
  projectId: "sip-logistics",
  storageBucket: "sip-logistics.firebasestorage.app",
  messagingSenderId: "398220690974",
  appId: "1:398220690974:ios:dbd28bfd2f62f19c02a51d",
  measurementId: "G-WNTM7H07EZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

interface SeedResult {
  orgId: string;
  branchId: string;
  driverId: string;
  managerId: string;
  vehicleIds: string[];
  tripIds: string[];
}

async function seedDatabase(): Promise<SeedResult> {
  console.log('🌱 Starting database seed...\n');

  // ============= 1. CREATE ORGANIZATION =============
  console.log('📦 Creating organization...');
  const orgRef = await addDoc(collection(db, 'organizations'), {
    name: "SIT Logistics",
    type: "Fleet",
    email: "admin@sitlogistics.com",
    phone: "+1-555-0100",
    address: "123 Logistics Boulevard, Transport City, TC 10001",
    subscription: "Pro",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    settings: {
      currency: "USD",
      timezone: "America/New_York",
      logo: ""
    }
  });
  const orgId = orgRef.id;
  console.log('✅ Organization created:', orgId, '\n');

  // ============= 2. CREATE BRANCH =============
  console.log('🏢 Creating branch...');
  const branchRef = await addDoc(collection(db, 'organizations', orgId, 'branches'), {
    name: "Main Depot",
    address: "456 Warehouse Avenue, Transport City, TC 10002",
    location: new GeoPoint(40.7128, -74.0060), // New York coordinates
    manager: "John Smith",
    phone: "+1-555-0101"
  });
  const branchId = branchRef.id;
  console.log('✅ Branch created:', branchId, '\n');

  // ============= 3. CREATE USERS =============
  console.log('👥 Creating users...');
  
  // Fleet Manager
  const managerRef = await addDoc(collection(db, 'users'), {
    email: "manager@sitlogistics.com",
    name: "Sarah Williams",
    phone: "+1-555-0102",
    role: "FleetManager",
    orgId: orgId,
    branchId: branchId,
    avatar: "https://i.pravatar.cc/150?img=5",
    status: "Active",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    preferences: {
      notifications: true,
      language: "en",
      theme: "light"
    }
  });
  console.log('✅ Fleet Manager created:', managerRef.id);

  // Drivers
  const driverData = [
    { name: "Mike Johnson", email: "mike.j@sitlogistics.com", phone: "+1-555-0103", img: "12" },
    { name: "Emma Davis", email: "emma.d@sitlogistics.com", phone: "+1-555-0104", img: "45" },
    { name: "Carlos Rodriguez", email: "carlos.r@sitlogistics.com", phone: "+1-555-0105", img: "33" }
  ];

  const driverIds: string[] = [];
  for (const driver of driverData) {
    const driverRef = await addDoc(collection(db, 'users'), {
      email: driver.email,
      name: driver.name,
      phone: driver.phone,
      role: "Driver",
      orgId: orgId,
      branchId: branchId,
      avatar: `https://i.pravatar.cc/150?img=${driver.img}`,
      licenseNumber: `DL${Math.floor(Math.random() * 1000000)}`,
      licenseExpiry: Timestamp.fromDate(new Date('2025-12-31')),
      status: "Active",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      preferences: {
        notifications: true,
        language: "en",
        theme: "light"
      }
    });
    driverIds.push(driverRef.id);
    console.log(`✅ Driver created: ${driver.name} (${driverRef.id})`);
  }
  console.log('');

  // ============= 4. CREATE VEHICLES =============
  console.log('🚛 Creating vehicles...');
  
  const vehicleData = [
    { reg: "XYZ-1234", make: "Volvo", model: "FH16", type: "Truck", capacity: 25000, lat: 40.7128, lng: -74.0060 },
    { reg: "ABC-5678", make: "Mercedes", model: "Actros", type: "Truck", capacity: 22000, lat: 34.0522, lng: -118.2437 },
    { reg: "DEF-9012", make: "Scania", model: "R500", type: "Truck", capacity: 24000, lat: 41.8781, lng: -87.6298 }
  ];

  const vehicleIds: string[] = [];
  for (let i = 0; i < vehicleData.length; i++) {
    const vehicle = vehicleData[i];
    const vehicleRef = await addDoc(collection(db, 'vehicles'), {
      orgId: orgId,
      branchId: branchId,
      registration: vehicle.reg,
      make: vehicle.make,
      model: vehicle.model,
      year: 2022,
      type: vehicle.type,
      capacity: vehicle.capacity,
      status: i === 0 ? "InUse" : "Available",
      driverId: i === 0 ? driverIds[0] : null,
      lat: vehicle.lat,
      lng: vehicle.lng,
      speed: i === 0 ? 65 : 0,
      heading: i === 0 ? 90 : 0,
      lastSeen: Timestamp.now(),
      fuelLevel: 75 - i * 10,
      odometer: 125000 + i * 15000,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    vehicleIds.push(vehicleRef.id);
    console.log(`✅ Vehicle created: ${vehicle.reg} (${vehicleRef.id})`);

    // Add location history entry
    await addDoc(collection(db, 'vehicles', vehicleRef.id, 'locationHistory'), {
      position: new GeoPoint(vehicle.lat, vehicle.lng),
      speed: i === 0 ? 65 : 0,
      heading: i === 0 ? 90 : 0,
      timestamp: Timestamp.now(),
      accuracy: 10
    });
  }
  console.log('');

  // ============= 5. CREATE TRIPS =============
  console.log('📍 Creating trips...');
  
  const tripData = [
    {
      status: "InTransit",
      cargo: {
        type: "Electronics",
        weight: 15000,
        description: "Consumer electronics shipment - 500 units",
        quantity: 500,
        specialHandling: ["Fragile", "Keep Dry"]
      },
      origin: {
        address: "123 Tech Park, San Francisco, CA 94105",
        location: new GeoPoint(37.7749, -122.4194),
        contact: { name: "Alice Brown", phone: "+1-555-0200" }
      },
      destination: {
        address: "789 Retail Plaza, Los Angeles, CA 90001",
        location: new GeoPoint(34.0522, -118.2437),
        contact: { name: "Bob Green", phone: "+1-555-0201" }
      },
      distance: 617,
      duration: 360,
      price: 2500
    },
    {
      status: "Pending",
      cargo: {
        type: "Furniture",
        weight: 18000,
        description: "Office furniture - 200 chairs, 50 desks",
        quantity: 250,
        specialHandling: ["Handle with Care"]
      },
      origin: {
        address: "456 Manufacturing Dr, Chicago, IL 60601",
        location: new GeoPoint(41.8781, -87.6298),
        contact: { name: "Charlie White", phone: "+1-555-0202" }
      },
      destination: {
        address: "321 Business Center, New York, NY 10001",
        location: new GeoPoint(40.7128, -74.0060),
        contact: { name: "Diana Black", phone: "+1-555-0203" }
      },
      distance: 1270,
      duration: 720,
      price: 4200
    },
    {
      status: "Delivered",
      cargo: {
        type: "Medical Supplies",
        weight: 5000,
        description: "Pharmaceutical products",
        quantity: 1000,
        specialHandling: ["Temperature Controlled", "Priority"]
      },
      origin: {
        address: "789 Pharma Blvd, Boston, MA 02101",
        location: new GeoPoint(42.3601, -71.0589),
        contact: { name: "Eve Johnson", phone: "+1-555-0204" }
      },
      destination: {
        address: "654 Hospital Ave, Philadelphia, PA 19101",
        location: new GeoPoint(39.9526, -75.1652),
        contact: { name: "Frank Miller", phone: "+1-555-0205" }
      },
      distance: 435,
      duration: 300,
      price: 3500
    }
  ];

  const tripIds: string[] = [];
  for (let i = 0; i < tripData.length; i++) {
    const trip = tripData[i];
    const startTime = new Date();
    startTime.setHours(startTime.getHours() - (2 - i) * 4); // Stagger start times
    
    const tripRef = await addDoc(collection(db, 'trips'), {
      orgId: orgId,
      branchId: branchId,
      driverId: driverIds[i],
      vehicleId: vehicleIds[i],
      status: trip.status,
      cargo: trip.cargo,
      origin: trip.origin,
      destination: trip.destination,
      route: [trip.origin.location, trip.destination.location],
      distance: trip.distance,
      duration: trip.duration,
      price: trip.price,
      startTime: Timestamp.fromDate(startTime),
      eta: Timestamp.fromDate(new Date(startTime.getTime() + trip.duration * 60 * 1000)),
      ...(trip.status === 'Delivered' && { completedAt: Timestamp.now() }),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      metadata: {
        priority: i === 2 ? "High" : "Normal",
        pod: trip.status === 'Delivered' ? "https://example.com/pod/12345.pdf" : ""
      }
    });
    tripIds.push(tripRef.id);
    console.log(`✅ Trip created: ${trip.cargo.type} - ${trip.status} (${tripRef.id})`);

    // Add trip event
    await addDoc(collection(db, 'trips', tripRef.id, 'events'), {
      type: "status_change",
      status: trip.status,
      description: `Trip ${trip.status === 'Delivered' ? 'completed successfully' : 
                     trip.status === 'InTransit' ? 'in transit' : 'created'}`,
      timestamp: Timestamp.now(),
      userId: driverIds[i],
      location: trip.origin.location,
      attachments: []
    });
  }
  console.log('');

  // ============= 6. CREATE INVOICES =============
  console.log('💰 Creating invoices...');
  
  for (let i = 0; i < tripIds.length; i++) {
    const trip = tripData[i];
    await addDoc(collection(db, 'invoices'), {
      orgId: orgId,
      tripId: tripIds[i],
      invoiceNumber: `INV-2024-${1000 + i}`,
      customerId: `CUST-${100 + i}`,
      customerName: trip.destination.contact.name,
      customerEmail: `customer${i}@example.com`,
      items: [
        {
          description: `Cargo delivery - ${trip.cargo.type}`,
          quantity: 1,
          unitPrice: trip.price,
          total: trip.price
        }
      ],
      subtotal: trip.price,
      tax: trip.price * 0.08,
      discount: 0,
      total: trip.price * 1.08,
      currency: "USD",
      status: trip.status === 'Delivered' ? 'Paid' : 'Sent',
      issueDate: Timestamp.now(),
      dueDate: Timestamp.fromDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
      ...(trip.status === 'Delivered' && { paidAt: Timestamp.now() }),
      paymentMethod: trip.status === 'Delivered' ? 'Credit Card' : '',
      notes: "Payment due within 30 days",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    console.log(`✅ Invoice created: INV-2024-${1000 + i}`);
  }
  console.log('');

  // ============= 7. CREATE NOTIFICATIONS =============
  console.log('🔔 Creating notifications...');
  
  const notifications = [
    {
      userId: driverIds[0],
      type: "trip_update",
      title: "New trip assigned",
      body: "You have been assigned to delivery XYZ-1234",
      actionType: "trip",
      actionId: tripIds[0],
      priority: "medium"
    },
    {
      userId: managerRef.id,
      type: "alert",
      title: "Vehicle maintenance due",
      body: "Vehicle ABC-5678 requires service in 500km",
      actionType: "vehicle",
      actionId: vehicleIds[1],
      priority: "high"
    },
    {
      userId: driverIds[2],
      type: "trip_update",
      title: "Delivery completed",
      body: "Trip marked as delivered successfully",
      actionType: "trip",
      actionId: tripIds[2],
      priority: "low"
    }
  ];

  for (const notif of notifications) {
    await addDoc(collection(db, 'notifications'), {
      ...notif,
      orgId: orgId,
      read: false,
      createdAt: Timestamp.now()
    });
    console.log(`✅ Notification created: ${notif.title}`);
  }
  console.log('');

  // ============= SUMMARY =============
  console.log('═══════════════════════════════════════');
  console.log('🎉 DATABASE SEEDED SUCCESSFULLY!');
  console.log('═══════════════════════════════════════\n');
  
  return {
    orgId,
    branchId,
    driverId: driverIds[0],
    managerId: managerRef.id,
    vehicleIds,
    tripIds
  };
}

// Run the seed function
seedDatabase()
  .then((result) => {
    console.log('📊 SEED SUMMARY:');
    console.log('─────────────────────────────────────');
    console.log('Organization ID:', result.orgId);
    console.log('Branch ID:', result.branchId);
    console.log('Fleet Manager ID:', result.managerId);
    console.log('Driver ID (1st):', result.driverId);
    console.log('Vehicle IDs:', result.vehicleIds.join(', '));
    console.log('Trip IDs:', result.tripIds.join(', '));
    console.log('─────────────────────────────────────\n');
    
    console.log('💡 NEXT STEPS:');
    console.log('1. Update your .env file with the Organization ID');
    console.log('2. Use the Fleet Manager ID for fleet dashboard testing');
    console.log('3. Use Driver ID for driver app testing');
    console.log('4. Deploy Firestore security rules: firebase deploy --only firestore:rules');
    console.log('5. Deploy indexes: firebase deploy --only firestore:indexes');
    console.log('');
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ SEED FAILED:', error);
    process.exit(1);
  });
