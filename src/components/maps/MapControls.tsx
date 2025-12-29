import React from 'react';
import { View, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { Colors, Radius, Shadows } from '../../theme/tokens';

interface Props {
  onLocate: () => void;
  onLayers: () => void;
}

export const MapControls: React.FC<Props> = ({ onLocate, onLayers }) => (
  <View style={styles.container}>
    <IconButton icon="crosshairs-gps" containerColor={Colors.lightSurface} style={styles.button} onPress={onLocate} />
    <IconButton icon="layers" containerColor={Colors.lightSurface} style={styles.button} onPress={onLayers} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 32,
    gap: 8
  },
  button: {
    borderRadius: Radius.card,
    ...Shadows.soft
  }
});
