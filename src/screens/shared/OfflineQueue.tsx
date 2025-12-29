import React from 'react';
import { View, Text, FlatList } from 'react-native';
import { Colors, Spacing } from '../../theme/tokens';
import { useOfflineQueue } from '../../store/offlineQueue';
import { PillButton } from '../../components/ui/PillButton';

export const OfflineQueueScreen: React.FC = () => {
  const { queue, clear, remove } = useOfflineQueue();
  return (
    <View style={{ flex: 1, backgroundColor: Colors.darkSurface }}>
      <View style={{ padding: Spacing.lg }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Offline Queue</Text>
        <Text style={{ color: Colors.textSecondary }}>Pending submissions stored locally.</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: Colors.lightSurface, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <FlatList
          data={queue}
          keyExtractor={(i) => i.id}
          contentContainerStyle={{ padding: Spacing.lg, gap: 12 }}
          ListEmptyComponent={<Text style={{ color: Colors.textSecondary }}>No pending items.</Text>}
          renderItem={({ item }) => (
            <View style={{ backgroundColor: '#fff', padding: Spacing.md, borderRadius: 16 }}>
              <Text style={{ color: Colors.textPrimary, fontWeight: '700' }}>{item.type}</Text>
              <Text style={{ color: Colors.textSecondary }}>{item.createdAt}</Text>
              <PillButton label="Remove" mode="outlined" onPress={() => remove(item.id)} />
            </View>
          )}
        />
        {queue.length > 0 && <PillButton label="Retry All (mock)" onPress={clear} />}
      </View>
    </View>
  );
};
