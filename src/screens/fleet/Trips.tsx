import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../../services/mockApi';
import { Colors, Spacing } from '../../theme/tokens';

export const FleetTrips: React.FC = () => {
  const { data } = useQuery({ queryKey: ['fleet-trips'], queryFn: () => mockApi.fetchTrips() });
  return (
    <View style={{ flex: 1, backgroundColor: Colors.darkSurface }}>
      <View style={{ padding: Spacing.lg }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>Trips</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: Colors.lightSurface, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <FlatList
          data={data || []}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', padding: Spacing.md, borderRadius: 16 }}>
              <Text style={{ color: Colors.textPrimary, fontWeight: '700' }}>{item.code}</Text>
              <Text style={{ color: Colors.textSecondary }}>{item.pickup} → {item.drop}</Text>
              <Text style={{ color: Colors.primary }}>{item.status}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};
