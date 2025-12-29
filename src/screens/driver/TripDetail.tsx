import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mockApi } from '../../services/mockApi';
import { Colors, Spacing } from '../../theme/tokens';
import { RouteSummary } from '../../components/maps/RouteSummary';
import { PillButton } from '../../components/ui/PillButton';
import { Trip } from '../../services/types';

export const DriverTripDetail: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const queryClient = useQueryClient();
  const { data: trip } = useQuery({ queryKey: ['trip', route.params.id], queryFn: () => mockApi.fetchTrips().then((t) => t.find((x) => x.id === route.params.id) as Trip) });
  const mutation = useMutation({
    mutationFn: (status: Trip['status']) => mockApi.updateTripStatus(route.params.id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['driver-trips'] })
  });

  if (!trip) return null;
  const nextAction = () => {
    const map: Record<Trip['status'], Trip['status']> = {
      Draft: 'Assigned',
      Assigned: 'Accepted',
      Accepted: 'Started',
      Started: 'PickupArrived',
      PickupArrived: 'Loaded',
      Loaded: 'InTransit',
      InTransit: 'DropArrived',
      DropArrived: 'PODSubmitted',
      PODSubmitted: 'Completed',
      Completed: 'Completed'
    };
    mutation.mutate(map[trip.status]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.darkSurface }}>
      <ScrollView contentContainerStyle={{ backgroundColor: Colors.lightSurface, padding: Spacing.lg, gap: Spacing.md }}>
        <Text style={{ color: Colors.textPrimary, fontSize: 22, fontWeight: '800' }}>{trip.code}</Text>
        <Text style={{ color: Colors.textSecondary }}>{trip.pickup} → {trip.drop}</Text>
        <RouteSummary distance={trip.distanceKm} eta={trip.eta} checkpoints={trip.checkpoints} />
        <View style={{ gap: 8 }}>
          <Text style={{ color: Colors.textPrimary, fontWeight: '700' }}>Cargo</Text>
          <Text style={{ color: Colors.textSecondary }}>{trip.cargo}</Text>
        </View>
        <PillButton label="Track Live" onPress={() => navigation.navigate('DriverTracking' as never, { id: trip.id } as never)} />
        <PillButton label={`Mark ${trip.status === 'DropArrived' ? 'POD Submitted' : 'Next Stage'}`} onPress={nextAction} />
      </ScrollView>
    </View>
  );
};
