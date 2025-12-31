import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Spacing } from '../../theme/tokens';

interface Props {
  title: string;
  onBack?: () => void;
  actions?: React.ReactNode;
}

export const AppBar: React.FC<Props> = ({ title, onBack, actions }) => (
  <View style={styles.header}>
    {onBack && (
      <TouchableOpacity onPress={onBack} style={styles.backButton}>
        <Icon name="arrow-left" size={24} color="white" />
      </TouchableOpacity>
    )}
    <Text style={styles.title}>{title}</Text>
    {actions}
  </View>
);

const styles = StyleSheet.create({
  header: {
    backgroundColor: Colors.darkSurface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    height: 56
  },
  backButton: {
    padding: Spacing.sm,
    marginRight: Spacing.sm
  },
  title: {
    color: 'white',
    fontWeight: '700',
    fontSize: 20,
    flex: 1
  }
});
