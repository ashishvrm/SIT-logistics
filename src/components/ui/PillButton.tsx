import React from 'react';
import { Button } from 'react-native-paper';
import { Radius, Shadows } from '../../theme/tokens';

interface Props {
  label: string;
  mode?: 'contained' | 'outlined' | 'text';
  onPress: () => void;
  icon?: string;
}

export const PillButton: React.FC<Props> = ({ label, mode = 'contained', onPress, icon }) => (
  <Button
    mode={mode}
    icon={icon}
    onPress={onPress}
    contentStyle={{ paddingVertical: 10 }}
    style={{ borderRadius: Radius.chip, marginVertical: 4, ...Shadows.soft }}
    labelStyle={{ fontWeight: '700', letterSpacing: 0 }}
  >
    {label}
  </Button>
);
