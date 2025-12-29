import React from 'react';
import { View, Text } from 'react-native';
import { Colors, Spacing, Radius } from '../../theme/tokens';
import { PillButton } from '../ui/PillButton';

interface Props {
  title: string;
  subtitle?: string;
  onPrimary?: () => void;
  primaryLabel?: string;
}

export const TrackingSheet: React.FC<Props> = ({ title, subtitle, onPrimary, primaryLabel }) => (
  <View
    style={{
      backgroundColor: Colors.lightSurface,
      borderTopLeftRadius: Radius.bottomSheet,
      borderTopRightRadius: Radius.bottomSheet,
      padding: Spacing.lg,
      gap: Spacing.md
    }}
  >
    <View>
      <Text style={{ color: Colors.textPrimary, fontSize: 18, fontWeight: '700' }}>{title}</Text>
      {subtitle && <Text style={{ color: Colors.textSecondary, marginTop: 4 }}>{subtitle}</Text>}
    </View>
    {primaryLabel && onPrimary && <PillButton label={primaryLabel} onPress={onPrimary} />}
  </View>
);
