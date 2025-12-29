import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../../services/mockApi';
import { Colors, Spacing } from '../../theme/tokens';

export const FleetFleet: React.FC = () => {
  const { data } = useQuery({ queryKey: ['vehicles'], queryFn: () => mockApi.fetchVehicles() });
  return (
    <View style={{ flex: 1, backgroundColor: Colors.darkSurface }}>
      <View style={{ padding: Spacing.lg }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>Fleet</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: Colors.lightSurface, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <FlatList
          data={data || []}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', padding: Spacing.md, borderRadius: 16 }}>
              <Text style={{ color: Colors.textPrimary, fontWeight: '700' }}>{item.plate}</Text>
              <Text style={{ color: Colors.textSecondary }}>{item.model}</Text>
              <Text style={{ color: Colors.primary }}>{item.status}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};
