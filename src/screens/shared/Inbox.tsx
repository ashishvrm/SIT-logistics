import React from 'react';
import { FlatList, View, Text } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { mockApi } from '../../services/mockApi';
import { Colors, Spacing } from '../../theme/tokens';

export const DriverInbox: React.FC = () => {
  const { data } = useQuery({ queryKey: ['notifications'], queryFn: () => mockApi.fetchNotifications() });
  return (
    <View style={{ flex: 1, backgroundColor: Colors.darkSurface }}>
      <View style={{ padding: Spacing.lg }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>Notifications</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: Colors.lightSurface, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <FlatList
          contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}
          data={data || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', padding: Spacing.md, borderRadius: 16 }}>
              <Text style={{ color: Colors.textPrimary, fontWeight: '700' }}>{item.title}</Text>
              <Text style={{ color: Colors.textSecondary }}>{item.message}</Text>
            </View>
          )}
        />
      </View>
    </View>
  );
};
