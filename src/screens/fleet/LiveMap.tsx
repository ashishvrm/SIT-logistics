import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { fetchTrips, fetchVehicles, fetchInvoices, fetchNotifications } from '../../services/dataService';
import { FIREBASE_FEATURES } from '../../config/featureFlags';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { MapControls } from '../../components/maps/MapControls';
import { gpsEvents } from '../../services/gpsSimulator';
import { Vehicle } from '../../services/types';

export const FleetLiveMap: React.FC = () => {
  const { data: initialVehicles } = useQuery({ queryKey: ['vehicles'], queryFn: () => fetchVehicles(FIREBASE_FEATURES.ORG_ID) });
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles || []);
  const [region, setRegion] = useState<Region | undefined>(
    initialVehicles?.[0]
      ? { latitude: initialVehicles[0].lat, longitude: initialVehicles[0].lng, latitudeDelta: 1, longitudeDelta: 1 }
      : undefined
  );

  useEffect(() => {
    const handler = (v: Vehicle[]) => setVehicles([...v]);
    gpsEvents.on('positions', handler);
    return () => gpsEvents.off('positions', handler);
  }, []);

  const movingCount = vehicles.filter((v) => v.status === 'moving' || v.status === 'on-trip').length;
  const idleCount = vehicles.filter((v) => v.status === 'idle').length;

  return (
    <View style={styles.container}>
      <MapView style={styles.map} region={region} initialRegion={region}>
        {vehicles.map((v) => (
          <Marker 
            key={v.id} 
            coordinate={{ latitude: v.lat, longitude: v.lng }}
          >
            <View style={styles.markerContainer}>
              <View style={[
                styles.marker,
                { backgroundColor: v.status === 'on-trip' ? Colors.primary : v.status === 'idle' ? Colors.warning : Colors.success }
              ]}>
                <Text style={styles.markerText}>🚛</Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>
      
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Fleet Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.statText}>Moving {movingCount}</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statDot, { backgroundColor: Colors.warning }]} />
            <Text style={styles.statText}>Idle {idleCount}</Text>
          </View>
        </View>
      </View>

      <MapControls onLocate={() => region && setRegion({ ...region })} onLayers={() => {}} />
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
  statsCard: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: Colors.lightSurface,
    padding: Spacing.lg,
    borderRadius: Radius.cardLarge,
    ...Shadows.card
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  markerContainer: {
    alignItems: 'center'
  },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft
  },
  markerText: {
    fontSize: 18
  }
});
