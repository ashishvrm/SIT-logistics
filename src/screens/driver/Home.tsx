import React from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { fetchTrips } from '../../services/dataService';
import { FIREBASE_FEATURES } from '../../config/featureFlags';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { LinearGradient } from 'expo-linear-gradient';
import { UserMenu } from '../../components/ui/UserMenu';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const DriverHome: React.FC = () => {
  const navigation = useNavigation<any>();
  const { data: trips } = useQuery({ 
    queryKey: ['driver-trips', FIREBASE_FEATURES.ORG_ID], 
    queryFn: () => fetchTrips(FIREBASE_FEATURES.ORG_ID) 
  });

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkGradientStart, Colors.darkGradientEnd]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Track Your Cargo</Text>
          <UserMenu />
        </View>
        <View style={styles.searchContainer}>
          <Icon name="magnify" size={20} color={Colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search cargo..."
            placeholderTextColor={Colors.textSecondary}
            style={styles.searchInput}
          />
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {trips?.map((trip) => (
          <View key={trip.id} style={styles.cargoCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cargoId}>Cargo ID: {trip.code}</Text>
              <View style={[styles.statusBadge, { backgroundColor: trip.status === 'InTransit' ? Colors.statusDelivering : Colors.statusCompleted }]}>
                <Text style={styles.statusText}>{trip.status === 'InTransit' ? 'Delivering' : trip.status}</Text>
              </View>
            </View>

            <View style={styles.truckInfo}>
              <Icon name="truck" size={24} color={Colors.primary} />
              <Text style={styles.truckNumber}>{trip.vehicleId === 'v1' ? 'JV 3469 DK' : 'MH 2210 XY'}</Text>
            </View>

            <View style={styles.locationRow}>
              <Icon name="map-marker" size={16} color={Colors.textSecondary} />
              <Text style={styles.locationText}>From {trip.pickup}</Text>
            </View>

            <View style={styles.progressContainer}>
              <View style={styles.progressDot} />
              <View style={[styles.progressLine, { backgroundColor: Colors.primary }]} />
              <View style={[styles.progressDot, { backgroundColor: Colors.border }]} />
              <View style={[styles.progressLine, { backgroundColor: Colors.border }]} />
              <View style={[styles.progressDot, { backgroundColor: Colors.border }]} />
            </View>

            <View style={styles.cardFooter}>
              <View>
                <Text style={styles.priceLabel}>Price</Text>
                <Text style={styles.priceValue}>₹{(trip.distanceKm * 45).toFixed(0)}</Text>
              </View>
              <View style={styles.estimateContainer}>
                <Icon name="clock-outline" size={16} color={Colors.textSecondary} />
                <Text style={styles.estimateText}>Est {Math.floor(trip.distanceKm / 40)}h {Math.floor((trip.distanceKm / 40) * 60) % 60}m</Text>
              </View>
            </View>

            <Text onPress={() => navigation.navigate('DriverTripDetail', { id: trip.id })} style={styles.viewDetails}>
              View Details →
            </Text>
          </View>
        ))}
      </ScrollView>
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
    alignItems: 'center',
    marginBottom: 20
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textLight
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: Radius.button,
    paddingHorizontal: 16,
    height: 48
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    color: Colors.textLight,
    fontSize: 16
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingTop: Spacing.md,
    gap: 16
  },
  cargoCard: {
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
  cargoId: {
    fontSize: 16,
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
  truckInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8
  },
  truckNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 4
  },
  locationText: {
    fontSize: 14,
    color: Colors.textSecondary
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 8
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary
  },
  progressLine: {
    flex: 1,
    height: 3,
    marginHorizontal: 4
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4
  },
  priceValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary
  },
  estimateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  estimateText: {
    fontSize: 14,
    color: Colors.textSecondary
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
    textAlign: 'right'
  }
});
