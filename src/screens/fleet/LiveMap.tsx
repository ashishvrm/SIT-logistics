import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../../services/mockApi';
import { Colors, Spacing } from '../../theme/tokens';
import { MapControls } from '../../components/maps/MapControls';
import { gpsEvents } from '../../services/gpsSimulator';
import { Vehicle } from '../../services/types';

export const FleetLiveMap: React.FC = () => {
  const { data: initialVehicles } = useQuery({ queryKey: ['vehicles'], queryFn: () => mockApi.fetchVehicles() });
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

  return (
    <View style={{ flex: 1 }}>
      <MapView style={{ flex: 1 }} region={region} initialRegion={region}>
        {vehicles.map((v) => (
          <Marker key={v.id} coordinate={{ latitude: v.lat, longitude: v.lng }} title={v.plate} description={v.status} />
        ))}
      </MapView>
      <MapControls onLocate={() => region && setRegion({ ...region })} onLayers={() => {}} />
      <View style={{ position: 'absolute', top: 50, left: 20, backgroundColor: Colors.darkSurface, padding: Spacing.md, borderRadius: 16 }}>
        <Text style={{ color: 'white', fontWeight: '700' }}>Fleet Overview</Text>
        <Text style={{ color: Colors.textSecondary }}>Moving {vehicles.filter((v) => v.status === 'moving' || v.status === 'on-trip').length} · Idle {vehicles.filter((v) => v.status === 'idle').length}</Text>
      </View>
    </View>
  );
};
