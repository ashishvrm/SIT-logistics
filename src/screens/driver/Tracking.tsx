import React, { useEffect, useState } from 'react';
import MapView, { Marker, Polyline, Region } from 'react-native-maps';
import { View, Text } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../../services/mockApi';
import { Colors, Spacing } from '../../theme/tokens';
import { MapControls } from '../../components/maps/MapControls';
import { TrackingSheet } from '../../components/maps/TrackingSheet';
import { gpsEvents } from '../../services/gpsSimulator';
import { Vehicle } from '../../services/types';

export const DriverTracking: React.FC = () => {
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const { data: trip } = useQuery({ queryKey: ['trip', route.params.id], queryFn: () => mockApi.fetchTrips().then((t) => t.find((x) => x.id === route.params.id)!) });
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
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        provider="google"
        initialRegion={region}
        region={region}
      >
        {vehicle && <Marker coordinate={{ latitude: vehicle.lat, longitude: vehicle.lng }} title={vehicle.plate} />} 
        <Polyline coordinates={trip.route.map((p) => ({ latitude: p.lat, longitude: p.lng }))} strokeColor={Colors.primary} strokeWidth={4} />
      </MapView>
      <MapControls onLocate={() => region && setRegion({ ...region })} onLayers={() => {}} />
      <TrackingSheet title={trip.code} subtitle={`${trip.pickup} → ${trip.drop}`} primaryLabel="Arrived Pickup" onPrimary={() => {}} />
    </View>
  );
};
