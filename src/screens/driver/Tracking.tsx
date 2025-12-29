import React, { useEffect, useState } from 'react';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchTrips, fetchVehicles, fetchInvoices, fetchNotifications } from '../../services/dataService';
import { FIREBASE_FEATURES } from '../../config/featureFlags';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { MapControls } from '../../components/maps/MapControls';
import { gpsEvents } from '../../services/gpsSimulator';
import { Vehicle } from '../../services/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const DriverTracking: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const { data: trip } = useQuery({ queryKey: ['trip', route.params.id], queryFn: () => fetchTrips(FIREBASE_FEATURES.ORG_ID).then((t) => t.find((x) => x.id === route.params.id)!) });
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [region, setRegion] = useState<Region | undefined>();

  useEffect(() => {
    const handler = (vehicles: Vehicle[]) => {
      const v = vehicles.find((x) => x.id === trip?.vehicleId);
      if (v) {
        setVehicle({ ...v });
        setRegion({ latitude: v.lat, longitude: v.lng, latitudeDelta: 0.2, longitudeDelta: 0.2 });
      }
    };
    gpsEvents.on('positions', handler);
    return () => {
      gpsEvents.off('positions', handler);
    };
  }, [trip]);

  if (!trip) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Icon name="chevron-left" size={28} color={Colors.textLight} />
      </TouchableOpacity>

      <MapView
        style={styles.map}
        provider="google"
        initialRegion={region}
        region={region}
      >
        {vehicle && (
          <Marker coordinate={{ latitude: vehicle.lat, longitude: vehicle.lng }}>
            <View style={styles.vehicleMarker}>
              <Text style={styles.vehicleMarkerText}>🚛</Text>
            </View>
          </Marker>
        )}
        <Polyline 
          coordinates={trip.route.map((p) => ({ latitude: p.lat, longitude: p.lng }))} 
          strokeColor={Colors.primary} 
          strokeWidth={4} 
        />
      </MapView>

      <MapControls onLocate={() => region && setRegion({ ...region })} onLayers={() => {}} />

      <View style={styles.bottomSheet}>
        <View style={styles.sheetHandle} />
        <Text style={styles.sheetTitle}>{trip.code}</Text>
        <Text style={styles.sheetSubtitle}>{trip.pickup} → {trip.drop}</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Icon name="speedometer" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{vehicle?.speed || 0} km/h</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="map" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoText}>{trip.distanceKm} km</Text>
          </View>
          <View style={styles.infoItem}>
            <Icon name="clock-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.infoText}>
              {Math.floor(trip.distanceKm / 40)}h {Math.floor((trip.distanceKm / 40) * 60) % 60}m
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionButtonText}>Arrived at Pickup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  map: {
    flex: 1
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.darkSurface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card
  },
  vehicleMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.card
  },
  vehicleMarkerText: {
    fontSize: 20
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.lightSurface,
    borderTopLeftRadius: Radius.bottomSheet,
    borderTopRightRadius: Radius.bottomSheet,
    padding: Spacing.lg,
    ...Shadows.card
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  sheetSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  infoItem: {
    alignItems: 'center',
    gap: 8
  },
  infoText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: Radius.button,
    alignItems: 'center'
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textLight
  }
});
