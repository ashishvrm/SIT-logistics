import React from 'react';
import { View, Text } from 'react-native';
import { Card, ProgressBar } from 'react-native-paper';
import { Colors, Spacing, Radius } from '../../theme/tokens';
import { formatCurrency } from '../../utils/formatters';

export const DriverEarnings: React.FC = () => {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.darkSurface }}>
      <View style={{ padding: Spacing.lg }}>
        <Text style={{ color: 'white', fontSize: 22, fontWeight: '800' }}>Earnings</Text>
      </View>
      <View style={{ flex: 1, backgroundColor: Colors.lightSurface, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: Spacing.lg, gap: Spacing.md }}>
        <Card mode="elevated" style={{ borderRadius: Radius.card }}>
          <Card.Title title="This Week" subtitle="Payouts" />
          <Card.Content>
            <Text style={{ color: Colors.textPrimary, fontSize: 28, fontWeight: '800' }}>{formatCurrency(23500)}</Text>
            <ProgressBar progress={0.6} color={Colors.primary} style={{ marginTop: 12, height: 8, borderRadius: 8 }} />
          </Card.Content>
        </Card>
        <Card mode="elevated" style={{ borderRadius: Radius.card }}>
          <Card.Title title="Recent Trips" />
          <Card.Content>
            <Text style={{ color: Colors.textSecondary }}>TRK-1042 · {formatCurrency(6200)}</Text>
            <Text style={{ color: Colors.textSecondary }}>TRK-2040 · {formatCurrency(7800)}</Text>
          </Card.Content>
        </Card>
      </View>
    </View>
  );
};
