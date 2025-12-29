import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Shadows } from '../../theme/tokens';

export const VehiclePin: React.FC<{ label: string; status: string }> = ({ label, status }) => (
  <View style={[styles.container, status === 'offline' && { opacity: 0.6 }]}> 
    <Text style={styles.text}>{label}</Text>
    <Text style={styles.badge}>{status}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lightSurface,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.card,
    ...Shadows.soft,
    alignItems: 'center'
  },
  text: { color: Colors.textPrimary, fontWeight: '700' },
  badge: { color: Colors.primary, fontSize: 12, textTransform: 'capitalize' }
});
