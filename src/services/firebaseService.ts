import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  GeoPoint,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { 
  Org, 
  Branch, 
  Driver, 
  Vehicle, 
  Trip, 
  TripStatus, 
  Invoice, 
  NotificationItem 
} from './types';

/**
 * Firebase Service Layer
 * Implements best practices:
 * - Collection-based structure for scalability
 * - Subcollections for hierarchical data
 * - Proper indexing strategy
 * - Real-time listeners
 * - Batch operations support
 */

// ============= ORGANIZATIONS =============

export const fetchOrganizations = async (): Promise<Org[]> => {
  const orgsRef = collection(db, 'organizations');
  const snapshot = await getDocs(orgsRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Org));
};

export const fetchOrganization = async (orgId: string): Promise<Org | null> => {
  const orgRef = doc(db, 'organizations', orgId);
  const snapshot = await getDoc(orgRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } as Org : null;
};

export const createOrganization = async (name: string): Promise<Org> => {
  const orgRef = doc(collection(db, 'organizations'));
  await setDoc(orgRef, {
    name,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return {
    id: orgRef.id,
    name
  };
};

// ============= BRANCHES =============

export const fetchBranches = async (orgId: string): Promise<Branch[]> => {
  const branchesRef = collection(db, 'organizations', orgId, 'branches');
  const snapshot = await getDocs(branchesRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    orgId,
    ...doc.data()
  } as Branch));
};

// ============= USERS / DRIVERS =============

export const fetchDrivers = async (orgId: string): Promise<Driver[]> => {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef, 
    where('orgId', '==', orgId),
    where('role', '==', 'Driver')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Driver));
};

export const fetchUser = async (userId: string) => {
  const userRef = doc(db, 'users', userId);
  const snapshot = await getDoc(userRef);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
};

export const createUser = async (userData: any) => {
  const usersRef = collection(db, 'users');
  const docRef = await addDoc(usersRef, {
    ...userData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

// ============= VEHICLES =============

export const fetchVehicles = async (orgId?: string): Promise<Vehicle[]> => {
  const vehiclesRef = collection(db, 'vehicles');
  const q = orgId 
    ? query(vehiclesRef, where('orgId', '==', orgId))
    : vehiclesRef;
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    
    // Map Firebase status to app status
    let status: 'moving' | 'idle' | 'offline' | 'on-trip' = 'idle';
    if (data.status === 'InUse' && data.speed > 0) status = 'moving';
    else if (data.status === 'InUse') status = 'on-trip';
    else if (data.status === 'Available') status = 'idle';
    else status = 'offline';
    
    return {
      id: doc.id,
      plate: data.registration || data.plate || 'UNKNOWN',
      model: data.model || 'Unknown Model',
      status,
      lat: data.lat || 0,
      lng: data.lng || 0,
      speed: data.speed || 0,
      heading: data.heading || 0,
      lastSeen: data.lastSeen?.toDate?.()?.toISOString() || new Date().toISOString(),
      driverId: data.driverId || undefined
    } as Vehicle;
  });
};

export const updateVehicleLocation = async (
  vehicleId: string, 
  location: { lat: number; lng: number; speed: number; heading: number }
) => {
  const vehicleRef = doc(db, 'vehicles', vehicleId);
  await updateDoc(vehicleRef, {
    lat: location.lat,
    lng: location.lng,
    speed: location.speed,
    heading: location.heading,
    lastSeen: Timestamp.now()
  });

  // Store in location history subcollection
  const locationRef = collection(db, 'vehicles', vehicleId, 'locationHistory');
  await addDoc(locationRef, {
    position: new GeoPoint(location.lat, location.lng),
    speed: location.speed,
    heading: location.heading,
    timestamp: Timestamp.now()
  });
};

export const subscribeToVehicles = (
  orgId: string,
  callback: (vehicles: Vehicle[]) => void
) => {
  const vehiclesRef = collection(db, 'vehicles');
  const q = query(vehiclesRef, where('orgId', '==', orgId));
  
  return onSnapshot(q, (snapshot) => {
    const vehicles = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      lastSeen: doc.data().lastSeen?.toDate().toISOString() || new Date().toISOString()
    } as Vehicle));
    callback(vehicles);
  });
};

