import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchTrips, fetchVehicles, fetchInvoices, fetchNotifications } from '../../services/dataService';
import { FIREBASE_FEATURES } from '../../config/featureFlags';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const FleetTrips: React.FC = () => {
  const { data, isLoading, error } = useQuery({ 
    queryKey: ['fleet-trips'], 
    queryFn: () => fetchTrips(FIREBASE_FEATURES.ORG_ID) 
  });
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkGradientStart, Colors.darkGradientEnd]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>All Trips</Text>
        <Text style={styles.headerSubtitle}>{data?.length || 0} active shipments</Text>
      </LinearGradient>

      {isLoading && (
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading trips...</Text>
        </View>
      )}

      {error && (
        <View style={styles.centerContainer}>
          <Icon name="alert-circle" size={48} color={Colors.error} />
          <Text style={styles.errorText}>Failed to load trips</Text>
          <Text style={styles.errorDetails}>{String(error)}</Text>
        </View>
      )}

      {!isLoading && !error && data?.length === 0 && (
        <View style={styles.centerContainer}>
          <Icon name="truck-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.emptyText}>No trips found</Text>
        </View>
      )}

      {!isLoading && !error && data && data.length > 0 && (
        <FlatList
          data={data}
          keyExtractor={(i) => i.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.tripCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.tripCode}>{item.code}</Text>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: item.status === 'InTransit' ? Colors.statusDelivering : item.status === 'Completed' ? Colors.statusCompleted : Colors.warning }
                ]}>
                  <Text style={styles.statusText}>
                    {item.status === 'InTransit' ? 'In Transit' : item.status}
                  </Text>
                </View>
              </View>

              <View style={styles.driverSection}>
                <Icon name="account-circle" size={40} color={Colors.primary} />
                <View style={styles.driverInfo}>
                  <Text style={styles.driverLabel}>Driver</Text>
                  <Text style={styles.driverName}>
                    {item.driverId === 'd1' ? 'Arjun Singh' : 'Meera Iyer'}
                  </Text>
                </View>
                <View style={styles.vehicleTag}>
                  <Icon name="truck" size={16} color={Colors.primary} />
                  <Text style={styles.vehicleText}>
                    {item.vehicleId === 'v1' ? 'MH12 AB' : 'MH14 XY'}
                  </Text>
                </View>
              </View>

              <View style={styles.routeContainer}>
                <View style={styles.routePoint}>
                  <Icon name="circle" size={12} color={Colors.primary} />
                  <Text style={styles.routeText}>{item.pickup}</Text>
                </View>
                <View style={styles.routeLine} />
                <View style={styles.routePoint}>
                  <Icon name="map-marker" size={12} color={Colors.textSecondary} />
                  <Text style={styles.routeText}>{item.drop}</Text>
                </View>
              </View>

              <View style={styles.footer}>
                <View style={styles.footerItem}>
                  <Icon name="package-variant" size={18} color={Colors.textSecondary} />
                  <Text style={styles.footerText}>{item.cargo}</Text>
                </View>
                <View style={styles.footerItem}>
                  <Icon name="map" size={18} color={Colors.textSecondary} />
                  <Text style={styles.footerText}>{item.distanceKm} km</Text>
                </View>
              </View>

              <View style={styles.bottomRow}>
                <Text style={styles.customerText}>{item.customer}</Text>
                <TouchableOpacity style={styles.viewButton}>
                  <Text style={styles.viewButtonText}>View Details</Text>
                  <Icon name="chevron-right" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: Spacing.md
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.error,
    marginTop: Spacing.md
  },
  errorDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
    textAlign: 'center'
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: Spacing.md
  },
  listContent: {
    padding: Spacing.lg,
    gap: 16
  },
  tripCard: {
    backgroundColor: Colors.lightSurface,
    borderRadius: Radius.cardLarge,
    padding: Spacing.lg,
    ...Shadows.card
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  tripCode: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary
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
  driverSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border
  },
  driverInfo: {
    flex: 1,
    marginLeft: 12
  },
  driverLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 2
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  vehicleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.primary}15`,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: Radius.chip,
    gap: 4
  },
  vehicleText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary
  },
  routeContainer: {
    marginBottom: 16
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  routeText: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500'
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: Colors.border,
    marginLeft: 5,
    marginVertical: 4
  },
  footer: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 16
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  footerText: {
    fontSize: 13,
    color: Colors.textSecondary
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  customerText: {
    fontSize: 14,
    color: Colors.textSecondary
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary
  }
});
