import React, { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Chip } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../../services/mockApi';
import { Colors, Spacing } from '../../theme/tokens';
import { TripStatus } from '../../services/types';

const filters: TripStatus[] = ['Assigned', 'Accepted', 'InTransit', 'Completed'];

export const DriverTrips: React.FC = () => {
  const [filter, setFilter] = useState<TripStatus | undefined>();
  const navigation = useNavigation();
  const { data } = useQuery({ queryKey: ['driver-trips', filter], queryFn: () => mockApi.fetchTrips(filter) });

  return (
    <View style={{ flex: 1, backgroundColor: Colors.darkSurface }}>
      <View style={{ padding: Spacing.lg, gap: Spacing.sm }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>Trips</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip selected={!filter} onPress={() => setFilter(undefined)} mode="outlined">All</Chip>
          {filters.map((f) => (
            <Chip key={f} selected={filter === f} onPress={() => setFilter(f)} mode="outlined">{f}</Chip>
          ))}
        </View>
      </View>
      <View style={{ flex: 1, backgroundColor: Colors.lightSurface, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <FlatList
          data={data || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', padding: Spacing.md, borderRadius: 16 }}>
              <Text style={{ color: Colors.textPrimary, fontWeight: '700' }}>{item.code}</Text>
              <Text style={{ color: Colors.textSecondary }}>{item.pickup} → {item.drop}</Text>
              <Text style={{ color: Colors.primary, marginTop: 4 }}>{item.status}</Text>
              <Text style={{ color: Colors.textSecondary }}>ETA {new Date(item.eta).toLocaleTimeString()}</Text>
              <Text style={{ color: Colors.textSecondary }}>Distance {item.distanceKm} km</Text>
              <Text style={{ color: Colors.textSecondary }}>Cargo {item.cargo}</Text>
              <Text onPress={() => navigation.navigate('DriverTripDetail' as never, { id: item.id } as never)} style={{ color: Colors.primary, marginTop: 8, fontWeight: '700' }}>Open</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};
