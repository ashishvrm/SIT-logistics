import React, { useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchTrips, fetchVehicles, fetchInvoices, fetchNotifications } from '../../services/dataService';
import { FIREBASE_FEATURES } from '../../config/featureFlags';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { TripStatus } from '../../services/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { UserMenu } from '../../components/ui/UserMenu';

const filters: { label: string; value?: TripStatus }[] = [
  { label: 'All', value: undefined },
  { label: 'Assigned', value: 'Assigned' },
  { label: 'In Transit', value: 'InTransit' },
  { label: 'Completed', value: 'Completed' }
];

export const DriverTrips: React.FC = () => {
  const [filter, setFilter] = useState<TripStatus | undefined>();
  const navigation = useNavigation<any>();
  const { data } = useQuery({ queryKey: ['driver-trips', filter], queryFn: () => fetchTrips(filter) });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkGradientStart, Colors.darkGradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Trips</Text>
          <UserMenu />
        </View>
        <View style={styles.filterContainer}>
          {filters.map((f) => (
            <TouchableOpacity
              key={f.label}
              onPress={() => setFilter(f.value)}
              style={[
                styles.filterChip,
                filter === f.value && styles.filterChipActive
              ]}
            >
              <Text style={[
                styles.filterText,
                filter === f.value && styles.filterTextActive
              ]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>

      <FlatList
        data={data || []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.tripCard}
            onPress={() => navigation.navigate('DriverTripDetail', { id: item.id })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.tripCode}>{item.code}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: item.status === 'InTransit' ? Colors.statusDelivering : item.status === 'Completed' ? Colors.statusCompleted : Colors.warning }
              ]}>
                <Text style={styles.statusText}>
                  {item.status === 'InTransit' ? 'Delivering' : item.status}
                </Text>
              </View>
            </View>

            <View style={styles.routeContainer}>
              <View style={styles.routePoint}>
                <Icon name="circle" size={12} color={Colors.primary} />
                <Text style={styles.routeText}>{item.pickup}</Text>
              </View>
              <View style={styles.routeDivider} />
              <View style={styles.routePoint}>
                <Icon name="map-marker" size={12} color={Colors.textSecondary} />
                <Text style={styles.routeText}>{item.drop}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Icon name="package-variant" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{item.cargo}</Text>
              </View>
              <View style={styles.infoItem}>
                <Icon name="map" size={16} color={Colors.textSecondary} />
                <Text style={styles.infoText}>{item.distanceKm} km</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.etaText}>
                ETA: {new Date(item.eta).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <Icon name="chevron-right" size={20} color={Colors.primary} />
            </View>
          </TouchableOpacity>
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
    paddingBottom: 20,
    paddingHorizontal: Spacing.lg
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textLight
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap'
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: Radius.chip,
    backgroundColor: 'rgba(255, 255, 255, 0.15)'
  },
  filterChipActive: {
    backgroundColor: Colors.primary
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)'
  },
  filterTextActive: {
    color: Colors.textLight
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
  routeDivider: {
    width: 2,
    height: 16,
    backgroundColor: Colors.border,
    marginLeft: 5,
    marginVertical: 4
  },
  infoRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border
  },
  etaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500'
  }
});
