import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { useSessionStore } from '../../store/session';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export const DriverProfile: React.FC = () => {
  const navigation = useNavigation();
  const offlineMode = useSessionStore((s) => s.offlineMode);
  const toggleOffline = useSessionStore((s) => s.toggleOffline);
  const reset = useSessionStore((s) => s.reset);
  const role = useSessionStore((s) => s.role);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkGradientStart, Colors.darkGradientEnd]}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Icon name="account" size={48} color={Colors.textLight} />
          </View>
          <Text style={styles.profileName}>Arjun Singh</Text>
          <Text style={styles.profileRole}>{role} Account</Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Icon name="account-circle" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Edit Profile</Text>
            <Icon name="chevron-right" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Icon name="shield-check" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Privacy & Security</Text>
            <Icon name="chevron-right" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('OfflineQueue' as never)}
          >
            <View style={styles.menuIconContainer}>
              <Icon name="cloud-sync" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Offline Queue</Text>
            <Icon name="chevron-right" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Icon name="wifi-off" size={24} color={Colors.primary} />
            </View>
            <Text style={styles.menuText}>Offline Mode</Text>
            <Switch 
              value={offlineMode} 
              onValueChange={toggleOffline}
              trackColor={{ false: Colors.border, true: Colors.primary }}
              thumbColor={Colors.lightSurface}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={reset}>
          <Icon name="logout" size={20} color={Colors.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center'
  },
  profileSection: {
    alignItems: 'center'
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textLight,
    marginBottom: 4
  },
  profileRole: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  content: {
    flex: 1,
    padding: Spacing.lg
  },
  card: {
    backgroundColor: Colors.lightSurface,
    borderRadius: Radius.cardLarge,
    overflow: 'hidden',
    ...Shadows.card
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.lightSurface,
    paddingVertical: 16,
    borderRadius: Radius.button,
    marginTop: 16,
    gap: 8,
    borderWidth: 2,
    borderColor: Colors.error
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.error
  }
});
