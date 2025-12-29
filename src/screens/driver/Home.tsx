import React from 'react';
import { View, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../../services/mockApi';
import { Colors, Spacing, Radius } from '../../theme/tokens';
import { PillButton } from '../../components/ui/PillButton';
import { formatTime } from '../../utils/formatters';

export const DriverHome: React.FC = () => {
  const navigation = useNavigation();
  const { data: trips } = useQuery({ queryKey: ['driver-trips'], queryFn: () => mockApi.fetchTrips() });
  const active = trips?.find((t) => t.status === 'InTransit' || t.status === 'Assigned');

  return (
    <View style={{ flex: 1, backgroundColor: Colors.darkSurface }}>
      <View style={{ padding: Spacing.lg, paddingBottom: Spacing.md }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Welcome back</Text>
        <Text style={{ color: Colors.textSecondary }}>Track your active trips and documents.</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: Colors.lightSurface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, gap: Spacing.lg }}>
        {active && (
          <Card mode="elevated" style={{ borderRadius: Radius.card }}>
            <Card.Title title={active.code} subtitle={`${active.pickup} → ${active.drop}`} />
            <Card.Content>
              <Text style={{ color: Colors.textSecondary }}>ETA {formatTime(active.eta)} · {active.distanceKm} km</Text>
              <PillButton label="Open Trip" onPress={() => navigation.navigate('DriverTripDetail' as never, { id: active.id } as never)} />
            </Card.Content>
          </Card>
        )}
        <Card mode="elevated" style={{ borderRadius: Radius.card }}>
          <Card.Title title="Quick Actions" />
          <Card.Content>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <PillButton label="Checklist" mode="outlined" onPress={() => navigation.navigate('DriverTrips' as never)} />
              <PillButton label="SOS" onPress={() => navigation.navigate('DriverTracking' as never)} />
            </View>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
};
