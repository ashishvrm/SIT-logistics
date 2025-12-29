import React from 'react';
import { View } from 'react-native';
import { Radius, Shadows, Spacing, Colors } from '../../theme/tokens';

export const Sheet: React.FC<{ children: React.ReactNode; padded?: boolean }>
 = ({ children, padded = true }) => (
  <View
    style={{
      backgroundColor: Colors.lightSurface,
      borderTopLeftRadius: Radius.bottomSheet,
      borderTopRightRadius: Radius.bottomSheet,
      padding: padded ? Spacing.lg : 0,
      ...Shadows.soft
    }}
  >
    {children}
  </View>
);
