/**
 * Unified Data Service
 * 
 * Automatically routes to Firebase or Mock API based on feature flags.
 * This ensures zero breaking changes during migration.
 */

import { mockApi } from './mockApi';
import * as firebaseService from './firebaseService';
import { FIREBASE_FEATURES } from '../config/featureFlags';
import type { Trip, Driver, Vehicle, Invoice, NotificationItem } from './types';

// ============= TRIPS =============

export const fetchTrips = async (
  orgId?: string,
  status?: any,
  driverId?: string
): Promise<Trip[]> => {
  if (FIREBASE_FEATURES.ENABLED && orgId) {
    console.log('📡 Fetching trips from Firebase...');
    return firebaseService.fetchTrips(orgId, status, driverId);
  }
  console.log('🔧 Fetching trips from Mock API...');
  return mockApi.fetchTrips();
};

export const fetchTrip = async (tripId: string): Promise<Trip | null> => {
  if (FIREBASE_FEATURES.ENABLED) {
    console.log('📡 Fetching trip from Firebase...', tripId);
    const trip = await firebaseService.fetchTrip(tripId);
    // Fallback to mock if not found in Firebase
    if (!trip) {
      console.log('⚠️  Trip not in Firebase, falling back to Mock API...');
      const trips = await mockApi.fetchTrips();
      return trips.find(t => t.id === tripId) || null;
    }
    return trip;
  }
  console.log('🔧 Fetching trip from Mock API...', tripId);
  const trips = await mockApi.fetchTrips();
  return trips.find(t => t.id === tripId) || null;
};

export const updateTripStatus = async (tripId: string, status: any): Promise<void> => {
  if (FIREBASE_FEATURES.ENABLED) {
    console.log('📡 Updating trip status in Firebase...');
    return firebaseService.updateTripStatus(tripId, status);
  }
  console.log('🔧 Mock: Trip status updated (not persisted)');
  return Promise.resolve();
};

// ============= VEHICLES =============

export const fetchVehicles = async (orgId?: string): Promise<Vehicle[]> => {
  if (FIREBASE_FEATURES.ENABLED && orgId) {
    console.log('📡 Fetching vehicles from Firebase...');
    return firebaseService.fetchVehicles(orgId);
  }
  console.log('🔧 Fetching vehicles from Mock API...');
  return mockApi.fetchVehicles();
};

export const updateVehicleLocation = async (
  vehicleId: string,
  location: { lat: number; lng: number; speed: number; heading: number }
): Promise<void> => {
  if (FIREBASE_FEATURES.ENABLED) {
    console.log('📡 Updating vehicle location in Firebase...');
    return firebaseService.updateVehicleLocation(vehicleId, location);
  }
  console.log('🔧 Mock: Vehicle location updated (not persisted)');
  return Promise.resolve();
};

export const subscribeToVehicles = (
  orgId: string,
  callback: (vehicles: Vehicle[]) => void
) => {
  if (FIREBASE_FEATURES.ENABLED) {
    console.log('📡 Subscribing to vehicles in Firebase...');
    return firebaseService.subscribeToVehicles(orgId, callback);
  }
  console.log('🔧 Mock: No real-time subscription (using mock data)');
  // Return no-op unsubscribe for mock mode
  return () => {};
};

// ============= DRIVERS =============

export const fetchDrivers = async (orgId?: string): Promise<Driver[]> => {
  if (FIREBASE_FEATURES.ENABLED && orgId) {
    console.log('📡 Fetching drivers from Firebase...');
    return firebaseService.fetchDrivers(orgId);
  }
  console.log('🔧 Fetching drivers from Mock API...');
  // Mock API doesn't have drivers endpoint, return empty array
  return [];
};

// ============= INVOICES =============

export const fetchInvoices = async (orgId?: string): Promise<Invoice[]> => {
  if (FIREBASE_FEATURES.ENABLED && orgId) {
    console.log('📡 Fetching invoices from Firebase...');
    return firebaseService.fetchInvoices(orgId);
  }
  console.log('🔧 Fetching invoices from Mock API...');
  return mockApi.fetchInvoices();
};

// ============= NOTIFICATIONS =============

export const fetchNotifications = async (userId?: string): Promise<NotificationItem[]> => {
  if (FIREBASE_FEATURES.ENABLED && userId) {
    console.log('📡 Fetching notifications from Firebase...');
    return firebaseService.fetchNotifications(userId);
  }
  console.log('🔧 Fetching notifications from Mock API...');
  return mockApi.fetchNotifications();
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  if (FIREBASE_FEATURES.ENABLED) {
    console.log('📡 Marking notification as read in Firebase...');
    return firebaseService.markNotificationAsRead(notificationId);
  }
  console.log('🔧 Mock: Notification marked as read (not persisted)');
  return Promise.resolve();
};

export const subscribeToNotifications = (
  userId: string,
  callback: (notifications: NotificationItem[]) => void
) => {
  if (FIREBASE_FEATURES.ENABLED) {
    console.log('📡 Subscribing to notifications in Firebase...');
    return firebaseService.subscribeToNotifications(userId, callback);
  }
  console.log('🔧 Mock: No real-time subscription (using mock data)');
  return () => {};
};

// ============= TRIPS (CREATE/UPDATE) =============

export const createTrip = async (tripData: Omit<Trip, 'id'>): Promise<string> => {
  if (FIREBASE_FEATURES.ENABLED) {
    console.log('📡 Creating trip in Firebase...');
    return firebaseService.createTrip(tripData);
  }
  console.log('🔧 Mock: Trip created (not persisted)');
  return Promise.resolve(`mock-trip-${Date.now()}`);
};

// Export all other Firebase functions for direct use when needed
export * from './firebaseService';
