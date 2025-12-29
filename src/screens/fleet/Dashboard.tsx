import React from 'react';
import { View, Text } from 'react-native';
import { Card } from 'react-native-paper';
import { Colors, Spacing, Radius } from '../../theme/tokens';

const kpis = [
  { label: 'Active trips', value: '12' },
  { label: 'Late', value: '3' },
  { label: 'Idle', value: '5' },
  { label: 'Revenue', value: '₹8.2L' }
];

export const FleetDashboard: React.FC = () => (
  <View style={{ flex: 1, backgroundColor: Colors.darkSurface }}>
    <View style={{ padding: Spacing.lg }}>
      <Text style={{ color: 'white', fontSize: 24, fontWeight: '800' }}>Ops Dashboard</Text>
    </View>
    <View style={{ flex: 1, backgroundColor: Colors.lightSurface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, gap: Spacing.md }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {kpis.map((k) => (
          <Card key={k.label} style={{ borderRadius: Radius.card, width: '47%' }}>
            <Card.Content>
              <Text style={{ color: Colors.textSecondary }}>{k.label}</Text>
              <Text style={{ color: Colors.textPrimary, fontSize: 22, fontWeight: '800' }}>{k.value}</Text>
            </Card.Content>
          </Card>
        ))}
      </View>
      <Card style={{ borderRadius: Radius.card }}>
        <Card.Title title="Active Trips" subtitle="Live overview" />
        <Card.Content>
          <Text style={{ color: Colors.textSecondary }}>TRK-1042 - On time</Text>
          <Text style={{ color: Colors.textSecondary }}>TRK-2040 - Assign driver</Text>
        </Card.Content>
      </Card>
    </View>
  </View>
);
