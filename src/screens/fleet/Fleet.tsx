import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchTrips, fetchVehicles, fetchInvoices, fetchNotifications } from '../../services/dataService';
import { FIREBASE_FEATURES } from '../../config/featureFlags';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserMenu } from '../../components/ui/UserMenu';

export const FleetFleet: React.FC = () => {
  const { data } = useQuery({ queryKey: ['vehicles'], queryFn: () => fetchVehicles(FIREBASE_FEATURES.ORG_ID) });
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-trip':
        return Colors.primary;
      case 'idle':
        return Colors.warning;
      case 'offline':
        return Colors.error;
      default:
        return Colors.success;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'on-trip':
        return 'On Trip';
      case 'idle':
        return 'Idle';
      case 'offline':
        return 'Offline';
      default:
        return 'Moving';
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkGradientStart, Colors.darkGradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Fleet Management</Text>
            <Text style={styles.headerSubtitle}>{data?.length || 0} vehicles registered</Text>
          </View>
          <UserMenu />
        </View>
      </LinearGradient>

      <FlatList
        data={data || []}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.vehicleCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.truckIcon, { backgroundColor: `${getStatusColor(item.status)}20` }]}>
                <Icon name="truck" size={32} color={getStatusColor(item.status)} />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.plateNumber}>{item.plate}</Text>
                <Text style={styles.vehicleModel}>{item.model}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
              </View>
            </View>

            <View style={styles.separator} />

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Icon name="speedometer" size={20} color={Colors.textSecondary} />
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>{item.speed} km/h</Text>
                  <Text style={styles.statLabel}>Speed</Text>
                </View>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Icon name="compass" size={20} color={Colors.textSecondary} />
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>{item.heading}°</Text>
                  <Text style={styles.statLabel}>Heading</Text>
                </View>
              </View>
              
              <View style={styles.statDivider} />
              
              <View style={styles.statItem}>
                <Icon name="map-marker" size={20} color={Colors.textSecondary} />
                <View style={styles.statInfo}>
                  <Text style={styles.statValue}>{item.lat.toFixed(2)}</Text>
                  <Text style={styles.statLabel}>Location</Text>
                </View>
              </View>
            </View>

            {item.driverId && (
              <View style={styles.driverSection}>
                <Icon name="account" size={20} color={Colors.primary} />
                <Text style={styles.driverText}>
                  Driver: {item.driverId === 'd1' ? 'Arjun Singh' : 'Meera Iyer'}
                </Text>
              </View>
            )}

            <View style={styles.footer}>
              <Text style={styles.lastSeenText}>
                Last seen: {new Date(item.lastSeen).toLocaleTimeString()}
              </Text>
              <Icon name="chevron-right" size={20} color={Colors.primary} />
            </View>
          </View>
        )}
      />
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
    paddingBottom: 24,
    paddingHorizontal: Spacing.lg
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textLight,
    marginBottom: 8
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  listContent: {
    padding: Spacing.lg,
    gap: 16
  },
  vehicleCard: {
    backgroundColor: Colors.lightSurface,
    borderRadius: Radius.cardLarge,
    padding: Spacing.lg,
    ...Shadows.card
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  truckIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center'
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12
  },
  plateNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4
  },
  vehicleModel: {
    fontSize: 14,
    color: Colors.textSecondary
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.chip
  },
  statusText: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600'
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 16
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  statInfo: {
    alignItems: 'flex-start'
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 2
  },
  statLabel: {
    fontSize: 11,
    color: Colors.textSecondary
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: Colors.border
  },
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}10`,
    padding: 12,
    borderRadius: Radius.button,
    marginBottom: 12,
    gap: 8
  },
  driverText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  lastSeenText: {
    fontSize: 12,
    color: Colors.textSecondary
  }
});