// ============= TRIPS =============

export const fetchTrips = async (
  orgId?: string,
  status?: TripStatus,
  driverId?: string
): Promise<Trip[]> => {
  const tripsRef = collection(db, 'trips');
  
  // Build query with where clauses first, then orderBy
  const constraints = [];
  
  if (orgId) {
    constraints.push(where('orgId', '==', orgId));
  }
  if (status) {
    constraints.push(where('status', '==', status));
  }
  if (driverId) {
    constraints.push(where('driverId', '==', driverId));
  }
  
  // Add orderBy last
  constraints.push(orderBy('startTime', 'desc'));
  
  const q = query(tripsRef, ...constraints);
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      code: data.code || `TRK-${doc.id.slice(0, 6).toUpperCase()}`,
      status: data.status || 'Draft',
      vehicleId: data.vehicleId || '',
      driverId: data.driverId || '',
      pickup: data.origin?.address || data.pickup || 'Unknown Origin',
      drop: data.destination?.address || data.drop || 'Unknown Destination',
      customer: data.destination?.contact?.name || data.customer || 'Unknown Customer',
      startTime: data.startTime?.toDate?.()?.toISOString() || new Date().toISOString(),
      eta: data.eta?.toDate?.()?.toISOString() || new Date().toISOString(),
      distanceKm: data.distance || data.distanceKm || 0,
      cargo: data.cargo?.description || data.cargo?.type || data.cargo || 'Unknown Cargo',
      checkpoints: data.checkpoints || [],
      route: data.route?.map((point: any) => ({
        lat: point.latitude || point.lat || 0,
        lng: point.longitude || point.lng || 0
      })) || []
    } as Trip;
  });
};

export const fetchTrip = async (tripId: string): Promise<Trip | null> => {
  const tripRef = doc(db, 'trips', tripId);
  const snapshot = await getDoc(tripRef);
  
  if (!snapshot.exists()) return null;
  
  const data = snapshot.data();
  return {
    id: snapshot.id,
    code: data.code || `TRK-${snapshot.id.slice(0, 6).toUpperCase()}`,
    status: data.status || 'Draft',
    vehicleId: data.vehicleId || '',
    driverId: data.driverId || '',
    pickup: data.origin?.address || data.pickup || 'Unknown Origin',
    drop: data.destination?.address || data.drop || 'Unknown Destination',
    customer: data.destination?.contact?.name || data.customer || 'Unknown Customer',
    startTime: data.startTime?.toDate?.()?.toISOString() || new Date().toISOString(),
    eta: data.eta?.toDate?.()?.toISOString() || new Date().toISOString(),
    distanceKm: data.distance || data.distanceKm || 0,
    cargo: data.cargo?.description || data.cargo?.type || data.cargo || 'Unknown Cargo',
    checkpoints: data.checkpoints || [],
    route: data.route?.map((point: any) => ({
      lat: point.latitude || point.lat || 0,
      lng: point.longitude || point.lng || 0
    })) || []
  } as Trip;
};

export const createTrip = async (tripData: Omit<Trip, 'id'>): Promise<string> => {
  const tripsRef = collection(db, 'trips');
  const docRef = await addDoc(tripsRef, {
    ...tripData,
    startTime: Timestamp.fromDate(new Date(tripData.startTime)),
    eta: Timestamp.fromDate(new Date(tripData.eta)),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  
  // Create initial event
  const eventsRef = collection(db, 'trips', docRef.id, 'events');
  await addDoc(eventsRef, {
    status: tripData.status,
    timestamp: Timestamp.now(),
    type: 'status_change',
    description: 'Trip created'
  });
  
  return docRef.id;
};

export const updateTripStatus = async (
  tripId: string, 
  status: TripStatus
): Promise<void> => {
  const tripRef = doc(db, 'trips', tripId);
  await updateDoc(tripRef, {
    status,
    updatedAt: Timestamp.now(),
    ...(status === 'Completed' && { completedAt: Timestamp.now() })
  });
  
  // Log status change event
  const eventsRef = collection(db, 'trips', tripId, 'events');
  await addDoc(eventsRef, {
    status,
    timestamp: Timestamp.now(),
    type: 'status_change',
    description: `Status changed to ${status}`
  });
};

export const subscribeToTrips = (
  orgId: string,
  callback: (trips: Trip[]) => void
) => {
  const tripsRef = collection(db, 'trips');
  const q = query(
    tripsRef, 
    where('orgId', '==', orgId),
    orderBy('startTime', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const trips = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startTime: doc.data().startTime?.toDate().toISOString() || new Date().toISOString(),
      eta: doc.data().eta?.toDate().toISOString() || new Date().toISOString()
    } as Trip));
    callback(trips);
  });
};

