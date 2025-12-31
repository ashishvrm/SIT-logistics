import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Radius, Shadows, Colors } from '../../theme/tokens';

interface Props {
  label: string;
  mode?: 'contained' | 'outlined' | 'text';
  onPress: () => void;
  icon?: string;
}

export const PillButton: React.FC<Props> = ({ label, mode = 'contained', onPress, icon }) => (
  <TouchableOpacity
    style={[styles.button, mode === 'outlined' && styles.outlined, mode === 'text' && styles.text]}
    onPress={onPress}
  >
    {icon && <Icon name={icon} size={18} color={mode === 'contained' ? Colors.textLight : Colors.primary} style={styles.icon} />}
    <Text style={[styles.label, mode === 'outlined' && styles.outlinedLabel, mode === 'text' && styles.textLabel]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: Radius.chip,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    ...Shadows.soft
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary
  },
  text: {
    backgroundColor: 'transparent'
  },
  icon: {
    marginRight: 8
  },
  label: {
    color: Colors.textLight,
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0
  },
  outlinedLabel: {
    color: Colors.primary
  },
  textLabel: {
    color: Colors.primary
  }
});
