import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Radius, Shadows } from '../../theme/tokens';

interface Props {
  onLocate: () => void;
  onLayers: () => void;
}

export const MapControls: React.FC<Props> = ({ onLocate, onLayers }) => (
  <View style={styles.container}>
    <TouchableOpacity style={styles.button} onPress={onLocate}>
      <Icon name="crosshairs-gps" size={24} color={Colors.primary} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.button} onPress={onLayers}>
      <Icon name="layers" size={24} color={Colors.primary} />
    </TouchableOpacity>
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
    backgroundColor: Colors.lightSurface,
    width: 48,
    height: 48,
    borderRadius: Radius.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft
  }
});
