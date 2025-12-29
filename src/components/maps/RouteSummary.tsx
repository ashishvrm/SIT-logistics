import React from 'react';
import { View, Text } from 'react-native';
import { Colors, Spacing } from '../../theme/tokens';

export const RouteSummary: React.FC<{ distance: number; eta: string; checkpoints: string[] }> = ({ distance, eta, checkpoints }) => (
  <View style={{ padding: Spacing.md, backgroundColor: Colors.lightSurface, borderRadius: 16 }}>
    <Text style={{ color: Colors.textPrimary, fontWeight: '700', marginBottom: 4 }}>Route</Text>
    <Text style={{ color: Colors.textSecondary }}>Distance {distance} km · ETA {new Date(eta).toLocaleTimeString()}</Text>
    <View style={{ marginTop: 8, gap: 4 }}>
      {checkpoints.map((c) => (
        <Text key={c} style={{ color: Colors.textPrimary }}>
          • {c}
        </Text>
      ))}
    </View>
  </View>
);
