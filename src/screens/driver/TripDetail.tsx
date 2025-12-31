import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTrips, updateTripStatus } from '../../services/dataService';
import { FIREBASE_FEATURES } from '../../config/featureFlags';
import { Colors, Spacing, Radius, Shadows } from '../../theme/tokens';
import { Trip } from '../../services/types';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

export const DriverTripDetail: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteProp<{ params: { id: string } }, 'params'>>();
  const queryClient = useQueryClient();
  const { data: trip } = useQuery({ queryKey: ['trip', route.params.id], queryFn: () => fetchTrips(FIREBASE_FEATURES.ORG_ID).then((t) => t.find((x) => x.id === route.params.id) as Trip) });
  const mutation = useMutation({
    mutationFn: (status: Trip['status']) => updateTripStatus(route.params.id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['driver-trips'] })
  });

  // Detect if we're in Fleet or Driver context based on route name
  const isFleetContext = route.name === 'FleetTripDetail';
  const trackingScreenName = isFleetContext ? 'FleetTracking' : 'DriverTracking';

  if (!trip) return null;

  const nextAction = () => {
    const map: Record<Trip['status'], Trip['status']> = {
      Draft: 'Assigned',
      Assigned: 'Accepted',
      Accepted: 'Started',
      Started: 'PickupArrived',
      PickupArrived: 'Loaded',
      Loaded: 'InTransit',
      InTransit: 'DropArrived',
      DropArrived: 'PODSubmitted',
      PODSubmitted: 'Completed',
      Completed: 'Completed'
    };
    mutation.mutate(map[trip.status]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[Colors.darkGradientStart, Colors.darkGradientEnd]}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-left" size={28} color={Colors.textLight} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Trip Details</Text>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <View style={styles.card}>
          <Text style={styles.tripCode}>{trip.code}</Text>
          <View style={[styles.statusBadge, { backgroundColor: trip.status === 'InTransit' ? Colors.statusDelivering : Colors.statusCompleted }]}>
            <Text style={styles.statusText}>{trip.status === 'InTransit' ? 'Delivering' : trip.status}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Route Information</Text>
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={styles.routeDot} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Pickup Location</Text>
                <Text style={styles.routeAddress}>{trip.pickup}</Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: Colors.textSecondary }]} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeLabel}>Drop Location</Text>
                <Text style={styles.routeAddress}>{trip.drop}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Cargo Details</Text>
          <View style={styles.detailRow}>
            <Icon name="package-variant" size={20} color={Colors.textSecondary} />
            <Text style={styles.detailText}>{trip.cargo}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="account" size={20} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Customer: {trip.customer}</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="map" size={20} color={Colors.textSecondary} />
            <Text style={styles.detailText}>Distance: {trip.distanceKm} km</Text>
          </View>
          <View style={styles.detailRow}>
            <Icon name="clock-outline" size={20} color={Colors.textSecondary} />
            <Text style={styles.detailText}>ETA: {new Date(trip.eta).toLocaleString()}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Checkpoints</Text>
          {trip.checkpoints.map((checkpoint, index) => (
            <View key={index} style={styles.checkpointRow}>
              <Icon name="checkbox-marked-circle" size={20} color={Colors.primary} />
              <Text style={styles.checkpointText}>{checkpoint}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate(trackingScreenName, { id: trip.id })}
        >
          <Icon name="map-marker-path" size={20} color={Colors.textLight} />
          <Text style={styles.primaryButtonText}>Track Live</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={nextAction}
        >
          <Text style={styles.secondaryButtonText}>
            {trip.status === 'DropArrived' ? 'Submit POD' : 'Update Status'}
          </Text>
        </TouchableOpacity>
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
    paddingBottom: 20,
    paddingHorizontal: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center'
  },
  backButton: {
    marginRight: 12
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textLight
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: Spacing.lg,
    gap: 16
  },
  card: {
    backgroundColor: Colors.lightSurface,
    borderRadius: Radius.cardLarge,
    padding: Spacing.lg,
    ...Shadows.card
  },
  tripCode: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 12
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.chip,
    alignSelf: 'flex-start'
  },
  statusText: {
    color: Colors.textLight,
    fontSize: 12,
    fontWeight: '600'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16
  },
  routeContainer: {
    paddingLeft: 8
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  routeDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    marginTop: 2
  },
  routeInfo: {
    marginLeft: 12,
    flex: 1
  },
  routeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4
  },
  routeAddress: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary
  },
  routeLine: {
    width: 2,
    height: 40,
    backgroundColor: Colors.border,
    marginLeft: 7,
    marginVertical: 8
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12
  },
  detailText: {
    fontSize: 15,
    color: Colors.textPrimary
  },
  checkpointRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 12
  },
  checkpointText: {
    fontSize: 15,
    color: Colors.textPrimary
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: Radius.button,
    gap: 8,
    ...Shadows.soft
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textLight
  },
  secondaryButton: {
    backgroundColor: Colors.lightSurface,
    paddingVertical: 16,
    borderRadius: Radius.button,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center'
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary
  }
});