// ============= INVOICES =============

export const fetchInvoices = async (orgId?: string): Promise<Invoice[]> => {
  const invoicesRef = collection(db, 'invoices');
  const q = orgId 
    ? query(invoicesRef, where('orgId', '==', orgId))
    : invoicesRef;
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      customer: data.customerName || data.customer || 'Unknown',
      amount: data.total || data.amount || 0,
      status: data.status || 'Draft',
      dueDate: data.dueDate?.toDate?.()?.toISOString() || data.dueDate || new Date().toISOString()
    } as Invoice;
  });
};

export const createInvoice = async (invoiceData: Omit<Invoice, 'id'>): Promise<string> => {
  const invoicesRef = collection(db, 'invoices');
  const docRef = await addDoc(invoicesRef, {
    ...invoiceData,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const updateInvoiceStatus = async (
  invoiceId: string,
  status: Invoice['status']
): Promise<void> => {
  const invoiceRef = doc(db, 'invoices', invoiceId);
  await updateDoc(invoiceRef, {
    status,
    updatedAt: Timestamp.now(),
    ...(status === 'Paid' && { paidAt: Timestamp.now() })
  });
};

// ============= NOTIFICATIONS =============

export const fetchNotifications = async (userId: string): Promise<NotificationItem[]> => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
  } as NotificationItem));
};

export const createNotification = async (
  notificationData: Omit<NotificationItem, 'id' | 'createdAt'>
): Promise<string> => {
  const notificationsRef = collection(db, 'notifications');
  const docRef = await addDoc(notificationsRef, {
    ...notificationData,
    createdAt: Timestamp.now(),
    read: false
  });
  return docRef.id;
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const notificationRef = doc(db, 'notifications', notificationId);
  await updateDoc(notificationRef, {
    read: true,
    readAt: Timestamp.now()
  });
};

export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: NotificationItem[]) => void
) => {
  const notificationsRef = collection(db, 'notifications');
  const q = query(
    notificationsRef,
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    } as NotificationItem));
    callback(notifications);
  });
};

// ============= OFFLINE QUEUE =============

export const addToOfflineQueue = async (
  userId: string,
  action: { type: string; data: any }
): Promise<string> => {
  const queueRef = collection(db, 'offlineQueue', userId, 'actions');
  const docRef = await addDoc(queueRef, {
    ...action,
    createdAt: Timestamp.now(),
    processed: false
  });
  return docRef.id;
};

export const fetchOfflineQueue = async (userId: string) => {
  const queueRef = collection(db, 'offlineQueue', userId, 'actions');
  const q = query(queueRef, where('processed', '==', false));
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

export const markQueueItemProcessed = async (
  userId: string,
  actionId: string
): Promise<void> => {
  const actionRef = doc(db, 'offlineQueue', userId, 'actions', actionId);
  await updateDoc(actionRef, {
    processed: true,
    processedAt: Timestamp.now()
  });
};

// ============= AUTHENTICATION =============

export const loginUser = async (email: string, password: string) => {
  // This will be implemented with Firebase Auth
  // For now, return mock data
  return { token: 'firebase-token', userId: 'user123' };
};

export const logoutUser = async () => {
  // Implement Firebase Auth logout
};
