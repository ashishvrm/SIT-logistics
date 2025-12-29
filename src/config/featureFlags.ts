/**
 * Feature Flags for Firebase Integration
 * 
 * This allows gradual rollout of Firebase without breaking existing functionality.
 * Screens can be enabled one at a time.
 */

export const FIREBASE_FEATURES = {
  // Master switch - set to true after seeding data
  ENABLED: true,
  
  // Per-screen feature flags
  SCREENS: {
    DRIVER_HOME: true,
    DRIVER_TRIPS: true,
    DRIVER_TRACKING: true,
    DRIVER_EARNINGS: true,
    FLEET_DASHBOARD: true,
    FLEET_LIVE_MAP: true,
    FLEET_TRIPS: true,
    FLEET_FLEET: true,
    FLEET_BILLING: true,
    INBOX: true,
  },
  
  // Organization ID from seed script
  // IMPORTANT: Update this after running seedFirestore.ts
  ORG_ID: 'nZJx0kyyapZDo5P3XxCk',
  
  // Test user IDs (update after seeding)
  TEST_DRIVER_ID: 'ewQQdyrbi82x7qKokRHK',
  TEST_MANAGER_ID: '871yZdXPUJQdysRRyI84',
};

/**
 * Helper to check if Firebase should be used for a screen
 */
export const useFirebase = (screenName: keyof typeof FIREBASE_FEATURES.SCREENS): boolean => {
  return FIREBASE_FEATURES.ENABLED && FIREBASE_FEATURES.SCREENS[screenName];
};
