import React from 'react';
import { View, Text } from 'react-native';
import { Switch, List } from 'react-native-paper';
import { Colors, Spacing } from '../../theme/tokens';
import { useSessionStore } from '../../store/session';
import { PillButton } from '../../components/ui/PillButton';

export const DriverProfile: React.FC = () => {
  const offlineMode = useSessionStore((s) => s.offlineMode);
  const toggleOffline = useSessionStore((s) => s.toggleOffline);
  const reset = useSessionStore((s) => s.reset);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.darkSurface }}>
      <View style={{ padding: Spacing.lg }}>
        <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Profile & Settings</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: Colors.lightSurface, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
        <List.Section>
          <List.Item title="Developer Offline Mode" right={() => <Switch value={offlineMode} onValueChange={toggleOffline} />} />
          <List.Item title="Offline Queue" description="Retry pending actions" onPress={() => {}} />
        </List.Section>
        <View style={{ padding: Spacing.lg }}>
          <PillButton label="Logout" mode="outlined" onPress={reset} />
        </View>
      </View>
    </View>
  );
};
