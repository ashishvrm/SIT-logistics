import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSessionStore } from '../store/session';
import { Colors } from '../theme/tokens';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthFlow } from '../screens/shared/AuthFlow';
import { DriverHome } from '../screens/driver/Home';
import { DriverTrips } from '../screens/driver/Trips';
import { DriverTripDetail } from '../screens/driver/TripDetail';
import { DriverTracking } from '../screens/driver/Tracking';
import { DriverEarnings } from '../screens/driver/Earnings';
import { DriverInbox } from '../screens/shared/Inbox';
import { DriverProfile } from '../screens/shared/Profile';
import { OfflineQueueScreen } from '../screens/shared/OfflineQueue';
import { FleetDashboard } from '../screens/fleet/Dashboard';
import { FleetLiveMap } from '../screens/fleet/LiveMap';
import { FleetTrips } from '../screens/fleet/Trips';
import { FleetBilling } from '../screens/fleet/Billing';
import { FleetFleet } from '../screens/fleet/Fleet';

const Stack = createNativeStackNavigator();
const DriverTabs = createBottomTabNavigator();
const FleetTabs = createBottomTabNavigator();

const DriverTabNavigator = () => (
  <DriverTabs.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,
      tabBarStyle: { 
        backgroundColor: Colors.lightSurface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: 70,
        paddingBottom: 10,
        paddingTop: 10,
        borderTopWidth: 0,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -4 }
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600'
      }
    }}
  >
    <DriverTabs.Screen name="DriverHome" component={DriverHome} options={{ tabBarLabel: 'Home', tabBarIcon: ({ color, size }) => <Icon name="home" color={color} size={size} /> }} />
    <DriverTabs.Screen name="DriverTrips" component={DriverTrips} options={{ tabBarLabel: 'Trips', tabBarIcon: ({ color, size }) => <Icon name="truck" color={color} size={size} /> }} />
    <DriverTabs.Screen name="DriverEarnings" component={DriverEarnings} options={{ tabBarLabel: 'Earnings', tabBarIcon: ({ color, size }) => <Icon name="wallet" color={color} size={size} /> }} />
    <DriverTabs.Screen name="DriverInbox" component={DriverInbox} options={{ tabBarLabel: 'Inbox', tabBarIcon: ({ color, size }) => <Icon name="bell" color={color} size={size} /> }} />
    <DriverTabs.Screen name="DriverProfile" component={DriverProfile} options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <Icon name="account" color={color} size={size} /> }} />
  </DriverTabs.Navigator>
);

const FleetTabNavigator = () => (
  <FleetTabs.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textSecondary,
      tabBarStyle: { 
        backgroundColor: Colors.lightSurface,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: 70,
        paddingBottom: 10,
        paddingTop: 10,
        borderTopWidth: 0,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: -4 }
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600'
      }
    }}
  >
    <FleetTabs.Screen name="FleetDashboard" component={FleetDashboard} options={{ tabBarLabel: 'Dashboard', tabBarIcon: ({ color, size }) => <Icon name="view-dashboard" color={color} size={size} /> }} />
    <FleetTabs.Screen name="FleetLiveMap" component={FleetLiveMap} options={{ tabBarLabel: 'Live Map', tabBarIcon: ({ color, size }) => <Icon name="map" color={color} size={size} /> }} />
    <FleetTabs.Screen name="FleetTrips" component={FleetTrips} options={{ tabBarLabel: 'Trips', tabBarIcon: ({ color, size }) => <Icon name="clipboard-list" color={color} size={size} /> }} />
    <FleetTabs.Screen name="FleetFleet" component={FleetFleet} options={{ tabBarLabel: 'Fleet', tabBarIcon: ({ color, size }) => <Icon name="truck-fast" color={color} size={size} /> }} />
    <FleetTabs.Screen name="FleetBilling" component={FleetBilling} options={{ tabBarLabel: 'Billing', tabBarIcon: ({ color, size }) => <Icon name="cash" color={color} size={size} /> }} />
    <FleetTabs.Screen name="FleetProfile" component={DriverProfile} options={{ tabBarLabel: 'Profile', tabBarIcon: ({ color, size }) => <Icon name="account" color={color} size={size} /> }} />
  </FleetTabs.Navigator>
);

export const AppNavigator = () => {
  const loggedIn = useSessionStore((s) => s.loggedIn);
  const role = useSessionStore((s) => s.role);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!loggedIn ? (
        <Stack.Screen name="Auth" component={AuthFlow} />
      ) : role === 'Driver' ? (
        <>
          <Stack.Screen name="DriverTabs" component={DriverTabNavigator} />
          <Stack.Screen name="DriverTripDetail" component={DriverTripDetail} />
          <Stack.Screen name="DriverTracking" component={DriverTracking} />
          <Stack.Screen name="OfflineQueue" component={OfflineQueueScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="FleetTabs" component={FleetTabNavigator} />
          <Stack.Screen name="FleetTripDetail" component={DriverTripDetail} />
          <Stack.Screen name="FleetTracking" component={DriverTracking} />
        </>
      )}
    </Stack.Navigator>
  );
};
