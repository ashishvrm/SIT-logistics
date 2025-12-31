import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Alert } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { useSessionStore } from '../../store/session';
import { authService } from '../../services/authService';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const UserMenu: React.FC = () => {
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation<any>();
  const reset = useSessionStore((s) => s.reset);
  const phoneNumber = useSessionStore((s) => s.phoneNumber);
  const role = useSessionStore((s) => s.role);
  const org = useSessionStore((s) => s.org);

  const handleLogout = async () => {
    setMenuVisible(false);
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authService.signOut();
              reset();
            } catch (error) {
              console.error('Error logging out:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleProfilePress = () => {
    setMenuVisible(false);
    // Navigate to the correct profile screen based on role
    const profileScreen = role === 'Driver' ? 'DriverProfile' : 'FleetProfile';
    navigation.navigate(profileScreen as never);
  };

  return (
    <View>
      <TouchableOpacity 
        style={styles.avatarButton} 
        onPress={() => setMenuVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.avatar}>
          <Icon name="account" size={20} color={Colors.textLight} />
        </View>
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <View style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <View style={styles.menuAvatar}>
                <Icon name="account" size={32} color={Colors.textLight} />
              </View>
              <View style={styles.menuHeaderInfo}>
                <Text style={styles.menuHeaderName}>
                  {org?.name || 'User'}
                </Text>
                <Text style={styles.menuHeaderRole}>{role} Account</Text>
                {phoneNumber && (
                  <Text style={styles.menuHeaderPhone}>{phoneNumber}</Text>
                )}
              </View>
            </View>

            <View style={styles.menuDivider} />

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleProfilePress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemIconContainer}>
                <Icon name="account-circle" size={20} color={Colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Profile</Text>
              <Icon name="chevron-right" size={20} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemIconContainer}>
                <Icon name="logout" size={20} color={Colors.error} />
              </View>
              <Text style={[styles.menuItemText, { color: Colors.error }]}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  avatarButton: {
    padding: 4
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.soft
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    paddingTop: 60,
    paddingRight: Spacing.md
  },
  menuContainer: {
    backgroundColor: Colors.lightSurface,
    borderRadius: Radius.card,
    minWidth: 280,
    ...Shadows.card
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md
  },
  menuAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuHeaderInfo: {
    flex: 1
  },
  menuHeaderName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  menuHeaderRole: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginBottom: 2
  },
  menuHeaderPhone: {
    fontSize: 12,
    color: Colors.textSecondary
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.lg
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    gap: Spacing.md
  },
  menuItemIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center'
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary
  }
});
